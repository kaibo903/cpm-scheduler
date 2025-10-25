# 🌐 語言切換功能實作指南

## ✅ 已完成

### 1. 核心系統
- ✅ `src/composables/useLanguage.ts` - 語言管理 Composable
- ✅ `src/locales/types.ts` - 類型定義
- ✅ `src/locales/zh-TW.ts` - 繁體中文翻譯
- ✅ `src/locales/en-US.ts` - 英文翻譯
- ✅ `src/App.vue` - 語言切換器 UI + 翻譯應用

### 2. 功能特性
- 🌐 支援繁體中文 / 英文切換
- 💾 自動儲存語言偏好到 localStorage
- 🔄 點擊切換按鈕即可切換語言
- 🎨 簡潔的語言切換器 UI（地球圖標 + 語言文字）

### 3. 已翻譯區域
- ✅ App.vue (標題、導航、頁尾)

---

## 🚧 待完成頁面

以下頁面需要更新以支援多語言：

### 1. HomeView.vue
- Hero 區域
- 功能特色卡片
- 關於系統區塊

### 2. ToolsView.vue
- 頁面標題
- 工具卡片描述

### 3. PlanningView.vue
- 頁面標題與按鈕
- 表單標籤
- 訊息提示

### 4. ContactView.vue
- 聯絡資訊標題
- 聯絡方式標籤

### 5. CPMResultTable.vue
- 表格標題
- 欄位名稱

### 6. GanttChart.vue
- 按鈕文字
- 圖例文字

### 7. PDMDiagram.vue
- 模式切換按鈕

---

## 🎨 語言切換器 UI

```
導航列：  首頁 | 工具 | 聯絡資訊 | [🌐 EN]
                                    ^^^^^^^^
                                    語言切換器
```

### 顯示邏輯
- 當前為中文時：顯示 `🌐 EN` (點擊切換為英文)
- 當前為英文時：顯示 `🌐 中文` (點擊切換為中文)

### 樣式
- 淺灰背景 (#f5f5f5)
- 圓角按鈕 (4px)
- Hover 效果：背景變深、邊框變深

---

## 📝 使用方式

### 在組件中使用翻譯

```vue
<script setup lang="ts">
import { useLanguage } from '@/composables/useLanguage'

const { t, isEnglish } = useLanguage()
</script>

<template>
  <h1>{{ t.home.heroTitle }}</h1>
  <p>{{ t.home.heroDescription }}</p>
</template>
```

### 新增翻譯文本

1. 在 `src/locales/types.ts` 定義類型
2. 在 `src/locales/zh-TW.ts` 新增繁中文本
3. 在 `src/locales/en-US.ts` 新增英文文本

---

## 🔧 API 說明

### useLanguage()

```typescript
const {
  t,              // 當前語言的翻譯物件
  locale,         // 當前語言代碼 ('zh-TW' | 'en-US')
  setLanguage,    // 設定語言
  toggleLanguage, // 切換語言
  isEnglish,      // 是否為英文
  isZhTW,         // 是否為繁中
  initLanguage    // 初始化語言（從 localStorage 讀取）
} = useLanguage()
```

---

## 🚀 測試步驟

```bash
npm run dev
```

### 測試項目

1. **基本切換**
   - [  ] 點擊語言切換器
   - [  ] 標題、導航、頁尾文字改變
   - [  ] 切換器按鈕文字改變

2. **持久化**
   - [  ] 切換語言後重新整理頁面
   - [  ] 語言設定保持不變

3. **響應式**
   - [  ] 手機版語言切換器正常顯示
   - [  ] 不同螢幕尺寸下運作正常

---

## 💡 下一步

繼續更新其他頁面和組件以支援多語言。

---

**版本：** v1.2  
**最後更新：** 2025年10月

