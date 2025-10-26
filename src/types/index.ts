/**
 * 依賴關係類型
 */
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

/**
 * 依賴關係
 */
export interface Dependency {
  taskId: string                // 關聯任務ID
  type: DependencyType          // 關係類型
  lag?: number                  // 延遲時間（可選，預設為0）
}

/**
 * 資源類型
 */
export type ResourceType = 'resource' | 'other'

/**
 * 資源
 */
export interface Resource {
  id: string                    // 資源唯一識別碼
  type: ResourceType            // 資源類型（資源/其他）
  name: string                  // 資源名稱
  quantity?: number             // 資源數量（可選）
  unitPrice?: number            // 單價（可選）
  totalCost?: number            // 小計（可選，自動計算）
}

/**
 * CPM 任務資料結構
 * 包含作業的基本資訊和 CPM 計算結果
 */
export interface CPMTask {
  id: string                    // 唯一識別碼
  name: string                  // 作業名稱
  duration: number              // 工期（天數）
  predecessors: Dependency[]    // 前置作業（含關係類型）
  successors: Dependency[]      // 後續作業（含關係類型）
  resources?: Resource[]        // 資源列表（可選，含資源與其他成本）
  startDate?: string            // 開始時間（可選，用戶輸入）
  endDate?: string              // 結束時間（可選，用戶輸入）
  
  // CPM 計算結果
  es?: number                   // 最早開始時間 (Earliest Start)
  ef?: number                   // 最早完成時間 (Earliest Finish)
  ls?: number                   // 最晚開始時間 (Latest Start)
  lf?: number                   // 最晚完成時間 (Latest Finish)
  tf?: number                   // 總浮時 (Total Float)
  ff?: number                   // 自由浮時 (Free Float)
  
  // 狀態標記
  isCritical?: boolean          // 是否為要徑
  isStart?: boolean             // 是否為起始節點
  isEnd?: boolean               // 是否為結束節點
}

/**
 * CPM 計算結果資料結構
 */
export interface CPMResult {
  tasks: CPMTask[]              // 作業列表（含CPM計算結果）
  criticalPath: string[]        // 要徑任務ID
  totalDuration: number         // 專案總工期
  startTasks: string[]          // 起始任務ID
  endTasks: string[]            // 結束任務ID
  hasCycle: boolean             // 是否存在循環依賴
  errors?: string[]             // 錯誤訊息列表
}

/**
 * 專案資料結構
 */
export interface Project {
  id: string                    // 專案ID
  name: string                  // 專案名稱
  tasks: CPMTask[]              // 作業列表
  cpmResult?: CPMResult         // CPM計算結果
  createdAt: Date               // 建立時間
  updatedAt: Date               // 更新時間
}

/**
 * 任務輸入資料（用於CSV/Excel匯入）
 */
export interface TaskInput {
  taskName: string              // 作業名稱
  duration: number | string     // 工期
  predecessor?: string          // 前置作業
  successor?: string            // 後續作業
}
