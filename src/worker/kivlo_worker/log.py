import json
import logging
import sys
import time


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        out = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(record.created)),
            "level": record.levelname.lower(),
            "service": "kivlo-worker",
            "msg": record.getMessage(),
        }
        for k in ("job_id", "project_id", "stage", "attempt"):
            if getattr(record, k, None) is not None:
                out[k] = getattr(record, k)
        if record.exc_info and record.exc_info[1]:
            out["err"] = str(record.exc_info[1])
        return json.dumps(out)


def setup(level: str = "info") -> logging.Logger:
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(JsonFormatter())
    log = logging.getLogger("kivlo_worker")
    log.setLevel(getattr(logging, level.upper(), logging.INFO))
    log.handlers = [h]
    log.propagate = False
    return log
