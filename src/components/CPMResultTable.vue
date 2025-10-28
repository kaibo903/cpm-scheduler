<template>
  <div class="cpm-result">
    <div class="result-header">
      <h2><span class="cpm-text">CPM</span> {{ t.cpmResult.summary }}</h2>
    </div>

    <div v-if="cpmResult?.errors && cpmResult.errors.length > 0" class="error-box">
      <h3><span class="warning-icon"></span>{{ t.cpmResult.errorTitle }}</h3>
      <ul>
        <li v-for="(error, index) in cpmResult.errors" :key="index">{{ error }}</li>
      </ul>
    </div>

    <div v-if="cpmResult?.hasCycle" class="warning-box">
      <h3><span class="warning-icon"></span>{{ t.cpmResult.cycleDetected }}</h3>
      <p>{{ t.cpmResult.cycleDesc }}</p>
    </div>

    <div v-if="cpmResult && !cpmResult.hasCycle && (!cpmResult.errors || cpmResult.errors.length === 0)">
      <!-- 合併的摘要區塊 -->
      <div class="summary-section">
        <div class="summary-stats">
          <div class="summary-item">
            <span class="label">{{ t.cpmResult.totalDuration }}：</span>
            <span class="value highlight">{{ cpmResult.totalDuration }} 天</span>
          </div>
          <div class="summary-item">
            <span class="label">{{ t.cpmResult.criticalCount }}：</span>
            <span class="value">{{ cpmResult.criticalPath.length }} 項</span>
          </div>
        </div>
        
        <div class="critical-path-display">
          <h3><span class="dot"></span>{{ t.cpmResult.critical }}</h3>
          <div class="critical-path-flow">
            <div 
              v-for="(taskId, index) in cpmResult.criticalPath" 
              :key="taskId"
              class="path-item"
            >
              <span class="task-badge critical">{{ getTaskName(taskId) }}</span>
              <span v-if="index < cpmResult.criticalPath.length - 1" class="arrow">→</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CPM 詳細結果表格 -->
      <div class="table-section result-table">
        <h3>{{ t.cpmResult.detailedResults }}</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ t.cpmResult.taskName }}</th>
                <th>{{ t.cpmResult.duration }}</th>
                <th>{{ t.cpmResult.es }}</th>
                <th>{{ t.cpmResult.ef }}</th>
                <th>{{ t.cpmResult.ls }}</th>
                <th>{{ t.cpmResult.lf }}</th>
                <th>{{ t.cpmResult.tf }}</th>
                <th>{{ t.cpmResult.ff }}</th>
                <th>{{ t.cpmResult.critical }}</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="task in cpmResult.tasks" 
                :key="task.id"
                :class="{ 'critical-row': task.isCritical }"
              >
                <td class="task-name">
                  <div class="name-cell">
                    <span>{{ task.name }}</span>
                    <span v-if="task.isStart" class="tag tag-start">起始</span>
                    <span v-if="task.isEnd" class="tag tag-end">結束</span>
                  </div>
                </td>
                <td class="task-duration-cell">{{ task.duration }}</td>
                <td class="center">{{ task.es ?? '-' }}</td>
                <td class="center">{{ task.ef ?? '-' }}</td>
                <td class="center">{{ task.ls ?? '-' }}</td>
                <td class="center">{{ task.lf ?? '-' }}</td>
                <td class="center" :class="{ 'zero-float': task.tf === 0 }">
                  {{ task.tf ?? '-' }}
                </td>
                <td class="center">{{ task.ff ?? '-' }}</td>
                <td class="center">
                  <span v-if="task.isCritical" class="critical-badge">✓</span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 說明 -->
      <div class="legend">
        <h4>欄位說明</h4>
        <div class="legend-grid">
          <div class="legend-item">
            <strong>ES (Earliest Start)：</strong> 最早開始時間
          </div>
          <div class="legend-item">
            <strong>EF (Earliest Finish)：</strong> 最早完成時間
          </div>
          <div class="legend-item">
            <strong>LS (Latest Start)：</strong> 最晚開始時間
          </div>
          <div class="legend-item">
            <strong>LF (Latest Finish)：</strong> 最晚完成時間
          </div>
          <div class="legend-item">
            <strong>TF (Total Float)：</strong> 總浮時
          </div>
          <div class="legend-item">
            <strong>FF (Free Float)：</strong> 自由浮時
          </div>
        </div>
      </div>
    </div>

    <div v-if="!cpmResult" class="empty-state">
      <p>尚未進行 CPM 計算，請先新增作業並點擊「計算排程」</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CPMResult } from '../types'
