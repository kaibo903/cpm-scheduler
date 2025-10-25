# 🏗️ Basic Gantt Scheduler PRD v1.2
**（Minimal Input Version — 只輸入作業名稱、工期、前／後作業）**  
Author: 張凱博  
Date: 2025-10-25  
Version: v1.2  

---

## 一、產品概述（Product Overview）

本系統是一款輕量化的「**自動Bar Chart生成工具**」，  
設計理念為「**最少輸入，立即出圖**」。  
使用者僅需輸入三項欄位資料：

| 欄位 | 說明 | 範例 |
|------|------|------|
| 作業名稱（Task Name） | 工程或工作項目名稱 | 基礎開挖、結構施工 |
| 工期（Duration） | 所需工作天數 | 10 |
| 前置作業／後續作業（Predecessor / Successor） | 作業邏輯關聯 | 結構施工 → 外牆裝修 |

系統會自動進行：
- **依賴關係分析**（Predecessor ↔ Successor）  
- **要徑法（CPM）排程運算**  
- **自動生成Bar Chart**  
- **顯示專案總工期與要徑作業**

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
- 用戶能夠在3分鐘內建立基本Bar Chart
- 支援至少50個作業的專案
- 自動計算要徑
- 支援CSV/Excel匯入匯出

## 三、系統功能（Functional Requirements）

### 3.1 任務輸入模組（Task Input）
- 支援三欄輸入：`Task Name`、`Duration`、`Predecessor / Successor`
- 可任意使用「前置」或「後續」欄位，系統自動反推對應關係。
- 支援批次匯入（CSV / Excel）。
- 自動生成唯一 Task ID。

**進階依賴關係功能：**
- 支援四種依賴關係類型：
  - **FS (Finish-to-Start)**：前置作業完成後，後續作業才能開始（預設）
  - **SS (Start-to-Start)**：前置作業開始後，後續作業才能開始
  - **FF (Finish-to-Finish)**：前置作業完成後，後續作業才能完成
  - **SF (Start-to-Finish)**：前置作業開始後，後續作業才能完成
- 支援 **Lag 時間**：可設定正負天數的時間延遲或提前
- 支援 **編輯依賴關係**：可修改現有依賴關係的類型和 Lag 值
- 支援 **合併重複作業**：自動合併相同名稱的作業並整合所有依賴關係

**錯誤偵測：**
- 自動檢查循環依賴（A→B→A）。  
- 工期必須為正整數。  
- 自動忽略空白列。
- 驗證依賴關係的完整性與正確性。

### 3.2 排程模組（Scheduling Engine）

採用 **Critical Path Method (CPM)**，支援多種依賴型態（FS / SS / FF / SF）與 Lag 時間。

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
   - 若 TF = 0 → 標示為要徑

6. **要徑識別**：
   - 找出所有 TF = 0 的任務
   - 建立要徑連鎖
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
| Critical | 是否為要徑作業 | TF = 0 |
| Total Duration | 專案總工期 | max(所有結束任務的EF) |

### 3.3 CPM結果顯示模組（CPM Results Display）

**CPM計算結果表格：**
- 作業名稱、工期、依賴關係
- ES/EF/LS/LF 時間計算結果
- TF/FF 浮時分析
- 要徑標示（紅色高亮）

**表格設計規範（v1.2 更新）：**
- **標題樣式**：
  - "CPM 計算結果" 標題中的 "CPM" 採用細體（font-weight: 300）
  - 其他標題採用標準字重（font-weight: 500）
  - 統一字母間距（letter-spacing: 0.5px）
- **欄位配置**：
  - 作業名稱欄：較寬，單行顯示，超出部分省略
  - 工期欄：容納 3 位數字，數字靠右對齊
  - 要徑作業欄：窄欄位，僅顯示勾選標記
  - 前置/後續作業：多個依賴關係垂直堆疊顯示
- **視覺優化**：
  - 移除垂直格線，保持簡潔外觀
  - 緊湊的行距（padding: 8px 10px）
  - 起始/結束標籤與作業名稱同行顯示
  - 響應式字體大小（標題 11px，內容 12px）

