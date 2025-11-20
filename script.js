// ------------------------------
// ✅ Import Firebase (v9+ Modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ------------------------------
// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPp06jbe8TUqpzuUycTa8WH16mwTQ5EwQ",
  authDomain: "anisan-dc9c3.firebaseapp.com",
  databaseURL: "https://anisan-dc9c3-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "anisan-dc9c3",
  storageBucket: "anisan-dc9c3.firebasestorage.app",
  messagingSenderId: "350346521241",
  appId: "1:350346521241:web:3aa27cf98741155b782608",
  measurementId: "G-378K7N182Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ------------------------------
// Database References
const telemetryRef = ref(db, "telemetry/device01");
const commandRef = ref(db, "commands/device01");

// ------------------------------
// DOM Elements
const pumpSwitch = document.getElementById("pumpSwitch");
const runtime = document.getElementById("runtime");
const waterFill = document.querySelector(".water-fill");
const waterText = document.querySelector(".water-text");
const flowCircle = document.querySelector(".circle");
const modeToggle = document.getElementById("modeToggle");
const aiRecommendation = document.getElementById("ai-recommendation");
const aiWaterLimit = document.getElementById("aiWaterLimit");
const batteryEl = document.getElementById("battery");
const solarEl = document.getElementById("solar");
const weatherEl = document.getElementById("weather");
const clockEl = document.getElementById("clock");
const statusText = document.getElementById("pumpStatus");
const statusDot = document.getElementById("statusDot");
const pumpStatusText = document.getElementById("pumpStatusText");

// ------------------------------
// 📊 MULTIPLE CHARTS WITH SWIPE NAVIGATION
let currentChartIndex = 0;
const chartCanvases = [
  document.getElementById("dataChart"),
  document.getElementById("batteryChart"),
  document.getElementById("solarChart")
];

const chartContainers = [
  document.querySelector(".chart-container"),
  document.querySelector(".battery-chart-container"),
  document.querySelector(".solar-chart-container")
];

// Initialize all charts
const ctx1 = chartCanvases[0]?.getContext("2d");
const ctx2 = chartCanvases[1]?.getContext("2d");
const ctx3 = chartCanvases[2]?.getContext("2d");

// Chart 1: Water Level + Flow Rate
const dataChart = ctx1 ? new Chart(ctx1, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Water Level (%)",
        data: [],
        borderColor: "#00bcd4",
        backgroundColor: "rgba(0,188,212,0.1)",
        tension: 0.3,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: "Flow Rate (L/min)",
        data: [],
        borderColor: "limegreen",
        backgroundColor: "rgba(50,205,50,0.1)",
        tension: 0.3,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        max: 100,
        ticks: { color: "#ccc" }
      },
      y1: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        max: 10,
        grid: { drawOnChartArea: false },
        ticks: { color: "limegreen" }
      },
      x: {
        ticks: { color: "#ccc" }
      }
    },
    plugins: { 
      legend: { labels: { color: "#fff" } }
    },
    animation: {
      duration: 0
    }
  }
}) : null;

// Chart 2: Battery Level
const batteryChart = ctx2 ? new Chart(ctx2, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Battery Level (%)",
        data: [],
        borderColor: "#ffd700",
        backgroundColor: "rgba(255,215,0,0.1)",
        tension: 0.3,
        fill: true
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: "#ccc" }
      },
      x: {
        ticks: { color: "#ccc" }
      }
    },
    plugins: { 
      legend: { labels: { color: "#fff" } }
    },
    animation: {
      duration: 0
    }
  }
}) : null;

// Chart 3: Solar Power
const solarChart = ctx3 ? new Chart(ctx3, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Solar Power (%)",
        data: [],
        borderColor: "#ff6b6b",
        backgroundColor: "rgba(255,107,107,0.1)",
        tension: 0.3,
        fill: true
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: "#ccc" }
      },
      x: {
        ticks: { color: "#ccc" }
      }
    },
    plugins: { 
      legend: { labels: { color: "#fff" } }
    },
    animation: {
      duration: 0
    }
  }
}) : null;

// Chart navigation indicators
function updateChartIndicators() {
  const indicators = document.querySelectorAll('.chart-indicator');
  indicators.forEach((ind, idx) => {
    if (idx === currentChartIndex) {
      ind.classList.add('active');
    } else {
      ind.classList.remove('active');
    }
  });
}

// Show specific chart with slide animation
function showChart(index, direction = 'left') {
  const currentContainer = chartContainers[currentChartIndex];
  const nextContainer = chartContainers[index];
  
  if (!currentContainer || !nextContainer || currentChartIndex === index) return;
  
  // Set initial position for next chart
  if (direction === 'left') {
    nextContainer.style.transform = 'translateX(100%)';
  } else {
    nextContainer.style.transform = 'translateX(-100%)';
  }
  
  nextContainer.style.display = 'block';
  nextContainer.style.opacity = '1';
  
  // Force reflow
  nextContainer.offsetHeight;
  
  // Animate current chart out
  if (direction === 'left') {
    currentContainer.style.transform = 'translateX(-100%)';
  } else {
    currentContainer.style.transform = 'translateX(100%)';
  }
  currentContainer.style.opacity = '0';
  
  // Animate next chart in
  nextContainer.style.transform = 'translateX(0)';
  
  // After animation completes, hide the old chart
  setTimeout(() => {
    currentContainer.style.display = 'none';
    currentContainer.style.transform = 'translateX(0)';
    currentContainer.style.opacity = '1';
  }, 400);
  
  currentChartIndex = index;
  updateChartIndicators();
  updateArrowButtons();
}