import { useLanguage } from '../composables/useLanguage'

// 🌐 語言管理
const { t } = useLanguage()

const props = defineProps<{
  cpmResult: CPMResult | null
}>()

function getTaskName(taskId: string): string {
  if (!props.cpmResult) return taskId
  const task = props.cpmResult.tasks.find(t => t.id === taskId)
  return task ? task.name : taskId
}
</script>

<style scoped>
.cpm-result {
  background: #ffffff;
  border-radius: 2px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
}

.result-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.result-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.result-header h2 .cpm-text {
  font-weight: 300;
}

/* 🎯 合併的摘要區塊 */
.summary-section {
  padding: 20px;
  background: #fafafa;
  border-radius: 2px;
  border: 1px solid #e8e8e8;
  margin-bottom: 32px;
}

.summary-stats {
  display: flex;
  gap: 32px;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-item .label {
  color: #999;
  font-size: 13px;
  font-weight: 400;
}

.summary-item .value {
  color: #333;
  font-weight: 500;
  font-size: 18px;
}

.summary-item .value.highlight {
  color: #c33;
  font-size: 24px;
  font-weight: 500;
}

.error-box,
.warning-box {
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 2px;
  border-left: 3px solid #c33;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-left: 3px solid #c33;
}

.error-box h3,
.warning-box h3 {
  margin: 0 0 12px 0;
  color: #c33;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-box h3 .warning-icon,
.warning-box h3 .warning-icon {
  width: 16px;
  height: 16px;
  background: #ff9800;
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.error-box h3 .warning-icon::before,
.warning-box h3 .warning-icon::before {
  content: '!';
  color: white;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.error-box ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
}

.warning-box p {
  margin: 0;
  color: #666;
}

.critical-path-display h3 {
  margin: 0 0 16px 0;
  color: #c33;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.critical-path-display h3 .dot {
  width: 10px;
  height: 10px;
  background: #d9534f;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.critical-path-flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.path-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-badge {
  padding: 6px 12px;
  border-radius: 2px;
  font-weight: 400;
  font-size: 13px;
  transition: all 0.2s;
}

.task-badge.critical {
  background: #c33;
  color: white;
  border: 1px solid #c33;
}

.task-badge.critical:hover {
  background: #a22;
}

.arrow {
  color: #c33;
  font-size: 16px;
  font-weight: normal;
}

.table-section {
  margin-bottom: 24px;
}

.table-section h3 {
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
  max-width: 100%;
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
  text-align: center;
  font-weight: 400;
  font-size: 12px;
  color: #666;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

th:first-child {
  text-align: left;
}

th.right {
  text-align: right;
}

td {
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  vertical-align: middle;
  white-space: nowrap;
}

tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
  height: auto;
}

tbody tr:hover {
  background: #fafafa;
}

.center {
  text-align: center;
}

.task-duration-cell {
  text-align: center;
}

.task-name {
  font-weight: 400;
  color: #333;
  text-align: left;
  white-space: nowrap;
}

.name-cell {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.name-cell > span:first-child {
  line-height: 1.4;
  white-space: nowrap;
}

.tag {
  display: inline-block;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 9px;
  font-weight: 400;
  border: 1px solid;
  line-height: 1.2;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-start {
  background: #f0f0f0;
  color: #666;
  border-color: #d0d0d0;
}

.tag-end {
  background: #f0f0f0;
  color: #666;
  border-color: #d0d0d0;
}

.critical-row {
  background: #fafafa;
}

.critical-row .task-name {
  color: #c33;
  font-weight: 500;
}

.zero-float {
  background: #f5f5f5;
  color: #c33;
  font-weight: 500;
}

.critical-badge {
  display: inline-block;
  color: #c33;
  font-size: 16px;
  font-weight: normal;
}

.legend {
  padding: 16px;
  background: #fafafa;
  border-radius: 2px;
  border: 1px solid #e8e8e8;
}

.legend h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.legend-item {
  font-size: 13px;
  color: #666;
}

.legend-item strong {
  color: #333;
  font-weight: 500;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #999;
  font-style: italic;
  font-size: 13px;
}
</style>