**要徑視覺化：**
- 要徑任務連鎖顯示
- 專案總工期統計
- 要徑作業清單
- 浮時分析圖表

**錯誤處理與驗證：**
- 循環依賴偵測和提示
- 資料完整性檢查
- 計算結果驗證

### 3.4 Bar Chart繪製模組（Gantt Renderer）

- X軸：天數（以專案起始日為 Day 0）  
- Y軸：作業名稱  
- 條狀圖顯示工期長度  
- 要徑以粗框或紅框標示  
- 依賴關係箭頭連線
- 自動調整圖高以符合任務數量

**視覺化特色：**
- 要徑高亮顯示
- 浮時任務淡色顯示
- 時間軸標記
- 縮放和平移功能

**輸出格式：**
- 圖片：PNG、PDF  
- 表格：CSV、Excel  

### 3.5 匯入與匯出（Data I/O）
- 匯入：CSV 或 Excel，支援繁體中文欄位名稱。  
- 匯出：  
  - Bar Chart（PNG / PDF）  
  - CPM計算結果表（CSV / Excel）
  - 要徑報告（PDF）

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
- 支援50個作業的流暢操作
- 要徑計算 < 1秒
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
│   作業列表   ├───────────────────────────────────────────┤
│             │                                          │
│  - 地質調查  │             Bar Chart區域                    │
│  - 初步設計  │                                          │
│  - 結構設計  │                                          │
│  - 發包準備  │                                          │
│  - 開工動員  │                                          │
└─────────────┴───────────────────────────────────────────┘
```

### 5.2 主要元件

#### 5.2.1 輸入區域
- 作業名稱輸入框
- 工期輸入框（數字）
- 前置/後續作業選擇器
- 新增作業按鈕

#### 5.2.2 Bar Chart區域
- 時間軸（天數）
- 作業條狀圖
- 要徑高亮顯示
- 依賴關係連線

#### 5.2.3 控制面板
- 匯入/匯出按鈕
- 重設按鈕
- 要徑顯示切換

## 六、資料結構（Data Structure）

### 6.1 依賴關係資料結構（v1.2 新增）
```typescript
interface Dependency {
  taskId: string;                // 依賴任務ID
  type: 'FS' | 'SS' | 'FF' | 'SF';  // 依賴關係類型
  lag: number;                   // Lag 時間（天數，可為正負值）
}
```

### 6.2 作業資料結構
```typescript
interface CPMTask {
  id: string;                    // 唯一識別碼
  name: string;                  // 作業名稱
  duration: number;              // 工期（天數）
  predecessors: Dependency[];    // 前置作業（v1.2 更新為 Dependency 陣列）
  successors: Dependency[];      // 後續作業（v1.2 更新為 Dependency 陣列）
  
  // CPM 計算結果
  es?: number;                   // 最早開始時間 (Earliest Start)
  ef?: number;                   // 最早完成時間 (Earliest Finish)
  ls?: number;                   // 最晚開始時間 (Latest Start)
  lf?: number;                   // 最晚完成時間 (Latest Finish)
  tf?: number;                   // 總浮時 (Total Float)
  ff?: number;                   // 自由浮時 (Free Float)
  
  // 狀態標記
  isCritical?: boolean;          // 是否為要徑
  isStart?: boolean;             // 是否為起始節點
  isEnd?: boolean;               // 是否為結束節點
}
```

### 6.3 CPM計算結果資料結構
```typescript
interface CPMResult {
  tasks: CPMTask[];             // 作業列表（含CPM計算結果）
  criticalPath: string[];       // 要徑任務ID
  totalDuration: number;        // 專案總工期
  startTasks: string[];         // 起始任務ID
  endTasks: string[];           // 結束任務ID
  hasCycle: boolean;            // 是否存在循環依賴
}

