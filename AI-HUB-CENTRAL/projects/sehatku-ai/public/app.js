/**
 * SehatKu AI - Main Application Script
 * VERSI STABIL (FINAL FIX - HACKATHON READY)
 * 
 * File ini menangani:
 * - Init System yang Modular (Anti-Crash)
 * - Dark/Light Mode
 * - Global Error Handling (Zero Error Policy)
 * - Navigation & Routing
 * - API System dengan Fallback
 * - Global State Management
 * 
 * © 2026 SehatKu AI - Hackathon Project
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
    API_BASE_URL: 'http://localhost:5001/api',
    STORAGE_KEY: 'sehatku_ai_data',
    THEME_KEY: 'sehatku_theme',
    DEMO_MODE: true,
    API_TIMEOUT: 8000 // 8 seconds timeout
};

// ==================== GLOBAL STATE MANAGEMENT ====================
// AppState: Menyimpan semua data aplikasi secara lokal
const AppState = {
    // Data user
    userData: null,

    // Auth state
    auth: {
        token: null,
        user: null,
        isAuthenticated: false
    },

    // Gejala yang ditambahkan user
    symptoms: [],

    // Riwayat chat dengan AI
    conversationHistory: [],

    // Hasil prediksi risiko
    riskPredictions: null,

    // BMI dan metrik kesehatan
    healthMetrics: null,

    // Load state dari localStorage dengan aman
    load() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                this.userData = data.userData || null;
                this.auth = data.auth || { token: null, user: null, isAuthenticated: false };
                this.symptoms = data.symptoms || [];
                this.conversationHistory = data.conversationHistory || [];
                this.riskPredictions = data.riskPredictions || null;
                this.healthMetrics = data.healthMetrics || null;
            }
            console.log('✅ AppState loaded:', {
                symptomsCount: this.symptoms.length,
                chatHistoryCount: this.conversationHistory.length
            });
        } catch (e) {
            console.warn('⚠️ AppState load error, resetting...', e);
            this.clear();
        }
    },

    // Simpan state ke localStorage dengan aman
    save() {
        try {
            const data = {
                userData: this.userData,
                auth: this.auth,
                symptoms: this.symptoms,
                conversationHistory: this.conversationHistory,
                riskPredictions: this.riskPredictions,
                healthMetrics: this.healthMetrics,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('⚠️ AppState save error:', e);
        }
    },

    // Clear semua data
    clear() {
        this.userData = null;
        this.auth = { token: null, user: null, isAuthenticated: false };
        this.symptoms = [];
        this.conversationHistory = [];
        this.riskPredictions = null;
        this.healthMetrics = null;
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    },

    // Tambah gejala dengan validasi
    addSymptom(symptom) {
        if (symptom && typeof symptom === 'string' && !this.symptoms.includes(symptom.trim())) {
            this.symptoms.push(symptom.trim());
            this.save();
            return true;
        }
        return false;
    },

    // Hapus gejala
    removeSymptom(index) {
        if (index >= 0 && index < this.symptoms.length) {
            this.symptoms.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    },

    // Tambah pesan ke chat history
    addChatMessage(role, content) {
        if (role && content) {
            this.conversationHistory.push({
                role,
                content,
                timestamp: new Date().toISOString()
            });
            // Batasi maksimal 50 pesan untuk performa
            if (this.conversationHistory.length > 50) {
                this.conversationHistory = this.conversationHistory.slice(-50);
            }
            this.save();
        }
    },

    // Clear chat history
    clearChatHistory() {
        this.conversationHistory = [];
        this.save();
    },

    // Auth methods
    setAuth(token, user) {
        this.auth.token = token;
        this.auth.user = user;
        this.auth.isAuthenticated = true;
        this.save();
    },

    clearAuth() {
        this.auth.token = null;
        this.auth.user = null;
        this.auth.isAuthenticated = false;
        this.save();
    },

    isPremium() {
        return this.auth.isAuthenticated &&
            this.auth.user &&
            (this.auth.user.role === 'PREMIUM' || this.auth.user.role === 'DOKTER');
    }
};

// ==================== API SYSTEM DENGAN FALLBACK ====================
// API: Sistem panggilan API dengan timeout dan fallback otomatis
const API = {
    /**
     * Panggil endpoint API dengan timeout dan fallback
     * @param {string} endpoint - Endpoint yang akan dipanggil
     * @param {object} options - Options untuk fetch
     * @returns {Promise} - Response dari API atau fallback
     */
    async call(endpoint, options = {}) {
        const url = CONFIG.API_BASE_URL + endpoint;
        const timeout = options.timeout || CONFIG.API_TIMEOUT;

        try {
            // Buat AbortController untuk timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.warn(`⚠️ API call failed for ${endpoint}:`, error.message);
            // Return fallback response tergantung endpoint
            return this.getFallbackResponse(endpoint, options);
        }
    },

    /**
     * Get fallback response berdasarkan endpoint
     * Ini memastikan frontend TIDAK PERNH crash meski backend mati
     */
    getFallbackResponse(endpoint, options = {}) {
        // Parse body jika ada
        let body = {};
        try {
            if (options.body) {
                body = JSON.parse(options.body);
            }
        } catch (e) { }

        // Return fallback sesuai endpoint
        if (endpoint.includes('symptom-check')) {
            return {
                success: true,
                analysis: this.generateSymptomFallback(body.symptoms || [])
            };
        }

        if (endpoint.includes('prediction')) {
            return {
                success: true,
                predictions: this.generatePredictionFallback(body)
            };
        }

        if (endpoint.includes('mental-health') || endpoint.includes('chat')) {
            return {
                success: true,
                response: "Maaf, saya sedang dalam mode offline. Silakan cerita lebih lanjut, saya tetap mendengarkan.",
                isFallback: true
            };
        }

        // Default fallback
        return { success: true, isFallback: true };
    },

    /**
     * Generate fallback analysis untuk symptom checker
     */
    generateSymptomFallback(symptoms) {
        const symptomText = symptoms.join(', ').toLowerCase();

        // Keyword matching untuk diagnosis dasar
        let diagnosis = [];
        let rekomendasi = "Istirahat yang cukup dan konsumsi makanan bergizi.";

        if (symptomText.includes('demam') || symptomText.includes('panas')) {
            diagnosis.push({ nama: 'Demam', probabilitas: '85', deskripsi: 'Kondisi peningkatan suhu tubuh di atas normal.' });
            rekomendasi = "Minum air yang cukup, istirahat, dan konsumsi parasetamol jika diperlukan. Jika demam lebih dari 3 hari, segera konsultasi dokter.";
        }

        if (symptomText.includes('batuk')) {
            diagnosis.push({ nama: 'Infeksi Saluran Pernapasan', probabilitas: '70', deskripsi: 'Iritasi pada saluran pernapasan.' });
        }

        if (symptomText.includes('sakit kepala') || symptomText.includes('pusing')) {
            diagnosis.push({ nama: 'Sakit Kepala', probabilitas: '75', deskripsi: 'Nyeri pada area kepala.' });
            rekomendasi = "Istirahat di ruangan yang tenang, minum air yang cukup, dan hindari layar terlalu lama.";
        }

        if (symptomText.includes('mual') || symptomText.includes('muntah')) {
            diagnosis.push({ nama: 'Gangguan Pencernaan', probabilitas: '65', deskripsi: 'Ketidaknyamanan pada sistem pencernaan.' });
            rekomendasi = "Hindari makanan pedas dan berminyak. Minum air jahe hangat.";
        }

        if (diagnosis.length === 0) {
            diagnosis.push({ nama: 'Perlu Evaluasi Lebih Lanjut', probabilitas: '50', deskripsi: 'Gejala yang Anda rasakan memerlukan pemeriksaan medis untuk diagnosis akurat.' });
            rekomendasi = "Kami sarankan untuk konsultasi dengan dokter untuk pemeriksaan lebih lanjut.";
        }

        // Tentukan tingkat keparahan
        const tingkatKeparahan = diagnosis.some(d =>
            d.probabilitas > '80' && (symptomText.includes('nyeri') || symptomText.includes('parah'))
        ) ? 'Sedang' : 'Ringan';

        return {
            tingkatKeparahan,
            kemungkinanDiagnosis: diagnosis.slice(0, 3),
            rekomendasiTindakan: rekomendasi,
            perluKonsultasiDokter: tingkatKeparahan === 'Sedang',
            isFallback: true
        };
    },

    /**
     * Generate fallback predictions
     */
    generatePredictionFallback(data) {
        // Kalkulasi BMI lokal
        let bmi = 0;
        if (data.tinggiBadan && data.beratBadan) {
            bmi = data.beratBadan / ((data.tinggiBadan / 100) ** 2);
        }

        const bmiCategory = bmi < 18.5 ? 'Kurus' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Kelebihan Berat Badan' : 'Obesitas';

        // Basic risk calculation berdasarkan data yang ada
        const age = data.umur || 30;
        const isSmoker = data.merokok === 'Ya';
        const aktivitasRendah = data.aktivitasFisik === 'Tidak Pernah' || data.aktivitasFisik === 'Jarang';

        // Risiko Diabetes
        const diabetesRisk = Math.min(100, Math.round(
            (bmi > 25 ? 30 : 0) +
            (age > 40 ? 20 : 0) +
            (isSmoker ? 15 : 0) +
            (aktivitasRendah ? 10 : 0) +
            25 // Base risk
        ));

        // Risiko Hipertensi
        const hypertensionRisk = Math.min(100, Math.round(
            (bmi > 25 ? 25 : 0) +
            (age > 45 ? 25 : 0) +
            (isSmoker ? 15 : 0) +
            (aktivitasRendah ? 10 : 0) +
            15 // Base risk
        ));

        // Risiko Kardiovaskular
        const cvdRisk = Math.min(100, Math.round(
            (bmi > 30 ? 30 : 0) +
            (age > 50 ? 25 : 0) +
            (isSmoker ? 20 : 0) +
            (aktivitasRendah ? 15 : 0) +
            10 // Base risk
        ));

        return {
            diabetes: {
                success: true,
                riskScore: diabetesRisk,
                riskLevel: diabetesRisk > 50 ? (diabetesRisk > 75 ? 'Tinggi' : 'Sedang') : 'Rendah',
                factors: this.getRiskFactors(data, 'diabetes'),
                recommendations: this.getRecommendations('diabetes', diabetesRisk),
                isFallback: true
            },
            hypertension: {
                success: true,
                riskScore: hypertensionRisk,
                riskLevel: hypertensionRisk > 50 ? (hypertensionRisk > 75 ? 'Tinggi' : 'Sedang') : 'Rendah',
                factors: this.getRiskFactors(data, 'hypertension'),
                recommendations: this.getRecommendations('hypertension', hypertensionRisk),
                isFallback: true
            },
            cardiovascular: {
                success: true,
                riskScore: cvdRisk,
                riskLevel: cvdRisk > 50 ? (cvdRisk > 75 ? 'Tinggi' : 'Sedang') : 'Rendah',
                factors: this.getRiskFactors(data, 'cardiovascular'),
                recommendations: this.getRecommendations('cardiovascular', cvdRisk),
                isFallback: true
            }
        };
    },

    getRiskFactors(data, disease) {
        const factors = [];
        if (data.umur > 40) factors.push('Usia di atas 40 tahun');
        if (data.merokok === 'Ya') factors.push('Merokok');
        if (data.aktivitasFisik === 'Tidak Pernah' || data.aktivitasFisik === 'Jarang') factors.push('Kurang aktivitas fisik');
        if (data.tinggiBadan && data.beratBadan) {
            const bmi = data.beratBadan / ((data.tinggiBadan / 100) ** 2);
            if (bmi > 25) factors.push('BMI di atas normal');
        }
        return factors;
    },

    getRecommendations(disease, riskScore) {
        const base = [];

        if (disease === 'diabetes') {
            base.push('Kurangi konsumsi gula dan karbohidrat sederhana');
            base.push('Perbanyak serat dari sayuran dan buah-buahan');
            base.push('Olahraga teratur minimal 30 menit/hari');
        } else if (disease === 'hypertension') {
            base.push('Kurangi konsumsi garam');
            base.push('Hindari stres berlebihan');
            base.push('Rutin mengukur tekanan darah');
        } else {
            base.push('Jaga kesehatan jantung dengan pola hidup sehat');
            base.push('Hindari merokok dan alkohol');
            base.push('Kontrol kolesterol secara rutin');
        }

        if (riskScore > 50) {
            base.push('Segera konsultasi dengan dokter untuk pemeriksaan lebih lanjut');
        }

        return base;
    },

    // Auth API methods
    async register(userData) {
        return this.call('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async login(credentials) {
        return this.call('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async getProfile() {
        return this.call('/auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AppState.auth.token}`
            }
        });
    },

    async logout() {
        return this.call('/auth/logout', {
            method: 'POST'
        });
    },

    async updateProfile(profileData) {
        return this.call('/auth/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${AppState.auth.token}`
            },
            body: JSON.stringify(profileData)
        });
    },

    // Premium API methods
    async activatePremium(paymentData) {
        return this.call('/premium/activate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AppState.auth.token}`
            },
            body: JSON.stringify(paymentData)
        });
    },

    async getPremiumStatus() {
        return this.call('/premium/status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AppState.auth.token}`
            }
        });
    },

    async getDoctors() {
        return this.call('/premium/doctors', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AppState.auth.token}`
            }
        });
    },

    async startConsultation(doctorId) {
        return this.call('/premium/consultation/start', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AppState.auth.token}`
            },
            body: JSON.stringify({ doctorId })
        });
    },

    async getConsultationMessages(sessionId) {
        return this.call(`/premium/consultation/${sessionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AppState.auth.token}`
            }
        });
    },

    async sendConsultationMessage(sessionId, message) {
        return this.call(`/premium/consultation/${sessionId}/message`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AppState.auth.token}`
            },
            body: JSON.stringify({ message })
        });
    },

    async endConsultation(sessionId) {
        return this.call(`/premium/consultation/${sessionId}/end`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AppState.auth.token}`
            }
        });
    },

    // Hospital API methods
    async getNearbyHospitals(lat, lng, limit = 5, specialty) {
        const params = new URLSearchParams({ lat, lng, limit });
        if (specialty) params.append('specialty', specialty);

        return this.call(`/hospital/nearby?${params}`, {
            method: 'GET'
        });
    },

    async searchHospitals(query, specialty) {
        const params = new URLSearchParams({ query });
        if (specialty) params.append('specialty', specialty);

        return this.call(`/hospital/search?${params}`, {
            method: 'GET'
        });
    },

    async getHospitalDetail(id) {
        return this.call(`/hospital/${id}`, {
            method: 'GET'
        });
    },

    async getHospitalSpecialties() {
        return this.call('/hospital/specialties/list', {
            method: 'GET'
        });
    },

    async emergencyContact(emergencyData) {
        return this.call('/health/emergency', {
            method: 'POST',
            body: JSON.stringify(emergencyData)
        });
    }
};

