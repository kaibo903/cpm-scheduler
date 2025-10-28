<template>
  <div class="container">
    <!-- 🎯 標題列區域 -->
    <div class="header-section">
      <div class="header-container">
        <router-link to="/tools" class="back-button">
          {{ t.planning.backButton }}
        </router-link>
        <h1 class="page-title">{{ t.planning.title }}</h1>
        <p class="page-subtitle">Construction Planning and Scheduling Learning Assistant</p>
      </div>
    </div>

    <!-- 🛠️ 工具列 -->
    <div class="toolbar">
      <div class="toolbar-section">
        <button class="btn btn-outline" @click="showImportDialog = true">
          {{ t.planning.importCSV }}
        </button>
        <button class="btn btn-outline" @click="downloadTemplate">
          {{ t.planning.downloadTemplate }}
        </button>
      </div>
      
      <div class="toolbar-section" v-if="tasks.length > 0">
        <button class="btn btn-outline" @click="exportTasks">
          {{ t.planning.exportTasks }}
        </button>
        <button class="btn btn-outline" @click="exportResults" :disabled="!cpmResult">
          {{ t.planning.exportResults }}
        </button>
        <button class="btn btn-outline" @click="exportReport" :disabled="!cpmResult">
          {{ t.planning.exportReport }}
        </button>
      </div>
    </div>

    <!-- 📐 左右分欄佈局 -->
    <div class="main-layout">
      <!-- 左側：任務輸入 -->
      <div class="left-panel">
        <TaskInput
          :tasks="tasks"
          @add-task="handleAddTask"
          @update-task="handleUpdateTask"
          @batch-update-tasks="handleBatchUpdateTasks"
          @remove-task="handleRemoveTask"
          @clear-tasks="handleClearTasks"
          @calculate="handleCalculate"
          @merge-tasks="handleMergeTasks"
        />
      </div>

      <!-- 右側：CPM 計算結果 -->
      <div class="right-panel" v-if="cpmResult">
        <CPMResultTable :cpm-result="cpmResult" />
      </div>
    </div>

    <!-- 📊 視覺化圖表區（分頁顯示）-->
    <section class="section" v-if="cpmResult && !cpmResult.hasCycle">
      <div class="chart-container">
        <div class="chart-tabs">
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'gantt' }"
            @click="activeTab = 'gantt'">
            Bar Chart
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'pdm' }"
            @click="activeTab = 'pdm'">
            PDM
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'resource' }"
            @click="activeTab = 'resource'">
            資源山積圖
          </button>
        </div>
        
        <div class="chart-content">
          <div v-show="activeTab === 'gantt'" class="chart-panel">
            <GanttChart :cpm-result="cpmResult" />
          </div>
          <div v-show="activeTab === 'pdm'" class="chart-panel">
            <PDMDiagram :cpm-result="cpmResult" />
          </div>
          <div v-show="activeTab === 'resource'" class="chart-panel">
            <ResourceHistogram :cpm-result="cpmResult" :tasks="tasks" />
          </div>
        </div>
      </div>
    </section>

    <!-- 💬 提示消息 -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>

  <!-- 📥 匯入對話框 -->
  <div v-if="showImportDialog" class="modal-overlay" @click="showImportDialog = false">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>{{ t.importDialog.title }}</h3>
        <button class="close-btn" @click="showImportDialog = false">×</button>
      </div>
      <div class="modal-body">
        <p class="modal-description">
          {{ t.importDialog.description }}
        </p>
        <input 
          type="file" 
          accept=".csv,.txt" 
          @change="handleFileImport"
          ref="fileInput"
          class="file-input"
        />
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showImportDialog = false">
            {{ t.importDialog.cancel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 📦 進度規劃頁面組件
 * 
 * 功能說明：
 * - CPM 計算與任務管理
 * - 甘特圖與 PDM 網圖視覺化
 * - CSV 匯入匯出功能
 */

import { ref, nextTick } from 'vue'
import TaskInput from '../components/TaskInput.vue'
import CPMResultTable from '../components/CPMResultTable.vue'
import GanttChart from '../components/GanttChart.vue'
import PDMDiagram from '../components/PDMDiagram.vue'
import ResourceHistogram from '../components/ResourceHistogram.vue'
import type { CPMTask, CPMResult } from '../types'
import { calculateCPM, buildTaskDependencies } from '../utils/cpmEngine'
import {
  exportTasksToCSV,
  exportCPMResultToCSV,
  exportCriticalPathReport,
  exportReportToPDF,
  importTasksFromCSV,
  downloadCSVTemplate
} from '../utils/dataIO'
import { useLanguage } from '../composables/useLanguage'

// 🌐 語言管理
const { t } = useLanguage()

// 🔄 響應式狀態
const tasks = ref<CPMTask[]>([])
const cpmResult = ref<CPMResult | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('info')
const showImportDialog = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const activeTab = ref<'gantt' | 'pdm' | 'resource'>('gantt')
let isMerging = false  // 🔄 合併標記，避免顯示多個通知

// 🔧 任務管理函式
function handleAddTask(task: CPMTask) {
  tasks.value.push(task)
  tasks.value = buildTaskDependencies(tasks.value)
  showMessage(t.value.messages.taskAdded, 'success')
}

function handleUpdateTask(updatedTask: CPMTask) {
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index !== -1) {
    tasks.value[index] = updatedTask
    // 🔄 只在非合併模式下重建依賴關係（合併時會統一處理）
    if (!isMerging) {
      tasks.value = buildTaskDependencies(tasks.value)
      showMessage(t.value.messages.taskUpdated, 'success')
    }
  }
}

function handleRemoveTask(taskId: string) {
  tasks.value = tasks.value.filter(t => t.id !== taskId)
  // 🔄 只在非合併模式下重建依賴關係（合併時會統一處理）
  if (!isMerging) {
    tasks.value = buildTaskDependencies(tasks.value)
    showMessage(t.value.messages.taskDeleted, 'success')
  }
}

// 🔄 批次更新任務（編輯時的依賴同步）
async function handleBatchUpdateTasks(tasksToUpdate: CPMTask[]) {
  console.log('🔄 批次更新開始，任務數量：', tasksToUpdate.length)
  console.log('📝 要更新的任務：', tasksToUpdate.map(t => ({ id: t.id, name: t.name })))
  
  // 🎯 批次更新所有相關任務
  for (const updatedTask of tasksToUpdate) {
    const index = tasks.value.findIndex(t => t.id === updatedTask.id)
    if (index !== -1) {
      console.log(`✅ 更新任務 ${index}: ${updatedTask.name}`)
      tasks.value[index] = updatedTask
    } else {
      console.warn(`⚠️ 找不到任務: ${updatedTask.id}`)
    }
  }
  
  // 🔄 使用 nextTick 確保所有響應式更新都完成
  await nextTick()
  
  // 🎯 重建依賴關係，確保更新傳播到所有作業
  console.log('🔧 重建依賴關係...')
  tasks.value = buildTaskDependencies(tasks.value)
  console.log('✅ 批次更新完成')
  
  showMessage(t.value.messages.taskUpdated, 'success')
}

async function handleMergeTasks() {
  isMerging = true
  
  // 🔄 使用 nextTick 確保所有響應式更新都完成
  await nextTick()
  
  // 🎯 額外延遲確保所有異步更新都穩定
  await new Promise(resolve => setTimeout(resolve, 150))
  
  // 重建依賴關係，確保更新傳播到所有作業
  tasks.value = buildTaskDependencies(tasks.value)
  showMessage(t.value.messages.tasksMerged, 'success')
  isMerging = false
}

function handleClearTasks() {
  tasks.value = []
  cpmResult.value = null
  showMessage(t.value.messages.tasksCleared, 'info')
}

// 🧮 CPM 計算函式
function handleCalculate() {
  if (tasks.value.length === 0) {
    showMessage(t.value.messages.error, 'error')
    return
  }
  
  try {
    cpmResult.value = calculateCPM(tasks.value)
    showMessage(t.value.messages.calculationComplete, 'success')
  } catch (error) {
    showMessage(t.value.messages.error + ': ' + (error as Error).message, 'error')
  }
}

// 💾 匯出函式
function exportTasks() {
  try {
    exportTasksToCSV(tasks.value)
    showMessage(t.value.messages.exportSuccess, 'success')
  } catch (error) {
    showMessage(t.value.messages.error + ': ' + (error as Error).message, 'error')
  }
}

function exportResults() {
  if (!cpmResult.value) return
  
  try {
    exportCPMResultToCSV(cpmResult.value)
    showMessage(t.value.messages.exportSuccess, 'success')
  } catch (error) {
    showMessage(t.value.messages.error + ': ' + (error as Error).message, 'error')
  }
}

async function exportReport() {
  if (!cpmResult.value) return
  
  try {
    // 💾 匯出 PDF 報表
    showMessage('正在生成 PDF 報表...', 'info')
    await exportReportToPDF(cpmResult.value)
    showMessage('PDF 報表已成功下載！', 'success')
  } catch (error) {
    showMessage(t.value.messages.error + ': ' + (error as Error).message, 'error')
  }
}

// 📥 匯入函式
function downloadTemplate() {
  try {
    downloadCSVTemplate()
    showMessage(t.value.messages.exportSuccess, 'success')
  } catch (error) {
    showMessage(t.value.messages.error + ': ' + (error as Error).message, 'error')
  }
}

async function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    const importedTasks = await importTasksFromCSV(file)
    tasks.value = importedTasks
    tasks.value = buildTaskDependencies(tasks.value)
    showImportDialog.value = false
    showMessage(t.value.messages.importSuccess, 'success')
    
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    showMessage(t.value.messages.error + ': ' + (error as Error).message, 'error')
  }
}

