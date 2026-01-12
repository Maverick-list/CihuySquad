/**
 * EduCerdas AI - Modern Frontend Application
 * Premium Educational Platform with AI
 * Theme: AI for Social Impact – Transforming Education
 */

// ============================================
// GLOBAL STATE MANAGEMENT
// ============================================

const AppState = {
  currentUser: null,
  currentSection: 'home',
  learningProfile: null,
  quizState: {
    startTime: null,
    answers: [],
    currentQuestion: 0,
    questions: []
  },
  accessibilitySettings: {
    dyslexiaMode: false,
    focusMode: false,
    audioMode: false,
    highContrast: false,
    largeText: false
  },
  chatHistory: [],
  api: {
    baseUrl: 'http://localhost:3001'
  },
  theme: 'light'
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎓 EduCerdas AI - Initializing...');
  
  // Initialize UI
  setupEventListeners();
  restoreAccessibilitySettings();
  checkDarkMode();
  initializeAIChat();
  loadStoredProfile();
  
  // Simulate loading completion
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
    }
    const app = document.getElementById('app');
    if (app) app.classList.remove('hidden');
  }, 2500);
  
  console.log('✅ EduCerdas AI initialized successfully');
});

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
  // Navigation
  const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      if (section) showSection(section);
    });
  });
  
  // Menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
      if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
    });
  }
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    });
  }
  
  // Accessibility button
  const accessibilityBtn = document.getElementById('accessibility-btn');
  if (accessibilityBtn) {
    accessibilityBtn.addEventListener('click', openAccessibilityModal);
  }
  
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Close modals when clicking outside
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('accessibility-modal');
    if (modal && e.target === modal) {
      closeAccessibilityModal();
    }
  });
}

// ============================================
// SECTION NAVIGATION
// ============================================

function showSection(sectionName) {
  try {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(`section-${sectionName}`);
    if (section) {
      section.classList.add('active');
      window.scrollTo(0, 0);
    }
    
    // Update nav links
    document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === sectionName) {
        link.classList.add('active');
      }
    });
    
    // Close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    
    AppState.currentSection = sectionName;
    loadSectionContent(sectionName);
  } catch (error) {
    console.error('Error showing section:', error);
    showToast('Terjadi kesalahan saat memuat halaman', 'error');
  }
}

function loadSectionContent(section) {
  switch(section) {
    case 'profile':
      loadProfileSection();
      break;
    case 'learning':
      loadLearningSection();
      break;
    case 'quiz':
      loadQuizSection();
      break;
    case 'progress':
      loadProgressSection();
      break;
  }
}

// ============================================
// PROFILE SECTION
// ============================================

