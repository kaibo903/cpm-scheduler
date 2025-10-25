# 📐 扁平化圖示設計指南

## 🎯 概述

本文件說明系統中所有扁平化圖示的設計與實作方式。所有圖示均使用純 CSS 繪製，無需外部圖片或字體檔案。

---

## 🎨 設計理念

### 核心特色
- ✅ **純 CSS 實現**：不依賴圖片或圖示字體
- ✅ **漸層背景**：使用現代化的漸層效果
- ✅ **陰影效果**：增加立體感與層次
- ✅ **響應式設計**：可輕鬆調整大小
- ✅ **無印風格**：符合整體網頁的極簡美學

### 設計規範
| 屬性 | 大圖示 | 小圖示 |
|------|--------|--------|
| 容器尺寸 | 60×60 px | 32×32 px |
| 圖示尺寸 | 50×50 px | 32×32 px |
| 圓角 | 4px | 3px |
| 陰影 | 0 4px 8px | 0 2px 4px |

---

## 📊 工具頁面圖示

### 1. 圖表圖示 (Chart Icon)

**用途**：進度規劃 (CPM) 工具

**視覺描述**：
- 紫色漸層背景 (#667eea → #764ba2)
- 兩條白色垂直條，模擬長條圖
- 柔和脈動動畫效果

**CSS 類別**：
- 大圖示：`.icon-chart`
- 小圖示：`.icon-chart-small`

**位置**：
- `src/views/ToolsView.vue`（工具選擇卡片）
- `src/views/PlanningView.vue`（頁面標題）

**程式碼示例**：
```html
<div class="tool-icon">
  <div class="icon-chart"></div>
</div>
```

**動畫效果**：
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

---

### 2. 扳手圖示 (Wrench Icon)

**用途**：未來工具佔位符

**視覺描述**：
- 灰色漸層背景 (#95a5a6 → #7f8c8d)
- 白色斜線代表扳手手柄
- 中央白色圓點代表螺絲孔

**CSS 類別**：`.icon-wrench`

**位置**：`src/views/ToolsView.vue`

**程式碼示例**：
```html
<div class="tool-icon">
  <div class="icon-wrench"></div>
</div>
```

---

## 📇 聯絡資訊頁面圖示

### 3. 學校圖示 (School Icon)

**用途**：開發單位資訊

**視覺描述**：
- 藍色漸層背景 (#3498db → #2980b9)
- 白色三角形代表屋頂
- 白色方形代表建築主體

**CSS 類別**：`.icon-school`

**位置**：`src/views/ContactView.vue`

**程式碼示例**：
```html
<div class="card-icon-page">
  <div class="icon-school"></div>
</div>
```

**技術細節**：
- 使用 `::before` 偽元素繪製建築主體
- 使用 `::after` 偽元素繪製三角形屋頂
- 使用 CSS `border` 技巧創建三角形

---

### 4. 地點圖示 (Location Icon)

**用途**：聯絡地址資訊

**視覺描述**：
- 紅色漸層背景 (#e74c3c → #c0392b)
- 白色水滴形狀（旋轉 45 度）
- 中央紅色圓點標記位置

**CSS 類別**：`.icon-location`

**位置**：`src/views/ContactView.vue`

**程式碼示例**：
```html
<div class="card-icon-page">
  <div class="icon-location"></div>
</div>
```

**技術細節**：
- 使用 `border-radius: 50% 50% 50% 0` 創建水滴形
- `transform: rotate(-45deg)` 旋轉至正確角度
- 中央圓點使用絕對定位

---

### 5. 郵件圖示 (Email Icon)

**用途**：電子郵件資訊

**視覺描述**：
- 綠色漸層背景 (#27ae60 → #229954)
- 白色矩形代表信封
- 白色三角形代表信封蓋

**CSS 類別**：`.icon-email`

**位置**：`src/views/ContactView.vue`

**程式碼示例**：
```html
<div class="card-icon-page">
  <div class="icon-email"></div>
</div>
```

**技術細節**：
- 使用 `::before` 偽元素繪製信封主體
- 使用 `::after` 偽元素繪製三角形信封蓋
- `filter: drop-shadow()` 添加陰影效果

---

## 🎨 顏色規範

### 主要色彩配置

| 圖示類型 | 主色 | 副色 | 用途 |
|---------|------|------|------|
| 圖表 | #667eea | #764ba2 | 進度規劃工具 |
| 扳手 | #95a5a6 | #7f8c8d | 未來工具 |
| 學校 | #3498db | #2980b9 | 開發單位 |
| 地點 | #e74c3c | #c0392b | 聯絡地址 |
| 郵件 | #27ae60 | #229954 | 電子郵件 |

### 陰影配置

所有圖示使用對應主色的 30% 透明度陰影：

```css
/* 範例：圖表圖示 */
box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
```

---

## 🔧 如何新增圖示

### 步驟 1：規劃設計

1. 確定圖示用途與視覺概念
2. 選擇合適的主色漸層
3. 簡化為基本幾何形狀（圓形、方形、三角形）

### 步驟 2：HTML 結構

```html
<div class="icon-container">
  <div class="icon-your-name"></div>
</div>
```

### 步驟 3：CSS 實現

```css
/* 🎨 你的圖示 */
.icon-your-name {
  width: 50px;
  height: 50px;
  position: relative;
  background: linear-gradient(135deg, #主色 0%, #副色 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(主色RGB, 0.3);
}

/* 使用偽元素繪製細節 */
.icon-your-name::before {
  content: '';
  /* 你的形狀樣式 */
}

.icon-your-name::after {
  content: '';
  /* 你的形狀樣式 */
}
```

### 步驟 4：測試與調整

- ✅ 檢查不同螢幕尺寸
- ✅ 確認與整體風格一致
- ✅ 測試 Hover 效果
- ✅ 確認無障礙性

---

## 📁 檔案位置

### 圖示定義位置

| 圖示 | 檔案位置 | CSS 類別 |
|------|---------|----------|
| 圖表（大） | `src/views/ToolsView.vue` | `.icon-chart` |
| 圖表（小） | `src/views/PlanningView.vue` | `.icon-chart-small` |
| 扳手 | `src/views/ToolsView.vue` | `.icon-wrench` |
| 學校 | `src/App.vue` | `.icon-school` |
| 地點 | `src/App.vue` | `.icon-location` |
| 郵件 | `src/App.vue` | `.icon-email` |

### 使用位置

| 圖示 | 頁面 | 組件 |
|------|------|------|
| 圖表 | 工具頁面、進度規劃頁面 | `ToolsView.vue`, `PlanningView.vue` |
| 扳手 | 工具頁面 | `ToolsView.vue` |
| 學校、地點、郵件 | 聯絡資訊頁面 | `ContactView.vue` |

---

## 🎯 最佳實踐

### DO ✅

1. **使用漸層背景**：增加現代感與深度
2. **保持簡單**：使用基本幾何形狀
3. **一致的尺寸**：大圖示 50×50px，小圖示 32×32px
4. **適度陰影**：增強立體感
5. **語意化命名**：如 `.icon-chart`, `.icon-email`

### DON'T ❌

1. **避免過於複雜**：不要使用超過 2-3 個元素
2. **避免不一致**：確保所有圖示風格統一
3. **避免過大檔案**：CSS 圖示已經很輕量
4. **避免硬編碼尺寸**：使用 CSS 變數便於維護
5. **避免無意義顏色**：選擇有語意的顏色搭配

---

## 🔄 維護紀錄

### v1.0 (2025-10-25)
- ✅ 將所有表情符號圖示改為扁平化 CSS 圖示
- ✅ 新增 5 種扁平化圖示設計
- ✅ 統一圖示尺寸與樣式規範
- ✅ 添加脈動動畫效果
- ✅ 完成響應式設計

---

## 📞 技術支援

如需新增或修改圖示，請參考：
- **設計規範**：本文件「設計規範」章節
- **程式碼範例**：本文件「如何新增圖示」章節
- **樣式定義**：對應的 `.vue` 檔案

---

**最後更新**：2025 年 10 月 25 日  
**文件版本**：v1.0  
**維護者**：工程進度規劃與控制課程解答工具開發團隊

