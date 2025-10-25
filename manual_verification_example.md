# 手工驗證範例：Backward Pass 中 Lag 的處理

## 測試案例：複雜依賴網路

### 網路圖
```
         FS+3      SS+2
    A --------> B -------> D
    |           |          ^
    | FF+1      | FS-2     |
    v           v          |
    C ---------------------+
              SF+4
```

### 任務定義
```
任務 A：工期 5 天
  後續：B (FS Lag+3)
  後續：C (FF Lag+1)

任務 B：工期 4 天
  前置：A (FS Lag+3)
  後續：C (FS Lag-2)  ← 注意：負lag
  後續：D (SS Lag+2)

任務 C：工期 6 天
  前置：A (FF Lag+1)
  前置：B (FS Lag-2)
  後續：D (SF Lag+4)

任務 D：工期 3 天
  前置：B (SS Lag+2)
  前置：C (SF Lag+4)
```

---

## Forward Pass（正向計算）

### 步驟 1：任務 A（起始任務）
```
A.ES = 0
A.EF = 0 + 5 = 5
```

### 步驟 2：任務 B
```
前置：A (FS Lag+3)
約束：B.ES ≥ A.EF + 3 = 5 + 3 = 8

B.ES = 8
B.EF = 8 + 4 = 12
```

### 步驟 3：任務 C
```
前置1：A (FF Lag+1)
  FF約束：A.EF + 1 ≤ C.EF
  即：C.ES ≥ A.EF + 1 - C.duration = 5 + 1 - 6 = 0

前置2：B (FS Lag-2)  ← 負lag！
  FS約束：B.EF + (-2) ≤ C.ES
  即：C.ES ≥ B.EF - 2 = 12 - 2 = 10

取最大值：C.ES = max(0, 10) = 10
C.EF = 10 + 6 = 16
```

### 步驟 4：任務 D
```
前置1：B (SS Lag+2)
  SS約束：B.ES + 2 ≤ D.ES
  即：D.ES ≥ 8 + 2 = 10

前置2：C (SF Lag+4)
  SF約束：C.ES + 4 ≤ D.EF
  即：D.ES ≥ C.ES + 4 - D.duration = 10 + 4 - 3 = 11

取最大值：D.ES = max(10, 11) = 11
D.EF = 11 + 3 = 14

但是，D還要滿足 C.ES + 4 ≤ D.EF，即 10 + 4 ≤ D.EF
所以 D.EF ≥ 14，正好滿足。
```

### 專案總工期
```
總工期 = max(C.EF, D.EF) = max(16, 14) = 16 天
```

---

## Backward Pass（反向計算）

### 步驟 1：初始化結束任務
```
C: LF = 16, LS = 16 - 6 = 10
D: LF = 16, LS = 16 - 3 = 13
```

### 步驟 2：任務 B（有兩個後續任務）

#### 從 C (FS Lag-2) 推導
```
正向約束：B.EF + (-2) ≤ C.ES
反向推導：B.LF ≤ C.LS - (-2)

計算：
  B.LF ≤ 10 - (-2) = 10 + 2 = 12  ← 注意：減負數 = 加正數

驗證：
  如果 B.LF = 12，則 B.EF + (-2) = 12 - 2 = 10 = C.LS ✓
```

#### 從 D (SS Lag+2) 推導
```
正向約束：B.ES + 2 ≤ D.ES
反向推導：B.LS ≤ D.LS - 2

計算：
  B.LS ≤ 13 - 2 = 11

驗證：
  如果 B.LS = 11，則 B.ES + 2 = 11 + 2 = 13 = D.LS ✓
```

#### 合併約束
```
LF 約束：B.LF ≤ 12
LS 約束：B.LS ≤ 11

從 LS 推導 LF：11 + 4 = 15
從 LF 推導 LS：12 - 4 = 8

由於 lfFromLS (15) > minLF (12)，LF 約束更嚴格：
  B.LF = 12
  B.LS = 12 - 4 = 8

但這與 LS 約束 (≤11) 衝突！應該取更嚴格的：
  B.LS = 8（從 LF 推導）
  
最終：B.LS = 8, B.LF = 12
```

