# 工期–成本權衡最佳化工具 PRD  
(Time–Cost Tradeoff Optimizer, TCT)

---

## 0. 摘要（Executive Summary）
本工具是一個可公開上線的 **營建管理最佳化服務**：  
使用者上傳或輸入活動清單、前置關係與成本參數後，  
系統執行 **工期–成本權衡（TCT）** 最佳化，  
輸出最佳趕工組合、專案總工期、總成本與可視化圖表（甘特圖 / 成本–工期曲線）。  

**MVP 目標：**  
以線性規劃（LP）完成連續趕工模型，  
使用者在網頁端輸入資料後 10 秒內即可獲得最佳結果。

---

## 1. 背景與問題敘述
營建專案中，縮短工期可降低「按天計」的間接成本（管理、人員、場租等），  
但會增加趕工成本。專案經理需要一個自動化工具，在遵守前置與限制條件下，  
找出最划算的趕工策略。

---

## 2. 產品目標（Goals）
1. 提供使用者最少欄位輸入即可獲得最佳趕工策略。  
2. 輸出臨界徑路、成本分解、靈敏度分析。  
3. 可嵌入網站作為互動式工具（表單 / CSV 上傳 → 一鍵求解）。  
4. 支援 200–500 個活動的穩定求解。

**非目標（Non-Goals）**
- 不處理多專案、多資源平衡。  
- 不含離散模式（Normal/Crash Multi-Mode）—將於 V2 實作。

---

## 3. 使用者與情境
- **使用者**：營建專案經理、工地主任、造價/計畫工程師、學生。  
- **情境**：啟動或變更階段，快速分析「花多少錢能縮短多少天」。

---

## 4. 功能需求（Functional Requirements）

### 4.1 輸入方式
- 表單手動輸入。  
- CSV/Excel 上傳：  
  - `activities.csv`: `id, name, duration_normal, duration_min, crash_cost_per_day`  
  - `precedences.csv`: `pred, succ`  
- 專案參數：`overhead_cost_per_day`、（選填）`deadline`、`budget`

### 4.2 求解邏輯
- 模型類型：連續趕工線性規劃（LP）  
- 求解器：Pyomo + HiGHS/CBC/GLPK  
- 驗證：DAG 結構檢查（無循環）、欄位完整性

### 4.3 輸出內容
- 最佳總工期 `T*`  
- 最低總成本 `C*`（含趕工成本、間接成本）  
- 各活動開工時間、實際工期、趕工天數  
- 臨界徑路  
- 甘特圖與成本–工期曲線  
- What-if 靈敏度分析

---

## 5. 非功能需求（NFR）
- **效能**：500 活動內求解 <10 秒  
- **穩定性**：出錯回傳清晰錯誤訊息  
- **安全性**：檔案暫存 24 小時自動刪除  
- **維護性**：模組化前後端架構（FastAPI + React）

---

## 6. 模型定義（Mathematical Model）

### 決策變數
- \(S_i\)：活動開工時間  
- \(d_i\)：活動實際工期  
- \(y_i\)：活動趕工天數  
- \(T\)：專案完工時間

### 目標函數
\[
\min \sum_i (c_i^{crash} \cdot y_i) + c^{oh} \cdot T
\]

### 限制式
\[
\begin{aligned}
d_i &= d_i^{norm} - y_i \\
0 &\le y_i \le d_i^{norm} - d_i^{min} \\
S_j &\ge S_i + d_i \quad \forall (i \to j) \\
T &\ge S_i + d_i \quad \forall i
\end{aligned}
\]

可加：
\[
T \le deadline,\quad \sum_i (c_i^{crash}y_i) + c^{oh}T \le budget
\]

---

## 7. API 規格

### 7.1 Request
`POST /api/tct/solve`
```json
{
  "activities": [
    {"id": "A", "duration_normal": 6, "duration_min": 4, "crash_cost_per_day": 30000},
    {"id": "B", "duration_normal": 8, "duration_min": 5, "crash_cost_per_day": 25000},
    {"id": "C", "duration_normal": 7, "duration_min": 5, "crash_cost_per_day": 20000}
  ],
  "precedences": [{"pred": "A", "succ": "B"}, {"pred": "A", "succ": "C"}],
  "overhead_cost_per_day": 40000
}