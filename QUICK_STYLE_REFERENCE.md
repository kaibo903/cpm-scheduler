# ⚡ 樣式快速參考卡

> 快速找到最常修改的樣式參數

---

## 🎨 顏色修改（5 秒查找）

### 主要顏色

```css
/* 📍 App.vue */

/* 背景顏色 */
#app { background: #f5f5f5; }

/* 標題顏色 */
.app-header h1 { color: #333; }

/* 按鈕顏色 */
.btn-outline { 
  color: #666; 
  border: 1px solid #d0d0d0; 
}

/* 成功訊息 */
.message.success { background: #27ae60; }

/* 錯誤訊息 */
.message.error { background: #e74c3c; }
```

---

## 📏 文字大小（5 秒查找）

```css
/* 📍 App.vue */

/* 主標題 */
.app-header h1 { font-size: 24px; }

/* 副標題 */
.subtitle { font-size: 14px; }

/* 按鈕文字 */
.btn { font-size: 13px; }

/* 分頁標籤 */
.tab-button { font-size: 15px; }
```

---

## 📐 間距與大小（5 秒查找）

```css
/* 📍 App.vue */

/* 容器最大寬度 */
.container { max-width: 1400px; }

/* 圖表高度 */
.chart-panel { height: 600px; }

/* 按鈕內距 */
.btn { padding: 8px 16px; }

/* 左右欄間距 */
.main-layout { gap: 24px; }
```

---

## 🚀 常用修改速查

### 讓標題更大
```css
.app-header h1 { font-size: 32px; }  /* 從 24px 改為 32px */
```

### 讓按鈕變藍色
```css
.btn-outline { 
  color: #3498db;           /* 藍色文字 */
  border-color: #3498db;    /* 藍色邊框 */
}
.btn-outline:hover { 
  background: #3498db;      /* 藍色背景 */
}
```

### 讓圖表更高
```css
.chart-panel { height: 800px; }  /* 從 600px 改為 800px */
```

### 改深色背景
```css
#app { background: #2c2c2c; }  /* 從 #f5f5f5 改為深灰 */
```

### 讓成功訊息變藍色
```css
.message.success { background: #3498db; }  /* 從綠色改為藍色 */
```

---

## 🎯 一句話指南

| 想改什麼 | 去哪裡改 | 改什麼 |
|---------|---------|--------|
| **標題大小** | App.vue → `.app-header h1` | `font-size: 24px` |
| **標題顏色** | App.vue → `.app-header h1` | `color: #333` |
| **背景顏色** | App.vue → `#app` | `background: #f5f5f5` |
| **按鈕顏色** | App.vue → `.btn-outline` | `color: #666` |
| **按鈕大小** | App.vue → `.btn` | `padding: 8px 16px` |
| **圖表高度** | App.vue → `.chart-panel` | `height: 600px` |
| **容器寬度** | App.vue → `.container` | `max-width: 1400px` |
| **成功訊息** | App.vue → `.message.success` | `background: #27ae60` |
| **錯誤訊息** | App.vue → `.message.error` | `background: #e74c3c` |
| **分頁文字** | App.vue → `.tab-button` | `font-size: 15px` |

---

## 💬 用 Cursor AI 改樣式

直接對 Cursor 說：

```
「請把標題改成 32px」
「請把按鈕改成藍色」
「請把圖表高度改成 800px」
「請把成功訊息改成藍色」
「請把背景改成深色」
```

Cursor 會自動幫你修改！

---

## 📚 詳細說明請看

- **完整註解：** 打開 `src/App.vue` 查看 `<style>` 區塊
- **維護指南：** 參考 `STYLE_MAINTENANCE_GUIDE.md`
- **完成報告：** 參考 `STYLE_COMMENTS_SUMMARY.md`

---

**💡 小技巧：** 在瀏覽器按 `F12` 可以即時預覽修改效果！

