<template>
  <div class="gantt-chart">
    <div class="gantt-header">
      <h2></h2>
      <div class="controls">
        <button class="btn btn-small" @click="resetView">重置畫面</button>
        <select class="mode-select" v-model="criticalPathMode" @change="renderGantt">
          <option :value="false">作業順序</option>
          <option :value="true">要徑優先</option>
        </select>
      </div>
    </div>
    
    <div v-if="!cpmResult || cpmResult.tasks.length === 0" class="empty-state">
      <p>尚無資料可顯示，請先新增作業並計算排程</p>
    </div>

    <div v-else class="gantt-container">
      <svg ref="svgRef" class="gantt-svg">
        <defs>
          <!-- 定義箭頭標記（鮮豔紅色版） -->
          <marker
            id="arrow-normal"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#999" />
          </marker>
          <marker
            id="arrow-critical"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#d9534f" />
          </marker>
        </defs>
        <g ref="containerRef"></g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import type { CPMResult, CPMTask } from '../types'

const props = defineProps<{
  cpmResult: CPMResult | null
}>()

const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<SVGGElement | null>(null)
const criticalPathMode = ref(false)

const MARGIN = { top: 70, right: 40, bottom: 60, left: 180 }
const CELL_WIDTH = 28  // 每天的寬度（較窄）
const CELL_HEIGHT = 85 // 每列的高度（更高）
const MIN_BAR_HEIGHT = 60 // 作業條高度（更高）

let zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null
let currentZoom = d3.zoomIdentity

onMounted(() => {
  if (props.cpmResult && props.cpmResult.tasks.length > 0) {
    renderGantt()
  }
  setupZoom()
})

watch(() => props.cpmResult, () => {
  nextTick(() => {
    if (props.cpmResult && props.cpmResult.tasks.length > 0) {
      renderGantt()
    }
  })
}, { deep: true })

watch(criticalPathMode, () => {
  renderGantt()
})

function setupZoom() {
  if (!svgRef.value) return
  
  let isDragging = false
  
  zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.3, 5])
    .filter(function(event) {
      // 滑鼠滾輪用於縮放
      if (event.type === 'wheel') {
        event.preventDefault()
        return true
      }
      // 滑鼠左鍵開始拖曳
      if (event.type === 'mousedown' && event.button === 0) {
        isDragging = true
        return true
      }
      // 拖曳中的移動事件
      if (event.type === 'mousemove' && isDragging) {
        return true
      }
      // 拖曳中的放開事件
      if (event.type === 'mouseup') {
        isDragging = false
        return true
      }
      return false
    })
    .on('zoom', (event) => {
      currentZoom = event.transform
      d3.select(containerRef.value).attr('transform', event.transform)
    })
  
  d3.select(svgRef.value)
    .call(zoom)
    .on('mousedown', function(event) {
      if (event.button === 0) {
        d3.select(this).style('cursor', 'grabbing')
      }
    })
    .on('mouseup', function() {
      d3.select(this).style('cursor', 'grab')
    })
}

function resetView() {
  fitToView()
}

function fitToView() {
  if (!svgRef.value || !containerRef.value || !zoom) return
  
  const svg = d3.select(svgRef.value)
  const container = d3.select(containerRef.value)
  
  const bounds = container.node()?.getBBox()
  if (!bounds) return
  
  const parentWidth = svgRef.value.clientWidth
  const parentHeight = svgRef.value.clientHeight
  
  const fullWidth = bounds.width
  const fullHeight = bounds.height
  
  // 計算縮放比例，讓使用者一目了然
  const scaleX = parentWidth / fullWidth
  const scaleY = parentHeight / fullHeight
  const scale = Math.min(scaleX, scaleY) * 0.95 // 留5%邊距，讓畫面更大更清晰
  
  // 置中對齊
  const translateX = (parentWidth - fullWidth * scale) / 2 - bounds.x * scale
  const translateY = (parentHeight - fullHeight * scale) / 2 - bounds.y * scale
  
  svg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale))
}

