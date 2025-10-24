<template>
  <div class="gantt-chart">
    <div class="gantt-header">
      <h2>甘特圖</h2>
      <div class="controls">
        <button class="btn btn-small" @click="zoomIn">放大</button>
        <button class="btn btn-small" @click="zoomOut">縮小</button>
        <button class="btn btn-small" @click="resetZoom">重置</button>
      </div>
    </div>
    
    <div v-if="!cpmResult || cpmResult.tasks.length === 0" class="empty-state">
      <p>尚無資料可顯示，請先新增工項並計算排程</p>
    </div>

    <div v-else class="gantt-container">
      <svg ref="svgRef" class="gantt-svg"></svg>
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
let zoomLevel = ref(1)

const MARGIN = { top: 60, right: 40, bottom: 40, left: 200 }
const ROW_HEIGHT = 50
const MIN_BAR_HEIGHT = 30

onMounted(() => {
  if (props.cpmResult && props.cpmResult.tasks.length > 0) {
    renderGantt()
  }
})

watch(() => props.cpmResult, () => {
  nextTick(() => {
    if (props.cpmResult && props.cpmResult.tasks.length > 0) {
      renderGantt()
    }
  })
}, { deep: true })

function zoomIn() {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 3)
  renderGantt()
}

function zoomOut() {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.5)
  renderGantt()
}

function resetZoom() {
  zoomLevel.value = 1
  renderGantt()
}

