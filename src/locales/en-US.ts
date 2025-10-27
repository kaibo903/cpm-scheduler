/**
 * 🇺🇸 English Translation
 */

import type { Translations } from './types'

const enUS: Translations = {
  common: {
    appTitle: 'Construction Planning and Scheduling Learning Assistant',
    appSubtitle: 'Construction Planning and Scheduling Learning Assistant',
    version: 'Version',
    lastUpdated: 'Last Updated'
  },

  nav: {
    home: 'Home',
    tools: 'Tools',
    contact: 'Contact'
  },

  home: {
    heroTitle: 'Construction Planning and Control',
    heroSubtitle: 'Construction Planning and Scheduling Learning Assistant',
    heroDescription: 'Professional construction management tools to assist you with project planning, schedule control, quality management, and intelligent analysis.',
    startButton: 'Get Started',
    contactButton: 'Contact Us',
    featuresTitle: 'Core Features',
    feature1Title: 'Schedule Planning (CPM)',
    feature1Desc: 'Critical Path Method schedule analysis, automatically calculate project duration, identify critical activities, and provide Gantt chart and PDM network diagram visualization.',
    feature2Title: 'Labor Statistics',
    feature2Desc: 'Statistical analysis of temporary labor attendance and cost data in construction projects, helping contractors track labor usage in real-time.',
    feature3Title: 'Quality Inspection',
    feature3Desc: 'Quality management and self-inspection during construction phase, real-time recording, defect statistics, and generate inspection reports.',
    feature4Title: 'Smart Daily Reports',
    feature4Desc: 'Digitalize construction daily reports, integrate material and anomaly management, improve management efficiency through cloud analysis.',
    feature5Title: 'Floor Plan Generation',
    feature5Desc: 'Automatically generate residential floor plans through AI algorithms, quickly produce concept layouts that comply with regulations.',
    aboutTitle: 'About This System',
    aboutText1: '(To be edited)',
    aboutText2: '(To be edited)',
    stat1Number: '(To be edited)',
    stat1Label: '(To be edited)',
    stat2Number: '(To be edited)',
    stat2Label: '(To be edited)',
    stat3Number: '(To be edited)',
    stat3Label: '(To be edited)'
  },

  tools: {
    title: 'Construction Management Tools',
    subtitle: 'Select the tool you need',
    planning: 'Schedule Planning',
    planningDesc: 'Use the Critical Path Method (CPM) for project schedule planning, calculate earliest/latest times, and identify critical activities.',
    tct: 'Time-Cost Trade-off Optimizer',
    tctDesc: 'Find the optimal time-cost balance through crashing analysis, calculate crashing plans for each activity, provide cost-time trade-off curves and Pareto optimal solutions to help project managers make the best decisions.',
    labor: 'Temporary Labor Statistics',
    laborDesc: 'This system is used for statistical analysis of temporary labor attendance and cost data in construction projects, integrating cloud and mobile device operations to help contractors track labor usage in real-time and automatically compile historical data to support budget estimation and decision analysis.',
    quality: 'Quality Inspection',
    qualityDesc: 'This system is used for quality management and self-inspection during the construction phase, integrating form creation, query, completion, and reporting functions through computers and mobile devices to help on-site real-time recording, defect statistics, and generate inspection and progress reports, improving quality management efficiency and data integrity.',
    report: 'Smart Daily Report Management',
    reportDesc: 'This system digitizes traditional construction daily reports, integrates site material and anomaly management, can track material discrepancies, schedule anomalies, and site conditions in real-time, and improves project management efficiency and accuracy through cloud data connection and analysis, achieving intelligent, zero-delay construction management.',
    floorplan: 'Automatic Floor Plan Generation',
    floorplanDesc: 'This system automatically generates residential floor plans through AI and algorithms, automatically configures corridor, core, and residential unit proportions based on user input of site area, floor area ratio, and number of units, quickly producing concept layouts that comply with regulations and are feasible.',
    learnMore: 'Learn More',
    comingSoon: 'Coming Soon'
  },

  planning: {
    title: 'Schedule Planning',
    backButton: '← Back to Tools',
    importCSV: 'Import CSV',
    downloadTemplate: 'Download Template',
    exportTasks: 'Export Tasks',
    exportResults: 'Export Results',
    exportReport: 'Export Report',
    dataInput: 'Data Input',
    addedTasks: 'Added Tasks',
    taskName: 'Task Name',
    duration: 'Duration',
    startDate: 'Start Time',
    endDate: 'End Time',
    resources: 'Resources',
    resourceName: 'Resource Name',
    resourceQuantity: 'Quantity',
    unitPrice: 'Unit Price',
    totalCost: 'Cost',
    addResource: 'Add Resource',
    predecessors: 'Predecessors',
    successors: 'Successors',
    addTask: 'Add Task',
    update: 'Update',
    calculate: 'Calculate',
    mergeDuplicates: 'Merge Duplicates',
    clearData: 'Clear Data',
    clearAll: 'Clear All',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    noTasks: 'No tasks added yet',
    barChart: 'Bar Chart',
    pdm: 'PDM',
    resetView: 'Reset View',
    standardMode: 'Task Order',
    criticalMode: 'Critical Priority',
    emptyChart: 'No data to display. Please add tasks and calculate schedule',
    criticalTasks: 'Critical Tasks',
    normalTasks: 'Normal Tasks',
    detailedMode: 'Detailed Mode',
    simpleMode: 'Simple Mode',
    days: 'd',
    resetDiagram: 'Reset View',
    autoFit: 'Auto Fit'
  },

  contact: {
    title: 'Contact Information',
    intro: 'Thank you for visiting our website. If you have any questions, suggestions, or technical issues about this system, please feel free to contact us through the following methods, and we will reply as soon as possible.',
    contactMethodTitle: 'Contact Methods',
    unit: 'Unit:',
    address: 'Address:',
    email: 'Email:',
    phone: 'Phone:',
    phoneValue: 'Not Available',
    advisor: 'Advisor:',
    advisorName: 'Not Available',
    version: 'Version: v1.2 | Last Updated: October 2025'
  },

  cpmResult: {
    summary: 'Calculation Summary',
    totalDuration: 'Total Project Duration',
    criticalCount: 'Critical Activities',
    normalCount: 'Normal Activities',
    detailedResults: 'Detailed Results',
    taskName: 'Task Name',
    duration: 'Duration',
    es: 'ES',
    ef: 'EF',
    ls: 'LS',
    lf: 'LF',
    tf: 'TF',
    ff: 'FF',
    critical: 'Critical',
    errorTitle: 'Error Message',
    cycleDetected: 'Cycle Detected',
    cycleDesc: 'A cycle exists in the dependencies, CPM calculation cannot be completed. Please check and correct the dependencies of the following tasks:',
    affectedTasks: 'Affected Tasks'
  },

  messages: {
    taskAdded: 'Task added',
    taskUpdated: 'Task updated',
    taskDeleted: 'Task deleted',
    tasksMerged: 'Duplicate tasks merged',
    tasksCleared: 'All tasks cleared',
    calculationComplete: 'CPM calculation complete',
    importSuccess: 'File imported successfully',
    exportSuccess: 'Export successful',
    error: 'An error occurred'
  },

  importDialog: {
    title: 'Import CSV File',
    description: 'Select a CSV file containing task data. The file should include the following fields: Task Name, Duration (days), Predecessors, Successors',
    cancel: 'Cancel'
  },

  tct: {
    title: 'Time-Cost Trade-off Optimizer',
    backButton: '← Back to Tools',
    subtitle: 'Time-Cost Trade-off Optimizer',
    description: 'Find the optimal time-cost balance through crashing analysis',
    
    // 📊 Input Section
    inputSection: 'Task Data Input',
    taskName: 'Task Name',
    normalDuration: 'Normal Duration',
    crashDuration: 'Crash Duration',
    normalCost: 'Normal Cost',
    crashCost: 'Crash Cost',
    predecessors: 'Predecessors',
    addTask: 'Add Task',
    importData: 'Import CSV',
    exportData: 'Export CSV',
    exportResults: 'Export Results',
    downloadTemplate: 'Download Template',
    clearAll: 'Clear All',
    
    // 📋 Task List
    taskListTitle: 'Added Tasks',
    noTasks: 'No tasks added yet',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    
    // 🎯 Project Parameters
    projectParams: 'Project Parameters',
    overheadCostPerDay: 'Overhead Cost',
    penaltyCostPerDay: 'Delay Penalty',
    deadline: 'Contract Duration',
    budget: 'Budget Limit',
    calculate: 'Calculate',
    
    // 📊 Results
    resultsTitle: 'Optimization Results',
    noResults: 'No results yet. Please add tasks and set parameters',
    optimalDuration: 'Optimal Duration',
    optimalCost: 'Optimal Cost',
    costBreakdown: 'Cost Breakdown',
    overheadCost: 'Overhead Cost',
    reduced: 'Reduced',
    
    // 📈 Execution Plan
    executionPlan: 'Execution Plan',
    startTime: 'Start Time',
    actualDuration: 'Actual Duration',
    crashDays: 'Crash Days',
    critical: 'Critical',
    total: 'Total',
    
    // 📊 Crash Plan
    crashPlan: 'Crash Plan',
    iterationColumn: 'Iteration',
    durationColumn: 'Duration',
    crashedTaskColumn: 'Crashed Task',
    directCostColumn: 'Direct Cost',
    indirectCostColumn: 'Indirect Cost',
    penaltyCostColumn: 'Penalty Cost',
    totalCostColumn: 'Total Cost',
    iterationLabel: 'Iteration {n}',
    normalState: 'Normal',
    
    // 🔗 Critical Path
    criticalPath: 'Critical Path',
    
    // 📉 Cost-Time Curve
    costTimeCurve: 'Cost-Time Trade-off Curve',
    optimalPoint: 'Optimal Point',
    normalPoint: 'Normal Point',
    duration: 'Duration (days)',
    cost: 'Cost ($)',
    
    // ⚠️ Error Messages
    errorInvalidData: 'Data validation failed',
    errorNoCriticalPath: 'Unable to calculate critical path',
    errorInfeasible: 'No feasible solution',
    errorBudgetTooLow: 'Budget insufficient to complete project',
    errorDurationTooShort: 'Target duration cannot be achieved',
    
    // 💡 Tips
    tipNormalDuration: 'Work days required under normal circumstances',
    tipCrashDuration: 'Shortest duration achievable by adding resources or overtime',
    tipNormalCost: 'Total cost required at normal duration',
    tipCrashCost: 'Total cost required at crash duration',
    tipOverheadCost: 'Indirect cost per project day (management, rent, personnel, etc.)',
    tipPenaltyCost: 'Penalty per day delayed (relative to contract duration)',
    tipDeadline: 'Contract deadline for project completion (days)',
    startByAdding: 'Please add task data to get started',
    
    // 📊 Units
    days: 'days',
    currency: '$',
    perDay: '$/day'
  },

  footer: {
    copyright: '© 2025 Construction Planning and Scheduling Learning Assistant v1.2',
    designedBy: 'Designed by: Department of Construction Engineering, EB502, National Yunlin University of Science and Technology'
  }
}

export default enUS

