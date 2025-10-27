/**
 * 📦 TCT 工期-成本權衡最佳化引擎（V2 - 基於 TCT.md 規格）
 * 
 * 功能說明：
 * - 實現線性規劃（LP）連續趕工模型
 * - 考慮間接成本（Overhead Cost）
 * - 計算最佳開工時間、趕工天數
 * - 生成成本-時間權衡曲線
 * - 支援前置關係約束
 * 
 * 數學模型：
 * - 決策變數：S_i (開工時間), d_i (實際工期), y_i (趕工天數), T (專案完工時間)
 * - 目標函數：min Σ(crash_cost_per_day × y_i) + overhead_cost_per_day × T
 * - 限制式：
 *   - d_i = duration_normal - y_i
 *   - 0 ≤ y_i ≤ duration_normal - duration_min
 *   - S_j ≥ S_i + d_i  ∀(i → j) 前置關係
 *   - T ≥ S_i + d_i  ∀i
 */

/**
 * 📊 TCT 作業資料結構（V3 - 使用總成本輸入）
 */
export interface TCTTask {
  name: string                  // 作業名稱（唯一識別）
  normal_duration: number       // 正常工期（天）
  crash_duration: number        // 趕工工期（天）
  normal_cost: number           // 正常成本（元）
  crash_cost: number            // 趕工成本（元）
  predecessors: string[]        // 前置作業名稱列表
  
  // 🧮 計算屬性（內部使用）
  crash_cost_per_day?: number  // 趕工單位成本（元/天）= (crash_cost - normal_cost) / (normal_duration - crash_duration)
  
  // 計算結果
  start_time?: number           // 最佳開工時間 S_i
  actual_duration?: number      // 實際工期 d_i
  crash_days?: number           // 趕工天數 y_i
  isCritical?: boolean          // 是否為要徑作業
  
  // CPM 計算結果
  es?: number                   // 最早開始時間
  ef?: number                   // 最早完成時間
  ls?: number                   // 最晚開始時間
  lf?: number                   // 最晚完成時間
  tf?: number                   // 總浮時
}

/**
 * 📊 專案參數
 */
export interface ProjectParams {
  overhead_cost_per_day: number    // 間接成本（元/天）
  penalty_per_day: number           // 預期罰金（元/天）
  deadline?: number                 // 目標工期（選填）
  budget?: number                   // 預算上限（選填）
}

/**
 * 📊 趕工循環記錄
 */
export interface CrashIteration {
  iteration: number                 // 趕工循環次數
  duration: number                  // 總工期
  crashedTask: string               // 壓縮作業項目
  directCost: number                // 直接成本（正常成本總和 + 累計趕工額外成本）
  overheadCost: number              // 間接成本
  penaltyCost: number               // 逾期罰金
  totalCost: number                 // 總成本
}

/**
 * 📊 TCT 最佳化結果（V3）
 */
export interface TCTResult {
  success: boolean                  // 是否成功
  optimal_duration: number          // 最佳專案工期 T*
  optimal_cost: number              // 最低總成本 C*
  crash_cost: number                // 總趕工成本
  overhead_cost: number             // 總間接成本
  penalty_cost: number              // 總逾期罰金
  normal_duration: number           // 正常工期（不趕工）
  normal_cost: number               // 正常總成本
  cost_saving: number               // 節省成本
  tasks: TCTTask[]                  // 作業列表（含開工時間、實際工期、趕工天數）
  criticalPath: string[]            // 要徑
  crashIterations: CrashIteration[] // 趕工循環記錄
  errorMessage?: string             // 錯誤訊息
}

/**
 * 📊 成本-時間曲線點
 */
export interface CostTimePoint {
  duration: number              // 工期
  cost: number                  // 總成本
  crash_cost: number            // 趕工成本
  overhead_cost: number         // 間接成本
}

/**
 * 🔄 拓樸排序（檢測循環依賴）
 * 
 * @param tasks - 作業列表
 * @returns 排序後的作業名稱列表，如有循環則返回 null
 */
