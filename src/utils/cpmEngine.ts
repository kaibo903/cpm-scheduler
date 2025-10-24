import type { CPMTask, CPMResult, Dependency } from '../types'

/**
 * CPM (Critical Path Method) 引擎
 * 实现关键路径法的完整算法
 */

/**
 * 辅助函数：从依赖数组中提取任务ID
 */
function getDepTaskIds(deps: Dependency[]): string[] {
  return deps.map(d => d.taskId)
}

/**
 * 辅助函数：根据依赖关系类型和Lag值计算后续任务的最早开始时间约束
 * 
 * 各类型的约束关系：
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
      // 含义：后续任务必须在前置任务完成后 lag 天才能完成
      // 
      // 推导：
      //   predecessor.EF + lag ≤ successor.EF
      //   predecessor.EF + lag ≤ successor.ES + successor.duration
      //   successor.ES ≥ predecessor.EF + lag - successor.duration
      //
      // 示例：
      //   前置任务在第10天完成，lag=2，后续任务工期=5天
      //   则后续任务最早在第 10+2-5=7 天开始，在第12天完成
      //
      // 注意：如果 predecessor.EF + lag < successor.duration，
      //       计算结果可能为负，表示后续任务需要提前开始
      //       这在有其他约束时是合理的（会取所有约束的最大值）
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
 * 检测循环依赖
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
        return true // 发现循环
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
 * 拓扑排序（使用 Kahn's Algorithm）
 */
