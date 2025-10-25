<template>
  <div class="pdm-diagram">
    <div class="pdm-header">
      <h2></h2>
      <div class="controls">
        <button class="btn btn-small" @click="resetView">重置視圖</button>
        <button class="btn btn-small" @click="fitToView">自動縮放</button>
        <label class="toggle-label">
          <input type="radio" v-model="displayMode" value="simple" @change="renderDiagram">
          <span>簡潔模式</span>
        </label>
        <label class="toggle-label">
          <input type="radio" v-model="displayMode" value="detailed" @change="renderDiagram">
          <span>詳細模式</span>
        </label>
      </div>
    </div>
    
    <div v-if="!cpmResult || cpmResult.tasks.length === 0" class="empty-state">
      <p>尚無資料可顯示，請先新增作業並計算排程</p>
    </div>

    <div v-else class="pdm-container">
      <svg ref="svgRef" class="pdm-svg">
        <defs>
          <!-- 定義箭頭標記 -->
          <marker
            id="arrow-normal-pdm"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#333" />
          </marker>
          <marker
            id="arrow-critical-pdm"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#b85a52" />
          </marker>
          <marker
            id="arrow-simple-pdm"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#333" />
          </marker>
        </defs>
        <g ref="containerRef"></g>
      </svg>
      
      <!-- 圖例 -->
      <div class="legend">
        <div class="legend-item">
          <div class="legend-box critical"></div>
          <span>要徑作業</span>
        </div>
        <div class="legend-item">
          <div class="legend-box normal"></div>
          <span>一般作業</span>
        </div>
        <div class="legend-item">
          <div class="legend-line critical"></div>
          <span>要徑</span>
        </div>
        <div class="legend-item">
          <div class="legend-line normal"></div>
          <span>一般依賴</span>
        </div>
      </div>
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
const displayMode = ref<'simple' | 'detailed'>('simple')  // 預設為簡潔模式

// 節點尺寸常數（根據顯示模式動態調整）
const getNodeDimensions = () => {
  if (displayMode.value === 'simple') {
    return {
      width: 80,   // 簡潔模式：更小的節點
      height: 50,
      padding: 8
    }
  } else {
    return {
      width: 160,  // 詳細模式：標準九宮格
      height: 100,
      padding: 8
    }
  }
}

// 使用常量以便在非響應式環境中使用
const NODE_WIDTH = 160
const NODE_HEIGHT = 100
const NODE_PADDING = 8

// 九宮格佈局
const CELL_WIDTH = NODE_WIDTH / 3
const CELL_HEIGHT = NODE_HEIGHT / 3

// 佈局參數（橫向佈局：優化間距以減少線條交叉）
const LEVEL_HEIGHT = 160  // 縱向間距（同一層級的節點間距，增加以減少線條交叉）
const NODE_SPACING = 300  // 橫向間距（不同時間層級的間距，增加以提供更多繞行空間）

// 起始/結束節點
const START_END_SIZE = 50

let zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null

onMounted(() => {
  if (props.cpmResult && props.cpmResult.tasks.length > 0) {
    renderDiagram()
  }
})

watch(() => props.cpmResult, () => {
  nextTick(() => {
    if (props.cpmResult && props.cpmResult.tasks.length > 0) {
      renderDiagram()
    }
  })
}, { deep: true })

interface NodePosition {
  x: number
  y: number
  task: CPMTask
}

function calculateLayout(tasks: CPMTask[]): NodePosition[] {
  const positions: NodePosition[] = []
  const taskMap = new Map<string, CPMTask>()
  tasks.forEach(t => taskMap.set(t.id, t))
  
  // 計算每個節點的層級（使用最早開始時間）橫向排列
  const levels = new Map<number, CPMTask[]>()
  
  tasks.forEach(task => {
    const level = task.es || 0
    if (!levels.has(level)) {
      levels.set(level, [])
    }
    levels.get(level)!.push(task)
  })
  
  // 根據層級橫向排列節點（從左到右）
  const sortedLevels = Array.from(levels.keys()).sort((a, b) => a - b)
  
  sortedLevels.forEach((level, levelIndex) => {
    const tasksInLevel = levels.get(level)!
    const levelHeight = tasksInLevel.length * LEVEL_HEIGHT
    const startY = -levelHeight / 2 + LEVEL_HEIGHT / 2
    
    tasksInLevel.forEach((task, index) => {
      positions.push({
        x: levelIndex * NODE_SPACING,  // 橫向：X 根據層級
        y: startY + index * LEVEL_HEIGHT,  // 縱向：Y 根據同層級中的位置
        task
      })
    })
  })
  
  return positions
}