// Update arrow button states
function updateArrowButtons() {
  const leftArrow = document.getElementById('chartArrowLeft');
  const rightArrow = document.getElementById('chartArrowRight');
  
  if (leftArrow) {
    if (currentChartIndex === 0) {
      leftArrow.style.opacity = '0.3';
      leftArrow.style.cursor = 'not-allowed';
      leftArrow.disabled = true;
    } else {
      leftArrow.style.opacity = '1';
      leftArrow.style.cursor = 'pointer';
      leftArrow.disabled = false;
    }
  }
  
  if (rightArrow) {
    if (currentChartIndex === 2) {
      rightArrow.style.opacity = '0.3';
      rightArrow.style.cursor = 'not-allowed';
      rightArrow.disabled = true;
    } else {
      rightArrow.style.opacity = '1';
      rightArrow.style.cursor = 'pointer';
      rightArrow.disabled = false;
    }
  }
}

// Arrow navigation
function setupArrowNavigation() {
  const leftArrow = document.getElementById('chartArrowLeft');
  const rightArrow = document.getElementById('chartArrowRight');
  
  if (leftArrow) {
    leftArrow.addEventListener('click', () => {
      if (currentChartIndex > 0) {
        showChart(currentChartIndex - 1, 'right');
      }
    });
  }
  
  if (rightArrow) {
    rightArrow.addEventListener('click', () => {
      if (currentChartIndex < 2) {
        showChart(currentChartIndex + 1, 'left');
      }
    });
  }
}

// Call setup after DOM is ready
setTimeout(() => {
  setupArrowNavigation();
  updateArrowButtons();
}, 100);

// Swipe navigation for charts
let touchStartX = 0;
let touchEndX = 0;

const chartArea = document.querySelector('.chart-area');
if (chartArea) {
  chartArea.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  chartArea.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  // Mouse swipe support
  let mouseDown = false;
  chartArea.addEventListener('mousedown', (e) => {
    mouseDown = true;
    touchStartX = e.screenX;
  });

  chartArea.addEventListener('mouseup', (e) => {
    if (mouseDown) {
      touchEndX = e.screenX;
      handleSwipe();
      mouseDown = false;
    }
  });

  chartArea.addEventListener('mouseleave', () => {
    mouseDown = false;
  });
}

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next chart
      currentChartIndex = (currentChartIndex + 1) % 3;
    } else {
      // Swipe right - previous chart
      currentChartIndex = (currentChartIndex - 1 + 3) % 3;
    }
    showChart(currentChartIndex);
  }
}

// Chart indicator clicks
document.querySelectorAll('.chart-indicator').forEach((ind, idx) => {
  ind.addEventListener('click', () => {
    showChart(idx);
  });
});

// Initialize - show first chart
showChart(0);

// ------------------------------
// DUST SENSOR LIMIT
const dustLimit = 80;

// ------------------------------
// 🔧 SYSTEM MAINTENANCE MONITORING
let lastDataUpdate = {
  waterLevel: Date.now(),
  flowRate: Date.now(),
  dust: Date.now(),
  battery: Date.now(),
  solar: Date.now()
};

const STALE_DATA_THRESHOLD = 5 * 60 * 1000;
let maintenanceCheckInterval = null;

function checkSystemMaintenance() {
  const now = Date.now();
  let staleParameters = [];

  if (now - lastDataUpdate.waterLevel > STALE_DATA_THRESHOLD) {
    staleParameters.push("Water Level Sensor");
  }
  if (now - lastDataUpdate.flowRate > STALE_DATA_THRESHOLD) {
    staleParameters.push("Flow Rate Sensor");
  }
  if (now - lastDataUpdate.dust > STALE_DATA_THRESHOLD) {
    staleParameters.push("Dust Sensor");
  }
  if (now - lastDataUpdate.battery > STALE_DATA_THRESHOLD) {
    staleParameters.push("Battery Monitor");
  }
  if (now - lastDataUpdate.solar > STALE_DATA_THRESHOLD) {
    staleParameters.push("Solar Panel Monitor");
  }

  if (staleParameters.length > 0) {
    const message = `⚠️ System Maintenance Needed! No data from: ${staleParameters.join(", ")}`;
    
    const alertBox = document.getElementById("alertBox");
    if (alertBox) {
      const maintenanceAlert = `<div class="alert maintenance-alert">${message}</div>`;
      if (!alertBox.innerHTML.includes("System Maintenance Needed")) {
        alertBox.innerHTML += maintenanceAlert;
      }
    }

    if (!window.maintenanceAlertSpoken) {
      speak("System maintenance needed. Please check sensors.");
      window.maintenanceAlertSpoken = true;
    }
  } else {
    window.maintenanceAlertSpoken = false;
  }
}

maintenanceCheckInterval = setInterval(checkSystemMaintenance, 60000);

// ------------------------------
// 🔊 Voice Assistant: Text-to-Speech (Debounced)
let speechQueue = [];
let isSpeaking = false;

function speak(text) {
  if (speechQueue.includes(text) || isSpeaking) return;
  
  speechQueue.push(text);
  
  if (!isSpeaking) {
    speakNext();
  }
}

function speakNext() {
  if (speechQueue.length === 0) {
    isSpeaking = false;
    return;
  }
  
  isSpeaking = true;
  const text = speechQueue.shift();
  
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  msg.pitch = 1;
  msg.rate = 1;
  
  msg.onend = () => {
    isSpeaking = false;
    speakNext();
  };
  
  msg.onerror = () => {
    isSpeaking = false;
    speakNext();
  };
  
  speechSynthesis.speak(msg);
}

// ------------------------------
// Clock
function updateClock() {
  const now = new Date();
  const date = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const time = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  if(clockEl) clockEl.textContent = `${date} | ${time}`;
}
setInterval(updateClock, 1000);
updateClock();

// ------------------------------
// Chart History Handling
let historyData = {
  water: [],
  flow: [],
  battery: [],
  solar: [],
  labels: [],
  timestamps: []
};
let currentRange = "24h";
let chartUpdateThrottle = null;

// ------------------------------
// 📦 PERSISTENT HISTORY STORAGE IN FIREBASE
const historyRef = ref(db, "history/device01");
const MAX_HISTORY_POINTS = 1000;