function renderGantt() {
  if (!svgRef.value || !containerRef.value || !props.cpmResult) return

  let tasks = [...props.cpmResult.tasks]
  const totalDuration = props.cpmResult.totalDuration

  // 根據顯示模式排序作業
  if (criticalPathMode.value) {
    // 要徑優先模式：要徑作業在上方，非要徑作業在下方
    tasks = tasks.sort((a, b) => {
      if (a.isCritical && !b.isCritical) return -1
      if (!a.isCritical && b.isCritical) return 1
      return 0
    })
  }
  // 標準模式：保持原始順序（已經是輸入順序）

  // 清空之前的内容
  d3.select(containerRef.value).selectAll('*').remove()

  // 設置 SVG 尺寸 - 窄高型格線（寬度較窄、高度較高）
  const containerWidth = svgRef.value.parentElement?.clientWidth || 800
  const containerHeight = svgRef.value.parentElement?.clientHeight || 600
  const width = MARGIN.left + totalDuration * CELL_WIDTH + MARGIN.right
  const height = tasks.length * CELL_HEIGHT + MARGIN.top + MARGIN.bottom

  const svg = d3.select(svgRef.value)
    .attr('width', containerWidth)
    .attr('height', containerHeight)

  const g = d3.select(containerRef.value)

  // 創建比例尺 - 每天一格（窄高型長方形）
  const xScale = d3.scaleLinear()
    .domain([0, totalDuration])
    .range([MARGIN.left, MARGIN.left + totalDuration * CELL_WIDTH])

  const yScale = d3.scaleBand()
    .domain(tasks.map(t => t.id))
    .range([MARGIN.top, MARGIN.top + tasks.length * CELL_HEIGHT])
    .padding(0.18)

  // 繪製窄高型格線背景
  const gridGroup = g.append('g')
    .attr('class', 'grid-background')

  // 繪製每一天的格子背景（交替顏色 - 無印風格）
  for (let day = 0; day <= totalDuration; day++) {
    gridGroup.append('rect')
      .attr('x', xScale(day))
      .attr('y', MARGIN.top)
      .attr('width', CELL_WIDTH)
      .attr('height', tasks.length * CELL_HEIGHT)
      .attr('fill', day % 2 === 0 ? '#ffffff' : '#f9f9f9')
      .attr('stroke', '#e8e8e8')
      .attr('stroke-width', 0.5)
  }

  // 繪製格線（無印風格 - 淡雅的線條）
  const gridLines = g.append('g')
    .attr('class', 'grid')

  // 垂直格線 - 每一天都有
  for (let day = 0; day <= totalDuration; day++) {
    gridLines.append('line')
      .attr('class', 'grid-line-v')
      .attr('x1', xScale(day))
      .attr('x2', xScale(day))
      .attr('y1', MARGIN.top)
      .attr('y2', MARGIN.top + tasks.length * CELL_HEIGHT)
      .attr('stroke', day % 5 === 0 ? '#999' : '#e8e8e8')
      .attr('stroke-width', day % 5 === 0 ? 1 : 0.5)
  }

  // 水平格線 - 每個作業之間
  tasks.forEach((task, index) => {
    gridLines.append('line')
      .attr('class', 'grid-line-h')
      .attr('x1', MARGIN.left)
      .attr('x2', MARGIN.left + totalDuration * CELL_WIDTH)
      .attr('y1', MARGIN.top + index * CELL_HEIGHT)
      .attr('y2', MARGIN.top + index * CELL_HEIGHT)
      .attr('stroke', '#e8e8e8')
      .attr('stroke-width', 0.5)
  })

  // 最後一條水平線
  gridLines.append('line')
    .attr('class', 'grid-line-h')
    .attr('x1', MARGIN.left)
    .attr('x2', MARGIN.left + totalDuration * CELL_WIDTH)
    .attr('y1', MARGIN.top + tasks.length * CELL_HEIGHT)
    .attr('y2', MARGIN.top + tasks.length * CELL_HEIGHT)
    .attr('stroke', '#999')
    .attr('stroke-width', 1)

  // X 軸（時間軸）- 簡潔數字標示
  const xAxisGroup = g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${MARGIN.top})`)

  // 繪製每一天的標籤（簡潔數字，對應正下方格線）
  for (let day = 0; day <= totalDuration; day++) {
    // 日期標籤 - 置中於格子
    xAxisGroup.append('text')
      .attr('x', xScale(day) + CELL_WIDTH / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', day % 5 === 0 ? '600' : '400')
      .style('fill', '#555')
      .text(day)
    
    // 刻度線
    xAxisGroup.append('line')
      .attr('x1', xScale(day))
      .attr('x2', xScale(day))
      .attr('y1', -5)
      .attr('y2', 0)
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
  }

  // 繪製作業名稱（Y軸 - 鮮豔紅色版）
  const taskLabels = g.append('g')
    .attr('class', 'task-labels')

  taskLabels.selectAll('.task-label')
    .data(tasks)
    .enter()
    .append('text')
    .attr('class', 'task-label')
    .attr('x', MARGIN.left - 10)
    .attr('y', d => (yScale(d.id) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .style('font-size', '13px')
    .style('font-weight', d => d.isCritical ? '500' : '400')
    .style('fill', d => d.isCritical ? '#d9534f' : '#666')
    .text(d => d.name)

  // 繪製依賴關係箭頭（先繪製，在作業條下層）
  const taskMap = new Map(tasks.map(t => [t.id, t]))
  
  const links = g.append('g')
    .attr('class', 'links')

  tasks.forEach(task => {
    task.successors.forEach(succDep => {
      const succ = taskMap.get(succDep.taskId)
      if (succ) {
        // 連線從作業條右邊到下一個作業條左邊
        const x1 = xScale((task.ef || 0))
        const y1 = (yScale(task.id) || 0) + yScale.bandwidth() / 2
        const x2 = xScale((succ.es || 0))
        const y2 = (yScale(succ.id) || 0) + yScale.bandwidth() / 2

        // 繪製連接線（鮮豔紅色版）
        const isCriticalLink = task.isCritical && succ.isCritical
        
        const linkPath = links.append('path')
          .attr('d', createLinkPath(x1, y1, x2, y2))
          .attr('fill', 'none')
          .attr('stroke', isCriticalLink ? '#d9534f' : '#999')
          .attr('stroke-width', isCriticalLink ? 2 : 1.5)
          .attr('marker-end', `url(#arrow-${isCriticalLink ? 'critical' : 'normal'})`)
          .style('opacity', 0.7)

        // 如果有 lag，添加標籤
        if (succDep.lag && succDep.lag !== 0) {
          const midX = (x1 + x2) / 2
          const midY = (y1 + y2) / 2
          
          // 添加白色背景框
          const labelText = `Lag=${succDep.lag}`
          const labelWidth = labelText.length * 7
          
          links.append('rect')
            .attr('x', midX - labelWidth / 2 - 4)
            .attr('y', midY - 16)
            .attr('width', labelWidth + 8)
            .attr('height', 16)
            .attr('fill', 'white')
            .attr('stroke', isCriticalLink ? '#d9534f' : '#999')
            .attr('stroke-width', 0.5)
            .attr('rx', 2)
          
          links.append('text')
            .attr('x', midX)
            .attr('y', midY - 6)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('font-weight', '500')
            .style('fill', isCriticalLink ? '#d9534f' : '#666')
            .text(labelText)
        }
      }
    })
  })

  // 繪製作業條 - 精確對齊窄高型格線（無印風格 - 明亮版）
  const bars = g.append('g')
    .attr('class', 'bars')

  bars.selectAll('.task-bar')
    .data(tasks)
    .enter()
    .append('rect')
    .attr('class', d => `task-bar ${d.isCritical ? 'critical' : ''}`)
    .attr('x', d => xScale(d.es || 0) + 1) // 左邊留1px間隙
    .attr('y', d => (yScale(d.id) || 0) + (yScale.bandwidth() - MIN_BAR_HEIGHT) / 2)
    .attr('width', d => d.duration * CELL_WIDTH - 2) // 寬度 = 天數 × 格子寬度，右邊也留1px間隙
    .attr('height', MIN_BAR_HEIGHT)
    .attr('rx', 2)
    .attr('fill', d => d.isCritical ? '#d9534f' : '#5bc0de')
    .attr('stroke', 'none')
    .attr('stroke-width', 0)
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d) {
      d3.select(this).attr('opacity', 0.85)
      showTooltip(event, d)
    })
    .on('mouseout', function() {
      d3.select(this).attr('opacity', 1)
      hideTooltip()
    })

  // 添加作業條上的文字
  bars.selectAll('.task-duration')
    .data(tasks)
    .enter()
    .append('text')
    .attr('class', 'task-duration')
    .attr('x', d => xScale(d.es || 0) + (d.duration * CELL_WIDTH) / 2)
    .attr('y', d => (yScale(d.id) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', 'white')
    .style('pointer-events', 'none')
    .text(d => `${d.duration}天`)

  // 添加圖例
  const legend = g.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top + tasks.length * CELL_HEIGHT + 30})`)

  // 要徑圖例（鮮豔色版 - 無邊框）
  legend.append('rect')
    .attr('x', 0)
    .attr('y', -10)
    .attr('width', 15)
    .attr('height', 15)
    .attr('rx', 2)
    .attr('fill', '#d9534f')
    .attr('stroke', 'none')

  legend.append('text')
    .attr('x', 22)
    .attr('y', 0)
    .style('font-size', '13px')
    .style('fill', '#666')
    .style('font-weight', '400')
    .text('要徑作業')

  // 一般作業圖例
  legend.append('rect')
    .attr('x', 100)
    .attr('y', -10)
    .attr('width', 15)
    .attr('height', 15)
    .attr('rx', 2)
    .attr('fill', '#5bc0de')
    .attr('stroke', 'none')

  legend.append('text')
    .attr('x', 122)
    .attr('y', 0)
    .style('font-size', '13px')
    .style('fill', '#666')
    .style('font-weight', '400')
    .text('非要徑作業')

  // 自動調整視圖以顯示所有內容
  setTimeout(() => fitToView(), 100)
}

function createLinkPath(x1: number, y1: number, x2: number, y2: number): string {
  const midX = (x1 + x2) / 2
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
}

function showTooltip(event: MouseEvent, task: CPMTask) {
  const tooltip = d3.select('body').append('div')
    .attr('class', 'gantt-tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '10px')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('z-index', '1000')

  tooltip.html(`
    <div><strong>${task.name}</strong></div>
    <div>工期: ${task.duration} 天</div>
    <div>ES: ${task.es} | EF: ${task.ef}</div>
    <div>LS: ${task.ls} | LF: ${task.lf}</div>
    <div>總浮時: ${task.tf} 天</div>
    ${task.isCritical ? '<div style="color: #c33; font-weight: 500;">要徑作業</div>' : ''}
  `)
    .style('left', `${event.pageX + 10}px`)
    .style('top', `${event.pageY + 10}px`)
}

function hideTooltip() {
  d3.selectAll('.gantt-tooltip').remove()
}
</script>

<style scoped>
.gantt-chart {
  background: #ffffff;
  border-radius: 2px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.gantt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.gantt-header h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  background: white;
  border-radius: 2px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  height: 32px;
  line-height: 1.4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:hover {
  background: #f5f5f5;
  border-color: #999;
  color: #333;
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
  height: 32px;
}

.mode-select {
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  background: white;
  border-radius: 2px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  outline: none;
  height: 32px;
  line-height: 1.4;
}

.mode-select:hover {
  border-color: #999;
  background: #f5f5f5;
}

.mode-select:focus {
  border-color: #999;
}

.gantt-container {
  flex: 1;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  background: #fafafa;
  position: relative;
  cursor: grab;
}

.gantt-container:active {
  cursor: grabbing;
}

/* 格線背景 */
:deep(.grid-background) rect {
  shape-rendering: crispEdges;
}

.gantt-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #999;
  font-style: italic;
  font-size: 13px;
}

:deep(.x-axis) line {
  stroke: #d0d0d0;
}

:deep(.x-axis) path {
  stroke: #d0d0d0;
}

:deep(.x-axis) text {
  fill: #666;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

:deep(.grid) line {
  shape-rendering: crispEdges;
}

:deep(.task-label) {
  fill: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

:deep(.task-bar) {
  transition: opacity 0.2s;
  shape-rendering: geometricPrecision;
}

:deep(.links) path {
  transition: opacity 0.2s;
}

/* 優化格線顯示 */
:deep(.grid-line-v),
:deep(.grid-line-h) {
  shape-rendering: crispEdges;
}
</style>

<style>
.gantt-tooltip {
  line-height: 1.5;
}
</style>