function renderDiagram() {
  if (!svgRef.value || !containerRef.value || !props.cpmResult) return
  
  const tasks = props.cpmResult.tasks
  
  // 清空之前的內容
  d3.select(containerRef.value).selectAll('*').remove()
  
  // 清空路徑追蹤集合
  drawnPaths.clear()
  
  // 設置 SVG 尺寸
  const svgElement = d3.select(svgRef.value)
  const width = svgRef.value.parentElement?.clientWidth || 1000
  const height = svgRef.value.parentElement?.clientHeight || 600
  
  svgElement
    .attr('width', width)
    .attr('height', height)
  
  // 設置 zoom 行為
  zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      d3.select(containerRef.value).attr('transform', event.transform)
    })
  
  svgElement.call(zoom)
  
  const container = d3.select(containerRef.value)
  
  // 計算節點位置
  const positions = calculateLayout(tasks)
  const positionMap = new Map<string, NodePosition>()
  positions.forEach(p => positionMap.set(p.task.id, p))
  
  // 繪製連線（使用智能路徑避障）
  const links = container.append('g').attr('class', 'links')
  const nodeDimForLinks = getNodeDimensions()
  
  tasks.forEach(task => {
    const sourcePos = positionMap.get(task.id)
    if (!sourcePos) return
    
    task.successors.forEach(dep => {
      const targetPos = positionMap.get(dep.taskId)
      if (!targetPos) return
      
      const sourceTask = sourcePos.task
      const targetTask = targetPos.task
      const isCritical = sourceTask.isCritical && targetTask.isCritical
      
      // 計算連線的起點和終點（橫向佈局）使用動態節點尺寸
      // 從右側中間出發，到左側中間
      const x1 = sourcePos.x + nodeDimForLinks.width
      const y1 = sourcePos.y + nodeDimForLinks.height / 2
      const x2 = targetPos.x
      const y2 = targetPos.y + nodeDimForLinks.height / 2
      
      // 使用智能路徑，避開障礙物（深色明顯線條）
      const strokeColor = displayMode.value === 'simple' ? '#333' : (isCritical ? '#b85a52' : '#333')
      const path = links.append('path')
        .attr('class', `link ${isCritical ? 'critical' : 'normal'}`)
        .attr('d', createSmartPath(x1, y1, x2, y2, task.id, dep.taskId, positions))
        .attr('fill', 'none')
        .attr('stroke', strokeColor)
        .attr('stroke-width', displayMode.value === 'simple' ? 3 : (isCritical ? 3 : 2.5))
        .attr('marker-end', `url(#arrow-${displayMode.value === 'simple' ? 'simple' : (isCritical ? 'critical' : 'normal')}-pdm)`)
      
      // 添加依賴類型和lag標籤
      if (dep.type !== 'FS' || (dep.lag && dep.lag !== 0)) {
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2
        
        // 簡潔模式下，只顯示 Lag 值（如果有）
        let labelText = ''
        if (displayMode.value === 'simple') {
          if (dep.lag && dep.lag !== 0) {
            labelText = `Lag=${dep.lag}`
          }
        } else {
          labelText = dep.type
          if (dep.lag && dep.lag !== 0) {
            labelText += ` (${dep.lag > 0 ? '+' : ''}${dep.lag})`
          }
        }
        
        if (labelText) {
          // 添加背景矩形使標籤更清晰
          const fontSize = displayMode.value === 'simple' ? 13 : 10
          const bbox = { 
            width: labelText.length * (fontSize * 0.65), 
            height: displayMode.value === 'simple' ? 20 : 16 
          }
          
          links.append('rect')
            .attr('x', midX - bbox.width / 2 - 3)
            .attr('y', midY - bbox.height / 2 - 2)
            .attr('width', bbox.width + 6)
            .attr('height', bbox.height)
            .attr('fill', 'white')
            .attr('stroke', displayMode.value === 'simple' ? '#333' : (isCritical ? '#b85a52' : '#666'))
            .attr('stroke-width', displayMode.value === 'simple' ? 2 : 1)
            .attr('rx', 3)
          
          links.append('text')
            .attr('x', midX)
            .attr('y', midY + 1)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('class', 'dep-label')
            .style('font-size', `${fontSize}px`)
            .style('font-weight', displayMode.value === 'simple' ? '700' : '600')
            .style('fill', displayMode.value === 'simple' ? '#333' : (isCritical ? '#b85a52' : '#666'))
            .text(labelText)
        }
      }
    })
  })
  
  // 繪製節點
  const nodes = container.append('g').attr('class', 'nodes')
  const nodeDim = getNodeDimensions()
  
  positions.forEach(pos => {
    const task = pos.task
    const nodeGroup = nodes.append('g')
      .attr('class', `node ${task.isCritical ? 'critical' : 'normal'}`)
      .attr('transform', `translate(${pos.x}, ${pos.y})`)
      .style('cursor', 'pointer')
    
    // 節點外框
    nodeGroup.append('rect')
      .attr('width', nodeDim.width)
      .attr('height', nodeDim.height)
      .attr('rx', 4)
      .attr('fill', task.isCritical ? '#d4edda' : '#fff9c4')  // 綠色系
      .attr('stroke', task.isCritical ? '#28a745' : '#333')  // 綠色邊框
      .attr('stroke-width', task.isCritical ? 3 : 2)
    
    if (displayMode.value === 'detailed') {
      // 繪製九宮格分隔線
      // 垂直線
      nodeGroup.append('line')
        .attr('x1', CELL_WIDTH)
        .attr('y1', 0)
        .attr('x2', CELL_WIDTH)
        .attr('y2', NODE_HEIGHT)
        .attr('stroke', '#999')
        .attr('stroke-width', 0.5)
      
      nodeGroup.append('line')
        .attr('x1', CELL_WIDTH * 2)
        .attr('y1', 0)
        .attr('x2', CELL_WIDTH * 2)
        .attr('y2', NODE_HEIGHT)
        .attr('stroke', '#999')
        .attr('stroke-width', 0.5)
      
      // 水平線
      nodeGroup.append('line')
        .attr('x1', 0)
        .attr('y1', CELL_HEIGHT)
        .attr('x2', NODE_WIDTH)
        .attr('y2', CELL_HEIGHT)
        .attr('stroke', '#999')
        .attr('stroke-width', 0.5)
      
      nodeGroup.append('line')
        .attr('x1', 0)
        .attr('y1', CELL_HEIGHT * 2)
        .attr('x2', NODE_WIDTH)
        .attr('y2', CELL_HEIGHT * 2)
        .attr('stroke', '#999')
        .attr('stroke-width', 0.5)
      
      // 第一行：ES | 作業名稱 | EF
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH / 2)
        .attr('y', CELL_HEIGHT / 2 + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#333')
        .text(`${task.es || 0}`)
      
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH * 1.5)
        .attr('y', CELL_HEIGHT / 2 + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#666')
        .text(task.name.length > 8 ? task.name.substring(0, 7) + '...' : task.name)
      
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH * 2.5)
        .attr('y', CELL_HEIGHT / 2 + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#333')
        .text(`${task.ef || 0}`)
      
      // 第二行：空 | 工期 | 空
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH * 1.5)
        .attr('y', CELL_HEIGHT * 1.5 + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', '700')
        .style('fill', task.isCritical ? '#c0392b' : '#2c3e50')
        .text(`${task.duration}`)
      
      // 第三行：LS | TF | LF
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH / 2)
        .attr('y', CELL_HEIGHT * 2.5 + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#333')
        .text(`${task.ls || 0}`)
      
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH * 1.5)
        .attr('y', CELL_HEIGHT * 2.5 + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', '700')
        .style('fill', task.isCritical ? '#c0392b' : '#2c3e50')
        .text(`${task.tf || 0}`)
      
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH * 2.5)
        .attr('y', CELL_HEIGHT * 2.5 + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#333')
        .text(`${task.lf || 0}`)
      
      // 添加小標籤說明
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH / 2)
        .attr('y', CELL_HEIGHT - 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '8px')
        .style('fill', '#999')
        .text('ES')
      
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH * 2.5)
        .attr('y', CELL_HEIGHT - 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '8px')
        .style('fill', '#999')
        .text('EF')
      
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH / 2)
        .attr('y', NODE_HEIGHT - 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '8px')
        .style('fill', '#999')
        .text('LS')
      
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH * 2.5)
        .attr('y', NODE_HEIGHT - 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '8px')
        .style('fill', '#999')
        .text('LF')
      
      nodeGroup.append('text')
        .attr('x', CELL_WIDTH * 1.5)
        .attr('y', NODE_HEIGHT - 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '8px')
        .style('fill', '#999')
        .text('TF')
    } else {
      // 簡潔模式：只顯示作業名稱（類似範例圖）
      nodeGroup.append('text')
        .attr('x', nodeDim.width / 2)
        .attr('y', nodeDim.height / 2 + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', '700')
        .style('fill', '#000')
        .text(task.name)
    }
    
    // 添加懸停效果
    nodeGroup
      .on('mouseover', function() {
        d3.select(this).select('rect')
          .attr('stroke-width', task.isCritical ? 4 : 3)
      })
      .on('mouseout', function() {
        d3.select(this).select('rect')
          .attr('stroke-width', task.isCritical ? 3 : 1.5)
      })
      .on('click', function(event) {
        showTaskDetails(event, task)
      })
  })
  
  // 自動調整視圖以顯示所有節點
  fitToView()
}

