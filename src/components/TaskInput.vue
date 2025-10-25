<template>
  <div class="task-input">
    <div class="task-input-header">
      <h2>工項輸入</h2>
      <p class="subtitle">輸入工項名稱、工期和依賴關係</p>
    </div>

    <div class="input-form">
      <div class="form-container">
        <div class="basic-info-row">
          <div class="form-group form-group-name">
            <label for="task-name">工項名稱</label>
            <input
              id="task-name"
              v-model="newTask.name"
              type="text"
              placeholder="請輸入工項名稱"
              @keyup.enter="addTask"
            />
          </div>

          <div class="form-group form-group-duration">
            <label for="task-duration">工期（天）</label>
            <input
              id="task-duration"
              v-model.number="newTask.duration"
              type="number"
              min="1"
              placeholder="請輸入工期"
              @keyup.enter="addTask"
            />
          </div>

          <div class="form-group button-group">
            <button class="btn btn-primary" @click="addTask" :disabled="!isFormValid">
              {{ editingTaskId ? '更新工項' : '新增工項' }}
            </button>
            <button v-if="editingTaskId" class="btn btn-secondary" @click="cancelEdit">
              取消
            </button>
          </div>
        </div>

        <div class="dependencies-row">
          <div class="form-group form-group-multi">
            <label>前置作業</label>
            <div class="multi-select-container">
              <div class="selected-items">
                <span 
                  v-for="dep in newTask.predecessors" 
                  :key="dep.taskId" 
                  class="tag tag-with-type"
                >
                  <span class="tag-name">{{ getTaskNameById(dep.taskId) }}</span>
                  <select 
                    :value="dep.type" 
                    class="tag-type-select"
                    @change="updatePredecessorType(dep.taskId, ($event.target as HTMLSelectElement).value as DependencyType)"
                    title="選擇關係類型"
                  >
                    <option value="FS">FS</option>
                    <option value="SS">SS</option>
                    <option value="FF">FF</option>
                    <option value="SF">SF</option>
                  </select>
                  <input
                    type="number"
                    :value="dep.lag || 0"
                    @change="updatePredecessorLag(dep.taskId, parseInt(($event.target as HTMLInputElement).value))"
                    class="tag-lag-input"
                    placeholder="0"
                    title="Lag值（天數）"
                  />
                  <button 
                    type="button" 
                    class="tag-remove" 
                    @click="removePredecessor(dep.taskId)"
                    title="移除"
                  >
                    ×
                  </button>
                </span>
                <span v-if="newTask.predecessors.length === 0" class="placeholder">
                  無
                </span>
              </div>
              <div class="available-items" v-if="availableForPredecessor.length > 0">
                <button
                  v-for="task in availableForPredecessor"
                  :key="task.id"
                  type="button"
                  class="item-btn"
                  @click="addPredecessor(task.id)"
                >
                  {{ task.name }}
                </button>
              </div>
            </div>
          </div>

          <div class="form-group form-group-multi">
            <label>後續作業</label>
            <div class="multi-select-container">
              <div class="selected-items">
                <span 
                  v-for="dep in newTask.successors" 
                  :key="dep.taskId" 
                  class="tag tag-with-type"
                >
                  <span class="tag-name">{{ getTaskNameById(dep.taskId) }}</span>
                  <select 
                    :value="dep.type" 
                    class="tag-type-select"
                    @change="updateSuccessorType(dep.taskId, ($event.target as HTMLSelectElement).value as DependencyType)"
                    title="選擇關係類型"
                  >
                    <option value="FS">FS</option>
                    <option value="SS">SS</option>
                    <option value="FF">FF</option>
                    <option value="SF">SF</option>
                  </select>
                  <input
                    type="number"
                    :value="dep.lag || 0"
                    @change="updateSuccessorLag(dep.taskId, parseInt(($event.target as HTMLInputElement).value))"
                    class="tag-lag-input"
                    placeholder="0"
                    title="Lag值（天數）"
                  />
                  <button 
                    type="button" 
                    class="tag-remove" 
                    @click="removeSuccessor(dep.taskId)"
                    title="移除"
                  >
                    ×
                  </button>
                </span>
                <span v-if="newTask.successors.length === 0" class="placeholder">
                  無
                </span>
              </div>
              <div class="available-items" v-if="availableForSuccessor.length > 0">
                <button
                  v-for="task in availableForSuccessor"
                  :key="task.id"
                  type="button"
                  class="item-btn"
                  @click="addSuccessor(task.id)"
                >
                  {{ task.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="task-list" v-if="tasks.length > 0">
      <h3>已新增工項 ({{ tasks.length }})</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>工項名稱</th>
              <th>工期(天)</th>
              <th>前置作業</th>
              <th>後續作業</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task.id">
              <td class="task-name">{{ task.name }}</td>
              <td class="task-duration">{{ task.duration }}</td>
              <td class="task-deps">
                <span v-if="task.predecessors.length === 0" class="empty">無</span>
                <div v-else class="deps-list">
                  <div v-for="(depName, index) in getTaskNames(task.predecessors)" :key="index" class="dep-item">
                    {{ depName }}
                  </div>
                </div>
              </td>
              <td class="task-deps">
                <span v-if="task.successors.length === 0" class="empty">無</span>
                <div v-else class="deps-list">
                  <div v-for="(depName, index) in getTaskNames(task.successors)" :key="index" class="dep-item">
                    {{ depName }}
                  </div>
                </div>
              </td>
              <td class="task-actions">
                <button class="btn btn-small btn-secondary" @click="editTask(task.id)">
                  編輯
                </button>
                <button class="btn btn-small btn-danger" @click="removeTask(task.id)">
                  刪除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p>尚未新增任何工項，請在上方表單輸入工項資料</p>
    </div>

    <div class="action-buttons" v-if="tasks.length > 0">
      <button class="btn btn-secondary" @click="mergeDuplicateTasks" v-if="hasDuplicateTasks">
        合併重複工項
      </button>
      <button class="btn btn-secondary" @click="clearAll">
        清空所有工項
      </button>
      <button class="btn btn-success" @click="calculateSchedule">
        計算排程
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CPMTask, Dependency, DependencyType } from '../types'

const props = defineProps<{
  tasks: CPMTask[]
}>()

const emit = defineEmits<{
  addTask: [task: CPMTask]
  updateTask: [task: CPMTask]
  removeTask: [taskId: string]
  clearTasks: []
  calculate: []
}>()

const newTask = ref({
  name: '',
  duration: null as number | null,
  predecessors: [] as Dependency[],
  successors: [] as Dependency[]
})

const editingTaskId = ref<string | null>(null)

const dependencyTypes: { value: DependencyType; label: string; desc: string }[] = [
  { value: 'FS', label: 'FS', desc: '完成-開始' },
  { value: 'SS', label: 'SS', desc: '開始-開始' },
  { value: 'FF', label: 'FF', desc: '完成-完成' },
  { value: 'SF', label: 'SF', desc: '開始-完成' }
]

const isFormValid = computed(() => {
  return newTask.value.name.trim() !== '' && 
         newTask.value.duration !== null && 
         newTask.value.duration > 0
})

const availableForPredecessor = computed(() => {
  const selectedIds = newTask.value.predecessors.map(d => d.taskId)
  return props.tasks.filter(task => 
    !selectedIds.includes(task.id) && task.id !== editingTaskId.value
  )
})

const availableForSuccessor = computed(() => {
  const selectedIds = newTask.value.successors.map(d => d.taskId)
  return props.tasks.filter(task => 
    !selectedIds.includes(task.id) && task.id !== editingTaskId.value
  )
})

// 检查是否有重复的工项名称
const hasDuplicateTasks = computed(() => {
  const nameSet = new Set<string>()
  for (const task of props.tasks) {
    if (nameSet.has(task.name)) {
      return true
    }
    nameSet.add(task.name)
  }
  return false
})

function getTaskNameById(taskId: string): string {
  const task = props.tasks.find(t => t.id === taskId)
  return task ? task.name : taskId
}

function getDependencyLabel(dep: Dependency): string {
  const task = props.tasks.find(t => t.id === dep.taskId)
  const taskName = task ? task.name : dep.taskId
  return `${taskName} (${dep.type})`
}

function addPredecessor(taskId: string, type: DependencyType = 'FS') {
  const exists = newTask.value.predecessors.some(d => d.taskId === taskId)
  if (!exists) {
    newTask.value.predecessors.push({ taskId, type, lag: 0 })
  }
}

function removePredecessor(taskId: string) {
  newTask.value.predecessors = newTask.value.predecessors.filter(d => d.taskId !== taskId)
}

function updatePredecessorType(taskId: string, newType: DependencyType) {
  newTask.value.predecessors = newTask.value.predecessors.map(dep => {
    if (dep.taskId === taskId) {
      return { taskId: dep.taskId, type: newType, lag: dep.lag ?? 0 }
    }
    return dep
  })
}

function updatePredecessorLag(taskId: string, newLag: number) {
  newTask.value.predecessors = newTask.value.predecessors.map(dep => {
    if (dep.taskId === taskId) {
      return { taskId: dep.taskId, type: dep.type, lag: isNaN(newLag) ? 0 : newLag }
    }
    return dep
  })
}

function addSuccessor(taskId: string, type: DependencyType = 'FS') {
  const exists = newTask.value.successors.some(d => d.taskId === taskId)
  if (!exists) {
    newTask.value.successors.push({ taskId, type, lag: 0 })
  }
}

function removeSuccessor(taskId: string) {
  newTask.value.successors = newTask.value.successors.filter(d => d.taskId !== taskId)
}

function updateSuccessorType(taskId: string, newType: DependencyType) {
  newTask.value.successors = newTask.value.successors.map(dep => {
    if (dep.taskId === taskId) {
      return { taskId: dep.taskId, type: newType, lag: dep.lag ?? 0 }
    }
    return dep
  })
}

function updateSuccessorLag(taskId: string, newLag: number) {
  newTask.value.successors = newTask.value.successors.map(dep => {
    if (dep.taskId === taskId) {
      return { taskId: dep.taskId, type: dep.type, lag: isNaN(newLag) ? 0 : newLag }
    }
    return dep
  })
}

function addTask() {
  if (!isFormValid.value) return

  const trimmedName = newTask.value.name.trim()

  if (editingTaskId.value) {
    // 更新模式：检查是否与其他任务名称重复
    const existingTask = props.tasks.find(
      t => t.id !== editingTaskId.value && t.name === trimmedName
    )
    
    if (existingTask) {
      // 提示用户是否要合并到现有任务
      if (confirm(`工項「${trimmedName}」已存在，是否要合併依賴關係到現有工項？`)) {
        // 合并依赖关系
        const mergedPredecessors = mergeDependencies(
          existingTask.predecessors,
          newTask.value.predecessors
        )
        const mergedSuccessors = mergeDependencies(
          existingTask.successors,
          newTask.value.successors
        )
        
        const task: CPMTask = {
          id: existingTask.id,
          name: trimmedName,
          duration: newTask.value.duration!,
          predecessors: mergedPredecessors,
          successors: mergedSuccessors
        }
        
        emit('updateTask', task)
        emit('removeTask', editingTaskId.value)
        editingTaskId.value = null
      } else {
        return // 取消操作
      }
    } else {
      // 正常更新
      const task: CPMTask = {
        id: editingTaskId.value,
        name: trimmedName,
        duration: newTask.value.duration!,
        predecessors: [...newTask.value.predecessors],
        successors: [...newTask.value.successors]
      }
      emit('updateTask', task)
      editingTaskId.value = null
    }
  } else {
    // 新增模式：检查是否已存在相同名称
    const existingTask = props.tasks.find(t => t.name === trimmedName)
    
    if (existingTask) {
      // 提示用户是否要合并到现有任务
      if (confirm(`工項「${trimmedName}」已存在，是否要合併依賴關係到現有工項？`)) {
        // 合并依赖关系
        const mergedPredecessors = mergeDependencies(
          existingTask.predecessors,
          newTask.value.predecessors
        )
        const mergedSuccessors = mergeDependencies(
          existingTask.successors,
          newTask.value.successors
        )
        
        const task: CPMTask = {
          ...existingTask,
          duration: newTask.value.duration!, // 使用新的工期
          predecessors: mergedPredecessors,
          successors: mergedSuccessors
        }
        
        emit('updateTask', task)
      } else {
        return // 取消操作
      }
    } else {
      // 正常新增
      const task: CPMTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: trimmedName,
        duration: newTask.value.duration!,
        predecessors: [...newTask.value.predecessors],
        successors: [...newTask.value.successors]
      }
      emit('addTask', task)
    }
  }

  // 重置表單
  newTask.value = {
    name: '',
    duration: null,
    predecessors: [],
    successors: []
  }
}

