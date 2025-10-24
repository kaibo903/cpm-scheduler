# CPM 计算逻辑修正说明

## 修正日期
2025-10-24

## 修正内容

### 1. Backward Pass（反向计算）混合约束处理

**问题描述：**
当一个任务有多个后续任务时，可能同时存在：
- LS 约束（来自 SS 或 SF 类型的依赖）
- LF 约束（来自 FS 或 FF 类型的依赖）

原有逻辑在处理混合约束时不够准确。

**修正后的逻辑：**

```typescript
if (minLS !== Infinity && minLF !== Infinity) {
  // 同时有 LS 和 LF 约束
  const lfFromLS = minLS + task.duration  // 从 LS 约束推导的 LF
  const lsFromLF = minLF - task.duration  // 从 LF 约束推导的 LS
  
  // 判断哪个约束更严格
  if (lfFromLS <= minLF) {
    // LS 约束更严格
    task.ls = minLS
    task.lf = lfFromLS
  } else {
    // LF 约束更严格
    task.lf = minLF
    task.ls = lsFromLF
  }
}
```

**关键点：**
- 必须确保 `LF = LS + duration`
- 选择导致时间窗口更紧的约束

---

### 2. Free Float（自由浮时）计算修正

**问题描述：**
原有代码仅考虑 FS 类型依赖，对 SS、FF、SF 类型的处理不正确。

**修正后的逻辑：**

```typescript
switch (succDep.type) {
  case 'FS':
    // predecessor.EF + lag ≤ successor.ES
    // 所以 predecessor.EF 最多可以延迟到 successor.ES - lag
    allowedFloat = succ.es - lag - task.ef
    break
    
  case 'SS':
    // predecessor.ES + lag ≤ successor.ES
    // 所以 predecessor.ES 最多可以延迟到 successor.ES - lag
    allowedFloat = succ.es - lag - task.es
    break
    
  case 'FF':
    // predecessor.EF + lag ≤ successor.EF
    // 所以 predecessor.EF 最多可以延迟到 successor.EF - lag
    allowedFloat = succ.ef - lag - task.ef
    break
    
  case 'SF':
    // predecessor.ES + lag ≤ successor.EF
    // 所以 predecessor.ES 最多可以延迟到 successor.EF - lag
    allowedFloat = succ.ef - lag - task.es
    break
}
```

**关键点：**
- FS 和 FF：约束 predecessor 的完成时间（EF）
- SS 和 SF：约束 predecessor 的开始时间（ES）

---

## 测试案例

### 案例 1：混合约束（SS + FS）

```
任务 A：工期 5 天
  后续1：B (SS Lag 0) → A.ES + 0 ≤ B.ES
  后续2：C (FS Lag 0) → A.EF + 0 ≤ C.ES

如果：
  B.LS = 10, B.ES = 10
  C.LS = 12, C.ES = 12

则 A 的约束：
  从 SS: A.LS ≤ B.LS - 0 = 10
  从 FS: A.LF ≤ C.LS - 0 = 12

计算：
  lfFromLS = 10 + 5 = 15
  lsFromLF = 12 - 5 = 7

由于 lfFromLS (15) > minLF (12)，LF 约束更严格：
  A.LS = 7
  A.LF = 12
```

### 案例 2：FF 类型的 Free Float

```
任务 A：工期 5 天，EF = 10
  后续：B (FF Lag 2)，B.EF = 15

计算 A 的 Free Float：
  FF = B.EF - lag - A.EF
     = 15 - 2 - 10
     = 3 天
     
含义：A 可以延迟最多 3 天完成（从第 10 天延迟到第 13 天），
      而不会影响 B 在第 15 天完成。
```

---

## 影响范围

### 直接影响
1. **LS/LF 计算**：更准确地处理混合依赖类型的约束
2. **Free Float**：正确反映不同依赖类型的浮时
3. **关键路径识别**：基于更准确的 Total Float (TF = LS - ES)

### 潜在改善
1. 混合使用 SS、SF、FS、FF 的复杂网络图计算更准确
2. 浮时计算反映真实的调度灵活性
3. 资源优化决策基础更可靠

---

## 验证方法

### 手动验证步骤
1. 创建包含混合依赖类型的测试案例
2. 手工计算预期的 ES、EF、LS、LF
3. 对比系统计算结果
4. 验证 TF 和 FF 的合理性

### 自动化测试
建议添加单元测试覆盖以下场景：
- 纯 FS 网络（基准）
- 纯 SS 网络
- 混合 SS + FS
- 混合 FF + FS
- 包含负 Lag 的情况

---

## 技术细节

### Backward Pass 的数学原理

对于任务 i：
- LS_i：最晚开始时间
- LF_i：最晚完成时间
- d_i：工期

约束关系：
1. **FS 类型** (i → j)：EF_i + lag ≤ ES_j
   - 反向：LF_i ≤ LS_j - lag

2. **SS 类型** (i → j)：ES_i + lag ≤ ES_j
   - 反向：LS_i ≤ LS_j - lag

3. **FF 类型** (i → j)：EF_i + lag ≤ EF_j
   - 反向：LF_i ≤ LF_j - lag

4. **SF 类型** (i → j)：ES_i + lag ≤ EF_j
   - 反向：LS_i ≤ LF_j - lag

关键约束：**LF_i = LS_i + d_i** 必须始终成立

当同时有多个约束时：
```
LS_i ≤ min(LS约束)
LF_i ≤ min(LF约束)
LF_i = LS_i + d_i  （必须满足）
```

解决方案：
1. 计算 lfFromLS = min(LS约束) + d_i
2. 计算 lsFromLF = min(LF约束) - d_i
3. 如果 lfFromLS ≤ min(LF约束)，使用 LS 约束
4. 否则使用 LF 约束

---

## 修改文件
- `src/utils/cpmEngine.ts`
  - `backwardPass()` 函数（第 214-308 行）
  - `calculateFloatAndCriticalPath()` 函数（第 310-382 行）

## 版本
- 修正前版本：v1.0
- 修正后版本：v1.1

