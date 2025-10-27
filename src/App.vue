<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <!-- 🏢 左側：Logo 與網站名稱 -->
          <router-link to="/" class="header-brand">
            <div class="brand-logo">
              <div class="logo-icon">
                <div class="logo-bars">
                  <span class="bar bar-1"></span>
                  <span class="bar bar-2"></span>
                </div>
              </div>
              <div class="brand-text">
                <h1 class="brand-title">營建管理相關工具集</h1>
                <p class="brand-subtitle">Construction Management Tools</p>
              </div>
            </div>
          </router-link>
          
          <!-- 🔗 右側：導航列 -->
          <nav class="main-nav">
            <router-link 
              to="/"
              class="nav-item" 
              active-class="active"
              exact>
              Home
            </router-link>
            <router-link 
              to="/tools"
              class="nav-item" 
              active-class="active">
              {{ t.nav.tools }}
            </router-link>
            <router-link 
              to="/contact"
              class="nav-item" 
              active-class="active">
              {{ t.nav.contact }}
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <main class="app-main">
      <!-- 📄 路由視圖：根據 URL 顯示對應的頁面組件 -->
      <router-view />
    </main>

    <footer class="app-footer">
      <div class="container">
        <p>{{ t.footer.copyright }}</p>
        <p>{{ t.footer.designedBy }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * 📦 主應用程式組件
 * 
 * 功能說明：
 * - 提供全域佈局（標題、導航列、頁腳）
 * - 使用 Vue Router 進行頁面路由管理
 * - 提供多語言切換功能（繁體中文 / 英文）
 * - 各頁面功能由對應的 View 組件負責
 */

import { useLanguage } from './composables/useLanguage'

// 🌐 語言管理（已停用切換功能，固定使用繁體中文）
const { t } = useLanguage()

// 注意：語言切換功能已停用，系統固定使用繁體中文
</script>

<style>
/* ==========================================
   🎨 全域樣式設定（移除 scoped 以便子組件使用）
   ========================================== */

/* 📦 主應用容器 */
#app {
  min-height: 100vh;              /* 最小高度：全螢幕 */
  display: flex;
  flex-direction: column;
  background: #f5f5f5;            /* 🎨 背景顏色：淺灰色（可修改整體底色） */
}

/* ==========================================
   🎨 頁面標題區域
   ========================================== */

/* 📋 頂部標題列 */
.app-header {
  background: #ffffff;            /* 🎨 背景：純白色 */
  color: #333;                    /* 🎨 文字顏色：深灰色 */
  padding: 28px 0;                /* 📏 上下內距：28px（增加高度） */
  border-bottom: 1px solid #e5e5e5; /* 🎨 底部邊框：淺灰色 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04); /* 🎨 輕微陰影 */
}

/* 📦 標題內容區 */
.header-content {
  display: flex;                  /* 📏 使用 Flexbox 佈局 */
  justify-content: space-between; /* 📏 標題與導航分居兩側 */
  align-items: center;            /* 📏 垂直置中對齊 */
  gap: 40px;                      /* 📏 標題與導航間距：40px */
}

/* 🏢 左側品牌區域 */
.header-brand {
  text-decoration: none;
  color: inherit;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
}

.header-brand:hover {
  opacity: 0.8;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 🎨 Logo 圖標 */
.logo-icon {
  width: 40px;
  height: 40px;
  background: #333;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.logo-bars {
  display: flex;
  gap: 3px;
  align-items: flex-end;
}

.bar {
  width: 6px;
  background: white;
  border-radius: 1px;
}

.bar-1 {
  height: 12px;
}

.bar-2 {
  height: 16px;
}

/* 📝 品牌文字 */
.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  margin: 0;
  font-size: 22px;                /* 📏 字體加大 */
  font-weight: 600;
  color: #333;
  letter-spacing: 1px;
}

.brand-subtitle {
  margin: 0;
  font-size: 12px;                /* 📏 字體加大 */
  color: #999;
  letter-spacing: 0.5px;
  font-weight: 400;
}

/* ==========================================
   🔗 頂部導航列
   ========================================== */

/* 📋 導航列容器 */
.main-nav {
  display: flex;
  gap: 0;                         /* 📏 導航項目無間距 */
  align-items: center;            /* 📏 垂直置中 */
}

