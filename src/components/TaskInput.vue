<template>
  <div class="task-input">
    <div class="task-input-header">
      <h2>{{ t.planning.dataInput }}</h2>
    </div>

    <div class="input-form">
      <div class="form-container">
        <div class="basic-info-row">
          <div class="form-group form-group-name">
            <label for="task-name">{{ t.planning.taskName }}</label>
            <input
              id="task-name"
              v-model="newTask.name"
              type="text"
              placeholder=""
              @keyup.enter="addTask"
            />
          </div>

          <div class="form-group form-group-duration">
            <label for="task-duration">{{ t.planning.duration }}</label>
            <input
              id="task-duration"
              v-model.number="newTask.duration"
              type="number"
              min="1"
              max="999"
              placeholder=""
              @change="onDurationChange"
              @keyup.enter="addTask"
            />
          </div>

          <div class="form-group form-group-date">
            <label for="start-date">{{ t.planning.startDate }}</label>
            <input
              id="start-date"
              v-model="newTask.startDate"
              type="date"
              placeholder=""
              @change="calculateEndDate"
              @keyup.enter="addTask"
            />
          </div>

          <div class="form-group form-group-date">
            <label for="end-date">{{ t.planning.endDate }}</label>
            <input
              id="end-date"
              v-model="newTask.endDate"
              type="date"
              placeholder=""
              @change="calculateStartDate"
              @keyup.enter="addTask"
            />
          </div>
        </div>

        <div class="dependencies-row">
          <div class="form-group form-group-multi predecessors-group">
            <label>{{ t.planning.predecessors }}</label>
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

          <div class="form-group form-group-multi successors-group">
            <label>{{ t.planning.successors }}</label>
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

        <!-- 🎯 資源與成本輸入區域 -->
        <div class="resources-section">
          <label class="section-label">資源</label>
          
          <div class="resources-table">
            <div class="resources-header">
              <div class="col-type">類型</div>
              <div class="col-name">名稱</div>
              <div class="col-quantity">數量</div>
              <div class="col-price">單價</div>
              <div class="col-cost">成本</div>
              <div class="col-action"></div>
            </div>

            <div class="resources-body">
              <div v-for="(resource, index) in newTask.resources" :key="resource.id" class="resource-row">
                <div class="col-type">
                  <select v-model="resource.type" class="type-select">
                    <option value="resource">資源</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div class="col-name">
                  <input
                    v-model="resource.name"
                    type="text"
                    placeholder=""
                    @input="updateResourceCost(index)"
                  />
                </div>
                <div class="col-quantity">
                  <input
                    :value="formatNumber(resource.quantity)"
                    type="text"
                    placeholder=""
                    @input="handleQuantityInput($event, index)"
                    @blur="handleQuantityBlur($event, index)"
                  />
                </div>
                <div class="col-price">
                  <input
                    :value="formatNumber(resource.unitPrice)"
                    type="text"
                    placeholder=""
                    @input="handlePriceInput($event, index)"
                    @blur="handlePriceBlur($event, index)"
                  />
                </div>
                <div class="col-cost">
                  <div class="cost-display">
                    {{ resource.totalCost ? '$' + resource.totalCost.toLocaleString() : '-' }}
                  </div>
                </div>
                <div class="col-action">
                  <button
                    type="button"
                    class="btn-icon btn-icon-delete"
                    @click="removeResourceRow(index)"
                    title="刪除"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="resources-footer">
              <button
                type="button"
                class="btn-add-resource-row"
                @click="addResourceRow"
                title="新增資源"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <span>新增資源</span>
              </button>
            </div>
          </div>
        </div>

        <div class="button-row">
          <button v-if="!editingTaskId" class="btn btn-primary" @click="addTask" :disabled="!isFormValid">
            {{ t.planning.addTask }}
          </button>
          <template v-else>
            <button class="btn btn-primary" @click="addTask" :disabled="!isFormValid">
              {{ t.planning.update }}
            </button>
            <button class="btn btn-secondary" @click="cancelEdit">
              {{ t.importDialog.cancel }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <div class="task-list" v-if="tasks.length > 0">
      <h3>{{ t.planning.addedTasks }} <span class="count">({{ tasks.length }})</span></h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ t.planning.taskName }}</th>
              <th>{{ t.planning.duration }}</th>
              <th>{{ t.planning.startDate }}</th>
              <th>{{ t.planning.endDate }}</th>
              <th>{{ t.planning.predecessors }}</th>
              <th>{{ t.planning.successors }}</th>
              <th>{{ t.planning.resources }}</th>
              <th>{{ t.planning.totalCost }}</th>
              <th>{{ t.planning.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task.id">
              <td class="task-name">{{ task.name }}</td>
              <td class="task-duration">{{ task.duration }}</td>
              <td class="task-date">{{ formatStartDate(task) }}</td>
              <td class="task-date">{{ formatEndDate(task) }}</td>
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
              <td class="task-resources">
                <span v-if="!task.resources || task.resources.length === 0" class="empty">無</span>
                <div v-else class="resources-display">
                  <div v-for="resource in task.resources" :key="resource.id" class="resource-display-item">
                    {{ resource.name }} × {{ resource.quantity }}
                  </div>
                </div>
              </td>
              <td class="task-cost">
                <span v-if="!task.resources || task.resources.length === 0" class="empty">-</span>
                <span v-else class="cost-amount">
                  ${{ calculateTaskTotalCost(task).toLocaleString() }}
                </span>
              </td>
              <td class="task-actions">
                <button class="btn-icon btn-icon-edit" @click="editTask(task.id)" title="編輯">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="btn-icon btn-icon-delete" @click="removeTask(task.id)" title="刪除">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p>{{ t.planning.noTasks }}</p>
    </div>

    <div class="action-buttons" v-if="tasks.length > 0">
      <button class="btn btn-secondary" @click="mergeDuplicateTasks" v-if="hasDuplicateTasks">
        {{ t.planning.mergeDuplicates }}
      </button>
      <button class="btn btn-secondary" @click="clearAll">
        {{ t.planning.clearData }}
      </button>
      <button class="btn btn-success" @click="calculateSchedule">
        {{ t.planning.calculate }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CPMTask, Dependency, DependencyType, Resource, ResourceType } from '../types'
import { useLanguage } from '../composables/useLanguage'

// 🌐 語言管理
const { t } = useLanguage()

const props = defineProps<{
  tasks: CPMTask[]
}>()

const emit = defineEmits<{
  addTask: [task: CPMTask]
  updateTask: [task: CPMTask]
  removeTask: [taskId: string]
  clearTasks: []
  calculate: []
  mergeTasks: []
}>()

const newTask = ref({
  name: '',
  duration: null as number | null,
  startDate: '',
  endDate: '',
  resources: [] as Resource[],
  predecessors: [] as Dependency[],
  successors: [] as Dependency[]
})

// 🧮 計算資源成本
function calculateResourceCost(quantity: number | null | undefined, unitPrice: number | null | undefined): number {
  if (quantity && unitPrice) {
    return quantity * unitPrice
  }
  return 0
}

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

// 🧮 計算任務總成本（包含資源與其他成本）
function calculateTaskTotalCost(task: CPMTask): number {
  if (!task.resources || task.resources.length === 0) {
    return 0
  }
  return task.resources.reduce((total, resource) => {
    return total + (resource.totalCost || 0)
  }, 0)
}

// 📅 當工期變更時，自動更新日期
function onDurationChange() {
  // 優先根據開始時間計算結束時間
  if (newTask.value.startDate && newTask.value.duration) {
    calculateEndDate()
  } 
  // 如果沒有開始時間但有結束時間，則計算開始時間
  else if (newTask.value.endDate && newTask.value.duration) {
    calculateStartDate()
  }
}

// 📅 當開始時間變更時，自動計算結束時間
function calculateEndDate() {
  if (newTask.value.startDate && newTask.value.duration) {
    const startDate = new Date(newTask.value.startDate)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + newTask.value.duration)
    const dateStr = endDate.toISOString().split('T')[0]
    newTask.value.endDate = dateStr || ''
  }
}

// 📅 當結束時間變更時，自動計算開始時間
function calculateStartDate() {
  if (newTask.value.endDate && newTask.value.duration) {
    const endDate = new Date(newTask.value.endDate)
    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - newTask.value.duration)
    const dateStr = startDate.toISOString().split('T')[0]
    newTask.value.startDate = dateStr || ''
  }
}

