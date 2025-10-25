/**
 * 📦 Vue Router 配置
 * 
 * 功能說明：
 * - 定義應用程式的路由結構
 * - 設定頁面對應的 URL 路徑
 * - 管理頁面導航與歷史記錄
 */

import { createRouter, createWebHistory } from 'vue-router'

/**
 * 🔗 路由配置
 * 
 * 路徑說明：
 * - / → 首頁
 * - /tools → 工具頁面
 * - /tools/planning → 進度規劃計算頁面
 * - /contact → 聯絡資訊頁面
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        title: '首頁'
      }
    },
    {
      path: '/tools',
      name: 'tools',
      component: () => import('../views/ToolsView.vue'),
      meta: {
        title: '工具'
      }
    },
    {
      path: '/tools/planning',
      name: 'planning',
      component: () => import('../views/PlanningView.vue'),
      meta: {
        title: '進度規劃 (CPM)'
      }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
      meta: {
        title: '聯絡資訊'
      }
    }
  ]
})

/**
 * 🔧 路由導航守衛
 * 
 * 功能：更新頁面標題
 */
router.beforeEach((to, from, next) => {
  // 更新頁面標題
  if (to.meta.title) {
    document.title = `${to.meta.title} - 工程進度規劃與控制課程解答工具`
  }
  next()
})

export default router

