# 🎨 網頁樣式維護指南

## 📋 快速修改索引

本指南提供所有可修改的樣式參數，讓您輕鬆調整網頁外觀。

---

## 🎨 顏色修改速查表

### 主要配色

| 元素 | 檔案位置 | 類別名稱 | 屬性 | 目前顏色 | 說明 |
|------|---------|---------|------|---------|------|
| 網頁背景 | App.vue | `#app` | `background` | `#f5f5f5` | 整體淺灰背景 |
| 標題文字 | App.vue | `.app-header h1` | `color` | `#333` | 深灰色標題 |
| 副標題文字 | App.vue | `.subtitle` | `color` | `#999` | 淺灰色副標題 |
| 按鈕文字 | App.vue | `.btn-outline` | `color` | `#666` | 深灰色 |
| 按鈕邊框 | App.vue | `.btn-outline` | `border` | `#d0d0d0` | 淺灰色邊框 |

### 訊息提示顏色

| 類型 | 檔案位置 | 類別名稱 | 目前顏色 | 修改方式 |
|------|---------|---------|---------|---------|
| ✅ 成功訊息 | App.vue | `.message.success` | `#27ae60` (綠色) | 修改 `background` |
| ❌ 錯誤訊息 | App.vue | `.message.error` | `#e74c3c` (紅色) | 修改 `background` |
| ℹ️ 資訊訊息 | App.vue | `.message.info` | `#3498db` (藍色) | 修改 `background` |

### 甘特圖顏色

| 元素 | 檔案位置 | 類別名稱/屬性 | 目前顏色 | 說明 |
|------|---------|--------------|---------|------|
| 要徑作業 | GanttChart.vue | `.fill()` 函式 | `#d9534f` | 紅色作業條 |
| 非要徑作業 | GanttChart.vue | `.fill()` 函式 | `#5bc0de` | 藍色作業條 |
| 格線背景 | GanttChart.vue | `.attr('fill')` | `#ffffff` / `#f9f9f9` | 交替背景色 |
| 格線邊框 | GanttChart.vue | `.attr('stroke')` | `#e8e8e8` | 淺灰線條 |

---

## 📏 字體大小修改速查表

### 標題文字

| 元素 | 檔案位置 | 類別名稱 | 屬性 | 目前大小 | 修改方式 |
|------|---------|---------|------|---------|---------|
| 主標題 | App.vue | `.app-header h1` | `font-size` | `24px` | 改為 `28px` 更大 |
| 副標題 | App.vue | `.subtitle` | `font-size` | `14px` | 改為 `16px` 更大 |
| 按鈕文字 | App.vue | `.btn` | `font-size` | `13px` | 改為 `14px` 更大 |
| 分頁標籤 | App.vue | `.tab-button` | `font-size` | `15px` | 改為 `16px` 更大 |

### 甘特圖文字

| 元素 | 檔案位置 | 目前大小 | 說明 |
|------|---------|---------|------|
| 日期標籤 | GanttChart.vue | `12px` | X軸時間標籤 |
| 作業名稱 | GanttChart.vue | `13px` | Y軸任務名稱 |
| 工期標籤 | GanttChart.vue | `12px` | 作業條上的天數 |
| 圖例文字 | GanttChart.vue | `13px` | 圖例說明文字 |

---

## 📐 間距與尺寸修改速查表

### 版面間距

| 元素 | 檔案位置 | 類別名稱 | 屬性 | 目前值 | 說明 |
|------|---------|---------|------|--------|------|
| 內容上下間距 | App.vue | `.app-main` | `padding` | `40px 0` | 主內容區間距 |
| 左右欄間距 | App.vue | `.main-layout` | `gap` | `24px` | 左右分欄距離 |
| 工具列間距 | App.vue | `.toolbar` | `gap` | `12px` | 按鈕間距離 |
| 按鈕內距 | App.vue | `.btn` | `padding` | `8px 16px` | 按鈕大小 |

### 容器尺寸

| 元素 | 檔案位置 | 類別名稱 | 屬性 | 目前值 | 說明 |
|------|---------|---------|------|--------|------|
| 最大寬度 | App.vue | `.container` | `max-width` | `1400px` | 內容最大寬度 |
| 圖表高度 | App.vue | `.chart-panel` | `height` | `600px` | 圖表區域高度 |
| 訊息寬度 | App.vue | `.message` | `max-width` | `400px` | 提示訊息寬度 |

---

## 🎯 常見修改場景

### 場景 1：調整整體配色為深色主題

