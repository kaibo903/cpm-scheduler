import type { CPMTask, CPMResult, TaskInput } from '../types'

/**
 * 导出任务为 CSV（5列扩展格式）
 */
export function exportTasksToCSV(tasks: CPMTask[]): void {
  const headers = ['工項名稱', '工期(天)', '前置作業', '關係型式', 'Lag(天)']
  const taskMap = new Map(tasks.map(t => [t.id, t]))
  
  const rows = tasks.map(task => {
    // 如果有多个前置作业，为每个生成一行，或者合并显示
    if (task.predecessors.length === 0) {
      return [
        task.name,
        task.duration.toString(),
        '---',
        '---',
        '---'
      ]
    } else if (task.predecessors.length === 1) {
      // 单个前置作业
      const dep = task.predecessors[0]
      const predName = taskMap.get(dep.taskId)?.name || dep.taskId
      return [
        task.name,
        task.duration.toString(),
        predName,
        dep.type,
        (dep.lag || 0).toString()
      ]
    } else {
      // 多个前置作业，如果关系类型和lag相同，合并显示
      const firstDep = task.predecessors[0]
      const allSameType = task.predecessors.every(d => d.type === firstDep.type)
      const allSameLag = task.predecessors.every(d => (d.lag || 0) === (firstDep.lag || 0))
      
      if (allSameType && allSameLag) {
        // 关系类型和lag相同，可以合并
        const predNames = task.predecessors.map(dep => 
          taskMap.get(dep.taskId)?.name || dep.taskId
        ).join(', ')
        return [
          task.name,
          task.duration.toString(),
          predNames,
          firstDep.type,
          (firstDep.lag || 0).toString()
        ]
      } else {
        // 关系类型或lag不同，显示第一个，其他在备注中
        const predName = taskMap.get(firstDep.taskId)?.name || firstDep.taskId
        return [
          task.name,
          task.duration.toString(),
          predName + ' (等' + task.predecessors.length + '項)',
          firstDep.type,
          (firstDep.lag || 0).toString()
        ]
      }
    }
  })

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  downloadFile(csvContent, 'tasks_extended.csv', 'text/csv;charset=utf-8;')
}

/**
 * 导出 CPM 结果为 CSV
 */
