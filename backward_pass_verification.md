# Backward Pass Lag 處理詳細驗證

## 關鍵概念複習

### 正向約束（Forward Pass）
在正向計算中，我們使用**最早時間**（ES, EF）：
- ES: 最早開始時間（Earliest Start）
- EF: 最早完成時間（Earliest Finish）
- EF = ES + duration

### 反向約束（Backward Pass）
在反向計算中，我們使用**最晚時間**（LS, LF）：
- LS: 最晚開始時間（Latest Start）
- LF: 最晚完成時間（Latest Finish）
- LF = LS + duration

---

## 詳細驗證每種依賴類型

### 1. FS (Finish-to-Start)

**正向約束：**
```
predecessor.EF + lag ≤ successor.ES
```

**反向推導：**
```
在要徑上，約束是緊的（等式）：
  predecessor.EF + lag = successor.ES

對於最晚時間：
  predecessor.LF + lag ≤ successor.LS
  predecessor.LF ≤ successor.LS - lag
```

**當前代碼：**
```typescript
case 'FS':
  return { lf: (succTask.ls || 0) - lag }
```

**驗證：** ✅ 正確
- 使用 `succTask.ls`（後續任務的最晚開始時間）
- 減去 `lag`
- 返回 `lf` 約束（約束前置任務的最晚完成時間）

---

### 2. SS (Start-to-Start)

**正向約束：**
```
predecessor.ES + lag ≤ successor.ES
```

**反向推導：**
```
在要徑上：
  predecessor.ES + lag = successor.ES

對於最晚時間：
  predecessor.LS + lag ≤ successor.LS
  predecessor.LS ≤ successor.LS - lag
```

**當前代碼：**
```typescript
case 'SS':
  return { ls: (succTask.ls || 0) - lag }
```

**驗證：** ✅ 正確
- 使用 `succTask.ls`（後續任務的最晚開始時間）
- 減去 `lag`
- 返回 `ls` 約束（約束前置任務的最晚開始時間）

---

### 3. FF (Finish-to-Finish)

**正向約束：**
```
predecessor.EF + lag ≤ successor.EF
```

**反向推導：**
```
在要徑上：
  predecessor.EF + lag = successor.EF

對於最晚時間：
  predecessor.LF + lag ≤ successor.LF
  predecessor.LF ≤ successor.LF - lag
```

**當前代碼：**
```typescript
case 'FF':
  return { lf: (succTask.lf || 0) - lag }
```

**驗證：** ✅ 正確
- 使用 `succTask.lf`（後續任務的最晚完成時間）
- 減去 `lag`
- 返回 `lf` 約束（約束前置任務的最晚完成時間）

---

### 4. SF (Start-to-Finish)

**正向約束：**
```
predecessor.ES + lag ≤ successor.EF
```

**反向推導：**
```
在要徑上：
  predecessor.ES + lag = successor.EF

對於最晚時間：
  predecessor.LS + lag ≤ successor.LF
  predecessor.LS ≤ successor.LF - lag
```

**當前代碼：**
```typescript
case 'SF':
  return { ls: (succTask.lf || 0) - lag }
```

**驗證：** ✅ 正確
- 使用 `succTask.lf`（後續任務的最晚完成時間）
- 減去 `lag`
- 返回 `ls` 約束（約束前置任務的最晚開始時間）

---

## 總結表

| 類型 | 正向約束 | 反向約束 | 使用的後續時間 | 約束的前置時間 | 代碼 |
|------|----------|----------|----------------|----------------|------|
| FS | pred.EF + lag ≤ succ.ES | pred.LF ≤ succ.LS - lag | succ.LS | pred.LF | ✅ |
| SS | pred.ES + lag ≤ succ.ES | pred.LS ≤ succ.LS - lag | succ.LS | pred.LS | ✅ |
| FF | pred.EF + lag ≤ succ.EF | pred.LF ≤ succ.LF - lag | succ.LF | pred.LF | ✅ |
| SF | pred.ES + lag ≤ succ.EF | pred.LS ≤ succ.LF - lag | succ.LF | pred.LS | ✅ |

---

## 邊界情況測試

### 情況 1：正 Lag
```
A --FS Lag+5--> B
B.LS = 20

計算：
  A.LF ≤ 20 - 5 = 15 ✓
  
含義：A 最晚在第15天完成，加上5天 lag，不會延遲 B 在第20天開始
```

### 情況 2：負 Lag
```
A --FS Lag-3--> B
B.LS = 20

計算：
  A.LF ≤ 20 - (-3) = 23 ✓
  
含義：A 最晚在第23天完成，減去3天 lag（即 B 可以提前3天開始），
      不會延遲 B 在第20天開始
```

### 情況 3：零 Lag
```
A --FS Lag0--> B
B.LS = 20

計算：
  A.LF ≤ 20 - 0 = 20 ✓
  
含義：A 最晚在第20天完成，B 正好在第20天開始
```

---

## 結論

**所有依賴類型的 Lag 處理都是正確的！**

代碼一致性：
1. ✅ 所有類型都正確使用了 `- lag` 運算
2. ✅ FS 和 FF 正確使用了 LF 約束
3. ✅ SS 和 SF 正確使用了 LS 約束
4. ✅ FS 和 SS 正確使用了後續的 LS
5. ✅ FF 和 SF 正確使用了後續的 LF

**Lag 的處理是統一且正確的：**
- 正 Lag：`LS - (+lag)` = 減去正數，約束更嚴格
- 負 Lag：`LS - (-lag)` = 加上正數，約束更寬鬆
- 零 Lag：`LS - 0` = 直接約束

**沒有遺漏或錯誤！**