function renderGantt() {
  if (!svgRef.value || !props.cpmResult) return

  const tasks = props.cpmResult.tasks
  const totalDuration = props.cpmResult.totalDuration

  // 清空之前的内容
  d3.select(svgRef.value).selectAll('*').remove()

  // 设置 SVG 尺寸
  const containerWidth = svgRef.value.parentElement?.clientWidth || 800
  const width = Math.max(containerWidth - MARGIN.left - MARGIN.right, 600) * zoomLevel.value
  const height = tasks.length * ROW_HEIGHT + MARGIN.top + MARGIN.bottom

  const svg = d3.select(svgRef.value)
    .attr('width', containerWidth)
    .attr('height', height)

  const g = svg.append('g')
    .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

  // 创建比例尺
  const xScale = d3.scaleLinear()
    .domain([0, totalDuration])
    .range([0, width])

  const yScale = d3.scaleBand()
    .domain(tasks.map(t => t.id))
    .range([0, tasks.length * ROW_HEIGHT])
    .padding(0.2)

  // 绘制网格线
  const gridLines = g.append('g')
    .attr('class', 'grid')

  // 垂直网格线
  const ticks = Math.min(totalDuration + 1, 20)
  gridLines.selectAll('.grid-line-v')
    .data(d3.range(0, totalDuration + 1, Math.ceil(totalDuration / ticks)))
    .enter()
    .append('line')
    .attr('class', 'grid-line')
    .attr('x1', d => xScale(d))
    .attr('x2', d => xScale(d))
    .attr('y1', 0)
    .attr('y2', tasks.length * ROW_HEIGHT)
    .attr('stroke', '#e0e0e0')
    .attr('stroke-width', 1)

  // 水平网格线
  gridLines.selectAll('.grid-line-h')
    .data(tasks)
    .enter()
    .append('line')
    .attr('class', 'grid-line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', d => (yScale(d.id) || 0) + (yScale.bandwidth() / 2))
    .attr('y2', d => (yScale(d.id) || 0) + (yScale.bandwidth() / 2))
    .attr('stroke', '#f0f0f0')
    .attr('stroke-width', 1)

  // X 轴（时间轴）
  const xAxis = d3.axisTop(xScale)
    .ticks(Math.min(totalDuration + 1, 20))
    .tickFormat(d => `Day ${d}`)

  g.append('g')
    .attr('class', 'x-axis')
    .call(xAxis)
    .selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#555')

  // 绘制任务名称（Y轴）
  const taskLabels = g.append('g')
    .attr('class', 'task-labels')

  taskLabels.selectAll('.task-label')
    .data(tasks)
    .enter()
    .append('text')
    .attr('class', 'task-label')
    .attr('x', -10)
    .attr('y', d => (yScale(d.id) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .style('font-size', '13px')
    .style('font-weight', d => d.isCritical ? '600' : '400')
    .style('fill', d => d.isCritical ? '#e74c3c' : '#2c3e50')
    .text(d => d.name)

  // 绘制任务条
  const bars = g.append('g')
    .attr('class', 'bars')

  bars.selectAll('.task-bar')
    .data(tasks)
    .enter()
    .append('rect')
    .attr('class', d => `task-bar ${d.isCritical ? 'critical' : ''}`)
    .attr('x', d => xScale(d.es || 0))
    .attr('y', d => (yScale(d.id) || 0) + (yScale.bandwidth() - MIN_BAR_HEIGHT) / 2)
    .attr('width', d => xScale(d.duration))
    .attr('height', MIN_BAR_HEIGHT)
    .attr('rx', 4)
    .attr('fill', d => d.isCritical ? '#e74c3c' : '#3498db')
    .attr('stroke', d => d.isCritical ? '#c0392b' : '#2980b9')
    .attr('stroke-width', d => d.isCritical ? 3 : 2)
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d) {
      d3.select(this).attr('opacity', 0.8)
      showTooltip(event, d)
    })
    .on('mouseout', function() {
      d3.select(this).attr('opacity', 1)
      hideTooltip()
    })

  // 添加任务条上的文字
  bars.selectAll('.task-duration')
    .data(tasks)
    .enter()
    .append('text')
    .attr('class', 'task-duration')
    .attr('x', d => xScale(d.es || 0) + xScale(d.duration) / 2)
    .attr('y', d => (yScale(d.id) || 0) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', 'white')
    .style('pointer-events', 'none')
    .text(d => `${d.duration}天`)

  // 绘制依赖关系箭头
  const taskMap = new Map(tasks.map(t => [t.id, t]))
  
  const links = g.append('g')
    .attr('class', 'links')

  tasks.forEach(task => {
    task.successors.forEach(succDep => {
      const succ = taskMap.get(succDep.taskId)
      if (succ) {
        const x1 = xScale((task.ef || 0))
        const y1 = (yScale(task.id) || 0) + yScale.bandwidth() / 2
        const x2 = xScale((succ.es || 0))
        const y2 = (yScale(succ.id) || 0) + yScale.bandwidth() / 2

        // 绘制连接线
        const isCriticalLink = task.isCritical && succ.isCritical
        
        links.append('path')
          .attr('d', createLinkPath(x1, y1, x2, y2))
          .attr('fill', 'none')
          .attr('stroke', isCriticalLink ? '#e74c3c' : '#95a5a6')
          .attr('stroke-width', isCriticalLink ? 2 : 1.5)
          .attr('marker-end', `url(#arrow-${isCriticalLink ? 'critical' : 'normal'})`)
      }
    })
  })

  // 定义箭头标记
  const defs = svg.append('defs')

  defs.append('marker')
    .attr('id', 'arrow-normal')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 8)
    .attr('refY', 5)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 10 z')
    .attr('fill', '#95a5a6')

  defs.append('marker')
    .attr('id', 'arrow-critical')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 8)
    .attr('refY', 5)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 10 z')
    .attr('fill', '#e74c3c')

  // 添加图例
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${MARGIN.left}, ${height - 20})`)

  legend.append('rect')
    .attr('x', 0)
    .attr('y', -10)
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', '#e74c3c')
    .attr('stroke', '#c0392b')
    .attr('stroke-width', 2)

  legend.append('text')
    .attr('x', 20)
    .attr('y', 0)
    .style('font-size', '12px')
    .text('關鍵路徑')

  legend.append('rect')
    .attr('x', 100)
    .attr('y', -10)
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', '#3498db')
    .attr('stroke', '#2980b9')
    .attr('stroke-width', 2)

  legend.append('text')
    .attr('x', 120)
    .attr('y', 0)
    .style('font-size', '12px')
    .text('一般工項')
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
    ${task.isCritical ? '<div style="color: #c33; font-weight: 500;">關鍵工項</div>' : ''}
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
}

.gantt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.gantt-header h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.gantt-header h2 i {
  margin-right: 8px;
  color: #999;
}

.controls {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  background: white;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #333;
  color: white;
  border-color: #333;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.gantt-container {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 600px;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  background: #fafafa;
}

.gantt-svg {
  display: block;
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
}

:deep(.grid) line {
  stroke: #e8e8e8;
}

:deep(.task-label) {
  fill: #333;
}
</style>

<style>
.gantt-tooltip {
  line-height: 1.5;
}
</style>

