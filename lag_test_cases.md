# Backward Pass Lag 处理测试案例

## 测试案例 1：FS with Positive Lag

**场景：**
```
A (工期5天) --FS Lag+3--> B (工期4天)
```

**正向约束：**
```
A.EF + 3 ≤ B.ES
如果 A.EF = 5，则 B.ES ≥ 5 + 3 = 8
```

**反向约束：**
```
A.LF ≤ B.LS - 3
如果 B.LS = 10，则 A.LF ≤ 10 - 3 = 7
```

**验证代码：**
```typescript
case 'FS':
  return { lf: (succTask.ls || 0) - lag }  // ✓ 正确
```

---

## 测试案例 2：FS with Negative Lag

**场景：**
```
A (工期5天) --FS Lag-2--> B (工期4天)
```

**含义：** B 可以在 A 完成前 2 天开始（快速跟进）

**正向约束：**
```
A.EF + (-2) ≤ B.ES
A.EF - 2 ≤ B.ES
如果 A.EF = 5，则 B.ES ≥ 5 - 2 = 3
即 B 可以在第 3 天开始，而 A 在第 5 天完成
```

**反向约束：**
```
A.LF ≤ B.LS - (-2)
A.LF ≤ B.LS + 2
如果 B.LS = 10，则 A.LF ≤ 10 + 2 = 12
```

**验证代码：**
```typescript
case 'FS':
  return { lf: (succTask.ls || 0) - lag }  // ✓ 正确
  // lag = -2，所以 ls - (-2) = ls + 2
```

---

## 测试案例 3：SS with Positive Lag

**场景：**
```
A (工期5天) --SS Lag+3--> B (工期4天)
```

**正向约束：**
```
A.ES + 3 ≤ B.ES
如果 A.ES = 0，则 B.ES ≥ 3
```

**反向约束：**
```
A.LS ≤ B.LS - 3
如果 B.LS = 10，则 A.LS ≤ 7
```

**验证代码：**
```typescript
case 'SS':
  return { ls: (succTask.ls || 0) - lag }  // ✓ 正确
```

---

## 测试案例 4：FF with Positive Lag

**场景：**
```
A (工期5天) --FF Lag+2--> B (工期4天)
```

**正向约束：**
```
A.EF + 2 ≤ B.EF
如果 A.EF = 5，则 B.EF ≥ 7
即 B 必须在 A 完成后 2 天才能完成
```

**反向约束：**
```
A.LF ≤ B.LF - 2
如果 B.LF = 15，则 A.LF ≤ 13
```

**验证代码：**
```typescript
case 'FF':
  return { lf: (succTask.lf || 0) - lag }  // ✓ 正确
```

---

## 测试案例 5：SF with Positive Lag

**场景：**
```
A (工期5天) --SF Lag+3--> B (工期4天)
```

**正向约束：**
```
A.ES + 3 ≤ B.EF
如果 A.ES = 0，则 B.EF ≥ 3
即 A 开始后 3 天，B 才能完成
```

**反向约束：**
```
A.LS ≤ B.LF - 3
如果 B.LF = 10，则 A.LS ≤ 7
```

**验证代码：**
```typescript
case 'SF':
  return { ls: (succTask.lf || 0) - lag }  // ✓ 正确
```

---

## 完整测试：混合 Lag 值

### 场景设定
```
任务序列：
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

项目工期 = max(12, 3, 6) = 12

Backward Pass:
  B: LF = 12, LS = 8
  C: LF = 3, LS = 0
  D: LF = 6, LS = 0

  A 的约束：
    从 B (FS Lag+3): A.LF ≤ B.LS - 3 = 8 - 3 = 5 ✓
    从 C (SS Lag-2): A.LS ≤ C.LS - (-2) = 0 + 2 = 2
    从 D (FF Lag+1): A.LF ≤ D.LF - 1 = 6 - 1 = 5 ✓

  最严格的 LS 约束：2
  最严格的 LF 约束：5
  
  计算：
    lfFromLS = 2 + 5 = 7
    lsFromLF = 5 - 5 = 0
    
  由于 lfFromLS(7) > minLF(5)，LF 约束更严格
    A.LF = 5
    A.LS = 0
    
  验证：A.LF = A.LS + duration = 0 + 5 = 5 ✓
```

---

## 结论

当前代码的 Lag 处理逻辑：
```typescript
return { lf: (succTask.ls || 0) - lag }
return { ls: (succTask.ls || 0) - lag }
return { lf: (succTask.lf || 0) - lag }
return { ls: (succTask.lf || 0) - lag }
```

**数学验证：**
- 正向约束：`前置时间 + lag ≤ 后续时间`
- 反向推导：`前置时间 ≤ 后续时间 - lag`
- 当 lag 为负数时：`前置时间 ≤ 后续时间 - (负数) = 后续时间 + 正数` ✓

**结论：代码逻辑正确！** ✅

Lag 的减法（`- lag`）正确处理了正负两种情况：
- 正 lag：确实减去
- 负 lag：减去负数 = 加上正数