```css
/* App.vue */

/* 修改背景為深色 */
#app {
  background: #1a1a1a;  /* 從 #f5f5f5 改為深灰色 */
}

/* 修改標題文字為淺色 */
.app-header {
  background: #2c2c2c;  /* 從 #fff 改為深灰 */
  color: #ffffff;       /* 從 #333 改為白色 */
}

/* 修改按鈕樣式 */
.btn-outline {
  background: #2c2c2c;  /* 深灰背景 */
  color: #ffffff;       /* 白色文字 */
  border: 1px solid #444;  /* 深灰邊框 */
}
```

### 場景 2：放大所有文字（適合簡報）

```css
/* App.vue */

/* 標題放大 */
.app-header h1 {
  font-size: 32px;  /* 從 24px 改為 32px */
}

/* 副標題放大 */
.subtitle {
  font-size: 18px;  /* 從 14px 改為 18px */
}

/* 按鈕文字放大 */
.btn {
  font-size: 16px;  /* 從 13px 改為 16px */
  padding: 10px 20px;  /* 按鈕也要變大 */
}

/* 分頁標籤放大 */
.tab-button {
  font-size: 18px;  /* 從 15px 改為 18px */
  padding: 20px 28px;  /* 增加內距 */
}
```

### 場景 3：調整圖表區域更大

```css
/* App.vue */

/* 增加圖表高度 */
.chart-panel {
  height: 800px;  /* 從 600px 改為 800px */
}

/* 增加容器寬度 */
.container {
  max-width: 1600px;  /* 從 1400px 改為 1600px */
}
```

### 場景 4：修改成功訊息顏色

```css
/* App.vue */

/* 修改成功訊息為藍色 */
.message.success {
  background: #3498db;  /* 從綠色 #27ae60 改為藍色 */
}

/* 修改錯誤訊息為橘色 */
.message.error {
  background: #ff9800;  /* 從紅色 #e74c3c 改為橘色 */
}
```

### 場景 5：調整甘特圖顏色

```css
/* 在 GanttChart.vue 的 renderGantt() 函式中 */

/* 修改要徑作業顏色 */
.attr('fill', d => d.isCritical ? '#ff6b6b' : '#51cf66')
/* 從紅色 #d9534f 和藍色 #5bc0de 改為鮮紅 #ff6b6b 和綠色 #51cf66 */

/* 修改格線顏色 */
.attr('stroke', '#cccccc')  /* 從 #e8e8e8 改為 #cccccc（更明顯） */
```

---

## 📱 響應式設計修改

### 手機版斷點修改

```css
/* App.vue */

/* 目前手機版斷點是 768px */
@media (max-width: 768px) {
  /* ... */
}

/* 如果想改為平板大小（1024px），修改為： */
@media (max-width: 1024px) {
  /* ... */
}
```

### 平板版設計

```css
/* App.vue - 新增平板版樣式 */

/* 在 @media (max-width: 768px) 之前加入 */
@media (max-width: 1024px) {
  /* 📱 平板版設計（螢幕寬度 ≤ 1024px） */
  
  .app-header h1 {
    font-size: 22px;  /* 平板版標題大小 */
  }
  
  .container {
    padding: 0 20px;  /* 平板版內距 */
  }
  
  .main-layout {
    gap: 20px;  /* 平板版間距 */
  }
}
```

---

## ⚡ 動畫速度修改

### 過渡動畫

| 元素 | 檔案位置 | 屬性 | 目前值 | 修改建議 |
|------|---------|------|--------|---------|
| 按鈕 hover | App.vue | `transition` | `all 0.2s` | 改為 `0.3s` 更慢 |
| 分頁切換 | App.vue | `transition` | `all 0.3s` | 改為 `0.2s` 更快 |
| 訊息滑入 | App.vue | `animation` | `slideIn 0.3s` | 改為 `0.5s` 更慢 |

### 修改方式

```css
/* 讓所有動畫變慢 */
.btn {
  transition: all 0.4s;  /* 從 0.2s 改為 0.4s */
}

.tab-button {
  transition: all 0.5s;  /* 從 0.3s 改為 0.5s */
}

/* 讓訊息動畫更快 */
.message {
  animation: slideIn 0.2s ease-out;  /* 從 0.3s 改為 0.2s */
}
```

---

## 🎨 圓角與陰影修改

### 圓角大小

| 元素 | 檔案位置 | 屬性 | 目前值 | 說明 |
|------|---------|------|--------|------|
| 按鈕圓角 | App.vue | `border-radius` | `2px` | 無印風格小圓角 |
| 訊息圓角 | App.vue | `border-radius` | `8px` | 較圓的角落 |
| 工具列圓角 | App.vue | `border-radius` | `2px` | 小圓角 |

### 陰影效果