function loadProfileSection() {
  const section = document.getElementById('section-profile');
  if (!section) return;
  
  // Check if content already loaded
  if (section.querySelector('#learning-profile-form')) return;
  
  const learningStyle = AppState.learningProfile?.learningStyle || '';
  const subjects = AppState.learningProfile?.subjects || [];
  
  const content = `
    <div class="page-header">
      <h1>👤 Profil Saya</h1>
      <p>Kustomisasi preferensi belajar dan gaya belajarmu</p>
    </div>
    
    <div class="profile-container">
      <div class="profile-form">
        <form id="learning-profile-form">
          <div class="form-section">
            <h3>📋 Informasi Dasar</h3>
            
            <div class="form-group">
              <label for="name">Nama Lengkap</label>
              <input type="text" id="name" class="form-input" placeholder="Masukkan nama mu" value="${AppState.learningProfile?.name || ''}" required>
            </div>
            
            <div class="form-group">
              <label for="grade">Tingkat Pendidikan</label>
              <select id="grade" class="form-input" required>
                <option value="">Pilih tingkat</option>
                <option value="sd" ${AppState.learningProfile?.grade === 'sd' ? 'selected' : ''}>SD (Sekolah Dasar)</option>
                <option value="smp" ${AppState.learningProfile?.grade === 'smp' ? 'selected' : ''}>SMP (Sekolah Menengah Pertama)</option>
                <option value="sma" ${AppState.learningProfile?.grade === 'sma' ? 'selected' : ''}>SMA (Sekolah Menengah Atas)</option>
                <option value="universitas" ${AppState.learningProfile?.grade === 'universitas' ? 'selected' : ''}>Universitas</option>
              </select>
            </div>
          </div>
          
          <div class="form-section">
            <h3>🧠 Gaya Belajar Pilihan</h3>
            <p class="form-hint">Pilih cara belajar yang paling cocok untuk mu</p>
            
            <div class="learning-style-options">
              <label class="style-option">
                <input type="radio" name="learningStyle" value="visual" ${learningStyle === 'visual' ? 'checked' : ''} required>
                <label class="style-label">
                  <i class="fas fa-image"></i>
                  <span>Visual</span>
                  <p>Grafik & diagram</p>
                </label>
              </label>
              
              <label class="style-option">
                <input type="radio" name="learningStyle" value="audio" ${learningStyle === 'audio' ? 'checked' : ''}>
                <label class="style-label">
                  <i class="fas fa-volume-up"></i>
                  <span>Audio</span>
                  <p>Podcast & suara</p>
                </label>
              </label>
              
              <label class="style-option">
                <input type="radio" name="learningStyle" value="reading" ${learningStyle === 'reading' ? 'checked' : ''}>
                <label class="style-label">
                  <i class="fas fa-book"></i>
                  <span>Membaca</span>
                  <p>Teks & dokumen</p>
                </label>
              </label>
              
              <label class="style-option">
                <input type="radio" name="learningStyle" value="kinesthetic" ${learningStyle === 'kinesthetic' ? 'checked' : ''}>
                <label class="style-label">
                  <i class="fas fa-hand-paper"></i>
                  <span>Praktik</span>
                  <p>Eksperimen interaktif</p>
                </label>
              </label>
            </div>
          </div>
          
          <div class="form-section">
            <h3>📚 Mata Pelajaran Favorit</h3>
            <div class="subject-grid">
              ${['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Sains', 'Ilmu Sosial', 'Seni'].map(subj => `
                <label class="subject-checkbox">
                  <input type="checkbox" name="subjects" value="${subj.toLowerCase()}" ${subjects.includes(subj.toLowerCase()) ? 'checked' : ''}>
                  <span>${subj}</span>
                </label>
              `).join('')}
            </div>
          </div>
          
          <div class="form-section">
            <button type="submit" class="btn btn-primary btn-lg">
              <i class="fas fa-check"></i>
              Simpan Profil Belajar
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  section.innerHTML = content;
  
  // Fix nested labels issue
  document.querySelectorAll('.style-option').forEach(option => {
    const input = option.querySelector('input');
    const label = option.querySelector('.style-label');
    if (input && label) {
      label.style.cursor = 'pointer';
      input.addEventListener('change', function() {
        document.querySelectorAll('.style-option input').forEach(i => {
          if (i !== input) i.checked = false;
        });
      });
    }
  });
  
  const form = section.querySelector('#learning-profile-form');
  if (form) {
    form.addEventListener('submit', handleProfileSubmit);
  }
}

function handleProfileSubmit(e) {
  e.preventDefault();
  
  try {
    const form = e.target;
    const formData = new FormData(form);
    
    AppState.learningProfile = {
      name: formData.get('name'),
      grade: formData.get('grade'),
      learningStyle: formData.get('learningStyle'),
      subjects: formData.getAll('subjects')
    };
    
    localStorage.setItem('learningProfile', JSON.stringify(AppState.learningProfile));
    
    showToast('✅ Profil berhasil disimpan!', 'success');
    
    // Fetch recommendations
    fetchRecommendations();
  } catch (error) {
    console.error('Error in profile submission:', error);
    showToast('❌ Gagal menyimpan profil', 'error');
  }
}

function loadStoredProfile() {
  const stored = localStorage.getItem('learningProfile');
  if (stored) {
    AppState.learningProfile = JSON.parse(stored);
  }
}

// ============================================
// LEARNING SECTION
// ============================================

function loadLearningSection() {
  const section = document.getElementById('section-learning');
  if (!section) return;
  
  if (section.querySelector('#recommended-materials')) return;
  
  const content = `
    <div class="page-header">
      <h1>📚 Belajar Bersama AI</h1>
      <p>Materi pembelajaran yang dipersonalisasi untuk gaya belajarmu</p>
    </div>
    
    <div class="learning-content">
      <div class="filter-section">
        <select id="subject-filter" class="form-input" style="max-width: 300px;" onchange="filterLearningMaterials()">
          <option value="">Semua Mata Pelajaran</option>
          <option value="matematika">Matematika</option>
          <option value="bahasa">Bahasa Indonesia</option>
          <option value="english">Bahasa Inggris</option>
          <option value="sains">Sains</option>
        </select>
      </div>
      
      <div id="recommended-materials" class="materials-grid">
        <div class="loading">
          <i class="fas fa-spinner"></i>
          <p>Memuat materi pembelajaran...</p>
        </div>
      </div>
    </div>
  `;
  
  section.innerHTML = content;
  loadLearningMaterials();
}

function loadLearningMaterials() {
  const materialsContainer = document.getElementById('recommended-materials');
  if (!materialsContainer) return;
  
  // Try to fetch from backend, fallback to mock data
  fetch(`${AppState.api.baseUrl}/api/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(AppState.learningProfile || {}),
    timeout: 5000
  })
  .then(res => res.json())
  .then(data => {
    displayMaterials(data.recommendations || []);
  })
  .catch(err => {
    console.warn('Backend unavailable, using mock data');
    displayMockMaterials();
  });
}