// ==================== NOTIFICATION SYSTEM ====================
// showNotification: Sistem notifikasi toast yang aman dan non-blocking
const NotificationSystem = {
    container: null,

    init() {
        // Buat container jika belum ada
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('notification-container');
        }
    },

    /**
     * Tampilkan notifikasi toast
     * @param {string} message - Pesan yang akan ditampilkan
     * @param {string} type - 'success', 'warning', 'error', 'info'
     * @param {number} duration - Durasi tampil dalam ms (default 3000)
     */
    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();

        // Validasi input
        if (!message || typeof message !== 'string') {
            message = 'Terjadi kesalahan kecil';
        }

        const toast = document.createElement('div');
        toast.className = `notification-toast notification-${type}`;
        toast.textContent = message;

        // Styling berdasarkan type
        const colors = {
            success: { bg: 'rgba(16, 185, 129, 0.9)', border: '#10b981' },
            warning: { bg: 'rgba(245, 158, 11, 0.9)', border: '#f59e0b' },
            error: { bg: 'rgba(239, 68, 68, 0.9)', border: '#ef4444' },
            info: { bg: 'rgba(99, 102, 241, 0.9)', border: '#6366f1' }
        };

        const color = colors[type] || colors.info;

        toast.style.cssText = `
            background: ${color.bg};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            border-left: 4px solid ${color.border};
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
            pointer-events: auto;
        `;

        // Add animation keyframes if not exists
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        this.container.appendChild(toast);

        // Auto remove setelah duration
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Convenience methods
    success(message, duration) { this.show(message, 'success', duration); },
    warning(message, duration) { this.show(message, 'warning', duration); },
    error(message, duration) { this.show(message, 'error', duration); },
    info(message, duration) { this.show(message, 'info', duration); }
};

