/**
 * 依赖关系类型
 */
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

/**
 * 依赖关系
 */
export interface Dependency {
  taskId: string                // 关联任务ID
  type: DependencyType          // 关系类型
  lag?: number                  // 延迟时间（可选，默认为0）
}

/**
 * CPM 任务数据结构
 * 包含工项的基本信息和 CPM 计算结果
 */
export interface CPMTask {
  id: string                    // 唯一识别码
  name: string                  // 工项名称
  duration: number              // 工期（天数）
  predecessors: Dependency[]    // 前置工项（含关系类型）
  successors: Dependency[]      // 后续工项（含关系类型）
  
  // CPM 计算结果
  es?: number                   // 最早开始时间 (Earliest Start)
  ef?: number                   // 最早完成时间 (Earliest Finish)
  ls?: number                   // 最晚开始时间 (Latest Start)
  lf?: number                   // 最晚完成时间 (Latest Finish)
  tf?: number                   // 总浮时 (Total Float)
  ff?: number                   // 自由浮时 (Free Float)
  
  // 状态标记
  isCritical?: boolean          // 是否为关键路径
  isStart?: boolean             // 是否为起始节点
  isEnd?: boolean               // 是否为结束节点
}

/**
 * CPM 计算结果数据结构
 */
export interface CPMResult {
  tasks: CPMTask[]              // 工项列表（含CPM计算结果）
  criticalPath: string[]        // 关键路径任务ID
  totalDuration: number         // 专案总工期
  startTasks: string[]          // 起始任务ID
  endTasks: string[]            // 结束任务ID
  hasCycle: boolean             // 是否存在循环依赖
  errors?: string[]             // 错误信息列表
}

/**
 * 专案数据结构
 */
export interface Project {
  id: string                    // 专案ID
  name: string                  // 专案名称
  tasks: CPMTask[]              // 工项列表
  cpmResult?: CPMResult         // CPM计算结果
  createdAt: Date               // 建立时间
  updatedAt: Date               // 更新时间
}

/**
 * 任务输入数据（用于CSV/Excel导入）
 */
export interface TaskInput {
  taskName: string              // 工项名称
  duration: number | string     // 工期
  predecessor?: string          // 前置作业
  successor?: string            // 后续作业
}