function displayMockMaterials() {
  const mockMaterials = [
    {
      id: 1,
      title: 'Pengenalan Aljabar Dasar',
      subject: 'matematika',
      type: 'video',
      duration: '12 menit',
      difficulty: 'Mudah',
      learningStyle: 'visual',
      description: 'Pelajari konsep dasar aljabar dengan visual yang menarik'
    },
    {
      id: 2,
      title: 'Podcast: Sejarah Indonesia',
      subject: 'sosial',
      type: 'audio',
      duration: '25 menit',
      difficulty: 'Sedang',
      learningStyle: 'audio',
      description: 'Dengarkan cerita menarik tentang sejarah Indonesia'
    },
    {
      id: 3,
      title: 'Panduan Menulis Esai',
      subject: 'bahasa',
      type: 'text',
      duration: '20 menit',
      difficulty: 'Sedang',
      learningStyle: 'reading',
      description: 'Belajar teknik menulis esai yang efektif'
    },
    {
      id: 4,
      title: 'Eksperimen Sains Interaktif',
      subject: 'sains',
      type: 'interactive',
      duration: '30 menit',
      difficulty: 'Sedang',
      learningStyle: 'kinesthetic',
      description: 'Lakukan eksperimen sains yang seru'
    }
  ];
  
  displayMaterials(mockMaterials);
}

function displayMaterials(materials) {
  const materialsContainer = document.getElementById('recommended-materials');
  if (!materialsContainer) return;
  
  if (materials.length === 0) {
    materialsContainer.innerHTML = '<p class="no-results">Tidak ada materi pembelajaran ditemukan</p>';
    return;
  }
  
  materialsContainer.innerHTML = materials.map((material, idx) => `
    <div class="material-card" style="animation-delay: ${idx * 0.1}s;">
      <div class="material-header">
        <i class="fas ${getMaterialIcon(material.type)}"></i>
        <span class="material-type">${material.type}</span>
      </div>
      <h3 class="material-title">${material.title}</h3>
      <p class="material-description">${material.description || ''}</p>
      <div class="material-meta">
        <span><i class="fas fa-clock"></i> ${material.duration}</span>
        <span><i class="fas fa-signal"></i> ${material.difficulty}</span>
      </div>
      <button class="btn btn-primary" onclick="startMaterial(${material.id})" style="width: 100%; margin-top: 1rem;">
        Mulai Belajar
      </button>
    </div>
  `).join('');
}

function getMaterialIcon(type) {
  const icons = {
    'video': 'fa-video',
    'audio': 'fa-headphones',
    'text': 'fa-book',
    'interactive': 'fa-gamepad'
  };
  return icons[type] || 'fa-file';
}

function startMaterial(materialId) {
  showToast('📚 Membuka materi pembelajaran...', 'info');
}

function filterLearningMaterials() {
  loadLearningMaterials();
}

// ============================================
// QUIZ SECTION
// ============================================