/* 📝 導航項目 */
.nav-item {
  padding: 8px 20px;              /* 📏 內距：上下8px 左右20px */
  background: transparent;
  border: none;
  color: #999;                    /* 🎨 文字顏色：淺灰 */
  font-size: 14px;                /* 📏 文字大小 */
  font-weight: 400;               /* 📏 字重 */
  cursor: pointer;
  transition: all 0.3s;           /* ⚡ 過渡動畫 */
  position: relative;
  text-decoration: none;          /* 📏 移除連結底線 */
  white-space: nowrap;            /* 📏 不換行 */
  display: inline-block;          /* 📏 行內區塊 */
}

.nav-item:hover {
  color: #333;                    /* 🎨 Hover：深灰色 */
}

/* ✅ 當前啟用的導航項目 */
.nav-item.active {
  color: #333;                    /* 🎨 文字顏色：深灰色 */
  font-weight: 500;               /* 📏 字重：中等粗體 */
}

/* ==========================================
   🌐 語言切換器
   ========================================== */

/* 📝 語言切換按鈕 */
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 6px;                       /* 📏 圖標與文字間距 */
  padding: 8px 16px;              /* 📏 內距：上下8px 左右16px */
  margin-left: 16px;              /* 📏 與導航項目間距 */
  background: #f5f5f5;            /* 🎨 背景：淺灰色 */
  border: 1px solid #e8e8e8;      /* 🎨 邊框：淺灰色 */
  border-radius: 4px;             /* 📏 圓角：4px */
  color: #666;                    /* 🎨 文字顏色：深灰 */
  font-size: 14px;                /* 📏 文字大小 */
  font-weight: 500;               /* 📏 字重：中等 */
  cursor: pointer;                /* 🖱️ 滑鼠游標：手指 */
  transition: all 0.2s ease;      /* ⚡ 過渡動畫 */
  white-space: nowrap;            /* 📏 不換行 */
}

/* 🖱️ 語言切換按鈕 Hover 效果 */
.lang-switcher:hover {
  background: #e8e8e8;            /* 🎨 Hover 背景：較深灰色 */
  border-color: #d0d0d0;          /* 🎨 Hover 邊框：較深灰色 */
  color: #333;                    /* 🎨 Hover 文字：深灰色 */
}

/* 🌐 語言圖標 */
.lang-icon {
  font-size: 16px;                /* 📏 圖標大小 */
  line-height: 1;
}

/* 📝 語言文字 */
.lang-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 0.5px;          /* 📏 字距 */
}

/* 📦 主內容區域 */
.app-main {
  flex: 1;
  padding: 40px 0;                /* 📏 上下內距：40px（可調整內容區間距） */
}

/* 📦 內容容器（限制最大寬度） */
.container {
  max-width: 1600px;              /* 📏 最大寬度：1600px（可調整內容寬度） */
  margin: 0 auto;                 /* 置中對齊 */
  padding: 0 24px;                /* 📏 左右內距：24px */
}

/* ==========================================
   🎛️ 工具列樣式（匯入/匯出按鈕區）
   ========================================== */

/* 📋 工具列容器 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;                      /* 📏 元素間距：12px */
  padding: 16px 24px;             /* 📏 內距：上下16px 左右24px */
  background: white;              /* 🎨 背景：白色 */
  border-radius: 2px;             /* 📏 圓角：2px（無印風格小圓角） */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); /* 🎨 陰影：淡淡的陰影效果 */
  margin-bottom: 24px;            /* 📏 底部間距：24px */
  flex-wrap: wrap;
  border: 1px solid #e8e8e8;      /* 🎨 邊框：淺灰色 */
}

/* 📦 工具列區塊 */
.toolbar-section {
  display: flex;
  gap: 8px;                       /* 📏 按鈕間距：8px */
  flex-wrap: wrap;
}

/* ==========================================
   🔘 按鈕樣式
   ========================================== */

