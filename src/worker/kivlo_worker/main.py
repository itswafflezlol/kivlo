from .config import load
from .db import make_pool
from .log import setup
from .loop import loop


def main() -> None:
    cfg = load()
    log = setup(cfg.log_level)
    pool = make_pool(cfg.database_url)
    try:
        pool.open(wait=True, timeout=15)
        loop(pool, cfg)
    finally:
        pool.close()


if __name__ == "__main__":
    main()