const QUIZ_QUESTIONS = {
  matematika: [
    {
      id: 1,
      text: 'Berapa hasil dari 15 + 27?',
      options: ['32', '42', '52', '62'],
      correctAnswer: 1
    },
    {
      id: 2,
      text: 'Apa itu prime number?',
      options: ['Bilangan yang habis dibagi 2', 'Bilangan yang hanya bisa dibagi 1 dan dirinya sendiri', 'Bilangan ganjil', 'Bilangan negatif'],
      correctAnswer: 1
    },
    {
      id: 3,
      text: 'Berapa hasil dari 5 × 8?',
      options: ['40', '38', '42', '35'],
      correctAnswer: 0
    }
  ],
  bahasa: [
    {
      id: 1,
      text: 'Apa itu metafora?',
      options: ['Perbandingan langsung', 'Perbandingan tidak langsung', 'Pertanyaan retoris', 'Pengulangan kata'],
      correctAnswer: 1
    },
    {
      id: 2,
      text: 'Siapa pengarang novel Laskar Pelangi?',
      options: ['Andrea Hirata', 'Pramoedya Ananta Toer', 'Sutan Sjahrir', 'Budi Utomo'],
      correctAnswer: 0
    }
  ]
};

function loadQuizSection() {
  const section = document.getElementById('section-quiz');
  if (!section) return;
  
  if (section.querySelector('#quiz-form')) return;
  
  const content = `
    <div class="page-header">
      <h1>🎓 Kuis Interaktif</h1>
      <p>Uji pemahamanmu dengan pertanyaan yang disesuaikan</p>
    </div>
    
    <div class="quiz-container">
      <div class="quiz-selection">
        <div class="quiz-card">
          <h3>Matematika</h3>
          <p>3 soal - Tingkat Mudah</p>
          <button class="btn btn-primary" onclick="startQuiz('matematika')">Mulai Kuis</button>
        </div>
        
        <div class="quiz-card">
          <h3>Bahasa Indonesia</h3>
          <p>2 soal - Tingkat Sedang</p>
          <button class="btn btn-primary" onclick="startQuiz('bahasa')">Mulai Kuis</button>
        </div>
      </div>
      
      <div id="quiz-content" style="display: none;"></div>
    </div>
  `;
  
  section.innerHTML = content;
}

function startQuiz(subject) {
  try {
    const quizContent = document.getElementById('quiz-content');
    if (!quizContent) return;
    
    AppState.quizState.startTime = Date.now();
    AppState.quizState.subject = subject;
    AppState.quizState.currentQuestion = 0;
    AppState.quizState.answers = [];
    AppState.quizState.questions = QUIZ_QUESTIONS[subject] || [];
    
    const quizSelection = document.querySelector('.quiz-selection');
    if (quizSelection) quizSelection.style.display = 'none';
    quizContent.style.display = 'block';
    
    if (AppState.quizState.questions.length > 0) {
      displayQuizQuestion(AppState.quizState.questions[0], 0, AppState.quizState.questions.length);
    } else {
      showToast('Kuis tidak ditemukan', 'error');
    }
  } catch (error) {
    console.error('Error starting quiz:', error);
    showToast('Terjadi kesalahan saat memulai kuis', 'error');
  }
}

function displayQuizQuestion(question, currentNum, totalNum) {
  const quizContent = document.getElementById('quiz-content');
  if (!quizContent) return;
  
  const progress = ((currentNum + 1) / totalNum) * 100;
  
  quizContent.innerHTML = `
    <div class="quiz-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <p style="margin-top: 0.5rem; color: var(--text-secondary); font-weight: 600;">Soal ${currentNum + 1} dari ${totalNum}</p>
    </div>
    
    <div class="quiz-question">
      <h3>${question.text}</h3>
      
      <form id="quiz-form">
        ${question.options.map((option, index) => `
          <label class="quiz-option">
            <input type="radio" name="answer" value="${index}" required>
            <span>${option}</span>
          </label>
        `).join('')}
        
        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 1.5rem;">
          ${currentNum + 1 === totalNum ? 'Selesaikan Kuis' : 'Lanjut ke Soal Berikutnya'}
        </button>
      </form>
    </div>
  `;
  
  const form = quizContent.querySelector('#quiz-form');
  if (form) {
    form.addEventListener('submit', submitQuizAnswer);
  }
}