/* 📝 基礎按鈕樣式 */
.btn {
  padding: 8px 16px;              /* 📏 內距：上下8px 左右16px（可調整按鈕大小） */
  border-radius: 2px;             /* 📏 圓角：2px */
  font-size: 13px;                /* 📏 文字大小：13px（可調整按鈕文字大小） */
  font-weight: 400;               /* 📏 字重：正常 */
  cursor: pointer;
  transition: all 0.2s;           /* ⚡ 動畫：0.2秒過渡效果 */
}

/* 🚫 停用狀態 */
.btn:disabled {
  opacity: 0.4;                   /* 📏 透明度：40%（灰階效果） */
  cursor: not-allowed;
}

/* 🔘 外框按鈕樣式 */
.btn-outline {
  background: white;              /* 🎨 背景：白色 */
  border: 1px solid #d0d0d0;      /* 🎨 邊框：淺灰色 */
  color: #666;                    /* 🎨 文字顏色：深灰色 */
}

/* 🖱️ 外框按鈕 hover 效果 */
.btn-outline:hover:not(:disabled) {
  background: #333;               /* 🎨 背景：深灰色 */
  color: white;                   /* 🎨 文字：白色 */
  border-color: #333;             /* 🎨 邊框：深灰色 */
}

/* 🔘 次要按鈕樣式 */
.btn-secondary {
  background: #fff;               /* 🎨 背景：白色 */
  color: #666;                    /* 🎨 文字顏色：深灰色 */
  border: 1px solid #d0d0d0;      /* 🎨 邊框：淺灰色 */
}

/* 🖱️ 次要按鈕 hover 效果 */
.btn-secondary:hover {
  background: #f5f5f5;            /* 🎨 背景：極淺灰色 */
  border-color: #999;             /* 🎨 邊框：中灰色 */
}

/* ==========================================
   📐 版面配置
   ========================================== */

/* 📦 左右分欄布局 */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* 左右各佔 50% */
  gap: 24px;                       /* 📏 欄位間距：32px（可調整左右間距） */
  margin-bottom: 24px;             /* 📏 底部間距：24px */
}

/* 📦 左側面板 */
.left-panel {
  min-width: 0;                    /* 允許內容縮小 */
}

/* 📦 右側面板 */
.right-panel {
  min-width: 0;                    /* 允許內容縮小 */
}

/* 📦 區塊容器 */
.section {
  margin-bottom: 24px;             /* 📏 底部間距：24px */
}

/* ==========================================
   💬 訊息提示（成功/錯誤/資訊）
   ========================================== */

/* 📋 訊息提示框 */
.message {
  position: fixed;                 /* 固定在畫面上 */
  bottom: 24px;                    /* 📏 距離底部：24px */
  right: 24px;                     /* 📏 距離右側：24px */
  padding: 16px 24px;              /* 📏 內距：上下16px 左右24px */
  border-radius: 8px;              /* 📏 圓角：8px（較圓的角落） */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* 🎨 陰影效果 */
  font-weight: 500;                /* 📏 字重：中等粗體 */
  animation: slideIn 0.3s ease-out;/* ⚡ 滑入動畫 */
  z-index: 1000;                   /* 最上層顯示 */
  max-width: 400px;                /* 📏 最大寬度：400px */
}

/* ⚡ 訊息滑出動畫 */
.message.slide-out {
  animation: slideOut 0.3s ease-in forwards;
}

/* ✅ 成功訊息樣式 */
.message.success {
  background: #27ae60;             /* 🎨 背景：綠色（可修改成功提示顏色） */
  color: white;                    /* 🎨 文字：白色 */
}

/* ❌ 錯誤訊息樣式 */
.message.error {
  background: #e74c3c;             /* 🎨 背景：紅色（可修改錯誤提示顏色） */
  color: white;                    /* 🎨 文字：白色 */
}

/* ℹ️ 資訊訊息樣式 */
.message.info {
  background: #3498db;             /* 🎨 背景：藍色（可修改資訊提示顏色） */
  color: white;                    /* 🎨 文字：白色 */
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(120%);
    opacity: 0;
  }
}

.app-footer {
  background: #fff;
  color: #999;
  padding: 24px 0;
  text-align: center;
  border-top: 1px solid #e8e8e8;
}

.app-footer p {
  margin: 6px 0;
  font-size: 12px;
}

.footer-note {
  font-size: 12px;
  color: #bbb;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: white;
  border-radius: 2px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
  border: 1px solid #e8e8e8;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #ccc;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 28px;
  height: 28px;
}

