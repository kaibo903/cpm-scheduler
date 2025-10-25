import type { CPMTask, CPMResult, Dependency } from '../types'

/**
 * CPM (Critical Path Method) 引擎
 * 實作關鍵路徑法的完整演算法
 */

/**
 * 輔助函式：從依賴陣列中提取任務ID
 */
function getDepTaskIds(deps: Dependency[]): string[] {
  return deps.map(d => d.taskId)
}

/**
 * 輔助函式：根據依賴關係類型和Lag值計算後續任務的最早開始時間約束
 * 
 * 各類型的約束關係：
 * FS: predecessor.EF + lag ≤ successor.ES  → successor.ES ≥ predecessor.EF + lag
 * SS: predecessor.ES + lag ≤ successor.ES  → successor.ES ≥ predecessor.ES + lag
 * FF: predecessor.EF + lag ≤ successor.EF  → successor.ES ≥ predecessor.EF + lag - successor.duration
 * SF: predecessor.ES + lag ≤ successor.EF  → successor.ES ≥ predecessor.ES + lag - successor.duration
 */
function calculateConstraint(dep: Dependency, predTask: CPMTask, succTask: CPMTask): number {
  const lag = dep.lag || 0
  
  switch (dep.type) {
    case 'FS':
      // FS: predecessor.EF + lag ≤ successor.ES
      return (predTask.ef || 0) + lag
      
    case 'SS':
      // SS: predecessor.ES + lag ≤ successor.ES
      return (predTask.es || 0) + lag
      
    case 'FF':
      // FF (Finish-to-Finish): predecessor.EF + lag ≤ successor.EF
      // 含義：後續任務必須在前置任務完成後 lag 天才能完成
      // 
      // 推導：
      //   predecessor.EF + lag ≤ successor.EF
      //   predecessor.EF + lag ≤ successor.ES + successor.duration
      //   successor.ES ≥ predecessor.EF + lag - successor.duration
      //
      // 範例：
      //   前置任務在第10天完成，lag=2，後續任務工期=5天
      //   則後續任務最早在第 10+2-5=7 天開始，在第12天完成
      //
      // 注意：如果 predecessor.EF + lag < successor.duration，
      //       計算結果可能為負，表示後續任務需要提前開始
      //       這在有其他約束時是合理的（會取所有約束的最大值）
      return (predTask.ef || 0) + lag - succTask.duration
      
    case 'SF':
      // SF: predecessor.ES + lag ≤ successor.EF
      // 即: predecessor.ES + lag ≤ successor.ES + successor.duration
      // 所以: successor.ES ≥ predecessor.ES + lag - successor.duration
      return (predTask.es || 0) + lag - succTask.duration
      
    default:
      return (predTask.ef || 0) + lag
  }
}

/**
 * 檢測循環依賴
 */
function detectCycle(tasks: CPMTask[]): boolean {
  const taskMap = new Map<string, CPMTask>()
  tasks.forEach(task => taskMap.set(task.id, task))

  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function dfs(taskId: string): boolean {
    visited.add(taskId)
    recursionStack.add(taskId)

    const task = taskMap.get(taskId)
    if (!task) return false

    const successorIds = getDepTaskIds(task.successors)
    for (const successorId of successorIds) {
      if (!visited.has(successorId)) {
        if (dfs(successorId)) return true
      } else if (recursionStack.has(successorId)) {
        return true // 發現循環
      }
    }

    recursionStack.delete(taskId)
    return false
  }

  for (const task of tasks) {
    if (!visited.has(task.id)) {
      if (dfs(task.id)) return true
    }
  }

  return false
}

/**
 * 拓撲排序（使用 Kahn's Algorithm）
 */
function topologicalSort(tasks: CPMTask[]): string[] {
  const taskMap = new Map<string, CPMTask>()
  const inDegree = new Map<string, number>()
  
  // 初始化
  tasks.forEach(task => {
    taskMap.set(task.id, task)
    inDegree.set(task.id, task.predecessors.length)
  })

  // 找出所有入度為0的節點
  const queue: string[] = []
  tasks.forEach(task => {
    if (inDegree.get(task.id) === 0) {
      queue.push(task.id)
    }
  })

  const sorted: string[] = []

  while (queue.length > 0) {
    const taskId = queue.shift()!
    sorted.push(taskId)

    const task = taskMap.get(taskId)!
    const successorIds = getDepTaskIds(task.successors)
    for (const successorId of successorIds) {
      const newInDegree = inDegree.get(successorId)! - 1
      inDegree.set(successorId, newInDegree)
      
      if (newInDegree === 0) {
        queue.push(successorId)
      }
    }
  }

  return sorted
}

/**
 * Forward Pass - 計算 ES 和 EF
 */
