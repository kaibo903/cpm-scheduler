# 📚 程式碼註解與維護指南

## ✅ 已完成事項

### 1. 建立 Cursor AI 規則文件
✅ 創建 `.cursorrules` 文件
- 定義完整的繁體中文註解規範
- 提供表情符號使用指南
- 規範 Vue 組件、TypeScript、演算法等不同類型程式碼的註解格式

### 2. 註解規範重點

#### 📦 模組級別註解
每個檔案開頭都應該有模組說明：
```typescript
/**
 * 📦 模組名稱
 * 
 * 功能說明：此模組的主要功能
 * 主要功能：
 * - 功能 1
 * - 功能 2
 */
```

#### 🔧 函式註解
所有重要函式都需要註解：
```typescript
/**
 * 🔧 函式功能簡述
 * 
 * @param paramName - 參數說明
 * @returns 回傳值說明
 */
```

#### 💡 行內註解
關鍵邏輯需要行內說明：
```typescript
// 🔍 檢查循環依賴
// 🧮 計算總浮時
// 🎨 繪製甘特圖
```

## 🎯 表情符號速查表

| 符號 | 用途 | 範例 |
|-----|------|------|
| 📦 | 模組定義 | 模組說明 |
| 🔧 | 函式功能 | 函式定義 |
| 📊 | 資料處理 | 資料轉換 |
| 🎨 | UI/視覺化 | 繪圖相關 |
| 🔍 | 邏輯判斷 | 條件檢查 |
| ⚙️ | 配置設定 | 參數設定 |
| 🚀 | 初始化 | 啟動函式 |
| 📝 | 範例說明 | 使用範例 |
| ⚠️ | 注意事項 | 警告訊息 |
| ✅ | 驗證檢查 | 資料驗證 |
| 🔄 | 迴圈遍歷 | 迴圈處理 |
| 💾 | 儲存匯出 | 檔案儲存 |
| 📥 | 匯入讀取 | 檔案讀取 |
| 🎯 | 目標結果 | 計算目標 |
| 🧮 | 數學計算 | 公式計算 |
| 🔗 | 關聯連結 | 建立關係 |
| 🖱️ | 滑鼠事件 | 點擊拖曳 |
| ⌨️ | 鍵盤事件 | 按鍵處理 |
| 📡 | API 呼叫 | 網路請求 |
| 🎛️ | 控制元件 | 按鈕控制 |

## 📋 現有程式碼註解狀態

### ✅ 已有完整註解
1. **cpmEngine.ts** - CPM 計算引擎
   - ✓ 完整的演算法說明
   - ✓ Forward/Backward Pass 詳細註解
   - ✓ 循環依賴檢測說明

2. **dataIO.ts** - 資料輸入輸出
   - ✓ CSV 匯入匯出註解
   - ✓ 檔案處理說明

### 🔄 需要補充註解的模組
建議按照以下順序補充：

1. **TaskInput.vue** - 任務輸入組件
   - 需要：template 區塊註解
   - 需要：事件處理註解

2. **GanttChart.vue** - 甘特圖組件
   - 需要：D3.js 繪圖邏輯註解
   - 需要：縮放拖曳功能註解

3. **PDMDiagram.vue** - PDM 網圖組件
   - 需要：佈局演算法註解
   - 需要：路徑規劃註解

4. **CPMResultTable.vue** - 結果表格組件
   - 需要：資料顯示邏輯註解

5. **App.vue** - 主應用程式
   - 需要：組件整合註解
   - 需要：資料流說明

## 🚀 如何使用 Cursor AI 自動添加註解

### 方法 1：新增程式碼時自動註解
當您請求 Cursor AI 新增功能時，它會自動：
1. 添加繁體中文註解
2. 使用適當的表情符號
3. 遵循統一的格式

**範例提示詞**：
```
請新增一個計算平均工期的函式，並加上完整的繁體中文註解
```

### 方法 2：為現有程式碼補充註解
選取需要註解的程式碼區塊，然後：

**提示詞範例**：
```
請為選取的程式碼添加繁體中文註解，包含：
1. 功能說明
2. 主要步驟
3. 關鍵變數說明
```

### 方法 3：批次補充整個檔案的註解
**提示詞範例**：
```
請檢查 TaskInput.vue 檔案，為所有缺少註解的地方補充完整的繁體中文註解
```

## 📝 註解範例

### Vue 組件範例

