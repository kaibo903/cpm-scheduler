<template>
  <div class="container">
    <!-- 📋 聯絡資訊主要內容區：左右分欄 -->
    <div class="contact-layout">
      <!-- 🗺️ 左側：地圖區域 -->
      <div class="map-section">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d826.5482817760078!2d120.53666423064311!3d23.69517838866941!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x346ec81a4e090e19%3A0xfb5e61980b5c6e0!2z6Zuy5p6X56eR5oqA5aSn5a24LeW3peeoi-WtuOmZouS6lOmkqA!5e1!3m2!1szh-TW!2stw!4v1761405943888!5m2!1szh-TW!2stw"
          width="100%"
          height="100%"
          style="border:0;"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="國立雲林科技大學工程五館位置 - 雲林科技大學-工程學院五館">
        </iframe>
      </div>

      <!-- 📇 右側：聯絡資訊區域 -->
      <div class="info-section">
        <!-- 標題 -->
        <h1 class="contact-title">{{ t.contact.title }}</h1>
        
        <!-- 副標題說明 -->
        <p class="contact-intro">
          {{ t.contact.intro }}
        </p>

        <!-- 聯絡資訊列表 -->
        <div class="contact-details">
          <!-- 聯絡方式 -->
          <div class="detail-block">
            <h3 class="detail-title">{{ t.contact.contactMethodTitle }}</h3>
            <div class="detail-content">
              <p class="detail-item">
                <span class="detail-label">{{ t.contact.unit }}</span>
                國立雲林科技大學 營建工程系 EB502
              </p>
              <p class="detail-item">
                <span class="detail-label">{{ t.contact.address }}</span>
                64002 雲林縣斗六市大學路三段123號 工程五館
              </p>
              <p class="detail-item">
                <span class="detail-label">{{ t.contact.email }}</span>
                <a href="mailto:M11416012@yuntech.edu.tw" class="email-link">
                  M11416012@yuntech.edu.tw
                </a>
              </p>
              <p class="detail-item">
                <span class="detail-label">{{ t.contact.phone }}</span>
                {{ t.contact.phoneValue }}
              </p>
              <p class="detail-item">
                <span class="detail-label">{{ t.contact.advisor }}</span>
                {{ t.contact.advisorName }}
              </p>
            </div>
          </div>

          <!-- 系統版本資訊 -->
          <div class="detail-block">
            <div class="detail-content">
              <p class="version-text">
                {{ t.contact.version }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 📦 聯絡資訊頁面組件
 * 
 * 功能說明：
 * - 左右分欄佈局：左側顯示地圖，右側顯示聯絡資訊
 * - 嵌入 Google Maps 顯示工程五館位置
 * - 提供完整的聯絡方式與系統資訊
 * - 支援多語言顯示
 */

import { useLanguage } from '../composables/useLanguage'

// 🌐 語言管理
const { t } = useLanguage()
</script>

<style scoped>
/* ==========================================
   📋 聯絡資訊頁面主佈局
   ========================================== */

/* 左右分欄容器 */
.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 左右各佔 50% */
  gap: 0;
  min-height: calc(100vh - 200px); /* 減去 header 和 footer 高度 */
  margin: 0 -40px; /* 擴展到容器邊緣 */
}

/* 🗺️ 左側地圖區域 */
.map-section {
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
}

.map-section iframe {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 600px;
}

/* 📇 右側資訊區域 */
.info-section {
  background: #ffffff;
  padding: 80px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* ==========================================
   📝 文字內容樣式
   ========================================== */

/* Contact 聯絡資訊 標題 */
.contact-title {
  font-size: 28px;
  font-weight: 400;
  color: #333;
  margin: 0 0 20px 0;
  letter-spacing: 0.5px;
  line-height: 1.3;
}

/* 副標題說明 */
.contact-intro {
  font-size: 15px;
  color: #666;
  line-height: 1.8;
  margin: 0 0 40px 0;
  max-width: 500px;
}

/* ==========================================
   📇 聯絡資訊區塊
   ========================================== */

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 單個資訊區塊 */
.detail-block {
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 24px;
}

.detail-block:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* 區塊標題 */
.detail-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0 0 16px 0;
  letter-spacing: 0.5px;
}

/* 內容容器 */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 單項內容 */
.detail-item {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  display: flex;
  gap: 8px;
}

/* 標籤文字 */
.detail-label {
  color: #999;
  min-width: 80px;
  flex-shrink: 0;
}

/* 郵件連結 */
.email-link {
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s ease;
}

.email-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 關於文字 */
.about-text {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin: 0 0 12px 0;
}

/* 版本資訊 */
.version-text {
  font-size: 13px;
  color: #999;
  margin: 8px 0 0 0;
  padding-top: 8px;
}

/* ==========================================
   📱 響應式設計
   ========================================== */

@media (max-width: 1024px) {
  .contact-layout {
    grid-template-columns: 1fr; /* 改為單欄 */
    min-height: auto;
    margin: 0 -20px;
  }

  .map-section {
    min-height: 400px;
    order: 2; /* 地圖移到下方 */
  }

  .map-section iframe {
    min-height: 400px;
  }

  .info-section {
    padding: 60px 40px;
    order: 1; /* 資訊移到上方 */
  }

  .contact-title {
    font-size: 26px;
  }
}

@media (max-width: 768px) {
  .contact-layout {
    margin: 0 -16px;
  }

  .map-section {
    min-height: 300px;
  }

  .map-section iframe {
    min-height: 300px;
  }

  .info-section {
    padding: 40px 24px;
  }

  .contact-title {
    font-size: 24px;
    margin-bottom: 16px;
  }

  .contact-intro {
    font-size: 14px;
    margin-bottom: 32px;
  }

  .contact-details {
    gap: 24px;
  }

  .detail-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .detail-item {
    flex-direction: column;
    gap: 4px;
  }

  .detail-label {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .info-section {
    padding: 32px 20px;
  }

  .contact-title {
    font-size: 22px;
  }

  .contact-intro {
    font-size: 13px;
  }

  .detail-title {
    font-size: 15px;
  }

  .detail-item,
  .about-text {
    font-size: 13px;
  }
}
</style>