.close-btn:hover {
  color: #999;
}

.modal-body {
  padding: 24px;
}

.modal-description {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.8;
  font-size: 13px;
}

.file-input {
  display: block;
  width: 100%;
  padding: 12px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 0.2s;
  background: #fafafa;
}

.file-input:hover {
  border-color: #999;
  background: #fff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

/* ==========================================
   📊 圖表容器和分頁樣式
   ========================================== */

/* 📦 圖表主容器 */
.chart-container {
  background: #ffffff;             /* 🎨 背景：白色 */
  border-radius: 2px;              /* 📏 圓角：2px */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); /* 🎨 陰影效果 */
  border: 1px solid #e8e8e8;       /* 🎨 邊框：淺灰色 */
  overflow: hidden;
}

/* 🗂️ 圖表分頁標籤列 */
.chart-tabs {
  display: flex;
  border-bottom: 2px solid #e8e8e8; /* 🎨 底部邊框：淺灰色 */
  background: #fafafa;             /* 🎨 背景：極淺灰 */
}

/* 🔘 分頁按鈕 */
.tab-button {
  flex: 1;                         /* 平均分配寬度 */
  padding: 16px 24px;              /* 📏 內距：上下16px 左右24px（可調整按鈕大小） */
  border: none;
  background: transparent;
  color: #666;                     /* 🎨 文字顏色：深灰色 */
  font-size: 15px;                 /* 📏 文字大小：15px（可調整分頁文字大小） */
  font-weight: 300;                /* 📏 字重：細體（未選中狀態） */
  cursor: pointer;
  transition: all 0.3s;            /* ⚡ 過渡動畫：0.3秒 */
  position: relative;
  letter-spacing: 0.5px;           /* 📏 字距：0.5px */
}

/* 🖱️ 分頁按鈕 hover 效果 */
.tab-button:hover {
  background: #f5f5f5;             /* 🎨 背景：淺灰色 */
  color: #333;                     /* 🎨 文字：深灰色 */
}

/* ✅ 選中的分頁按鈕 */
.tab-button.active {
  color: #333;                     /* 🎨 文字顏色：深灰色 */
  background: #ffffff;             /* 🎨 背景：白色 */
  font-weight: 400;                /* 📏 字重：正常（選中狀態） */
}

/* 🔖 選中分頁的底部指示線 */
.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;                    /* 位置：緊貼底部 */
  left: 0;
  right: 0;
  height: 3px;                     /* 📏 指示線高度：3px（可調整粗細） */
  background: #333;                /* 🎨 指示線顏色：深灰色（可修改） */
}

/* 📊 圖表內容區 */
.chart-content {
  background: #ffffff;             /* 🎨 背景：白色 */
}

