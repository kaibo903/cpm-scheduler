/**
 * 📦 應用程式入口
 * 
 * 功能說明：
 * - 初始化 Vue 應用程式
 * - 整合 Vue Router 路由管理
 * - 掛載主應用程式組件
 */

import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 🔗 使用 Vue Router
app.use(router)

// 🚀 掛載應用程式
app.mount('#app')