/**
 * 計算避開障礙物的路徑
 * 優先使用直線和簡單路徑，減少彎曲
 */
function createSmartPath(
  x1: number, y1: number, 
  x2: number, y2: number, 
  sourceId: string, 
  targetId: string,
  allPositions: NodePosition[]
): string {
  const dx = x2 - x1
  const dy = y2 - y1
  
  // 策略1: 如果是同一水平線且沒有障礙，直接使用直線（零彎曲）
  if (Math.abs(dy) < 5) {
    const hasObstacle = checkPathObstacle(x1, y1, x2, y2, sourceId, targetId, allPositions)
    if (!hasObstacle) {
      return `M ${x1} ${y1} L ${x2} ${y2}`
    }
  }
  
  // 策略2: 如果垂直距離很小，嘗試簡單的四段式路徑（三個彎，但更直接）
  if (Math.abs(dy) < 80) {
    const offset = Math.abs(calculateLineOffset(x1, y1, x2, y2, dy))
    const midX = x1 + 40  // 離開起點更遠一點，增加繞行空間
    
    // 檢查上下路徑，增加繞行間隙
    const testAbove = y1 - offset - 25
    const testBelow = y1 + offset + 25
    
    const canGoAbove = !checkPathObstacle(x1, testAbove, x2, testAbove, sourceId, targetId, allPositions)
    const canGoBelow = !checkPathObstacle(x1, testBelow, x2, testBelow, sourceId, targetId, allPositions)
    
    // 根據目標位置和空間選擇路徑（優先選擇與目標同方向）
    if (dy > 0 && canGoBelow) {
      // 目標在下方，從下方走（四段式，減少彎曲角度）
      const routeY = y1 + offset + 25
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${routeY} L ${x2} ${routeY} L ${x2} ${y2}`
    } else if (dy < 0 && canGoAbove) {
      // 目標在上方，從上方走
      const routeY = y1 - offset - 25
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${routeY} L ${x2} ${routeY} L ${x2} ${y2}`
    } else if (canGoBelow) {
      const routeY = y1 + offset + 25
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${routeY} L ${x2} ${routeY} L ${x2} ${y2}`
    } else if (canGoAbove) {
      const routeY = y1 - offset - 25
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${routeY} L ${x2} ${routeY} L ${x2} ${y2}`
    }
  }
  
  // 策略3: 對於較大垂直距離，使用標準三段式（兩個彎）
  const midX = (x1 + x2) / 2
  
  // 檢查中間垂直線是否有障礙
  const hasVerticalObstacle = checkPathObstacle(midX, y1, midX, y2, sourceId, targetId, allPositions)
  
  if (!hasVerticalObstacle) {
    // 中間沒有障礙，使用標準三段式（最少彎曲）
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
  }
  
  // 策略4: 中間有障礙，需要繞行（增加更大的偏移確保不穿過節點）
  const offset = calculateLineOffset(x1, y1, x2, y2, dy)
  const gap = 40  // 增加間隙，從 25 增加到 40
  
  if (dy > 0) {
    // 目標在下方，從上方繞行
    const routeY = Math.min(y1, y2) - offset - 50  // 增加繞行距離
    const canGoAbove = !checkPathObstacle(x1, routeY, x2, routeY, sourceId, targetId, allPositions)
    
    if (canGoAbove) {
      // 從上方繞
      return `M ${x1} ${y1} L ${x1 + gap} ${y1} L ${x1 + gap} ${routeY} L ${x2 - gap} ${routeY} L ${x2 - gap} ${y2} L ${x2} ${y2}`
    }
  } else {
    // 目標在上方，從下方繞行
    const routeY = Math.max(y1, y2) + offset + 50  // 增加繞行距離
    const canGoBelow = !checkPathObstacle(x1, routeY, x2, routeY, sourceId, targetId, allPositions)
    
    if (canGoBelow) {
      // 從下方繞
      return `M ${x1} ${y1} L ${x1 + gap} ${y1} L ${x1 + gap} ${routeY} L ${x2 - gap} ${routeY} L ${x2 - gap} ${y2} L ${x2} ${y2}`
    }
  }
  
  // 最後備案：使用簡單的三段式
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
}

