# 網站部署指南 (Deployment Guide)

本文件將指導您如何將此網站部署到生產環境（正式上線）。

---

## 📋 目錄

1. [部署前準備](#部署前準備)
2. [方案一：使用 Docker Compose（推薦）](#方案一使用-docker-compose推薦)
3. [方案二：使用雲端平台](#方案二使用雲端平台)
4. [方案三：使用傳統主機](#方案三使用傳統主機)
5. [生產環境設定](#生產環境設定)
6. [網域名稱設定](#網域名稱設定)
7. [SSL/HTTPS 設定](#sslhttps-設定)
8. [維護與監控](#維護與監控)

---

## 部署前準備

### 1. 檢查清單

- [ ] 確認所有功能在本地環境正常運作
- [ ] 準備好網域名稱（例如：nycueelab.example.com）
- [ ] 準備一台伺服器或雲端服務帳號
- [ ] 決定是否需要啟用認證系統

### 2. 必要的生產環境修改

在部署前，需要修改以下檔案：

#### **backend/.env** (新增此檔案)
```bash
# 生產環境設定
SECRET_KEY=your-production-secret-key-at-least-32-characters-long-random-string
ALLOWED_ORIGINS=https://your-domain.com
ENVIRONMENT=production
```

#### **frontend/.env.production** (新增此檔案)
```bash
# 後端 API 位址（改為您的實際網域）
VITE_API_BASE_URL=https://api.your-domain.com
```

#### **backend/main.py** - 修改 CORS 設定
```python
# 將此行
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ 開發環境設定
    ...
)

# 改為
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGINS", "https://your-domain.com")],  # ✅ 生產環境設定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 方案一：使用 Docker Compose（推薦）

適合：有自己的伺服器（VPS、實體主機等）

### 步驟 1：準備伺服器

**系統需求：**
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- 至少 2GB RAM
- 至少 10GB 硬碟空間
- 安裝 Docker 和 Docker Compose

**安裝 Docker：**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 步驟 2：上傳專案到伺服器

```bash
# 在本地電腦
cd d:\Coding\NYCU\eesa\nycueelab
git init  # 如果還沒有 git repository
git add .
git commit -m "Initial commit"

# 推送到 GitHub（私有 repository）
git remote add origin https://github.com/your-username/nycueelab.git
git push -u origin main

# 在伺服器上
cd /var/www
git clone https://github.com/your-username/nycueelab.git
cd nycueelab
```

### 步驟 3：建立生產環境 Docker Compose 檔案

建立 `docker-compose.prod.yml`：

```yaml
version: '3.8'

services:
  nycueelab-frontend:
    build:
      context: ./frontend
      dockerfile: dockerfile
    container_name: nycueelab-frontend-prod
    restart: always
    ports:
      - "80:5577"  # HTTP
    networks:
      - lab-network
    depends_on:
      - nycueelab-backend

  nycueelab-backend:
    build:
      context: ./backend
      dockerfile: dockerfile
    container_name: nycueelab-backend-prod
    restart: always
    ports:
      - "11451:11451"
    volumes:
      - ./backend/data:/code/data:ro  # 唯讀模式保護資料
    env_file:
      - ./backend/.env
    networks:
      - lab-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11451/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx 反向代理（處理 HTTPS）
  nginx:
    image: nginx:alpine
    container_name: nycueelab-nginx
    restart: always
    ports:
      - "443:443"   # HTTPS
      - "80:80"     # HTTP (重定向到 HTTPS)
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro  # SSL 憑證
    networks:
      - lab-network
    depends_on:
      - nycueelab-frontend
      - nycueelab-backend

networks:
  lab-network:
    driver: bridge
    name: nycueelab-network-prod
```

### 步驟 4：建立 Nginx 設定檔

建立 `nginx.conf`：

```nginx
events {
    worker_connections 1024;
}

http {
    # 上傳大小限制
    client_max_body_size 10M;

    # Gzip 壓縮
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # HTTP 重定向到 HTTPS
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS 設定
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL 憑證
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # 前端
        location / {
            proxy_pass http://nycueelab-frontend-prod:5577;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # 後端 API
        location /api/ {
            proxy_pass http://nycueelab-backend-prod:11451;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 步驟 5：取得 SSL 憑證（Let's Encrypt）

```bash
# 安裝 Certbot
sudo apt update
sudo apt install certbot

# 取得憑證（使用 standalone 模式，需先停止 nginx）
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# 將憑證複製到專案目錄
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/
sudo chmod 644 ssl/*
```

### 步驟 6：啟動生產環境

```bash
# 建置並啟動
docker-compose -f docker-compose.prod.yml up -d --build

# 查看運行狀態
docker-compose -f docker-compose.prod.yml ps

# 查看 logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 步驟 7：設定自動更新 SSL 憑證

```bash
# 編輯 crontab
sudo crontab -e

# 加入以下內容（每天凌晨 2 點檢查並更新憑證）
0 2 * * * certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/your-domain.com/*.pem /var/www/nycueelab/ssl/ && docker restart nycueelab-nginx"
```

---

## 方案二：使用雲端平台

### 選項 A：Vercel (前端) + Railway/Render (後端)

**優點：**
- 免費方案可用
- 自動 HTTPS
- 自動部署（連接 GitHub）
- 無需管理伺服器

#### 部署前端到 Vercel

1. 前往 [https://vercel.com](https://vercel.com)
2. 使用 GitHub 登入
3. 點擊 "Import Project"
4. 選擇您的 repository
5. 設定：
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     - `VITE_API_BASE_URL`: `https://your-backend.railway.app`

#### 部署後端到 Railway

1. 前往 [https://railway.app](https://railway.app)
2. 點擊 "New Project" → "Deploy from GitHub repo"
3. 選擇您的 repository
4. 設定：
   - Root Directory: `backend`
   - Environment Variables:
     - `SECRET_KEY`: (產生一個隨機字串)
     - `ALLOWED_ORIGINS`: `https://your-app.vercel.app`

### 選項 B：AWS EC2 / Google Cloud / Azure

類似方案一，但使用雲端廠商的虛擬主機。步驟相同。

---

## 方案三：使用傳統主機

如果您使用傳統的 cPanel 或 Plesk 主機：

### 前端部署

```bash
# 在本地建置
cd frontend
npm run build

# 上傳 dist/ 資料夾的所有檔案到主機的 public_html/
```

### 後端部署

需要主機支援 Python 和 FastAPI，使用 Gunicorn 運行：

```bash
# 在主機上
cd backend
pip install -r requirements.txt
pip install gunicorn

# 運行（使用 systemd 或 supervisor 管理）
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:11451
```

---

## 生產環境設定

### 1. 安全性設定

#### **backend/main.py** - 加入安全標頭

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# 只允許特定 host
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["your-domain.com", "www.your-domain.com"]
)

# 啟用 Gzip 壓縮
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

#### **backend/auth.py** - 啟用密碼雜湊

如果要啟用認證系統，將 `main.py` 中的密碼改為雜湊版本：

```python
from auth import get_password_hash

USERS_DB = {
    "admin": {
        "password": get_password_hash("your-secure-password"),  # ✅ 使用雜湊
        "role": "admin"
    }
}

# 恢復使用 verify_password
def authenticate_user(username: str, password: str):
    # ...
    if not verify_password(password, user["password"]):  # ✅ 驗證雜湊
        return False
```

### 2. 環境變數管理

**不要將敏感資訊提交到 Git！**

更新 `.gitignore`：
```
.env
.env.*
!.env.example
```

建立 `backend/.env.example`：
```bash
SECRET_KEY=change-this-to-a-random-32-character-string
ALLOWED_ORIGINS=https://your-domain.com
ENVIRONMENT=production
```

### 3. 資料備份

```bash
# 設定每日自動備份
sudo crontab -e

# 加入
0 3 * * * cp /var/www/nycueelab/backend/data/NewData.json /var/backups/nycueelab-$(date +\%Y\%m\%d).json
```

---

## 網域名稱設定

### 購買網域

推薦網域註冊商：
- Namecheap
- GoDaddy
- Cloudflare Registrar
- Google Domains

### DNS 設定

在您的 DNS 管理面板新增 A 記錄：

```
類型    名稱    值                    TTL
A       @       your-server-ip       3600
A       www     your-server-ip       3600
```

如果使用 Vercel/Railway，設定 CNAME：
```
類型     名稱    值                          TTL
CNAME    @       your-app.vercel.app        3600
CNAME    www     your-app.vercel.app        3600
```

---

## SSL/HTTPS 設定

### 使用 Let's Encrypt（免費）

已在方案一步驟 5 說明。

### 使用 Cloudflare（推薦）

1. 前往 [https://cloudflare.com](https://cloudflare.com)
2. 新增您的網域
3. 將 DNS nameserver 改為 Cloudflare 提供的
4. 在 Cloudflare 設定：
   - SSL/TLS → Full (strict)
   - 自動 HTTPS 重寫：開啟
   - Always Use HTTPS：開啟

**優點：**
- 自動 SSL
- CDN 加速
- DDoS 防護
- 免費

---

## 維護與監控

### 1. 日誌管理

```bash
# 查看 Docker logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# 只看後端
docker logs nycueelab-backend-prod -f

# 只看前端
docker logs nycueelab-frontend-prod -f
```

### 2. 監控服務運行狀態

建立簡單的監控腳本 `monitor.sh`：

```bash
#!/bin/bash
# 檢查服務是否運行
if ! curl -f http://localhost:11451/health > /dev/null 2>&1; then
    echo "Backend is down! Restarting..."
    docker restart nycueelab-backend-prod
    # 發送通知（可整合 Email/Telegram/Discord）
fi
```

設定 crontab 每 5 分鐘檢查：
```bash
*/5 * * * * /var/www/nycueelab/monitor.sh
```

### 3. 效能監控（選用）

可以整合：
- **Sentry** - 錯誤追蹤
- **Google Analytics** - 流量分析
- **Prometheus + Grafana** - 系統監控

### 4. 更新流程

```bash
# 在伺服器上
cd /var/www/nycueelab
git pull origin main

# 重新建置並重啟
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 清理舊的 images
docker image prune -f
```

---

## 快速部署檢查清單

- [ ] 修改 CORS 設定（backend/main.py）
- [ ] 建立 backend/.env（設定 SECRET_KEY）
- [ ] 建立 frontend/.env.production（設定 VITE_API_BASE_URL）
- [ ] 購買/設定網域名稱
- [ ] 設定 DNS A 記錄指向伺服器 IP
- [ ] 取得 SSL 憑證
- [ ] 建立 docker-compose.prod.yml
- [ ] 建立 nginx.conf
- [ ] 上傳專案到伺服器
- [ ] 執行 `docker-compose -f docker-compose.prod.yml up -d --build`
- [ ] 測試網站是否正常運作
- [ ] 設定自動備份
- [ ] 設定監控

---

## 常見問題

### Q: 我沒有自己的伺服器，該怎麼辦？
A: 使用方案二（Vercel + Railway），完全免費且無需管理伺服器。

### Q: 需要資料庫嗎？
A: 目前不需要，所有資料儲存在 `backend/data/NewData.json`。未來如果資料量大可考慮遷移到 PostgreSQL/MongoDB。

### Q: 如何更新教授資料？
A: 直接編輯 `backend/data/NewData.json`，然後重啟後端容器或使用 Git 更新。

### Q: 需要啟用認證系統嗎？
A: 根據您的需求。如果只是展示網站，不需要。如果需要管理後台編輯資料，可以啟用。

### Q: 部署後網站很慢？
A:
1. 使用 Cloudflare CDN
2. 啟用 Gzip 壓縮
3. 優化圖片大小
4. 考慮增加伺服器資源

---

## 推薦方案總結

| 方案 | 成本 | 難度 | 適合對象 |
|------|------|------|----------|
| Vercel + Railway | 免費 | ⭐ 簡單 | 初學者、小型專案 |
| Docker Compose + VPS | $5-10/月 | ⭐⭐ 中等 | 有基礎經驗者 |
| AWS/GCP/Azure | $10+/月 | ⭐⭐⭐ 困難 | 企業級應用 |

**推薦：對於此專案，建議使用 Vercel + Railway（免費且簡單）或 Docker Compose + VPS（完全掌控）。**

---

如有任何問題，請參考：
- [Docker 官方文件](https://docs.docker.com/)
- [FastAPI 部署指南](https://fastapi.tiangolo.com/deployment/)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