// 辅助函数：合并依赖关系数组，避免重复
function mergeDependencies(deps1: Dependency[], deps2: Dependency[]): Dependency[] {
  const merged = [...deps1]
  
  for (const dep2 of deps2) {
    // 检查是否已存在相同的依赖（相同taskId、type和lag）
    const exists = merged.some(
      dep1 => dep1.taskId === dep2.taskId && 
              dep1.type === dep2.type && 
              (dep1.lag || 0) === (dep2.lag || 0)
    )
    
    if (!exists) {
      merged.push(dep2)
    }
  }
  
  return merged
}

function editTask(taskId: string) {
  const task = props.tasks.find(t => t.id === taskId)
  if (!task) return

  // 加載任務數據到表單
  editingTaskId.value = taskId
  newTask.value = {
    name: task.name,
    duration: task.duration,
    predecessors: [...task.predecessors],
    successors: [...task.successors]
  }

  // 滾動到表單頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editingTaskId.value = null
  newTask.value = {
    name: '',
    duration: null,
    predecessors: [],
    successors: []
  }
}

function removeTask(taskId: string) {
  emit('removeTask', taskId)
}

function clearAll() {
  if (confirm('確定要清空所有工項嗎？')) {
    emit('clearTasks')
  }
}

function mergeDuplicateTasks() {
  // 找出所有重复的工项
  const nameGroups = new Map<string, CPMTask[]>()
  
  for (const task of props.tasks) {
    if (!nameGroups.has(task.name)) {
      nameGroups.set(task.name, [])
    }
    nameGroups.get(task.name)!.push(task)
  }
  
  // 筛选出有重复的工项
  const duplicateGroups = Array.from(nameGroups.entries())
    .filter(([_, tasks]) => tasks.length > 1)
  
  if (duplicateGroups.length === 0) {
    return
  }
  
  // 构建提示信息
  const message = duplicateGroups
    .map(([name, tasks]) => `「${name}」(${tasks.length}個)`)
    .join('、')
  
  if (!confirm(`發現重複工項：${message}\n\n是否要合併這些重複工項？\n合併後將保留第一個工項並整合所有依賴關係。`)) {
    return
  }
  
  // 建立 ID 映射表：被刪除的工項 ID -> 保留的主工項 ID
  const idMapping = new Map<string, string>()
  const tasksToRemove: string[] = []
  const primaryTaskMap = new Map<string, CPMTask>()
  
  // 第一階段：先建立完整的 ID 映射表
  for (const [name, duplicateTasks] of duplicateGroups) {
    if (duplicateTasks.length === 0) continue
    
    const primaryTask = duplicateTasks[0]!
    primaryTaskMap.set(name, primaryTask)
    
    // 建立映射關係
    for (let i = 1; i < duplicateTasks.length; i++) {
      const task = duplicateTasks[i]
      if (task) {
        idMapping.set(task.id, primaryTask.id)
        tasksToRemove.push(task.id)
      }
    }
  }
  
  // 第二階段：合併重複工項並更新依賴
  const updatedTasks: CPMTask[] = []
  
  for (const [name, duplicateTasks] of duplicateGroups) {
    if (duplicateTasks.length === 0) continue
    
    const primaryTask = duplicateTasks[0]!
    
    // 收集所有重複工項的前置和後續作業
    let mergedPredecessors: Dependency[] = []
    let mergedSuccessors: Dependency[] = []
    let maxDuration = 0
    
    // 合併所有重複工項（包括主工項）的依賴關係
    for (const task of duplicateTasks) {
      if (!task) continue
      
      // 更新依賴中的 taskId（如果指向其他重複工項）
      const updatedPreds = task.predecessors.map(dep => {
        if (idMapping.has(dep.taskId)) {
          return { ...dep, taskId: idMapping.get(dep.taskId)! }
        }
        return dep
      })
      
      const updatedSuccs = task.successors.map(dep => {
        if (idMapping.has(dep.taskId)) {
          return { ...dep, taskId: idMapping.get(dep.taskId)! }
        }
        return dep
      })
      
      mergedPredecessors = mergeDependencies(mergedPredecessors, updatedPreds)
      mergedSuccessors = mergeDependencies(mergedSuccessors, updatedSuccs)
      maxDuration = Math.max(maxDuration, task.duration)
    }
    
    // 更新主任务
    const updatedTask: CPMTask = {
      id: primaryTask.id,
      name: primaryTask.name,
      duration: maxDuration,
      predecessors: mergedPredecessors,
      successors: mergedSuccessors
    }
    
    updatedTasks.push(updatedTask)
  }
  
  // 第三階段：更新所有其他工項中指向被刪除工項的依賴關係
  for (const task of props.tasks) {
    // 跳過即將被刪除的工項
    if (tasksToRemove.includes(task.id)) continue
    
    // 檢查是否已經在更新列表中
    const alreadyUpdated = updatedTasks.some(t => t.id === task.id)
    if (alreadyUpdated) continue
    
    let needsUpdate = false
    const updatedPredecessors = task.predecessors.map(dep => {
      if (idMapping.has(dep.taskId)) {
        needsUpdate = true
        return { ...dep, taskId: idMapping.get(dep.taskId)! }
      }
      return dep
    })
    
    const updatedSuccessors = task.successors.map(dep => {
      if (idMapping.has(dep.taskId)) {
        needsUpdate = true
        return { ...dep, taskId: idMapping.get(dep.taskId)! }
      }
      return dep
    })
    
    // 如果有依賴關係需要更新
    if (needsUpdate) {
      // 去除可能的重複依賴
      const uniquePredecessors = mergeDependencies([], updatedPredecessors)
      const uniqueSuccessors = mergeDependencies([], updatedSuccessors)
      
      updatedTasks.push({
        ...task,
        predecessors: uniquePredecessors,
        successors: uniqueSuccessors
      })
    }
  }
  
  // 第四階段：執行所有更新
  for (const task of updatedTasks) {
    emit('updateTask', task)
  }
  
  // 第五階段：刪除重複的任務
  for (const taskId of tasksToRemove) {
    emit('removeTask', taskId)
  }
}