| 元素 | 檔案位置 | 屬性 | 目前值 | 說明 |
|------|---------|------|--------|------|
| 工具列陰影 | App.vue | `box-shadow` | `0 1px 3px rgba(0,0,0,0.08)` | 淡淡陰影 |
| 訊息陰影 | App.vue | `box-shadow` | `0 4px 12px rgba(0,0,0,0.15)` | 較深陰影 |
| Modal 陰影 | App.vue | `box-shadow` | `0 4px 16px rgba(0,0,0,0.2)` | 深陰影 |

### 修改範例

```css
/* 改為完全無圓角（方形設計） */
.btn, .toolbar, .chart-container {
  border-radius: 0;  /* 從 2px 改為 0 */
}

/* 改為大圓角（現代風格） */
.btn {
  border-radius: 8px;  /* 從 2px 改為 8px */
}

/* 移除所有陰影 */
.toolbar, .message, .modal {
  box-shadow: none;  /* 完全移除陰影 */
}

/* 加強陰影效果 */
.toolbar {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);  /* 更明顯的陰影 */
}
```

---

## 📝 快速修改檢查清單

### ✅ 顏色調整
- [ ] 背景顏色
- [ ] 文字顏色
- [ ] 按鈕顏色
- [ ] 訊息提示顏色
- [ ] 圖表配色

### ✅ 文字大小
- [ ] 標題大小
- [ ] 內文大小
- [ ] 按鈕文字大小
- [ ] 圖表文字大小

### ✅ 間距調整
- [ ] 版面間距
- [ ] 按鈕間距
- [ ] 內容內距
- [ ] 欄位間距

### ✅ 尺寸調整
- [ ] 容器寬度
- [ ] 圖表高度
- [ ] 按鈕大小
- [ ] 元件高度

### ✅ 視覺效果
- [ ] 圓角大小
- [ ] 陰影效果
- [ ] 動畫速度
- [ ] 過渡效果

---

## 🔧 進階修改技巧

### 技巧 1：使用 CSS 變數統一管理顏色

```css
/* 在 App.vue 的 <style> 開頭加入 */
:root {
  /* 🎨 主要顏色 */
  --primary-color: #333;
  --secondary-color: #666;
  --background-color: #f5f5f5;
  --border-color: #e8e8e8;
  
  /* 🎨 訊息顏色 */
  --success-color: #27ae60;
  --error-color: #e74c3c;
  --info-color: #3498db;
  
  /* 📏 尺寸 */
  --border-radius: 2px;
  --spacing-unit: 8px;
}

/* 然後在各處使用變數 */
.btn {
  color: var(--primary-color);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
}

.message.success {
  background: var(--success-color);
}
```

### 技巧 2：瀏覽器開發者工具即時預覽

1. 在瀏覽器按 `F12` 開啟開發者工具
2. 點選「Elements」或「元素」標籤
3. 在右側「Styles」面板直接修改 CSS
4. 看到滿意的效果後，再複製到程式碼中

### 技巧 3：建立樣式變體

```css
/* 建立不同的主題變體 */

/* 🌸 粉色主題 */
.theme-pink .btn-outline {
  border-color: #ff6b9d;
  color: #ff6b9d;
}

.theme-pink .btn-outline:hover {
  background: #ff6b9d;
  color: white;
}

/* 🌿 綠色主題 */
.theme-green .btn-outline {
  border-color: #51cf66;
  color: #51cf66;
}

.theme-green .btn-outline:hover {
  background: #51cf66;
  color: white;
}

/* 在 HTML 中使用 */
<div id="app" class="theme-pink">
  <!-- 內容 -->
</div>
```

---

## 📚 檔案對照表

| 檔案名稱 | 主要內容 | 可修改項目 |
|---------|---------|-----------|
| **App.vue** | 主應用程式樣式 | 標題、按鈕、訊息、版面配置 |
| **GanttChart.vue** | 甘特圖樣式 | 圖表顏色、格線、文字大小 |
| **PDMDiagram.vue** | PDM 網圖樣式 | 節點顏色、連線、文字 |
| **CPMResultTable.vue** | 結果表格樣式 | 表格顏色、間距、文字 |
| **TaskInput.vue** | 任務輸入樣式 | 表單樣式、按鈕、標籤 |

---

## 💡 溫馨提示

1. **修改前先備份**：複製一份原始檔案以防萬一
2. **逐步修改**：一次修改一個項目，測試後再繼續
3. **使用註解**：在修改處加上註解，方便日後追蹤
4. **保持一致性**：確保相同類型的元素使用相同的樣式
5. **測試響應式**：修改後在不同螢幕尺寸測試顯示效果

---

**最後更新：** 2025-10-25  
**維護者：** 開發團隊

