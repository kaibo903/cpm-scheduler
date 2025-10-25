/**
 * 🇹🇼 繁體中文翻譯
 */

import type { Translations } from './types'

const zhTW: Translations = {
  common: {
    appTitle: '工程進度規劃與控制課程解答工具',
    appSubtitle: 'Construction Planning and Scheduling Learning Assistant',
    version: '版本',
    lastUpdated: '最後更新'
  },

  nav: {
    home: '首頁',
    tools: '工具',
    contact: '聯絡資訊'
  },

  home: {
    heroTitle: '工程進度規劃與控制',
    heroSubtitle: 'Construction Planning and Scheduling Learning Assistant',
    heroDescription: '提供工程管理專業工具，協助您進行專案規劃、進度控制、品質管理與智慧分析。',
    startButton: '開始使用工具',
    contactButton: '聯絡我們',
    featuresTitle: '核心功能',
    feature1Title: '進度規劃 (CPM)',
    feature1Desc: '要徑法時程分析，自動計算專案工期，識別要徑作業，提供甘特圖與 PDM 網圖視覺化。',
    feature2Title: '臨時點工統計',
    feature2Desc: '統計與分析營建工程中臨時點工的出工與成本資料，協助營造廠掌握人力使用情況。',
    feature3Title: '工程品質查驗',
    feature3Desc: '施工階段品質管理與自主查驗，即時紀錄、統計缺失，生成施工查驗報告。',
    feature4Title: '智慧工程日報',
    feature4Desc: '施工日報表電子化，整合物料與異常管理，透過雲端分析提高管理效率。',
    feature5Title: '住宅平面圖生成',
    feature5Desc: '透過 AI 演算法自動生成住宅平面圖，快速產出符合法規的概念配置。',
    aboutTitle: '關於本系統',
    aboutText1: '（待編輯）',
    aboutText2: '（待編輯）',
    stat1Number: '（待編輯）',
    stat1Label: '（待編輯）',
    stat2Number: '（待編輯）',
    stat2Label: '（待編輯）',
    stat3Number: '（待編輯）',
    stat3Label: '（待編輯）'
  },

  tools: {
    title: '工程管理工具',
    subtitle: '選擇您需要使用的工具',
    planning: '進度規劃',
    planningDesc: '使用要徑法 (Critical Path Method) 進行專案進度規劃，計算最早/最晚時間，識別要徑作業。',
    labor: '工程臨時點工統計分析',
    laborDesc: '本系統用於統計與分析營建工程中臨時點工的出工與成本資料，結合雲端與行動裝置操作，協助營造廠即時掌握臨時人力使用情況、自動彙整歷史資料以支援預算估算與決策分析。',
    quality: '工程品質查驗',
    qualityDesc: '本系統用於施工階段之品質管理與自主查驗，透過電腦與行動裝置整合表單建立、查詢、填寫與報表功能，協助現場即時紀錄、統計缺失並生成施工查驗與進度報告，提升品質管理效率與資料保存完整性。',
    report: '智慧工程日報管理',
    reportDesc: '本系統將傳統施工日報表電子化，整合工地物料與異常管理，可即時掌握進料差異、進度異常與現場狀況，透過雲端資料連結與分析，提高專案管理效率與精確度，達到智慧化、零時差的工程管理目標。',
    floorplan: '自動生成住宅平面圖系統',
    floorplanDesc: '本系統透過 AI 與演算法自動生成住宅樓層平面圖，依據使用者輸入之基地面積、容積率與戶數條件，自動配置走道、核心與住宅單元比例，快速產出符合法規且具可行性的概念平面配置。',
    learnMore: '瞭解更多',
    comingSoon: '敬請期待'
  },

  planning: {
    title: '進度規劃',
    backButton: '← 返回工具列表',
    importCSV: '匯入 CSV',
    downloadTemplate: '下載 CSV範本',
    exportTasks: '匯出作業',
    exportResults: '匯出結果',
    exportReport: '匯出報告',
    addedTasks: '已新增作業',
    taskName: '作業名稱',
    duration: '工期(天)',
    predecessors: '前置作業',
    successors: '後續作業',
    addTask: '新增作業',
    calculate: '開始計算',
    clearAll: '清空所有',
    actions: '操作',
    edit: '編輯',
    delete: '刪除',
    noTasks: '尚未新增任何作業',
    barChart: 'Bar Chart',
    pdm: 'PDM',
    resetView: '重置畫面',
    standardMode: '作業順序',
    criticalMode: '要徑優先',
    emptyChart: '尚無資料可顯示，請先新增作業並計算排程',
    criticalTasks: '要徑作業',
    normalTasks: '一般作業',
    detailedMode: '詳細模式',
    simpleMode: '簡潔模式',
    days: '天',
    resetDiagram: '重置視圖',
    autoFit: '自動縮放'
  },

  contact: {
    title: 'Contact 聯絡資訊',
    intro: '感謝您瀏覽本網站。若您對本系統有任何疑問、建議或技術問題，歡迎透過以下方式與我們聯繫，我們將盡快回覆。',
    contactMethodTitle: '聯絡方式',
    unit: '單位：',
    address: '地址：',
    email: '電子郵件：',
    phone: '電話：',
    phoneValue: '暫不提供',
    advisor: '指導教授：',
    advisorName: '劉述舜 博士',
    version: '版本：v1.2 | 最後更新：2025年10月'
  },

  cpmResult: {
    summary: '計算結果摘要',
    totalDuration: '專案總工期',
    criticalCount: '要徑作業數量',
    normalCount: '一般作業數量',
    detailedResults: '詳細計算結果',
    taskName: '作業名稱',
    duration: '工期(天)',
    es: 'ES',
    ef: 'EF',
    ls: 'LS',
    lf: 'LF',
    tf: 'TF',
    ff: 'FF',
    critical: '要徑作業',
    errorTitle: '錯誤訊息',
    cycleDetected: '檢測到循環依賴',
    cycleDesc: '依賴關係中存在循環，無法完成 CPM 計算。請檢查並修正以下作業的依賴關係：',
    affectedTasks: '受影響的作業'
  },

  messages: {
    taskAdded: '作業已新增',
    taskUpdated: '作業已更新',
    taskDeleted: '作業已刪除',
    tasksCleared: '所有作業已清空',
    calculationComplete: 'CPM 計算完成',
    importSuccess: '檔案匯入成功',
    exportSuccess: '匯出成功',
    error: '發生錯誤'
  },

  importDialog: {
    title: '匯入 CSV 檔案',
    description: '選擇包含作業資料的 CSV 檔案。檔案應包含以下欄位：作業名稱、工期(天)、前置作業、後續作業',
    cancel: '取消'
  },

  footer: {
    copyright: '© 2025 Construction Planning and Scheduling Learning Assistant v1.2',
    designedBy: 'Designed by：國立雲林科技大學 營建工程系 EB502'
  }
}

export default zhTW