function calculateSchedule() {
  emit('calculate')
}

function getTaskNames(dependencies: Dependency[]): string[] {
  return dependencies.map(dep => {
    const task = props.tasks.find(t => t.id === dep.taskId)
    const taskName = task ? task.name : dep.taskId
    const lagText = dep.lag && dep.lag !== 0 ? ` Lag ${dep.lag > 0 ? '+' : ''}${dep.lag}` : ''
    return `${taskName} (${dep.type}${lagText})`
  })
}
</script>

<style scoped>
.task-input {
  background: #ffffff;
  border-radius: 2px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
}

.task-input-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.task-input-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.subtitle {
  margin: 0;
  color: #999;
  font-size: 13px;
  font-weight: 400;
}

.input-form {
  margin-bottom: 32px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 基本信息行 */
.basic-info-row {
  display: grid;
  grid-template-columns: 1fr 120px 120px;
  gap: 16px;
  align-items: end;
}

/* 依赖关系行 */
.dependencies-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #666;
  font-weight: 400;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: #fafafa;
  color: #333;
}

.form-group input:hover {
  border-color: #999;
  background: #fff;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #666;
  background: #fff;
}

/* 工期输入 */
.form-group-duration input {
  text-align: center;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.button-group .btn {
  flex: 1;
  height: 42px;
  font-size: 13px;
  font-weight: 400;
}

.btn {
  padding: 10px 20px;
  border: 1px solid #333;
  border-radius: 2px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  background: #333;
  color: #fff;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: #333;
  color: #fff;
  border: 1px solid #333;
}

.btn-primary:hover:not(:disabled) {
  background: #555;
  border-color: #555;
}

.btn-primary:active:not(:disabled) {
  background: #222;
}

.btn-secondary {
  background: #fff;
  color: #666;
  border: 1px solid #d0d0d0;
}

.btn-secondary:hover {
  background: #f5f5f5;
  border-color: #999;
}

.btn-success {
  background: #333;
  color: #fff;
  border: 1px solid #333;
}

.btn-success:hover {
  background: #555;
}

.btn-danger {
  background: #fff;
  color: #c33;
  border: 1px solid #c33;
}

.btn-danger:hover {
  background: #c33;
  color: #fff;
}

.btn-small {
  padding: 5px 12px;
  font-size: 12px;
}

.task-list {
  margin-bottom: 24px;
}

.task-list h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 15px;
  font-weight: 500;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
  letter-spacing: 0.5px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
}

