<template>
  <!-- 🎨 主容器 -->
  <div class="container">
    <!-- 📋 頁面標題列 -->
    <div class="header-bar">
      <div class="header-left">
        <router-link to="/tools" class="back-button">
          {{ t.tct.backButton }}
        </router-link>
        <div class="title-section">
          <h2 class="page-title">{{ t.tct.title }}</h2>
          <p class="page-subtitle">{{ t.tct.subtitle }}</p>
        </div>
      </div>
    </div>

    <!-- 📊 TCT 最佳化組件 -->
    <TCTOptimizer />
  </div>
</template>

<script setup lang="ts">
/**
 * 📦 TCT 視圖組件
 * 
 * 功能說明：
 * - 工期-成本權衡最佳化工具的主頁面
 * - 包含標題列和返回按鈕
 * - 嵌入 TCTOptimizer 核心組件
 */

import { useLanguage } from '../composables/useLanguage'
import TCTOptimizer from '../components/TCTOptimizer.vue'

// 🌐 語言管理
const { t } = useLanguage()
</script>

<style scoped>
/* ==========================================
   🎨 TCT 視圖樣式
   ========================================== */

/* 📋 頁面標題列 */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #e8e8e8;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 🔙 返回按鈕 */
.back-button {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border: 1px solid #667eea;
  border-radius: 4px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.back-button:hover {
  background: #667eea;
  color: white;
}

/* 📝 標題區域 */
.title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.page-subtitle {
  font-size: 13px;
  color: #999;
  margin: 0;
  font-weight: 400;
}

/* 📱 響應式設計 */
@media (max-width: 768px) {
  .header-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
  }

  .back-button {
    width: 100%;
    text-align: center;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .header-bar {
    padding: 16px 0;
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 18px;
  }
}
</style>

