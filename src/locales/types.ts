/**
 * 📦 多語言類型定義
 * 
 * 定義所有翻譯文本的結構
 */

export interface Translations {
  // 🌐 通用
  common: {
    appTitle: string
    appSubtitle: string
    version: string
    lastUpdated: string
  }

  // 🔗 導航
  nav: {
    home: string
    tools: string
    contact: string
  }

  // 🏠 首頁
  home: {
    heroTitle: string
    heroSubtitle: string
    heroDescription: string
    startButton: string
    contactButton: string
    featuresTitle: string
    feature1Title: string
    feature1Desc: string
    feature2Title: string
    feature2Desc: string
    feature3Title: string
    feature3Desc: string
    feature4Title: string
    feature4Desc: string
    feature5Title: string
    feature5Desc: string
    aboutTitle: string
    aboutText1: string
    aboutText2: string
    stat1Number: string
    stat1Label: string
    stat2Number: string
    stat2Label: string
    stat3Number: string
    stat3Label: string
  }

  // 🛠️ 工具頁面
  tools: {
    title: string
    subtitle: string
    planning: string
    planningDesc: string
    labor: string
    laborDesc: string
    quality: string
    qualityDesc: string
    report: string
    reportDesc: string
    floorplan: string
    floorplanDesc: string
    learnMore: string
    comingSoon: string
  }

  // 📊 進度規劃頁面
  planning: {
    title: string
    backButton: string
    importCSV: string
    downloadTemplate: string
    exportTasks: string
    exportResults: string
    exportReport: string
    dataInput: string
    addedTasks: string
    taskName: string
    duration: string
    startDate: string
    endDate: string
    resources: string
    resourceName: string
    resourceQuantity: string
    unitPrice: string
    totalCost: string
    addResource: string
    predecessors: string
    successors: string
    addTask: string
    update: string
    calculate: string
    clearAll: string
    mergeDuplicates: string
    clearData: string
    actions: string
    edit: string
    delete: string
    noTasks: string
    barChart: string
    pdm: string
    resetView: string
    standardMode: string
    criticalMode: string
    emptyChart: string
    criticalTasks: string
    normalTasks: string
    detailedMode: string
    simpleMode: string
    days: string
    resetDiagram: string
    autoFit: string
  }

  // 📇 聯絡頁面
  contact: {
    title: string
    intro: string
    contactMethodTitle: string
    unit: string
    address: string
    email: string
    phone: string
    phoneValue: string
    advisor: string
    advisorName: string
    version: string
  }

  // 📊 CPM 結果
  cpmResult: {
    summary: string
    totalDuration: string
    criticalCount: string
    normalCount: string
    detailedResults: string
    taskName: string
    duration: string
    es: string
    ef: string
    ls: string
    lf: string
    tf: string
    ff: string
    critical: string
    errorTitle: string
    cycleDetected: string
    cycleDesc: string
    affectedTasks: string
  }

  // 💬 訊息
  messages: {
    taskAdded: string
    taskUpdated: string
    taskDeleted: string
    tasksCleared: string
    tasksMerged: string
    calculationComplete: string
    importSuccess: string
    exportSuccess: string
    error: string
  }

  // 📥 匯入對話框
  importDialog: {
    title: string
    description: string
    cancel: string
  }

  // 📋 頁尾
  footer: {
    copyright: string
    designedBy: string
  }
}

