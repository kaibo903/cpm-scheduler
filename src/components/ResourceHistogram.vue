<template>
  <div class="resource-histogram">
    <div class="histogram-header">
      <h2>資源山積圖</h2>
      <div class="controls">
        <label class="resource-filter">
          <span>顯示資源：</span>
          <select v-model="selectedResourceType" class="resource-select">
            <option value="all">全部</option>
            <option value="resource">資源</option>
            <option value="other">其他</option>
          </select>
        </label>
      </div>
    </div>
    
    <div v-if="!cpmResult || cpmResult.tasks.length === 0 || !hasResources" class="empty-state">
      <p>{{ hasResources ? '尚未計算進度' : '尚未新增資源項目' }}</p>
    </div>

    <div v-else class="histogram-container">
      <svg ref="svgRef" class="histogram-svg"></svg>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 📦 資源山積圖組件
 * 
 * 功能說明：
 * - 顯示專案中資源的時間分布
 * - 以直方圖形式呈現各時段資源使用量
 * - 可篩選資源類型
 */

import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { CPMTask, CPMResult } from '../types'
import * as d3 from 'd3'

// 📥 Props 定義
const props = defineProps<{
  cpmResult: CPMResult
  tasks: CPMTask[]
}>()

// 🔄 響應式狀態
const svgRef = ref<SVGSVGElement | null>(null)
const selectedResourceType = ref<'all' | 'resource' | 'other'>('all')

// 🧮 計算屬性：檢查是否有資源
const hasResources = computed(() => {
  return props.tasks.some(task => 
    task.resources && task.resources.length > 0
  )
})

// 🧮 計算屬性：資源使用數據
const resourceData = computed(() => {
  if (!props.cpmResult) return []

  const dailyResources: Map<number, { resource: number; other: number }> = new Map()
  
  // 遍歷所有任務
  props.cpmResult.tasks.forEach(task => {
    if (task.es !== undefined && task.ef !== undefined && task.resources && task.resources.length > 0) {
      const startDay = Math.floor(task.es)
      const endDay = Math.ceil(task.ef)
      
      // 計算該任務的資源使用量
      task.resources.forEach(resource => {
        const quantity = resource.quantity || 0
        
        // 為任務執行期間的每一天累加資源
        for (let day = startDay; day < endDay; day++) {
          if (!dailyResources.has(day)) {
            dailyResources.set(day, { resource: 0, other: 0 })
          }
          const dayData = dailyResources.get(day)!
          
          if (resource.type === 'resource') {
            dayData.resource += quantity
          } else {
            dayData.other += quantity
          }
        }
      })
    }
  })

  // 轉換為陣列格式
  const result = Array.from(dailyResources.entries()).map(([day, data]) => ({
    day,
    resource: data.resource,
    other: data.other,
    total: data.resource + data.other
  }))

  // 按天數排序
  return result.sort((a, b) => a.day - b.day)
})

// 🧮 計算屬性：篩選後的數據
const filteredData = computed(() => {
  return resourceData.value.map(d => ({
    day: d.day,
    value: selectedResourceType.value === 'all' ? d.total :
           selectedResourceType.value === 'resource' ? d.resource : d.other
  }))
})

// 🎨 繪製直方圖
function drawHistogram() {
  if (!svgRef.value || filteredData.value.length === 0) return

  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()

  const container = svgRef.value.parentElement
  if (!container) return

  const width = container.clientWidth
  const height = 500
  const margin = { top: 40, right: 40, bottom: 60, left: 60 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  svg.attr('width', width).attr('height', height)

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // 📊 設定比例尺
  const xScale = d3.scaleBand()
    .domain(filteredData.value.map(d => d.day.toString()))
    .range([0, innerWidth])
    .padding(0.2)

  const maxValue = d3.max(filteredData.value, d => d.value) || 0
  const yScale = d3.scaleLinear()
    .domain([0, maxValue * 1.1])
    .range([innerHeight, 0])
    .nice()

  // 🎨 繪製長條
  g.selectAll('.bar')
    .data(filteredData.value)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.day.toString()) || 0)
    .attr('y', d => yScale(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height', d => innerHeight - yScale(d.value))
    .attr('fill', '#4285f4')
    .attr('rx', 2)
    .on('mouseover', function(event, d) {
      d3.select(this).attr('fill', '#1967d2')
      showTooltip(event, d)
    })
    .on('mouseout', function() {
      d3.select(this).attr('fill', '#4285f4')
      hideTooltip()
    })

  // 📏 X 軸
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d => `第${d}天`)
  
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .attr('dx', '-0.8em')
    .attr('dy', '0.15em')

  // 📏 Y 軸
  const yAxis = d3.axisLeft(yScale)
  
  g.append('g')
    .attr('class', 'y-axis')
    .call(yAxis)

  // 📝 Y 軸標籤
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerHeight / 2)
    .attr('y', -45)
    .style('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#666')
    .text('資源使用量')

  // 📝 X 軸標籤
  g.append('text')
    .attr('x', innerWidth / 2)
    .attr('y', innerHeight + 55)
    .style('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#666')
    .text('時間（天）')

  // 📊 繪製數值標籤
  g.selectAll('.value-label')
    .data(filteredData.value)
    .enter()
    .append('text')
    .attr('class', 'value-label')
    .attr('x', d => (xScale(d.day.toString()) || 0) + xScale.bandwidth() / 2)
    .attr('y', d => yScale(d.value) - 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('fill', '#666')
    .text(d => d.value > 0 ? d.value : '')
}

// 💬 顯示提示框
function showTooltip(event: MouseEvent, d: { day: number; value: number }) {
  const tooltip = d3.select('body').append('div')
    .attr('class', 'resource-tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.85)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .html(`<strong>第 ${d.day} 天</strong><br/>資源量：${d.value}`)
    .style('left', `${event.pageX + 10}px`)
    .style('top', `${event.pageY - 10}px`)
}

// 💬 隱藏提示框
function hideTooltip() {
  d3.selectAll('.resource-tooltip').remove()
}

// 👀 監聽數據變化
watch([() => props.cpmResult, selectedResourceType], () => {
  nextTick(() => {
    drawHistogram()
  })
}, { deep: true })

// 🚀 組件掛載後繪製
onMounted(() => {
  nextTick(() => {
    drawHistogram()
  })

  // 📱 響應式調整
  window.addEventListener('resize', drawHistogram)
})
</script>

<style scoped>
.resource-histogram {
  background: #ffffff;
  border-radius: 2px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
}

.histogram-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.histogram-header h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.resource-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.resource-select {
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.resource-select:hover {
  border-color: #999;
}

.resource-select:focus {
  border-color: #666;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
  font-size: 14px;
  background: #fafafa;
  border-radius: 2px;
  border: 1px solid #e8e8e8;
}

.histogram-container {
  position: relative;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  background: #ffffff;
}

.histogram-svg {
  width: 100%;
  height: auto;
  display: block;
}

/* 🎨 軸線樣式 */
:deep(.x-axis path),
:deep(.y-axis path) {
  stroke: #d0d0d0;
}

:deep(.x-axis line),
:deep(.y-axis line) {
  stroke: #e8e8e8;
}

:deep(.x-axis text),
:deep(.y-axis text) {
  fill: #666;
  font-size: 11px;
}
</style>

