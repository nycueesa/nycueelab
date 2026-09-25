# 電子郵件登入

前端登入頁：`/nycueelab/login`。首頁與專題列表均有「會員登入」入口。登入後會進入 `/nycueelab/professors/status` 教授狀態頁；直接開啟此頁也會先要求登入。

## 本機啟動

需要 Python 3.11+ 與 Node.js 20.19+。

```bash
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
cd backend
../.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 11451
```

另一個終端：

```bash
cd frontend
npm ci
npm run dev
```

開啟 `http://localhost:5173/nycueelab/login`。Vite 將 `/nycueelab/api/*` 轉送至本機 FastAPI 的 `/api/*`，前端不直接讀取資料庫。

也可執行 `docker compose -f docker-compose.dev.yml up --build`，前端位於 `http://localhost:5577/nycueelab/login`；設定已包含容器之間的 API 代理。

## 建立帳號

啟動時建立資料表，不會自動加入任何預設帳密。從 backend 目錄執行：

```bash
../.venv/bin/python manage_users.py member@example.com
# 輸入密碼及確認密碼；輸入不會顯示在終端。

# 或產生隨機密碼（建立後僅顯示一次）
../.venv/bin/python manage_users.py member@example.com --generate-password
```

新帳號預設為一般使用者。需要管理員時明確加上 `--role admin`。電子郵件去除前後空白、統一小寫並保持唯一；密碼為 12–1024 字元。此版本由管理員建立帳號，尚未提供公開註冊或寄信重設密碼。

## 儲存與 API

- SQLite：`backend/storage/users.sqlite3`，可透過 `DATABASE_PATH` 指定路徑。Docker 開發設定已將 backend 掛載到主機，因此資料會保留。
- `users` 欄位：`id`、`email`、`password_hash`、`role`、`created_at`。
- 密碼：PBKDF2-HMAC-SHA256，600,000 次迭代，每筆密碼各自使用隨機 salt；不儲存明文密碼。
- `POST /api/auth/login`：JSON `{ "email": "member@example.com", "password": "…" }`。成功回傳 JWT、有效秒數與公開使用者資訊；帳號不存在及密碼錯誤均回傳 401 與相同訊息。
- `GET /api/auth/me`：以 `Authorization: Bearer <token>` 讀取目前使用者；無效、過期或已刪除帳號回傳 401。
- `GET /api/manage/professors`：登入後讀取 `backend/NewData.json` 的教授資料與狀態選項。
- `PATCH /api/manage/professors/{id}/state`：登入後提交 `{ "state": "等待回覆" }`；僅接受 `topics.states` 中的選項，成功後寫回 `backend/NewData.json`。
- JWT 有效 30 分鐘，保存在分頁的 sessionStorage；登出會清除本機登入資訊，已簽發的 JWT 到期前仍有效。
- `storage/` 與 SQLite 檔案已加入 `.gitignore`。開發用 JWT 金鑰隨機產生並保存在 `storage/.jwt-secret`。

## 部署設定

正式環境設定 `ENVIRONMENT=production` 及至少 32 字元的隨機 `SECRET_KEY`，使用 HTTPS，並保留 SQLite 儲存目錄。Nginx 須將 `/nycueelab/api/` 代理至 FastAPI `/api/`，及將前端子路由回退至 index.html。

預設前端與 API 共用來源；若分開部署，`VITE_API_BASE_URL` 應填入後端來源及部署前綴（不包含 `/api`），並以 `ALLOWED_ORIGINS` 列出允許的前端來源。公開服務應在反向代理設定登入速率限制。
