<template>
  <div class="home-view">
    <!-- 🏠 Hero 主視覺區域 -->
    <section class="hero-section">
      <div class="hero-container">
        <h1 class="hero-title">營建管理相關工具集</h1>
        <p class="hero-subtitle">Construction Management Tools</p>
        <p class="hero-description">提供工程進度規劃、成本控制、資源分配等數據分析工具，協助營建專案管理者做出更精準的決策</p>
        
        <div class="hero-actions">
          <router-link to="/tools" class="btn-primary">
            探索工具集
          </router-link>
        </div>
      </div>
    </section>

    <!-- 📊 工具集列表 -->
    <section class="tools-section">
      <div class="tools-container">
        <div class="section-header">
          <h2 class="section-title">工具集</h2>
          <p class="section-desc">結合實務案例與理論分析，提供完整的營建管理解決方案</p>
        </div>
        
        <div class="tools-grid">
          <!-- 工具 1 -->
          <router-link to="/tools/planning" class="tool-card">
            <div class="card-number">01</div>
            <h3 class="tool-title">進度規劃</h3>
            <p class="tool-description">使用要徑法（Critical Path Method）進行專案進度規劃，計算最早／最晚時間，識別要徑作業</p>
          </router-link>

          <!-- 工具 2 -->
          <router-link to="/tools/tct" class="tool-card">
            <div class="card-number">02</div>
            <h3 class="tool-title">工期-成本權衡最佳化</h3>
            <p class="tool-description">透過壓縮分析找出最佳的工期-成本平衡點，計算各作業的壓縮方案，提供成本-時間權衡曲線與 Pareto 最佳解</p>
          </router-link>

          <!-- 工具 3 -->
          <div class="tool-card disabled">
            <div class="card-number">03</div>
            <h3 class="tool-title">工程臨時點工統計分析</h3>
            <p class="tool-description">本系統用於臨時計酬分析建造工程中臨時點工的出工與成本資料，提供雲端運作</p>
            <p class="tool-status">敬請期待</p>
          </div>

          <!-- 工具 4 -->
          <div class="tool-card disabled">
            <div class="card-number">04</div>
            <h3 class="tool-title">工程品質查驗</h3>
            <p class="tool-description">本系統用於施工區段之品質管理與自主查驗，透過雲端驗收表單裝載立合規進度</p>
            <p class="tool-status">敬請期待</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 🎯 關於工具集 -->
    <section class="about-section">
      <div class="about-container">
        <h2 class="section-title">關於本工具集</h2>
        <div class="about-grid">
          <div class="about-item">
            <h3 class="about-item-title">工具來源</h3>
            <p class="about-item-text">整合實務工程案例與學術研究成果，提供真實可靠的營建管理工具</p>
          </div>
          <div class="about-item">
            <h3 class="about-item-title">應用場景</h3>
            <p class="about-item-text">適用於工程教育、專案規劃、進度控制、成本分析等多種應用情境</p>
          </div>
          <div class="about-item">
            <h3 class="about-item-title">持續更新</h3>
            <p class="about-item-text">定期新增工具與功能，持續優化分析能力，提供最新的營建管理解決方案</p>
          </div>
        </div>
      </div>
    </section>
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
  min-height: 100vh;
  background: white;
}

/* ==========================================
   🎨 Hero 區域 - 現代無印風格
   ========================================== */