function forwardPass(tasks: CPMTask[], sortedIds: string[]): void {
  const taskMap = new Map<string, CPMTask>()
  tasks.forEach(task => taskMap.set(task.id, task))

  for (const taskId of sortedIds) {
    const task = taskMap.get(taskId)!
    
    // 計算最早開始時間 (ES)
    if (task.predecessors.length === 0) {
      task.es = 0
      task.isStart = true
    } else {
      // 初始化為 0，確保 ES 至少為 0（不能在專案開始前開始）
      let maxES = 0
      
      for (const predDep of task.predecessors) {
        const pred = taskMap.get(predDep.taskId)
        if (pred && pred.ef !== undefined) {
          const constraintTime = calculateConstraint(predDep, pred, task)
          // 取所有約束的最大值
          maxES = Math.max(maxES, constraintTime)
        }
      }
      
      // 確保 ES 不為負數
      task.es = Math.max(0, maxES)
    }
    
    // 計算最早完成時間 (EF)
    task.ef = task.es + task.duration
  }
}

/**
 * 輔助函式：根據依賴關係類型和Lag值計算反向時間約束（用於backward pass）
 * 需要分別處理約束 LF 和約束 LS 的情況
 * 
 * 重要：所有反向約束都必須減去（subtract）lag值
 * - 正lag：predecessor必須更早完成/開始（約束更嚴格）
 * - 負lag：predecessor可以更晚完成/開始（約束更寬鬆）
 * - 零lag：predecessor直接受successor約束
 */
function calculateBackwardConstraint(dep: Dependency, succTask: CPMTask, predTask: CPMTask): { lf?: number; ls?: number } {
  const lag = dep.lag || 0
  
  switch (dep.type) {
    case 'FS':
      // FS (Finish-to-Start): predecessor.EF + lag ≤ successor.ES
      // 反向推導: predecessor.LF ≤ successor.LS - lag
      // 
      // 範例（正lag）：
      //   successor.LS = 20, lag = 5
      //   predecessor.LF ≤ 20 - 5 = 15
      //   含義：前置任務最晚第15天完成，加5天lag，後續第20天開始
      // 
      // 範例（負lag）：
      //   successor.LS = 20, lag = -3
      //   predecessor.LF ≤ 20 - (-3) = 23
      //   含義：前置任務最晚第23天完成，減3天lag（快速跟進），後續第20天開始
      return { lf: (succTask.ls || 0) - lag }
      
    case 'SS':
      // SS (Start-to-Start): predecessor.ES + lag ≤ successor.ES
      // 反向推導: predecessor.LS ≤ successor.LS - lag
      // 
      // 範例：successor.LS = 10, lag = 3
      //       predecessor.LS ≤ 10 - 3 = 7
      return { ls: (succTask.ls || 0) - lag }
      
    case 'FF':
      // FF (Finish-to-Finish): predecessor.EF + lag ≤ successor.EF
      // 反向推導: predecessor.LF ≤ successor.LF - lag
      // 
      // 範例：successor.LF = 15, lag = 2
      //       predecessor.LF ≤ 15 - 2 = 13
      return { lf: (succTask.lf || 0) - lag }
      
    case 'SF':
      // SF (Start-to-Finish): predecessor.ES + lag ≤ successor.EF
      // 反向推導: predecessor.LS ≤ successor.LF - lag
      // 
      // 範例：successor.LF = 12, lag = 4
      //       predecessor.LS ≤ 12 - 4 = 8
      return { ls: (succTask.lf || 0) - lag }
      
    default:
      return { lf: (succTask.ls || 0) - lag }
  }
}

/**
 * Backward Pass - 計算 LS 和 LF
 */
