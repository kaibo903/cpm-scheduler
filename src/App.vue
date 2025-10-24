<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <h1>工程進度規劃與控制課程解答工具</h1>
        <p class="subtitle">Construction Planning and Scheduling Learning Assistant</p>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <!-- 工具列 -->
        <div class="toolbar">
          <div class="toolbar-section">
            <button class="btn btn-outline" @click="showImportDialog = true">
              匯入 CSV
            </button>
            <button class="btn btn-outline" @click="downloadTemplate">
              下載 CSV範本
            </button>
          </div>
          
          <div class="toolbar-section" v-if="tasks.length > 0">
            <button class="btn btn-outline" @click="exportTasks">
              匯出工項
            </button>
            <button class="btn btn-outline" @click="exportResults" :disabled="!cpmResult">
              匯出結果
            </button>
            <button class="btn btn-outline" @click="exportReport" :disabled="!cpmResult">
              匯出報告
            </button>
          </div>
        </div>

        <!-- 左右分栏布局 -->
        <div class="main-layout">
          <!-- 左侧：任务输入 -->
          <div class="left-panel">
            <TaskInput
              :tasks="tasks"
              @add-task="handleAddTask"
              @update-task="handleUpdateTask"
              @remove-task="handleRemoveTask"
              @clear-tasks="handleClearTasks"
              @calculate="handleCalculate"
            />
          </div>

          <!-- 右侧：CPM 计算结果 -->
          <div class="right-panel" v-if="cpmResult">
            <CPMResultTable :cpm-result="cpmResult" />
          </div>
        </div>

        <!-- 底部全宽：甘特图 -->
        <section class="section" v-if="cpmResult && !cpmResult.hasCycle">
          <GanttChart :cpm-result="cpmResult" />
        </section>

        <!-- 提示消息 -->
        <div v-if="message" class="message" :class="messageType">
          {{ message }}
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <div class="container">
        <p>© 2025 Construction Planning and Scheduling Learning Assistant v1.1 </p>
        <p>Designed by：國立雲林科技大學 營建工程系 EB502 </p>
      
      </div>
    </footer>

    <!-- 导入对话框 -->
    <div v-if="showImportDialog" class="modal-overlay" @click="showImportDialog = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>匯入 CSV 檔案</h3>
          <button class="close-btn" @click="showImportDialog = false">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">
            選擇包含工項資料的 CSV 檔案。檔案應包含以下欄位：
            <br>工項名稱、工期(天)、前置作業、後續作業
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
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TaskInput from './components/TaskInput.vue'
import CPMResultTable from './components/CPMResultTable.vue'
import GanttChart from './components/GanttChart.vue'
import type { CPMTask, CPMResult } from './types'
import { calculateCPM, buildTaskDependencies } from './utils/cpmEngine'
import {
  exportTasksToCSV,
  exportCPMResultToCSV,
  exportCriticalPathReport,
  importTasksFromCSV,
  downloadCSVTemplate
} from './utils/dataIO'

const tasks = ref<CPMTask[]>([])
const cpmResult = ref<CPMResult | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('info')
const showImportDialog = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function handleAddTask(task: CPMTask) {
  tasks.value.push(task)
  
  // 自动构建依赖关系
  tasks.value = buildTaskDependencies(tasks.value)
  
  showMessage('工項新增成功', 'success')
  
  // 如果已经计算过，自动重新计算
  if (cpmResult.value) {
    handleCalculate()
  }
}

function handleUpdateTask(updatedTask: CPMTask) {
  // 找到并更新任务
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index === -1) return
  
  tasks.value[index] = updatedTask
  
  // 自动构建依赖关系
  tasks.value = buildTaskDependencies(tasks.value)
  
  showMessage('工項更新成功', 'success')
  
  // 如果已经计算过，自动重新计算
  if (cpmResult.value) {
    handleCalculate()
  }
}

function handleRemoveTask(taskId: string) {
  // 移除任务
  tasks.value = tasks.value.filter(t => t.id !== taskId)
  
  // 清理依赖关系
  tasks.value.forEach(task => {
    task.predecessors = task.predecessors.filter(dep => dep.taskId !== taskId)
    task.successors = task.successors.filter(dep => dep.taskId !== taskId)
  })
  
  showMessage('工項已刪除', 'info')
  
  // 重新计算
  if (cpmResult.value && tasks.value.length > 0) {
    handleCalculate()
  } else if (tasks.value.length === 0) {
    cpmResult.value = null
  }
}