// 📅 格式化開始時間
function formatStartDate(task: CPMTask): string {
  if (task.startDate) {
    // 將 YYYY-MM-DD 格式轉換為 YYYY/MM/DD 格式
    return task.startDate.replace(/-/g, '/')
  }
  if (task.es !== undefined) {
    return `第${task.es}天`
  }
  return '-'
}

// 📅 格式化結束時間
function formatEndDate(task: CPMTask): string {
  if (task.startDate && task.duration) {
    // 如果有開始時間，計算結束時間
    const startDate = new Date(task.startDate)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + task.duration)
    const dateStr = endDate.toISOString().split('T')[0]
    // 將 YYYY-MM-DD 格式轉換為 YYYY/MM/DD 格式
    return dateStr ? dateStr.replace(/-/g, '/') : '-'
  }
  if (task.ef !== undefined) {
    return `第${task.ef}天`
  }
  return '-'
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

// 🔧 新增資源行
function addResourceRow() {
  const resource: Resource = {
    id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'resource', // 預設為資源類型
    name: '',
    quantity: undefined,
    unitPrice: undefined,
    totalCost: undefined
  }
  newTask.value.resources.push(resource)
}

// 🔧 刪除資源行
function removeResourceRow(index: number) {
  newTask.value.resources.splice(index, 1)
}