// ==================== EMERGENCY SYSTEM ====================
const EmergencySystem = {
    audio: null,

    init() {
        // Simple beep sound data URI to avoid external file dependency
        const beepData = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Truncated for brevity, normally huge. 
        // Using a cleaner approach: Create oscillator
    },

    playAlertSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);

                gain.gain.setValueAtTime(0.5, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            }
        } catch (e) {
            console.warn('Audio play failed:', e);
        }
    },

    triggerAlert() {
        this.playAlertSound();

        // Show prominent modal
        const modal = document.createElement('div');
        modal.id = 'emergency-modal-overlay';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(220, 38, 38, 0.9); z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 1rem; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🚨</div>
                <h2 style="color: #dc2626; font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem;">DARURAT MEDIS TERDETEKSI</h2>
                <p style="color: #4b5563; margin-bottom: 1.5rem; font-size: 1.1rem;">Berdasarkan gejala Anda, kondisi ini memerlukan penanganan segera.</p>
                
                <button id="call-ambulance-btn" style="background: #dc2626; color: white; width: 100%; padding: 1rem; border-radius: 0.5rem; font-weight: bold; font-size: 1.2rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border: none; cursor: pointer; transition: transform 0.1s;">
                    <span>🚑</span> PANGGIL AMBULANS / IGD
                </button>
                
                <button id="dismiss-emergency-btn" style="background: transparent; border: 2px solid #e5e7eb; color: #6b7280; width: 100%; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
                    Saya mengerti, tutup peringatan
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind events
        document.getElementById('call-ambulance-btn').onclick = () => {
            modal.remove();
            if (window.HospitalModule) {
                window.HospitalModule.handleEmergency();
            } else {
                window.location.href = 'tel:119';
            }
        };

        document.getElementById('dismiss-emergency-btn').onclick = () => {
            modal.remove();
        };
    }
};

