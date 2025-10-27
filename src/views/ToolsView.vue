<template>
  <div class="page-wrapper">
    <!-- 🎯 頂部橫幅區域 -->
    <div class="tools-banner">
      <div class="container">
        <h1 class="banner-title">營建管理相關工具</h1>
      </div>
    </div>
    
    <!-- 📋 內容區域 -->
    <div class="container">
      <div class="content-header">
        <h2 class="section-title">所有工具</h2>
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
  background: #f5f5f5;
}

/* 🎨 頂部橫幅區域 */
.tools-banner {
  background: linear-gradient(135deg, #e8eef3 0%, #f5f5f5 100%);
  padding: 40px 0;
  margin-bottom: 48px;
  border-bottom: 1px solid #d0d0d0;
}

.banner-title {
  font-size: 32px;
  color: #333;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.3px;
}

/* 📋 內容標題區域 */
.content-header {
  margin-bottom: 32px;
}

.section-title {
  font-size: 28px;
  color: #333;
  margin: 0;
  font-weight: 400;
  letter-spacing: -0.3px;
}

/* 🎨 工具卡片網格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 60px;
  padding-bottom: 40px;
}

/* 🔗 工具卡片連結 */
.tool-card-link {
  text-decoration: none;
  display: block;
  transition: all 0.2s ease;
}

.tool-card-link:not(.disabled):hover {
  transform: translateY(-2px);
}

.tool-card-link.disabled {
  cursor: not-allowed;
}

/* 📦 工具卡片 */
.tool-card {
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 2px;
  padding: 28px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  position: relative;
}

.tool-card-link:not(.disabled):hover .tool-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #ccc;
}

.tool-card-link.disabled .tool-card {
  background: #fafafa;
  opacity: 0.6;
  border-color: #e5e5e5;
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

/* 📊 進度規劃圖示（紫色） */
.icon-chart-badge {
  width: 56px;
  height: 56px;
  background: #0696d7;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.tool-card-link:not(.disabled):hover .icon-chart-badge {
  transform: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.icon-chart-badge::before {
  content: 'CPM';
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0px;
}

/* 💰 工期-成本權衡圖示（紅色） */
.icon-tct-badge {
  width: 56px;
  height: 56px;
  background: #d90429;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.icon-tct-badge::before {
  content: 'TCT';
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0px;
}

/* 👷 臨時點工統計分析圖示（橘黃色） */
.icon-labor-badge {
  width: 56px;
  height: 56px;
  background: #f77f00;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.icon-labor-badge::before {
  content: 'LABOR';
  color: white;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0px;
}

/* ✓ 工程品質查驗圖示（綠色） */
.icon-quality-badge {
  width: 56px;
  height: 56px;
  background: #06a77d;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.icon-quality-badge::before {
  content: 'QA';
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0px;
}

/* 📱 智慧工程日報管理圖示（深藍） */
.icon-report-badge {
  width: 56px;
  height: 56px;
  background: #0d3b66;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.icon-report-badge::before {
  content: 'LOG';
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0px;
}

/* 🏠 自動生成住宅平面圖系統圖示（紫色） */
.icon-floorplan-badge {
  width: 56px;
  height: 56px;
  background: #7209b7;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.icon-floorplan-badge::before {
  content: 'PLAN';
  color: white;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0px;
}

/* 📝 工具名稱 */
.tool-name {
  font-size: 20px;
  color: #333;
  margin: 0 0 16px 0;
  font-weight: 500;
  line-height: 1.3;
  transition: color 0.2s ease;
}

.tool-card-link:not(.disabled):hover .tool-name {
  color: #0696d7;
}

/* 📄 工具描述 */
.tool-description {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin: 0 0 24px 0;
  flex-grow: 1;
}

/* 🔗 底部動作區域 */
.tool-action {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #0696d7;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tool-card-link:not(.disabled):hover .action-link {
  color: #0582bb;
  gap: 10px;
}

.action-link.disabled {
  color: #ccc;
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
  transition: all 0.2s ease;
}

.tool-card-link:not(.disabled):hover .link-icon {
  transform: translateX(2px);
}

/* 📱 響應式設計 */
@media (max-width: 1200px) {
  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 768px) {
  .tools-banner {
    padding: 32px 0;
    margin-bottom: 32px;
  }

  .banner-title {
    font-size: 26px;
  }

  .section-title {
    font-size: 24px;
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
  .tools-banner {
    padding: 28px 0;
    margin-bottom: 24px;
  }

  .banner-title {
    font-size: 22px;
  }

  .section-title {
    font-size: 20px;
  }

  .tool-card {
    padding: 20px;
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
  }

  .icon-chart-badge::before,
  .icon-tct-badge::before,
  .icon-quality-badge::before,
  .icon-report-badge::before {
    font-size: 14px;
  }

  .icon-labor-badge::before {
    font-size: 11px;
  }

  .icon-floorplan-badge::before {
    font-size: 12px;
  }

  .tool-name {
    font-size: 18px;
  }

  .tool-description {
    font-size: 13px;
  }
}
</style>
