<template>
  <div class="home-view">
    <div class="container">
      <!-- 🏠 首頁主要內容 -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">{{ t.home.heroTitle }}</h1>
          <h2 class="hero-subtitle">{{ t.home.heroSubtitle }}</h2>
          <p class="hero-description">
            {{ t.home.heroDescription }}
          </p>
          
          <div class="hero-buttons">
            <router-link to="/tools" class="btn-primary">
              {{ t.home.startButton }}
            </router-link>
            <router-link to="/contact" class="btn-secondary">
              {{ t.home.contactButton }}
            </router-link>
          </div>
        </div>
      </section>

      <!-- 📊 功能特色區 -->
      <section class="features-section">
        <h2 class="section-title">{{ t.home.featuresTitle }}</h2>
        
        <div class="features-grid">
          <!-- 功能 1 -->
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-wrapper purple">
                <span>CPM</span>
              </div>
            </div>
            <h3 class="feature-title">{{ t.home.feature1Title }}</h3>
            <p class="feature-text">
              {{ t.home.feature1Desc }}
            </p>
          </div>

          <!-- 功能 2 -->
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-wrapper orange">
                <span>LABOR</span>
              </div>
            </div>
            <h3 class="feature-title">{{ t.home.feature2Title }}</h3>
            <p class="feature-text">
              {{ t.home.feature2Desc }}
            </p>
          </div>

          <!-- 功能 3 -->
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-wrapper green">
                <span>QA</span>
              </div>
            </div>
            <h3 class="feature-title">{{ t.home.feature3Title }}</h3>
            <p class="feature-text">
              {{ t.home.feature3Desc }}
            </p>
          </div>

          <!-- 功能 4 -->
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-wrapper blue">
                <span>LOG</span>
              </div>
            </div>
            <h3 class="feature-title">{{ t.home.feature4Title }}</h3>
            <p class="feature-text">
              {{ t.home.feature4Desc }}
            </p>
          </div>

          <!-- 功能 5 -->
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-wrapper purple-pink">
                <span>PLAN</span>
              </div>
            </div>
            <h3 class="feature-title">{{ t.home.feature5Title }}</h3>
            <p class="feature-text">
              {{ t.home.feature5Desc }}
            </p>
          </div>
        </div>
      </section>

      <!-- 🎯 關於系統 -->
      <section class="about-section">
        <div class="about-content">
          <h2 class="section-title">{{ t.home.aboutTitle }}</h2>
          <p class="about-text">
            {{ t.home.aboutText1 }}
          </p>
          <p class="about-text">
            {{ t.home.aboutText2 }}
          </p>
          
          <div class="about-stats">
            <div class="stat-item">
              <div class="stat-number">{{ t.home.stat1Number }}</div>
              <div class="stat-label">{{ t.home.stat1Label }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ t.home.stat2Number }}</div>
              <div class="stat-label">{{ t.home.stat2Label }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ t.home.stat3Number }}</div>
              <div class="stat-label">{{ t.home.stat3Label }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 📦 首頁組件
 * 
 * 功能說明：
 * - 展示系統概覽與主要功能
 * - 提供快速導航到各工具頁面
 * - 介紹系統特色與核心價值
 * - 支援多語言顯示
 */

import { useLanguage } from '../composables/useLanguage'

// 🌐 語言管理
const { t } = useLanguage()
</script>

<style scoped>
/* ==========================================
   🏠 首頁容器
   ========================================== */

.home-view {
  min-height: calc(100vh - 200px);
}

/* ==========================================
   🎨 Hero 區域
   ========================================== */

.hero-section {
  text-align: center;
  padding: 80px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin: 0 -40px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 40px;
}

.hero-title {
  font-size: 48px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  letter-spacing: 2px;
}

.hero-subtitle {
  font-size: 20px;
  font-weight: 300;
  color: #34495e;
  margin: 0 0 24px 0;
  letter-spacing: 1px;
}

.hero-description {
  font-size: 16px;
  color: #5a6c7d;
  line-height: 1.8;
  margin: 0 0 40px 0;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #333;
  color: white;
  border: 2px solid #333;
}

.btn-primary:hover {
  background: #000;
  border-color: #000;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: white;
  color: #333;
  border: 2px solid #333;
}

.btn-secondary:hover {
  background: #333;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* ==========================================
   📊 功能特色區
   ========================================== */

.features-section {
  padding: 80px 0;
}

.section-title {
  font-size: 32px;
  font-weight: 500;
  color: #2c3e50;
  text-align: center;
  margin: 0 0 48px 0;
  letter-spacing: 1px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  padding: 32px 24px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #d0d0d0;
}

.feature-icon {
  margin-bottom: 20px;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  margin: 0 auto;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon-wrapper span {
  color: white;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.icon-wrapper.purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.icon-wrapper.orange {
  background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
}

.icon-wrapper.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.icon-wrapper.blue {
  background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);
}

.icon-wrapper.purple-pink {
  background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%);
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.feature-text {
  font-size: 14px;
  color: #5a6c7d;
  line-height: 1.6;
  margin: 0;
}

/* ==========================================
   🎯 關於系統區
   ========================================== */

.about-section {
  padding: 80px 0;
  background: #f8f9fa;
  margin: 0 -40px;
}

.about-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 40px;
}

.about-text {
  font-size: 16px;
  color: #5a6c7d;
  line-height: 1.8;
  margin: 0 0 24px 0;
  text-align: center;
}

.about-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 48px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  letter-spacing: 1px;
}

/* ==========================================
   📱 響應式設計
   ========================================== */

@media (max-width: 768px) {
  .hero-section {
    padding: 60px 0;
    margin: 0 -16px;
  }

  .hero-content {
    padding: 0 24px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-description {
    font-size: 14px;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .features-section {
    padding: 60px 0;
  }

  .section-title {
    font-size: 28px;
    margin-bottom: 32px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .about-section {
    padding: 60px 0;
    margin: 0 -16px;
  }

  .about-content {
    padding: 0 24px;
  }

  .about-stats {
    gap: 40px;
  }

  .stat-number {
    font-size: 36px;
  }
}
</style>