/* 📈 圖表面板 */
.chart-panel {
  animation: fadeIn 0.3s ease-in;  /* ⚡ 淡入動畫 */
  height: 600px;                   /* 📏 固定高度：600px（可調整圖表高度） */
  overflow: hidden;                /* 隱藏溢出內容 */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==========================================
   📱 響應式設計 - 手機版（螢幕寬度 ≤ 768px）
   ========================================== */

@media (max-width: 768px) {
  /* 🎛️ 工具列改為垂直排列 */
  .toolbar {
    flex-direction: column;        /* 垂直排列 */
    align-items: stretch;
  }
  
  /* 📦 工具列區塊佔滿寬度 */
  .toolbar-section {
    width: 100%;                   /* 滿版寬度 */
  }
  
  /* 📝 主標題文字縮小 */
  .app-header h1 {
    font-size: 20px;               /* 📏 從 24px 縮小為 20px */
  }

  /* 📦 標題與導航垂直排列 */
  .header-content {
    flex-direction: column;        /* 垂直排列 */
    align-items: stretch;          /* 延展至全寬 */
    gap: 16px;                     /* 間距縮小 */
  }

  .main-nav {
    justify-content: center;       /* 導航項目置中 */
  }
  
  /* 📦 容器內距縮小 */
  .container {
    padding: 0 16px;               /* 📏 從 24px 縮小為 16px */
  }

  /* 📐 主版面間距縮小 */
  .main-layout {
    gap: 16px;                     /* 📏 從 24px 縮小為 16px */
  }
  
  /* 🔘 分頁按鈕縮小 */
  .tab-button {
    padding: 12px 16px;            /* 📏 內距縮小 */
    font-size: 14px;               /* 📏 文字從 15px 縮小為 14px */
  }

  /* 🔗 導航項目縮小 */
  .nav-item {
    padding: 10px 16px;            /* 📏 內距縮小 */
    font-size: 14px;               /* 📏 文字縮小 */
  }

  /* 📧 聯絡頁面響應式 */
  .contact-header h2 {
    font-size: 22px;               /* 📏 標題縮小 */
  }

  .contact-grid-page {
    grid-template-columns: 1fr;    /* 單欄佈局 */
    gap: 16px;                     /* 📏 間距縮小 */
  }

  .contact-card-page {
    padding: 24px;                 /* 📏 內距縮小 */
  }

  .about-section-page {
    padding: 24px;                 /* 📏 內距縮小 */
  }

  .about-section-page h3 {
    font-size: 18px;               /* 📏 標題縮小 */
  }

  .version-info-page {
    flex-direction: column;        /* 垂直排列 */
    gap: 12px;
    align-items: flex-start;
  }
}

/* ==========================================
   📧 聯絡資訊頁面樣式
   ========================================== */

/* 📄 頁面內容區 */
.page-content {
  animation: fadeIn 0.3s ease-in;  /* ⚡ 淡入動畫 */
}

/* 📋 聯絡頁面標題 */
.contact-header {
  text-align: center;
  margin-bottom: 40px;             /* 📏 底部間距：40px */
}

.contact-header h2 {
  font-size: 28px;                 /* 📏 文字大小：28px */
  color: #333;                     /* 🎨 文字顏色：深灰色 */
  margin: 0 0 12px 0;
  font-weight: 500;                /* 📏 字重：中等粗體 */
  letter-spacing: 1px;             /* 📏 字距 */
}

.contact-subtitle {
  font-size: 15px;                 /* 📏 文字大小：15px */
  color: #999;                     /* 🎨 文字顏色：淺灰色 */
  margin: 0;
  font-weight: 400;
}

/* 📇 聯絡資訊卡片網格 */
.contact-grid-page {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 三欄佈局 */
  gap: 24px;                       /* 📏 卡片間距：24px */
  margin-bottom: 40px;             /* 📏 底部間距 */
}

/* 📋 聯絡卡片 */
.contact-card-page {
  background: #ffffff;             /* 🎨 背景：白色 */
  padding: 32px;                   /* 📏 內距：32px */
  border-radius: 2px;              /* 📏 圓角：2px */
  border: 1px solid #e8e8e8;       /* 🎨 邊框：淺灰色 */
  text-align: center;
  transition: all 0.3s ease;       /* ⚡ 過渡動畫 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); /* 🎨 陰影效果 */
}

.contact-card-page:hover {
  transform: translateY(-5px);     /* ⚡ Hover 向上浮動 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); /* 🎨 Hover 陰影加深 */
}

/* 🎨 卡片圖示容器 */
.card-icon-page {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 🏫 學校圖示 */
.icon-school {
  width: 50px;
  height: 50px;
  position: relative;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.icon-school::before {
  content: '';
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 2px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon-school::after {
  content: '';
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 12px solid white;
  position: absolute;
  top: 8px;
}

/* 📍 地點圖示 */
.icon-location {
  width: 50px;
  height: 50px;
  position: relative;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
}

.icon-location::before {
  content: '';
  width: 24px;
  height: 30px;
  background: white;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  position: relative;
  top: -3px;
}

.icon-location::after {
  content: '';
  width: 10px;
  height: 10px;
  background: #e74c3c;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 📧 郵件圖示 */
.icon-email {
  width: 50px;
  height: 50px;
  position: relative;
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
}

.icon-email::before {
  content: '';
  width: 32px;
  height: 22px;
  background: white;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon-email::after {
  content: '';
  width: 0;
  height: 0;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-top: 12px solid white;
  position: absolute;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.contact-card-page h3 {
  font-size: 18px;                 /* 📏 標題大小：18px */
  color: #333;                     /* 🎨 文字顏色：深灰色 */
  margin: 0 0 16px 0;
  font-weight: 500;                /* 📏 字重：中等粗體 */
}

.card-text {
  font-size: 14px;                 /* 📏 文字大小：14px */
  color: #666;                     /* 🎨 文字顏色：中灰色 */
  margin: 8px 0;
  line-height: 1.6;
}

.card-note {
  font-size: 13px;                 /* 📏 小字大小：13px */
  color: #999;                     /* 🎨 文字顏色：淺灰色 */
  margin-top: 12px;
}

/* 📧 電子郵件連結 */
.email-link-page {
  color: #3498db;                  /* 🎨 連結顏色：藍色 */
  text-decoration: none;
  transition: color 0.2s;          /* ⚡ 過渡動畫 */
  font-weight: 500;
}

.email-link-page:hover {
  color: #2980b9;                  /* 🎨 Hover 顏色：深藍色 */
  text-decoration: underline;
}

/* 📝 關於本系統區塊 */
.about-section-page {
  background: #ffffff;             /* 🎨 背景：白色 */
  padding: 40px;                   /* 📏 內距：40px */
  border-radius: 2px;              /* 📏 圓角：2px */
  border: 1px solid #e8e8e8;       /* 🎨 邊框：淺灰色 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); /* 🎨 陰影效果 */
}

.about-section-page h3 {
  font-size: 20px;                 /* 📏 標題大小：20px */
  color: #333;                     /* 🎨 文字顏色：深灰色 */
  margin: 0 0 24px 0;
  font-weight: 500;                /* 📏 字重：中等粗體 */
  padding-bottom: 16px;            /* 📏 底部內距 */
  border-bottom: 1px solid #e8e8e8; /* 🎨 底部邊框 */
}

.about-content-page p {
  font-size: 15px;                 /* 📏 文字大小：15px */
  color: #666;                     /* 🎨 文字顏色：中灰色 */
  line-height: 1.8;                /* 📏 行高 */
  margin: 0 0 16px 0;
}

/* 🏷️ 版本資訊區塊 */
.version-info-page {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;                /* 📏 頂部間距：32px */
  padding-top: 24px;               /* 📏 頂部內距 */
  border-top: 1px solid #e8e8e8;   /* 🎨 頂部邊框 */
}

.version-badge-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-label {
  font-size: 14px;                 /* 📏 文字大小：14px */
  color: #666;                     /* 🎨 文字顏色：中灰色 */
}

.version-number {
  background: #e3f2fd;             /* 🎨 背景：淺藍色 */
  color: #3498db;                  /* 🎨 文字顏色：藍色 */
  padding: 4px 12px;               /* 📏 內距 */
  border-radius: 2px;              /* 📏 圓角：2px */
  font-weight: 500;                /* 📏 字重：中等粗體 */
  font-size: 14px;                 /* 📏 文字大小：14px */
}

.update-date {
  font-size: 14px;                 /* 📏 文字大小：14px */
  color: #999;                     /* 🎨 文字顏色：淺灰色 */
}

/* ==========================================
   💡 樣式維護說明
   ========================================== 
   
   🎨 顏色修改範例：
   - 主標題文字：修改 .app-header h1 { color: #333; }
   - 背景顏色：修改 #app { background: #f5f5f5; }
   - 按鈕顏色：修改 .btn-outline { color: #666; }
   - 成功訊息：修改 .message.success { background: #27ae60; }
   
   📏 大小修改範例：
   - 標題字體：修改 .app-header h1 { font-size: 24px; }
   - 按鈕大小：修改 .btn { padding: 8px 16px; }
   - 圖表高度：修改 .chart-panel { height: 600px; }
   - 容器寬度：修改 .container { max-width: 1400px; }
   
   📏 間距修改範例：
   - 工具列間距：修改 .toolbar { gap: 12px; }
   - 內容間距：修改 .app-main { padding: 40px 0; }
   - 分欄間距：修改 .main-layout { gap: 24px; }
   
   ⚡ 動畫修改範例：
   - 動畫速度：修改 transition: all 0.2s;
   - 訊息動畫：修改 animation: slideIn 0.3s ease-out;
   
   ========================================== */
</style>