// 🔧 格式化數字為千位分隔格式
function formatNumber(value: number | undefined | null): string {
  if (!value && value !== 0) return ''
  return value.toLocaleString()
}

// 🔧 處理數量輸入
function handleQuantityInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const resource = newTask.value.resources[index]
  if (!resource) return
  
  const value = input.value.replace(/,/g, '') // 移除逗號
  const numValue = value ? parseInt(value) : undefined
  resource.quantity = numValue
}

// 🔧 處理數量失去焦點
function handleQuantityBlur(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const resource = newTask.value.resources[index]
  if (!resource) return
  
  // 格式化顯示
  input.value = resource.quantity ? resource.quantity.toLocaleString() : ''
  // 更新成本
  updateResourceCost(index)
}

// 🔧 處理單價輸入
function handlePriceInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const resource = newTask.value.resources[index]
  if (!resource) return
  
  const value = input.value.replace(/,/g, '') // 移除逗號
  const numValue = value ? parseFloat(value) : undefined
  resource.unitPrice = numValue
}

// 🔧 處理單價失去焦點
function handlePriceBlur(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const resource = newTask.value.resources[index]
  if (!resource) return
  
  // 格式化顯示
  input.value = resource.unitPrice ? resource.unitPrice.toLocaleString() : ''
  // 更新成本
  updateResourceCost(index)
}

// 🔧 更新資源成本
function updateResourceCost(index: number) {
  const resource = newTask.value.resources[index]
  if (resource) {
    resource.totalCost = calculateResourceCost(resource.quantity, resource.unitPrice)
  }
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
      if (confirm(`作業「${trimmedName}」已存在，是否要合併依賴關係到現有作業？`)) {
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
          successors: mergedSuccessors,
          resources: [...newTask.value.resources],
          startDate: newTask.value.startDate || undefined,
          endDate: newTask.value.endDate || undefined
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
        successors: [...newTask.value.successors],
        resources: [...newTask.value.resources],
        startDate: newTask.value.startDate || undefined,
        endDate: newTask.value.endDate || undefined
      }
      emit('updateTask', task)
      editingTaskId.value = null
    }
  } else {
    // 新增模式：检查是否已存在相同名称
    const existingTask = props.tasks.find(t => t.name === trimmedName)
    
    if (existingTask) {
      // 提示用户是否要合并到现有任务
      if (confirm(`作業「${trimmedName}」已存在，是否要合併依賴關係到現有作業？`)) {
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
          successors: mergedSuccessors,
          resources: [...newTask.value.resources],
          startDate: newTask.value.startDate || undefined,
          endDate: newTask.value.endDate || undefined
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
        successors: [...newTask.value.successors],
        resources: [...newTask.value.resources],
        startDate: newTask.value.startDate || undefined,
        endDate: newTask.value.endDate || undefined
      }
      emit('addTask', task)
    }
  }

  // 重置表單
  newTask.value = {
    name: '',
    duration: null,
    startDate: '',
    endDate: '',
    resources: [],
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
    startDate: task.startDate || '',
    endDate: task.endDate || '',
    resources: task.resources ? [...task.resources] : [],
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
    startDate: '',
    endDate: '',
    resources: [],
    predecessors: [],
    successors: []
  }
}

function removeTask(taskId: string) {
  emit('removeTask', taskId)
}