async function loadHistoryFromFirebase() {
  try {
    const snapshot = await new Promise((resolve, reject) => {
      onValue(historyRef, resolve, { onlyOnce: true });
    });
    
    const data = snapshot.val();
    if (data && data.dataPoints) {
      console.log("Loading history from Firebase:", data.dataPoints.length, "points");
      
      historyData.water = data.dataPoints.map(p => p.water || 0);
      historyData.flow = data.dataPoints.map(p => p.flow || 0);
      historyData.battery = data.dataPoints.map(p => p.battery || 0);
      historyData.solar = data.dataPoints.map(p => p.solar || 0);
      historyData.timestamps = data.dataPoints.map(p => p.timestamp || Date.now());
      
      updateAllCharts(currentRange);
      console.log("History loaded successfully");
    } else {
      console.log("No history found in Firebase, starting fresh");
    }
  } catch (error) {
    console.error("Error loading history:", error);
  }
}

let saveHistoryTimeout = null;
function saveHistoryToFirebase() {
  if (saveHistoryTimeout) {
    clearTimeout(saveHistoryTimeout);
  }
  
  saveHistoryTimeout = setTimeout(async () => {
    try {
      const startIndex = Math.max(0, historyData.water.length - MAX_HISTORY_POINTS);
      
      const dataPoints = [];
      for (let i = startIndex; i < historyData.water.length; i++) {
        dataPoints.push({
          water: historyData.water[i],
          flow: historyData.flow[i],
          battery: historyData.battery[i],
          solar: historyData.solar[i],
          timestamp: historyData.timestamps[i]
        });
      }
      
      await update(historyRef, {
        dataPoints: dataPoints,
        lastUpdate: Date.now()
      });
      
      console.log("History saved to Firebase:", dataPoints.length, "points");
    } catch (error) {
      console.error("Error saving history:", error);
    }
  }, 10000);
}

