# CPM 計算邏輯修正說明

## 修正日期
2025-10-24

## 修正內容

### 1. Backward Pass（反向計算）混合約束處理

**問題描述：**
當一個任務有多個後續任務時，可能同時存在：
- LS 約束（來自 SS 或 SF 類型的依賴）
- LF 約束（來自 FS 或 FF 類型的依賴）

原有邏輯在處理混合約束時不夠準確。

**修正後的邏輯：**

```typescript
if (minLS !== Infinity && minLF !== Infinity) {
  // 同時有 LS 和 LF 約束
  const lfFromLS = minLS + task.duration  // 從 LS 約束推導的 LF
  const lsFromLF = minLF - task.duration  // 從 LF 約束推導的 LS
  
  // 判斷哪個約束更嚴格
  if (lfFromLS <= minLF) {
    // LS 約束更嚴格
    task.ls = minLS
    task.lf = lfFromLS
  } else {
    // LF 約束更嚴格
    task.lf = minLF
    task.ls = lsFromLF
  }
}
```

**關鍵點：**
- 必須確保 `LF = LS + duration`
- 選擇導致時間窗口更緊的約束

---

### 2. Free Float（自由浮時）計算修正

**問題描述：**
原有代碼僅考慮 FS 類型依賴，對 SS、FF、SF 類型的處理不正確。

**修正後的邏輯：**

```typescript
switch (succDep.type) {
  case 'FS':
    // predecessor.EF + lag ≤ successor.ES
    // 所以 predecessor.EF 最多可以延遲到 successor.ES - lag
    allowedFloat = succ.es - lag - task.ef
    break
    
  case 'SS':
    // predecessor.ES + lag ≤ successor.ES
    // 所以 predecessor.ES 最多可以延遲到 successor.ES - lag
    allowedFloat = succ.es - lag - task.es
    break
    
  case 'FF':
    // predecessor.EF + lag ≤ successor.EF
    // 所以 predecessor.EF 最多可以延遲到 successor.EF - lag
    allowedFloat = succ.ef - lag - task.ef
    break
    
  case 'SF':
    // predecessor.ES + lag ≤ successor.EF
    // 所以 predecessor.ES 最多可以延遲到 successor.EF - lag
    allowedFloat = succ.ef - lag - task.es
    break
}
```

**關鍵點：**
- FS 和 FF：約束 predecessor 的完成時間（EF）
- SS 和 SF：約束 predecessor 的開始時間（ES）

---

## 測試案例

### 案例 1：混合約束（SS + FS）

```
任務 A：工期 5 天
  後續1：B (SS Lag 0) → A.ES + 0 ≤ B.ES
  後續2：C (FS Lag 0) → A.EF + 0 ≤ C.ES

如果：
  B.LS = 10, B.ES = 10
  C.LS = 12, C.ES = 12

則 A 的約束：
  從 SS: A.LS ≤ B.LS - 0 = 10
  從 FS: A.LF ≤ C.LS - 0 = 12

計算：
  lfFromLS = 10 + 5 = 15
  lsFromLF = 12 - 5 = 7

由於 lfFromLS (15) > minLF (12)，LF 約束更嚴格：
  A.LS = 7
  A.LF = 12
```

### 案例 2：FF 類型的 Free Float

```
任務 A：工期 5 天，EF = 10
  後續：B (FF Lag 2)，B.EF = 15

計算 A 的 Free Float：
  FF = B.EF - lag - A.EF
     = 15 - 2 - 10
     = 3 天
     
含義：A 可以延遲最多 3 天完成（從第 10 天延遲到第 13 天），
      而不會影響 B 在第 15 天完成。
```

---

## 影響範圍

### 直接影響
1. **LS/LF 計算**：更準確地處理混合依賴類型的約束
2. **Free Float**：正確反映不同依賴類型的浮時
3. **關鍵路徑識別**：基於更準確的 Total Float (TF = LS - ES)

### 潛在改善
1. 混合使用 SS、SF、FS、FF 的複雜網路圖計算更準確
2. 浮時計算反映真實的排程靈活性
3. 資源優化決策基礎更可靠

---

## 驗證方法

### 手動驗證步驟
1. 建立包含混合依賴類型的測試案例
2. 手工計算預期的 ES、EF、LS、LF
3. 對比系統計算結果
4. 驗證 TF 和 FF 的合理性

### 自動化測試
建議新增單元測試覆蓋以下場景：
- 純 FS 網路（基準）
- 純 SS 網路
- 混合 SS + FS
- 混合 FF + FS
- 包含負 Lag 的情況

---

## 技術細節

### Backward Pass 的數學原理

對於任務 i：
- LS_i：最晚開始時間
- LF_i：最晚完成時間
- d_i：工期

約束關係：
1. **FS 類型** (i → j)：EF_i + lag ≤ ES_j
   - 反向：LF_i ≤ LS_j - lag

2. **SS 類型** (i → j)：ES_i + lag ≤ ES_j
   - 反向：LS_i ≤ LS_j - lag

3. **FF 類型** (i → j)：EF_i + lag ≤ EF_j
   - 反向：LF_i ≤ LF_j - lag

4. **SF 類型** (i → j)：ES_i + lag ≤ EF_j
   - 反向：LS_i ≤ LF_j - lag

關鍵約束：**LF_i = LS_i + d_i** 必須始終成立

當同時有多個約束時：
```
LS_i ≤ min(LS約束)
LF_i ≤ min(LF約束)
LF_i = LS_i + d_i  （必須滿足）
```

解決方案：
1. 計算 lfFromLS = min(LS約束) + d_i
2. 計算 lsFromLF = min(LF約束) - d_i
3. 如果 lfFromLS ≤ min(LF約束)，使用 LS 約束
4. 否則使用 LF 約束

---

## 修改檔案
- `src/utils/cpmEngine.ts`
  - `backwardPass()` 函式（第 214-308 行）
  - `calculateFloatAndCriticalPath()` 函式（第 310-382 行）

## 版本
- 修正前版本：v1.0
- 修正後版本：v1.1
