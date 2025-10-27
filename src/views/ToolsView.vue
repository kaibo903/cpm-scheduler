<template>
  <div class="page-wrapper">
    <!-- 📋 內容區域 -->
    <div class="container">
      <!-- 🎯 標題區域 -->
      <div class="page-header">
        <h1 class="page-title">所有工具</h1>
        <p class="page-subtitle">Construction Management Tools</p>
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
              {{ t.tools.learnMore }}
              <span class="link-arrow">→</span>
            </span>
          </div>
        </div>
      </router-link>

      <!-- 工期-成本權衡最佳化工具卡片 -->
      <router-link to="/tools/tct" class="tool-card-link">
        <div class="tool-card">
          <!-- 左上角圖示標籤 -->
          <div class="tool-icon-badge">
            <div class="icon-tct-badge"></div>
          </div>
          
          <!-- 工具名稱 -->
          <h3 class="tool-name">{{ t.tools.tct }}</h3>
          
          <!-- 工具描述 -->
          <p class="tool-description">
            {{ t.tools.tctDesc }}
          </p>
          
          <!-- 瞭解更多連結 -->
          <div class="tool-action">
            <span class="action-link">
              {{ t.tools.learnMore }}
              <span class="link-arrow">→</span>
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
              {{ t.tools.comingSoon }}
              <span class="link-arrow">→</span>
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
              {{ t.tools.comingSoon }}
              <span class="link-arrow">→</span>
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
              {{ t.tools.comingSoon }}
              <span class="link-arrow">→</span>
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
              {{ t.tools.comingSoon }}
              <span class="link-arrow">→</span>
            </span>
          </div>
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

/* ==========================================
   🎯 頁面包裝器
   ========================================== */

.page-wrapper {
  min-height: 100vh;
  background: #fafafa;
}

/* ==========================================
   🎯 標題區域樣式 - 極簡設計
   ========================================== */

.page-header {
  padding: 60px 0 50px;
  text-align: center;
}

.page-title {
  font-size: 32px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 14px;
  color: #777;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* 🎨 工具卡片網格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
  padding-bottom: 40px;
}

/* 🔗 工具卡片連結 */
.tool-card-link {
  text-decoration: none;
  display: block;
  transition: all 0.3s ease;
}

.tool-card-link:not(.disabled):hover {
  transform: none;
}

.tool-card-link.disabled {
  cursor: not-allowed;
}

/* 📦 工具卡片 */
.tool-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 32px 28px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.tool-card-link:not(.disabled):hover .tool-card {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #d0d0d0;
  transform: translateY(-4px);
}

.tool-card-link.disabled .tool-card {
  background: #f9f9f9;
  opacity: 0.55;
  border-color: #e8e8e8;
}

/* 🎨 左上角圖示標籤 */
.tool-icon-badge {
  width: 56px;
  height: 56px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 📊 彩色圖示設計 */
.icon-chart-badge,
.icon-tct-badge,
.icon-labor-badge,
.icon-quality-badge,
.icon-report-badge,
.icon-floorplan-badge {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.tool-card-link:not(.disabled):hover .icon-chart-badge,
.tool-card-link:not(.disabled):hover .icon-tct-badge,
.tool-card-link:not(.disabled):hover .icon-labor-badge,
.tool-card-link:not(.disabled):hover .icon-quality-badge,
.tool-card-link:not(.disabled):hover .icon-report-badge,
.tool-card-link:not(.disabled):hover .icon-floorplan-badge {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

/* CPM - 藍色 */
.icon-chart-badge {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
}

.icon-chart-badge::before {
  content: 'CPM';
  color: white;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* TCT - 紅色 */
.icon-tct-badge {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.icon-tct-badge::before {
  content: 'TCT';
  color: white;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* LA - 橘色 */
.icon-labor-badge {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.icon-labor-badge::before {
  content: 'LA';
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* QA - 綠色 */
.icon-quality-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.icon-quality-badge::before {
  content: 'QA';
  color: white;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* LOG - 深藍 */
.icon-report-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.icon-report-badge::before {
  content: 'LOG';
  color: white;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* PLAN - 紫色 */
.icon-floorplan-badge {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.icon-floorplan-badge::before {
  content: 'PLAN';
  color: white;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* 📝 工具名稱 */
.tool-name {
  font-size: 18px;
  color: #333;
  margin: 0 0 16px 0;
  font-weight: 500;
  line-height: 1.4;
  transition: color 0.3s ease;
  letter-spacing: 0.2px;
}

.tool-card-link:not(.disabled):hover .tool-name {
  color: #000;
}

/* 📄 工具描述 */
.tool-description {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
  margin: 0 0 28px 0;
  flex-grow: 1;
  font-weight: 400;
  letter-spacing: 0.1px;
}

/* 🔗 底部動作區域 */
.tool-action {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
  font-weight: 400;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.tool-card-link:not(.disabled):hover .action-link {
  color: #333;
  gap: 12px;
}

.action-link.disabled {
  color: #ccc;
}

/* 🎯 箭頭圖示 */
.link-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-left: 4px;
}

.tool-card-link:not(.disabled):hover .link-arrow {
  transform: translateX(4px);
}

/* 📱 響應式設計 */
@media (max-width: 1200px) {
  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 50px 0 40px;
  }

  .page-title {
    font-size: 26px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .tool-card {
    padding: 24px 20px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 40px 0 35px;
  }

  .page-title {
    font-size: 22px;
  }

  .page-subtitle {
    font-size: 11px;
  }

  .tool-card {
    padding: 24px 20px;
  }

  .tool-icon-badge {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
  }

  .icon-chart-badge,
  .icon-tct-badge,
  .icon-labor-badge,
  .icon-quality-badge,
  .icon-report-badge,
  .icon-floorplan-badge {
    width: 48px;
    height: 48px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .icon-chart-badge::before,
  .icon-tct-badge::before,
  .icon-quality-badge::before,
  .icon-report-badge::before {
    font-size: 13px;
  }

  .icon-labor-badge::before {
    font-size: 14px;
  }

  .icon-floorplan-badge::before {
    font-size: 10px;
  }

  .tool-name {
    font-size: 16px;
  }

  .tool-description {
    font-size: 12px;
  }
}
</style>