/**
 * 檢查路徑上是否有障礙物（其他節點）
 * 檢查從(x1,y1)到(x2,y2)的線段是否穿過任何節點
 * 增加額外間隙確保線條不會太靠近節點
 */
function checkPathObstacle(
  x1: number, y1: number, 
  x2: number, y2: number, 
  sourceId: string, 
  targetId: string,
  allPositions: NodePosition[]
): boolean {
  const padding = 15  // 增加間隙，從 5 增加到 15
  const minX = Math.min(x1, x2)
  const maxX = Math.max(x1, x2)
  const minY = Math.min(y1, y2)
  const maxY = Math.max(y1, y2)
  
  const nodeDim = getNodeDimensions()
  
  for (const pos of allPositions) {
    // 跳過起點和終點節點
    if (pos.task.id === sourceId || pos.task.id === targetId) continue
    
    // 節點的邊界框（使用動態尺寸 + 額外間隙）
    const nodeLeft = pos.x - padding
    const nodeRight = pos.x + nodeDim.width + padding
    const nodeTop = pos.y - padding
    const nodeBottom = pos.y + nodeDim.height + padding
    
    // 檢查水平線段是否與節點相交
    if (Math.abs(y2 - y1) < 5) {
      // 水平線
      if (y1 >= nodeTop && y1 <= nodeBottom &&
          maxX >= nodeLeft && minX <= nodeRight) {
        return true
      }
    }
    // 檢查垂直線段是否與節點相交
    else if (Math.abs(x2 - x1) < 5) {
      // 垂直線
      if (x1 >= nodeLeft && x1 <= nodeRight &&
          maxY >= nodeTop && minY <= nodeBottom) {
        return true
      }
    }
    // 檢查斜線是否與節點相交（簡化檢查：檢查線段包圍框是否與節點重疊）
    else {
      if (maxX >= nodeLeft && minX <= nodeRight &&
          maxY >= nodeTop && minY <= nodeBottom) {
        // 可能相交，返回true以觸發繞行
        return true
      }
    }
  }
  
  return false
}

