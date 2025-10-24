# 手工验证示例：Backward Pass 中 Lag 的处理

## 测试案例：复杂依赖网络

### 网络图
```
         FS+3      SS+2
    A --------> B -------> D
    |           |          ^
    | FF+1      | FS-2     |
    v           v          |
    C ---------------------+
              SF+4
```

### 任务定义
```
任务 A：工期 5 天
  后续：B (FS Lag+3)
  后续：C (FF Lag+1)

任务 B：工期 4 天
  前置：A (FS Lag+3)
  后续：C (FS Lag-2)  ← 注意：负lag
  后续：D (SS Lag+2)

任务 C：工期 6 天
  前置：A (FF Lag+1)
  前置：B (FS Lag-2)
  后续：D (SF Lag+4)

任务 D：工期 3 天
  前置：B (SS Lag+2)
  前置：C (SF Lag+4)
```

---

## Forward Pass（正向计算）

### 步骤 1：任务 A（起始任务）
```
A.ES = 0
A.EF = 0 + 5 = 5
```

### 步骤 2：任务 B
```
前置：A (FS Lag+3)
约束：B.ES ≥ A.EF + 3 = 5 + 3 = 8

B.ES = 8
B.EF = 8 + 4 = 12
```

### 步骤 3：任务 C
```
前置1：A (FF Lag+1)
  FF约束：A.EF + 1 ≤ C.EF
  即：C.ES ≥ A.EF + 1 - C.duration = 5 + 1 - 6 = 0

前置2：B (FS Lag-2)  ← 负lag！
  FS约束：B.EF + (-2) ≤ C.ES
  即：C.ES ≥ B.EF - 2 = 12 - 2 = 10

取最大值：C.ES = max(0, 10) = 10
C.EF = 10 + 6 = 16
```

### 步骤 4：任务 D
```
前置1：B (SS Lag+2)
  SS约束：B.ES + 2 ≤ D.ES
  即：D.ES ≥ 8 + 2 = 10

前置2：C (SF Lag+4)
  SF约束：C.ES + 4 ≤ D.EF
  即：D.ES ≥ C.ES + 4 - D.duration = 10 + 4 - 3 = 11

取最大值：D.ES = max(10, 11) = 11
D.EF = 11 + 3 = 14

但是，D还要满足 C.ES + 4 ≤ D.EF，即 10 + 4 ≤ D.EF
所以 D.EF ≥ 14，正好满足。
```

### 项目总工期
```
总工期 = max(C.EF, D.EF) = max(16, 14) = 16 天
```

---

## Backward Pass（反向计算）

### 步骤 1：初始化结束任务
```
C: LF = 16, LS = 16 - 6 = 10
D: LF = 16, LS = 16 - 3 = 13
```

### 步骤 2：任务 B（有两个后续任务）

#### 从 C (FS Lag-2) 推导
```
正向约束：B.EF + (-2) ≤ C.ES
反向推导：B.LF ≤ C.LS - (-2)

计算：
  B.LF ≤ 10 - (-2) = 10 + 2 = 12  ← 注意：减负数 = 加正数

验证：
  如果 B.LF = 12，则 B.EF + (-2) = 12 - 2 = 10 = C.LS ✓
```

#### 从 D (SS Lag+2) 推导
```
正向约束：B.ES + 2 ≤ D.ES
反向推导：B.LS ≤ D.LS - 2

计算：
  B.LS ≤ 13 - 2 = 11

验证：
  如果 B.LS = 11，则 B.ES + 2 = 11 + 2 = 13 = D.LS ✓
```

#### 合并约束
```
LF 约束：B.LF ≤ 12
LS 约束：B.LS ≤ 11

从 LS 推导 LF：11 + 4 = 15
从 LF 推导 LS：12 - 4 = 8

由于 lfFromLS (15) > minLF (12)，LF 约束更严格：
  B.LF = 12
  B.LS = 12 - 4 = 8

但这与 LS 约束 (≤11) 冲突！应该取更严格的：
  B.LS = 8（从 LF 推导）
  
最终：B.LS = 8, B.LF = 12
```