### 步驟 3：任務 C（從 D 推導）

```
從 D (SF Lag+4) 推導：
  正向約束：C.ES + 4 ≤ D.EF
  反向推導：C.LS ≤ D.LF - 4
  
計算：
  C.LS ≤ 16 - 4 = 12

但 C 已經是結束任務，LS = 10 < 12，所以保持 LS = 10
```

### 步驟 4：任務 A（有兩個後續任務）

#### 從 B (FS Lag+3) 推導
```
正向約束：A.EF + 3 ≤ B.ES
反向推導：A.LF ≤ B.LS - 3

計算：
  A.LF ≤ 8 - 3 = 5  ← 關鍵：扣掉正lag
```

#### 從 C (FF Lag+1) 推導
```
正向約束：A.EF + 1 ≤ C.EF
反向推導：A.LF ≤ C.LF - 1

計算：
  A.LF ≤ 16 - 1 = 15  ← 關鍵：扣掉正lag
```

#### 合併約束
```
LF 約束：min(5, 15) = 5

A.LF = 5
A.LS = 5 - 5 = 0
```

---

## 關鍵驗證點

### 驗證 1：負 Lag 處理（B → C, FS Lag-2）
```
✅ Backward Pass:
   B.LF ≤ C.LS - (-2) = 10 + 2 = 12

✅ 含義驗證：
   B 最晚第12天完成
   減去2天lag：12 - 2 = 10
   C 正好第10天開始 ✓
```

### 驗證 2：正 Lag 處理（A → B, FS Lag+3）
```
✅ Backward Pass:
   A.LF ≤ B.LS - 3 = 8 - 3 = 5

✅ 含義驗證：
   A 最晚第5天完成
   加上3天lag：5 + 3 = 8
   B 正好第8天開始 ✓
```

### 驗證 3：FF 類型（A → C, FF Lag+1）
```
✅ Backward Pass:
   A.LF ≤ C.LF - 1 = 16 - 1 = 15

✅ 含義驗證：
   A 最晚第15天完成（但實際受 B 約束為第5天）
   加上1天lag：5 + 1 = 6
   C 第16天完成，滿足 A.EF + 1 ≤ C.EF ✓
```

---

## 總結

### Backward Pass 中 Lag 處理的統一規則

**無論 Lag 是正數、負數還是零，計算公式都一樣：**

```typescript
predecessor.LF ≤ successor.LS - lag  // FS
predecessor.LS ≤ successor.LS - lag  // SS
predecessor.LF ≤ successor.LF - lag  // FF
predecessor.LS ≤ successor.LF - lag  // SF
```

**關鍵點：**
1. ✅ 總是用**減法**（`- lag`）
2. ✅ 正 lag：減去正數，約束變嚴格
3. ✅ 負 lag：減去負數（= 加正數），約束變寬鬆
4. ✅ 零 lag：直接約束，無偏移

**代碼實作：**
```typescript
return { lf: (succTask.ls || 0) - lag }  // 統一用減法
```

### 常見錯誤（已避免）

❌ **錯誤1：對負 lag 取絕對值**
```typescript
// 錯誤寫法
return { lf: (succTask.ls || 0) - Math.abs(lag) }
```

❌ **錯誤2：對負 lag 用加法**
```typescript
// 錯誤寫法
if (lag < 0) {
  return { lf: (succTask.ls || 0) + Math.abs(lag) }
}
```

✅ **正確：統一用減法，JavaScript 會自動處理正負**
```typescript
// 正確寫法
return { lf: (succTask.ls || 0) - lag }  // 減負數 = 加正數
```

---

## 檢查清單

使用此清單驗證任何 CPM 計算：

- [ ] Forward Pass 是否正確加上（`+ lag`）lag 值？
- [ ] Backward Pass 是否正確減去（`- lag`）lag 值？
- [ ] 負 lag 是否自動轉換為正向約束？
- [ ] FS/FF 是否約束 LF？
- [ ] SS/SF 是否約束 LS？
- [ ] 混合約束是否正確合併？
- [ ] LF = LS + duration 是否始終成立？

**當前代碼：全部 ✅**