// 用於追蹤已繪製的連線，避免重疊
const drawnPaths = new Map<string, number>()

/**
 * 計算線的偏移量，避免重疊
 * 使用更精確的路徑追蹤和最小偏移策略
 */
function calculateLineOffset(x1: number, y1: number, x2: number, y2: number, dy: number): number {
  const baseOffset = 20  // 基礎偏移（減少以降低彎曲）
  const minSpacing = 12  // 線條間的最小間距
  
  // 創建路徑的簽名（精確匹配相同路徑）
  const roundTo = 30
  const x1Round = Math.round(x1 / roundTo)
  const y1Round = Math.round(y1 / roundTo)
  const x2Round = Math.round(x2 / roundTo)
  const y2Round = Math.round(y2 / roundTo)
  
  // 創建雙向路徑鍵（考慮兩個方向）
  const pathKey1 = `${x1Round},${y1Round}-${x2Round},${y2Round}`
  const pathKey2 = `${x2Round},${y2Round}-${x1Round},${y1Round}`
  
  // 檢查是否已有相同或相似的路徑
  let samePathCount = 0
  
  if (drawnPaths.has(pathKey1)) {
    samePathCount = drawnPaths.get(pathKey1)! + 1
    drawnPaths.set(pathKey1, samePathCount)
  } else if (drawnPaths.has(pathKey2)) {
    samePathCount = drawnPaths.get(pathKey2)! + 1
    drawnPaths.set(pathKey2, samePathCount)
  } else {
    drawnPaths.set(pathKey1, 0)
  }
  
  // 根據相同路徑數量計算偏移（交替上下）
  if (samePathCount === 0) {
    return baseOffset
  }
  
  // 交替上下偏移，使線條分散
  const direction = samePathCount % 2 === 0 ? 1 : -1
  const multiplier = Math.ceil(samePathCount / 2)
  
  return baseOffset + (minSpacing * multiplier * direction)
}

