"""Create a local account: python manage_users.py person@example.com"""
import argparse
import getpass
import secrets
import sqlite3
from pydantic import TypeAdapter, EmailStr, ValidationError
from auth import get_password_hash
from database import create_user, init_database


def main():
    parser = argparse.ArgumentParser(description="建立使用者帳號；密碼以雜湊存入 SQLite。")
    parser.add_argument("email")
    parser.add_argument("--role", choices=["user", "admin"], default="user")
    parser.add_argument("--generate-password", action="store_true", help="產生隨機密碼並僅顯示一次")
    args = parser.parse_args()
    try:
        email = str(TypeAdapter(EmailStr).validate_python(args.email.strip())).lower()
    except ValidationError:
        parser.error("請輸入有效的電子郵件地址")
    password = secrets.token_urlsafe(18) if args.generate_password else getpass.getpass("密碼（至少 12 字元）：")
    if not 12 <= len(password) <= 1024:
        parser.error("密碼長度必須介於 12 至 1024 字元")
    if not args.generate_password and password != getpass.getpass("再次輸入密碼："):
        parser.error("兩次密碼不一致")
    init_database()
    try:
        create_user(email, get_password_hash(password), args.role)
    except sqlite3.IntegrityError:
        parser.error("此電子郵件已有帳號")
    print(f"已建立帳號：{email}（{args.role}）")
    if args.generate_password:
        print(f"隨機密碼（僅顯示此次）：{password}")


if __name__ == "__main__":
    main()
