"""Persistent user accounts. Runtime files are intentionally outside version control."""
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DATABASE_PATH = Path(os.getenv("DATABASE_PATH", str(Path(__file__).parent / "storage" / "users.sqlite3")))


@contextmanager
def connect():
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def init_database():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with connect() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
    DATABASE_PATH.chmod(0o600)


def find_user(email):
    with connect() as connection:
        row = connection.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()
    return dict(row) if row else None


def create_user(email, password_hash, role="user"):
    with connect() as connection:
        connection.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
            (email.strip().lower(), password_hash, role),
        )