function cleanOldHistory() {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  let cleanedCount = 0;
  while (historyData.timestamps.length > 0 && historyData.timestamps[0] < thirtyDaysAgo) {
    historyData.water.shift();
    historyData.flow.shift();
    historyData.battery.shift();
    historyData.solar.shift();
    historyData.timestamps.shift();
    cleanedCount++;
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleaned ${cleanedCount} old data points (older than 30 days)`);
    saveHistoryToFirebase();
  }
}

loadHistoryFromFirebase();
setInterval(cleanOldHistory, 60 * 60 * 1000);

// ------------------------------
// 🤖 AI PREDICTIVE ANALYTICS
let predictionData = {
  lastPredictionTime: 0,
  waterTrend: [],
  flowTrend: []
};

function calculateWaterLevelPrediction() {
  if (historyData.water.length < 10) return null;
  
  const recentData = historyData.water.slice(-10);
  const recentTimestamps = historyData.timestamps.slice(-10);
  
  let totalChange = 0;
  let validIntervals = 0;
  
  for (let i = 1; i < recentData.length; i++) {
    const timeDiff = (recentTimestamps[i] - recentTimestamps[i-1]) / 1000;
    if (timeDiff > 0) {
      const waterChange = recentData[i] - recentData[i-1];
      totalChange += waterChange / timeDiff;
      validIntervals++;
    }
  }
  
  if (validIntervals === 0) return null;
  
  const avgRatePerSecond = totalChange / validIntervals;
  const currentLevel = recentData[recentData.length - 1];
  
  return {
    currentLevel: currentLevel,
    ratePerSecond: avgRatePerSecond,
    ratePerMinute: avgRatePerSecond * 60,
    ratePerHour: avgRatePerSecond * 3600
  };
}

function predictOverflowTime(prediction) {
  if (!prediction || prediction.ratePerSecond <= 0) return null;
  
  const currentLevel = prediction.currentLevel;
  const criticalLevel = 95;
  const warningLevel = 85;
  
  if (currentLevel >= criticalLevel) return { type: 'critical', minutes: 0 };
  
  const remainingToWarning = warningLevel - currentLevel;
  const remainingToCritical = criticalLevel - currentLevel;
  
  const minutesToWarning = remainingToWarning / prediction.ratePerMinute;
  const minutesToCritical = remainingToCritical / prediction.ratePerMinute;
  
  if (minutesToCritical > 1440) return null;
  
  if (currentLevel >= warningLevel) {
    return {
      type: 'warning',
      minutes: minutesToCritical,
      currentLevel: currentLevel,
      rate: prediction.ratePerMinute
    };
  } else if (minutesToWarning <= 60) {
    return {
      type: 'early_warning',
      minutes: minutesToWarning,
      criticalMinutes: minutesToCritical,
      currentLevel: currentLevel,
      rate: prediction.ratePerMinute
    };
  }
  
  return null;
}

function predictLowWaterTime(prediction) {
  if (!prediction || prediction.ratePerSecond >= 0) return null;
  
  const currentLevel = prediction.currentLevel;
  const criticalLevel = 20;
  const warningLevel = 30;
  
  if (currentLevel <= criticalLevel) return { type: 'critical', minutes: 0 };
  
  const remainingToWarning = currentLevel - warningLevel;
  const remainingToCritical = currentLevel - criticalLevel;
  
  const minutesToWarning = remainingToWarning / Math.abs(prediction.ratePerMinute);
  const minutesToCritical = remainingToCritical / Math.abs(prediction.ratePerMinute);
  
  if (minutesToCritical > 1440) return null;
  
  if (currentLevel <= warningLevel) {
    return {
      type: 'warning',
      minutes: minutesToCritical,
      currentLevel: currentLevel,
      rate: prediction.ratePerMinute
    };
  } else if (minutesToWarning <= 60) {
    return {
      type: 'early_warning',
      minutes: minutesToWarning,
      criticalMinutes: minutesToCritical,
      currentLevel: currentLevel,
      rate: prediction.ratePerMinute
    };
  }
  
  return null;
}

function formatTimeRemaining(minutes) {
  if (minutes < 1) return "less than 1 minute";
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 1) return mins > 0 ? `1 hour ${mins} min` : "1 hour";
  return mins > 0 ? `${hours} hours ${mins} min` : `${hours} hours`;
}

function updateAIPredictiveInsights() {
  const now = Date.now();
  
  if (now - predictionData.lastPredictionTime < 30000) return;
  predictionData.lastPredictionTime = now;
  
  const prediction = calculateWaterLevelPrediction();
  if (!prediction) return;
  
  const aiAlertDiv = document.getElementById("aiAlert");
  if (!aiAlertDiv) return;
  
  let alerts = [];
  
  const overflowPrediction = predictOverflowTime(prediction);
  if (overflowPrediction) {
    if (overflowPrediction.type === 'critical') {
      alerts.push({
        icon: '🚨',
        level: 'critical',
        message: `CRITICAL: Water level at ${overflowPrediction.currentLevel}% - Overflow imminent!`
      });
    } else if (overflowPrediction.type === 'warning') {
      alerts.push({
        icon: '⚠️',
        level: 'warning',
        message: `WARNING: Water rising at ${Math.abs(overflowPrediction.rate).toFixed(2)}%/min. Will reach 95% in ${formatTimeRemaining(overflowPrediction.minutes)}`
      });
    } else if (overflowPrediction.type === 'early_warning') {
      alerts.push({
        icon: '📊',
        level: 'info',
        message: `AI Prediction: Water rising at ${Math.abs(overflowPrediction.rate).toFixed(2)}%/min. Will reach 85% in ${formatTimeRemaining(overflowPrediction.minutes)} and 95% in ${formatTimeRemaining(overflowPrediction.criticalMinutes)}`
      });
    }
  }
  
  const lowWaterPrediction = predictLowWaterTime(prediction);
  if (lowWaterPrediction) {
    if (lowWaterPrediction.type === 'critical') {
      alerts.push({
        icon: '🚨',
        level: 'critical',
        message: `CRITICAL: Water level at ${lowWaterPrediction.currentLevel}% - Dry run risk!`
      });
    } else if (lowWaterPrediction.type === 'warning') {
      alerts.push({
        icon: '⚠️',
        level: 'warning',
        message: `WARNING: Water dropping at ${Math.abs(lowWaterPrediction.rate).toFixed(2)}%/min. Will reach 20% in ${formatTimeRemaining(lowWaterPrediction.minutes)}`
      });
    } else if (lowWaterPrediction.type === 'early_warning') {
      alerts.push({
        icon: '📊',
        level: 'info',
        message: `AI Prediction: Water dropping at ${Math.abs(lowWaterPrediction.rate).toFixed(2)}%/min. Will reach 30% in ${formatTimeRemaining(lowWaterPrediction.minutes)} and 20% in ${formatTimeRemaining(lowWaterPrediction.criticalMinutes)}`
      });
    }
  }
  
  if (alerts.length > 0) {
    aiAlertDiv.classList.remove("hidden");
    aiAlertDiv.innerHTML = alerts.map(alert => `
      <div class="ai-prediction ${alert.level}">
        <span class="prediction-icon">${alert.icon}</span>
        <span class="prediction-text">${alert.message}</span>
      </div>
    `).join('');
    
    if (alerts.some(a => a.level === 'critical' || a.level === 'warning')) {
      const criticalAlert = alerts.find(a => a.level === 'critical' || a.level === 'warning');
      if (criticalAlert && !window.lastPredictionAlert) {
        speak(criticalAlert.message.replace(/🚨|⚠️|📊/g, ''));
        window.lastPredictionAlert = criticalAlert.message;
        
        setTimeout(() => {
          window.lastPredictionAlert = null;
        }, 300000);
      }
    }
  } else {
    if (prediction.ratePerMinute > 0.1) {
      aiAlertDiv.classList.remove("hidden");
      aiAlertDiv.innerHTML = `
        <div class="ai-prediction normal">
          <span class="prediction-icon">📈</span>
          <span class="prediction-text">Water level stable and rising at ${prediction.ratePerMinute.toFixed(2)}%/min</span>
        </div>
      `;
    } else if (prediction.ratePerMinute < -0.1) {
      aiAlertDiv.classList.remove("hidden");
      aiAlertDiv.innerHTML = `
        <div class="ai-prediction normal">
          <span class="prediction-icon">📉</span>
          <span class="prediction-text">Water level stable and dropping at ${Math.abs(prediction.ratePerMinute).toFixed(2)}%/min</span>
        </div>
      `;
    } else {
      aiAlertDiv.classList.add("hidden");
    }
  }
}

function generateLabels(range) {
  const labels = [];
  const now = Date.now();
  
  if(range === "1h") {
    for(let i=59;i>=0;i--){
      const d = new Date(now - i*60*1000);
      labels.push(d.getHours()+":"+String(d.getMinutes()).padStart(2,'0'));
    }
  } else if(range === "24h") {
    for(let i=23;i>=0;i--){
      const d = new Date(now - i*60*60*1000);
      labels.push(d.getHours()+":00");
    }
  } else if(range === "7d") {
    for(let i=6;i>=0;i--){
      const d = new Date(now - i*24*60*60*1000);
      labels.push(d.toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short'}));
    }
  } else if(range === "30d") {
    for(let i=29;i>=0;i--){
      const d = new Date(now - i*24*60*60*1000);
      labels.push(d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'}));
    }
  }
  return labels;
}

function aggregateDataForTimeRange(range, dataType) {
  const now = Date.now();
  let timeWindowMs, bucketSizeMs, bucketCount;
  
  if (range === "1h") {
    timeWindowMs = 60 * 60 * 1000;
    bucketSizeMs = 60 * 1000;
    bucketCount = 60;
  } else if (range === "24h") {
    timeWindowMs = 24 * 60 * 60 * 1000;
    bucketSizeMs = 60 * 60 * 1000;
    bucketCount = 24;
  } else if (range === "7d") {
    timeWindowMs = 7 * 24 * 60 * 60 * 1000;
    bucketSizeMs = 24 * 60 * 60 * 1000;
    bucketCount = 7;
  } else if (range === "30d") {
    timeWindowMs = 30 * 24 * 60 * 60 * 1000;
    bucketSizeMs = 24 * 60 * 60 * 1000;
    bucketCount = 30;
  }
  
  const cutoffTime = now - timeWindowMs;
  const buckets = new Array(bucketCount).fill(null).map(() => []);
  const sourceData = historyData[dataType] || [];
  
  // Collect all data points within the time window
  for (let i = 0; i < historyData.timestamps.length; i++) {
    const timestamp = historyData.timestamps[i];
    
    if (timestamp >= cutoffTime && sourceData[i] !== undefined && sourceData[i] !== null) {
      // Calculate which bucket this timestamp belongs to
      const timeSinceStart = timestamp - cutoffTime;
      const bucketIndex = Math.floor(timeSinceStart / bucketSizeMs);
      
      // Ensure bucket index is within valid range
      if (bucketIndex >= 0 && bucketIndex < bucketCount) {
        buckets[bucketIndex].push(sourceData[i]);
      }
    }
  }
  
  // Calculate average for each bucket, or use last known value for empty buckets
  const aggregatedData = [];
  let lastKnownValue = null;
  
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i].length > 0) {
      // Calculate average of all values in this bucket
      const sum = buckets[i].reduce((a, b) => a + b, 0);
      const avg = sum / buckets[i].length;
      lastKnownValue = avg;
      aggregatedData.push(Number(avg.toFixed(2)));
    } else {
      // Use last known value or 0
      aggregatedData.push(lastKnownValue !== null ? lastKnownValue : 0);
    }
  }
  
  return aggregatedData;
}

function updateAllCharts(range) {
  if (chartUpdateThrottle) return;
  
  chartUpdateThrottle = setTimeout(() => {
    const labels = generateLabels(range);
    
    // Update Water/Flow Chart
    if (dataChart) {
      dataChart.data.labels = labels;
      dataChart.data.datasets[0].data = aggregateDataForTimeRange(range, 'water');
      dataChart.data.datasets[1].data = aggregateDataForTimeRange(range, 'flow');
      dataChart.update('none');
    }
    
    // Update Battery Chart
    if (batteryChart) {
      batteryChart.data.labels = labels;
      batteryChart.data.datasets[0].data = aggregateDataForTimeRange(range, 'battery');
      batteryChart.update('none');
    }
    
    // Update Solar Chart
    if (solarChart) {
      solarChart.data.labels = labels;
      solarChart.data.datasets[0].data = aggregateDataForTimeRange(range, 'solar');
      solarChart.update('none');
    }
    
    chartUpdateThrottle = null;
  }, 100);
}

// ------------------------------
// History Buttons
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', ()=>{
    currentRange = btn.dataset.time;
    document.querySelectorAll('.time-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    updateAllCharts(currentRange);
  });
});

// ------------------------------
// Alert System (Debounced)
let lastAlerts = [];
let lastAlertCheck = 0;

function updateAlerts(water, flow, pump, dust) {
  const now = Date.now();
  if (now - lastAlertCheck < 2000) return;
  lastAlertCheck = now;
  
  const alertBox = document.getElementById("alertBox");
  let alerts = [];

  if (pump === "ON" && flow === 0) {
    alerts.push("⛔ Dry Run detected. Pump has been auto stopped.");
    update(telemetryRef, { pumpStatus: "OFF" });
    pumpSwitch.checked = false;
    statusText.textContent = "STANDBY";
    statusText.style.color = "red";
  }

  if (water < 20) {
    alerts.push("⚠️ Low Water Level. Source water is insufficient.");
  }

  if (water > 95) {
    alerts.push("🚨 Overflow Warning. Tank is almost full.");
  }

  if (dust > dustLimit) {
    alerts.push("⚠️ High Dust Detected! Please clean the sensor.");
  }

  if (alerts.length === 0) {
    alertBox.innerHTML = `<div class="ok-status">✅ All systems normal</div>`;
    lastAlerts = [];
    stopRepeatingAlert();
    return;
  }

  alertBox.innerHTML = alerts
    .map(a => `<div class="alert">${a}</div>`)
    .join("");

  alerts.forEach(alert => {
    if (!lastAlerts.includes(alert)) {
      speak(alert);
    }
  });

  lastAlerts = alerts;
}

// ------------------------------
// Real-time Telemetry Listener (Optimized)
let lastTelemetryData = {};

onValue(telemetryRef, (snapshot)=>{
  const data = snapshot.val();
  if(!data) return;

  const pump = data.pumpStatus || "OFF";
  const water = Number(data.waterLevel) || 0;
  const flow = Number(data.flowRate) || 0;
  const dust = Number(data.dust) || 0;
  const battery = Number(data.batteryLevelManual) || 0;
  const solar = Number(data.solar) || 0;

  if (data.waterLevel !== undefined) lastDataUpdate.waterLevel = Date.now();
  if (data.flowRate !== undefined) lastDataUpdate.flowRate = Date.now();
  if (data.dust !== undefined) lastDataUpdate.dust = Date.now();
  if (data.batteryLevelManual !== undefined) lastDataUpdate.battery = Date.now();
  if (data.solar !== undefined) lastDataUpdate.solar = Date.now();

  if (lastTelemetryData.pump !== pump) {
    pumpSwitch.checked = pump==="ON";
    statusText.textContent = pump==="ON"?"PUMPING":"STANDBY";
    statusText.style.color = pump==="ON"?"limegreen":"red";
    
    if(statusDot && pumpStatusText) {
      if(pump === "ON") {
        statusDot.classList.remove("off");
        statusDot.classList.add("on");
        pumpStatusText.textContent = "ON";
        pumpStatusText.style.color = "limegreen";
      } else {
        statusDot.classList.remove("on");
        statusDot.classList.add("off");
        pumpStatusText.textContent = "OFF";
        pumpStatusText.style.color = "red";
      }
    }
    
    lastTelemetryData.pump = pump;
  }

  if (lastTelemetryData.water !== water) {
    if(waterFill) waterFill.style.height = `${water}%`;
    if(waterText) waterText.textContent = `${water}%`;
    lastTelemetryData.water = water;
  }
  
  if (lastTelemetryData.flow !== flow) {
    if(flowCircle) flowCircle.innerHTML = `${flow}<br><span>L/min</span>`;
    lastTelemetryData.flow = flow;
  }

  if(pump==="ON" && !timerInterval) startTimer();
  if(pump==="OFF" && timerInterval){ clearInterval(timerInterval); timerInterval=null;}

  historyData.water.push(water);
  historyData.flow.push(flow);
  historyData.battery.push(battery);
  historyData.solar.push(solar);
  historyData.timestamps.push(Date.now());
  
  if (historyData.water.length > MAX_HISTORY_POINTS) {
    historyData.water.shift();
    historyData.flow.shift();
    historyData.battery.shift();
    historyData.solar.shift();
    historyData.timestamps.shift();
  }
  
  saveHistoryToFirebase();
  updateAllCharts(currentRange);
  updateAIPredictiveInsights();
  updateAlerts(water, flow, pump, dust);
  handleAlerts(water, flow, pump, dust);
});

// ------------------------------
// Pump Switch → Update Firebase
pumpSwitch.addEventListener("change", ()=>{
  const newStatus = pumpSwitch.checked?"ON":"OFF";
  update(telemetryRef,{pumpStatus:newStatus});
});

// ------------------------------
// Runtime Timer
let seconds=0, timerInterval;
function startTimer(){
  clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    seconds++;
    const hrs = String(Math.floor(seconds/3600)).padStart(2,'0');
    const mins = String(Math.floor((seconds%3600)/60)).padStart(2,'0');
    const secs = String(seconds%60).padStart(2,'0');
    runtime.textContent=`${hrs}:${mins}:${secs}`;
  },1000);
}

// ------------------------------
// Theme Toggle
modeToggle.addEventListener("click",()=>{
  document.body.classList.toggle("light-mode");
  modeToggle.textContent=document.body.classList.contains("light-mode")?"☀️ Light Mode":"🌙 Dark Mode";
});

// ------------------------------
// Weather + AI
const apiKey="b190a0605344cc4f3af08d0dd473dd25";
const city="kolkata";

async function updateLiveWeather(){
  try{
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await res.json();

    const temp = data.main.temp.toFixed(1);
    const clouds = data.clouds.all;
    const solar = Math.max(0,100-clouds).toFixed(0);

    weatherEl.textContent = `${temp}°C`;
    solarEl.textContent = `${solar}%`;

    update(telemetryRef, { solar: Number(solar) });
    updateAIInsights(data, solar);
  }catch(err){
    console.error("Weather fetch failed:",err);
  }
}

function updateAIInsights(weatherData, solar){
  const weather = weatherData.weather[0].main.toLowerCase();
  let message="";
  if(weather.includes("rain") || weather.includes("storm")){
    message=`🌧️ Rain expected soon — lower water to 40% for safety.`;
    if(aiRecommendation) aiRecommendation.style.background="rgba(255,215,0,0.15)";
  }else if(solar<40){
    message=`⚠️ Low solar (${solar}%). Reduce pumping to save power.`;
    if(aiRecommendation) aiRecommendation.style.background="rgba(255,165,0,0.15)";
  }else{
    message=`✅ Weather clear, system running optimally.`;
    if(aiRecommendation) aiRecommendation.style.background="rgba(50,205,50,0.15)";
  }
  if(aiRecommendation) aiRecommendation.innerHTML=`<strong>AI Recommendation:</strong><br>${message}`;
}

setInterval(updateLiveWeather,60000);
updateLiveWeather();

onValue(ref(db, "telemetry/device01/solar"), (snapshot) => {
  const solar = snapshot.val();
  if(solarEl && solar !== null){
    solarEl.textContent = `${solar}%`;
    lastDataUpdate.solar = Date.now();
  }
});

// ------------------------------
// 🌤️ WEATHER MODAL POPUP
let weatherModalOpen = false;

function createWeatherModal() {
  const modal = document.createElement('div');
  modal.id = 'weatherModal';
  modal.className = 'weather-modal hidden';
  modal.innerHTML = `
    <div class="weather-modal-content">
      <div class="weather-modal-header">
        <h2>🌤️ 7-Day Weather Forecast</h2>
        <button class="weather-close-btn" onclick="closeWeatherModal()">✕</button>
      </div>
      <div id="weatherModalBox" class="weather-modal-body">
        Loading forecast...
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function openWeatherModal() {
  const modal = document.getElementById('weatherModal');
  if (!modal) {
    createWeatherModal();
  }
  
  const modalElement = document.getElementById('weatherModal');
  modalElement.classList.remove('hidden');
  weatherModalOpen = true;
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeatherForecastForModal(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        getWeatherForecastForModal(22.5726, 88.3639);
      }
    );
  } else {
    getWeatherForecastForModal(22.5726, 88.3639);
  }
}

