# 🏗️ Basic Gantt Scheduler PRD v1.1
**（Minimal Input Version — 只輸入工項名稱、工期、前／後作業）**  
Author: 張凱博  
Date: 2025-10-24  
Version: v1.1  

---

## 一、產品概述（Product Overview）

本系統是一款輕量化的「**自動甘特圖生成工具**」，  
設計理念為「**最少輸入，立即出圖**」。  
使用者僅需輸入三項欄位資料：

| 欄位 | 說明 | 範例 |
|------|------|------|
| 工項名稱（Task Name） | 工程或工作項目名稱 | 基礎開挖、結構施工 |
| 工期（Duration） | 所需工作天數 | 10 |
| 前置作業／後續作業（Predecessor / Successor） | 工項邏輯關聯 | 結構施工 → 外牆裝修 |

系統會自動進行：
- **依賴關係分析**（Predecessor ↔ Successor）  
- **關鍵路徑法（CPM）排程運算**  
- **自動生成甘特圖**  
- **顯示專案總工期與關鍵工項**

### 1.1 目標用戶
- 營建管理學生
- 顧問工程師
- 地主／更新戶
- 營建專案經理
- 工程師

## 二、設計理念與使用場景（Design Concept）

### 🎯 核心理念
- 「**以最小輸入產出最大清晰度**」  
- 無需輸入日期，僅靠邏輯關係與工期自動排程。  
- 適合教育、顧問簡報與早期規劃階段使用。

### 🧱 使用場景
| 使用者 | 目的 |
|---------|------|
| 營建管理學生 | 繪製課堂進度圖、專題作業展示 |
| 顧問工程師 | 快速向業主呈現施工邏輯 |
| 地主／更新戶 | 理解施工全期結構與時程關聯 |

### 2.1 成功指標
- 用戶能夠在3分鐘內建立基本甘特圖
- 支援至少50個工項的專案
- 自動計算關鍵路徑
- 支援CSV/Excel匯入匯出

## 三、系統功能（Functional Requirements）

### 3.1 任務輸入模組（Task Input）
- 支援三欄輸入：`Task Name`、`Duration`、`Predecessor / Successor`
- 可任意使用「前置」或「後續」欄位，系統自動反推對應關係。
- 支援批次匯入（CSV / Excel）。
- 自動生成唯一 Task ID。

**錯誤偵測：**
- 自動檢查循環依賴（A→B→A）。  
- 工期必須為正整數。  
- 自動忽略空白列。

### 3.2 排程模組（Scheduling Engine）

採用 **Critical Path Method (CPM)**，假設依賴型態為 FS（Finish-to-Start）。

**演算法步驟：**
1. **依賴關係驗證**：
   - 檢查循環依賴（A→B→A）
   - 驗證任務資料完整性
   - 建立雙向依賴圖

2. **拓樸排序**：
   - 使用 Kahn's Algorithm
   - 確保任務執行順序正確
   - 識別起始和結束任務

3. **Forward Pass（前向計算）**：
   - ES = max(EF of predecessors)  
   - EF = ES + Duration  
   - 計算最早開始/完成時間

4. **Backward Pass（後向計算）**：
   - LF = min(LS of successors)  
   - LS = LF - Duration  
   - 計算最晚開始/完成時間

5. **浮時計算**：
   - TF = LS - ES（總浮時）
   - FF = min(ES of successors) - EF（自由浮時）
   - 若 TF = 0 → 標示為關鍵路徑

6. **關鍵路徑識別**：
   - 找出所有 TF = 0 的任務
   - 建立關鍵路徑連鎖
   - 計算專案總工期

**輸出結果欄位：**
| 欄位 | 說明 | 計算公式 |
|------|------|----------|
| ES | 最早開始時間 | max(前置任務的EF) |
| EF | 最早完成時間 | ES + Duration |
| LS | 最晚開始時間 | LF - Duration |
| LF | 最晚完成時間 | min(後續任務的LS) |
| TF | 總浮時 | LS - ES |
| FF | 自由浮時 | min(後續任務的ES) - EF |
| Critical | 是否為關鍵工項 | TF = 0 |
| Total Duration | 專案總工期 | max(所有結束任務的EF) |

### 3.3 CPM結果顯示模組（CPM Results Display）

**CPM計算結果表格：**
- 工項名稱、工期、依賴關係
- ES/EF/LS/LF 時間計算結果
- TF/FF 浮時分析
- 關鍵路徑標示（紅色高亮）

**關鍵路徑視覺化：**
- 關鍵路徑任務連鎖顯示
- 專案總工期統計
- 關鍵工項清單
- 浮時分析圖表

**錯誤處理與驗證：**
- 循環依賴偵測和提示
- 資料完整性檢查
- 計算結果驗證

### 3.4 甘特圖繪製模組（Gantt Renderer）

- X軸：天數（以專案起始日為 Day 0）  
- Y軸：工項名稱  
- 條狀圖顯示工期長度  
- 關鍵路徑以粗框或紅框標示  
- 依賴關係箭頭連線
- 自動調整圖高以符合任務數量

**視覺化特色：**
- 關鍵路徑高亮顯示
- 浮時任務淡色顯示
- 時間軸標記
- 縮放和平移功能

**輸出格式：**
- 圖片：PNG、PDF  
- 表格：CSV、Excel  

### 3.5 匯入與匯出（Data I/O）
- 匯入：CSV 或 Excel，支援繁體中文欄位名稱。  
- 匯出：  
  - 甘特圖（PNG / PDF）  
  - CPM計算結果表（CSV / Excel）
  - 關鍵路徑報告（PDF）

