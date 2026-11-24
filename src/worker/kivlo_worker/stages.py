"""Import pipeline stages. `probe` is real (yt-dlp metadata); the rest of the
pipeline is the next milestone and fails terminally, not silently."""
import json
import math
import subprocess
from dataclasses import dataclass


class JobFail(Exception):
    """Terminal failure — no retry."""


class NotImplementedStage(JobFail):
    def __init__(self, stage: str):
        super().__init__(f"pipeline not available yet (next: {stage})")
        self.stage = stage


@dataclass
class ProbeResult:
    title: str
    duration_sec: int
    channel: str | None
    thumbnail: str | None
    credits: int


def credits_for(duration_sec: int) -> int:
    """1 credit per 20 minutes of source, ceil (matches src/shared/credits.ts)."""
    return max(1, math.ceil(max(duration_sec, 0) / 1200))


PRIVATE_PATTERNS = (
    "private video", "sign in", "login", "members only", "subscriber",
    "join this channel", "premium", "age-restrict", "age_restrict",
    "confirm your age", "inappropriate",
)


def evaluate_probe(info: dict) -> ProbeResult:
    """Pure decision on yt-dlp metadata — public only, per PRD 5.1."""
    availability = info.get("availability")
    if availability and availability != "public":
        raise JobFail("Only public videos can be imported.")
    if info.get("is_live") or info.get("live_status") in ("is_live", "is_upcoming"):
        raise JobFail("Live streams can't be imported yet — try the VOD after it ends.")
    if (info.get("age_limit") or 0) > 0:
        raise JobFail("Age-restricted videos can't be imported.")
    duration = int(info.get("duration") or 0)
    if duration <= 0:
        raise JobFail("Couldn't read the video length.")
    return ProbeResult(
        title=info.get("title") or "Untitled video",
        duration_sec=duration,
        channel=info.get("channel") or info.get("uploader"),
        thumbnail=info.get("thumbnail"),
        credits=credits_for(duration),
    )


def probe(url: str, timeout: int = 120, runner=subprocess.run) -> ProbeResult:
    try:
        proc = runner(
            ["yt-dlp", "--dump-single-json", "--no-download", "--skip-download", "--quiet", url],
            capture_output=True, text=True, timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        raise JobFail("Timed out reading video details.") from None
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "").lower()
        if any(p in err for p in PRIVATE_PATTERNS):
            raise JobFail("This video is private, members-only, or needs a login.")
        raise JobFail("Couldn't read this video. Check the link and try again.")
    try:
        info = json.loads(proc.stdout)
    except json.JSONDecodeError:
        raise JobFail("Couldn't read this video. Check the link and try again.") from None
    return evaluate_probe(info)


# shortcut: download → transcribe → find_moments → render_clips is the next
# milestone (yt-dlp download + Whisper/Deepgram + ffmpeg 9:16). They raise a
# terminal error so projects fail cleanly with credits refunded rather than
# pretending clips exist.
def download(*_a, **_kw):
    raise NotImplementedStage("download")


def transcribe(*_a, **_kw):
    raise NotImplementedStage("transcribe")


def find_moments(*_a, **_kw):
    raise NotImplementedStage("find_moments")


def render_clips(*_a, **_kw):
    raise NotImplementedStage("render_clips")


def render(*_a, **_kw):
    raise NotImplementedStage("render")
