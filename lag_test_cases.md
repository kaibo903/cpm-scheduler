# Backward Pass Lag 處理測試案例

## 測試案例 1：FS with Positive Lag

**場景：**
```
A (工期5天) --FS Lag+3--> B (工期4天)
```

**正向約束：**
```
A.EF + 3 ≤ B.ES
如果 A.EF = 5，則 B.ES ≥ 5 + 3 = 8
```

**反向約束：**
```
A.LF ≤ B.LS - 3
如果 B.LS = 10，則 A.LF ≤ 10 - 3 = 7
```

**驗證代碼：**
```typescript
case 'FS':
  return { lf: (succTask.ls || 0) - lag }  // ✓ 正確
```

---

## 測試案例 2：FS with Negative Lag

**場景：**
```
A (工期5天) --FS Lag-2--> B (工期4天)
```

**含義：** B 可以在 A 完成前 2 天開始（快速跟進）

**正向約束：**
```
A.EF + (-2) ≤ B.ES
A.EF - 2 ≤ B.ES
如果 A.EF = 5，則 B.ES ≥ 5 - 2 = 3
即 B 可以在第 3 天開始，而 A 在第 5 天完成
```

**反向約束：**
```
A.LF ≤ B.LS - (-2)
A.LF ≤ B.LS + 2
如果 B.LS = 10，則 A.LF ≤ 10 + 2 = 12
```

**驗證代碼：**
```typescript
case 'FS':
  return { lf: (succTask.ls || 0) - lag }  // ✓ 正確
  // lag = -2，所以 ls - (-2) = ls + 2
```

---

## 測試案例 3：SS with Positive Lag

**場景：**
```
A (工期5天) --SS Lag+3--> B (工期4天)
```

**正向約束：**
```
A.ES + 3 ≤ B.ES
如果 A.ES = 0，則 B.ES ≥ 3
```

**反向約束：**
```
A.LS ≤ B.LS - 3
如果 B.LS = 10，則 A.LS ≤ 7
```

**驗證代碼：**
```typescript
case 'SS':
  return { ls: (succTask.ls || 0) - lag }  // ✓ 正確
```

---

## 測試案例 4：FF with Positive Lag

**場景：**
```
A (工期5天) --FF Lag+2--> B (工期4天)
```

**正向約束：**
```
A.EF + 2 ≤ B.EF
如果 A.EF = 5，則 B.EF ≥ 7
即 B 必須在 A 完成後 2 天才能完成
```

**反向約束：**
```
A.LF ≤ B.LF - 2
如果 B.LF = 15，則 A.LF ≤ 13
```

**驗證代碼：**
```typescript
case 'FF':
  return { lf: (succTask.lf || 0) - lag }  // ✓ 正確
```

---

## 測試案例 5：SF with Positive Lag

**場景：**
```
A (工期5天) --SF Lag+3--> B (工期4天)
```

**正向約束：**
```
A.ES + 3 ≤ B.EF
如果 A.ES = 0，則 B.EF ≥ 3
即 A 開始後 3 天，B 才能完成
```

**反向約束：**
```
A.LS ≤ B.LF - 3
如果 B.LF = 10，則 A.LS ≤ 7
```

**驗證代碼：**
```typescript
case 'SF':
  return { ls: (succTask.lf || 0) - lag }  // ✓ 正確
```

---

## 完整測試：混合 Lag 值

### 場景設定
```
任務序列：
A (工期5天)
  → B (FS Lag+3, 工期4天)
  → C (SS Lag-2, 工期3天) 
  → D (FF Lag+1, 工期6天)

Forward Pass:
  A: ES=0, EF=5
  
  B: ES ≥ A.EF + 3 = 8
     EF = 8 + 4 = 12
  
  C: ES ≥ A.ES - 2 = -2 → 0 (取max)
     EF = 0 + 3 = 3
  
  D: ES ≥ A.EF + 1 - 6 = 0
     EF = 0 + 6 = 6

專案工期 = max(12, 3, 6) = 12

Backward Pass:
  B: LF = 12, LS = 8
  C: LF = 3, LS = 0
  D: LF = 6, LS = 0

  A 的約束：
    從 B (FS Lag+3): A.LF ≤ B.LS - 3 = 8 - 3 = 5 ✓
    從 C (SS Lag-2): A.LS ≤ C.LS - (-2) = 0 + 2 = 2
    從 D (FF Lag+1): A.LF ≤ D.LF - 1 = 6 - 1 = 5 ✓

  最嚴格的 LS 約束：2
  最嚴格的 LF 約束：5
  
  計算：
    lfFromLS = 2 + 5 = 7
    lsFromLF = 5 - 5 = 0
    
  由於 lfFromLS(7) > minLF(5)，LF 約束更嚴格
    A.LF = 5
    A.LS = 0
    
  驗證：A.LF = A.LS + duration = 0 + 5 = 5 ✓
```

---

## 結論

當前代碼的 Lag 處理邏輯：
```typescript
return { lf: (succTask.ls || 0) - lag }
return { ls: (succTask.ls || 0) - lag }
return { lf: (succTask.lf || 0) - lag }
return { ls: (succTask.lf || 0) - lag }
```

**數學驗證：**
- 正向約束：`前置時間 + lag ≤ 後續時間`
- 反向推導：`前置時間 ≤ 後續時間 - lag`
- 當 lag 為負數時：`前置時間 ≤ 後續時間 - (負數) = 後續時間 + 正數` ✓

**結論：代碼邏輯正確！** ✅

Lag 的減法（`- lag`）正確處理了正負兩種情況：
- 正 lag：確實減去
- 負 lag：減去負數 = 加上正數
