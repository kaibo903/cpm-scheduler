<template>
  <div class="container">
    <!-- 📦 工具頁面標題區域 -->
    <div class="tools-header-bar">
      <h2 class="tools-title">{{ t.tools.title }}</h2>
      <p class="tools-subtitle">{{ t.tools.subtitle }}</p>
    </div>

    <!-- 🛠️ 工具卡片網格 -->
    <div class="tools-grid">
      <!-- 進度規劃 (CPM) 工具卡片 -->
      <router-link to="/tools/planning" class="tool-card-link">
        <div class="tool-card">
          <!-- 左上角圖示標籤 -->
          <div class="tool-icon-badge">
            <div class="icon-chart-badge"></div>
          </div>
          
          <!-- 工具名稱 -->
          <h3 class="tool-name">{{ t.tools.planning }}</h3>
          
          <!-- 工具描述 -->
          <p class="tool-description">
            {{ t.tools.planningDesc }}
          </p>
          
          <!-- 瞭解更多連結 -->
          <div class="tool-action">
            <span class="action-link">
              <span class="link-icon">○</span>
              {{ t.tools.learnMore }}
            </span>
          </div>
        </div>
      </router-link>

      <!-- 工程臨時點工統計分析工具卡片（敬請期待） -->
      <div class="tool-card-link disabled">
        <div class="tool-card">
          <div class="tool-icon-badge">
            <div class="icon-labor-badge"></div>
          </div>
          <h3 class="tool-name">{{ t.tools.labor }}</h3>
          <p class="tool-description">
            {{ t.tools.laborDesc }}
          </p>
          <div class="tool-action">
            <span class="action-link disabled">
              <span class="link-icon">○</span>
              {{ t.tools.comingSoon }}
            </span>
          </div>
        </div>
      </div>

      <!-- 工程品質查驗工具卡片（敬請期待） -->
      <div class="tool-card-link disabled">
        <div class="tool-card">
          <div class="tool-icon-badge">
            <div class="icon-quality-badge"></div>
          </div>
          <h3 class="tool-name">{{ t.tools.quality }}</h3>
          <p class="tool-description">
            {{ t.tools.qualityDesc }}
          </p>
          <div class="tool-action">
            <span class="action-link disabled">
              <span class="link-icon">○</span>
              {{ t.tools.comingSoon }}
            </span>
          </div>
        </div>
      </div>

      <!-- 智慧工程日報管理工具卡片（敬請期待） -->
      <div class="tool-card-link disabled">
        <div class="tool-card">
          <div class="tool-icon-badge">
            <div class="icon-report-badge"></div>
          </div>
          <h3 class="tool-name">{{ t.tools.report }}</h3>
          <p class="tool-description">
            {{ t.tools.reportDesc }}
          </p>
          <div class="tool-action">
            <span class="action-link disabled">
              <span class="link-icon">○</span>
              {{ t.tools.comingSoon }}
            </span>
          </div>
        </div>
      </div>

      <!-- 自動生成住宅平面圖系統工具卡片（敬請期待） -->
      <div class="tool-card-link disabled">
        <div class="tool-card">
          <div class="tool-icon-badge">
            <div class="icon-floorplan-badge"></div>
          </div>
          <h3 class="tool-name">{{ t.tools.floorplan }}</h3>
          <p class="tool-description">
            {{ t.tools.floorplanDesc }}
          </p>
          <div class="tool-action">
            <span class="action-link disabled">
              <span class="link-icon">○</span>
              {{ t.tools.comingSoon }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 📦 工具頁面組件
 * 
 * 功能說明：
 * - 展示所有可用的工程管理工具
 * - 採用卡片式佈局，類似產品展示頁面
 * - 點擊可用工具卡片進入對應的工具頁面
 * - 未來工具顯示為「敬請期待」狀態
 * - 支援多語言顯示
 */

import { useLanguage } from '../composables/useLanguage'

// 🌐 語言管理
const { t } = useLanguage()
</script>

<style scoped>
/* ==========================================
   🛠️ 工具頁面樣式
   ========================================== */

/* 📋 頂部標題列 */
.tools-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 20px 0;
}

.tools-title {
  font-size: 24px;
  color: #333;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.tools-subtitle {
  font-size: 14px;
  color: #999;
  margin: 8px 0 0 0;
  font-weight: 400;
}

/* 🎨 工具卡片網格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

/* 🔗 工具卡片連結 */
.tool-card-link {
  text-decoration: none;
  display: block;
  transition: transform 0.2s ease;
}

.tool-card-link:not(.disabled):hover {
  transform: translateY(-2px);
}

.tool-card-link.disabled {
  cursor: default;
}

/* 📦 工具卡片 */
.tool-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.tool-card-link:not(.disabled):hover .tool-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d0d0d0;
}

.tool-card-link.disabled .tool-card {
  background: #fafafa;
  opacity: 0.75;
}

/* 🎨 左上角圖示標籤 */
.tool-icon-badge {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 📊 進度規劃圖示（紫色） */
.icon-chart-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.icon-chart-badge::before {
  content: 'CPM';
  color: white;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* 👷 臨時點工統計分析圖示（橘黃色） */
.icon-labor-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 6px rgba(247, 151, 30, 0.3);
}

.icon-labor-badge::before {
  content: 'LABOR';
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* ✓ 工程品質查驗圖示（綠色） */
.icon-quality-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 6px rgba(17, 153, 142, 0.3);
}

.icon-quality-badge::before {
  content: 'QA';
  color: white;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 📱 智慧工程日報管理圖示（科技藍） */
.icon-report-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
}

.icon-report-badge::before {
  content: 'LOG';
  color: white;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 🏠 自動生成住宅平面圖系統圖示（紫紅色） */
.icon-floorplan-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 6px rgba(142, 45, 226, 0.3);
}

.icon-floorplan-badge::before {
  content: 'PLAN';
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 📝 工具名稱 */
.tool-name {
  font-size: 18px;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 600;
  line-height: 1.3;
}

/* 📄 工具描述 */
.tool-description {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 20px 0;
  flex-grow: 1;
}

/* 🔗 底部動作區域 */
.tool-action {
  margin-top: auto;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
  font-weight: 500;
  transition: color 0.2s ease;
}

.tool-card-link:not(.disabled):hover .action-link {
  color: #667eea;
}

.action-link.disabled {
  color: #999;
}

/* 箭頭圖示 */
.link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-radius: 50%;
  font-size: 10px;
  transition: transform 0.2s ease;
}

.tool-card-link:not(.disabled):hover .link-icon {
  transform: translateX(3px);
}

/* 📱 響應式設計 */
@media (max-width: 1200px) {
  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .tools-header-bar {
    margin-bottom: 24px;
    padding: 16px 0;
  }

  .tools-title {
    font-size: 20px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .tool-card {
    padding: 20px;
  }

  .tool-description {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .tool-card {
    padding: 16px;
  }

  .tool-icon-badge {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
  }

  .icon-chart-badge,
  .icon-control-badge,
  .icon-resource-badge,
  .icon-cost-badge {
    width: 40px;
    height: 40px;
  }

  .icon-chart-badge::before,
  .icon-control-badge::before,
  .icon-resource-badge::before {
    font-size: 11px;
  }

  .icon-cost-badge::before {
    font-size: 13px;
  }

  .tool-name {
    font-size: 16px;
  }
}
</style>