.hero-section {
  position: relative;
  padding: 140px 0 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.hero-container {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 0 auto;
  padding: 0 40px;
  text-align: center;
}

.hero-title {
  font-size: 52px;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  letter-spacing: 3px;
  line-height: 1.5;
  font-family: 'Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.hero-subtitle {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  margin: 0 0 36px 0;
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

.hero-description {
  font-size: 16px;
  color: #666;
  line-height: 1.9;
  margin: 0 0 48px 0;
  letter-spacing: 0.2px;
  font-weight: 300;
  max-width: 620px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  margin-top: 48px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 18px 52px;
  background: #1a1a1a;
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.5px;
  border: 1px solid #1a1a1a;
  border-radius: 50px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  background: white;
  color: #1a1a1a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* ==========================================
   📊 工具集列表區域 - 現代無印風格
   ========================================== */

.tools-section {
  padding: 80px 0 80px;
  background: #fafafa;
}

.tools-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-title {
  font-size: 42px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  letter-spacing: -0.5px;
}

.section-desc {
  font-size: 15px;
  color: #666;
  margin: 0;
  letter-spacing: 0.3px;
  line-height: 1.7;
  font-weight: 300;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.tool-card {
  background: white;
  padding: 36px;
  text-decoration: none;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 240px;
  border-radius: 16px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.tool-card:hover {
  border-color: #333;
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.tool-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tool-card.disabled:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  border-color: #e8e8e8;
}

.card-number {
  font-size: 56px;
  font-weight: 200;
  color: #f0f0f0;
  margin: 0 0 20px 0;
  line-height: 1;
  letter-spacing: -3px;
  transition: all 0.35s ease;
}

.tool-card:hover .card-number {
  color: #333;
  transform: scale(1.02);
}

.tool-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  letter-spacing: -0.3px;
  line-height: 1.3;
  transition: all 0.3s ease;
}

.tool-card:hover .tool-title {
  color: #000;
}

.tool-description {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin: 0;
  letter-spacing: 0.1px;
  font-weight: 300;
  flex: 1;
}

.tool-status {
  font-size: 11px;
  color: #999;
  margin: 18px 0 0 0;
  letter-spacing: 0.8px;
  font-weight: 400;
  text-transform: uppercase;
}

/* ==========================================
   🎯 關於工具集區 - 現代無印風格
   ========================================== */

.about-section {
  padding: 80px 0 80px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.about-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 40px;
  text-align: center;
}

.about-container .section-title {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  letter-spacing: -0.5px;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  margin-top: 50px;
}

.about-item {
  text-align: center;
  padding: 32px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.about-item:hover {
  transform: translateY(-4px);
  background: white;
  border-color: #333;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.about-item-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  letter-spacing: 0.2px;
}

.about-item-text {
  font-size: 15px;
  color: #666;
  line-height: 1.8;
  margin: 0 auto;
  letter-spacing: 0.1px;
  font-weight: 300;
  max-width: 600px;
}

/* ==========================================
   📱 響應式設計
   ========================================== */

@media (max-width: 1024px) {
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 100px 0 80px;
  }

  .hero-container {
    padding: 0 24px;
  }

  .hero-title {
    font-size: 36px;
    letter-spacing: 2.5px;
  }

  .hero-subtitle {
    font-size: 11px;
    letter-spacing: 2px;
  }

  .hero-description {
    font-size: 15px;
    line-height: 1.8;
  }

  .btn-primary {
    padding: 16px 40px;
    font-size: 13px;
  }

  .tools-section {
    padding: 60px 0 70px;
  }

  .tools-container {
    padding: 0 24px;
  }

  .section-header {
    margin-bottom: 40px;
  }

  .section-title {
    font-size: 30px;
    margin-bottom: 16px;
  }

  .section-desc {
    font-size: 14px;
  }

  .tool-card {
    padding: 32px;
    min-height: 220px;
    border-radius: 14px;
  }

  .card-number {
    font-size: 68px;
    margin-bottom: 28px;
  }

  .tool-title {
    font-size: 22px;
    margin-bottom: 18px;
  }

  .tool-description {
    font-size: 14px;
  }

  .tool-status {
    font-size: 11px;
    margin-top: 20px;
  }

  .about-section {
    padding: 60px 0 70px;
  }

  .about-container {
    padding: 0 24px;
  }

  .about-container .section-title {
    font-size: 28px;
  }

  .about-grid {
    margin-top: 40px;
    gap: 24px;
  }

  .about-item {
    padding: 28px;
  }

  .about-item-title {
    font-size: 16px;
  }

  .about-item-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 80px 0 60px;
  }

  .hero-title {
    font-size: 28px;
    letter-spacing: 2px;
  }

  .hero-subtitle {
    font-size: 10px;
    letter-spacing: 1.8px;
  }

  .hero-description {
    font-size: 14px;
    line-height: 1.8;
  }

  .btn-primary {
    padding: 14px 36px;
    font-size: 13px;
  }

  .section-title {
    font-size: 28px;
  }

  .tools-section {
    padding: 50px 0 60px;
  }

  .section-title {
    font-size: 26px;
  }

  .tool-card {
    padding: 28px;
    min-height: 220px;
    border-radius: 14px;
  }

  .card-number {
    font-size: 48px;
    margin-bottom: 18px;
  }

  .tool-title {
    font-size: 19px;
    margin-bottom: 14px;
  }

  .tool-description {
    font-size: 13px;
  }

  .tool-status {
    font-size: 11px;
    margin-top: 16px;
  }

  .about-section {
    padding: 50px 0 60px;
  }

  .about-container .section-title {
    font-size: 24px;
  }

  .about-grid {
    gap: 20px;
    margin-top: 36px;
  }

  .about-item {
    padding: 24px;
  }

  .about-item-title {
    font-size: 15px;
  }

  .about-item-text {
    font-size: 13px;
  }
}
</style>

