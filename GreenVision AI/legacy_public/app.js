/**
 * GreenVision AI - Frontend Application
 * Platform Aksi Iklim dengan AI Lokal (Ollama)
 * 
 * Fitur:
 * - Multi-section navigation dengan logo centered
 * - Dark/Light mode dengan localStorage
 * - AI Chat dengan Ollama Local LLM
 * - Animasi di semua interaksi
 * - Responsive design (mobile, tablet, desktop)
 * - Toast notifications
 * - Fallback responses jika AI tidak tersedia
 */

// ============================================
// GLOBAL STATE & CONSTANTS
// ============================================

const AppState = {
  currentSection: 'beranda',
  isNavOverlayOpen: false,
  theme: 'light',
  chatHistory: [],
  user: null, // User object when logged in
  api: {
    baseUrl: '', // Relative path
    timeout: 10000
  }
};

const FALLBACK_RESPONSES = {
  climate: [
    '🌍 Berdasarkan prediksi lokal: Suhu meningkat 2-3°C, risiko banjir tinggi di Jabodetabek, kebakaran hutan sedang di Kalimantan.',
    '💨 Analisis emisi CO₂ global menunjukkan peningkatan 0.5% per tahun. Kita perlu aksi lebih cepat untuk dekarbonisasi.',
    '⚠️ Peringatan: Cuaca ekstrim meningkat 40% dalam dekade terakhir. Adaptasi infrastruktur menjadi prioritas.'
  ],
  energy: [
    '⚡ Energi terbarukan Indonesia mencapai 12% dari total produksi. Target 2030 adalah 23%. Kita bisa lebih baik!',
    '☀️ Panel surya di rumah bisa hemat listrik hingga 50%. Investasi 15-25 juta bisa balik modal dalam 5-7 tahun.',
    '💡 Setiap LED yang dipasang menghemat 80% energi vs lampu pijar. Lakukan konversi sekarang!',
    '🌬️ Energi angin Indonesia belum maksimal. Potensi 4,800 MW masih banyak yang belum dimanfaatkan.'
  ],
  environment: [
    '♻️ Sampah plastik di lautan mencapai 80 juta ton per tahun. Mulai dari rumah, pisahkan sampah organik & plastik.',
    '🌳 Reforestasi Indonesia menyerap 50 juta ton CO₂ per tahun. Bayangkan jika kita menanam 1 miliar pohon!',
    '🐠 Terumbu karang kehilangan 30% populasi. Lindungi laut dengan mengurangi limbah plastik & mendukung MPA.',
    '💧 Kualitas air 40% wilayah Indonesia sudah tercemar. Gunakan air bijak, hindari pembuangan limbah sembarangan.'
  ],
  default: [
    '🤖 Saya AI Konsultan GreenVision. Tanyakan tentang iklim, energi terbarukan, atau lingkungan hidup!',
    '🌱 Setiap aksi kecil punya dampak besar. Mari bersama jaga Bumi untuk generasi mendatang.',
    '📚 Tidak memahami pertanyaanmu. Coba ulangi dengan kata kunci: iklim, energi, sampah, atau lingkungan.',
    '🌍 GreenVision AI siap membantu. Tanya tentang mitigasi atau adaptasi perubahan iklim!'
  ]
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌍 GreenVision AI - Initializing...');

  try {
    setupEventListeners();
    restoreTheme();
    checkAuth(); // Check for existing session
    loadChatHistory();

    // Show main app
    const appDiv = document.getElementById('app');
    if (appDiv) {
      appDiv.classList.remove('hidden');
    }

    // Sembunyikan loading screen setelah 2.5s
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    }, 2500);

    // Setup Intersection Observer untuk scroll animations
    setupScrollAnimations();

    console.log('✅ GreenVision AI initialized successfully');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    showToast('❌ Gagal inisialisasi aplikasi');
  }
});

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
  // Logo button - toggle nav overlay
  const logoButton = document.getElementById('logo-button');
  if (logoButton) {
    logoButton.addEventListener('click', toggleNavOverlay);
  }

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Navigation links handled via inline onclick in HTML to prevent double binding
  // document.querySelectorAll('.nav-menu a').forEach...

  // Chat input enter key
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keypress', handleChatKeyPress);
  }

  console.log('✅ Event listeners setup complete');
}

// ============================================
// NAVIGATION
// ============================================