window.closeWeatherModal = function() {
  const modal = document.getElementById('weatherModal');
  if (modal) {
    modal.classList.add('hidden');
    weatherModalOpen = false;
  }
}

document.addEventListener('click', (e) => {
  const modal = document.getElementById('weatherModal');
  if (modal && e.target === modal) {
    closeWeatherModal();
  }
});

async function getWeatherForecastForModal(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    let html = "<div class='forecast-grid'>";

    for (let i = 0; i < data.daily.time.length; i++) {
      const date = new Date(data.daily.time[i]);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const weatherCode = data.daily.weathercode[i];
      const weatherEmoji = getWeatherEmoji(weatherCode);
      
      html += `
      <div class="forecast-card">
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-date">${dateStr}</div>
        <div class="forecast-icon">${weatherEmoji}</div>
        <div class="forecast-temp">${data.daily.temperature_2m_max[i]}° / ${data.daily.temperature_2m_min[i]}°C</div>
        <div class="forecast-rain">💧 ${data.daily.precipitation_probability_max[i]}%</div>
      </div>`;
    }

    html += "</div>";
    const weatherModalBox = document.getElementById("weatherModalBox");
    if(weatherModalBox) weatherModalBox.innerHTML = html;
  } catch(err) {
    console.error("Weather forecast error:", err);
    const weatherModalBox = document.getElementById("weatherModalBox");
    if(weatherModalBox) weatherModalBox.innerHTML = "Unable to load weather forecast";
  }
}

