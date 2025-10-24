# Backward Pass Lag 处理详细验证

## 关键概念复习

### 正向约束（Forward Pass）
在正向计算中，我们使用**最早时间**（ES, EF）：
- ES: 最早开始时间（Earliest Start）
- EF: 最早完成时间（Earliest Finish）
- EF = ES + duration

### 反向约束（Backward Pass）
在反向计算中，我们使用**最晚时间**（LS, LF）：
- LS: 最晚开始时间（Latest Start）
- LF: 最晚完成时间（Latest Finish）
- LF = LS + duration

---

## 详细验证每种依赖类型

### 1. FS (Finish-to-Start)

**正向约束：**
```
predecessor.EF + lag ≤ successor.ES
```

**反向推导：**
```
在关键路径上，约束是紧的（等式）：
  predecessor.EF + lag = successor.ES

对于最晚时间：
  predecessor.LF + lag ≤ successor.LS
  predecessor.LF ≤ successor.LS - lag
```

**当前代码：**
```typescript
case 'FS':
  return { lf: (succTask.ls || 0) - lag }
```

**验证：** ✅ 正确
- 使用 `succTask.ls`（后续任务的最晚开始时间）
- 减去 `lag`
- 返回 `lf` 约束（约束前置任务的最晚完成时间）

---

### 2. SS (Start-to-Start)

**正向约束：**
```
predecessor.ES + lag ≤ successor.ES
```

**反向推导：**
```
在关键路径上：
  predecessor.ES + lag = successor.ES

对于最晚时间：
  predecessor.LS + lag ≤ successor.LS
  predecessor.LS ≤ successor.LS - lag
```

**当前代码：**
```typescript
case 'SS':
  return { ls: (succTask.ls || 0) - lag }
```

**验证：** ✅ 正确
- 使用 `succTask.ls`（后续任务的最晚开始时间）
- 减去 `lag`
- 返回 `ls` 约束（约束前置任务的最晚开始时间）

---

### 3. FF (Finish-to-Finish)

**正向约束：**
```
predecessor.EF + lag ≤ successor.EF
```

**反向推导：**
```
在关键路径上：
  predecessor.EF + lag = successor.EF

对于最晚时间：
  predecessor.LF + lag ≤ successor.LF
  predecessor.LF ≤ successor.LF - lag
```

**当前代码：**
```typescript
case 'FF':
  return { lf: (succTask.lf || 0) - lag }
```

**验证：** ✅ 正确
- 使用 `succTask.lf`（后续任务的最晚完成时间）
- 减去 `lag`
- 返回 `lf` 约束（约束前置任务的最晚完成时间）

---

### 4. SF (Start-to-Finish)

**正向约束：**
```
predecessor.ES + lag ≤ successor.EF
```

**反向推导：**
```
在关键路径上：
  predecessor.ES + lag = successor.EF

对于最晚时间：
  predecessor.LS + lag ≤ successor.LF
  predecessor.LS ≤ successor.LF - lag
```

**当前代码：**
```typescript
case 'SF':
  return { ls: (succTask.lf || 0) - lag }
```

**验证：** ✅ 正确
- 使用 `succTask.lf`（后续任务的最晚完成时间）
- 减去 `lag`
- 返回 `ls` 约束（约束前置任务的最晚开始时间）

---

## 总结表

| 类型 | 正向约束 | 反向约束 | 使用的后续时间 | 约束的前置时间 | 代码 |
|------|----------|----------|----------------|----------------|------|
| FS | pred.EF + lag ≤ succ.ES | pred.LF ≤ succ.LS - lag | succ.LS | pred.LF | ✅ |
| SS | pred.ES + lag ≤ succ.ES | pred.LS ≤ succ.LS - lag | succ.LS | pred.LS | ✅ |
| FF | pred.EF + lag ≤ succ.EF | pred.LF ≤ succ.LF - lag | succ.LF | pred.LF | ✅ |
| SF | pred.ES + lag ≤ succ.EF | pred.LS ≤ succ.LF - lag | succ.LF | pred.LS | ✅ |

---

## 边界情况测试

### 情况 1：正 Lag
```
A --FS Lag+5--> B
B.LS = 20

计算：
  A.LF ≤ 20 - 5 = 15 ✓
  
含义：A 最晚在第15天完成，加上5天 lag，不会延迟 B 在第20天开始
```

### 情况 2：负 Lag
```
A --FS Lag-3--> B
B.LS = 20

计算：
  A.LF ≤ 20 - (-3) = 23 ✓
  
含义：A 最晚在第23天完成，减去3天 lag（即 B 可以提前3天开始），
      不会延迟 B 在第20天开始
```

### 情况 3：零 Lag
```
A --FS Lag0--> B
B.LS = 20

计算：
  A.LF ≤ 20 - 0 = 20 ✓
  
含义：A 最晚在第20天完成，B 正好在第20天开始
```

---

## 结论

**所有依赖类型的 Lag 处理都是正确的！**

代码一致性：
1. ✅ 所有类型都正确使用了 `- lag` 运算
2. ✅ FS 和 FF 正确使用了 LF 约束
3. ✅ SS 和 SF 正确使用了 LS 约束
4. ✅ FS 和 SS 正确使用了后续的 LS
5. ✅ FF 和 SF 正确使用了后续的 LF

**Lag 的处理是统一且正确的：**
- 正 Lag：`LS - (+lag)` = 减去正数，约束更严格
- 负 Lag：`LS - (-lag)` = 加上正数，约束更宽松
- 零 Lag：`LS - 0` = 直接约束

**没有遗漏或错误！**