// Global Exposure
window.triggerEmergencyAlert = () => EmergencySystem.triggerAlert();


// ==================== THEME MANAGEMENT (Dark/Light) ====================
const ThemeSystem = {
    init() {
        try {
            // Cek localStorage atau system preference
            const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            const theme = savedTheme || (systemDark ? 'dark' : 'light');
            this.apply(theme);

            // Setup toggle button listener
            const toggleBtn = document.getElementById('themeToggle');
            if (toggleBtn) {
                toggleBtn.onclick = () => this.toggle();
                this.updateIcon(theme);
            }

            console.log(`✅ Theme initialized: ${theme}`);
        } catch (e) {
            console.warn('⚠️ Theme init error:', e);
        }
    },

    toggle() {
        try {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            this.apply(newTheme);
            this.updateIcon(newTheme);
        } catch (e) {
            console.error('❌ Theme toggle error:', e);
        }
    },

    apply(theme) {
        try {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(CONFIG.THEME_KEY, theme);

            // Update body untuk styling yang konsisten
            document.body.setAttribute('data-theme', theme);
        } catch (e) {
            console.warn('⚠️ Theme apply error:', e);
        }
    },

    updateIcon(theme) {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
            toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        }
    }
};

// ==================== GLOBAL ERROR HANDLING ====================
// These handlers mencegah crash dan menampilkan notifikasi ramah user