function toggleNavOverlay() {
  AppState.isNavOverlayOpen = !AppState.isNavOverlayOpen;
  const overlay = document.getElementById('nav-overlay');
  const backdrop = document.getElementById('nav-backdrop');

  if (AppState.isNavOverlayOpen) {
    overlay?.classList.add('active');
    backdrop?.classList.add('active');
  } else {
    closeNavOverlay();
  }
}

function closeNavOverlay() {
  AppState.isNavOverlayOpen = false;
  const overlay = document.getElementById('nav-overlay');
  const backdrop = document.getElementById('nav-backdrop');

  overlay?.classList.remove('active');
  backdrop?.classList.remove('active');
}

function navigateTo(event, section) {
  if (event) {
    event.preventDefault();
  }

  // Tutup nav overlay
  closeNavOverlay();

  // Hide semua sections
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.remove('active');
  });

  // Show selected section
  const targetSection = document.getElementById(`section-${section}`);
  if (targetSection) {
    targetSection.classList.add('active');
    AppState.currentSection = section;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  console.log(`📄 Navigasi ke section: ${section}`);
}

// ============================================
// THEME MANAGEMENT
// ============================================

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  AppState.theme = newTheme;

  // Update icon
  const icon = document.querySelector('#theme-toggle i');
  if (icon) {
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  showToast(`🌙 Mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`);
  console.log(`🎨 Tema diubah ke: ${newTheme}`);
}

function restoreTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', theme);
  AppState.theme = theme;

  const icon = document.querySelector('#theme-toggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================

function setupScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    console.warn('⚠️ IntersectionObserver not supported');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe all animate elements
  document.querySelectorAll('.feature-card, .climate-card, .energy-card, .env-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });

  console.log('✅ Scroll animations setup complete');
}

// ============================================
// CARBON CALCULATOR
// ============================================

function calculateFootprint() {
  const activityType = document.getElementById('activity-type')?.value || 'rumah';
  const duration = parseInt(document.getElementById('duration')?.value || 1);

  let baseCarbon = 0;
  let interpretation = '';

  switch (activityType) {
    case 'rumah':
      baseCarbon = 2.4;
      interpretation = `Setara dengan mengendarai mobil sejauh ${5000 * duration} km`;
      break;
    case 'transportasi':
      baseCarbon = 0.4;
      interpretation = `Setara dengan penerbangan jarak pendek ${duration} kali`;
      break;
    case 'industri':
      baseCarbon = 15;
      interpretation = `Emisi industri besar, butuh efisiensi serius`;
      break;
    default:
      baseCarbon = 2.4;
  }

  const totalCarbon = (baseCarbon * duration).toFixed(2);

  const resultEl = document.getElementById('carbon-result');
  const interpEl = document.getElementById('carbon-interpretation');

  if (resultEl) resultEl.textContent = totalCarbon;
  if (interpEl) interpEl.textContent = interpretation;

  console.log(`📊 Jejak karbon dihitung: ${totalCarbon} ton CO₂`);
}

// ============================================
// AI CHAT FUNCTIONALITY
// ============================================

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input || !input.value.trim()) return;

  const message = input.value.trim();
  input.value = '';

  // Add user message
  addChatMessage(message, 'user');

  // Show thinking indicator
  const thinkingMsg = document.createElement('div');
  thinkingMsg.className = 'chat-message ai-message';
  thinkingMsg.innerHTML = '<div class="message-content">🤔 Sedang berpikir...</div>';
  document.getElementById('chat-messages')?.appendChild(thinkingMsg);

  try {
    // Try to get AI response
    const response = await getAIResponse(message);
    thinkingMsg.remove();
    addChatMessage(response, 'ai');
  } catch (error) {
    console.error('Chat error:', error);
    thinkingMsg.remove();
    const fallbackResponse = getRandomFallback(message);
    addChatMessage(fallbackResponse, 'ai');
  }
}

async function getAIResponse(userMessage) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${AppState.api.baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    if (data.reply) {
      return data.reply;
    } else {
      return getRandomFallback(userMessage);
    }
  } catch (error) {
    console.warn('🔄 AI fallback mode:', error.message);
    return getRandomFallback(userMessage);
  }
}

