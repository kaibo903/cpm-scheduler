<template>
  <div class="container">
    <!-- 🔙 頂部導航列：返回按鈕 + 頁面標題 -->
    <div class="top-navigation">
      <router-link to="/tools" class="back-button">
        {{ t.planning.backButton }}
      </router-link>
      <h2 class="page-title">{{ t.planning.title }}</h2>
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
        </div>
        
        <div class="chart-content">
          <div v-show="activeTab === 'gantt'" class="chart-panel">
            <GanttChart :cpm-result="cpmResult" />
          </div>
          <div v-show="activeTab === 'pdm'" class="chart-panel">
            <PDMDiagram :cpm-result="cpmResult" />
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

import { ref } from 'vue'
import TaskInput from '../components/TaskInput.vue'
import CPMResultTable from '../components/CPMResultTable.vue'
import GanttChart from '../components/GanttChart.vue'
import PDMDiagram from '../components/PDMDiagram.vue'
import type { CPMTask, CPMResult } from '../types'
import { calculateCPM, buildTaskDependencies } from '../utils/cpmEngine'
import {
  exportTasksToCSV,
  exportCPMResultToCSV,
  exportCriticalPathReport,
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
const activeTab = ref<'gantt' | 'pdm'>('gantt')
let isMerging = false  // 🔄 合併標記，避免顯示多個通知

// 🔧 任務管理函式
function handleAddTask(task: CPMTask) {
  tasks.value.push(task)
  buildTaskDependencies(tasks.value)
  showMessage(t.value.messages.taskAdded, 'success')
}

function handleUpdateTask(updatedTask: CPMTask) {
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index !== -1) {
    tasks.value[index] = updatedTask
    buildTaskDependencies(tasks.value)
    // 只在非合併模式下顯示訊息
    if (!isMerging) {
      showMessage(t.value.messages.taskUpdated, 'success')
    }
  }
}

function handleRemoveTask(taskId: string) {
  tasks.value = tasks.value.filter(t => t.id !== taskId)
  buildTaskDependencies(tasks.value)
  // 只在非合併模式下顯示訊息
  if (!isMerging) {
    showMessage(t.value.messages.taskDeleted, 'success')
  }
}

function handleMergeTasks() {
  isMerging = true
  // 延遲顯示訊息，確保所有更新和刪除都完成
  setTimeout(() => {
    showMessage(t.value.messages.tasksMerged, 'success')
    isMerging = false
  }, 100)
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

function exportReport() {
  if (!cpmResult.value) return
  
  try {
    exportCriticalPathReport(cpmResult.value)
    showMessage(t.value.messages.exportSuccess, 'success')
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
    buildTaskDependencies(tasks.value)
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
   🔙 頂部導航列樣式
   ========================================== */

.top-navigation {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
  padding: 10px 0;
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  background: #fff;
  transition: all 0.2s;
  white-space: nowrap;
}

.back-button:hover {
  color: #333;
  border-color: #333;
  background: #fafafa;
}

.page-title {
  font-size: 20px;
  color: #666;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* 📱 響應式設計 */
@media (max-width: 768px) {
  .top-navigation {
    margin-bottom: 20px;
    padding: 16px 0;
    gap: 16px;
  }

  .back-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .page-title {
    font-size: 18px;
  }
}
</style>