th {
  padding: 8px 12px;
  text-align: left;
  color: #666;
  font-weight: 400;
  font-size: 12px;
  letter-spacing: 0.5px;
}

tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
  height: auto;
}

tbody tr:hover {
  background: #fafafa;
}

td {
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}

.task-name {
  font-weight: 400;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.task-duration {
  color: #666;
  font-weight: 400;
  text-align: center;
}

.task-deps {
  color: #666;
  font-size: 12px;
}

.task-deps .empty {
  color: #ccc;
  font-style: italic;
}

.deps-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-start;
}

.dep-item {
  line-height: 1.4;
  padding: 1px 0;
  color: #666;
}

.task-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.task-actions .btn {
  min-width: 60px;
}

.empty-state {
  padding: 48px 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid #e8e8e8;
}

/* 多选容器样式 */
.multi-select-container {
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  padding: 12px;
  background: #fafafa;
  min-height: 50px;
}

.selected-items {
  min-height: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 8px;
}

.selected-items .placeholder {
  color: #ccc;
  font-size: 12px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 400;
  background: #e8e8e8;
  color: #333;
  border: 1px solid #d0d0d0;
}

.tag-with-type {
  gap: 6px;
  padding: 4px 8px 4px 10px;
  align-items: center;
}

.tag-name {
  line-height: 1.4;
  display: inline-block;
}

