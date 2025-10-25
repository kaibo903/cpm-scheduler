# 🗺️ 聯絡資訊頁面地圖設定指南

## 📋 概述

聯絡資訊頁面採用左右分欄設計，左側顯示 Google Maps 地圖，右側顯示聯絡資訊。

---

## 🎯 如何更新地圖位置

### 步驟 1：前往 Google Maps

1. 打開瀏覽器，前往 [Google Maps](https://www.google.com/maps)
2. 搜尋「國立雲林科技大學工程五館」或具體地址

### 步驟 2：獲取嵌入代碼

1. 在 Google Maps 上找到正確位置後，點擊 **「分享」** 按鈕
2. 選擇 **「嵌入地圖」** 分頁
3. 點擊 **「複製 HTML」** 取得 iframe 代碼

**範例格式：**
```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!..." 
        width="600" 
        height="450" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy">
</iframe>
```

### 步驟 3：更新程式碼

打開 `src/views/ContactView.vue`，找到地圖 iframe 區域（約第 11-20 行）：

```vue
<iframe
  src="這裡替換為你的 Google Maps embed URL"
  width="100%"
  height="100%"
  style="border:0;"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  title="國立雲林科技大學工程五館位置">
</iframe>
```

**只需要替換 `src` 屬性中的 URL！**

---

## 📍 預設地址資訊

目前程式碼中設定的聯絡資訊：

| 項目 | 內容 |
|------|------|
| 單位 | 國立雲林科技大學 營建工程系 EB502 |
| 地址 | 雲林縣斗六市大學路三段123號 工程五館 |
| 郵件 | contact@yuntech.edu.tw |
| 電話 | 05-534-2601 |

---

## 🎨 頁面設計特色

### 左右分欄佈局

```
┌─────────────────────────────────────────┐
│                                         │
│    🗺️ Google Maps                      │
│    (工程五館位置)                        │
│                                         │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│   Contact.                              │
│                                         │
│   感謝您蒞臨瀏覽本站...                  │
│                                         │
│   國立雲林科技大學                       │
│   單位：營建工程系 EB502                 │
│   地址：雲林縣斗六市...                  │
│   ─────────────────                     │
│   聯絡方式                               │
│   電子郵件：contact@yuntech.edu.tw      │
│   電話：05-534-2601                     │
│   ─────────────────                     │
│   關於本系統                             │
│   本系統為工程進度規劃...                │
│   版本：v1.2 | 最後更新：2025年10月      │
│                                         │
└─────────────────────────────────────────┘
```

### 設計風格

✅ **極簡風格**：乾淨的留白與簡潔的文字排版  
✅ **大標題**：48px "Contact." 標題（字重 300）  
✅ **分區清晰**：使用淡灰色分隔線區分不同資訊區塊  
✅ **標籤對齊**：使用 flexbox 對齊標籤與內容  
✅ **互動提示**：郵件連結 hover 效果（紫色）  

---

## 🔧 自訂聯絡資訊

### 修改文字內容

在 `src/views/ContactView.vue` 的 `<template>` 區域，找到對應區塊修改：

#### 1. 修改標題與副標題

```vue
<!-- 標題 -->
<h1 class="contact-title">Contact.</h1>

<!-- 副標題說明 -->
<p class="contact-intro">
  感謝您蒞臨瀏覽本站，若對本系統有任何問題或建議，
  請透過以下聯絡方式與我們聯繫。
</p>
```

#### 2. 修改單位資訊

```vue
<!-- 開發單位 -->
<div class="detail-block">
  <h3 class="detail-title">國立雲林科技大學</h3>
  <div class="detail-content">
    <p class="detail-item">
      <span class="detail-label">單位：</span>
      營建工程系 EB502
    </p>
    <p class="detail-item">
      <span class="detail-label">地址：</span>
      雲林縣斗六市大學路三段123號 工程五館
    </p>
  </div>
</div>
```

#### 3. 修改聯絡方式

```vue
<!-- 聯絡方式 -->
<div class="detail-block">
  <h3 class="detail-title">聯絡方式</h3>
  <div class="detail-content">
    <p class="detail-item">
      <span class="detail-label">電子郵件：</span>
      <a href="mailto:contact@yuntech.edu.tw" class="email-link">
        contact@yuntech.edu.tw
      </a>
    </p>
    <p class="detail-item">
      <span class="detail-label">電話：</span>
      05-534-2601
    </p>
  </div>
</div>
```

#### 4. 修改系統資訊

```vue
<!-- 系統資訊 -->
<div class="detail-block">
  <h3 class="detail-title">關於本系統</h3>
  <div class="detail-content">
    <p class="about-text">
      本系統為工程進度規劃與控制課程的學習輔助工具，
      提供 CPM 要徑法計算、甘特圖與 PDM 網圖視覺化功能。
    </p>
    <p class="version-text">
      版本：v1.2 | 最後更新：2025年10月
    </p>
  </div>
</div>
```

---

## 🎨 樣式調整指南

### 主要樣式變數

| 樣式項目 | CSS 選擇器 | 預設值 | 說明 |
|---------|-----------|--------|------|
| 標題大小 | `.contact-title` | 48px | Contact. 標題 |
| 標題字重 | `.contact-title` | 300 | 細字體 |
| 副標題大小 | `.contact-intro` | 15px | 說明文字 |
| 區塊標題 | `.detail-title` | 18px | 各區塊標題 |
| 內容文字 | `.detail-item` | 14px | 聯絡資訊 |
| 標籤寬度 | `.detail-label` | 80px | 標籤最小寬度 |
| 連結顏色 | `.email-link` | #667eea | 郵件連結 |
| 分隔線顏色 | `.detail-block` | #e8e8e8 | 區塊分隔線 |

### 修改範例

**增加標題大小：**
```css
.contact-title {
  font-size: 56px; /* 原本 48px */
}
```

**調整左右比例：**
```css
.contact-layout {
  grid-template-columns: 45% 55%; /* 左邊 45%，右邊 55% */
}
```

**增加右側內距：**
```css
.info-section {
  padding: 100px 80px; /* 原本 80px 60px */
}
```

---

## 📱 響應式行為

### 桌面版 (> 1024px)
- ✅ 左右 50-50 分欄
- ✅ 地圖高度自適應
- ✅ 標題 48px

### 平板版 (768px - 1024px)
- ✅ 改為上下排列
- ✅ 資訊在上，地圖在下
- ✅ 地圖高度 400px
- ✅ 標題 40px

### 手機版 (< 768px)
- ✅ 單欄垂直佈局
- ✅ 地圖高度 300px
- ✅ 標題 36px
- ✅ 標籤與內容垂直排列

---

## 🚀 快速測試

### 本地測試步驟

1. **啟動開發伺服器：**
   ```bash
   npm run dev
   ```

2. **訪問聯絡資訊頁面：**
   ```
   http://localhost:5173/contact
   ```

3. **檢查項目：**
   - ✅ 地圖是否正確顯示
   - ✅ 聯絡資訊文字是否正確
   - ✅ 郵件連結是否可點擊
   - ✅ 響應式佈局是否正常

---

## 🔗 相關文件

- **Google Maps Platform**: https://developers.google.com/maps
- **Google Maps Embed API**: https://developers.google.com/maps/documentation/embed
- **國立雲林科技大學**: https://www.yuntech.edu.tw

---

## ⚠️ 注意事項

### 地圖載入問題

如果地圖無法載入，可能的原因：

1. **網路連線問題**
   - 檢查網路是否正常
   - 確認防火牆沒有阻擋 Google Maps

2. **URL 格式錯誤**
   - 確認複製完整的 embed URL
   - URL 必須以 `https://www.google.com/maps/embed` 開頭

3. **隱私政策**
   - 某些地區可能無法存取 Google Maps
   - 可考慮使用其他地圖服務（如 OpenStreetMap）

### 效能優化

- ✅ 使用 `loading="lazy"` 延遲載入地圖
- ✅ 地圖只在頁面滾動到可視範圍才載入
- ✅ 減少初始頁面載入時間

---

**最後更新**：2025 年 10 月 25 日  
**文件版本**：v1.0  
**維護者**：工程進度規劃與控制課程解答工具開發團隊

