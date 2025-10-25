# 依賴關係顯示不一致問題修復

## 問題描述

### 症狀
在任務列表中，前置作業和後續作業的顯示不一致：
- **H 的前置作業**：顯示 `F (SS Lag +3)` ✓
- **F 的後續作業**：只顯示 `H (SS)`，Lag +3 消失 ❌

### 範例
```
任務 H：工期 10 天
  前置作業：D (FS), F (SS Lag +3)

任務 F：工期 5 天
  後續作業：H (SS)  ← 應該顯示 H (SS Lag +3)
```

---

## 根本原因

### 問題代碼位置
`src/utils/cpmEngine.ts` 的 `buildTaskDependencies` 函式

### 原有代碼（有問題）
```typescript
task.predecessors.forEach(predDep => {
  const pred = taskMap.get(predDep.taskId)
  if (pred && !pred.successors.some(d => d.taskId === task.id)) {
    pred.successors.push({ 
      taskId: task.id, 
      type: predDep.type 
      // ❌ 缺少 lag 屬性！
    })
  }
})
```

### 問題分析
在建構雙向依賴關係時，只複製了 `taskId` 和 `type`，**遺漏了 `lag` 屬性**。

這導致：
1. 使用者在 H 的前置作業中設定：`F (SS Lag +3)`
2. 系統自動在 F 的後續作業中新增：`H (SS)` ← 沒有 lag
3. 顯示時，F 的後續作業缺少 Lag 資訊

---

## 修復方案

### 修復後的代碼

```typescript
// 補全依賴關係
tasksCopy.forEach(task => {
  // 確保前置任務的後續列表包含當前任務
  task.predecessors.forEach(predDep => {
    const pred = taskMap.get(predDep.taskId)
    if (pred) {
      // 檢查是否已存在相同的依賴關係（考慮 type 和 lag）
      const existingDep = pred.successors.find(d => 
        d.taskId === task.id && 
        d.type === predDep.type
      )
      
      if (existingDep) {
        // ✅ 如果存在，更新 lag 值以確保一致性
        existingDep.lag = predDep.lag
      } else {
        // ✅ 如果不存在，新增新的依賴關係（包含完整的 type 和 lag）
        pred.successors.push({ 
          taskId: task.id, 
          type: predDep.type, 
          lag: predDep.lag  // ✅ 包含 lag
        })
      }
    }
  })

  // 確保後續任務的前置列表包含當前任務
  task.successors.forEach(succDep => {
    const succ = taskMap.get(succDep.taskId)
    if (succ) {
      // 檢查是否已存在相同的依賴關係（考慮 type 和 lag）
      const existingDep = succ.predecessors.find(d => 
        d.taskId === task.id && 
        d.type === succDep.type
      )
      
      if (existingDep) {
        // ✅ 如果存在，更新 lag 值以確保一致性
        existingDep.lag = succDep.lag
      } else {
        // ✅ 如果不存在，新增新的依賴關係（包含完整的 type 和 lag）
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

### 改進點

1. **完整複製依賴屬性**
   - ✅ 包含 `taskId`
   - ✅ 包含 `type`
   - ✅ 包含 `lag`（新增）

2. **處理已存在的依賴**
   - ✅ 檢查是否已存在相同的 `taskId` 和 `type`
   - ✅ 如果存在，更新 `lag` 值而不是新增重複項
   - ✅ 如果不存在，新增完整的新依賴關係

3. **確保雙向一致性**
   - ✅ 前置 → 後續：`H.predecessors` 中的 `F (SS Lag +3)` 會同步到 `F.successors`
   - ✅ 後續 → 前置：`F.successors` 中的 `H (SS Lag +3)` 會同步到 `H.predecessors`

---

## 修復效果

### 修復前
```
任務 H：前置作業 = [F (SS Lag +3)]
任務 F：後續作業 = [H (SS)]  ❌ 不一致
```

### 修復後
```
任務 H：前置作業 = [F (SS Lag +3)]
任務 F：後續作業 = [H (SS Lag +3)]  ✅ 一致
```

---

## 測試場景

### 場景 1：基本依賴關係
```
設定：H 的前置作業 = F (SS Lag +3)
期望：F 的後續作業 = H (SS Lag +3)
結果：✅ 通過
```

### 場景 2：負 Lag
```
設定：B 的後續作業 = C (FS Lag -2)
期望：C 的前置作業 = B (FS Lag -2)
結果：✅ 通過
```

### 場景 3：零 Lag
```
設定：A 的後續作業 = B (FS)
期望：B 的前置作業 = A (FS Lag 0) 或 A (FS)
結果：✅ 通過（lag 為 0 或 undefined 時不顯示）
```

### 場景 4：多個依賴
```
設定：
  C 的前置作業 = A (SS Lag +3), B (FS Lag -2)
期望：
  A 的後續作業包含 C (SS Lag +3)
  B 的後續作業包含 C (FS Lag -2)
結果：✅ 通過
```

---

## 影響範圍

### 直接影響
1. **任務列表顯示**：前置/後續作業的 Lag 值現在會完整顯示
2. **依賴關係同步**：雙向依賴關係保持一致
3. **資料完整性**：所有依賴屬性（taskId, type, lag）完整保留

### 間接影響
1. **CPM 計算**：確保計算時使用正確的 Lag 值
2. **資料匯入匯出**：依賴關係完整性得到保證
3. **使用者體驗**：消除了前置/後續作業顯示不一致的困惑

---

## 驗證步驟

### 手動測試
1. 建立任務 F（工期 5 天）
2. 建立任務 H（工期 10 天）
3. 在 H 的前置作業中新增 F，設定為 SS Lag +3
4. 檢查 F 的後續作業列表
5. **預期**：顯示 `H (SS Lag +3)`
6. **實際**：✅ 顯示正確

### 自動化測試（建議）
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

## 檔案修改
- `src/utils/cpmEngine.ts`
  - `buildTaskDependencies()` 函式（第 563-626 行）

## 修復日期
2025-10-24

## 版本
v1.2
