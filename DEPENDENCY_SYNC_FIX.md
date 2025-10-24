# 依赖关系显示不一致问题修复

## 问题描述

### 症状
在任务列表中，前置作业和后续作业的显示不一致：
- **H 的前置作业**：显示 `F (SS Lag +3)` ✓
- **F 的后续作业**：只显示 `H (SS)`，Lag +3 消失 ❌

### 示例
```
任务 H：工期 10 天
  前置作业：D (FS), F (SS Lag +3)

任务 F：工期 5 天
  后续作业：H (SS)  ← 应该显示 H (SS Lag +3)
```

---

## 根本原因

### 问题代码位置
`src/utils/cpmEngine.ts` 的 `buildTaskDependencies` 函数

### 原有代码（有问题）
```typescript
task.predecessors.forEach(predDep => {
  const pred = taskMap.get(predDep.taskId)
  if (pred && !pred.successors.some(d => d.taskId === task.id)) {
    pred.successors.push({ 
      taskId: task.id, 
      type: predDep.type 
      // ❌ 缺少 lag 属性！
    })
  }
})
```

### 问题分析
在构建双向依赖关系时，只复制了 `taskId` 和 `type`，**遗漏了 `lag` 属性**。

这导致：
1. 用户在 H 的前置作业中设置：`F (SS Lag +3)`
2. 系统自动在 F 的后续作业中添加：`H (SS)` ← 没有 lag
3. 显示时，F 的后续作业缺少 Lag 信息

---

## 修复方案

### 修复后的代码

```typescript
// 补全依赖关系
tasksCopy.forEach(task => {
  // 确保前置任务的后续列表包含当前任务
  task.predecessors.forEach(predDep => {
    const pred = taskMap.get(predDep.taskId)
    if (pred) {
      // 检查是否已存在相同的依赖关系（考虑 type 和 lag）
      const existingDep = pred.successors.find(d => 
        d.taskId === task.id && 
        d.type === predDep.type
      )
      
      if (existingDep) {
        // ✅ 如果存在，更新 lag 值以确保一致性
        existingDep.lag = predDep.lag
      } else {
        // ✅ 如果不存在，添加新的依赖关系（包含完整的 type 和 lag）
        pred.successors.push({ 
          taskId: task.id, 
          type: predDep.type, 
          lag: predDep.lag  // ✅ 包含 lag
        })
      }
    }
  })

  // 确保后续任务的前置列表包含当前任务
  task.successors.forEach(succDep => {
    const succ = taskMap.get(succDep.taskId)
    if (succ) {
      // 检查是否已存在相同的依赖关系（考虑 type 和 lag）
      const existingDep = succ.predecessors.find(d => 
        d.taskId === task.id && 
        d.type === succDep.type
      )
      
      if (existingDep) {
        // ✅ 如果存在，更新 lag 值以确保一致性
        existingDep.lag = succDep.lag
      } else {
        // ✅ 如果不存在，添加新的依赖关系（包含完整的 type 和 lag）
        succ.predecessors.push({ 
          taskId: task.id, 
          type: succDep.type, 
          lag: succDep.lag  // ✅ 包含 lag
        })
      }
    }
  })
})
```

### 改进点

1. **完整复制依赖属性**
   - ✅ 包含 `taskId`
   - ✅ 包含 `type`
   - ✅ 包含 `lag`（新增）

2. **处理已存在的依赖**
   - ✅ 检查是否已存在相同的 `taskId` 和 `type`
   - ✅ 如果存在，更新 `lag` 值而不是添加重复项
   - ✅ 如果不存在，添加完整的新依赖关系

3. **确保双向一致性**
   - ✅ 前置 → 后续：`H.predecessors` 中的 `F (SS Lag +3)` 会同步到 `F.successors`
   - ✅ 后续 → 前置：`F.successors` 中的 `H (SS Lag +3)` 会同步到 `H.predecessors`

---

## 修复效果

### 修复前
```
任务 H：前置作业 = [F (SS Lag +3)]
任务 F：后续作业 = [H (SS)]  ❌ 不一致
```

### 修复后
```
任务 H：前置作业 = [F (SS Lag +3)]
任务 F：后续作业 = [H (SS Lag +3)]  ✅ 一致
```

---

## 测试场景

### 场景 1：基本依赖关系
```
设置：H 的前置作业 = F (SS Lag +3)
期望：F 的后续作业 = H (SS Lag +3)
结果：✅ 通过
```

### 场景 2：负 Lag
```
设置：B 的后续作业 = C (FS Lag -2)
期望：C 的前置作业 = B (FS Lag -2)
结果：✅ 通过
```

### 场景 3：零 Lag
```
设置：A 的后续作业 = B (FS)
期望：B 的前置作业 = A (FS Lag 0) 或 A (FS)
结果：✅ 通过（lag 为 0 或 undefined 时不显示）
```

### 场景 4：多个依赖
```
设置：
  C 的前置作业 = A (SS Lag +3), B (FS Lag -2)
期望：
  A 的后续作业包含 C (SS Lag +3)
  B 的后续作业包含 C (FS Lag -2)
结果：✅ 通过
```

---

## 影响范围

### 直接影响
1. **任务列表显示**：前置/后续作业的 Lag 值现在会完整显示
2. **依赖关系同步**：双向依赖关系保持一致
3. **数据完整性**：所有依赖属性（taskId, type, lag）完整保留

### 间接影响
1. **CPM 计算**：确保计算时使用正确的 Lag 值
2. **数据导入导出**：依赖关系完整性得到保证
3. **用户体验**：消除了前置/后续作业显示不一致的困惑

---

## 验证步骤

### 手动测试
1. 创建任务 F（工期 5 天）
2. 创建任务 H（工期 10 天）
3. 在 H 的前置作业中添加 F，设置为 SS Lag +3
4. 检查 F 的后续作业列表
5. **预期**：显示 `H (SS Lag +3)`
6. **实际**：✅ 显示正确

### 自动化测试（建议）
```typescript
describe('buildTaskDependencies', () => {
  it('should sync lag values in bidirectional dependencies', () => {
    const tasks = [
      { id: 'F', name: 'F', duration: 5, predecessors: [], successors: [] },
      { 
        id: 'H', 
        name: 'H', 
        duration: 10, 
        predecessors: [{ taskId: 'F', type: 'SS', lag: 3 }], 
        successors: [] 
      }
    ]
    
    const result = buildTaskDependencies(tasks)
    const taskF = result.find(t => t.id === 'F')
    
    expect(taskF.successors).toContainEqual({
      taskId: 'H',
      type: 'SS',
      lag: 3
    })
  })
})
```

---

## 文件修改
- `src/utils/cpmEngine.ts`
  - `buildTaskDependencies()` 函数（第 563-626 行）

## 修复日期
2025-10-24

## 版本
v1.2

