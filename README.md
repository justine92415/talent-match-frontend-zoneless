# Talent Match Frontend (Zoneless)

> 一個使用 Angular 20 Zoneless 、 Signal 架構打造的現代化線下課程媒合平台前端專案

![Angular](https://img.shields.io/badge/Angular-20.1.0-DD0031?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.12-38B2AC?style=flat-square&logo=tailwind-css)
![Angular Material](https://img.shields.io/badge/Angular_Material-20.2.0-DD0031?style=flat-square&logo=angular)

## 📋 目錄

- [專案簡介](#-專案簡介)
- [核心技術亮點](#-核心技術亮點)
- [技術棧](#️-技術棧)
- [專案架構](#-專案架構)
- [功能特色](#-功能特色)
- [環境需求](#-環境需求)
- [快速開始](#-快速開始)
- [專案結構](#-專案結構)
- [作者](#-作者)

---

## 🚀 專案簡介

**Talent Match** 是一個連接學生與教師的線下課程媒合平台，提供課程搜尋、預約、購買、評價等完整功能。本專案前端採用 **Angular 20 Zoneless** 架構，展現了現代化前端開發的最佳實踐。

### 📌 專案背景

本專案是 [talent-match-frontend](https://github.com/TalentMatchNorth10/talent-match-frontend) 的重構版本，主要目的是：

- 🎓 **學習 Angular 20**：深入掌握 Angular 最新版本的特性與功能
- ⚡ **實踐 Signals**：全面採用 Angular Signals 進行響應式狀態管理
- 🔧 **技術升級**：從傳統 Zone.js 架構遷移到現代化的 Zoneless 架構

---

## ✨ 核心技術亮點

### 1. **Angular 20 Zoneless 架構**
本專案採用 Angular 最新的 **Zoneless Change Detection** 機制，完全脫離 Zone.js，帶來以下優勢：
- ⚡ **效能提升**：減少不必要的變更檢測，提升應用程式執行效能
- 🎯 **精準控制**：使用 Signals 進行細粒度的響應式更新
- 📦 **更小的打包體積**：移除 Zone.js 依賴，減少約 30KB 的打包大小
- 🔧 **更好的除錯體驗**：變更檢測流程更加明確和可預測

### 2. **Signals 響應式系統**
全面採用 Angular Signals 進行狀態管理，取代傳統的 RxJS Subject/BehaviorSubject

### 3. **rxResource 資料載入模式**
使用 Angular 的 `rxResource` API 進行宣告式的資料載入

### 4. **Orval 自動產生 API Client**
使用 Orval 從 OpenAPI/Swagger 規格自動產生型別安全的 API 客戶端

**優勢**：
- ✅ 完整的 TypeScript 型別推論
- ✅ 自動同步 API 變更
- ✅ 減少手動維護成本
- ✅ 降低前後端介接錯誤

### 5. **完整的認證授權系統**
實作基於 JWT Token 的認證機制，包含：
- 🔐 Access Token / Refresh Token 機制
- 🔄 Token 自動刷新（使用 HTTP Interceptor）
- 👮 角色權限管理（student/teacher/admin）
- 🛡️ Route Guards 保護路由
- 💾 Token 持久化儲存

### 6. **模組化元件設計**
採用原子設計（Atomic Design）概念，將 UI 拆分為可重用的元件

---

## 🛠️ 技術棧

### 核心框架
- **Angular 20.1.0** - 最新版本的 Angular 框架
- **TypeScript 5.8.2** - 強型別的 JavaScript 超集
- **RxJS 7.8.0** - 響應式程式設計函式庫

### UI 框架與工具
- **TailwindCSS 4.1.12** - Utility-first CSS 框架
- **Angular Material 20.2.0** - Material Design 元件庫
- **Swiper 11.2.10** - 現代化的輪播元件

### 開發工具
- **Orval 7.11.2** - OpenAPI 自動產生 API Client
- **Prettier 3.6.2** - 程式碼格式化工具
- **Angular CLI 20.1.1** - Angular 官方命令列工具

---

## 📐 專案架構

### 整體架構圖

```
┌────────────────────────────────────────────────────┐
│                   Browser Layer                    │
│  ┌──────────────────────────────────────────────┐  │
│  │          Angular Application (Zoneless)      │  │
│  │  ┌─────────────┐  ┌──────────────────────┐   │  │
│  │  │   Routes    │  │   Route Guards       │   │  │
│  │  │  (Lazy)     │  │  - authGuard         │   │  │
│  │  └─────────────┘  │  - guestGuard        │   │  │
│  │         │         │  - roleGuard         │   │  │
│  │         ▼         └──────────────────────┘   │  │
│  │  ┌─────────────────────────────────────┐     │  │
│  │  │        Pages (Components)           │     │  │
│  │  │  - Layout / Dashboard Layout        │     │  │
│  │  │  - Home / Search / Course Detail    │     │  │
│  │  │  - Cart / Payment                   │     │  │
│  │  │  - Login / Sign Up                  │     │  │
│  │  └─────────────────────────────────────┘     │  │
│  │         │                                    │  │
│  │         ▼                                    │  │
│  │  ┌─────────────────────────────────────┐     │  │
│  │  │    Reusable Components              │     │  │
│  │  │  - Form Inputs / Cards              │     │  │
│  │  │  - Dialogs / Calendar               │     │  │
│  │  │  - Table / Pagination               │     │  │
│  │  └─────────────────────────────────────┘     │  │
│  │         │                                    │  │
│  │         ▼                                    │  │
│  │  ┌─────────────────────────────────────┐     │  │
│  │  │          Services                   │     │  │
│  │  │  - AuthService (Signals)            │     │  │
│  │  │  - CartService (rxResource)         │     │  │
│  │  │  - API Services (Orval Generated)   │     │  │
│  │  └─────────────────────────────────────┘     │  │
│  │         │                                    │  │
│  │         ▼                                    │  │
│  │  ┌─────────────────────────────────────┐     │  │
│  │  │      HTTP Interceptors              │     │  │
│  │  │  - authInterceptor (Token)          │     │  │
│  │  │  - apiBaseUrlInterceptor            │     │  │
│  │  └─────────────────────────────────────┘     │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  Backend API                        │
│              (Express / OpenAPI)                    │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 功能特色

### 使用者功能
- ✅ **課程搜尋**：支援標籤搜尋、關鍵字搜尋、進階篩選
- ✅ **課程詳情**：查看課程資訊、教師簡介、評價、預約時段
- ✅ **購物車系統**：加入購物車、數量調整、立即購買
- ✅ **課程預約**：選擇時段
- ✅ **評價系統**：星級評分、文字評論、查看所有評價
- ✅ **訂單管理**：查看訂單歷史、付款狀態

### 學生專屬功能
- 📚 已購買課程管理
- ⭐ 評價與回饋
- 👤 個人資料編輯

### 教師專屬功能
- 📅 可用時段管理（每週行事曆）
- 📊 課程管理（新增、編輯、下架）
- 👥 學生預約管理
- 📹 教學短影音上傳

### 認證系統
- 🔐 登入 / 註冊
- 🔄 忘記密碼 / 重設密碼
- 👨‍🏫 教師申請流程
- 🎫 JWT Token 認證
- 🔒 角色權限控制

---

## 💻 環境需求

- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **Angular CLI**: >= 20.x

---

## 🚀 快速開始

### 1. 複製專案

```bash
git clone https://github.com/justine92415/talent-match-frontend-zoneless.git
cd talent-match-frontend-zoneless
```

### 2. 安裝相依套件

```bash
npm install
```

### 3. 設定環境變數

編輯 `src/environments/environment.ts`：

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080' // 修改為你的後端 API 位址
};
```

### 4. 啟動開發伺服器

```bash
npm start
```

應用程式將在 `http://localhost:4200` 啟動。

### 5. 產生 API Client（選用）

如果後端 API 已更新，執行以下指令重新產生 API 客戶端：

```bash
npm run generate:api
```

---

## 📂 專案結構

```
talent-match-frontend-zoneless/
├── src/
│   ├── app/                          # 應用程式核心
│   │   ├── api/
│   │   │   └── generated/            # Orval 自動產生的 API Client
│   │   ├── guards/                   # 路由守衛
│   │   │   ├── auth.guard.ts         # 認證守衛
│   │   │   ├── role.guard.ts         # 角色守衛
│   │   │   └── role-redirect.guard.ts # 角色重定向守衛
│   │   ├── interceptors/             # HTTP 攔截器
│   │   │   ├── auth.interceptor.ts   # JWT Token 攔截器
│   │   │   └── api-base-url.interceptor.ts
│   │   ├── pages/                    # 頁面元件
│   │   │   ├── layout/               # 主要佈局（學生端）
│   │   │   │   ├── home/             # 首頁
│   │   │   │   ├── result-tag/       # 標籤搜尋結果
│   │   │   │   ├── result-keyword/   # 關鍵字搜尋結果
│   │   │   │   ├── course-detail/    # 課程詳情
│   │   │   │   ├── cart/             # 購物車
│   │   │   │   └── payment-result/   # 付款結果
│   │   │   ├── dashboard-layout/     # Dashboard 佈局
│   │   │   │   ├── student/          # 學生 Dashboard
│   │   │   │   └── teacher/          # 教師 Dashboard
│   │   │   ├── login/                # 登入頁
│   │   │   ├── sign-up/              # 註冊頁
│   │   │   ├── reset-password/       # 重設密碼
│   │   │   └── teacher-apply/        # 教師申請
│   │   ├── services/                 # 服務層
│   │   │   ├── auth.service.ts       # 認證服務（Signals）
│   │   │   ├── cart.service.ts       # 購物車服務（rxResource）
│   │   │   └── api-config.service.ts
│   │   ├── pipes/                    # 自訂管道
│   │   │   ├── course-status.pipe.ts
│   │   │   └── course-status-class.pipe.ts
│   │   ├── app.config.ts             # 應用程式配置（Zoneless）
│   │   ├── app.routes.ts             # 路由配置
│   │   └── app.ts                    # 根元件
│   ├── components/                   # 可重用元件
│   │   ├── form/                     # 表單元件
│   │   │   ├── input-text/
│   │   │   ├── input-select/
│   │   │   ├── input-number/
│   │   │   ├── input-textarea/
│   │   │   ├── input-checkbox/
│   │   │   ├── input-rating/
│   │   │   ├── input-multi-select/
│   │   │   ├── input-plan/
│   │   │   └── input-global-search/
│   │   ├── dialogs/                  # 對話框元件
│   │   │   ├── confirm-dialog/
│   │   │   ├── input-dialog/
│   │   │   ├── review-dialog/
│   │   │   ├── all-reviews-dialog/
│   │   │   ├── reserve/
│   │   │   ├── video-selector/
│   │   │   └── video-viewer/
│   │   ├── course-card/              # 課程卡片
│   │   ├── video-card/               # 影片卡片
│   │   ├── review-card/              # 評價卡片
│   │   ├── course-reservations/      # 課程預約
│   │   ├── weekly-calendar/          # 每週行事曆（唯讀）
│   │   ├── editable-weekly-calendar/ # 每週行事曆（可編輯）
│   │   ├── table/                    # 表格元件
│   │   ├── pagination/               # 分頁元件
│   │   ├── star-rating/              # 星級評分
│   │   ├── header/                   # 頁首
│   │   ├── footer/                   # 頁尾
│   │   ├── dashboard-sidebar/        # Dashboard 側邊欄
│   │   └── ...
│   ├── shared/                       # 共用資源
│   │   └── pipes/                    # 共用管道
│   │       ├── category.pipe.ts
│   │       ├── city.pipe.ts
│   │       ├── degree.pipe.ts
│   │       └── ...
│   ├── share/                        # 共用工具
│   │   ├── cities.ts                 # 城市資料
│   │   ├── icon.enum.ts              # Icon 列舉
│   │   └── validator.ts              # 驗證器
│   ├── environments/                 # 環境設定
│   │   ├── environment.ts            # 開發環境
│   │   └── environment.prod.ts       # 正式環境
│   ├── styles.css                    # 全域樣式
│   ├── main.ts                       # 應用程式進入點
│   └── index.html                    # HTML 主檔
├── public/                           # 靜態資源
│   └── assets/
│       └── images/
├── scripts/                          # 自訂腳本
│   └── fix-orval-imports.js          # 修正 Orval 產生的匯入
├── angular.json                      # Angular 專案配置
├── package.json                      # 套件相依
├── tsconfig.json                     # TypeScript 配置
├── orval.config.ts                   # Orval 配置
└── README.md                         # 專案說明文件
```

---

## 👨‍💻 作者

**Justine**

- GitHub: [@justine92415](https://github.com/justine92415)
- Email: justine92415@gmail.com

---
**最後更新時間：2025年10月7日**
