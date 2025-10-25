# 🔗 頂部導航列與聯絡資訊頁面指南

## ✅ 已完成項目

### 1. 頂部水平導航列
- 📍 位置：頁面標題區域下方
- 🎨 設計：類似參考網站的水平導航風格
- 🔗 導航項目：進度規劃、聯絡資訊

### 2. 獨立的聯絡資訊頁面
- 📋 完整頁面佈局（非對話框或嵌入式分頁）
- 📝 包含三張卡片：開發單位、聯絡地址、電子郵件
- 📖 關於本系統說明與版本資訊
- ⚡ 點擊導航列切換頁面

---

## 🎯 頁面結構

```
┌──────────────────────────────────────────┐
│ 工程進度規劃與控制課程解答工具             │
│ Construction Planning and Scheduling...   │
├──────────────────────────────────────────┤
│ [進度規劃] [聯絡資訊]                      │  ← 導航列
└──────────────────────────────────────────┘

    ↓ 點擊「進度規劃」

┌──────────────────────────────────────────┐
│ 任務輸入 │ CPM 計算結果 │ 甘特圖 │ PDM 圖  │
└──────────────────────────────────────────┘

    ↓ 點擊「聯絡資訊」

┌──────────────────────────────────────────┐
│            📧 聯絡資訊                     │
│                                           │
│  🏫 開發單位  📍 聯絡地址  📧 電子郵件     │
│                                           │
│         📝 關於本系統（版本資訊）          │
└──────────────────────────────────────────┘
```

---

## 🎨 設計特色

### 導航列設計（參考提供的圖片）

✅ **類似參考網站的風格**
- 水平排列的導航項目
- 當前頁面有底部指示線（3px 深灰色）
- Hover 效果：背景變淺灰色
- 簡潔的無印風格

✅ **互動效果**
```css
普通狀態：灰色文字，無背景
Hover：   深灰文字，淺灰背景
選中狀態：深灰文字，深灰底線，中等粗體
```

### 聯絡頁面設計

✅ **三張卡片橫向排列**
- 開發單位（🏫）
- 聯絡地址（📍）
- 電子郵件（📧）

✅ **Hover 效果**
- 卡片向上浮動 5px
- 陰影加深

✅ **關於本系統區塊**
- 系統介紹
- 版本資訊徽章（v1.2）
- 最後更新時間

---

## 💻 技術實作

### 修改的檔案

```
src/App.vue
  ├─ template
  │   ├─ 新增頂部導航列 <nav class="main-nav">
  │   ├─ 使用 v-if="currentPage === 'planning'" 包裝進度規劃內容
  │   └─ 新增 v-if="currentPage === 'contact'" 聯絡頁面
  ├─ script
  │   └─ 新增 currentPage ref（'planning' | 'contact'）
  └─ style
      ├─ 導航列樣式 (.main-nav, .nav-item)
      ├─ 聯絡頁面樣式 (.contact-page, .contact-grid-page)
      └─ 響應式設計（手機版單欄佈局）
```

### 刪除的內容

```
❌ 聯絡按鈕（.btn-contact）
❌ 聯絡對話框（.modal-contact）
❌ showContactDialog ref
```

---

## 📱 響應式設計

### 桌機版（> 768px）
- 導航項目：`padding: 12px 24px`
- 聯絡卡片：三欄橫向排列
- 卡片內距：`32px`

### 手機版（≤ 768px）
- 導航項目：`padding: 10px 16px`，文字 `14px`
- 聯絡卡片：單欄垂直排列
- 卡片內距：`24px`
- 版本資訊：垂直排列

---

## 🚀 使用方式

### 切換頁面

1. **查看進度規劃**
   - 開啟網站（預設顯示進度規劃）
   - 或點擊導航列的「進度規劃」
   - 顯示完整的任務輸入、計算、圖表功能

2. **查看聯絡資訊**
   - 點擊導航列的「聯絡資訊」
   - 進入獨立的聯絡頁面
   - 可查看聯絡方式與系統資訊

### 發送郵件

1. 切換到聯絡資訊頁面
2. 找到「電子郵件」卡片
3. 點擊郵件地址
4. 自動開啟郵件客戶端

---

## 🔧 自訂指南

### 修改導航項目

在 `src/App.vue` 的 `<nav class="main-nav">` 中：

```vue
<!-- 新增導航項目 -->
<button 
  class="nav-item" 
  :class="{ active: currentPage === 'new-page' }"
  @click="currentPage = 'new-page'">
  新頁面名稱
</button>
```

### 修改聯絡資訊

在 `src/App.vue` 的聯絡頁面部分：