function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}

setTimeout(() => {
  const weatherSpan = document.getElementById('weather');
  if (weatherSpan) {
    weatherSpan.style.cursor = 'pointer';
    weatherSpan.style.textDecoration = 'underline';
    weatherSpan.title = 'Click to see 7-day forecast';
    weatherSpan.addEventListener('click', openWeatherModal);
  }
}, 1000);

// ------------------------------
// AI Water Limit Switch
if(aiWaterLimit) {
  aiWaterLimit.addEventListener("change", ()=>{
    const aiActive = aiWaterLimit.checked;
    if(aiRecommendation) {
      aiRecommendation.innerText = aiActive
        ? "⚙️ AI Restriction Active: Water capped at 40%."
        : "✅ AI Restriction Disabled: Water rises normally.";
    }
    update(telemetryRef, {aiLimit: aiActive});
  });
}

// ------------------------------
// Listen for battery changes in Firebase
onValue(ref(db, "telemetry/device01/batteryLevelManual"), (snapshot) => {
  const battery = snapshot.val();
  if (battery !== null && batteryEl) {
    batteryEl.textContent = `${battery}%`;
    batteryEl.style.color = battery < 20 ? "red" : battery < 50 ? "orange" : "limegreen";
    lastDataUpdate.battery = Date.now();
  }
});

