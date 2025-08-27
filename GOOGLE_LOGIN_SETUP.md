# Google 登入功能設定指南

## 📋 概述

要啟用 Google 社群登入功能，需要完成以下設定：

## 🔧 設定步驟

### 1. Google Cloud Console 設定

1. **前往 Google Cloud Console**：
   - 打開 [https://console.cloud.google.com](https://console.cloud.google.com)
   - 建立新專案或選擇現有專案

2. **啟用 Google+ API**：
   - 前往「APIs & Services」→「Library」
   - 搜尋「Google+ API」並啟用

3. **建立 OAuth 2.0 憑證**：
   - 前往「APIs & Services」→「Credentials」
   - 點擊「Create Credentials」→「OAuth client ID」
   - 應用程式類型選擇「Web application」
   - 新增授權的重新導向 URI：
     ```
     https://你的supabase專案.supabase.co/auth/v1/callback
     ```

4. **取得客戶端 ID**：
   - 複製「Client ID」（後續需要）

### 2. Supabase 設定

1. **前往 Supabase Dashboard**：
   - 登入您的 Supabase 專案

2. **設定 Google Provider**：
   - 前往「Authentication」→「Providers」
   - 找到「Google」並點擊設定
   - 開啟「Enable sign in with Google」
   - 輸入剛才取得的 Client ID
   - 輸入 Client Secret（從 Google Console 取得）

3. **設定重新導向 URL**：
   - 在「Site URL」設定您的網站網址
   - 在「Redirect URLs」加入您的網站網址

### 3. 程式碼更新

1. **取消註解 HTML 中的 Google 登入按鈕**：
   ```html
   <!-- 在 auth.html 中取消註解 -->
   <div class="social-login">
       <div class="divider">
           <span>或</span>
       </div>
       <button type="button" class="btn btn-outline social-btn" onclick="handleGoogleLogin()">
           <span>📧</span>
           使用 Google 登入
       </button>
   </div>
   ```

2. **在 auth.js 中加入 Google 登入功能**：
   ```javascript
   async function handleGoogleLogin() {
       if (!supabase) {
           showMessage('需要設定 Supabase 才能使用 Google 登入', 'error');
           return;
       }

       try {
           const { data, error } = await supabase.auth.signInWithOAuth({
               provider: 'google',
               options: {
                   redirectTo: window.location.origin + '/auth.html'
               }
           });

           if (error) {
               throw error;
           }
       } catch (error) {
           console.error('Google login error:', error);
           showMessage('Google 登入失敗', 'error');
       }
   }

   // 處理 Google 登入回調
   window.addEventListener('load', async () => {
       if (supabase) {
           const { data, error } = await supabase.auth.getSession();
           if (data?.session) {
               // 使用者已登入，重新導向到首頁
               window.location.href = 'index.html';
           }
       }
   });
   ```

### 4. 測試 Google 登入

1. 確保所有設定都已完成
2. 重新部署網站
3. 點擊「使用 Google 登入」
4. 應該會開啟 Google 登入視窗
5. 登入成功後會重新導向回您的網站

## 🔒 安全注意事項

1. **域名限制**：
   - 在 Google Console 中只允許您的正式域名
   - 不要允許 `localhost` 在正式環境

2. **HTTPS 必要**：
   - Google OAuth 要求使用 HTTPS
   - Zeabur 會自動提供 SSL 憑證

3. **憑證保護**：
   - Client Secret 絕對不能公開
   - 只能在 Supabase Dashboard 中設定

## 💡 替代方案

如果 Google 登入設定太複雜，您也可以：

1. **僅使用 Email/密碼註冊**（目前已可用）
2. **加入其他社群登入**：
   - Facebook
   - GitHub
   - Discord
   - 等等

## ❓ 疑難排解

### 常見錯誤

1. **"redirect_uri_mismatch"**：
   - 檢查 Google Console 中的重新導向 URI
   - 確保與 Supabase 設定一致

2. **"unauthorized_client"**：
   - 檢查 Client ID 是否正確
   - 確保專案中的 API 已啟用

3. **登入後無反應**：
   - 檢查 Supabase 回調處理
   - 確認重新導向邏輯正確

## 📞 需要協助？

如果您需要設定 Google 登入功能，請告訴我：
1. 您是否有 Google Cloud Console 帳號
2. 是否已經設定 Supabase
3. 遇到什麼具體問題

我會提供更詳細的協助！