"""Job loop: claim one queued job FOR UPDATE SKIP LOCKED, run its handler,
retry with exponential backoff up to max_attempts, then dead."""
import json
import logging
import signal
import time
from typing import Any, Callable

from .db import notify
from .stages import JobFail, NotImplementedStage, probe, download, credits_for

log = logging.getLogger("kivlo_worker")

_stopping = False


def request_stop(*_a):
    global _stopping
    _stopping = True


def backoff_seconds(attempt: int) -> int:
    return min(30 * (2 ** max(attempt - 1, 0)), 30 * 60)


def _progress(cur, job: dict, stage: str, pct: int) -> None:
    cur.execute("update projects set stage = %s, progress = %s where id = %s",
                (stage, pct, job["project_id"]))
    notify(cur, {"user_id": str(job["user_id"]), "type": "job.progress",
                 "jobId": job["id"], "projectId": str(job["project_id"]),
                 "stage": stage, "pct": pct})


def _charge(cur, job: dict, amount: int, note: str) -> None:
    cur.execute(
        "insert into credit_ledger (user_id, project_id, kind, amount, note) values (%s,%s,'charge',%s,%s)",
        (job["user_id"], job["project_id"], amount, note))


def _refund_charged(cur, job: dict, note: str) -> None:
    cur.execute(
        """insert into credit_ledger (user_id, project_id, kind, amount, note)
           select user_id, project_id, 'refund', sum(amount), %s from credit_ledger
           where project_id = %s and kind in ('reserve','charge') group by user_id, project_id""",
        (note, job["project_id"]))


def _credits_left(cur, user_id) -> int:
    plan = cur.execute("select plan from profiles where id = %s", (user_id,)).fetchone()["plan"]
    total = {"free": 3, "pro": 30, "creator": 70, "agency": 150}.get(plan, 3)
    used = cur.execute(
        """select coalesce(sum(case when kind in ('reserve','charge') then amount
                                  when kind in ('refund','reset') then -amount end),0) u
           from credit_ledger where user_id = %s""", (user_id,)).fetchone()["u"]
    return total - used


def _fail_project(cur, job: dict, message: str, refund: bool) -> None:
    cur.execute("update projects set status='failed', error=%s, progress=0 where id=%s",
                (message, job["project_id"]))
    if refund:
        _refund_charged(cur, job, message)
    notify(cur, {"user_id": str(job["user_id"]), "type": "project.updated",
                 "projectId": str(job["project_id"]), "status": "failed", "message": message})


def run_import(conn, job: dict, ytdlp_timeout: int = 120) -> None:
    payload = job["payload"]
    url = payload["url"]
    with conn.cursor() as cur:
        _progress(cur, job, "probe", 10)
        conn.commit()

        result = probe(url, timeout=ytdlp_timeout)

        cur.execute(
            """update projects set title=%s, channel=%s, duration_sec=%s, thumbnail_url=%s
               where id=%s""",
            (result.title, result.channel, result.duration_sec, result.thumbnail, job["project_id"]))
        # convert the 1-credit reserve into the real charge
        cur.execute(
            """insert into credit_ledger (user_id, project_id, kind, amount, note)
               select user_id, project_id, 'refund', amount, 'release reserve' from credit_ledger
               where project_id = %s and kind = 'reserve'""", (job["project_id"],))
        if _credits_left(cur, job["user_id"]) < result.credits:
            raise JobFail(f"Not enough credits — this video needs {result.credits}.")
        _charge(cur, job, result.credits, f"import {result.duration_sec}s")
        notify(cur, {"user_id": str(job["user_id"]), "type": "project.updated",
                     "projectId": str(job["project_id"]), "status": "processing", "stage": "probe"})
        conn.commit()

        _progress(cur, job, "download", 30)
        conn.commit()
        download()          # raises NotImplementedStage — terminal
        _progress(cur, job, "transcribe", 55)
        conn.commit()
        _progress(cur, job, "find_moments", 75)
        conn.commit()
        _progress(cur, job, "render_clips", 90)
        conn.commit()


def run_render(conn, job: dict, **_kw) -> None:
    from .stages import render
    render()  # raises NotImplementedStage


HANDLERS: dict[str, Callable[..., None]] = {
    "import": run_import,
    "render": run_render,
}


def claim(conn, worker_id: str) -> dict | None:
    with conn.cursor() as cur:
        cur.execute(
            """update jobs set status='running', locked_by=%s, locked_at=now(), attempts=attempts+1
               where id = (select id from jobs where status='queued' and run_after<=now()
                           order by run_after for update skip locked limit 1)
               returning *""", (worker_id,))
        return cur.fetchone()


def finish(conn, job: dict) -> None:
    with conn.cursor() as cur:
        cur.execute("update jobs set status='done' where id=%s", (job["id"],))
        notify(cur, {"user_id": str(job["user_id"]), "type": "job.progress",
                     "jobId": job["id"], "projectId": str(job["project_id"]),
                     "stage": "done", "pct": 100})


def fail(conn, job: dict, err: Exception) -> None:
    with conn.cursor() as cur:
        terminal = isinstance(err, JobFail)
        last = job["attempts"] >= job["max_attempts"]
        if terminal or last:
            cur.execute("update jobs set status='dead', last_error=%s where id=%s", (str(err), job["id"]))
            if job["project_id"]:
                _fail_project(cur, job, str(err), refund=True)
        else:
            run_after = backoff_seconds(job["attempts"])
            cur.execute(
                "update jobs set status='queued', run_after=now()+(%s||' seconds')::interval, last_error=%s where id=%s",
                (run_after, str(err), job["id"]))
            log.warning("retrying job in %ss", run_after, extra={"job_id": job["id"], "attempt": job["attempts"]})


def loop(pool, cfg) -> None:
    signal.signal(signal.SIGTERM, request_stop)
    signal.signal(signal.SIGINT, request_stop)
    log.info("worker up", extra={"job_id": cfg.worker_id})
    while not _stopping:
        try:
            with pool.connection() as conn:
                job = claim(conn, cfg.worker_id)
                if job:
                    log.info("claimed job", extra={"job_id": job["id"], "project_id": str(job["project_id"]), "attempt": job["attempts"]})
                    try:
                        HANDLERS[job["type"]](conn, job, ytdlp_timeout=cfg.ytdlp_timeout)
                        finish(conn, job)
                    except NotImplementedStage as e:
                        log.warning(str(e), extra={"job_id": job["id"]})
                        fail(conn, job, e)
                    except Exception as e:  # noqa: BLE001 — retry/dead logic owns all failures
                        log.error("job failed", exc_info=True, extra={"job_id": job["id"]})
                        fail(conn, job, e)
                    conn.commit()
                else:
                    conn.rollback()
                    time.sleep(cfg.poll_interval)
        except InterruptedError:
            break
        except Exception:  # noqa: BLE001 — DB hiccup; back off and keep looping
            log.error("loop error", exc_info=True)
            time.sleep(cfg.poll_interval * 3)
    log.info("worker stopped")