function backwardPass(tasks: CPMTask[], sortedIds: string[]): void {
  const taskMap = new Map<string, CPMTask>()
  tasks.forEach(task => taskMap.set(task.id, task))

  // 找出專案總工期
  let projectDuration = 0
  const endTasks: CPMTask[] = []
  
  tasks.forEach(task => {
    if (task.successors.length === 0) {
      task.isEnd = true
      endTasks.push(task)
      if (task.ef !== undefined) {
        projectDuration = Math.max(projectDuration, task.ef)
      }
    }
  })

  // 初始化結束任務的 LF
  endTasks.forEach(task => {
    task.lf = projectDuration
    task.ls = task.lf - task.duration
  })

  // 反向遍歷
  for (let i = sortedIds.length - 1; i >= 0; i--) {
    const taskId = sortedIds[i]
    if (!taskId) continue // 類型守衛
    const task = taskMap.get(taskId)
    if (!task) continue // 類型守衛
    
    if (task.lf === undefined) {
      // 計算最晚完成時間 (LF) 和最晚開始時間 (LS)
      if (task.successors.length === 0) {
        task.lf = projectDuration
        task.ls = task.lf - task.duration
      } else {
        let minLF = Infinity
        let minLS = Infinity
        
        for (const succDep of task.successors) {
          const succ = taskMap.get(succDep.taskId)
          if (succ && succ.ls !== undefined && succ.lf !== undefined) {
            const constraint = calculateBackwardConstraint(succDep, succ, task)
            
            // 收集 LF 約束
            if (constraint.lf !== undefined) {
              minLF = Math.min(minLF, constraint.lf)
            }
            
            // 收集 LS 約束
            if (constraint.ls !== undefined) {
              minLS = Math.min(minLS, constraint.ls)
            }
          }
        }
        
        // 根據約束計算 LS 和 LF
        // 策略：LS 和 LF 必須滿足 LF = LS + duration 的關係
        // 同時必須滿足所有約束：LS ≤ minLS 且 LF ≤ minLF
        
        if (minLS !== Infinity && minLF !== Infinity) {
          // 同時有 LS 和 LF 約束
          // 從 LS 約束推導的 LF
          const lfFromLS = minLS + task.duration
          // 從 LF 約束推導的 LS
          const lsFromLF = minLF - task.duration
          
          // 需要同時滿足兩個約束，取更嚴格的（即使得時間窗口更緊的）
          // 如果 lfFromLS ≤ minLF，說明 LS 約束更嚴格，使用 minLS
          // 如果 lsFromLF ≤ minLS，說明 LF 約束更嚴格，使用 minLF
          if (lfFromLS <= minLF) {
            // LS 約束導致的 LF 不超過 minLF，使用 LS 約束
            task.ls = minLS
            task.lf = lfFromLS
          } else {
            // LF 約束更嚴格，使用 LF 約束
            task.lf = minLF
            task.ls = lsFromLF
          }
        } else if (minLS !== Infinity) {
          // 只有 LS 約束
          task.ls = minLS
          task.lf = minLS + task.duration
        } else if (minLF !== Infinity) {
          // 只有 LF 約束
          task.lf = minLF
          task.ls = minLF - task.duration
        } else {
          // 沒有約束（不應該發生）
          task.lf = projectDuration
          task.ls = projectDuration - task.duration
        }
      }
    }
  }
}

/**
 * 計算浮時和識別關鍵路徑
 */
function calculateFloatAndCriticalPath(tasks: CPMTask[]): string[] {
  const criticalPath: string[] = []

  tasks.forEach(task => {
    if (task.es !== undefined && task.ls !== undefined && 
        task.ef !== undefined && task.lf !== undefined) {
      
      // 計算總浮時 (Total Float)
      task.tf = task.ls - task.es
      
      // 計算自由浮時 (Free Float)
      // FF 是在不延遲任何後續任務的前提下，任務可以延遲的最大時間
      const taskMap = new Map<string, CPMTask>()
      tasks.forEach(t => taskMap.set(t.id, t))
      
      if (task.successors.length === 0) {
        // 結束任務的 FF = TF
        task.ff = task.tf || 0
      } else {
        let minFloat = Infinity
        
        // 對每個後續任務，根據依賴類型計算約束
        for (const succDep of task.successors) {
          const succ = taskMap.get(succDep.taskId)
          if (succ && succ.es !== undefined && succ.ef !== undefined) {
            const lag = succDep.lag || 0
            let allowedFloat = 0
            
            switch (succDep.type) {
              case 'FS':
                // FS: succ.ES 不能小於 pred.EF + lag
                // 所以 pred.EF 最多可以延遲到 succ.ES - lag
                allowedFloat = succ.es - lag - task.ef
                break
              case 'SS':
                // SS: succ.ES 不能小於 pred.ES + lag
                // 所以 pred.ES 最多可以延遲到 succ.ES - lag
                // 這會影響 pred.EF = pred.ES + duration
                allowedFloat = succ.es - lag - task.es
                break
              case 'FF':
                // FF: succ.EF 不能小於 pred.EF + lag
                // 所以 pred.EF 最多可以延遲到 succ.EF - lag
                allowedFloat = succ.ef - lag - task.ef
                break
              case 'SF':
                // SF: succ.EF 不能小於 pred.ES + lag
                // 所以 pred.ES 最多可以延遲到 succ.EF - lag
                allowedFloat = succ.ef - lag - task.es
                break
            }
            
            minFloat = Math.min(minFloat, allowedFloat)
          }
        }
        
        task.ff = minFloat === Infinity ? 0 : Math.max(0, minFloat)
      }
      
      // 標記關鍵路徑（TF = 0）
      task.isCritical = Math.abs(task.tf) < 0.001 // 使用小誤差範圍
      
      if (task.isCritical) {
        criticalPath.push(task.id)
      }
    }
  })

  return criticalPath
}

/**
 * 驗證任務資料
 */