function getRandomFallback(message) {
  // Tentukan kategori berdasarkan keyword
  const msgLower = message.toLowerCase();

  if (msgLower.includes('iklim') || msgLower.includes('cuaca') || msgLower.includes('banjir') || msgLower.includes('kebakaran')) {
    return FALLBACK_RESPONSES.climate[Math.floor(Math.random() * FALLBACK_RESPONSES.climate.length)];
  } else if (msgLower.includes('energi') || msgLower.includes('karbon') || msgLower.includes('surya') || msgLower.includes('listrik')) {
    return FALLBACK_RESPONSES.energy[Math.floor(Math.random() * FALLBACK_RESPONSES.energy.length)];
  } else if (msgLower.includes('sampah') || msgLower.includes('lingkungan') || msgLower.includes('plastik') || msgLower.includes('laut')) {
    return FALLBACK_RESPONSES.environment[Math.floor(Math.random() * FALLBACK_RESPONSES.environment.length)];
  } else {
    return FALLBACK_RESPONSES.default[Math.floor(Math.random() * FALLBACK_RESPONSES.default.length)];
  }
}

function addChatMessage(text, sender) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender === 'user' ? 'user-message' : 'ai-message'}`;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = text;

  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);

  // Save to history
  AppState.chatHistory.push({ text, sender, timestamp: Date.now() });
  saveChatHistory();

  // Auto scroll
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

function insertSuggestion(text) {
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = text;
    input.focus();
  }
}

function saveChatHistory() {
  // Keep last 100 messages
  const history = AppState.chatHistory.slice(-100);
  localStorage.setItem('chatHistory', JSON.stringify(history));
}

function loadChatHistory() {
  try {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      AppState.chatHistory = JSON.parse(saved);
    }
  } catch (error) {
    console.warn('⚠️ Failed to load chat history:', error);
  }
}

// ============================================
// AUTHENTICATION
// ============================================

function checkAuth() {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      AppState.user = JSON.parse(user);
      updateNavAuth();
      console.log('✅ User restored:', AppState.user.email);
    } catch (e) {
      console.error('Failed to parse user', e);
      logout();
    }
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch(`${AppState.api.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      showToast('✅ Registrasi berhasil! Silakan masuk.');
      navigateTo(null, 'login');
    } else {
      showToast(`❌ ${data.message || 'Gagal registrasi'}`);
    }
  } catch (error) {
    console.error('Register error:', error);
    showToast('❌ Terjadi kesalahan sistem');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${AppState.api.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      AppState.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      updateNavAuth();
      showToast(`✅ Selamat datang, ${data.user.nama || 'User'}!`);
      navigateTo(null, 'beranda');
    } else {
      showToast(`❌ ${data.message || 'Gagal login'}`);
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('❌ Terjadi kesalahan sistem');
  }
}

function logout() {
  AppState.user = null;
  localStorage.removeItem('user');
  updateNavAuth();
  showToast('👋 Sampai jumpa!');
  navigateTo(null, 'beranda');
}

function updateNavAuth() {
  const publicNav = document.getElementById('nav-public');
  const authNav = document.getElementById('nav-authenticated');

  if (AppState.user) {
    publicNav?.classList.add('hidden');
    authNav?.classList.remove('hidden');
  } else {
    publicNav?.classList.remove('hidden');
    authNav?.classList.add('hidden');
  }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) {
    console.warn('Toast element not found');
    return;
  }

  const messageEl = toast.querySelector('.toast-message');
  if (messageEl) {
    messageEl.textContent = message;
  }

  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Fungsi helper untuk set feature cards dengan delay
 */
function initializeFeatureCards() {
  const cards = document.querySelectorAll('.feature-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });
}

/**
 * Format number dengan separator ribuan
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Log dengan timestamp
 */
function log(message) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
  console.error('❌ Error:', event.error);
  showToast('❌ Terjadi kesalahan. Coba refresh halaman.');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled rejection:', event.reason);
});

// ============================================
// PERFORMANCE MONITORING
// ============================================

if (window.performance && window.performance.timing) {
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    // Calculate only if loadEventEnd is populated (>0)
    if (perfData.loadEventEnd > 0) {
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log(`⚡ Page load time: ${pageLoadTime}ms`);
    } else {
      // If not yet populated, try again in a moment
      setTimeout(() => {
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Page load time: ${pageLoadTime}ms (delayed check)`);
      }, 0);
    }
  });
}

// ============================================
// STARTUP LOG
// ============================================

console.log('🌍 GreenVision AI Frontend Loaded');
console.log('✨ Features: AI Chat, Dark/Light Mode, Scroll Animations, Responsive Design');
console.log(`📍 Current section: ${AppState.currentSection}`);
console.log(`🎨 Current theme: ${AppState.theme}`);
console.log(`🔗 API Base URL: ${AppState.api.baseUrl}`);