function handleClearTasks() {
  tasks.value = []
  cpmResult.value = null
  showMessage('所有工項已清空', 'info')
}

function handleCalculate() {
  if (tasks.value.length === 0) {
    showMessage('請先新增工項', 'error')
    return
  }

  try {
    const result = calculateCPM(tasks.value)
    cpmResult.value = result

    if (result.errors && result.errors.length > 0) {
      showMessage(`計算完成，但有 ${result.errors.length} 個錯誤`, 'error')
    } else if (result.hasCycle) {
      showMessage('檢測到循環依賴，請修正依賴關係', 'error')
    } else {
      showMessage(`計算成功！專案總工期：${result.totalDuration} 天`, 'success')
    }
  } catch (error) {
    showMessage('計算失敗：' + (error as Error).message, 'error')
  }
}

function exportTasks() {
  try {
    exportTasksToCSV(tasks.value)
    showMessage('工項資料已匯出', 'success')
  } catch (error) {
    showMessage('匯出失敗：' + (error as Error).message, 'error')
  }
}

function exportResults() {
  if (!cpmResult.value) return
  
  try {
    exportCPMResultToCSV(cpmResult.value)
    showMessage('CPM 結果已匯出', 'success')
  } catch (error) {
    showMessage('匯出失敗：' + (error as Error).message, 'error')
  }
}

function exportReport() {
  if (!cpmResult.value) return
  
  try {
    exportCriticalPathReport(cpmResult.value)
    showMessage('關鍵路徑報告已匯出', 'success')
  } catch (error) {
    showMessage('匯出失敗：' + (error as Error).message, 'error')
  }
}

function downloadTemplate() {
  try {
    downloadCSVTemplate()
    showMessage('範本已下載', 'success')
  } catch (error) {
    showMessage('下載失敗：' + (error as Error).message, 'error')
  }
}

async function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    const importedTasks = await importTasksFromCSV(file)
    tasks.value = importedTasks
    cpmResult.value = null
    showImportDialog.value = false
    showMessage(`成功匯入 ${importedTasks.length} 個工項`, 'success')
    
    // 自动计算
    setTimeout(() => {
      handleCalculate()
    }, 100)
  } catch (error) {
    showMessage('匯入失敗：' + (error as Error).message, 'error')
  }
  
  // 清空文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function showMessage(text: string, type: 'success' | 'error' | 'info' = 'info') {
  message.value = text
  messageType.value = type
  
  setTimeout(() => {
    message.value = ''
  }, 5000)
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.app-header {
  background: #fff;
  color: #333;
  padding: 32px 0;
  border-bottom: 1px solid #e8e8e8;
}

.app-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 1px;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #999;
  font-weight: 400;
}

.app-main {
  flex: 1;
  padding: 40px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  flex-wrap: wrap;
  border: 1px solid #e8e8e8;
}

.toolbar-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border-radius: 2px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  border: 1px solid #d0d0d0;
  color: #666;
}

.btn-outline:hover:not(:disabled) {
  background: #333;
  color: white;
  border-color: #333;
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

/* 左右分栏布局 */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.left-panel {
  min-width: 0;
}

.right-panel {
  min-width: 0;
}

.section {
  margin-bottom: 24px;
}

.message {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
  max-width: 400px;
}

.message.success {
  background: #27ae60;
  color: white;
}

.message.error {
  background: #e74c3c;
  color: white;
}

.message.info {
  background: #3498db;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.app-footer {
  background: #fff;
  color: #999;
  padding: 24px 0;
  text-align: center;
  border-top: 1px solid #e8e8e8;
}

.app-footer p {
  margin: 6px 0;
  font-size: 12px;
}

.footer-note {
  font-size: 12px;
  color: #bbb;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: white;
  border-radius: 2px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
  border: 1px solid #e8e8e8;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #ccc;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 28px;
  height: 28px;
}

.close-btn:hover {
  color: #999;
}

.modal-body {
  padding: 24px;
}

.modal-description {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.8;
  font-size: 13px;
}

.file-input {
  display: block;
  width: 100%;
  padding: 12px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 0.2s;
  background: #fafafa;
}

.file-input:hover {
  border-color: #999;
  background: #fff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-section {
    width: 100%;
  }
  
  .app-header h1 {
    font-size: 20px;
  }
  
  .container {
    padding: 0 16px;
  }

  .main-layout {
    gap: 16px;
  }
}
</style>