function submitQuizAnswer(event) {
  event.preventDefault();
  
  try {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
      AppState.quizState.answers.push(parseInt(selectedAnswer.value));
      AppState.quizState.currentQuestion++;
      
      const questions = AppState.quizState.questions;
      if (AppState.quizState.currentQuestion < questions.length) {
        const nextQuestion = questions[AppState.quizState.currentQuestion];
        displayQuizQuestion(nextQuestion, AppState.quizState.currentQuestion, questions.length);
      } else {
        showQuizResults();
      }
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    showToast('Terjadi kesalahan', 'error');
  }
}

function showQuizResults() {
  const quizContent = document.getElementById('quiz-content');
  if (!quizContent) return;
  
  const questions = AppState.quizState.questions;
  const answers = AppState.quizState.answers;
  const correct = answers.filter((ans, idx) => ans === questions[idx].correctAnswer).length;
  const percentage = Math.round((correct / questions.length) * 100);
  const elapsed = Math.floor((Date.now() - AppState.quizState.startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  
  quizContent.innerHTML = `
    <div style="text-align: center; animation: fadeInUp 0.6s ease-out;">
      <div style="font-size: 4rem; margin-bottom: 1rem;">
        ${percentage >= 80 ? '🎉' : percentage >= 60 ? '😊' : '💪'}
      </div>
      <h2 style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-primary);">
        Hasil Kuis: ${percentage}%
      </h2>
      <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
        Benar: <strong>${correct}/${questions.length}</strong> soal
        <br>
        Waktu: <strong>${minutes}m ${seconds}s</strong>
      </p>
      <div style="background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: var(--radius-2xl); padding: 2rem; margin-bottom: 2rem;">
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">
          ${percentage >= 80 ? '🌟 Luar biasa! Kamu memahami materi dengan sangat baik!' :
            percentage >= 60 ? '👍 Bagus! Tapi ada beberapa bagian yang perlu ditingkatkan.' :
            '📚 Jangan khawatir! Mari belajar lebih banyak dan coba lagi!'}
        </p>
      </div>
      <button class="btn btn-primary btn-lg" onclick="showSection('quiz')">
        <i class="fas fa-redo"></i>
        Coba Lagi
      </button>
    </div>
  `;
}

// ============================================
// PROGRESS SECTION
// ============================================

function loadProgressSection() {
  const section = document.getElementById('section-progress');
  if (!section) return;
  
  if (section.querySelector('.stats-grid')) return;
  
  const content = `
    <div class="page-header">
      <h1>📈 Laporan Progres</h1>
      <p>Pantau perkembangan belajarmu dengan statistik real-time</p>
    </div>
    
    <div class="progress-container">
      <div class="stats-grid">
        <div class="stat-card">
          <i class="fas fa-book-open"></i>
          <h3>Materi Selesai</h3>
          <p class="stat-value">12</p>
        </div>
        
        <div class="stat-card">
          <i class="fas fa-check-circle"></i>
          <h3>Kuis Berhasil</h3>
          <p class="stat-value">8</p>
        </div>
        
        <div class="stat-card">
          <i class="fas fa-fire"></i>
          <h3>Hari Berturut-turut</h3>
          <p class="stat-value">5</p>
        </div>
        
        <div class="stat-card">
          <i class="fas fa-star"></i>
          <h3>Poin Total</h3>
          <p class="stat-value">450</p>
        </div>
      </div>
      
      <div class="progress-chart">
        <h3>📊 Progres Per Mata Pelajaran</h3>
        <div class="progress-bars">
          <div class="progress-item">
            <label>Matematika</label>
            <div class="bar-container">
              <div class="bar-fill" style="width: 75%; background: linear-gradient(90deg, #10b981, #06b6d4);"></div>
            </div>
            <span>75%</span>
          </div>
          
          <div class="progress-item">
            <label>Bahasa Indonesia</label>
            <div class="bar-container">
              <div class="bar-fill" style="width: 60%; background: linear-gradient(90deg, #ec4899, #f59e0b);"></div>
            </div>
            <span>60%</span>
          </div>
          
          <div class="progress-item">
            <label>Sains</label>
            <div class="bar-container">
              <div class="bar-fill" style="width: 80%; background: linear-gradient(90deg, #3b82f6, #06b6d4);"></div>
            </div>
            <span>80%</span>
          </div>
          
          <div class="progress-item">
            <label>Bahasa Inggris</label>
            <div class="bar-container">
              <div class="bar-fill" style="width: 70%; background: linear-gradient(90deg, #10b981, #f59e0b);"></div>
            </div>
            <span>70%</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  section.innerHTML = content;
}

// ============================================
// AI CHAT IMPLEMENTATION
// ============================================

function initializeAIChat() {
  const chatBubble = document.getElementById('chat-bubble') || createChatBubble();
  
  chatBubble.addEventListener('click', toggleChatWindow);
  
  loadChatHistory();
}

function createChatBubble() {
  const bubble = document.createElement('div');
  bubble.id = 'chat-bubble';
  bubble.className = 'chat-bubble pulse';
  bubble.innerHTML = '<i class="fas fa-comments"></i>';
  bubble.title = 'Obrolan dengan AI EduCerdas';
  document.body.appendChild(bubble);
  
  // Create chat window
  const chatWindow = document.createElement('div');
  chatWindow.id = 'chat-window';
  chatWindow.className = 'chat-window';
  chatWindow.innerHTML = `
    <div class="chat-header">
      <h3>🤖 EduCerdas AI Assistant</h3>
      <button class="chat-close" onclick="toggleChatWindow()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="chat-messages" id="chat-messages"></div>
    <div class="chat-input">
      <input type="text" id="chat-input" placeholder="Tanya sesuatu..." onkeypress="handleChatKeyPress(event)">
      <button onclick="sendChatMessage()" title="Kirim">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  `;
  document.body.appendChild(chatWindow);
  
  return bubble;
}

function toggleChatWindow() {
  const chatWindow = document.getElementById('chat-window');
  const chatBubble = document.getElementById('chat-bubble');
  
  if (chatWindow) {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
      document.getElementById('chat-input').focus();
      if (AppState.chatHistory.length === 0) {
        showAIWelcomeMessage();
      }
    }
  }
}

function handleChatKeyPress(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  
  const message = input.value.trim();
  if (!message) return;
  
  // Add user message
  addChatMessage(message, 'user');
  input.value = '';
  
  // Show AI is thinking
  addChatMessage('🤔', 'ai', true);
  // Get AI response asynchronously (server proxy -> OpenAI). Fallback to local rules.
  (async () => {
    try {
      const responseText = await getAIResponse(message);

      // Remove thinking message
      const messages = document.getElementById('chat-messages');
      if (messages) {
        const lastMsg = messages.lastChild;
        if (lastMsg && lastMsg.textContent.includes('🤔')) {
          lastMsg.remove();
        }
      }

      addChatMessage(responseText, 'ai');
    } catch (err) {
      console.error('Error fetching AI response:', err);
      const messages = document.getElementById('chat-messages');
      if (messages) {
        const lastMsg = messages.lastChild;
        if (lastMsg && lastMsg.textContent.includes('🤔')) lastMsg.remove();
      }
      addChatMessage('Maaf, terjadi kesalahan saat mengambil respons AI. Coba lagi nanti.', 'ai');
    }
  })();
}

function addChatMessage(text, sender, isThinking = false) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  
  const message = document.createElement('div');
  message.className = `chat-message message-${sender}`;
  
  const textEl = document.createElement('div');
  textEl.className = 'message-text';
  textEl.textContent = text;
  
  message.appendChild(textEl);
  messagesContainer.appendChild(message);
  
  // Save to history
  AppState.chatHistory.push({ text, sender, timestamp: Date.now() });
  saveChatHistory();
  
  // Auto scroll
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function getAIResponse(userMessage) {
  const msg = userMessage || '';

  try {
    const resp = await fetch(`${AppState.api.baseUrl}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: msg })
    });

    const data = await resp.json();

    // If server says fallback (no API key) or an error occurred, use local rule-based response
    if (!data || data.fallback || !data.reply) {
      return getRuleBasedResponse(msg);
    }

    return data.reply;
  } catch (error) {
    console.warn('AI proxy failed, using local fallback:', error);
    return getRuleBasedResponse(msg);
  }
}

