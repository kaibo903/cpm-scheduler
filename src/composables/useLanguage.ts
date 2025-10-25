/**
 * 📦 語言管理 Composable
 * 
 * 功能說明：
 * - 管理應用程式的語言狀態（繁體中文 / 英文）
 * - 提供語言切換功能
 * - 提供翻譯文本查詢功能
 */

import { ref, computed } from 'vue'
import type { Translations } from '../locales/types'
import zhTW from '../locales/zh-TW'
import enUS from '../locales/en-US'

/**
 * 🌐 支援的語言類型
 */
export type Language = 'zh-TW' | 'en-US'

/**
 * 🌐 翻譯資料映射
 */
const translations: Record<Language, Translations> = {
  'zh-TW': zhTW,
  'en-US': enUS
}

/**
 * 🔄 當前語言狀態（全域共享）
 */
const currentLanguage = ref<Language>('zh-TW')

/**
 * 🔧 語言管理 Hook
 */
export function useLanguage() {
  /**
   * 🔄 切換語言
   */
  const setLanguage = (lang: Language) => {
    currentLanguage.value = lang
    // 💾 儲存到 localStorage
    localStorage.setItem('language', lang)
  }

  /**
   * 🔄 切換語言（繁中 ↔ 英文）
   */
  const toggleLanguage = () => {
    const newLang: Language = currentLanguage.value === 'zh-TW' ? 'en-US' : 'zh-TW'
    setLanguage(newLang)
  }

  /**
   * 📖 取得當前語言的翻譯文本
   */
  const t = computed(() => {
    return translations[currentLanguage.value]
  })

  /**
   * 🌐 當前語言代碼
   */
  const locale = computed(() => currentLanguage.value)

  /**
   * 🌐 當前是否為英文
   */
  const isEnglish = computed(() => currentLanguage.value === 'en-US')

  /**
   * 🌐 當前是否為繁體中文
   */
  const isZhTW = computed(() => currentLanguage.value === 'zh-TW')

  // 🚀 初始化：從 localStorage 讀取儲存的語言設定
  const initLanguage = () => {
    const savedLang = localStorage.getItem('language') as Language | null
    if (savedLang && (savedLang === 'zh-TW' || savedLang === 'en-US')) {
      currentLanguage.value = savedLang
    }
  }

  return {
    locale,
    t,
    setLanguage,
    toggleLanguage,
    isEnglish,
    isZhTW,
    initLanguage
  }
}