function validateTasks(tasks: CPMTask[]): string[] {
  const errors: string[] = []
  
  if (tasks.length === 0) {
    errors.push('至少需要一個工項')
    return errors
  }

  const taskIds = new Set<string>()
  
  tasks.forEach((task, index) => {
    // 檢查必填欄位
    if (!task.id) {
      errors.push(`工項 ${index + 1}: 缺少ID`)
    }
    if (!task.name) {
      errors.push(`工項 ${index + 1}: 缺少名稱`)
    }
    if (task.duration === undefined || task.duration === null) {
      errors.push(`工項 "${task.name}": 缺少工期`)
    }
    if (task.duration <= 0) {
      errors.push(`工項 "${task.name}": 工期必須為正數`)
    }
    
    // 檢查重複ID
    if (taskIds.has(task.id)) {
      errors.push(`工項 "${task.name}": ID重複`)
    }
    taskIds.add(task.id)
  })

  // 檢查依賴關係是否有效
  tasks.forEach(task => {
    task.predecessors.forEach(predDep => {
      const predId = predDep.taskId
      if (!taskIds.has(predId)) {
        errors.push(`工項 "${task.name}": 前置工項 "${predId}" 不存在`)
      }
    })
    task.successors.forEach(succDep => {
      const succId = succDep.taskId
      if (!taskIds.has(succId)) {
        errors.push(`工項 "${task.name}": 後續工項 "${succId}" 不存在`)
      }
    })
  })

  return errors
}

/**
 * 執行完整的 CPM 計算
 */
export function calculateCPM(tasks: CPMTask[]): CPMResult {
  // 深拷貝任務陣列，避免修改原資料
  const tasksCopy: CPMTask[] = JSON.parse(JSON.stringify(tasks))
  
  // 驗證資料
  const validationErrors = validateTasks(tasksCopy)
  if (validationErrors.length > 0) {
    return {
      tasks: tasksCopy,
      criticalPath: [],
      totalDuration: 0,
      startTasks: [],
      endTasks: [],
      hasCycle: false,
      errors: validationErrors
    }
  }

  // 檢測循環依賴
  const hasCycle = detectCycle(tasksCopy)
  if (hasCycle) {
    return {
      tasks: tasksCopy,
      criticalPath: [],
      totalDuration: 0,
      startTasks: [],
      endTasks: [],
      hasCycle: true,
      errors: ['檢測到循環依賴，請檢查任務之間的依賴關係']
    }
  }

  // 拓撲排序
  const sortedIds = topologicalSort(tasksCopy)

  // Forward Pass
  forwardPass(tasksCopy, sortedIds)

  // Backward Pass
  backwardPass(tasksCopy, sortedIds)

  // 計算浮時和識別關鍵路徑
  const criticalPath = calculateFloatAndCriticalPath(tasksCopy)

  // 計算總工期
  let totalDuration = 0
  const startTasks: string[] = []
  const endTasks: string[] = []

  tasksCopy.forEach(task => {
    if (task.ef !== undefined) {
      totalDuration = Math.max(totalDuration, task.ef)
    }
    if (task.isStart) {
      startTasks.push(task.id)
    }
    if (task.isEnd) {
      endTasks.push(task.id)
    }
  })

  return {
    tasks: tasksCopy,
    criticalPath,
    totalDuration,
    startTasks,
    endTasks,
    hasCycle: false
  }
}

/**
 * 從輸入資料建立 CPM 任務
 */
export function createTaskFromInput(
  name: string,
  duration: number,
  predecessor?: string,
  successor?: string
): CPMTask {
  const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    id,
    name,
    duration,
    predecessors: predecessor ? [{ taskId: predecessor, type: 'FS' }] : [],
    successors: successor ? [{ taskId: successor, type: 'FS' }] : []
  }
}

/**
 * 建構任務依賴關係（自動補全雙向依賴）
 */
export function buildTaskDependencies(tasks: CPMTask[]): CPMTask[] {
  const taskMap = new Map<string, CPMTask>()
  
  // 複製任務並建立映射
  const tasksCopy = tasks.map(task => ({
    ...task,
    predecessors: [...task.predecessors],
    successors: [...task.successors]
  }))
  tasksCopy.forEach(task => taskMap.set(task.id, task))

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
          // 如果存在，更新 lag 值以確保一致性
          existingDep.lag = predDep.lag
        } else {
          // 如果不存在，新增新的依賴關係（包含完整的 type 和 lag）
          pred.successors.push({ 
            taskId: task.id, 
            type: predDep.type, 
            lag: predDep.lag 
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
          // 如果存在，更新 lag 值以確保一致性
          existingDep.lag = succDep.lag
        } else {
          // 如果不存在，新增新的依賴關係（包含完整的 type 和 lag）
          succ.predecessors.push({ 
            taskId: task.id, 
            type: succDep.type, 
            lag: succDep.lag 
          })
        }
      }
    })
  })

  return tasksCopy
}