function topologicalSort(tasks: CPMTask[]): string[] {
  const taskMap = new Map<string, CPMTask>()
  const inDegree = new Map<string, number>()
  
  // 初始化
  tasks.forEach(task => {
    taskMap.set(task.id, task)
    inDegree.set(task.id, task.predecessors.length)
  })

  // 找出所有入度为0的节点
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
 * Forward Pass - 计算 ES 和 EF
 */
function forwardPass(tasks: CPMTask[], sortedIds: string[]): void {
  const taskMap = new Map<string, CPMTask>()
  tasks.forEach(task => taskMap.set(task.id, task))

  for (const taskId of sortedIds) {
    const task = taskMap.get(taskId)!
    
    // 计算最早开始时间 (ES)
    if (task.predecessors.length === 0) {
      task.es = 0
      task.isStart = true
    } else {
      // 初始化为 0，确保 ES 至少为 0（不能在项目开始前开始）
      let maxES = 0
      
      for (const predDep of task.predecessors) {
        const pred = taskMap.get(predDep.taskId)
        if (pred && pred.ef !== undefined) {
          const constraintTime = calculateConstraint(predDep, pred, task)
          // 取所有约束的最大值
          maxES = Math.max(maxES, constraintTime)
        }
      }
      
      // 确保 ES 不为负数
      task.es = Math.max(0, maxES)
    }
    
    // 计算最早完成时间 (EF)
    task.ef = task.es + task.duration
  }
}

/**
 * 辅助函数：根据依赖关系类型和Lag值计算反向时间约束（用于backward pass）
 * 需要分别处理约束 LF 和约束 LS 的情况
 * 
 * 重要：所有反向约束都必须减去（subtract）lag值
 * - 正lag：predecessor必须更早完成/开始（约束更严格）
 * - 负lag：predecessor可以更晚完成/开始（约束更宽松）
 * - 零lag：predecessor直接受successor约束
 */
function calculateBackwardConstraint(dep: Dependency, succTask: CPMTask, predTask: CPMTask): { lf?: number; ls?: number } {
  const lag = dep.lag || 0
  
  switch (dep.type) {
    case 'FS':
      // FS (Finish-to-Start): predecessor.EF + lag ≤ successor.ES
      // 反向推导: predecessor.LF ≤ successor.LS - lag
      // 
      // 示例（正lag）：
      //   successor.LS = 20, lag = 5
      //   predecessor.LF ≤ 20 - 5 = 15
      //   含义：前置任务最晚第15天完成，加5天lag，后续第20天开始
      // 
      // 示例（负lag）：
      //   successor.LS = 20, lag = -3
      //   predecessor.LF ≤ 20 - (-3) = 23
      //   含义：前置任务最晚第23天完成，减3天lag（快速跟进），后续第20天开始
      return { lf: (succTask.ls || 0) - lag }
      
    case 'SS':
      // SS (Start-to-Start): predecessor.ES + lag ≤ successor.ES
      // 反向推导: predecessor.LS ≤ successor.LS - lag
      // 
      // 示例：successor.LS = 10, lag = 3
      //       predecessor.LS ≤ 10 - 3 = 7
      return { ls: (succTask.ls || 0) - lag }
      
    case 'FF':
      // FF (Finish-to-Finish): predecessor.EF + lag ≤ successor.EF
      // 反向推导: predecessor.LF ≤ successor.LF - lag
      // 
      // 示例：successor.LF = 15, lag = 2
      //       predecessor.LF ≤ 15 - 2 = 13
      return { lf: (succTask.lf || 0) - lag }
      
    case 'SF':
      // SF (Start-to-Finish): predecessor.ES + lag ≤ successor.EF
      // 反向推导: predecessor.LS ≤ successor.LF - lag
      // 
      // 示例：successor.LF = 12, lag = 4
      //       predecessor.LS ≤ 12 - 4 = 8
      return { ls: (succTask.lf || 0) - lag }
      
    default:
      return { lf: (succTask.ls || 0) - lag }
  }
}

/**
 * Backward Pass - 计算 LS 和 LF
 */
function backwardPass(tasks: CPMTask[], sortedIds: string[]): void {
  const taskMap = new Map<string, CPMTask>()
  tasks.forEach(task => taskMap.set(task.id, task))

  // 找出项目总工期
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

  // 初始化结束任务的 LF
  endTasks.forEach(task => {
    task.lf = projectDuration
    task.ls = task.lf - task.duration
  })

  // 反向遍历
  for (let i = sortedIds.length - 1; i >= 0; i--) {
    const taskId = sortedIds[i]
    const task = taskMap.get(taskId)!
    
    if (task.lf === undefined) {
      // 计算最晚完成时间 (LF) 和最晚开始时间 (LS)
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
            
            // 收集 LF 约束
            if (constraint.lf !== undefined) {
              minLF = Math.min(minLF, constraint.lf)
            }
            
            // 收集 LS 约束
            if (constraint.ls !== undefined) {
              minLS = Math.min(minLS, constraint.ls)
            }
          }
        }
        
        // 根据约束计算 LS 和 LF
        // 策略：LS 和 LF 必须满足 LF = LS + duration 的关系
        // 同时必须满足所有约束：LS ≤ minLS 且 LF ≤ minLF
        
        if (minLS !== Infinity && minLF !== Infinity) {
          // 同时有 LS 和 LF 约束
          // 从 LS 约束推导的 LF
          const lfFromLS = minLS + task.duration
          // 从 LF 约束推导的 LS
          const lsFromLF = minLF - task.duration
          
          // 需要同时满足两个约束，取更严格的（即使得时间窗口更紧的）
          // 如果 lfFromLS ≤ minLF，说明 LS 约束更严格，使用 minLS
          // 如果 lsFromLF ≤ minLS，说明 LF 约束更严格，使用 minLF
          if (lfFromLS <= minLF) {
            // LS 约束导致的 LF 不超过 minLF，使用 LS 约束
            task.ls = minLS
            task.lf = lfFromLS
          } else {
            // LF 约束更严格，使用 LF 约束
            task.lf = minLF
            task.ls = lsFromLF
          }
        } else if (minLS !== Infinity) {
          // 只有 LS 约束
          task.ls = minLS
          task.lf = minLS + task.duration
        } else if (minLF !== Infinity) {
          // 只有 LF 约束
          task.lf = minLF
          task.ls = minLF - task.duration
        } else {
          // 没有约束（不应该发生）
          task.lf = projectDuration
          task.ls = projectDuration - task.duration
        }
      }
    }
  }
}

/**
 * 计算浮时和识别关键路径
 */
function calculateFloatAndCriticalPath(tasks: CPMTask[]): string[] {
  const criticalPath: string[] = []

  tasks.forEach(task => {
    if (task.es !== undefined && task.ls !== undefined && 
        task.ef !== undefined && task.lf !== undefined) {
      
      // 计算总浮时 (Total Float)
      task.tf = task.ls - task.es
      
      // 计算自由浮时 (Free Float)
      // FF 是在不延迟任何后续任务的前提下，任务可以延迟的最大时间
      const taskMap = new Map<string, CPMTask>()
      tasks.forEach(t => taskMap.set(t.id, t))
      
      if (task.successors.length === 0) {
        // 结束任务的 FF = TF
        task.ff = task.tf || 0
      } else {
        let minFloat = Infinity
        
        // 对每个后续任务，根据依赖类型计算约束
        for (const succDep of task.successors) {
          const succ = taskMap.get(succDep.taskId)
          if (succ && succ.es !== undefined && succ.ef !== undefined) {
            const lag = succDep.lag || 0
            let allowedFloat = 0
            
            switch (succDep.type) {
              case 'FS':
                // FS: succ.ES 不能小于 pred.EF + lag
                // 所以 pred.EF 最多可以延迟到 succ.ES - lag
                allowedFloat = succ.es - lag - task.ef
                break
              case 'SS':
                // SS: succ.ES 不能小于 pred.ES + lag
                // 所以 pred.ES 最多可以延迟到 succ.ES - lag
                // 这会影响 pred.EF = pred.ES + duration
                allowedFloat = succ.es - lag - task.es
                break
              case 'FF':
                // FF: succ.EF 不能小于 pred.EF + lag
                // 所以 pred.EF 最多可以延迟到 succ.EF - lag
                allowedFloat = succ.ef - lag - task.ef
                break
              case 'SF':
                // SF: succ.EF 不能小于 pred.ES + lag
                // 所以 pred.ES 最多可以延迟到 succ.EF - lag
                allowedFloat = succ.ef - lag - task.es
                break
            }
            
            minFloat = Math.min(minFloat, allowedFloat)
          }
        }
        
        task.ff = minFloat === Infinity ? 0 : Math.max(0, minFloat)
      }
      
      // 标记关键路径（TF = 0）
      task.isCritical = Math.abs(task.tf) < 0.001 // 使用小误差范围
      
      if (task.isCritical) {
        criticalPath.push(task.id)
      }
    }
  })

  return criticalPath
}