function resetView() {
  if (svgRef.value && zoom) {
    d3.select(svgRef.value)
      .transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity)
  }
}

function fitToView() {
  if (!svgRef.value || !containerRef.value || !props.cpmResult) return
  
  const svg = svgRef.value
  const container = containerRef.value
  const bbox = container.getBBox()
  
  if (bbox.width === 0 || bbox.height === 0) return
  
  const width = svg.clientWidth
  const height = svg.clientHeight
  
  const scale = Math.min(
    width / (bbox.width + 100),
    height / (bbox.height + 100),
    1
  )
  
  const translateX = (width - bbox.width * scale) / 2 - bbox.x * scale
  const translateY = (height - bbox.height * scale) / 2 - bbox.y * scale + 50
  
  if (zoom) {
    d3.select(svgRef.value)
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(translateX, translateY)
          .scale(scale)
      )
  }
}

function showTaskDetails(event: MouseEvent, task: CPMTask) {
  // 移除舊的tooltip
  d3.selectAll('.pdm-tooltip').remove()
  
  const tooltip = d3.select('body').append('div')
    .attr('class', 'pdm-tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.85)')
    .style('color', 'white')
    .style('padding', '12px 16px')
    .style('border-radius', '6px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)')
  
  let html = `<div><strong style="font-size: 14px;">${task.name}</strong></div>`
  html += `<div style="margin-top: 8px;">工期: <strong>${task.duration}</strong> 天</div>`
  html += `<div style="margin-top: 4px;">ES: <strong>${task.es}</strong> | EF: <strong>${task.ef}</strong></div>`
  html += `<div>LS: <strong>${task.ls}</strong> | LF: <strong>${task.lf}</strong></div>`
  html += `<div style="margin-top: 4px;">總浮時: <strong>${task.tf}</strong> 天</div>`
  html += `<div>自由浮時: <strong>${task.ff}</strong> 天</div>`
  
  if (task.predecessors.length > 0) {
    html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">`
    html += `前置作業: `
    html += task.predecessors.map(p => {
      let label = p.taskId
      if (p.type !== 'FS') label += ` (${p.type})`
      if (p.lag) label += ` [${p.lag > 0 ? '+' : ''}${p.lag}]`
      return label
    }).join(', ')
    html += `</div>`
  }
  
  if (task.isCritical) {
    html += `<div style="margin-top: 8px; color: #ff6b6b; font-weight: 600;">⚠️ 要徑作業</div>`
  }
  
  tooltip.html(html)
    .style('left', `${event.pageX + 15}px`)
    .style('top', `${event.pageY + 15}px`)
  
  // 3秒後自動移除
  setTimeout(() => {
    tooltip.remove()
  }, 3000)
}
</script>

<style scoped>
.pdm-diagram {
  background: #ffffff;
  border-radius: 2px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
}

.pdm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pdm-header h2 {
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
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  background: white;
  transition: all 0.2s;
}

.toggle-label:hover {
  background: #f5f5f5;
  border-color: #999;
}

.toggle-label input[type="checkbox"] {
  cursor: pointer;
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

.pdm-container {
  position: relative;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  background: #fafafa;
  height: 600px;
}

.pdm-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #999;
  font-style: italic;
  font-size: 13px;
}

.legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid #e8e8e8;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #555;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-box {
  width: 24px;
  height: 24px;
  border-radius: 2px;
  border: 2px solid;
}

.legend-box.critical {
  background: #fff9c4;
  border-color: #e74c3c;
}

.legend-box.normal {
  background: #fff9c4;
  border-color: #333;
}

.legend-line {
  width: 30px;
  height: 0;
  border-top-width: 2px;
  border-top-style: solid;
}

.legend-line.critical {
  border-color: #e74c3c;
}

.legend-line.normal {
  border-color: #95a5a6;
}

:deep(.node rect) {
  transition: stroke-width 0.2s;
}

:deep(.link) {
  transition: stroke-width 0.2s;
}
</style>

<style>
.pdm-tooltip {
  line-height: 1.6;
}
</style>

