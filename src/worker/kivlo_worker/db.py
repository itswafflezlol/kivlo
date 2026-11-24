import json
from typing import Any

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool


def make_pool(database_url: str) -> ConnectionPool:
    return ConnectionPool(conninfo=database_url, min_size=1, max_size=4,
                          kwargs={"row_factory": dict_row, "autocommit": False})


def notify(cur: psycopg.Cursor, payload: dict[str, Any]) -> None:
    cur.execute("select pg_notify('kivlo_events', %s)", (json.dumps(payload),))