/**
 * 验证任务数据
 */
function validateTasks(tasks: CPMTask[]): string[] {
  const errors: string[] = []
  
  if (tasks.length === 0) {
    errors.push('至少需要一个工项')
    return errors
  }

  const taskIds = new Set<string>()
  
  tasks.forEach((task, index) => {
    // 检查必填字段
    if (!task.id) {
      errors.push(`工项 ${index + 1}: 缺少ID`)
    }
    if (!task.name) {
      errors.push(`工项 ${index + 1}: 缺少名称`)
    }
    if (task.duration === undefined || task.duration === null) {
      errors.push(`工项 "${task.name}": 缺少工期`)
    }
    if (task.duration <= 0) {
      errors.push(`工项 "${task.name}": 工期必须为正数`)
    }
    
    // 检查重复ID
    if (taskIds.has(task.id)) {
      errors.push(`工项 "${task.name}": ID重复`)
    }
    taskIds.add(task.id)
  })

  // 检查依赖关系是否有效
  tasks.forEach(task => {
    task.predecessors.forEach(predDep => {
      const predId = predDep.taskId
      if (!taskIds.has(predId)) {
        errors.push(`工项 "${task.name}": 前置工项 "${predId}" 不存在`)
      }
    })
    task.successors.forEach(succDep => {
      const succId = succDep.taskId
      if (!taskIds.has(succId)) {
        errors.push(`工项 "${task.name}": 后续工项 "${succId}" 不存在`)
      }
    })
  })

  return errors
}

/**
 * 执行完整的 CPM 计算
 */
export function calculateCPM(tasks: CPMTask[]): CPMResult {
  // 深拷贝任务数组，避免修改原数据
  const tasksCopy: CPMTask[] = JSON.parse(JSON.stringify(tasks))
  
  // 验证数据
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

  // 检测循环依赖
  const hasCycle = detectCycle(tasksCopy)
  if (hasCycle) {
    return {
      tasks: tasksCopy,
      criticalPath: [],
      totalDuration: 0,
      startTasks: [],
      endTasks: [],
      hasCycle: true,
      errors: ['检测到循环依赖，请检查任务之间的依赖关系']
    }
  }

  // 拓扑排序
  const sortedIds = topologicalSort(tasksCopy)

  // Forward Pass
  forwardPass(tasksCopy, sortedIds)

  // Backward Pass
  backwardPass(tasksCopy, sortedIds)

  // 计算浮时和识别关键路径
  const criticalPath = calculateFloatAndCriticalPath(tasksCopy)

  // 计算总工期
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
 * 从输入数据创建 CPM 任务
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
 * 构建任务依赖关系（自动补全双向依赖）
 */
export function buildTaskDependencies(tasks: CPMTask[]): CPMTask[] {
  const taskMap = new Map<string, CPMTask>()
  
  // 复制任务并建立映射
  const tasksCopy = tasks.map(task => ({
    ...task,
    predecessors: [...task.predecessors],
    successors: [...task.successors]
  }))
  tasksCopy.forEach(task => taskMap.set(task.id, task))

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
          // 如果存在，更新 lag 值以确保一致性
          existingDep.lag = predDep.lag
        } else {
          // 如果不存在，添加新的依赖关系（包含完整的 type 和 lag）
          pred.successors.push({ 
            taskId: task.id, 
            type: predDep.type, 
            lag: predDep.lag 
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
          // 如果存在，更新 lag 值以确保一致性
          existingDep.lag = succDep.lag
        } else {
          // 如果不存在，添加新的依赖关系（包含完整的 type 和 lag）
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