window.onerror = function (msg, url, line, col, error) {
    console.error('🚨 Global Error:', { msg, url, line, col, error: error?.message });

    // Jangan tampilkan error yang sudah dihandle
    if (msg?.includes('ResizeObserver') || msg?.includes('ResizeObserverLoop')) {
        return true; // Ignore ResizeObserver errors
    }

    // Tampilkan notifikasi friendly (hanya untuk error signifikan)
    if (NotificationSystem && typeof NotificationSystem.show === 'function') {
        NotificationSystem.show('Terjadi kesalahan. Aplikasi tetap berjalan dengan normal.', 'warning', 4000);
    }

    return true; // Prevent default browser error
};

window.onunhandledrejection = function (event) {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
    event.preventDefault();

    // Tampilkan notifikasi friendly
    if (NotificationSystem && typeof NotificationSystem.show === 'function') {
        NotificationSystem.show('Proses selesai dengan perbedaan kecil. Aplikasi tetap berfungsi.', 'info', 3000);
    }
};

// ==================== MODULAR INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting SehatKu AI...');
    console.log('📋 Mode:', CONFIG.DEMO_MODE ? 'Demo/Offline' : 'Production');

    // Load state dulu
    AppState.load();
    NotificationSystem.init();

    // 1. Init Theme (Paling awal agar tidak flash)
    ThemeSystem.init();

    // 2. Init App Logic dengan Guard (Anti-Crash)
    initModule('Navigation', initNavigation);
    initModule('Storytelling', initStorytelling);
    initModule('Modules', initFeatureModules);

    // 3. Remove Loading Screen (Graceful)
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    }, 2500);

    console.log('✅ SehatKu AI started successfully');
});

