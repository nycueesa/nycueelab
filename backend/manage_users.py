"""Create a local account: python manage_users.py username"""
import argparse
import getpass
import secrets
import sqlite3
from auth import get_password_hash
from database import create_user, init_database


def main():
    parser = argparse.ArgumentParser(description="建立使用者帳號；密碼以雜湊存入 SQLite。")
    parser.add_argument("username")
    parser.add_argument("--role", choices=["user", "admin"], default="user")
    parser.add_argument("--generate-password", action="store_true", help="產生隨機密碼並僅顯示一次")
    args = parser.parse_args()
    username = args.username.strip()
    if not username:
        parser.error("名稱不可為空")
    password = secrets.token_urlsafe(18) if args.generate_password else getpass.getpass("密碼：")
    if not args.generate_password and password != getpass.getpass("再次輸入密碼："):
        parser.error("兩次密碼不一致")
    init_database()
    try:
        create_user(username, get_password_hash(password), args.role)
    except sqlite3.IntegrityError:
        parser.error("此名稱已有帳號")
    print(f"已建立帳號：{username}（{args.role}）")
    if args.generate_password:
        print(f"隨機密碼（僅顯示此次）：{password}")


if __name__ == "__main__":
    main()