### 步骤 3：任务 C（从 D 推导）

```
从 D (SF Lag+4) 推导：
  正向约束：C.ES + 4 ≤ D.EF
  反向推导：C.LS ≤ D.LF - 4
  
计算：
  C.LS ≤ 16 - 4 = 12

但 C 已经是结束任务，LS = 10 < 12，所以保持 LS = 10
```

### 步骤 4：任务 A（有两个后续任务）

#### 从 B (FS Lag+3) 推导
```
正向约束：A.EF + 3 ≤ B.ES
反向推导：A.LF ≤ B.LS - 3

计算：
  A.LF ≤ 8 - 3 = 5  ← 关键：扣掉正lag
```

#### 从 C (FF Lag+1) 推导
```
正向约束：A.EF + 1 ≤ C.EF
反向推导：A.LF ≤ C.LF - 1

计算：
  A.LF ≤ 16 - 1 = 15  ← 关键：扣掉正lag
```

#### 合并约束
```
LF 约束：min(5, 15) = 5

A.LF = 5
A.LS = 5 - 5 = 0
```

---

## 关键验证点

### 验证 1：负 Lag 处理（B → C, FS Lag-2）
```
✅ Backward Pass:
   B.LF ≤ C.LS - (-2) = 10 + 2 = 12

✅ 含义验证：
   B 最晚第12天完成
   减去2天lag：12 - 2 = 10
   C 正好第10天开始 ✓
```

### 验证 2：正 Lag 处理（A → B, FS Lag+3）
```
✅ Backward Pass:
   A.LF ≤ B.LS - 3 = 8 - 3 = 5

✅ 含义验证：
   A 最晚第5天完成
   加上3天lag：5 + 3 = 8
   B 正好第8天开始 ✓
```

### 验证 3：FF 类型（A → C, FF Lag+1）
```
✅ Backward Pass:
   A.LF ≤ C.LF - 1 = 16 - 1 = 15

✅ 含义验证：
   A 最晚第15天完成（但实际受 B 约束为第5天）
   加上1天lag：5 + 1 = 6
   C 第16天完成，满足 A.EF + 1 ≤ C.EF ✓
```

---

## 总结

### Backward Pass 中 Lag 处理的统一规则

**无论 Lag 是正数、负数还是零，计算公式都一样：**

```typescript
predecessor.LF ≤ successor.LS - lag  // FS
predecessor.LS ≤ successor.LS - lag  // SS
predecessor.LF ≤ successor.LF - lag  // FF
predecessor.LS ≤ successor.LF - lag  // SF
```

**关键点：**
1. ✅ 总是用**减法**（`- lag`）
2. ✅ 正 lag：减去正数，约束变严格
3. ✅ 负 lag：减去负数（= 加正数），约束变宽松
4. ✅ 零 lag：直接约束，无偏移

**代码实现：**
```typescript
return { lf: (succTask.ls || 0) - lag }  // 统一用减法
```

### 常见错误（已避免）

❌ **错误1：对负 lag 取绝对值**
```typescript
// 错误写法
return { lf: (succTask.ls || 0) - Math.abs(lag) }
```

❌ **错误2：对负 lag 用加法**
```typescript
// 错误写法
if (lag < 0) {
  return { lf: (succTask.ls || 0) + Math.abs(lag) }
}
```

✅ **正确：统一用减法，JavaScript 会自动处理正负**
```typescript
// 正确写法
return { lf: (succTask.ls || 0) - lag }  // 减负数 = 加正数
```

---

## 检查清单

使用此清单验证任何 CPM 计算：

- [ ] Forward Pass 是否正确加上（`+ lag`）lag 值？
- [ ] Backward Pass 是否正确减去（`- lag`）lag 值？
- [ ] 负 lag 是否自动转换为正向约束？
- [ ] FS/FF 是否约束 LF？
- [ ] SS/SF 是否约束 LS？
- [ ] 混合约束是否正确合并？
- [ ] LF = LS + duration 是否始终成立？

**当前代码：全部 ✅**