**範例輸入檔：**
```csv
TaskName,Duration,Predecessor,Successor
地質調查,5,,初步設計
初步設計,10,地質調查,結構設計
結構設計,15,初步設計,發包準備
發包準備,7,結構設計,開工動員
開工動員,3,發包準備,
```

**範例輸出檔（CPM結果）：**
```csv
TaskName,Duration,ES,EF,LS,LF,TF,FF,Critical
地質調查,5,0,5,0,5,0,0,TRUE
初步設計,10,5,15,5,15,0,0,TRUE
結構設計,15,15,30,15,30,0,0,TRUE
發包準備,7,30,37,30,37,0,0,TRUE
開工動員,3,37,40,37,40,0,0,TRUE
```

## 四、技術需求（Technical Requirements）

### 4.1 技術架構
- **前端框架**: Vue 3 + TypeScript
- **視覺化庫**: D3.js
- **日期處理**: date-fns
- **建構工具**: Vite
- **樣式**: CSS3 + SCSS

### 4.2 效能需求
- 頁面載入時間 < 2秒
- 支援50個工項的流暢操作
- 關鍵路徑計算 < 1秒
- 響應式設計，支援各種螢幕尺寸

### 4.3 瀏覽器支援
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 五、使用者介面設計（UI Design）

### 5.1 整體佈局
```
┌─────────────────────────────────────────────────────────┐
│                    標題列                                │
├─────────────┬───────────────────────────────────────────┤
│             │              時間軸標題                    │
│   工項列表   ├───────────────────────────────────────────┤
│             │                                          │
│  - 地質調查  │             甘特圖區域                    │
│  - 初步設計  │                                          │
│  - 結構設計  │                                          │
│  - 發包準備  │                                          │
│  - 開工動員  │                                          │
└─────────────┴───────────────────────────────────────────┘
```

### 5.2 主要元件

#### 5.2.1 輸入區域
- 工項名稱輸入框
- 工期輸入框（數字）
- 前置/後續作業選擇器
- 新增工項按鈕

#### 5.2.2 甘特圖區域
- 時間軸（天數）
- 工項條狀圖
- 關鍵路徑高亮顯示
- 依賴關係連線

#### 5.2.3 控制面板
- 匯入/匯出按鈕
- 重設按鈕
- 關鍵路徑顯示切換

## 六、資料結構（Data Structure）

### 6.1 工項資料結構
```typescript
interface CPMTask {
  id: string;                    // 唯一識別碼
  name: string;                  // 工項名稱
  duration: number;              // 工期（天數）
  predecessors: string[];        // 前置工項ID
  successors: string[];          // 後續工項ID
  
  // CPM 計算結果
  es?: number;                   // 最早開始時間 (Earliest Start)
  ef?: number;                   // 最早完成時間 (Earliest Finish)
  ls?: number;                   // 最晚開始時間 (Latest Start)
  lf?: number;                   // 最晚完成時間 (Latest Finish)
  tf?: number;                   // 總浮時 (Total Float)
  ff?: number;                   // 自由浮時 (Free Float)
  
  // 狀態標記
  isCritical?: boolean;          // 是否為關鍵路徑
  isStart?: boolean;             // 是否為起始節點
  isEnd?: boolean;               // 是否為結束節點
}
```

### 6.2 CPM計算結果資料結構
```typescript
interface CPMResult {
  tasks: CPMTask[];             // 工項列表（含CPM計算結果）
  criticalPath: string[];       // 關鍵路徑任務ID
  totalDuration: number;        // 專案總工期
  startTasks: string[];         // 起始任務ID
  endTasks: string[];           // 結束任務ID
  hasCycle: boolean;            // 是否存在循環依賴
}

interface Project {
  id: string;                   // 專案ID
  name: string;                 // 專案名稱
  tasks: CPMTask[];             // 工項列表
  cpmResult?: CPMResult;        // CPM計算結果
  createdAt: Date;              // 建立時間
  updatedAt: Date;              // 更新時間
}
```

## 七、開發時程（Development Timeline）

### 7.1 第一階段 (1週) - 核心功能
- [ ] 工項輸入介面
- [ ] CPM演算法核心實現
- [ ] Forward Pass / Backward Pass 計算
- [ ] 關鍵路徑識別
- [ ] 基本甘特圖顯示

### 7.2 第二階段 (1週) - 進階功能
- [ ] CPM結果表格顯示
- [ ] 依賴關係視覺化
- [ ] 循環依賴偵測
- [ ] 資料匯入/匯出
- [ ] 錯誤處理和驗證

### 7.3 第三階段 (0.5週) - 測試與優化
- [ ] CPM計算準確性測試
- [ ] 使用者介面優化
- [ ] 效能優化
- [ ] 文件撰寫
- [ ] 部署準備

## 八、驗收標準（Acceptance Criteria）

### 8.1 功能驗收
- [ ] 能夠輸入工項名稱、工期、前置/後續作業
- [ ] 自動執行CPM計算（Forward Pass + Backward Pass）
- [ ] 正確計算ES/EF/LS/LF/TF/FF
- [ ] 識別關鍵路徑並高亮顯示
- [ ] 顯示甘特圖和依賴關係
- [ ] 支援CSV/Excel匯入匯出
- [ ] 循環依賴偵測和錯誤提示
- [ ] CPM結果表格顯示

### 8.2 效能驗收
- [ ] 頁面載入時間 < 2秒
- [ ] 支援50個工項的流暢操作
- [ ] 關鍵路徑計算 < 1秒
- [ ] 響應式設計正常運作

### 8.3 使用者體驗驗收
- [ ] 介面直觀易用
- [ ] 操作流程順暢
- [ ] 錯誤提示清晰
- [ ] 支援繁體中文



---

**文件版本**: v1.1  
**建立日期**: 2025-10-24  
**最後更新**: 2025-10-24  
**作者**: 張凱博
