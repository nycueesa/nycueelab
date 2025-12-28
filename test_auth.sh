#!/bin/bash

# ==============================================
# 認證系統測試腳本
# ==============================================
# 用於快速測試登入 API 是否正常運作

API_BASE_URL="http://localhost:11451"

echo "=========================================="
echo "Testing NYCU EE Lab Authentication API"
echo "=========================================="
echo ""

# 測試 1: 檢查 API 是否運行
echo "1️⃣  Testing API health..."
HEALTH_RESPONSE=$(curl -s "${API_BASE_URL}/health")
echo "   Response: ${HEALTH_RESPONSE}"
echo ""

# 測試 2: 測試登入（正確帳密）
echo "2️⃣  Testing login with correct credentials..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "   Response: ${LOGIN_RESPONSE}"

# 提取 access_token（需要 jq 工具）
if command -v jq &> /dev/null; then
  ACCESS_TOKEN=$(echo "${LOGIN_RESPONSE}" | jq -r '.access_token')
  if [ "${ACCESS_TOKEN}" != "null" ] && [ -n "${ACCESS_TOKEN}" ]; then
    echo "   ✅ Login successful!"
    echo "   Token: ${ACCESS_TOKEN:0:30}..."
  else
    echo "   ❌ Login failed - No token received"
  fi
else
  echo "   ⚠️  jq not installed, cannot parse token"
fi
echo ""

# 測試 3: 測試登入（錯誤帳密）
echo "3️⃣  Testing login with incorrect credentials..."
WRONG_LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpassword"}')

echo "   Response: ${WRONG_LOGIN_RESPONSE}"

if echo "${WRONG_LOGIN_RESPONSE}" | grep -q "Incorrect username or password"; then
  echo "   ✅ Correctly rejected invalid credentials"
else
  echo "   ❌ Unexpected response"
fi
echo ""

# 測試 4: 測試受保護的 API（如果 token 可用）
if [ -n "${ACCESS_TOKEN}" ] && [ "${ACCESS_TOKEN}" != "null" ]; then
  echo "4️⃣  Testing protected endpoint with token..."
  ME_RESPONSE=$(curl -s "${API_BASE_URL}/api/auth/me" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

  echo "   Response: ${ME_RESPONSE}"

  if echo "${ME_RESPONSE}" | grep -q "username"; then
    echo "   ✅ Successfully accessed protected endpoint"
  else
    echo "   ❌ Failed to access protected endpoint"
  fi
  echo ""
fi

# 測試 5: 測試受保護的 API（無 token）
echo "5️⃣  Testing protected endpoint without token..."
NO_TOKEN_RESPONSE=$(curl -s "${API_BASE_URL}/api/auth/me")

if echo "${NO_TOKEN_RESPONSE}" | grep -q "Not authenticated"; then
  echo "   ✅ Correctly rejected request without token"
else
  echo "   Response: ${NO_TOKEN_RESPONSE}"
fi
echo ""

echo "=========================================="
echo "Test completed!"
echo "=========================================="