// Local rule-based fallback (kept for offline / no-API-key scenarios)
function getRuleBasedResponse(userMessage) {
  const msg = (userMessage || '').toLowerCase();
  const responses = {
    'hello|hi|halo|assalamualaikum': '👋 Halo! Selamat datang di EduCerdas AI. Aku siap membantu kamu belajar. Apa yang ingin kamu pelajari hari ini?',
    'bantuan|help|tolong': '🎓 Aku bisa membantu kamu dengan:\n• Menjelaskan materi pelajaran\n• Menjawab pertanyaan akademik\n• Memberi tips belajar efektif\n• Merekomendasikan sumber belajar\n\nApa yang ingin kamu tahu?',
    'matematika|math': '🔢 Matematika adalah bahasa universal! Aku bisa membantu dengan:\n• Aljabar\n• Geometri\n• Trigonometri\n• Statistika\n\nTopik apa yang ingin dipelajari?',
    'bahasa|indonesia|english': '📚 Mari belajar bahasa! Aku bisa membantu dengan:\n• Tata bahasa\n• Kosakata\n• Menulis\n• Membaca pemahaman\n\nPilih topik favorit!',
    'tips|saran|motivasi': '💪 Tips belajar efektif:\n1. Buat jadwal belajar teratur\n2. Gunakan berbagai metode (visual, audio, praktik)\n3. Ambil istirahat singkat setiap 25 menit\n4. Ajarkan kepada orang lain untuk memahami lebih baik\n5. Jangan takut bertanya!\n\nSemangat terus! 🌟',
    'bagaimana|cara|how': '📖 Untuk pertanyaan spesifik, coba:\n• Mulai dari dasar konsepnya\n• Lihat contoh nyata\n• Praktik dengan soal-soal\n• Minta penjelasan jika belum paham\n\nNomor berapa yang ingin dijelaskan?',
    'terima|thanks|thank': '😊 Sama-sama! Senang bisa membantu. Ada yang lain yang ingin ditanyakan?',
    'bye|bye-bye|dah': '👋 Sampai jumpa! Terus semangat belajarnya. Jangan lupa istirahat yang cukup! 🌟',
  };

  for (const [keywords, response] of Object.entries(responses)) {
    const keywordArray = keywords.split('|');
    if (keywordArray.some(kw => msg.includes(kw))) {
      return response;
    }
  }

  return `📚 Menarik pertanyaanmu! Untuk respons yang lebih detail, coba:\n• Rephrase pertanyaannya\n• Tanyakan satu topik spesifik\n• Gunakan mata pelajaran sebagai kata kunci\n\nAda yang lain yang bisa dibantu?`;
}

function saveChatHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(AppState.chatHistory.slice(-50))); // Keep last 50
}

function loadChatHistory() {
  const stored = localStorage.getItem('chatHistory');
  if (stored) {
    AppState.chatHistory = JSON.parse(stored);
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer && AppState.chatHistory.length > 0) {
      AppState.chatHistory.forEach(msg => {
        addChatMessage(msg.text, msg.sender);
      });
    }
  }
}

function showAIWelcomeMessage() {
  addChatMessage('👋 Halo! Aku EduCerdas AI Assistant. Aku siap membantu kamu belajar dengan cara yang fun dan efektif. Ada yang bisa aku bantu? 😊', 'ai');
}

// ============================================
// ACCESSIBILITY FEATURES
// ============================================

function openAccessibilityModal() {
  const modal = document.getElementById('accessibility-modal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function closeAccessibilityModal() {
  const modal = document.getElementById('accessibility-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function toggleDyslexiaMode() {
  const checkbox = document.getElementById('mode-dyslexia');
  AppState.accessibilitySettings.dyslexiaMode = checkbox.checked;
  document.documentElement.setAttribute('data-dyslexia', checkbox.checked);
  saveAccessibilitySettings();
  showToast('🔤 Mode Disleksia ' + (checkbox.checked ? 'diaktifkan' : 'dinonaktifkan'), 'info');
}

function toggleFocusMode() {
  const checkbox = document.getElementById('mode-focus');
  AppState.accessibilitySettings.focusMode = checkbox.checked;
  document.documentElement.setAttribute('data-focus', checkbox.checked);
  saveAccessibilitySettings();
  showToast('🎯 Mode Fokus ' + (checkbox.checked ? 'diaktifkan' : 'dinonaktifkan'), 'info');
}

function toggleAudioMode() {
  const checkbox = document.getElementById('mode-audio');
  AppState.accessibilitySettings.audioMode = checkbox.checked;
  saveAccessibilitySettings();
  showToast('🔊 Mode Audio ' + (checkbox.checked ? 'diaktifkan' : 'dinonaktifkan'), 'info');
}

function toggleHighContrast() {
  const checkbox = document.getElementById('mode-highcontrast');
  AppState.accessibilitySettings.highContrast = checkbox.checked;
  document.documentElement.setAttribute('data-highcontrast', checkbox.checked);
  saveAccessibilitySettings();
  showToast('🎨 Kontras Tinggi ' + (checkbox.checked ? 'diaktifkan' : 'dinonaktifkan'), 'info');
}

function toggleLargeText() {
  const checkbox = document.getElementById('mode-largetext');
  AppState.accessibilitySettings.largeText = checkbox.checked;
  document.documentElement.setAttribute('data-largetext', checkbox.checked);
  if (checkbox.checked) {
    document.body.style.fontSize = '18px';
  } else {
    document.body.style.fontSize = '16px';
  }
  saveAccessibilitySettings();
  showToast('📝 Huruf Besar ' + (checkbox.checked ? 'diaktifkan' : 'dinonaktifkan'), 'info');
}

function saveAccessibilitySettings() {
  localStorage.setItem('accessibilitySettings', JSON.stringify(AppState.accessibilitySettings));
}

function restoreAccessibilitySettings() {
  const saved = localStorage.getItem('accessibilitySettings');
  if (saved) {
    AppState.accessibilitySettings = JSON.parse(saved);
    
    // Apply settings
    if (AppState.accessibilitySettings.dyslexiaMode) {
      const el = document.getElementById('mode-dyslexia');
      if (el) el.checked = true;
      document.documentElement.setAttribute('data-dyslexia', 'true');
    }
    if (AppState.accessibilitySettings.focusMode) {
      const el = document.getElementById('mode-focus');
      if (el) el.checked = true;
      document.documentElement.setAttribute('data-focus', 'true');
    }
    if (AppState.accessibilitySettings.highContrast) {
      const el = document.getElementById('mode-highcontrast');
      if (el) el.checked = true;
      document.documentElement.setAttribute('data-highcontrast', 'true');
    }
    if (AppState.accessibilitySettings.largeText) {
      const el = document.getElementById('mode-largetext');
      if (el) el.checked = true;
      document.documentElement.setAttribute('data-largetext', 'true');
      document.body.style.fontSize = '18px';
    }
  }
}

// ============================================
// THEME MANAGEMENT (DARK/LIGHT MODE)
// ============================================

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  const icon = document.querySelector('#theme-toggle i');
  if (icon) {
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  
  AppState.theme = newTheme;
  showToast(`🌙 Mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`, 'info');
}

function checkDarkMode() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', theme);
  
  const icon = document.querySelector('#theme-toggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  
  AppState.theme = theme;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast') || createToast();
  
  const icon = toast.querySelector('.toast-icon');
  const messageEl = toast.querySelector('.toast-message');
  
  const icons = {
    'success': 'fas fa-check-circle',
    'error': 'fas fa-exclamation-circle',
    'info': 'fas fa-info-circle'
  };
  
  if (icon) {
    icon.className = 'toast-icon ' + (icons[type] || icons['info']);
  }
  
  if (messageEl) {
    messageEl.textContent = message;
  }
  
  toast.className = `toast toast-${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 3000);
}

function createToast() {
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'toast hidden';
  toast.innerHTML = `
    <i class="toast-icon"></i>
    <span class="toast-message"></span>
  `;
  document.body.appendChild(toast);
  return toast;
}

function fetchRecommendations() {
  fetch(`${AppState.api.baseUrl}/api/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(AppState.learningProfile)
  })
  .then(res => res.json())
  .then(data => {
    console.log('✅ Recommendations received:', data);
  })
  .catch(err => {
    console.warn('Could not fetch recommendations:', err);
  });
}

// ============================================
// PAGE VISIBILITY & PERFORMANCE
// ============================================

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden
    document.body.style.opacity = '0.8';
  } else {
    // Page is visible
    document.body.style.opacity = '1';
  }
});

// Intersection Observer for scroll animations
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  });
  
  document.querySelectorAll('.feature-card, .material-card, .stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showToast('❌ Terjadi kesalahan. Coba refresh halaman.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  showToast('❌ Terjadi kesalahan. Coba refresh halaman.', 'error');
});

console.log('✅ EduCerdas AI application loaded successfully');
console.log('Theme:', AppState.theme);
console.log('Features: Dark/Light Mode, AI Chat, Accessibility, Responsive Design');