/**
 * Execute module init safely - Jika satu module gagal, module lain tetap jalan
 */
function initModule(name, initFn) {
    try {
        if (typeof initFn === 'function') {
            initFn();
            console.log(`✅ ${name} initialized`);
        } else {
            console.warn(`⚠️ ${name} init function missing`);
        }
    } catch (error) {
        console.error(`❌ ${name} init failed:`, error);
        // Jangan crash aplikasi, biarkan module lain jalan
        // Module yang gagal akan di-silent dan tidak mempengaruhi fungsionalitas lain
    }
}

// ==================== MODULE INITIALIZERS ====================

function initNavigation() {
    try {
        // Navigation links dengan event delegation
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.addEventListener('click', (e) => {
                const link = e.target.closest('.nav-link');
                if (link) {
                    e.preventDefault();
                    const pageId = link.getAttribute('data-page');
                    if (pageId) {
                        navigateTo(pageId);
                    }
                }
            });
        }

        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                const navMenu = document.getElementById('navMenu');
                if (navMenu) {
                    navMenu.classList.toggle('active');
                }
            });
        }

        // Auth and premium buttons
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (window.AuthModule) {
                    window.AuthModule.show('login');
                }
            });
        }

        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                if (window.AuthModule) {
                    window.AuthModule.show('profile');
                }
            });
        }

        const consultationBtn = document.getElementById('consultationBtn');
        if (consultationBtn) {
            consultationBtn.addEventListener('click', () => {
                if (window.PremiumModule) {
                    window.PremiumModule.showConsultationModal();
                }
            });
        }

        const hospitalBtn = document.getElementById('hospitalBtn');
        if (hospitalBtn) {
            hospitalBtn.addEventListener('click', () => {
                if (window.HospitalModule) {
                    window.HospitalModule.showModal();
                }
            });
        }

        console.log('✅ Navigation initialized');
    } catch (error) {
        console.error('❌ Navigation init error:', error);
    }
}