function clearAll() {
  if (confirm('確定要清空所有作業嗎？')) {
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
  
  if (!confirm(`發現重複作業：${message}\n\n是否要合併這些重複作業？\n合併後將保留第一個作業並整合所有依賴關係。`)) {
    return
  }
  
  // 建立 ID 映射表：被刪除的作業 ID -> 保留的主作業 ID
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
  
  // 第二階段：合併重複作業並更新依賴
  const updatedTasks: CPMTask[] = []
  
  for (const [name, duplicateTasks] of duplicateGroups) {
    if (duplicateTasks.length === 0) continue
    
    const primaryTask = duplicateTasks[0]!
    
    // 收集所有重複作業的前置和後續作業
    let mergedPredecessors: Dependency[] = []
    let mergedSuccessors: Dependency[] = []
    let maxDuration = 0
    
    // 合併所有重複作業（包括主作業）的依賴關係
    for (const task of duplicateTasks) {
      if (!task) continue
      
      // 更新依賴中的 taskId（如果指向其他重複作業）
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
  
  // 第三階段：更新所有其他作業中指向被刪除作業的依賴關係
  for (const task of props.tasks) {
    // 跳過即將被刪除的作業
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
  
  // 第四階段：執行所有更新（靜默模式，不顯示訊息）
  for (const task of updatedTasks) {
    emit('updateTask', task)
  }
  
  // 第五階段：刪除重複的任務（靜默模式，不顯示訊息）
  for (const taskId of tasksToRemove) {
    emit('removeTask', taskId)
  }
  
  // 第六階段：發送合併完成事件
  emit('mergeTasks')
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
  margin-bottom: 20px;
  padding-bottom: 12px;
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
  margin-bottom: 20px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 基本信息行 - 4欄網格佈局 */
.basic-info-row {
  display: grid;
  grid-template-columns: 2fr 100px 1.2fr 1.2fr;
  gap: 16px;
  align-items: end;
}

/* 依賴關係行 - 兩欄等寬 */
.dependencies-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group-multi {
  display: flex;
  flex-direction: column;
}

/* 🎯 資源表格區域 */
.resources-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resources-section .section-label {
  color: #666;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.resources-table {
  border: none;
  border-radius: 2px;
  overflow: hidden;
}

.resources-header {
  display: grid;
  grid-template-columns: 90px 3fr 80px 80px 110px 32px;
  gap: 8px;
  background: #f5f5f5;
  padding: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.resources-header > div {
  text-align: left;
  padding-left: 4px;
}

.resources-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #f9f9f9;
}

.resource-row {
  display: grid;
  grid-template-columns: 90px 3fr 80px 80px 110px 32px;
  gap: 8px;
  padding: 8px;
  background: white;
  align-items: center;
}

.resource-row .col-type .type-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  font-size: 13px;
  font-weight: 500;
  background: #fafafa;
  transition: all 0.2s;
  cursor: pointer;
}

.resource-row .col-type .type-select:hover {
  border-color: #999;
  background: #fff;
}

.resource-row .col-type .type-select:focus {
  outline: none;
  border-color: #666;
  background: #fff;
}

.resource-row .col-name input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  font-size: 14px;
  background: #fafafa;
  transition: all 0.2s;
  text-align: left;
}

.resource-row .col-quantity input,
.resource-row .col-price input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  background: #fafafa;
  transition: all 0.2s;
}

.resource-row input:hover {
  border-color: #999;
  background: #fff;
}

.resource-row input:focus {
  outline: none;
  border-color: #666;
  background: #fff;
}


.resource-row .col-cost .cost-display {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  background: #f5f5f5;
  border-radius: 2px;
  font-size: 13px;
  font-weight: 500;
  color: #e53935;
}

.resource-row .col-action {
  display: flex;
  justify-content: center;
  align-items: center;
}

.resources-footer {
  padding: 8px;
  background: white;
  border-top: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-add-resource-row {
  padding: 4px 12px 4px 4px;
  border: none;
  border-radius: 16px;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.btn-add-resource-row svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.btn-add-resource-row span {
  line-height: 1;
}

.btn-add-resource-row:hover {
  background: #f0f0f0;
  color: #666;
}

.btn-add-resource-row:active {
  background: #e0e0e0;
  color: #333;
}

/* 🎯 其他成本區域 */
.other-cost-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.other-cost-section label {
  color: #666;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.other-cost-section input {
  width: 200px;
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  background: #fafafa;
  transition: all 0.2s;
}

.other-cost-section input:hover {
  border-color: #999;
  background: #fff;
}

.other-cost-section input:focus {
  outline: none;
  border-color: #666;
  background: #fff;
}

/* 按鈕行 */
.button-row {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #666;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: #fafafa;
  color: #333;
  box-sizing: border-box;
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

/* 工期輸入 - 3位數字專用 */
.form-group-duration input {
  text-align: center;
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.5px;
  padding: 8px 12px;
}

/* 移除數字輸入框的上下箭頭 */
.form-group-duration input::-webkit-outer-spin-button,
.form-group-duration input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.form-group-duration input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* 日期輸入 */
.form-group-date input {
  text-align: left;
  font-weight: 400;
  width: 100%;
  font-size: 14px;
}

.form-group-date input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.7;
}

.form-group-date input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.btn {
  padding: 11px 20px;
  border: 1px solid #333;
  border-radius: 2px;
  font-size: 13px;
  height: 44px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.task-list h3 .count {
  font-weight: 300;
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
  white-space: nowrap;
}

/* 📊 表格欄位寬度設定 */
th:nth-child(1) { width: 10%; }  /* 作業名稱 */
th:nth-child(2) { width: 5%; text-align: center; }  /* 工期 */
th:nth-child(3) { width: 14%; text-align: center; }  /* 開始時間 */
th:nth-child(4) { width: 14%; text-align: center; }  /* 結束時間 */
th:nth-child(5) { width: 15%; }  /* 前置作業 */
th:nth-child(6) { width: 15%; }  /* 後續作業 */
th:nth-child(7) { width: 14%; }  /* 資源 */
th:nth-child(8) { width: 10%; text-align: right; }  /* 成本 */
th:nth-child(9) { width: 3%; }   /* 操作 */

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
  white-space: nowrap;
  vertical-align: middle;
}

.task-name {
  font-weight: 400;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
  vertical-align: middle;
}

.task-duration {
  color: #666;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
}

.task-date {
  color: #666;
  font-weight: 400;
  text-align: center;
  font-size: 13px;
  vertical-align: middle;
}

.task-resources {
  color: #666;
  font-size: 12px;
  vertical-align: middle;
}

.task-resources .empty {
  color: #ccc;
  font-style: italic;
}

.resources-display {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-start;
  justify-content: center;
}

.resource-display-item {
  line-height: 1.4;
  padding: 1px 0;
  color: #666;
}

.task-deps {
  color: #666;
  font-size: 12px;
  vertical-align: middle;
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
  justify-content: center;
}

.dep-item {
  line-height: 1.4;
  padding: 1px 0;
  color: #666;
}

.task-cost {
  text-align: right;
  font-size: 13px;
  vertical-align: middle;
}

.task-cost .empty {
  color: #ccc;
  font-style: normal;
  font-weight: 400;
}

.cost-amount {
  font-weight: 500;
  color: #e53935;
}

.task-actions {
  display: flex;
  flex-direction: row;
  gap: 4px;
  justify-content: center;
  align-items: center;
  padding: 8px 4px !important;
  vertical-align: middle;
  height: 100%;
}

/* 🎨 圖示按鈕 - 扁平化設計 */
.btn-icon {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}

.btn-icon svg {
  width: 14px;
  height: 14px;
  transition: all 0.2s;
}

/* 編輯按鈕 */
.btn-icon-edit {
  color: #666;
}

.btn-icon-edit:hover {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-icon-edit:active {
  background: #bbdefb;
}

/* 刪除按鈕 */
.btn-icon-delete {
  color: #666;
}

.btn-icon-delete:hover {
  background: #ffebee;
  color: #d32f2f;
}

.btn-icon-delete:active {
  background: #ffcdd2;
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
    gap: 16px;
  }

  .form-group-duration input {
    text-align: center;
  }

  .dependencies-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .resources-header,
  .resource-row {
    grid-template-columns: 75px 2fr 55px 55px 80px 28px;
    gap: 4px;
    font-size: 12px;
  }

  .resource-row input {
    padding: 6px 8px;
    font-size: 13px;
  }

  .resource-row .col-cost .cost-display {
    font-size: 12px;
  }

  .button-row {
    display: flex;
    justify-content: stretch;
  }

  .button-row .btn {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .basic-info-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .task-input {
    padding: 24px;
  }

  .form-container {
    gap: 16px;
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

