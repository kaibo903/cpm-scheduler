<template>
  <div class="tct-optimizer">
    <!-- 📊 作業輸入區域 -->
    <div class="input-section">
      <h3 class="section-title">{{ t.tct.inputSection }}</h3>
      
      <!-- CSV 功能按鈕 -->
      <div class="csv-actions" v-if="tasks.length === 0">
        <button @click="showImportDialog = true" class="btn-import">
          {{ t.tct.importData }}
        </button>
        <button @click="downloadTemplate" class="btn-template">
          {{ t.tct.downloadTemplate }}
        </button>
      </div>
      
      <!-- 輸入表單 -->
      <div class="input-form">
        <div class="form-row">
          <div class="form-group">
            <label>{{ t.tct.taskName }}</label>
            <input 
              v-model="newTask.name" 
              type="text" 
              :placeholder="t.tct.taskName"
              @keyup.enter="addTask"
            />
          </div>
          
          <div class="form-group">
            <label :title="t.tct.tipNormalDuration">
              {{ t.tct.normalDuration }} ({{ t.tct.days }})
            </label>
            <input 
              v-model.number="newTask.normal_duration" 
              type="number" 
              min="1"
              @keyup.enter="addTask"
            />
          </div>
          
          <div class="form-group">
            <label :title="t.tct.tipCrashDuration">
              {{ t.tct.crashDuration }} ({{ t.tct.days }})
            </label>
            <input 
              v-model.number="newTask.crash_duration" 
              type="number" 
              min="1"
              @keyup.enter="addTask"
            />
          </div>
          
          <div class="form-group">
            <label :title="t.tct.tipNormalCost">
              {{ t.tct.normalCost }} ({{ t.tct.currency }})
            </label>
            <input 
              v-model.number="newTask.normal_cost" 
              type="number" 
              min="0"
              @keyup.enter="addTask"
            />
          </div>
          
          <div class="form-group">
            <label :title="t.tct.tipCrashCost">
              {{ t.tct.crashCost }} ({{ t.tct.currency }})
            </label>
            <input 
              v-model.number="newTask.crash_cost" 
              type="number" 
              min="0"
              @keyup.enter="addTask"
            />
          </div>
          
          <button @click="addTask" class="btn-add">
            {{ t.tct.addTask }}
          </button>
        </div>
        
        <!-- 前置作業選擇 -->
        <div v-if="tasks.length > 0" class="predecessors-section">
          <label class="section-label">{{ t.tct.predecessors }}</label>
          <div class="predecessors-chips">
            <button
              v-for="task in tasks"
              :key="task.name"
              @click="togglePredecessor(task.name)"
              :class="['chip', { selected: newTask.predecessors.includes(task.name) }]"
            >
              {{ task.name }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 錯誤訊息 -->
      <div v-if="validationError" class="error-message">
        {{ validationError }}
      </div>
    </div>

    <!-- 📋 作業列表 -->
    <div class="task-list-section" v-if="tasks.length > 0">
      <div class="section-header">
        <h3 class="section-title">{{ t.tct.taskListTitle }} ({{ tasks.length }})</h3>
        <div class="header-actions">
          <button @click="exportData" class="btn-action">
            {{ t.tct.exportData }}
          </button>
          <button @click="clearAll" class="btn-clear">
            {{ t.tct.clearAll }}
          </button>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="task-table">
          <thead>
            <tr>
              <th>{{ t.tct.taskName }}</th>
              <th>{{ t.tct.normalDuration }}</th>
              <th>{{ t.tct.crashDuration }}</th>
              <th>{{ t.tct.normalCost }}</th>
              <th>{{ t.tct.crashCost }}</th>
              <th>{{ t.tct.predecessors }}</th>
              <th>{{ t.tct.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task.name">
              <td><strong>{{ task.name }}</strong></td>
              <td class="numeric">{{ task.normal_duration }}</td>
              <td class="numeric">{{ task.crash_duration }}</td>
              <td class="numeric">{{ formatCurrency(task.normal_cost) }}</td>
              <td class="numeric">{{ formatCurrency(task.crash_cost) }}</td>
              <td>
                <span v-if="task.predecessors.length === 0" class="text-muted">—</span>
                <span v-else class="predecessors-list">{{ task.predecessors.join(', ') }}</span>
              </td>
              <td>
                <button @click="deleteTask(task.name)" class="btn-delete">
                  {{ t.tct.delete }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 🎯 專案參數設定 -->
    <div class="params-section" v-if="tasks.length > 0">
      <h3 class="section-title">{{ t.tct.projectParams }}</h3>
      
      <div class="params-form">
        <div class="form-group">
          <label :title="t.tct.tipOverheadCost">
            {{ t.tct.overheadCostPerDay }} ({{ t.tct.perDay }})
          </label>
          <input 
            v-model.number="projectParams.overhead_cost_per_day" 
            type="number" 
            min="0"
          />
        </div>
        
        <div class="form-group">
          <label :title="t.tct.tipDeadline">
            {{ t.tct.deadline }} ({{ t.tct.days }})
          </label>
          <input 
            v-model.number="projectParams.deadline" 
            type="number" 
            min="0"
            placeholder="選填"
          />
        </div>
        
        <div class="form-group">
          <label :title="t.tct.tipPenaltyCost">
            {{ t.tct.penaltyCostPerDay }} ({{ t.tct.perDay }})
          </label>
          <input 
            v-model.number="projectParams.penalty_per_day" 
            type="number" 
            min="0"
          />
        </div>
        
        <button @click="calculate" class="btn-calculate">
          {{ t.tct.calculate }}
        </button>
      </div>
    </div>

    <!-- 📊 計算結果 -->
    <div class="results-section" v-if="result">
      <div class="section-header">
        <h3 class="section-title">{{ t.tct.resultsTitle }}</h3>
        <button v-if="result.success" @click="exportResults" class="btn-export">
          {{ t.tct.exportResults }}
        </button>
      </div>
      
      <!-- 錯誤訊息 -->
      <div v-if="!result.success" class="error-box">
        <p><strong>{{ t.tct.errorInvalidData }}</strong></p>
        <p>{{ result.errorMessage }}</p>
      </div>
      
      <!-- 成功結果 -->
      <div v-else class="results-content">
        <!-- 摘要卡片 -->
        <div class="summary-cards">
          <div class="summary-card optimal">
            <div class="card-icon">🎯</div>
            <div class="card-label">{{ t.tct.optimalDuration }}</div>
            <div class="card-value">{{ result.optimal_duration }} {{ t.tct.days }}</div>
            <div class="card-change reduction">
              {{ t.tct.reduced }} {{ result.normal_duration - result.optimal_duration }} {{ t.tct.days }}
            </div>
          </div>
          
          <div class="summary-card cost">
            <div class="card-icon">💰</div>
            <div class="card-label">{{ t.tct.optimalCost }}</div>
            <div class="card-value">{{ formatCurrency(result.optimal_cost) }}</div>
            <div class="card-change" :class="result.cost_saving > 0 ? 'saving' : 'increase'">
              {{ result.cost_saving > 0 ? '節省' : '增加' }} {{ formatCurrency(Math.abs(result.cost_saving)) }}
            </div>
          </div>
          
          <div class="summary-card breakdown">
            <div class="card-icon">📊</div>
            <div class="card-label">{{ t.tct.costBreakdown }}</div>
            <div class="breakdown-items">
              <div class="breakdown-item">
                <span>{{ t.tct.crashCost }}:</span>
                <span>{{ formatCurrency(result.crash_cost) }}</span>
              </div>
              <div class="breakdown-item">
                <span>{{ t.tct.overheadCost }}:</span>
                <span>{{ formatCurrency(result.overhead_cost) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 作業執行計畫 -->
        <div class="execution-plan">
          <h4 class="subsection-title">{{ t.tct.executionPlan }}</h4>
          
          <table class="execution-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{{ t.tct.taskName }}</th>
                <th>{{ t.tct.startTime }}</th>
                <th>{{ t.tct.actualDuration }}</th>
                <th>{{ t.tct.crashDays }}</th>
                <th>{{ t.tct.crashCost }}</th>
                <th>{{ t.tct.critical }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in result.tasks" :key="task.name" :class="{ critical: task.isCritical }">
                <td><strong>{{ task.name }}</strong></td>
                <td>{{ task.name }}</td>
                <td class="numeric">{{ task.start_time }}</td>
                <td class="numeric">{{ task.actual_duration }}</td>
                <td class="numeric" :class="{ crashed: (task.crash_days || 0) > 0 }">
                  {{ task.crash_days || 0 }}
                </td>
                <td class="numeric">
                  {{ formatCurrency((task.crash_days || 0) * (task.crash_cost_per_day || 0)) }}
                </td>
                <td class="center">
                  <span v-if="task.isCritical" class="critical-badge">✓</span>
                  <span v-else class="text-muted">—</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5"><strong>{{ t.tct.total }}</strong></td>
                <td class="numeric"><strong>{{ formatCurrency(result.crash_cost) }}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- 趕工計畫表格 -->
        <div class="crash-plan">
          <h4 class="subsection-title">{{ t.tct.crashPlan }}</h4>
          
          <table class="crash-plan-table">
            <thead>
              <tr>
                <th>{{ t.tct.iterationColumn }}</th>
                <th>{{ t.tct.durationColumn }} ({{ t.tct.days }})</th>
                <th>{{ t.tct.crashedTaskColumn }}</th>
                <th>{{ t.tct.directCostColumn }}</th>
                <th>{{ t.tct.indirectCostColumn }}</th>
                <th>{{ t.tct.penaltyCostColumn }}</th>
                <th>{{ t.tct.totalCostColumn }}</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="iter in result.crashIterations" 
                :key="iter.iteration"
                :class="{ 
                  'optimal-row': iter.iteration > 0 && iter.totalCost === result.optimal_cost,
                  'normal-row': iter.iteration === 0
                }"
              >
                <td class="center">
                  <strong v-if="iter.iteration === 0">{{ t.tct.normalState }}</strong>
                  <span v-else>{{ t.tct.iterationLabel.replace('{n}', iter.iteration.toString()) }}</span>
                </td>
                <td class="numeric">{{ iter.duration }}</td>
                <td class="center">{{ iter.crashedTask }}</td>
                <td class="numeric">{{ formatCurrency(iter.directCost) }}</td>
                <td class="numeric">{{ formatCurrency(iter.overheadCost) }}</td>
                <td class="numeric">{{ formatCurrency(iter.penaltyCost) }}</td>
                <td class="numeric">
                  <strong>{{ formatCurrency(iter.totalCost) }}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 要徑 -->
        <div class="critical-path">
          <h4 class="subsection-title">{{ t.tct.criticalPath }}</h4>
          <div class="critical-path-chain">
            <span v-for="(taskId, index) in result.criticalPath" :key="taskId">
              <span class="path-node">{{ taskId }}</span>
              <span v-if="index < result.criticalPath.length - 1" class="path-arrow">→</span>
            </span>
          </div>
        </div>

        <!-- 成本-時間曲線 -->
        <div v-if="costTimeCurve.length > 0" class="chart-section">
          <h4 class="subsection-title">{{ t.tct.costTimeCurve }}</h4>
          <div class="chart-container">
            <svg ref="chartSvg" class="cost-time-chart"></svg>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-dot optimal"></span>
              <span>{{ t.tct.optimalPoint }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot normal"></span>
              <span>{{ t.tct.normalPoint }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-if="tasks.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>{{ t.tct.noTasks }}</p>
      <p class="empty-hint">{{ t.tct.startByAdding }}</p>
    </div>
    
    <!-- 📥 匯入對話框 -->
    <div v-if="showImportDialog" class="modal-overlay" @click="showImportDialog = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ t.tct.importData }}</h3>
          <button class="close-btn" @click="showImportDialog = false">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">
            請選擇包含作業資料的 CSV 檔案。檔案應包含以下欄位：<br>
            <strong>作業名稱、正常工期(天)、趕工工期(天)、正常成本(元)、趕工成本(元)、前置作業</strong>
          </p>
          <input 
            type="file" 
            accept=".csv,.txt" 
            @change="handleFileImport"
            ref="fileInput"
            class="file-input"
          />
          <div class="modal-actions">
            <button class="btn-secondary" @click="showImportDialog = false">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 📦 TCT 最佳化組件（V3 - 使用總成本輸入）
 * 
 * 功能說明：
 * - 作業資料輸入（名稱, 正常工期, 趕工工期, 正常成本, 趕工成本）
 * - 前置關係設定
 * - 專案參數設定（間接成本, 預期罰金）
 * - TCT 最佳化計算
 * - 結果展示（開工時間, 實際工期, 趕工天數, 成本分析）
 * - 成本-時間權衡曲線視覺化
 */

import { ref, computed, watch, nextTick } from 'vue'
import { useLanguage } from '../composables/useLanguage'
import type { TCTTask, TCTResult, CostTimePoint, ProjectParams } from '../utils/tctEngine'
import { 
  solveTCT, 
  validateTasks 
} from '../utils/tctEngine'
import {
  exportTCTTasksToCSV,
  exportTCTResultToCSV,
  importTCTTasksFromCSV,
  downloadTCTCSVTemplate
} from '../utils/dataIO'
import * as d3 from 'd3'

// 🌐 語言管理
const { t } = useLanguage()

// 📊 狀態管理
const tasks = ref<TCTTask[]>([])
const newTask = ref({
  name: '',
  normal_duration: 10,
  crash_duration: 7,
  normal_cost: 100000,
  crash_cost: 130000,
  predecessors: [] as string[]
})

const projectParams = ref<ProjectParams>({
  overhead_cost_per_day: 40000,
  penalty_per_day: 0
})

const result = ref<TCTResult | null>(null)
const costTimeCurve = ref<CostTimePoint[]>([])
const validationError = ref<string>('')
const chartSvg = ref<SVGSVGElement | null>(null)
const showImportDialog = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// 🔧 切換前置作業
function togglePredecessor(taskName: string) {
  const index = newTask.value.predecessors.indexOf(taskName)
  if (index > -1) {
    newTask.value.predecessors.splice(index, 1)
  } else {
    newTask.value.predecessors.push(taskName)
  }
}

// 🔧 新增作業
function addTask() {
  validationError.value = ''
  
  // ✅ 驗證輸入
  if (!newTask.value.name.trim()) {
    validationError.value = '請輸入作業名稱'
    return
  }
  
  if (tasks.value.some(t => t.name === newTask.value.name)) {
    validationError.value = '作業名稱已存在'
    return
  }
  
  if (newTask.value.normal_duration <= 0) {
    validationError.value = '正常工期必須大於 0'
    return
  }
  
  if (newTask.value.crash_duration <= 0) {
    validationError.value = '趕工工期必須大於 0'
    return
  }
  
  if (newTask.value.crash_duration > newTask.value.normal_duration) {
    validationError.value = '趕工工期不可大於正常工期'
    return
  }
  
  if (newTask.value.normal_cost < 0) {
    validationError.value = '正常成本不可為負數'
    return
  }
  
  if (newTask.value.crash_cost < 0) {
    validationError.value = '趕工成本不可為負數'
    return
  }
  
  if (newTask.value.crash_cost < newTask.value.normal_cost) {
    validationError.value = '趕工成本應大於或等於正常成本'
    return
  }
  
  // 📝 建立新作業
  const task: TCTTask = {
    name: newTask.value.name.trim(),
    normal_duration: newTask.value.normal_duration,
    crash_duration: newTask.value.crash_duration,
    normal_cost: newTask.value.normal_cost,
    crash_cost: newTask.value.crash_cost,
    predecessors: [...newTask.value.predecessors]
  }
  
  tasks.value.push(task)
  
  // 🔄 重置表單
  newTask.value = {
    name: '',
    normal_duration: 10,
    crash_duration: 7,
    normal_cost: 100000,
    crash_cost: 130000,
    predecessors: []
  }
  
  // 清除結果
  result.value = null
  costTimeCurve.value = []
}

// 🗑️ 刪除作業
function deleteTask(taskName: string) {
  // 檢查是否有其他作業依賴此作業
  const dependents = tasks.value.filter(t => t.predecessors.includes(taskName))
  if (dependents.length > 0) {
    if (!confirm(`作業 ${taskName} 被以下作業依賴：${dependents.map(t => t.name).join(', ')}。確定要刪除嗎？`)) {
      return
    }
    // 移除依賴關係
    dependents.forEach(t => {
      t.predecessors = t.predecessors.filter(p => p !== taskName)
    })
  }
  
  tasks.value = tasks.value.filter(t => t.name !== taskName)
  result.value = null
  costTimeCurve.value = []
}

// 🧹 清空所有
function clearAll() {
  if (confirm('確定要清空所有作業嗎？')) {
    tasks.value = []
    result.value = null
    costTimeCurve.value = []
  }
}

// 📤 匯出作業資料
function exportData() {
  try {
    exportTCTTasksToCSV(tasks.value)
    alert('匯出成功！')
  } catch (error) {
    alert('匯出失敗：' + (error as Error).message)
  }
}

// 📤 匯出計算結果
function exportResults() {
  if (!result.value) {
    alert('請先執行計算')
    return
  }
  
  try {
    exportTCTResultToCSV(result.value)
    alert('匯出成功！')
  } catch (error) {
    alert('匯出失敗：' + (error as Error).message)
  }
}

// 📥 下載 CSV 範本
function downloadTemplate() {
  try {
    downloadTCTCSVTemplate()
    alert('範本下載成功！')
  } catch (error) {
    alert('下載失敗：' + (error as Error).message)
  }
}

// 📥 處理檔案匯入
async function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    const importedTasks = await importTCTTasksFromCSV(file)
    tasks.value = importedTasks
    showImportDialog.value = false
    result.value = null
    costTimeCurve.value = []
    validationError.value = ''
    alert(`成功匯入 ${importedTasks.length} 筆作業資料！`)
    
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    alert('匯入失敗：' + (error as Error).message)
  }
}

// 🧮 執行計算
function calculate() {
  validationError.value = ''
  
  // ✅ 驗證作業
  const validation = validateTasks(tasks.value)
  if (!validation.valid) {
    validationError.value = validation.errors.join('; ')
    return
  }
  
  // 🚀 執行最佳化
  result.value = solveTCT(tasks.value, projectParams.value)
  
  // 📈 從結果生成成本-時間曲線（確保與計算結果一致）
  if (result.value && result.value.success) {
    costTimeCurve.value = result.value.crashIterations.map(iter => ({
      duration: iter.duration,
      cost: iter.totalCost,
      crash_cost: iter.directCost - (tasks.value.reduce((sum, t) => sum + t.normal_cost, 0)),
      overhead_cost: iter.overheadCost
    }))
    
    // 繪製圖表
    nextTick(() => {
      drawChart()
    })
  }
}

// 🎨 繪製成本-時間曲線圖
function drawChart() {
  if (!chartSvg.value || costTimeCurve.value.length === 0 || !result.value) return
  
  // 清空現有內容
  d3.select(chartSvg.value).selectAll('*').remove()
  
  const margin = { top: 20, right: 30, bottom: 60, left: 100 }
  const width = 700 - margin.left - margin.right
  const height = 400 - margin.top - margin.bottom
  
  const svg = d3.select(chartSvg.value)
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
  
  // 設定比例尺
  const xScale = d3.scaleLinear()
    .domain([
      d3.min(costTimeCurve.value, d => d.duration) || 0,
      d3.max(costTimeCurve.value, d => d.duration) || 100
    ])
    .range([0, width])
  
  const yScale = d3.scaleLinear()
    .domain([
      d3.min(costTimeCurve.value, d => d.cost) || 0,
      d3.max(costTimeCurve.value, d => d.cost) || 1000000
    ])
    .range([height, 0])
  
  // X 軸
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .append('text')
    .attr('x', width / 2)
    .attr('y', 45)
    .attr('fill', '#333')
    .attr('text-anchor', 'middle')
    .style('font-size', '13px')
    .style('font-weight', '500')
    .text(t.value.tct.duration)
  
  // Y 軸
  svg.append('g')
    .call(d3.axisLeft(yScale).tickFormat(d => formatCurrency(d as number)))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -75)
    .attr('fill', '#333')
    .attr('text-anchor', 'middle')
    .style('font-size', '13px')
    .style('font-weight', '500')
    .text(t.value.tct.cost)
  
  // 繪製線條
  const line = d3.line<CostTimePoint>()
    .x(d => xScale(d.duration))
    .y(d => yScale(d.cost))
  
  svg.append('path')
    .datum(costTimeCurve.value)
    .attr('fill', 'none')
    .attr('stroke', '#667eea')
    .attr('stroke-width', 2.5)
    .attr('d', line)
  
  // 繪製點
  svg.selectAll('circle')
    .data(costTimeCurve.value)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.duration))
    .attr('cy', d => yScale(d.cost))
    .attr('r', 4)
    .attr('fill', '#667eea')
    .style('cursor', 'pointer')
    .append('title')
    .text(d => `工期: ${d.duration} 天\n總成本: ${formatCurrency(d.cost)}\n趕工成本: ${formatCurrency(d.crash_cost)}\n間接成本: ${formatCurrency(d.overhead_cost)}`)
  
  // 標記最佳點
  if (result.value) {
    svg.append('circle')
      .attr('cx', xScale(result.value.optimal_duration))
      .attr('cy', yScale(result.value.optimal_cost))
      .attr('r', 7)
      .attr('fill', '#27ae60')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
    
    // 標記正常點
    svg.append('circle')
      .attr('cx', xScale(result.value.normal_duration))
      .attr('cy', yScale(result.value.normal_cost))
      .attr('r', 7)
      .attr('fill', '#e74c3c')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
  }
}

// 💰 格式化貨幣
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// 👀 監聽窗口大小變化，重繪圖表
watch(() => costTimeCurve.value.length, () => {
  if (costTimeCurve.value.length > 0) {
    nextTick(() => drawChart())
  }
})
</script>

<style scoped>
/* ==========================================
   🎨 TCT 最佳化組件樣式（V2）
   ========================================== */

.tct-optimizer {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 📊 區域標題 */
.section-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 16px 0;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.subsection-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.section-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
}

/* 📝 輸入區域 */
.input-section {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 24px;
}

.input-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 80px 1.5fr 1fr 1fr 1.2fr auto;
  gap: 12px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #f54ea2;
}

/* 前置作業選擇 */
.predecessors-section {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.predecessors-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  padding: 6px 14px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.chip.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-add {
  padding: 8px 20px;
  background: linear-gradient(135deg, #f54ea2 0%, #ff7676 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 78, 162, 0.3);
}

/* ⚠️ 錯誤訊息 */
.error-message {
  color: #e74c3c;
  font-size: 13px;
  background: #fee;
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #e74c3c;
  margin-top: 12px;
}

/* 📋 作業列表 */
.task-list-section {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-clear {
  padding: 6px 16px;
  background: #fff;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: #e74c3c;
  color: white;
}

.table-wrapper {
  overflow-x: auto;
}

.task-table,
.execution-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.task-table th,
.execution-table th {
  background: #f8f8f8;
  padding: 10px;
  text-align: left;
  font-weight: 500;
  color: #666;
  border-bottom: 1px solid #e8e8e8;
}

.task-table td,
.execution-table td {
  padding: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.task-table td.numeric,
.execution-table td.numeric {
  text-align: right;
  font-family: 'Courier New', monospace;
}

.execution-table td.center {
  text-align: center;
}

.text-muted {
  color: #ccc;
}

.predecessors-list {
  color: #667eea;
  font-weight: 500;
  font-size: 12px;
}

.btn-delete {
  padding: 4px 12px;
  background: #fff;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #e74c3c;
  color: white;
}

/* 專案參數 */
.params-section {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 24px;
}

.params-form {
  display: flex;
  gap: 12px;
  align-items: end;
}

.params-form .form-group {
  flex: 0 0 250px;
}

.btn-calculate {
  padding: 8px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-calculate:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* 計算結果 */
.results-section {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 24px;
}

.error-box {
  background: #fee;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  padding: 16px;
  color: #c0392b;
}

.results-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 摘要卡片 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.summary-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.summary-card.optimal {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.summary-card.cost {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.summary-card.breakdown {
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
}

.card-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.card-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.card-value {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.card-change {
  font-size: 14px;
  font-weight: 500;
}

.card-change.reduction,
.card-change.saving {
  color: #27ae60;
}

.card-change.increase {
  color: #e74c3c;
}

.breakdown-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.breakdown-item:last-child {
  border-bottom: none;
}

/* 執行計畫表格 */
.execution-plan {
  margin-top: 20px;
}

.execution-table tr.critical {
  background: #fff5f5;
}

.execution-table td.crashed {
  color: #e74c3c;
  font-weight: 600;
}

.critical-badge {
  color: #e74c3c;
  font-weight: 700;
  font-size: 16px;
}

.execution-table tfoot td {
  font-weight: 600;
  border-top: 2px solid #333;
  background: #f8f8f8;
}

/* 📊 趕工計畫表格 */
.crash-plan {
  margin-top: 30px;
}

.crash-plan-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background: white;
}

.crash-plan-table thead th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  border: 1px solid #5568d3;
}

.crash-plan-table tbody td {
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
  text-align: center;
}

.crash-plan-table tr.normal-row {
  background: #f8f9ff;
  font-weight: 600;
}

.crash-plan-table tr.optimal-row {
  background: #fff9e6;
  border: 2px solid #ffc107;
}

.crash-plan-table tr.optimal-row td {
  font-weight: 600;
  color: #f57c00;
}

.crash-plan-table tbody tr:hover {
  background: #f5f5f5;
}

.crash-plan-table tr.normal-row:hover {
  background: #e8ecff;
}

.crash-plan-table tr.optimal-row:hover {
  background: #fff3cd;
}

/* 要徑 */
.critical-path {
  margin-top: 20px;
}

.critical-path-chain {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 20px;
  background: #fff5f5;
  border: 2px dashed #e74c3c;
  border-radius: 8px;
}

.path-node {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
}

.path-arrow {
  font-size: 20px;
  color: #e74c3c;
  font-weight: 700;
}

/* 圖表 */
.chart-section {
  margin-top: 32px;
}

.chart-container {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  justify-content: center;
  overflow-x: auto;
}

.cost-time-chart {
  font-family: Arial, sans-serif;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.legend-dot.optimal {
  background: #27ae60;
}

.legend-dot.normal {
  background: #e74c3c;
}

/* 空狀態 */
.empty-state {
  background: #f8f8f8;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 80px 20px;
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  margin: 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #bbb;
}

/* 📥 CSV 功能按鈕 */
.csv-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.btn-import,
.btn-template {
  padding: 10px 20px;
  border: 1px solid #667eea;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-import {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-import:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.btn-template {
  background: white;
  color: #667eea;
}

.btn-template:hover {
  background: #f5f7ff;
}

.btn-action,
.btn-export {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover,
.btn-export:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 📥 匯入對話框 */
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
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
}

.modal-description {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.file-input {
  display: block;
  width: 100%;
  padding: 12px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.file-input:hover {
  border-color: #667eea;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-secondary {
  padding: 8px 16px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

/* 響應式 */
@media (max-width: 1200px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .form-row .btn-add {
    grid-column: 1 / -1;
  }
  
  .modal {
    width: 95%;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .params-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .params-form .form-group {
    flex: 1;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .critical-path-chain {
    flex-direction: column;
  }
}
</style>
