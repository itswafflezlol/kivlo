"""Env validated at startup — the worker refuses to boot on bad config (fail fast)."""
import os
import sys
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    database_url: str
    worker_id: str
    poll_interval: float = 2.0
    ytdlp_timeout: int = 120
    log_level: str = "info"


def load() -> Config:
    missing = [k for k in ("DATABASE_URL",) if not os.environ.get(k)]
    if missing:
        print(f"Missing required env: {', '.join(missing)}", file=sys.stderr)
        sys.exit(2)
    import socket
    return Config(
        database_url=os.environ["DATABASE_URL"],
        worker_id=f"{socket.gethostname()}-{os.getpid()}",
        poll_interval=float(os.environ.get("WORKER_POLL_INTERVAL", "2")),
        ytdlp_timeout=int(os.environ.get("YTDLP_TIMEOUT", "120")),
        log_level=os.environ.get("LOG_LEVEL", "info"),
    )
