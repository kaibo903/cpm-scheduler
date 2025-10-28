import type { CPMTask, CPMResult, TaskInput } from '../types'

/**
 * 匯出任務為 CSV（5欄擴充格式）
 */
export function exportTasksToCSV(tasks: CPMTask[]): void {
  const headers = ['作業名稱', '工期(天)', '前置作業', '關係型式', 'Lag(天)']
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
    '作業名稱', '工期(天)', 'ES', 'EF', 'LS', 'LF', 'TF', 'FF', '要徑作業'
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

  // 輔助函式：解析任務名稱、類型和lag，例如 "作業A(FS Lag5)" -> {name: "作業A", type: "FS", lag: 5}
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
 * 匯出要徑報告
 */
export function exportCriticalPathReport(cpmResult: CPMResult): void {
  const taskMap = new Map(cpmResult.tasks.map(t => [t.id, t]))
  const criticalTasks = cpmResult.criticalPath.map(id => taskMap.get(id)).filter(Boolean)
  
  let report = '要徑分析報告\n'
  report += '='.repeat(50) + '\n\n'
  
  report += `專案總工期：${cpmResult.totalDuration} 天\n`
  report += `要徑作業數量：${cpmResult.criticalPath.length} 項\n\n`
  
  report += '要徑：\n'
  report += criticalTasks.map(t => t?.name).join(' → ') + '\n\n'
  
  report += '要徑作業詳細資訊：\n'
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
  
  report += '\n其他作業浮時分析：\n'
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
    ['作業名稱', '工期(天)', '前置作業', '關係型式', 'Lag(天)'],
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

// ============================================
// 📊 TCT 工具專用的 CSV 匯入/匯出功能
// ============================================

/**
 * 📤 匯出 TCT 作業資料為 CSV
 */
export function exportTCTTasksToCSV(tasks: any[]): void {
  const headers = ['作業名稱', '正常工期(天)', '趕工工期(天)', '正常成本(元)', '趕工成本(元)', '前置作業']
  
  const rows = tasks.map(task => {
    // 處理前置作業列表
    const predecessors = task.predecessors && task.predecessors.length > 0
      ? task.predecessors.join(';')
      : '---'
    
    return [
      task.name,
      task.normal_duration.toString(),
      task.crash_duration.toString(),
      task.normal_cost.toString(),
      task.crash_cost.toString(),
      predecessors
    ]
  })
  
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  // 加入 BOM 以確保 Excel 正確顯示繁體中文
  const BOM = '\uFEFF'
  downloadFile(BOM + csvContent, 'tct_tasks.csv', 'text/csv;charset=utf-8;')
}

/**
 * 📤 匯出 TCT 計算結果為 CSV
 */
export function exportTCTResultToCSV(result: any): void {
  if (!result || !result.success) {
    throw new Error('無有效的計算結果可匯出')
  }
  
  // 摘要資訊
  let csvContent = '工期-成本權衡最佳化結果\n\n'
  csvContent += '摘要資訊\n'
  csvContent += '最佳專案工期(天),' + result.optimal_duration + '\n'
  csvContent += '最低總成本(元),' + result.optimal_cost + '\n'
  csvContent += '總趕工成本(元),' + result.crash_cost + '\n'
  csvContent += '總間接成本(元),' + result.overhead_cost + '\n'
  csvContent += '正常專案工期(天),' + result.normal_duration + '\n'
  csvContent += '正常總成本(元),' + result.normal_cost + '\n'
  csvContent += '成本節省(元),' + result.cost_saving + '\n\n'
  
  // 趕工計畫表
  csvContent += '趕工計畫\n'
  csvContent += '趕工循環,總工期(天),壓縮作業,直接成本(元),間接成本(元),預期罰金(元),總成本(元)\n'
  result.crashIterations.forEach((iter: any) => {
    const iterLabel = iter.iteration === 0 ? '正常情況' : `第${iter.iteration}次`
    csvContent += `"${iterLabel}",${iter.duration},"${iter.crashedTask}",${iter.directCost},${iter.overheadCost},${iter.penaltyCost},${iter.totalCost}\n`
  })
  
  csvContent += '\n作業執行計畫\n'
  csvContent += '作業名稱,開工時間(天),實際工期(天),趕工天數(天),趕工成本(元),要徑\n'
  result.tasks.forEach((task: any) => {
    const crashCost = (task.crash_days || 0) * (task.crash_cost_per_day || 0)
    const isCritical = task.isCritical ? '是' : '否'
    csvContent += `"${task.name}",${task.start_time},${task.actual_duration},${task.crash_days || 0},${crashCost},"${isCritical}"\n`
  })
  
  csvContent += '\n要徑\n'
  csvContent += result.criticalPath.join(' → ') + '\n'
  
  const BOM = '\uFEFF'
  downloadFile(BOM + csvContent, 'tct_result.csv', 'text/csv;charset=utf-8;')
}

/**
 * 📥 從 CSV 匯入 TCT 作業資料
 */
export function importTCTTasksFromCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const tasks = parseTCTCSV(text)
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
 * 📋 解析 TCT CSV 文字為作業列表
 */
function parseTCTCSV(text: string): any[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV 檔案格式錯誤：至少需要標題列和一筆資料')
  }
  
  // 跳過標題列
  const dataLines = lines.slice(1)
  
  const tasks: any[] = []
  const taskNames = new Set<string>()
  
  dataLines.forEach((line, index) => {
    const fields = parseCSVLine(line)
    if (fields.length < 5) {
      console.warn(`第 ${index + 2} 列資料不完整，已跳過`)
      return
    }
    
    const name = fields[0]?.trim() || ''
    const normalDuration = parseInt(fields[1]?.trim() || '0', 10)
    const crashDuration = parseInt(fields[2]?.trim() || '0', 10)
    const normalCost = parseFloat(fields[3]?.trim() || '0')
    const crashCost = parseFloat(fields[4]?.trim() || '0')
    const predecessorsStr = fields[5]?.trim() || ''
    
    // 驗證資料
    if (!name) {
      throw new Error(`第 ${index + 2} 列：作業名稱不可為空`)
    }
    
    if (taskNames.has(name)) {
      throw new Error(`第 ${index + 2} 列：作業名稱 "${name}" 重複`)
    }
    
    if (isNaN(normalDuration) || normalDuration <= 0) {
      throw new Error(`第 ${index + 2} 列：正常工期必須為正數`)
    }
    
    if (isNaN(crashDuration) || crashDuration <= 0) {
      throw new Error(`第 ${index + 2} 列：趕工工期必須為正數`)
    }
    
    if (crashDuration > normalDuration) {
      throw new Error(`第 ${index + 2} 列：趕工工期不可大於正常工期`)
    }
    
    if (isNaN(normalCost) || normalCost < 0) {
      throw new Error(`第 ${index + 2} 列：正常成本不可為負數`)
    }
    
    if (isNaN(crashCost) || crashCost < 0) {
      throw new Error(`第 ${index + 2} 列：趕工成本不可為負數`)
    }
    
    if (crashCost < normalCost) {
      throw new Error(`第 ${index + 2} 列：趕工成本應大於或等於正常成本`)
    }
    
    // 解析前置作業
    const predecessors: string[] = []
    if (predecessorsStr && predecessorsStr !== '---') {
      const predNames = predecessorsStr.split(/[;,]/).map(s => s.trim()).filter(s => s && s !== '---')
      predecessors.push(...predNames)
    }
    
    tasks.push({
      name,
      normal_duration: normalDuration,
      crash_duration: crashDuration,
      normal_cost: normalCost,
      crash_cost: crashCost,
      predecessors
    })
    
    taskNames.add(name)
  })
  
  // 驗證前置作業是否存在
  tasks.forEach((task, index) => {
    task.predecessors.forEach((predName: string) => {
      if (!taskNames.has(predName)) {
        throw new Error(`第 ${index + 2} 列：前置作業 "${predName}" 不存在`)
      }
    })
  })
  
  return tasks
}

/**
 * 📥 下載 TCT CSV 範本
 */
export function downloadTCTCSVTemplate(): void {
  const template = [
    ['作業名稱', '正常工期(天)', '趕工工期(天)', '正常成本(元)', '趕工成本(元)', '前置作業'],
    ['基礎開挖', '10', '7', '100000', '130000', '---'],
    ['結構施工', '15', '12', '200000', '250000', '基礎開挖'],
    ['外牆裝修', '8', '6', '80000', '100000', '結構施工'],
    ['內部裝修', '12', '9', '150000', '190000', '結構施工'],
    ['水電工程', '10', '8', '120000', '150000', '外牆裝修;內部裝修']
  ]
  
  const csvContent = template
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  const BOM = '\uFEFF'
  downloadFile(BOM + csvContent, 'tct_template.csv', 'text/csv;charset=utf-8;')
}

/**
 * 📄 匯出 CPM 報表為 PDF
 * 
 * 功能說明：產生完整的進度規劃 PDF 報表
 * 
 * 報表內容包含：
 * 1. 專案摘要（總工期、要徑數量等）
 * 2. CPM 計算結果表格
 * 3. 甘特圖（Bar Chart）
 * 4. PDM 網圖（可選）
 * 5. 要徑資訊
 * 
 * @param cpmResult - CPM 計算結果
 * @returns Promise<void>
 */
export async function exportReportToPDF(cpmResult: CPMResult): Promise<void> {
  // 動態導入 jsPDF 和 html2canvas
  const { default: jsPDF } = await import('jspdf')
  const html2canvas = (await import('html2canvas')).default
  
  try {
    // 📊 建立 PDF 文件（A4 尺寸）
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    let yPos = margin
    
    // 🎨 設定字體與樣式（使用支援中文的字體）
    pdf.setFont('helvetica')
    
    // 📋 標題
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CPM', pageWidth / 2, yPos, { align: 'center' })
    yPos += 12
    
    // 📝 日期
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const currentDate = new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    pdf.text(`Date: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 15
    
    // 📊 專案摘要
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Project Summary', margin, yPos)
    yPos += 8
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const criticalTasks = cpmResult.tasks.filter(t => t.isCritical)
    
    const summaryData = [
      `Total Duration: ${cpmResult.totalDuration} days`,
      `Total Tasks: ${cpmResult.tasks.length}`,
      `Critical Path Tasks: ${criticalTasks.length}`,
      `Start Tasks: ${cpmResult.startTasks.length}`,
      `End Tasks: ${cpmResult.endTasks.length}`
    ]
    
    summaryData.forEach(line => {
      pdf.text(line, margin + 5, yPos)
      yPos += 6
    })
    yPos += 5
    
    // 🎯 要徑作業列表
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Critical Path', margin, yPos)
    yPos += 7
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const criticalPathNames = criticalTasks.map(t => t.name).join(' -> ')
    const criticalPathLines = pdf.splitTextToSize(criticalPathNames, contentWidth - 10)
    
    criticalPathLines.forEach((line: string) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage()
        yPos = margin
      }
      pdf.text(line, margin + 5, yPos)
      yPos += 6
    })
    yPos += 10
    
    // 📊 CPM 結果表格
    if (yPos > pageHeight - 50) {
      pdf.addPage()
      yPos = margin
    }
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CPM Calculation Results', margin, yPos)
    yPos += 10
    
    // 📸 截取CPM結果表格
    const resultTable = document.querySelector('.result-table') as HTMLElement
    if (resultTable) {
      try {
        const canvas = await html2canvas(resultTable, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        })
        
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = contentWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        // 檢查是否需要分頁
        if (yPos + imgHeight > pageHeight - margin) {
          pdf.addPage()
          yPos = margin
        }
        
        pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight)
        yPos += imgHeight + 10
      } catch (error) {
        console.warn('無法截取 CPM 結果表格:', error)
        // 如果截圖失敗，使用文字表格替代
        yPos = addTextTable(pdf, cpmResult, margin, yPos, contentWidth, pageHeight)
      }
    } else {
      // 使用文字表格
      yPos = addTextTable(pdf, cpmResult, margin, yPos, contentWidth, pageHeight)
    }
    
    // 📈 甘特圖
    pdf.addPage()
    yPos = margin
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Gantt Chart (Bar Chart)', margin, yPos)
    yPos += 10
    
    const ganttChart = document.querySelector('.gantt-chart') as HTMLElement
    if (ganttChart) {
      try {
        const canvas = await html2canvas(ganttChart, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        })
        
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = contentWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        if (imgHeight > pageHeight - yPos - margin) {
          // 圖表太高，縮小尺寸
          const maxHeight = pageHeight - yPos - margin - 10
          const scaledWidth = (canvas.width * maxHeight) / canvas.height
          pdf.addImage(imgData, 'PNG', margin, yPos, scaledWidth, maxHeight)
        } else {
          pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight)
        }
      } catch (error) {
        console.warn('無法截取甘特圖:', error)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'italic')
        pdf.text('Gantt chart capture failed', margin, yPos)
      }
    }
    
    // 💾 儲存 PDF
    const filename = `CPM_Report_${new Date().getTime()}.pdf`
    pdf.save(filename)
    
  } catch (error) {
    console.error('PDF 生成失敗:', error)
    throw new Error('PDF 報表生成失敗')
  }
}

/**
 * 🔧 輔助函數：在 PDF 中添加文字表格
 */
function addTextTable(
  pdf: any, 
  cpmResult: CPMResult, 
  margin: number, 
  startY: number, 
  contentWidth: number,
  pageHeight: number
): number {
  let yPos = startY
  const lineHeight = 6
  const colWidths = [40, 15, 15, 15, 15, 15, 15, 15, 20]
  
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  
  // 表格標題
  const headers = ['Task', 'Dur', 'ES', 'EF', 'LS', 'LF', 'TF', 'FF', 'Critical']
  let xPos = margin
  headers.forEach((header, i) => {
    pdf.text(header, xPos, yPos)
    xPos += colWidths[i] || 15
  })
  yPos += lineHeight
  
  // 分隔線
  pdf.setDrawColor(0)
  pdf.line(margin, yPos, margin + contentWidth, yPos)
  yPos += 2
  
  // 表格內容
  pdf.setFont('helvetica', 'normal')
  cpmResult.tasks.forEach(task => {
    if (yPos > pageHeight - 20) {
      pdf.addPage()
      yPos = margin
    }
    
    xPos = margin
    const row = [
      task.name.substring(0, 20),
      task.duration.toString(),
      (task.es || 0).toString(),
      (task.ef || 0).toString(),
      (task.ls || 0).toString(),
      (task.lf || 0).toString(),
      (task.tf || 0).toString(),
      (task.ff || 0).toString(),
      task.isCritical ? 'Yes' : 'No'
    ]
    
    row.forEach((cell, i) => {
      pdf.text(cell, xPos, yPos)
      xPos += colWidths[i] || 15
    })
    
    yPos += lineHeight
  })
  
  return yPos + 10
}