interface Project {
  id: string;                   // 專案ID
  name: string;                 // 專案名稱
  tasks: CPMTask[];             // 作業列表
  cpmResult?: CPMResult;        // CPM計算結果
  createdAt: Date;              // 建立時間
  updatedAt: Date;              // 更新時間
}
```

## 七、開發時程（Development Timeline）

### 7.1 第一階段 (1週) - 核心功能
- [ ] 作業輸入介面
- [ ] CPM演算法核心實現
- [ ] Forward Pass / Backward Pass 計算
- [ ] 要徑識別
- [ ] 基本Bar Chart顯示

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
- [ ] 能夠輸入作業名稱、工期、前置/後續作業
- [ ] 自動執行CPM計算（Forward Pass + Backward Pass）
- [ ] 正確計算ES/EF/LS/LF/TF/FF
- [ ] 識別要徑並高亮顯示
- [ ] 顯示Bar Chart和依賴關係
- [ ] 支援CSV/Excel匯入匯出
- [ ] 循環依賴偵測和錯誤提示
- [ ] CPM結果表格顯示

### 8.2 效能驗收
- [ ] 頁面載入時間 < 2秒
- [ ] 支援50個作業的流暢操作
- [ ] 要徑計算 < 1秒
- [ ] 響應式設計正常運作

### 8.3 使用者體驗驗收
- [ ] 介面直觀易用
- [ ] 操作流程順暢
- [ ] 錯誤提示清晰
- [ ] 支援繁體中文

## 九、版本更新記錄（Version History）

### v1.2 更新內容 (2025-10-25)

#### 新增功能
1. **進階依賴關係系統**
   - ✅ 支援四種依賴關係類型（FS, SS, FF, SF）
   - ✅ 支援 Lag 時間設定（正負值）
   - ✅ 依賴關係編輯功能
   - ✅ 合併重複作業功能（含完整依賴關係整合）

2. **部署與 CI/CD**
   - ✅ GitHub Pages 部署設定
   - ✅ GitHub Actions 自動化工作流程
   - ✅ TypeScript 嚴格模式錯誤修復

#### UI/UX 改進
1. **輸入介面優化**
   - ✅ 增加 Lag 輸入欄位寬度（50px → 65px）
   - ✅ 工期欄位顯示優化（移除 "天" 後綴）
   - ✅ 依賴關係多行顯示（垂直堆疊）
   - ✅ 表格行距緊湊化（padding: 12px → 8px）
   - ✅ 作業名稱單行顯示（超出省略）

2. **結果表格優化**
   - ✅ CPM 標題細體化（font-weight: 300）
   - ✅ 統一標題字體樣式（letter-spacing: 0.5px）
   - ✅ 欄位寬度優化（作業名稱加寬、工期縮小）
   - ✅ 工期數字靠右對齊
   - ✅ 移除垂直格線
   - ✅ 起始/結束標籤同行顯示
   - ✅ 響應式字體大小調整

3. **視覺一致性**
   - ✅ 統一 "作業輸入" 與 "計算結果" 表格樣式
   - ✅ 一致的字體、行距、邊框設計
   - ✅ 簡潔清爽的表格外觀

#### 錯誤修復
1. **依賴關係處理**
   - ✅ 修復合併重複作業時依賴關係遺失的問題
   - ✅ 實現五階段合併演算法
   - ✅ 完整的依賴關係映射與去重

2. **TypeScript 類型安全**
   - ✅ 修復所有 strict mode 類型錯誤
   - ✅ 添加完整的類型守衛
   - ✅ undefined 值處理優化

3. **建置與部署**
   - ✅ 修復 d3 依賴缺失問題
   - ✅ 修復 vite.config.ts base path 設定
   - ✅ PowerShell 指令相容性修復

#### 技術改進
1. **程式碼品質**
   - ✅ 重構合併演算法（五階段處理）
   - ✅ 改進錯誤處理機制
   - ✅ 優化資料驗證邏輯

2. **文件更新**
   - ✅ 所有文件轉換為繁體中文
   - ✅ 更新 PRD 以反映新功能
   - ✅ 完善程式碼註解

---

**文件版本**: v1.2  
**建立日期**: 2025-10-24  
**最後更新**: 2025-10-25  
**作者**: 張凱博
