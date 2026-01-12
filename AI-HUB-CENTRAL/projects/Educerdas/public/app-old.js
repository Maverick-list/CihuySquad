/**
 * EduCerdas AI - Frontend Application
 * Platform Pembelajaran Personalized dengan AI
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
        currentQuestion: 0
    },
    accessibilitySettings: {
        dyslexiaMode: false,
        focusMode: false,
        audioMode: false,
        highContrast: false,
        largeText: false
    },
    api: {
        baseUrl: 'http://localhost:3000'
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎓 EduCerdas AI - Initializing...');
    
    // Simulate loading
    simulateLoading();
    
    // Initialize UI
    setupEventListeners();
    restoreAccessibilitySettings();
    checkDarkMode();
    
    console.log('✅ EduCerdas AI initialized successfully');
});

// ============================================
// LOADING SCREEN
// ============================================

function simulateLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app');
    
    // Simulate loading progress
    let progress = 0;
    const progressBar = document.querySelector('.loading-progress');
    
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        if (progress === 100) {
            clearInterval(interval);
            
            // Show app after 2 seconds
            setTimeout(() => {
                if (loadingScreen) loadingScreen.style.display = 'none';
                if (appContainer) appContainer.classList.remove('hidden');
            }, 500);
        }
    }, 300);
}

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
            showSection(section);
        });
    });
    
    // Menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
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
    
    // Quiz form submission
    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        quizForm.addEventListener('submit', submitQuizAnswer);
    }
}

// ============================================
// SECTION NAVIGATION
// ============================================

function showSection(sectionName) {
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
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    
    // Load section-specific content
    loadSectionContent(sectionName);
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
    
    // Check if content already exists
    if (section.innerHTML.trim()) return;
    
    const content = `
        <div class="page-header">
            <h1>Profil Saya</h1>
            <p>Atur preferensi belajar dan gaya belajarmu</p>
        </div>
        
        <div class="profile-container">
            <div class="profile-form">
                <form id="learning-profile-form">
                    <div class="form-section">
                        <h3>Informasi Dasar</h3>
                        
                        <div class="form-group">
                            <label for="name">Nama Lengkap</label>
                            <input type="text" id="name" class="form-input" placeholder="Masukkan nama mu" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="grade">Tingkat Pendidikan</label>
                            <select id="grade" class="form-input" required>
                                <option value="">Pilih tingkat</option>
                                <option value="sd">SD (Sekolah Dasar)</option>
                                <option value="smp">SMP (Sekolah Menengah Pertama)</option>
                                <option value="sma">SMA (Sekolah Menengah Atas)</option>
                                <option value="universitas">Universitas</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Gaya Belajar</h3>
                        <p class="form-hint">Pilih cara belajar yang paling cocok untuk mu</p>
                        
                        <div class="learning-style-options">
                            <div class="style-option">
                                <input type="radio" id="visual" name="learningStyle" value="visual" required>
                                <label for="visual" class="style-label">
                                    <i class="fas fa-image"></i>
                                    <span>Visual</span>
                                    <p>Grafik, diagram, dan video</p>
                                </label>
                            </div>
                            
                            <div class="style-option">
                                <input type="radio" id="audio" name="learningStyle" value="audio">
                                <label for="audio" class="style-label">
                                    <i class="fas fa-volume-up"></i>
                                    <span>Audio</span>
                                    <p>Penjelasan dan podcast</p>
                                </label>
                            </div>
                            
                            <div class="style-option">
                                <input type="radio" id="reading" name="learningStyle" value="reading">
                                <label for="reading" class="style-label">
                                    <i class="fas fa-book"></i>
                                    <span>Membaca</span>
                                    <p>Teks dan dokumen</p>
                                </label>
                            </div>
                            
                            <div class="style-option">
                                <input type="radio" id="kinesthetic" name="learningStyle" value="kinesthetic">
                                <label for="kinesthetic" class="style-label">
                                    <i class="fas fa-hand-paper"></i>
                                    <span>Praktik</span>
                                    <p>Eksperimen dan interaksi</p>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Mata Pelajaran Favorit</h3>
                        <div class="subject-grid">
                            <label class="subject-checkbox">
                                <input type="checkbox" name="subjects" value="matematika">
                                <span>Matematika</span>
                            </label>
                            <label class="subject-checkbox">
                                <input type="checkbox" name="subjects" value="bahasa">
                                <span>Bahasa Indonesia</span>
                            </label>
                            <label class="subject-checkbox">
                                <input type="checkbox" name="subjects" value="english">
                                <span>Bahasa Inggris</span>
                            </label>
                            <label class="subject-checkbox">
                                <input type="checkbox" name="subjects" value="sains">
                                <span>Sains</span>
                            </label>
                            <label class="subject-checkbox">
                                <input type="checkbox" name="subjects" value="sosial">
                                <span>Ilmu Sosial</span>
                            </label>
                            <label class="subject-checkbox">
                                <input type="checkbox" name="subjects" value="seni">
                                <span>Seni</span>
                            </label>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-lg">
                        <i class="fas fa-check"></i>
                        Simpan Profil Belajar
                    </button>
                </form>
            </div>
        </div>
    `;
    
    section.innerHTML = content;
    
    // Add form handler
    const form = section.querySelector('#learning-profile-form');
    if (form) {
        form.addEventListener('submit', handleProfileSubmit);
    }
}

function handleProfileSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    AppState.learningProfile = {
        name: formData.get('name'),
        grade: formData.get('grade'),
        learningStyle: formData.get('learningStyle'),
        subjects: formData.getAll('subjects')
    };
    
    // Save to localStorage
    localStorage.setItem('learningProfile', JSON.stringify(AppState.learningProfile));
    
    showToast('✅ Profil berhasil disimpan!', 'success');
    
    // Fetch recommendations from backend
    fetchRecommendations();
}

// ============================================
// LEARNING SECTION
// ============================================

function loadLearningSection() {
    const section = document.getElementById('section-learning');
    if (!section) return;
    
    if (section.innerHTML.trim() && section.innerHTML.includes('recommended-materials')) return;
    
    const content = `
        <div class="page-header">
            <h1>Belajar Bersama AI</h1>
            <p>Materi pembelajaran yang dipersonalisasi untuk gaya belajarmu</p>
        </div>
        
        <div class="learning-content">
            <div class="filter-section">
                <select id="subject-filter" class="form-input" onchange="filterLearningMaterials()">
                    <option value="">Semua Mata Pelajaran</option>
                    <option value="matematika">Matematika</option>
                    <option value="bahasa">Bahasa Indonesia</option>
                    <option value="english">Bahasa Inggris</option>
                    <option value="sains">Sains</option>
                </select>
            </div>
            
            <div id="recommended-materials" class="materials-grid">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Memuat materi pembelajaran...</p>
                </div>
            </div>
        </div>
    `;
    
    section.innerHTML = content;
    
    // Load materials from backend
    loadLearningMaterials();
}

function loadLearningMaterials() {
    const materialsContainer = document.getElementById('recommended-materials');
    if (!materialsContainer) return;
    
    fetch(`${AppState.api.baseUrl}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(AppState.learningProfile)
    })
    .then(res => res.json())
    .then(data => {
        displayMaterials(data.recommendations || []);
    })
    .catch(err => {
        console.error('Error loading materials:', err);
        displayMockMaterials();
    });
}

function displayMockMaterials() {
    const materialsContainer = document.getElementById('recommended-materials');
    if (!materialsContainer) return;
    
    const mockMaterials = [
        {
            id: 1,
            title: 'Pengenalan Aljabar Dasar',
            subject: 'matematika',
            type: 'video',
            duration: '12 menit',
            difficulty: 'Mudah',
            learningStyle: 'visual'
        },
        {
            id: 2,
            title: 'Podcast: Sejarah Indonesia',
            subject: 'sosial',
            type: 'audio',
            duration: '25 menit',
            difficulty: 'Sedang',
            learningStyle: 'audio'
        },
        {
            id: 3,
            title: 'Panduan Menulis Esai',
            subject: 'bahasa',
            type: 'text',
            duration: '20 menit',
            difficulty: 'Sedang',
            learningStyle: 'reading'
        },
        {
            id: 4,
            title: 'Eksperimen Sains Interaktif',
            subject: 'sains',
            type: 'interactive',
            duration: '30 menit',
            difficulty: 'Sedang',
            learningStyle: 'kinesthetic'
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
    
    materialsContainer.innerHTML = materials.map(material => `
        <div class="material-card">
            <div class="material-header">
                <i class="fas ${getMaterialIcon(material.type)}"></i>
                <span class="material-type">${material.type}</span>
            </div>
            <h3 class="material-title">${material.title}</h3>
            <p class="material-description">Mata pelajaran: ${material.subject}</p>
            <div class="material-meta">
                <span><i class="fas fa-clock"></i> ${material.duration}</span>
                <span><i class="fas fa-signal"></i> ${material.difficulty}</span>
            </div>
            <button class="btn btn-secondary" onclick="startMaterial(${material.id})">
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

function filterLearningMaterials() {
    // Simple filter - in production, this would call the backend
    loadLearningMaterials();
}

function startMaterial(materialId) {
    showToast('📚 Membuka materi pembelajaran...', 'info');
}

// ============================================
// QUIZ SECTION
// ============================================

function loadQuizSection() {
    const section = document.getElementById('section-quiz');
    if (!section) return;
    
    if (section.innerHTML.trim() && section.innerHTML.includes('quiz-form')) return;
    
    const content = `
        <div class="page-header">
            <h1>Kuis Interaktif</h1>
            <p>Uji pemahamanmu dengan pertanyaan yang disesuaikan</p>
        </div>
        
        <div class="quiz-container">
            <div class="quiz-selection">
                <div class="quiz-card">
                    <h3>Kuis Matematika</h3>
                    <p>10 soal - Tingkat Mudah</p>
                    <button class="btn btn-primary" onclick="startQuiz('matematika')">Mulai Kuis</button>
                </div>
                
                <div class="quiz-card">
                    <h3>Kuis Bahasa Indonesia</h3>
                    <p>10 soal - Tingkat Sedang</p>
                    <button class="btn btn-primary" onclick="startQuiz('bahasa')">Mulai Kuis</button>
                </div>
                
                <div class="quiz-card">
                    <h3>Kuis Sains</h3>
                    <p>10 soal - Tingkat Sedang</p>
                    <button class="btn btn-primary" onclick="startQuiz('sains')">Mulai Kuis</button>
                </div>
            </div>
            
            <div id="quiz-content" style="display: none;"></div>
        </div>
    `;
    
    section.innerHTML = content;
}

function startQuiz(subject) {
    const quizContent = document.getElementById('quiz-content');
    if (!quizContent) return;
    
    AppState.quizState.startTime = Date.now();
    AppState.quizState.subject = subject;
    AppState.quizState.currentQuestion = 0;
    AppState.quizState.answers = [];
    
    const quizSelection = document.querySelector('.quiz-selection');
    if (quizSelection) quizSelection.style.display = 'none';
    quizContent.style.display = 'block';
    
    // Load questions from backend or use mock
    loadQuizQuestions(subject);
}

function loadQuizQuestions(subject) {
    fetch(`${AppState.api.baseUrl}/api/quiz/${subject}`)
        .then(res => res.json())
        .then(data => {
            displayQuizQuestion(data.questions[0], 0, data.questions.length);
        })
        .catch(err => {
            console.error('Error loading quiz:', err);
            displayMockQuizQuestion();
        });
}

function displayMockQuizQuestion() {
    const mockQuestion = {
        id: 1,
        text: 'Berapa hasil dari 15 + 27?',
        options: ['32', '42', '52', '62'],
        correctAnswer: 1
    };
    displayQuizQuestion(mockQuestion, 0, 10);
}

function displayQuizQuestion(question, currentNum, totalNum) {
    const quizContent = document.getElementById('quiz-content');
    if (!quizContent) return;
    
    quizContent.innerHTML = `
        <div class="quiz-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(currentNum / totalNum) * 100}%"></div>
            </div>
            <p>Soal ${currentNum + 1} dari ${totalNum}</p>
        </div>
        
        <div class="quiz-question">
            <h3>${question.text}</h3>
            
            <form id="quiz-form" onsubmit="submitQuizAnswer(event)">
                ${question.options.map((option, index) => `
                    <label class="quiz-option">
                        <input type="radio" name="answer" value="${index}" required>
                        <span>${option}</span>
                    </label>
                `).join('')}
                
                <button type="submit" class="btn btn-primary btn-lg">
                    Lanjut ke Soal Berikutnya
                </button>
            </form>
        </div>
    `;
}

function submitQuizAnswer(event) {
    event.preventDefault();
    
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        AppState.quizState.answers.push(parseInt(selectedAnswer.value));
        AppState.quizState.currentQuestion++;
        
        // Load next question or show results
        showToast('✅ Jawaban disimpan', 'success');
    }
}

// ============================================
// PROGRESS SECTION
// ============================================

function loadProgressSection() {
    const section = document.getElementById('section-progress');
    if (!section) return;
    
    if (section.innerHTML.trim() && section.innerHTML.includes('progress-chart')) return;
    
    const content = `
        <div class="page-header">
            <h1>Laporan Progres</h1>
            <p>Pantau perkembangan belajarmu</p>
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
                <h3>Progres Per Mata Pelajaran</h3>
                <div class="progress-bars">
                    <div class="progress-item">
                        <label>Matematika</label>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: 75%; background: #6366f1;"></div>
                        </div>
                        <span>75%</span>
                    </div>
                    
                    <div class="progress-item">
                        <label>Bahasa Indonesia</label>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: 60%; background: #ec4899;"></div>
                        </div>
                        <span>60%</span>
                    </div>
                    
                    <div class="progress-item">
                        <label>Sains</label>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: 80%; background: #10b981;"></div>
                        </div>
                        <span>80%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    section.innerHTML = content;
}

// ============================================
// ACCESSIBILITY FEATURES
// ============================================

function openAccessibilityModal() {
    const modal = document.getElementById('accessibility-modal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('active');
    }
}

function closeAccessibilityModal() {
    const modal = document.getElementById('accessibility-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

function toggleDyslexiaMode() {
    const checkbox = document.getElementById('mode-dyslexia');
    AppState.accessibilitySettings.dyslexiaMode = checkbox.checked;
    document.body.classList.toggle('dyslexia-mode', checkbox.checked);
    saveAccessibilitySettings();
    showToast('Mode Disleksia ' + (checkbox.checked ? 'diaktifkan' : 'dinonaktifkan'), 'info');
}

function toggleFocusMode() {
    const checkbox = document.getElementById('mode-focus');
    AppState.accessibilitySettings.focusMode = checkbox.checked;
    document.body.classList.toggle('focus-mode', checkbox.checked);
    saveAccessibilitySettings();
    showToast('Mode Fokus ' + (checkbox.checked ? 'diaktifkan' : 'dinonaktifkan'), 'info');
}

function toggleAudioMode() {
    const checkbox = document.getElementById('mode-audio');
    AppState.accessibilitySettings.audioMode = checkbox.checked;
    saveAccessibilitySettings();
    showToast('Mode Audio ' + (checkbox.checked ? 'diaktifkan' : 'dinonaktifkan'), 'info');
}

function toggleHighContrast() {
    const checkbox = document.getElementById('mode-highcontrast');
    AppState.accessibilitySettings.highContrast = checkbox.checked;
    document.body.classList.toggle('high-contrast', checkbox.checked);
    saveAccessibilitySettings();
    showToast('Kontras Tinggi ' + (checkbox.checked ? 'diaktifkan' : 'dinonaktifkan'), 'info');
}

function toggleLargeText() {
    const checkbox = document.getElementById('mode-largetext');
    AppState.accessibilitySettings.largeText = checkbox.checked;
    document.body.classList.toggle('large-text', checkbox.checked);
    saveAccessibilitySettings();
    showToast('Huruf Besar ' + (checkbox.checked ? 'diaktifkan' : 'dinonaktifkan'), 'info');
}

function saveAccessibilitySettings() {
    localStorage.setItem('accessibilitySettings', JSON.stringify(AppState.accessibilitySettings));
}

function restoreAccessibilitySettings() {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
        AppState.accessibilitySettings = JSON.parse(saved);
        
        // Apply saved settings
        document.getElementById('mode-dyslexia').checked = AppState.accessibilitySettings.dyslexiaMode;
        document.getElementById('mode-focus').checked = AppState.accessibilitySettings.focusMode;
        document.getElementById('mode-audio').checked = AppState.accessibilitySettings.audioMode;
        document.getElementById('mode-highcontrast').checked = AppState.accessibilitySettings.highContrast;
        document.getElementById('mode-largetext').checked = AppState.accessibilitySettings.largeText;
        
        document.body.classList.toggle('dyslexia-mode', AppState.accessibilitySettings.dyslexiaMode);
        document.body.classList.toggle('focus-mode', AppState.accessibilitySettings.focusMode);
        document.body.classList.toggle('high-contrast', AppState.accessibilitySettings.highContrast);
        document.body.classList.toggle('large-text', AppState.accessibilitySettings.largeText);
    }
}

// ============================================
// THEME MANAGEMENT
// ============================================

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    }
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
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');
    
    if (icon) {
        icon.className = 'toast-icon';
        icon.classList.add(`icon-${type}`);
        
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'info': 'fas fa-info-circle'
        };
        icon.className = 'toast-icon ' + (icons[type] || icons['info']);
    }
    
    if (messageEl) {
        messageEl.textContent = message;
    }
    
    toast.classList.remove('hidden');
    toast.classList.add(`toast-${type}`);
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function fetchRecommendations() {
    // Fetch from backend API
    fetch(`${AppState.api.baseUrl}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(AppState.learningProfile)
    })
    .then(res => res.json())
    .then(data => {
        console.log('Recommendations received:', data);
    })
    .catch(err => {
        console.error('Error fetching recommendations:', err);
    });
}

// Close accessibility modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('accessibility-modal');
    if (modal && e.target === modal) {
        closeAccessibilityModal();
    }
});

console.log('✅ EduCerdas AI application loaded successfully');