function topologicalSort(tasks: TCTTask[]): string[] | null {
  const sorted: string[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()
  
  const taskMap = new Map<string, TCTTask>()
  tasks.forEach(task => taskMap.set(task.name, task))

  function visit(taskName: string): boolean {
    if (visited.has(taskName)) return true
    if (visiting.has(taskName)) {
      // 檢測到循環
      return false
    }
    
    visiting.add(taskName)
    
    const task = taskMap.get(taskName)
    if (task) {
      for (const predName of task.predecessors) {
        if (taskMap.has(predName)) {
          if (!visit(predName)) return false
        }
      }
    }
    
    visiting.delete(taskName)
    visited.add(taskName)
    sorted.push(taskName)
    return true
  }

  for (const task of tasks) {
    if (!visited.has(task.name)) {
      if (!visit(task.name)) {
        return null // 有循環依賴
      }
    }
  }

  return sorted
}

/**
 * 🔍 執行 CPM 計算（Forward Pass + Backward Pass）
 * 
 * @param tasks - 作業列表
 * @returns 專案工期和要徑
 */
function calculateCPM(tasks: TCTTask[]): { 
  projectDuration: number
  criticalPath: string[]
} {
  // 🔗 建立任務映射
  const taskMap = new Map<string, TCTTask>()
  tasks.forEach(task => {
    taskMap.set(task.name, task)
    // 初始化 CPM 值
    task.es = 0
    task.ef = 0
    task.ls = 0
    task.lf = 0
    task.tf = 0
    task.isCritical = false
  })

  // 🔄 Forward Pass（前向計算）
  const sortedTasks = topologicalSort(tasks)
  if (!sortedTasks) {
    return { projectDuration: 0, criticalPath: [] }
  }
  
  for (const taskName of sortedTasks) {
    const task = taskMap.get(taskName)!
    
    // 🔍 計算最早開始時間
    if (task.predecessors.length === 0) {
      task.es = 0
    } else {
      task.es = Math.max(
        ...task.predecessors.map(predName => {
          const pred = taskMap.get(predName)
          return pred ? (pred.ef || 0) : 0
        })
      )
    }
    
    // 🧮 計算最早完成時間（使用實際工期）
    const duration = task.actual_duration !== undefined 
      ? task.actual_duration 
      : task.normal_duration
    task.ef = task.es + duration
  }

  // 📊 計算專案總工期
  const projectDuration = Math.max(...tasks.map(t => t.ef || 0))

  // 🔄 Backward Pass（後向計算）
  const reversedTasks = [...sortedTasks].reverse()
  
  // 🔗 建立後續作業映射
  const successorsMap = new Map<string, string[]>()
  tasks.forEach(task => {
    successorsMap.set(task.name, [])
  })
  tasks.forEach(task => {
    task.predecessors.forEach(predName => {
      const succs = successorsMap.get(predName)
      if (succs) {
        succs.push(task.name)
      }
    })
  })

  for (const taskName of reversedTasks) {
    const task = taskMap.get(taskName)!
    const successors = successorsMap.get(taskName) || []
    
    // 🔍 計算最晚完成時間
    if (successors.length === 0) {
      task.lf = projectDuration
    } else {
      task.lf = Math.min(
        ...successors.map(succName => {
          const succ = taskMap.get(succName)
          return succ ? (succ.ls || 0) : projectDuration
        })
      )
    }
    
    // 🧮 計算最晚開始時間
    const duration = task.actual_duration !== undefined 
      ? task.actual_duration 
      : task.normal_duration
    task.ls = task.lf - duration
    
    // 📊 計算總浮時
    task.tf = task.ls - (task.es || 0)
    
    // 🎯 判斷是否為要徑
    task.isCritical = Math.abs(task.tf) < 0.001
  }

  // 🔗 識別要徑
  const criticalPath = tasks
    .filter(t => t.isCritical)
    .map(t => t.name)

  return { projectDuration, criticalPath }
}

/**
 * 🎯 TCT 最佳化求解器（線性規劃簡化版）
 * 
 * 演算法邏輯：
 * 1. 計算正常情況的專案工期和成本
 * 2. 迭代趕工要徑上成本效益最高的作業
 * 3. 當總成本不再降低時停止
 * 
 * 目標：最小化 total_cost = crash_cost + overhead_cost
 *       其中 crash_cost = Σ(crash_cost_per_day × crash_days)
 *           overhead_cost = overhead_cost_per_day × project_duration
 * 
 * @param tasks - 作業列表
 * @param params - 專案參數
 * @returns 最佳化結果
 */
export function solveTCT(
  tasks: TCTTask[], 
  params: ProjectParams
): TCTResult {
  // 🚀 初始化
  const workingTasks = JSON.parse(JSON.stringify(tasks)) as TCTTask[]
  
  // 計算每個作業的趕工單位成本
  workingTasks.forEach(task => {
    const durationDiff = task.normal_duration - task.crash_duration
    const costDiff = task.crash_cost - task.normal_cost
    task.crash_cost_per_day = durationDiff > 0 ? costDiff / durationDiff : 0
  })
  
  // 初始化實際工期 = 正常工期，趕工天數 = 0
  workingTasks.forEach(task => {
    task.actual_duration = task.normal_duration
    task.crash_days = 0
    task.start_time = 0
  })
  
  // 📊 計算正常情況
  let cpmResult = calculateCPM(workingTasks)
  const normalDuration = cpmResult.projectDuration
  const normalCost = params.overhead_cost_per_day * normalDuration
  
  // 🔍 檢查循環依賴
  if (normalDuration === 0) {
    return {
      success: false,
      optimal_duration: 0,
      optimal_cost: 0,
      crash_cost: 0,
      overhead_cost: 0,
      penalty_cost: 0,
      normal_duration: 0,
      normal_cost: 0,
      cost_saving: 0,
      tasks: workingTasks,
      criticalPath: [],
      crashIterations: [],
      errorMessage: '檢測到循環依賴或資料錯誤'
    }
  }
  
  // 📝 記錄趕工循環
  const crashIterations: CrashIteration[] = []
  
  // 🧮 計算所有作業的正常成本總和（基礎直接成本）
  const baseDirectCost = workingTasks.reduce((sum, task) => sum + task.normal_cost, 0)
  
  // 📊 記錄正常情況（循環 0）
  const normalOverheadCost = params.overhead_cost_per_day * normalDuration
  // 逾期罰金 = penalty_per_day × max(0, duration - deadline)
  const normalPenaltyCost = params.deadline 
    ? params.penalty_per_day * Math.max(0, normalDuration - params.deadline)
    : 0
  const normalTotalCost = baseDirectCost + normalOverheadCost + normalPenaltyCost
  
  crashIterations.push({
    iteration: 0,
    duration: normalDuration,
    crashedTask: '—',
    directCost: baseDirectCost,
    overheadCost: normalOverheadCost,
    penaltyCost: normalPenaltyCost,
    totalCost: normalTotalCost
  })
  
  // 📈 開始迭代趕工
  let currentDuration = normalDuration
  let crashCost = 0
  let iterations = 0
  const maxIterations = 1000
  const attemptedTasks = new Set<string>()  // 記錄本輪已嘗試的作業
  
  while (iterations < maxIterations) {
    iterations++
    
    // 🔍 找出要徑上可趕工的作業（排除本輪已嘗試但失敗的）
    const criticalTasks = workingTasks.filter(t => 
      t.isCritical && 
      (t.actual_duration || t.normal_duration) > t.crash_duration &&
      !attemptedTasks.has(t.name)
    )
    
    if (criticalTasks.length === 0) {
      // 所有要徑作業都已嘗試或無法再趕工
      break
    }
    
    // 🧮 選擇趕工單位成本最低的作業
    const candidates = criticalTasks.map(task => ({
      task,
      crashCostPerDay: task.crash_cost_per_day || 0
    }))
    
    // 🎯 選擇趕工單位成本最低的作業
    const best = candidates.reduce((min, c) => 
      c.crashCostPerDay < min.crashCostPerDay ? c : min
    )
    
    // 🔧 趕工 1 天
    best.task.actual_duration = (best.task.actual_duration || best.task.normal_duration) - 1
    best.task.crash_days = (best.task.crash_days || 0) + 1
    crashCost += (best.task.crash_cost_per_day || 0)
    
    // 🔄 重新計算 CPM
    cpmResult = calculateCPM(workingTasks)
    const newDuration = cpmResult.projectDuration
    
    // 📊 如果工期縮短，記錄這次趕工並清空嘗試記錄
    if (newDuration < currentDuration) {
      // 📝 記錄此次成功的趕工
      const newOverheadCost = params.overhead_cost_per_day * newDuration
      const newPenaltyCost = params.deadline
        ? params.penalty_per_day * Math.max(0, newDuration - params.deadline)
        : 0
      const newDirectCost = baseDirectCost + crashCost
      const newTotalCost = newDirectCost + newOverheadCost + newPenaltyCost
      
      crashIterations.push({
        iteration: crashIterations.length,
        duration: newDuration,
        crashedTask: best.task.name,
        directCost: newDirectCost,
        overheadCost: newOverheadCost,
        penaltyCost: newPenaltyCost,
        totalCost: newTotalCost
      })
      
      currentDuration = newDuration
      attemptedTasks.clear()  // 清空嘗試記錄，準備下一輪
    } else {
      // 工期沒有縮短，回退這次趕工
      best.task.actual_duration = (best.task.actual_duration || best.task.normal_duration) + 1
      best.task.crash_days = (best.task.crash_days || 0) - 1
      crashCost -= (best.task.crash_cost_per_day || 0)
      
      // 標記這個作業在本輪已嘗試過
      attemptedTasks.add(best.task.name)
    }
  }
  
  // 📊 找出總成本最低的方案（最佳解）
  const optimalIteration = crashIterations.reduce((min, iter) => 
    iter.totalCost < min.totalCost ? iter : min
  )
  
  const optimalDuration = optimalIteration.duration
  const optimalCost = optimalIteration.totalCost
  const overheadCost = optimalIteration.overheadCost
  const penaltyCost = optimalIteration.penaltyCost
  const optimalCrashCost = optimalIteration.directCost - baseDirectCost
  const costSaving = normalTotalCost - optimalCost
  
  // 📝 設定開工時間（使用 ES）
  workingTasks.forEach(task => {
    task.start_time = task.es
  })
  
  return {
    success: true,
    optimal_duration: optimalDuration,
    optimal_cost: optimalCost,
    crash_cost: optimalCrashCost,
    overhead_cost: overheadCost,
    penalty_cost: penaltyCost,
    normal_duration: normalDuration,
    normal_cost: normalTotalCost,
    cost_saving: costSaving,
    tasks: workingTasks,
    criticalPath: cpmResult.criticalPath,
    crashIterations: crashIterations
  }
}

/**
 * 📈 生成成本-時間權衡曲線
 * 
 * 從正常工期逐步趕工至最短工期，記錄每個點的成本
 * 
 * @param tasks - 作業列表
 * @param params - 專案參數
 * @returns 成本-時間曲線點列表
 */
export function generateCostTimeCurve(
  tasks: TCTTask[], 
  params: ProjectParams
): CostTimePoint[] {
  const points: CostTimePoint[] = []
  
  // 🚀 計算正常情況
  const workingTasks = JSON.parse(JSON.stringify(tasks)) as TCTTask[]
  
  // 計算趕工單位成本
  workingTasks.forEach(task => {
    const durationDiff = task.normal_duration - task.crash_duration
    const costDiff = task.crash_cost - task.normal_cost
    task.crash_cost_per_day = durationDiff > 0 ? costDiff / durationDiff : 0
  })
  
  workingTasks.forEach(task => {
    task.actual_duration = task.normal_duration
    task.crash_days = 0
  })
  
  let cpmResult = calculateCPM(workingTasks)
  const normalDuration = cpmResult.projectDuration
  
  // 📊 添加正常點
  points.push({
    duration: normalDuration,
    cost: params.overhead_cost_per_day * normalDuration,
    crash_cost: 0,
    overhead_cost: params.overhead_cost_per_day * normalDuration
  })
  
  // 🔄 逐步趕工
  let crashCost = 0
  let iterations = 0
  const maxIterations = 1000
  
  while (iterations < maxIterations) {
    iterations++
    
    // 🔍 找出要徑上可趕工的作業
    const criticalTasks = workingTasks.filter(t => 
      t.isCritical && 
      (t.actual_duration || t.normal_duration) > t.crash_duration
    )
    
    if (criticalTasks.length === 0) {
      break
    }
    
    // 🎯 選擇趕工單位成本最低的作業
    const taskToCrash = criticalTasks.reduce((min, t) => 
      (t.crash_cost_per_day || 0) < (min.crash_cost_per_day || 0) ? t : min
    )
    
    // 🔧 趕工 1 天
    taskToCrash.actual_duration = (taskToCrash.actual_duration || taskToCrash.normal_duration) - 1
    taskToCrash.crash_days = (taskToCrash.crash_days || 0) + 1
    crashCost += (taskToCrash.crash_cost_per_day || 0)
    
    // 🔄 重新計算 CPM
    cpmResult = calculateCPM(workingTasks)
    const newDuration = cpmResult.projectDuration
    const overheadCost = params.overhead_cost_per_day * newDuration
    const totalCost = crashCost + overheadCost
    
    // 📊 添加新點
    points.push({
      duration: newDuration,
      cost: totalCost,
      crash_cost: crashCost,
      overhead_cost: overheadCost
    })
  }
  
  return points
}

/**
 * ✅ 驗證作業資料
 * 
 * @param tasks - 作業列表
 * @returns 驗證結果
 */
export function validateTasks(tasks: TCTTask[]): { 
  valid: boolean
  errors: string[] 
} {
  const errors: string[] = []
  
  if (tasks.length === 0) {
    errors.push('至少需要一個作業')
    return { valid: false, errors }
  }
  
  // 檢查名稱唯一性
  const names = new Set<string>()
  tasks.forEach((task, index) => {
    // 檢查必填欄位
    if (!task.name || task.name.trim() === '') {
      errors.push(`作業 ${index + 1}: 名稱不可為空`)
    } else {
      if (names.has(task.name)) {
        errors.push(`作業名稱 "${task.name}" 重複`)
      }
      names.add(task.name)
    }
    
    // 檢查工期
    if (task.normal_duration <= 0) {
      errors.push(`作業 ${task.name}: 正常工期必須大於 0`)
    }
    
    if (task.crash_duration <= 0) {
      errors.push(`作業 ${task.name}: 趕工工期必須大於 0`)
    }
    
    if (task.crash_duration > task.normal_duration) {
      errors.push(`作業 ${task.name}: 趕工工期不可大於正常工期`)
    }
    
    // 檢查成本
    if (task.normal_cost < 0) {
      errors.push(`作業 ${task.name}: 正常成本不可為負數`)
    }
    
    if (task.crash_cost < 0) {
      errors.push(`作業 ${task.name}: 趕工成本不可為負數`)
    }
    
    if (task.crash_cost < task.normal_cost) {
      errors.push(`作業 ${task.name}: 趕工成本應大於或等於正常成本`)
    }
    
    // 檢查前置關係
    task.predecessors.forEach(predName => {
      if (!names.has(predName) && !tasks.some(t => t.name === predName)) {
        errors.push(`作業 ${task.name}: 前置作業 "${predName}" 不存在`)
      }
    })
  })
  
  // 檢查循環依賴
  const sorted = topologicalSort(tasks)
  if (!sorted) {
    errors.push('檢測到循環依賴，請檢查前置關係設定')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