export function exportCPMResultToCSV(cpmResult: CPMResult): void {
  const headers = [
    '工項名稱', '工期(天)', 'ES', 'EF', 'LS', 'LF', 'TF', 'FF', '關鍵工項'
  ]
  
  const rows = cpmResult.tasks.map(task => [
    task.name,
    task.duration.toString(),
    task.es?.toString() || '-',
    task.ef?.toString() || '-',
    task.ls?.toString() || '-',
    task.lf?.toString() || '-',
    task.tf?.toString() || '-',
    task.ff?.toString() || '-',
    task.isCritical ? '是' : '否'
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  downloadFile(csvContent, 'cpm_result.csv', 'text/csv;charset=utf-8;')
}

/**
 * 从 CSV 导入任务
 */
export function importTasksFromCSV(file: File): Promise<CPMTask[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const tasks = parseCSV(text)
        resolve(tasks)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('檔案讀取失敗'))
    }
    
    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * 解析 CSV 文本为任务列表
 */
function parseCSV(text: string): CPMTask[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV 檔案格式錯誤：至少需要標題行和一筆資料')
  }

  // 跳过标题行
  const dataLines = lines.slice(1)
  
  const tasks: CPMTask[] = []
  const taskNameToId = new Map<string, string>()

  // 辅助函数：标准化关系类型（支持 F-S, FS 等格式）
  function normalizeRelationType(typeStr: string): 'FS' | 'SS' | 'FF' | 'SF' {
    const normalized = typeStr.replace(/-/g, '').toUpperCase()
    if (normalized === 'FS' || normalized === 'SS' || normalized === 'FF' || normalized === 'SF') {
      return normalized as 'FS' | 'SS' | 'FF' | 'SF'
    }
    return 'FS' // 默认值
  }

  // 辅助函数：解析任务名称、类型和lag，例如 "工項A(FS Lag5)" -> {name: "工項A", type: "FS", lag: 5}
  function parseTaskWithType(str: string): { name: string; type: 'FS' | 'SS' | 'FF' | 'SF'; lag: number } {
    // 匹配格式: "任务名(类型 Lag数值)" 或 "任务名(类型)"
    const matchWithLag = str.match(/^(.+?)\(([FS\-]+)\s+Lag([+-]?\d+)\)$/i)
    if (matchWithLag) {
      return { 
        name: matchWithLag[1].trim(), 
        type: normalizeRelationType(matchWithLag[2]),
        lag: parseInt(matchWithLag[3])
      }
    }
    
    const matchWithoutLag = str.match(/^(.+?)\(([FS\-]+)\)$/i)
    if (matchWithoutLag) {
      return { 
        name: matchWithoutLag[1].trim(), 
        type: normalizeRelationType(matchWithoutLag[2]),
        lag: 0
      }
    }
    
    // 如果没有指定类型，默认为 FS，lag为0
    return { name: str.trim(), type: 'FS', lag: 0 }
  }

  // 第一遍：创建所有任务
  dataLines.forEach((line, index) => {
    const fields = parseCSVLine(line)
    if (fields.length < 2) return // 跳过空行或格式错误的行

    const name = fields[0]?.trim()
    const durationStr = fields[1]?.trim()
    
    if (!name || !durationStr) return

    const duration = parseInt(durationStr, 10)
    if (isNaN(duration) || duration <= 0) {
      throw new Error(`第 ${index + 2} 行：工期必須為正整數`)
    }

    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`
    
    tasks.push({
      id,
      name,
      duration,
      predecessors: [],
      successors: []
    })

    taskNameToId.set(name, id)
  })

  // 检测CSV格式（3列或5列）
  const firstDataLine = parseCSVLine(dataLines[0])
  const isExtendedFormat = firstDataLine.length >= 5 // 5列格式：作业、工期、前置作业、关系型式、Lag

  // 第二遍：建立依赖关系
  dataLines.forEach((line, index) => {
    const fields = parseCSVLine(line)
    if (fields.length < 2) return

    const name = fields[0]?.trim()
    const task = tasks[index]
    if (!task || !name) return

    if (isExtendedFormat && fields.length >= 5) {
      // 5列格式：作业、工期、前置作业、关系型式、Lag
      const predecessorNames = fields[2]?.trim() || ''
      const relationType = fields[3]?.trim() || 'F-S'
      const lagStr = fields[4]?.trim() || '0'
      
      // 处理前置作业
      if (predecessorNames && predecessorNames !== '---') {
        const type = normalizeRelationType(relationType)
        const lag = parseInt(lagStr) || 0
        
        const predNames = predecessorNames.split(/[;,]/).map(s => s.trim()).filter(s => s && s !== '---')
        predNames.forEach(predName => {
          const predId = taskNameToId.get(predName)
          if (predId && !task.predecessors.some(d => d.taskId === predId)) {
            task.predecessors.push({ taskId: predId, type, lag })
          }
        })
      }
    } else {
      // 3列或4列格式（旧格式）：作业、工期、前置作业[、后续作业]
      const predecessorNames = fields[2]?.trim() || ''
      const successorNames = fields[3]?.trim() || ''

      // 处理前置作业
      if (predecessorNames && predecessorNames !== '---') {
        const predNames = predecessorNames.split(/[;,]/).map(s => s.trim()).filter(s => s && s !== '---')
        predNames.forEach(predNameWithType => {
          const { name: predName, type, lag } = parseTaskWithType(predNameWithType)
          const predId = taskNameToId.get(predName)
          if (predId && !task.predecessors.some(d => d.taskId === predId)) {
            task.predecessors.push({ taskId: predId, type, lag })
          }
        })
      }

      // 处理后续作业
      if (successorNames && successorNames !== '---') {
        const succNames = successorNames.split(/[;,]/).map(s => s.trim()).filter(s => s && s !== '---')
        succNames.forEach(succNameWithType => {
          const { name: succName, type, lag } = parseTaskWithType(succNameWithType)
          const succId = taskNameToId.get(succName)
          if (succId && !task.successors.some(d => d.taskId === succId)) {
            task.successors.push({ taskId: succId, type, lag })
          }
        })
      }
    }
  })

  // 补全双向依赖
  tasks.forEach(task => {
    task.predecessors.forEach(predDep => {
      const pred = tasks.find(t => t.id === predDep.taskId)
      if (pred && !pred.successors.some(d => d.taskId === task.id)) {
        pred.successors.push({ taskId: task.id, type: predDep.type, lag: predDep.lag })
      }
    })
  })

  return tasks
}

/**
 * 解析 CSV 行（处理引号内的逗号）
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

/**
 * 下载文件
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const BOM = '\uFEFF' // UTF-8 BOM for Excel
  const blob = new Blob([BOM + content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * 导出关键路径报告
 */
export function exportCriticalPathReport(cpmResult: CPMResult): void {
  const taskMap = new Map(cpmResult.tasks.map(t => [t.id, t]))
  const criticalTasks = cpmResult.criticalPath.map(id => taskMap.get(id)).filter(Boolean)
  
  let report = '關鍵路徑分析報告\n'
  report += '='.repeat(50) + '\n\n'
  
  report += `專案總工期：${cpmResult.totalDuration} 天\n`
  report += `關鍵工項數量：${cpmResult.criticalPath.length} 項\n\n`
  
  report += '關鍵路徑：\n'
  report += criticalTasks.map(t => t?.name).join(' → ') + '\n\n'
  
  report += '關鍵工項詳細資訊：\n'
  report += '-'.repeat(50) + '\n'
  
  criticalTasks.forEach((task, index) => {
    if (!task) return
    report += `${index + 1}. ${task.name}\n`
    report += `   工期：${task.duration} 天\n`
    report += `   最早開始：Day ${task.es}\n`
    report += `   最早完成：Day ${task.ef}\n`
    report += `   最晚開始：Day ${task.ls}\n`
    report += `   最晚完成：Day ${task.lf}\n`
    report += `   總浮時：${task.tf} 天\n`
    report += '\n'
  })
  
  report += '\n其他工項浮時分析：\n'
  report += '-'.repeat(50) + '\n'
  
  const nonCriticalTasks = cpmResult.tasks.filter(t => !t.isCritical)
  nonCriticalTasks.forEach(task => {
    report += `${task.name}：總浮時 ${task.tf} 天，自由浮時 ${task.ff} 天\n`
  })
  
  downloadFile(report, 'critical_path_report.txt', 'text/plain;charset=utf-8;')
}

/**
 * 生成示例 CSV 模板
 */
export function downloadCSVTemplate(): void {
  const template = [
    ['工項名稱', '工期(天)', '前置作業', '關係型式', 'Lag(天)'],
    ['地質調查', '5', '---', '---', '---'],
    ['初步設計', '10', '地質調查', 'F-S', '0'],
    ['結構設計', '15', '初步設計', 'F-S', '0'],
    ['發包準備', '7', '結構設計', 'S-S', '2'],
    ['開工動員', '3', '發包準備', 'F-S', '0']
  ]

  const csvContent = template
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  downloadFile(csvContent, 'template_extended.csv', 'text/csv;charset=utf-8;')
}

/**
 * 导出为 JSON
 */
export function exportToJSON(data: any, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;')
}

/**
 * 从 JSON 导入
 */
export function importFromJSON(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text)
        resolve(data)
      } catch (error) {
        reject(new Error('JSON 格式錯誤'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('檔案讀取失敗'))
    }
    
    reader.readAsText(file, 'UTF-8')
  })
}

