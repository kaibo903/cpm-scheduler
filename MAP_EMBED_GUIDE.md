# 🗺️ Google Maps 嵌入指南

## 📍 如何從短網址獲取精確的地圖嵌入代碼

您提供的 Google Maps 連結：[https://maps.app.goo.gl/wB48TiKRizTGesD99](https://maps.app.goo.gl/wB48TiKRizTGesD99)

### 方法一：直接從 Google Maps 獲取嵌入代碼（推薦）

這個方法可以確保地圖上有定位標誌。

#### 步驟 1：開啟連結
1. 點擊您的短網址：https://maps.app.goo.gl/wB48TiKRizTGesD99
2. 網頁會在瀏覽器中開啟 Google Maps

#### 步驟 2：獲取嵌入代碼
1. 在 Google Maps 頁面，點擊左側的 **「分享」** 按鈕
2. 選擇 **「嵌入地圖」** 分頁
3. 選擇地圖大小（建議選擇「大」或「自訂大小」）
4. 點擊 **「複製 HTML」**

#### 步驟 3：替換代碼
1. 打開 `src/views/ContactView.vue` 檔案
2. 找到第 7-16 行的 `<iframe>` 標籤
3. 將整個 `src="..."` 屬性中的 URL 替換為新複製的 URL

**範例：**
```vue
<iframe
  src="在此貼上您從 Google Maps 複製的嵌入 URL"
  width="100%"
  height="100%"
  style="border:0;"
  allowfullscreen
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  title="國立雲林科技大學工程五館位置">
</iframe>
```

---

## 🎯 確保地圖有定位標誌

### 方法一：使用 Place ID（最準確）

如果您知道確切的 Place ID，可以使用以下格式：

```html
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d...你的完整參數"
  ...>
</iframe>
```

這種格式會自動在地圖上顯示定位標誌。

### 方法二：使用地點名稱搜尋

```html
<iframe
  src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=國立雲林科技大學工程五館"
  ...>
</iframe>
```

**注意**：此方法需要 Google Maps API Key。

### 方法三：使用座標（簡單但可能無標誌）

```html
<iframe
  src="https://www.google.com/maps/embed?q=23.6795,120.5342"
  ...>
</iframe>
```

---

## 📋 完整操作步驟（圖文說明）

### 1️⃣ 開啟您的 Google Maps 連結

在瀏覽器中開啟：https://maps.app.goo.gl/wB48TiKRizTGesD99

### 2️⃣ 點擊「分享」按鈕

位置：通常在地圖左側資訊面板的底部

```
┌─────────────────────┐
│ 國立雲林科技大學     │
│ 工程五館            │
│                     │
│ 地址：...           │
│ 電話：...           │
│                     │
│ [導航] [分享] [儲存] │ ← 點這裡
└─────────────────────┘
```

### 3️⃣ 選擇「嵌入地圖」

```
┌─────────────────────┐
│ 分享               │
├─────────────────────┤
│ [傳送連結] [嵌入地圖] │ ← 選這個
├─────────────────────┤
│ <iframe src="...">  │
│                     │
│ ▼ 大               │
│                     │
│ [複製 HTML]         │ ← 點這裡複製
└─────────────────────┘
```

### 4️⃣ 更新程式碼

複製後，在 `src/views/ContactView.vue` 中只替換 `src` 屬性的內容：

```vue
<!-- 更新前 -->
<iframe
  src="舊的 URL"
  ...>
</iframe>

<!-- 更新後 -->
<iframe
  src="從 Google Maps 複製的新 URL"
  ...>
</iframe>
```

---

## ✅ 驗證步驟

更新後，請確認：

1. **地圖正確顯示**
   - 執行 `npm run dev`
   - 訪問 http://localhost:5173/contact
   - 確認地圖載入成功

2. **定位標誌顯示**
   - 地圖上應該有紅色的定位標誌（📍）
   - 標誌位置應該精確指向工程五館

3. **互動功能正常**
   - 可以縮放地圖
   - 可以拖曳移動
   - 點擊標誌會顯示地點資訊

4. **響應式顯示**
   - 在手機瀏覽器測試
   - 地圖應該正常顯示在上方

---

## 🔧 疑難排解

### 問題：地圖顯示空白

**可能原因：**
- 網路連線問題
- URL 格式錯誤
- 瀏覽器阻擋 iframe

**解決方法：**
1. 檢查網路連線
2. 確認 URL 完整複製
3. 清除瀏覽器快取並重新整理

### 問題：沒有定位標誌

**可能原因：**
- 使用了純座標嵌入方式
- 地點資訊不完整

**解決方法：**
1. 使用「方法一」從 Google Maps 直接獲取嵌入代碼
2. 確保在 Google Maps 上該地點有明確標記
3. 使用完整的 Place 嵌入格式

### 問題：定位位置不準確

**解決方法：**
1. 在 Google Maps 手動調整到正確位置
2. 確認是否選擇了正確的「工程五館」建築
3. 如果 Google Maps 上沒有精確標記，可以：
   - 建議新增地點
   - 使用街景確認位置
   - 手動標記座標

---

## 📞 目前設定

目前程式碼中已設定的地圖參數：

- **位置**：國立雲林科技大學工程五館
- **座標**：約 23.6795°N, 120.5342°E
- **縮放級別**：適中（顯示建築周圍環境）
- **語言**：繁體中文（zh-TW）

如需更精確的位置，請按照上述步驟重新獲取嵌入代碼。

---

## 🌐 相關連結

- **您的 Google Maps 短網址**：https://maps.app.goo.gl/wB48TiKRizTGesD99
- **Google Maps Embed API**：https://developers.google.com/maps/documentation/embed
- **國立雲林科技大學**：https://www.yuntech.edu.tw

---

**建議**：為了確保地圖上有明確的定位標誌，強烈建議使用「方法一」從 Google Maps 直接獲取嵌入代碼。這樣可以確保：

1. ✅ 定位標誌清晰可見
2. ✅ 位置精確無誤
3. ✅ 包含地點名稱與資訊
4. ✅ 點擊標誌可查看詳細資訊

---

**最後更新**：2025 年 10 月 25 日  
**相關檔案**：`src/views/ContactView.vue`