```vue
<template>
  <!-- 🎨 主容器：甘特圖顯示區域 -->
  <div class="gantt-chart">
    
    <!-- 🎛️ 控制列：縮放與模式切換 -->
    <div class="gantt-header">
      <h2></h2>
      <div class="controls">
        <!-- 重置按鈕 -->
        <button class="btn" @click="resetView">重置畫面</button>
        
        <!-- 顯示模式選單 -->
        <select class="mode-select" v-model="criticalPathMode">
          <option :value="false">作業順序</option>
          <option :value="true">要徑優先</option>
        </select>
      </div>
    </div>
    
    <!-- 📊 SVG 繪圖區域 -->
    <div class="gantt-container">
      <svg ref="svgRef" class="gantt-svg">
        <!-- 圖表內容 -->
      </svg>
    </div>
    
  </div>
</template>

<script setup lang="ts">
// 📦 Vue 核心功能匯入
import { ref, onMounted, watch, nextTick } from 'vue'

// 📊 D3.js 視覺化函式庫
import * as d3 from 'd3'

// 📋 類型定義匯入
import type { CPMResult, CPMTask } from '../types'

// ⚙️ 組件屬性定義
const props = defineProps<{
  cpmResult: CPMResult | null  // CPM 計算結果
}>()

// 🎯 DOM 元素引用
const svgRef = ref<SVGSVGElement | null>(null)        // SVG 根元素
const containerRef = ref<SVGGElement | null>(null)    // G 容器元素

// 🔄 響應式狀態
const criticalPathMode = ref(false)  // 顯示模式：false=作業順序，true=要徑優先

// ⚙️ 圖表配置常數
const MARGIN = { top: 70, right: 40, bottom: 60, left: 180 }  // 邊距設定
const CELL_WIDTH = 28   // 每天的寬度（像素）
const CELL_HEIGHT = 85  // 每列的高度（像素）
const MIN_BAR_HEIGHT = 60  // 作業條最小高度（像素）

// 🔧 重置視圖函式
function resetView() {
  // 重置縮放狀態
  fitToView()
}

// 🎨 繪製甘特圖主函式
function renderGantt() {
  // 🔍 檢查資料有效性
  if (!props.cpmResult || props.cpmResult.tasks.length === 0) {
    return
  }
  
  // 📊 準備任務資料
  let tasks = [...props.cpmResult.tasks]
  
  // 🔄 根據顯示模式排序
  if (criticalPathMode.value) {
    // 要徑優先：要徑作業在上方
    tasks = tasks.sort((a, b) => {
      if (a.isCritical && !b.isCritical) return -1
      if (!a.isCritical && b.isCritical) return 1
      return 0
    })
  }
  
  // 🎨 執行繪圖...
}

// 🚀 組件掛載時初始化
onMounted(() => {
  if (props.cpmResult && props.cpmResult.tasks.length > 0) {
    renderGantt()
  }
})

// 👀 監聽 CPM 結果變化
watch(() => props.cpmResult, () => {
  nextTick(() => {
    if (props.cpmResult && props.cpmResult.tasks.length > 0) {
      renderGantt()
    }
  })
}, { deep: true })
</script>

<style scoped>
/* 🎨 主容器樣式 */
.gantt-chart {
  background: #ffffff;
  border-radius: 2px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
}

/* 🎛️ 控制列樣式 */
.gantt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 🔘 按鈕樣式 */
.btn {
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  background: white;
  border-radius: 2px;
  font-size: 13px;
  cursor: pointer;
  height: 32px;
}

/* 🖱️ 按鈕 hover 效果 */
.btn:hover {
  background: #f5f5f5;
  border-color: #999;
}
</style>
```

### TypeScript 演算法範例