.tag-type-select {
  font-size: 12px;
  padding: 2px 6px;
  border: 1px solid #ccc;
  border-radius: 2px;
  cursor: pointer;
  min-width: 50px;
}

.tag-type-select:hover {
  border-color: #999;
}

.tag-type-select:focus {
  outline: 1px solid #0066cc;
  outline-offset: 0px;
}

.tag-lag-input {
  font-size: 12px;
  padding: 2px 6px;
  border: 1px solid #ccc;
  border-radius: 2px;
  width: 65px;
  text-align: center;
}

.tag-lag-input:hover {
  border-color: #999;
}

.tag-lag-input:focus {
  outline: 1px solid #0066cc;
  outline-offset: 0px;
  border-color: #0066cc;
}

.tag-remove {
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  margin: 0;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.tag-remove:hover {
  color: #333;
}

.available-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
  max-height: 120px;
  overflow-y: auto;
}

.item-btn {
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  color: #666;
}

.item-btn:hover {
  background: #333;
  color: #fff;
  border-color: #333;
}

@media (max-width: 1200px) {
  .basic-info-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-group-duration input {
    text-align: left;
  }
  
  .dependencies-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .task-input {
    padding: 24px;
  }
  
  .task-input-header h2 {
    font-size: 16px;
  }
  
  .form-group label {
    font-size: 12px;
  }
  
  .available-items {
    max-height: 100px;
  }
}
</style>