// 💬 訊息顯示函式
function showMessage(msg: string, type: 'success' | 'error' | 'info') {
  message.value = msg
  messageType.value = type
  
  setTimeout(() => {
    const messageEl = document.querySelector('.message')
    if (messageEl) {
      messageEl.classList.add('slide-out')
    }
  }, 1700)
  
  setTimeout(() => {
    message.value = ''
  }, 2000)
}
</script>

<style scoped>
/* ==========================================
   🎯 標題列區域樣式
   ========================================== */

.header-section {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  padding: 30px 0;
  margin: -20px -20px 30px -20px;
  border-bottom: 3px solid #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  color: #555;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.back-button:hover {
  color: #333;
  border-color: #999;
  background: #f9f9f9;
  transform: translateX(-3px);
}

.page-title {
  font-size: 32px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 14px;
  color: #777;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* ==========================================
   📊 圖表分頁標籤樣式
   ========================================== */

.chart-tabs {
  display: flex;
  gap: 5px;
  background: #f8f8f8;
  padding: 8px;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  flex: 1;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  color: #666;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.tab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s ease;
}

.tab-button:hover::before {
  left: 100%;
}

.tab-button:hover {
  color: #333;
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tab-button.active {
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.tab-button.active:hover {
  background: linear-gradient(135deg, #5568d3 0%, #65408b 100%);
}

.chart-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 30px;
}

.chart-content {
  padding: 20px;
  background: #fff;
}

.chart-panel {
  min-height: 400px;
}

/* 📱 響應式設計 */
@media (max-width: 768px) {
  .header-section {
    padding: 20px 0;
    margin: -15px -15px 20px -15px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .back-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .tab-button {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>