onValue(ref(db, "telemetry/device01/batteryActive"), (snapshot) => {
  const isActive = snapshot.val();
  const batteryStatusEl = document.getElementById("batteryStatus");
  
  if (batteryStatusEl && isActive !== null) {
    if (isActive) {
      batteryStatusEl.textContent = "Active";
      batteryStatusEl.style.color = "limegreen";
      batteryStatusEl.style.fontWeight = "bold";
    } else {
      batteryStatusEl.textContent = "Inactive";
      batteryStatusEl.style.color = "red";
      batteryStatusEl.style.fontWeight = "bold";
    }
  }
});

// ------------------------------
// 🔊 REPEATING VOICE ALERT SYSTEM
let alertInterval = null;
let currentAlertIndex = 0;
let activeAlertMessages = [];

function speakMessage(msg) {
  speak(msg);
}

function startRepeatingAlerts(messages) {
  const messagesString = messages.join("|");
  const oldMessagesString = activeAlertMessages.join("|");
  
  if (messagesString === oldMessagesString && alertInterval) {
    return;
  }

  stopRepeatingAlert();
  activeAlertMessages = [...messages];
  currentAlertIndex = 0;

  if (messages.length === 0) return;

  speakMessage(messages[0]);
  currentAlertIndex = 1;

  alertInterval = setInterval(() => {
    if (activeAlertMessages.length === 0) {
      stopRepeatingAlert();
      return;
    }

    speakMessage(activeAlertMessages[currentAlertIndex]);
    currentAlertIndex = (currentAlertIndex + 1) % activeAlertMessages.length;
  }, 10000);
}

function stopRepeatingAlert() {
  if (alertInterval) {
    clearInterval(alertInterval);
    alertInterval = null;
  }
  activeAlertMessages = [];
  currentAlertIndex = 0;
}

function handleAlerts(waterLevel, flowRate, pumpState, dust) {
  let alertMessages = [];

  if (dust > dustLimit) {
    alertMessages.push("Warning! High dust detected. Please clean the sensor.");
  }

  if (waterLevel < 20) {
    alertMessages.push("Warning! Water level is very low");
  }

  if (waterLevel > 95) {
    alertMessages.push("Alert! Tank overflow risk");
  }

  if (pumpState === "ON" && flowRate < 1) {
    alertMessages.push("Emergency! Dry run detected. Please turn off the pump.");
  }

  if (alertMessages.length > 0) {
    startRepeatingAlerts(alertMessages);
  } else {
    stopRepeatingAlert();
  }
}