```typescript
/**
 * 🧮 Forward Pass 演算法
 * 
 * 功能：計算每個任務的最早開始時間 (ES) 和最早完成時間 (EF)
 * 
 * 演算法原理：
 * 1. 按照拓撲排序的順序遍歷任務
 * 2. 對於起始任務（無前置任務），ES = 0
 * 3. 對於其他任務，ES = max(所有前置任務的約束時間)
 * 4. EF = ES + duration
 * 
 * @param tasks - 任務陣列
 * @param sortedIds - 拓撲排序後的任務 ID 陣列
 * 
 * 📝 約束類型說明：
 * - FS (Finish-to-Start): EF(前) + lag → ES(後)
 * - SS (Start-to-Start): ES(前) + lag → ES(後)
 * - FF (Finish-to-Finish): EF(前) + lag → EF(後)
 * - SF (Start-to-Finish): ES(前) + lag → EF(後)
 */
function forwardPass(tasks: CPMTask[], sortedIds: string[]): void {
  // 🔗 建立任務 ID 到任務物件的映射表
  const taskMap = new Map<string, CPMTask>()
  tasks.forEach(task => taskMap.set(task.id, task))

  // 🔄 依序處理每個任務
  for (const taskId of sortedIds) {
    const task = taskMap.get(taskId)!
    
    // 🔍 判斷是否為起始任務
    if (task.predecessors.length === 0) {
      // 起始任務從第 0 天開始
      task.es = 0
      task.isStart = true
    } else {
      // 🧮 計算最早開始時間
      let maxES = 0  // 初始值為 0，確保 ES 不會為負
      
      // 🔄 檢查所有前置任務的約束
      for (const predDep of task.predecessors) {
        const pred = taskMap.get(predDep.taskId)
        
        // ✅ 確認前置任務已計算完成
        if (pred && pred.ef !== undefined) {
          // 🧮 根據依賴類型計算約束時間
          const constraintTime = calculateConstraint(predDep, pred, task)
          
          // 📊 取所有約束的最大值
          maxES = Math.max(maxES, constraintTime)
        }
      }
      
      // 📏 設定最早開始時間（確保不為負數）
      task.es = Math.max(0, maxES)
    }
    
    // 🧮 計算最早完成時間
    task.ef = task.es + task.duration
  }
}

/**
 * 🔍 檢測循環依賴
 * 
 * 功能：使用深度優先搜尋 (DFS) 檢測任務之間是否存在循環依賴
 * 
 * 演算法：
 * 1. 維護一個「已訪問」集合和一個「遞迴堆疊」集合
 * 2. 對每個未訪問的任務執行 DFS
 * 3. 如果在遞迴堆疊中發現已訪問的節點，表示存在循環
 * 
 * @param tasks - 任務陣列
 * @returns true 表示存在循環依賴，false 表示無循環
 * 
 * ⚠️ 注意：循環依賴會導致 CPM 計算無法進行
 */
function detectCycle(tasks: CPMTask[]): boolean {
  // 🔗 建立任務映射表
  const taskMap = new Map<string, CPMTask>()
  tasks.forEach(task => taskMap.set(task.id, task))

  // 📊 追蹤狀態的集合
  const visited = new Set<string>()      // 已訪問的任務
  const recursionStack = new Set<string>()  // DFS 遞迴堆疊

  /**
   * 🔍 深度優先搜尋函式
   * @param taskId - 當前檢查的任務 ID
   * @returns true 表示發現循環
   */
  function dfs(taskId: string): boolean {
    // ✅ 標記為已訪問
    visited.add(taskId)
    recursionStack.add(taskId)

    const task = taskMap.get(taskId)
    if (!task) return false

    // 🔄 檢查所有後續任務
    const successorIds = task.successors.map(d => d.taskId)
    for (const successorId of successorIds) {
      if (!visited.has(successorId)) {
        // 🚀 遞迴檢查未訪問的後續任務
        if (dfs(successorId)) return true
      } else if (recursionStack.has(successorId)) {
        // ⚠️ 發現循環：後續任務在遞迴堆疊中
        return true
      }
    }

    // 🔙 回溯：從遞迴堆疊中移除
    recursionStack.delete(taskId)
    return false
  }

  // 🔄 檢查所有任務
  for (const task of tasks) {
    if (!visited.has(task.id)) {
      if (dfs(task.id)) return true
    }
  }

  // ✅ 無循環依賴
  return false
}
```

## 🎓 學習資源

### 1. CPM 理論基礎
- **ES (Earliest Start)**：最早開始時間
- **EF (Earliest Finish)**：最早完成時間
- **LS (Latest Start)**：最晚開始時間
- **LF (Latest Finish)**：最晚完成時間
- **TF (Total Float)**：總浮時 = LS - ES
- **FF (Free Float)**：自由浮時
- **要徑 (Critical Path)**：TF = 0 的任務序列

### 2. 依賴關係類型
- **FS (Finish-to-Start)**：前置任務完成後，後續任務才能開始
- **SS (Start-to-Start)**：兩任務必須同時或依序開始
- **FF (Finish-to-Finish)**：兩任務必須同時或依序完成
- **SF (Start-to-Finish)**：前置任務開始後，後續任務才能完成

### 3. Lag 時間
- **正 Lag**：強制延遲（例如：混凝土養護期）
- **負 Lag**：快速跟進（例如：邊做邊審查）
- **零 Lag**：緊接著進行

## 📞 維護支援

如果您在添加註解時遇到問題，可以：

1. **查看 `.cursorrules` 文件**：獲取完整的規範說明
2. **參考現有註解**：查看 `cpmEngine.ts` 的註解範例
3. **使用 Cursor AI**：直接請求 AI 協助添加註解

---

**最後更新：** 2025-10-25
**維護者：** Cursor AI + 開發團隊