```vue
<!-- 修改開發單位 -->
<p class="card-text">國立雲林科技大學</p>

<!-- 修改地址 -->
<p class="card-text">雲林縣斗六市大學路三段123號</p>

<!-- 修改郵件 -->
<a href="mailto:your-email@example.com" class="email-link-page">
  your-email@example.com
</a>

<!-- 修改版本號 -->
<span class="version-number">v1.2</span>

<!-- 修改更新日期 -->
<div class="update-date">
  最後更新：2025年10月
</div>
```

### 修改導航列樣式

在 `src/App.vue` 的 `<style>` 區塊：

```css
/* 導航項目顏色 */
.nav-item {
  color: #666;                /* 📏 普通狀態顏色 */
}

.nav-item:hover {
  color: #333;                /* 📏 Hover 顏色 */
  background: #fafafa;        /* 📏 Hover 背景 */
}

.nav-item.active {
  color: #333;                /* 📏 選中狀態顏色 */
  border-bottom-color: #333;  /* 📏 底線顏色 */
}
```

### 修改卡片樣式

```css
/* 卡片背景與邊框 */
.contact-card-page {
  background: #ffffff;        /* 📏 背景顏色 */
  border: 1px solid #e8e8e8;  /* 📏 邊框顏色 */
}

/* 卡片 Hover 效果 */
.contact-card-page:hover {
  transform: translateY(-5px); /* 📏 浮動距離 */
}
```

---

## ✨ 與其他方案比較

### ✅ 頂部導航方案（目前實作）
- 類似參考網站的設計
- 完整的獨立頁面
- 清晰的頁面結構
- 專業的導航體驗

### ❌ 按鈕對話框方案（已棄用）
- 位於標題右側按鈕
- 彈出對話框顯示
- 較小的顯示空間
- 不適合作為主要導航

### ❌ 圖表區分頁方案（已棄用）
- 與 Bar Chart / PDM 混在一起
- 只在有計算結果時顯示
- 佔用圖表分頁空間
- 不符合參考網站風格

---

## 📋 頁面狀態管理

### currentPage Ref

```typescript
const currentPage = ref<'planning' | 'contact'>('planning')
```

- **planning**: 顯示進度規劃頁面（預設）
- **contact**: 顯示聯絡資訊頁面

### 頁面切換

```vue
<!-- 使用 v-if 切換頁面內容 -->
<div v-if="currentPage === 'planning'" class="page-content">
  <!-- 進度規劃內容 -->
</div>

<div v-if="currentPage === 'contact'" class="page-content contact-page">
  <!-- 聯絡資訊內容 -->
</div>
```

---

## 🎯 CSS 類別說明

### 導航列

| 類別 | 說明 |
|------|------|
| `.main-nav` | 導航列容器 |
| `.nav-item` | 導航項目按鈕 |
| `.nav-item.active` | 當前選中的導航項目 |

### 聯絡頁面

| 類別 | 說明 |
|------|------|
| `.page-content` | 頁面內容容器 |
| `.contact-page` | 聯絡頁面特定樣式 |
| `.contact-header` | 聯絡頁面標題區 |
| `.contact-grid-page` | 三張卡片的網格容器 |
| `.contact-card-page` | 單張聯絡卡片 |
| `.card-icon-page` | 卡片圖示 |
| `.email-link-page` | 電子郵件連結 |
| `.about-section-page` | 關於本系統區塊 |
| `.version-info-page` | 版本資訊區塊 |
| `.version-badge-page` | 版本號徽章 |

---

## 📝 注意事項

### 顯示邏輯
- ✅ 兩個頁面互斥顯示（使用 `v-if`）
- ✅ 預設顯示進度規劃頁面
- ✅ 切換頁面時有淡入動畫

### 設計原則
- 保持與現有風格一致
- 使用無印風格設計
- 所有文字使用繁體中文
- 包含完整的繁體中文註解

### URL 狀態
- 目前使用 ref 管理狀態
- 未使用 Vue Router
- 頁面切換不會改變 URL
- 適合單頁應用場景

---

## 📚 相關文件

- 程式碼註解規範：`.cursorrules`
- 樣式維護指南：`STYLE_MAINTENANCE_GUIDE.md`
- 快速樣式參考：`QUICK_STYLE_REFERENCE.md`
- PDM 圖表指南：`PDM_DIAGRAM_GUIDE.md`

---

## 🔄 版本歷史

### v1.2 - 2025-10-25
- ✅ 新增頂部水平導航列
- ✅ 新增獨立的聯絡資訊頁面
- ✅ 刪除聯絡按鈕與對話框
- ✅ 參考提供的網站設計風格
- ✅ 完整的響應式設計支援

---

**建立日期：** 2025-10-25  
**版本：** v1.2  
**狀態：** ✅ 完成並可立即使用

🎉 **頂部導航列與聯絡資訊頁面已成功實作！**

類似參考網站的專業導航體驗，完整的獨立聯絡頁面！