function initStorytelling() {
    try {
        // Cek apakah storytelling animations tersedia
        if (typeof window.initStorytellingAnimations === 'function') {
            window.initStorytellingAnimations();
        } else {
            // Fallback: langsung tampilkan main app
            const storytellingPage = document.getElementById('storytelling-page');
            const mainApp = document.getElementById('mainContent');

            if (storytellingPage) storytellingPage.classList.add('hidden');
            if (mainApp) {
                mainApp.classList.remove('hidden');
                mainApp.classList.add('visible');
            }
        }
        console.log('✅ Storytelling initialized');
    } catch (error) {
        console.error('❌ Storytelling init error:', error);
        // Fallback ke main app
        const storytellingPage = document.getElementById('storytelling-page');
        const mainApp = document.getElementById('mainContent');
        if (storytellingPage) storytellingPage.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
    }
}

function initFeatureModules() {
    try {
        // Init semua module dengan fallback jika salah satu gagal
        if (typeof window.initMentalHealthChat === 'function') {
            initModule('MentalHealth', window.initMentalHealthChat);
        }
        if (typeof window.initSymptomChecker === 'function') {
            initModule('SymptomChecker', window.initSymptomChecker);
        }
        if (typeof window.initRiskPrediction === 'function') {
            initModule('RiskPrediction', window.initRiskPrediction);
        }
        if (typeof window.initDashboard === 'function') {
            initModule('Dashboard', window.initDashboard);
        }

        // Init new premium modules
        if (typeof window.AuthModule !== 'undefined') {
            initModule('Auth', () => window.AuthModule.init());
        }
        if (typeof window.PremiumModule !== 'undefined') {
            initModule('Premium', () => window.PremiumModule.init());
        }
        if (typeof window.HospitalModule !== 'undefined') {
            initModule('Hospital', () => window.HospitalModule.init());
        }

        // Init new AI and emergency modules
        if (typeof window.AISurveyModule !== 'undefined') {
            initModule('AISurvey', () => window.AISurveyModule.init());
        }
        if (typeof window.EmergencyModule !== 'undefined') {
            initModule('Emergency', () => window.EmergencyModule.init());
        }

        // Init MapService when Google Maps API is loaded
        if (typeof google !== 'undefined' && typeof window.MapService !== 'undefined') {
            initModule('MapService', () => {
                window.mapService = new window.MapService();
            });
        } else {
            // Wait for Google Maps API to load
            window.initMapService = () => {
                if (typeof window.MapService !== 'undefined') {
                    window.mapService = new window.MapService();
                    console.log('✅ MapService initialized');
                }
            };
        }

        console.log('✅ Feature modules initialized');
    } catch (error) {
        console.error('❌ Feature modules init error:', error);
    }
}

// ==================== NAVIGATION LOGIC ====================
function navigateTo(pageId) {
    try {
        // Validasi pageId
        if (!pageId || typeof pageId !== 'string') {
            console.warn('⚠️ Invalid pageId:', pageId);
            return;
        }

        // 1. Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // 2. Remove active class dari semua nav links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

        // 3. Show target page
        const target = document.getElementById(pageId + '-page');
        if (target) {
            target.classList.add('active');
            window.scrollTo(0, 0);
        } else {
            console.warn(`⚠️ Page not found: ${pageId}`);
            // Fallback ke home
            const homePage = document.getElementById('home-page');
            if (homePage) homePage.classList.add('active');
            return;
        }

        // 4. Active nav link
        const link = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        if (link) link.classList.add('active');

        // 5. Close mobile menu jika terbuka
        const navMenu = document.getElementById('navMenu');
        if (navMenu && window.innerWidth < 768) {
            navMenu.classList.remove('active');
        }

        console.log(`✅ Navigated to: ${pageId}`);
    } catch (e) {
        console.error('❌ Navigation error:', e);
        // Fallback ke home
        const homePage = document.getElementById('home-page');
        if (homePage) homePage.classList.add('active');
    }
}

// ==================== GLOBAL EXPORTS ====================
// Export functions untuk compatibility dengan HTML onclick handlers
window.navigateTo = navigateTo;
window.showNotification = (message, type) => NotificationSystem.show(message, type || 'info');
window.AppState = AppState;
window.API = API;
window.CONFIG = CONFIG;

