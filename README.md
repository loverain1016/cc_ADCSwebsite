# 中華多元職能交流發展協會 (MDVTA) 官方網站

專業的全端網站，展現協會的核心價值與服務項目，具備完整的會員系統與資料管理功能。

## ✨ 特色功能

### 前端功能
- 🎨 專業 CSR/ESG 風格設計
- 📱 完全響應式設計
- ⚡ 平滑滾動與進場動畫
- ♿ 無障礙設計
- 🎯 SEO 友好

### 後端功能
- 👥 完整會員系統（註冊/登入/管理）
- 📝 聯絡表單資料儲存
- 📧 電子報訂閱管理
- 📊 會員活動記錄
- 🔒 資料安全與權限控制

## 🛠️ 技術架構

### 前端
- **HTML5** - 語意化標籤結構
- **CSS3** - 現代化樣式與動畫
- **JavaScript ES6** - 互動功能
- **Google Fonts** - Noto Sans TC + Inter

### 後端
- **Supabase** - 後端即服務 (BaaS)
- **PostgreSQL** - 關聯式資料庫
- **JWT** - 使用者驗證
- **RLS** - 行級安全性

## 🚀 快速開始

### 基本設定（僅前端）
1. 下載或 clone 此專案
2. 直接在瀏覽器開啟 `index.html`
3. 開始自訂內容

### 完整功能設定（含後端）
1. 按照 `SUPABASE_SETUP.md` 設定 Supabase
2. 更新 `auth.js` 和 `contact.js` 中的設定
3. 測試會員系統和表單功能

## 📁 檔案結構

```
├── index.html              # 主頁面
├── auth.html               # 會員註冊/登入頁面  
├── contact.html            # 聯絡表單頁面
├── styles.css              # 主要樣式表
├── auth.css               # 會員頁面樣式
├── contact.css            # 聯絡頁面樣式
├── main.js                # 主頁面功能
├── auth.js                # 會員系統功能
├── contact.js             # 聯絡表單功能
├── database-schema.sql    # 資料庫結構
├── SUPABASE_SETUP.md     # 後端設定指南
└── README.md             # 說明文件
```

## 自訂指南

### 替換圖片
修改 HTML 中的 `src` 屬性或 CSS 中的 `background-image`

### 修改內容
直接編輯 HTML 中的文字內容

### 調整色彩
修改 `styles.css` 中的 CSS 變數：
```css
:root {
    --primary-color: #2F6F8F;
    --accent-color: #F4EDE6;
    /* 其他顏色變數... */
}
```

### 嵌入 Google 表單
取消註解 HTML 中的表單區塊並填入您的表單連結

## 專案結構

```
├── index.html          # 主頁面
├── styles.css          # 樣式表
├── main.js            # JavaScript 功能
└── README.md          # 說明文件
```

## 瀏覽器支援

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 授權

© 2024 中華多元職能交流發展協會 版權所有

---

網站由 Claude Code 協助開發 🤖