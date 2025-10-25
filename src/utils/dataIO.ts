import type { CPMTask, CPMResult, TaskInput } from '../types'

/**
 * 匯出任務為 CSV（5欄擴充格式）
 */
export function exportTasksToCSV(tasks: CPMTask[]): void {
  const headers = ['工項名稱', '工期(天)', '前置作業', '關係型式', 'Lag(天)']
  const taskMap = new Map(tasks.map(t => [t.id, t]))
  
  const rows = tasks.map(task => {
    // 如果有多個前置作業，為每個產生一行，或者合併顯示
    if (task.predecessors.length === 0) {
      return [
        task.name,
        task.duration.toString(),
        '---',
        '---',
        '---'
      ]
    } else if (task.predecessors.length === 1) {
      // 單個前置作業
      const dep = task.predecessors[0]
      if (!dep) return [task.name, task.duration.toString(), '---', '---', '---'] // 類型守衛
      const predName = taskMap.get(dep.taskId)?.name || dep.taskId
      return [
        task.name,
        task.duration.toString(),
        predName,
        dep.type,
        (dep.lag || 0).toString()
      ]
    } else {
      // 多個前置作業，如果關係類型和lag相同，合併顯示
      const firstDep = task.predecessors[0]
      if (!firstDep) return [task.name, task.duration.toString(), '---', '---', '---'] // 類型守衛
      
      const allSameType = task.predecessors.every(d => d.type === firstDep.type)
      const allSameLag = task.predecessors.every(d => (d.lag || 0) === (firstDep.lag || 0))
      
      if (allSameType && allSameLag) {
        // 關係類型和lag相同，可以合併
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
        // 關係類型或lag不同，顯示第一個，其他在備註中
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
 * 匯出 CPM 結果為 CSV
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
 * 從 CSV 匯入任務
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
 * 解析 CSV 文字為任務列表
 */
function parseCSV(text: string): CPMTask[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV 檔案格式錯誤：至少需要標題列和一筆資料')
  }

  // 跳過標題列
  const dataLines = lines.slice(1)
  
  const tasks: CPMTask[] = []
  const taskNameToId = new Map<string, string>()

  // 輔助函式：標準化關係類型（支援 F-S, FS 等格式）
  function normalizeRelationType(typeStr: string): 'FS' | 'SS' | 'FF' | 'SF' {
    const normalized = typeStr.replace(/-/g, '').toUpperCase()
    if (normalized === 'FS' || normalized === 'SS' || normalized === 'FF' || normalized === 'SF') {
      return normalized as 'FS' | 'SS' | 'FF' | 'SF'
    }
    return 'FS' // 預設值
  }

  // 輔助函式：解析任務名稱、類型和lag，例如 "工項A(FS Lag5)" -> {name: "工項A", type: "FS", lag: 5}
  function parseTaskWithType(str: string): { name: string; type: 'FS' | 'SS' | 'FF' | 'SF'; lag: number } {
    // 匹配格式: "任務名(類型 Lag數值)" 或 "任務名(類型)"
    const matchWithLag = str.match(/^(.+?)\(([FS\-]+)\s+Lag([+-]?\d+)\)$/i)
    if (matchWithLag && matchWithLag[1] && matchWithLag[2] && matchWithLag[3]) {
      return { 
        name: matchWithLag[1].trim(), 
        type: normalizeRelationType(matchWithLag[2]),
        lag: parseInt(matchWithLag[3])
      }
    }
    
    const matchWithoutLag = str.match(/^(.+?)\(([FS\-]+)\)$/i)
    if (matchWithoutLag && matchWithoutLag[1] && matchWithoutLag[2]) {
      return { 
        name: matchWithoutLag[1].trim(), 
        type: normalizeRelationType(matchWithoutLag[2]),
        lag: 0
      }
    }
    
    // 如果沒有指定類型，預設為 FS，lag為0
    return { name: str.trim(), type: 'FS', lag: 0 }
  }

  // 第一遍：建立所有任務
  dataLines.forEach((line, index) => {
    const fields = parseCSVLine(line)
    if (fields.length < 2) return // 跳過空行或格式錯誤的列

    const name = fields[0]?.trim()
    const durationStr = fields[1]?.trim()
    
    if (!name || !durationStr) return

    const duration = parseInt(durationStr, 10)
    if (isNaN(duration) || duration <= 0) {
      throw new Error(`第 ${index + 2} 列：工期必須為正整數`)
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

  // 檢測CSV格式（3欄或5欄）
  const firstDataLine = dataLines[0] ? parseCSVLine(dataLines[0]) : []
  const isExtendedFormat = firstDataLine.length >= 5 // 5欄格式：作業、工期、前置作業、關係型式、Lag

  // 第二遍：建立依賴關係
  dataLines.forEach((line, index) => {
    const fields = parseCSVLine(line)
    if (fields.length < 2) return

    const name = fields[0]?.trim()
    const task = tasks[index]
    if (!task || !name) return

    if (isExtendedFormat && fields.length >= 5) {
      // 5欄格式：作業、工期、前置作業、關係型式、Lag
      const predecessorNames = fields[2]?.trim() || ''
      const relationType = fields[3]?.trim() || 'F-S'
      const lagStr = fields[4]?.trim() || '0'
      
      // 處理前置作業
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
      // 3欄或4欄格式（舊格式）：作業、工期、前置作業[、後續作業]
      const predecessorNames = fields[2]?.trim() || ''
      const successorNames = fields[3]?.trim() || ''

      // 處理前置作業
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

      // 處理後續作業
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

  // 補全雙向依賴
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
 * 解析 CSV 列（處理引號內的逗號）
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
 * 下載檔案
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
 * 匯出關鍵路徑報告
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
 * 產生範例 CSV 範本
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
 * 匯出為 JSON
 */
export function exportToJSON(data: any, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;')
}

/**
 * 從 JSON 匯入
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
