# Supabase 後端設定指南

## 📋 概述

本專案已整合 Supabase 作為後端服務，提供：
- 會員系統（註冊、登入、管理）
- 聯絡表單資料儲存
- 電子報訂閱管理
- 會員活動記錄

## 🚀 快速開始

### 1. 建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com) 並註冊帳號
2. 點擊 "New project"
3. 填入專案資訊：
   - Name: `MDVTA Website`
   - Database Password: 設定一個強密碼
   - Region: 選擇離台灣最近的區域（建議 Singapore）
4. 點擊 "Create new project"
5. 等待專案建立完成（約 2-3 分鐘）

### 2. 取得連線資訊

專案建立完成後：
1. 前往 Settings → API
2. 複製以下資訊：
   - **Project URL**
   - **anon public key**

### 3. 建立資料表

1. 前往 SQL Editor
2. 複製 `database-schema.sql` 的所有內容
3. 貼上並執行（點擊 Run）
4. 確認所有資料表都建立成功

### 4. 設定驗證

1. 前往 Authentication → Settings
2. 在 Site URL 加入您的網站網址：
   - 開發環境：`http://localhost:3000`
   - 正式環境：`https://yourdomain.github.io`
3. 在 Redirect URLs 加入相同網址

### 5. 更新程式設定

編輯以下檔案，將 Supabase 設定更新：

#### `auth.js`
```javascript
const SUPABASE_CONFIG = {
    url: '您的_SUPABASE_URL',
    anonKey: '您的_SUPABASE_ANON_KEY'
};
```

#### `contact.js`
```javascript
const SUPABASE_CONFIG = {
    url: '您的_SUPABASE_URL', 
    anonKey: '您的_SUPABASE_ANON_KEY'
};
```

## 🔧 功能設定

### 會員系統設定

1. **Email 驗證**（可選）
   - 前往 Authentication → Settings
   - 開啟 "Enable email confirmations"
   - 設定 Email templates

2. **密碼政策**
   - 前往 Authentication → Settings
   - 設定最小密碼長度等規則

3. **第三方登入**（可選）
   - 前往 Authentication → Providers
   - 設定 Google、Facebook 等社群登入

### 資料庫權限設定

執行以下 SQL 來設定基本權限：

```sql
-- 允許註冊用戶讀取自己的資料
CREATE POLICY "Users can view own profile" ON members FOR SELECT USING (auth.uid() = id);

-- 允許用戶更新自己的資料
CREATE POLICY "Users can update own profile" ON members FOR UPDATE USING (auth.uid() = id);

-- 允許所有人建立聯絡表單
CREATE POLICY "Anyone can create contact forms" ON contact_forms FOR INSERT WITH CHECK (true);

-- 允許所有人訂閱電子報
CREATE POLICY "Anyone can subscribe newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
```

## 📧 Email 設定（可選）

### 1. 使用 Supabase Email（有限制）
- 預設每小時最多 3 封郵件
- 適合開發測試

### 2. 整合第三方 Email 服務

推薦服務：
- **Resend**：每月 3000 封免費
- **SendGrid**：每天 100 封免費
- **Mailgun**：每月 5000 封免費

整合步驟：
1. 註冊 Email 服務
2. 取得 API Key
3. 在 Supabase Edge Functions 中設定發送邏輯

## 🔐 安全設定

### 1. RLS (Row Level Security) 設定

```sql
-- 啟用 RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
```

### 2. API Key 安全

- **anon key**：可以公開，用於前端
- **service_role key**：絕對機密，僅用於後端

## 📊 監控與分析

### 1. 檢視使用狀況
- 前往 Settings → Usage
- 監控 Database size、API requests 等

### 2. 查看 Logs
- 前往 Logs
- 檢視 Auth、Database、API 等日誌

## 🌐 部署後設定

### GitHub Pages 部署後：

1. 更新 Supabase Authentication 設定：
   - Site URL: `https://loverain1016.github.io/cc_ADCSwebsite/`
   - Redirect URLs: 加入相同網址

2. 測試所有功能：
   - 會員註冊/登入
   - 聯絡表單提交
   - 電子報訂閱

## ❓ 疑難排解

### 常見問題

1. **CORS 錯誤**
   - 檢查 Site URL 設定是否正確
   - 確認網域是否加入 Redirect URLs

2. **資料表不存在**
   - 確認已執行完整的 `database-schema.sql`
   - 檢查 SQL 執行是否有錯誤

3. **權限錯誤**
   - 檢查 RLS 政策設定
   - 確認用戶是否已驗證

4. **Email 無法發送**
   - 檢查 Email templates 設定
   - 確認 Email 配額未用盡

### Debug 方式

1. 打開瀏覽器開發者工具
2. 查看 Console 中的錯誤訊息
3. 檢查 Network 標籤的 API 呼叫
4. 在 Supabase Dashboard 查看 Logs

## 📈 升級選項

### 免費方案限制
- 500MB 資料庫
- 50MB 檔案儲存
- 2GB 頻寬
- 50,000 Monthly Active Users

### 付費方案
- Pro: $25/月，無限制
- Team: $599/月，團隊功能
- Enterprise: 客製化定價

## 🆘 支援資源

- [Supabase 官方文檔](https://supabase.com/docs)
- [JavaScript 客戶端文檔](https://supabase.com/docs/reference/javascript)
- [社群論壇](https://github.com/supabase/supabase/discussions)
- [Discord 社群](https://discord.supabase.com/)

---

## 🎯 下一步

設定完成後，您可以：
1. 測試會員註冊和登入功能
2. 嘗試提交聯絡表單
3. 在 Supabase Dashboard 查看儲存的資料
4. 根據需求調整資料表結構
5. 新增更多功能（課程管理、支付等）

如有任何問題，請參考疑難排解章節或聯絡技術支援。