// ------------------------------
// 🎤 VOICE COMMANDS (Speech Recognition)
const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  if (voiceStatus) voiceStatus.innerText = "⚠️ Voice control not supported on this browser.";
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  let recognitionActive = false;

  voiceBtn.onclick = () => {
    if (recognitionActive) return;
    
    if(navigator.vibrate) navigator.vibrate(100);
    try {
      recognition.start();
      recognitionActive = true;
      voiceStatus.innerText = "🎙️ Listening...";
    } catch(e) {
      console.log("Recognition already started");
    }
  };

  recognition.onresult = (event) => {
    const voiceText = event.results[event.results.length - 1][0].transcript.toLowerCase();
    console.log("Voice Command:", voiceText);
    voiceStatus.innerText = `🗣️ You said: "${voiceText}"`;

    if (voiceText.includes("turn on pump") || voiceText.includes("pump on") || voiceText.includes("start pump")) {
      update(telemetryRef, { pumpStatus: "ON" });
      speak("Pump turned on");
      voiceStatus.innerText = "✅ Pump turned ON";
    } 
    else if (voiceText.includes("turn off pump") || voiceText.includes("pump off") || voiceText.includes("stop pump")) {
      update(telemetryRef, { pumpStatus: "OFF" });
      speak("Pump turned off");
      voiceStatus.innerText = "🛑 Pump turned OFF";
    } 
    else if (voiceText.includes("what is water level") || voiceText.includes("water level")) {
      onValue(telemetryRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.waterLevel !== undefined) {
          speak(`Current water level is ${data.waterLevel} percent`);
          voiceStatus.innerText = `💧 Water level is ${data.waterLevel}%`;
        }
      }, { onlyOnce: true });
    }
    else if (voiceText.includes("dark mode")) {
      document.body.classList.remove("light-mode");
      modeToggle.textContent = "🌙 Dark Mode";
      speak("Dark mode activated");
      voiceStatus.innerText = "🌙 Switched to Dark Mode";
    } 
    else if (voiceText.includes("light mode")) {
      document.body.classList.add("light-mode");
      modeToggle.textContent = "☀️ Light Mode";
      speak("Light mode activated");
      voiceStatus.innerText = "☀️ Switched to Light Mode";
    }
    else if (voiceText.includes("show last hour") || voiceText.includes("last hour") || voiceText.includes("one hour")) {
      currentRange = "1h";
      updateAllCharts(currentRange);
      document.querySelectorAll('.time-btn').forEach(b=>b.classList.remove('active'));
      const btn = document.querySelector('[data-time="1h"]');
      if(btn) btn.classList.add('active');
      speak("Showing last one hour data");
      voiceStatus.innerText = "📈 Graph switched to Last 1 Hour";
    }
    else if (voiceText.includes("show 24 hours") || voiceText.includes("24 hours") || voiceText.includes("one day") || voiceText.includes("24 hour")) {
      currentRange = "24h";
      updateAllCharts(currentRange);
      document.querySelectorAll('.time-btn').forEach(b=>b.classList.remove('active'));
      const btn = document.querySelector('[data-time="24h"]');
      if(btn) btn.classList.add('active');
      speak("Showing last 24 hours data");
      voiceStatus.innerText = "📊 Graph switched to 24 Hours";
    }
    else if (voiceText.includes("show 7 days") || voiceText.includes("seven days") || voiceText.includes("one week") || voiceText.includes("7 day")) {
      currentRange = "7d";
      updateAllCharts(currentRange);
      document.querySelectorAll('.time-btn').forEach(b=>b.classList.remove('active'));
      const btn = document.querySelector('[data-time="7d"]');
      if(btn) btn.classList.add('active');
      speak("Showing last seven days data");
      voiceStatus.innerText = "📆 Graph switched to 7 Days";
    }
    else if (voiceText.includes("show 30 days") || voiceText.includes("thirty days") || voiceText.includes("one month") || voiceText.includes("30 day")) {
      currentRange = "30d";
      updateAllCharts(currentRange);
      document.querySelectorAll('.time-btn').forEach(b=>b.classList.remove('active'));
      const btn = document.querySelector('[data-time="30d"]');
      if(btn) btn.classList.add('active');
      speak("Showing last thirty days data");
      voiceStatus.innerText = "📅 Graph switched to 30 Days";
    }
    else if (voiceText.includes("translate to hindi") || voiceText.includes("hindi")) {
      changeLanguage("hi");
      speak("Website translated to Hindi");
      voiceStatus.innerText = "🌍 Language changed to Hindi";
    }
    else if (voiceText.includes("translate to bengali") || voiceText.includes("bengali") || voiceText.includes("bangla")) {
      changeLanguage("bn");
      speak("Website translated to Bengali");
      voiceStatus.innerText = "🌍 Language changed to Bengali";
    }
    else if (voiceText.includes("translate to tamil") || voiceText.includes("tamil")) {
      changeLanguage("ta");
      speak("Website translated to Tamil");
      voiceStatus.innerText = "🌍 Language changed to Tamil";
    }
    else if (voiceText.includes("translate to telugu") || voiceText.includes("telugu")) {
      changeLanguage("te");
      speak("Website translated to Telugu");
      voiceStatus.innerText = "🌍 Language changed to Telugu";
    }
    else if (voiceText.includes("translate to english") || voiceText.includes("english")) {
      changeLanguage("en");
      speak("Website translated to English");
      voiceStatus.innerText = "🌍 Language changed to English";
    }
    else {
      speak("Command not recognized");
      voiceStatus.innerText = "⚠️ Command not recognized. Try again!";
    }
  };

  recognition.onerror = (err) => {
    console.error("Voice Error:", err);
    voiceStatus.innerText = "❌ Mic error. Check permissions or browser.";
    recognitionActive = false;
  };

  recognition.onend = () => {
    console.log("Recognition ended");
    recognitionActive = false;
  };
}

function changeLanguage(lang) {
  const select = document.querySelector(".goog-te-combo");
  if (select) {
    select.value = lang;
    select.dispatchEvent(new Event("change"));
  }
}

// ------------------------------
// 🌤️ 7-Day Weather Forecast
async function getWeatherForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    let html = "<table>";

    for (let i = 0; i < data.daily.time.length; i++) {
      const date = new Date(data.daily.time[i]);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      html += `
      <tr>
        <td><b>${dayName}</b></td>
        <td>${data.daily.temperature_2m_max[i]}° / ${data.daily.temperature_2m_min[i]}°C</td>
        <td>Rain: ${data.daily.precipitation_probability_max[i]}%</td>
      </tr>`;
    }

    html += "</table>";
    const weatherBox = document.getElementById("weatherBox");
    if(weatherBox) weatherBox.innerHTML = html;
  } catch(err) {
    console.error("Weather forecast error:", err);
    const weatherBox = document.getElementById("weatherBox");
    if(weatherBox) weatherBox.innerHTML = "Unable to load weather forecast";
  }
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      getWeatherForecast(pos.coords.latitude, pos.coords.longitude);
    },
    () => {
      getWeatherForecast(22.5726, 88.3639);
    }
  );
} else {
  getWeatherForecast(22.5726, 88.3639);
}

// Logout Function
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    window.location.href = 'login.html';
  });
}
