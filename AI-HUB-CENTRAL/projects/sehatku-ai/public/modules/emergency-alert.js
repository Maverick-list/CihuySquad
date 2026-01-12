/**
 * Emergency Alert System - SehatKu AI
 * 
 * Enterprise-grade emergency response system with audio-visual alerts.
 * Implements severity-based notifications using Web Audio API for critical conditions.
 * 
 * Features:
 * - Severity classification: Green (Low), Yellow (Medium), Red (Emergency)
 * - Audio alerts using Web Audio API with loud alerts for RED conditions
 * - Visual modal popup with emergency instructions
 * - Auto-integration with hospital module for nearest facility routing
 * - Emergency hotlines display
 * 
 * © 2024 Sehatku AI - Enterprise Healthcare Platform
 */

const EmergencyAlertSystem = {
    // Audio context for sound generation
    audioContext: null,
    
    // Alert thresholds
    SEVERITY: {
        GREEN: 'green',
        YELLOW: 'yellow',
        RED: 'red'
    },
    
    // Emergency hotlines
    HOTLINES: [
        { name: 'Ambulans / IGD', number: '119', available: '24 Jam' },
        { name: 'Halo Kemenkes', number: '1500-567', available: '24 Jam' },
        { name: 'SAR', number: '115', available: '24 Jam' },
        { name: 'Polisi', number: '110', available: '24 Jam' },
        { name: 'Pusat Krisis', number: '119 ext 8', available: '24 Jam' }
    ],

    /**
     * Initialize the emergency alert system
     */
    init() {
        this.createStyles();
        this.createEmergencyModal();
        this.bindEvents();
        console.log('✅ Emergency Alert System initialized');
    },

    /**
     * Create CSS styles for emergency alerts
     */
    createStyles() {
        const styles = document.createElement('style');
        styles.id = 'emergency-alert-styles';
        styles.textContent = `
            /* Emergency Modal Overlay */
            .emergency-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 99999;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }

            .emergency-overlay.active {
                display: flex;
            }

            /* Severity-based backgrounds */
            .emergency-overlay.red {
                background: rgba(220, 38, 38, 0.95);
            }

            .emergency-overlay.yellow {
                background: rgba(234, 179, 8, 0.95);
            }

            .emergency-overlay.green {
                background: rgba(34, 197, 94, 0.95);
            }

            /* Emergency Modal */
            .emergency-modal {
                background: white;
                border-radius: 24px;
                max-width: 550px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                animation: modalSlideIn 0.4s ease;
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            /* Modal Header */
            .emergency-header {
                padding: 32px 32px 20px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
            }

            .emergency-icon {
                font-size: 64px;
                margin-bottom: 16px;
                animation: pulse 1s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .emergency-title {
                font-size: 28px;
                font-weight: 800;
                margin-bottom: 8px;
                color: #1f2937;
            }

            .emergency-overlay.red .emergency-title {
                color: #dc2626;
            }

            .emergency-overlay.yellow .emergency-title {
                color: #d97706;
            }

            .emergency-overlay.green .emergency-title {
                color: #16a34a;
            }

            .emergency-subtitle {
                font-size: 16px;
                color: #6b7280;
            }

            /* Modal Content */
            .emergency-content {
                padding: 24px 32px;
            }

            .emergency-section {
                margin-bottom: 24px;
            }

            .emergency-section h4 {
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #6b7280;
                margin-bottom: 12px;
            }

            /* Diagnosis Card */
            .diagnosis-card {
                background: #f3f4f6;
                border-radius: 12px;
                padding: 16px;
                border-left: 4px solid;
            }

            .emergency-overlay.red .diagnosis-card {
                border-left-color: #dc2626;
            }

            .emergency-overlay.yellow .diagnosis-card {
                border-left-color: #d97706;
            }

            .emergency-overlay.green .diagnosis-card {
                border-left-color: #16a34a;
            }

            .diagnosis-name {
                font-size: 18px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 4px;
            }

            .diagnosis-probability {
                font-size: 14px;
                color: #6b7280;
            }

            /* Recommendations */
            .recommendations-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .recommendations-list li {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 12px 0;
                border-bottom: 1px solid #e5e7eb;
            }

            .recommendations-list li:last-child {
                border-bottom: none;
            }

            .recommendation-icon {
                font-size: 20px;
                flex-shrink: 0;
            }

            .recommendation-text {
                font-size: 15px;
                color: #374151;
                line-height: 1.5;
            }

            /* Hotlines */
            .hotline-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }

            .hotline-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px;
                background: #f3f4f6;
                border-radius: 10px;
                text-decoration: none;
                transition: all 0.2s;
            }

            .hotline-item:hover {
                background: #e5e7eb;
                transform: translateY(-2px);
            }

            .hotline-icon {
                font-size: 24px;
            }

            .hotline-info {
                flex: 1;
            }

            .hotline-name {
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 2px;
            }

            .hotline-number {
                font-size: 16px;
                font-weight: 700;
                color: #1f2937;
            }

            /* Buttons */
            .emergency-buttons {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 24px;
            }

            .emergency-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 16px 24px;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
            }

            .emergency-btn.primary {
                background: linear-gradient(135deg, #dc2626, #b91c1c);
                color: white;
            }

            .emergency-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(220, 38, 38, 0.4);
            }

            .emergency-btn.secondary {
                background: #f3f4f6;
                color: #374151;
            }

            .emergency-btn.secondary:hover {
                background: #e5e7eb;
            }

            .emergency-btn.call-btn {
                background: #10b981;
                color: white;
            }

            .emergency-btn.call-btn:hover {
                background: #059669;
                transform: translateY(-2px);
            }

            /* Nearby Hospital Card */
            .nearby-hospital {
                background: linear-gradient(135deg, #6366f1, #4f46e5);
                border-radius: 16px;
                padding: 20px;
                color: white;
                margin-top: 16px;
            }

            .nearby-hospital h4 {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 12px;
                opacity: 0.9;
            }

            .hospital-name {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .hospital-details {
                display: flex;
                gap: 16px;
                font-size: 14px;
                opacity: 0.9;
                margin-bottom: 12px;
            }

            .hospital-action {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }

            .hospital-action button {
                flex: 1;
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .hospital-action .navigate-btn {
                background: white;
                color: #4f46e5;
            }

            .hospital-action .call-btn {
                background: rgba(255,255,255,0.2);
                color: white;
            }

            /* Dismiss Button */
            .emergency-dismiss {
                text-align: center;
                padding-top: 16px;
                margin-top: 16px;
                border-top: 1px solid #e5e7eb;
            }

            .emergency-dismiss button {
                background: none;
                border: none;
                color: #6b7280;
                font-size: 14px;
                cursor: pointer;
                padding: 8px 16px;
                border-radius: 8px;
                transition: all 0.2s;
            }

            .emergency-dismiss button:hover {
                background: #f3f4f6;
                color: #374151;
            }

            /* Audio indicator */
            .audio-indicator {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #dc2626;
                color: white;
                padding: 12px 20px;
                border-radius: 30px;
                font-size: 14px;
                font-weight: 600;
                display: none;
                align-items: center;
                gap: 8px;
                z-index: 99998;
                box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
            }

            .audio-indicator.active {
                display: flex;
            }

            .audio-indicator .sound-wave {
                display: flex;
                gap: 3px;
            }

            .audio-indicator .sound-wave span {
                width: 4px;
                height: 12px;
                background: white;
                border-radius: 2px;
                animation: soundWave 0.5s ease-in-out infinite;
            }

            .audio-indicator .sound-wave span:nth-child(2) {
                animation-delay: 0.1s;
            }

            .audio-indicator .sound-wave span:nth-child(3) {
                animation-delay: 0.2s;
            }

            @keyframes soundWave {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(1.5); }
            }
        `;
        document.head.appendChild(styles);
    },

    /**
     * Create the emergency modal HTML structure
     */
    createEmergencyModal() {
        const modal = document.createElement('div');
        modal.id = 'emergency-overlay';
        modal.className = 'emergency-overlay';
        modal.innerHTML = `
            <div class="emergency-modal">
                <div class="emergency-header">
                    <div class="emergency-icon" id="emergency-icon">🚨</div>
                    <h2 class="emergency-title" id="emergency-title">PERINGATAN DARURAT</h2>
                    <p class="emergency-subtitle" id="emergency-subtitle">Berdasarkan analisis AI, kondisi Anda memerlukan perhatian medis segera</p>
                </div>
                
                <div class="emergency-content">
                    <!-- Diagnosis Section -->
                    <div class="emergency-section">
                        <h4>Hasil Analisis AI</h4>
                        <div class="diagnosis-card">
                            <div class="diagnosis-name" id="diagnosis-name">Memerlukan Evaluasi</div>
                            <div class="diagnosis-probability" id="diagnosis-probability">Probabilitas: -</div>
                        </div>
                    </div>

                    <!-- Recommendations Section -->
                    <div class="emergency-section">
                        <h4>Tindakan yang Disarankan</h4>
                        <ul class="recommendations-list" id="recommendations-list">
                            <!-- Dynamically populated -->
                        </ul>
                    </div>

                    <!-- Nearby Hospital (for RED severity) -->
                    <div class="nearby-hospital" id="nearby-hospital-section" style="display: none;">
                        <h4>🏥 Rumah Sakit Terdekat</h4>
                        <div class="hospital-name" id="nearby-hospital-name">-</div>
                        <div class="hospital-details">
                            <span id="nearby-distance">-</span>
                            <span id="nearby-eta">-</span>
                        </div>
                        <div class="hospital-action">
                            <button class="navigate-btn" onclick="EmergencyAlertSystem.navigateToHospital()">
                                🧭 Navigasi
                            </button>
                            <button class="call-btn" onclick="EmergencyAlertSystem.callHospital()">
                                📞 Hubungi
                            </button>
                        </div>
                    </div>

                    <!-- Hotlines -->
                    <div class="emergency-section">
                        <h4>📞 Hotline Darurat</h4>
                        <div class="hotline-grid" id="hotline-grid">
                            <!-- Dynamically populated -->
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="emergency-buttons">
                        <button class="emergency-btn primary" id="emergency-call-btn" onclick="EmergencyAlertSystem.callEmergency()">
                            🚑 PANGGIL AMBULANS (119)
                        </button>
                        <button class="emergency-btn call-btn" onclick="EmergencyAlertSystem.showRouteToHospital()">
                            🏥 KE RUMAH SAKIT TERDEKAT
                        </button>
                    </div>

                    <!-- Dismiss -->
                    <div class="emergency-dismiss">
                        <button onclick="EmergencyAlertSystem.dismiss()">
                            Saya mengerti, tutup peringatan ini
                        </button>
                    </div>
                </div>
            </div>

            <!-- Audio Playing Indicator -->
            <div class="audio-indicator" id="audio-indicator">
                <div class="sound-wave">
                    <span></span><span></span><span></span>
                </div>
                <span>🔊 Memutar Peringatan Suara...</span>
            </div>
        `;
        document.body.appendChild(modal);

        // Populate hotlines
        this.populateHotlines();
    },

    /**
     * Populate hotline grid
     */
    populateHotlines() {
        const grid = document.getElementById('hotline-grid');
        if (!grid) return;

        grid.innerHTML = this.HOTLINES.map(hotline => `
            <a href="tel:${hotline.number}" class="hotline-item">
                <span class="hotline-icon">${this.getHotlineIcon(hotline.name)}</span>
                <div class="hotline-info">
                    <div class="hotline-name">${hotline.name}</div>
                    <div class="hotline-number">${hotline.number}</div>
                </div>
            </a>
        `).join('');
    },

    /**
     * Get icon for hotline type
     */
    getHotlineIcon(name) {
        const icons = {
            'Ambulans': '🚑',
            'Halo Kemenkes': '🏥',
            'SAR': '🆘',
            'Polisi': '👮',
            'Pusat Krisis': '🧠'
        };
        return icons[name] || '📞';
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const overlay = document.getElementById('emergency-overlay');
                if (overlay?.classList.contains('active')) {
                    this.dismiss();
                }
            }
        });
    },

    /**
     * Trigger emergency alert based on analysis result
     * @param {Object} analysis - AI analysis result
     * @param {Object} options - Additional options
     */
    async trigger(analysis, options = {}) {
        const severity = analysis.severity || this.SEVERITY.YELLOW;
        const hospitalData = options.hospitalData || null;

        // Update modal content
        this.updateModalContent(analysis, hospitalData);

        // Show modal
        const overlay = document.getElementById('emergency-overlay');
        overlay.className = `emergency-overlay ${severity} active`;

        // Play audio alert for RED severity
        if (severity === this.SEVERITY.RED) {
            await this.playEmergencySound();
        } else if (severity === this.SEVERITY.YELLOW) {
            await this.playWarningSound();
        }

        // Scroll to top
        window.scrollTo(0, 0);

        // Log alert
        console.log(`🚨 Emergency Alert Triggered - Severity: ${severity}`);
    },

    /**
     * Update modal content based on analysis
     */
    updateModalContent(analysis, hospitalData) {
        // Update header
        const severityConfig = {
            red: {
                icon: '🚨',
                title: 'PERINGATAN DARURAT',
                subtitle: 'Berdasarkan analisis AI, kondisi Anda memerlukan perhatian medis SEGERA',
                callText: 'PANGGIL AMBULANS (119)'
            },
            yellow: {
                icon: '⚠️',
                title: 'PERINGATAN SEDANG',
                subtitle: 'Gejala Anda memerlukan konsultasi dengan tenaga medis',
                callText: 'HUBUNGI DOKTER'
            },
            green: {
                icon: 'ℹ️',
                title: 'INFORMASI KESEHATAN',
                subtitle: 'Berikut adalah rekomendasi untuk kondisi Anda',
                callText: 'TUTUP'
            }
        };

        const config = severityConfig[analysis.severity] || severityConfig.yellow;

        document.getElementById('emergency-icon').textContent = config.icon;
        document.getElementById('emergency-title').textContent = config.title;
        document.getElementById('emergency-subtitle').textContent = config.subtitle;
        document.getElementById('emergency-call-btn').innerHTML = `🚑 ${config.callText}`;

        // Update diagnosis
        if (analysis.diagnosis && analysis.diagnosis.length > 0) {
            const topDiagnosis = analysis.diagnosis[0];
            document.getElementById('diagnosis-name').textContent = topDiagnosis.condition || 'Memerlukan Evaluasi';
            document.getElementById('diagnosis-probability').textContent = 
                `Probabilitas: ${topDiagnosis.probability || 0}%`;
        }

        // Update recommendations
        const recList = document.getElementById('recommendations-list');
        const recommendations = analysis.recommendations || [];
        
        if (recommendations.length > 0) {
            recList.innerHTML = recommendations.map((rec, i) => `
                <li>
                    <span class="recommendation-icon">${this.getRecommendationIcon(i)}</span>
                    <span class="recommendation-text">${rec}</span>
                </li>
            `).join('');
        } else {
            recList.innerHTML = '<li><span class="recommendation-icon">📋</span><span class="recommendation-text">Konsultasikan dengan tenaga medis untuk penanganan lebih lanjut.</span></li>';
        }

        // Show nearby hospital for RED severity
        const hospitalSection = document.getElementById('nearby-hospital-section');
        if (analysis.severity === 'red' && hospitalData) {
            hospitalSection.style.display = 'block';
            document.getElementById('nearby-hospital-name').textContent = hospitalData.nama || 'Rumah Sakit Terdekat';
            document.getElementById('nearby-distance').textContent = `📏 ${hospitalData.jarak ? hospitalData.jarak.toFixed(1) + ' km' : '-'}`;
            document.getElementById('nearby-eta').textContent = `⏱️ ${hospitalData.eta || '-'}`;
            this.currentHospital = hospitalData;
        } else {
            hospitalSection.style.display = 'none';
            this.currentHospital = null;
        }
    },

    /**
     * Get icon for recommendation
     */
    getRecommendationIcon(index) {
        const icons = ['💊', '🏥', '🛏️', '🍎', '💧', '🧘', '📞', '⏰', '🚶', '🥗'];
        return icons[index % icons.length];
    },

    /**
     * Play emergency sound using Web Audio API
     */
    async playEmergencySound() {
        try {
            // Initialize audio context on user interaction
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const duration = 3000; // 3 seconds
            const startTime = this.audioContext.currentTime;

            // Create oscillators for siren effect
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Mix oscillators
            const merger = this.audioContext.createChannelMerger(2);
            
            // Configure oscillators for siren
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(440, startTime);
            osc1.frequency.exponentialRampToValueAtTime(880, startTime + 0.5);
            
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(440, startTime);
            osc2.frequency.exponentialRampToValueAtTime(880, startTime + 0.5);
            
            // Alternating siren pattern
            osc1.frequency.setValueAtTime(880, startTime + 0.5);
            osc1.frequency.exponentialRampToValueAtTime(440, startTime + 1);
            
            osc2.frequency.setValueAtTime(880, startTime + 0.5);
            osc2.frequency.exponentialRampToValueAtTime(440, startTime + 1);

            // Volume envelope
            gainNode.gain.setValueAtTime(0.8, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration / 1000);

            // Connect nodes
            osc1.connect(merger, 0, 0);
            osc2.connect(merger, 0, 1);
            merger.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Start and stop
            osc1.start(startTime);
            osc2.start(startTime);
            osc1.stop(startTime + duration / 1000);
            osc2.stop(startTime + duration / 1000);

            // Show audio indicator
            const indicator = document.getElementById('audio-indicator');
            indicator.classList.add('active');
            setTimeout(() => indicator.classList.remove('active'), duration);

        } catch (error) {
            console.error('❌ Audio playback failed:', error);
        }
    },

    /**
     * Play warning sound for yellow severity
     */
    async playWarningSound() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const duration = 1500;
            const startTime = this.audioContext.currentTime;
            
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, startTime);
            osc.frequency.exponentialRampToValueAtTime(800, startTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.5, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration / 1000);
            
            osc.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            osc.start(startTime);
            osc.stop(startTime + duration / 1000);

        } catch (error) {
            console.error('❌ Warning sound failed:', error);
        }
    },

    /**
     * Call emergency number
     */
    callEmergency() {
        window.location.href = 'tel:119';
    },

    /**
     * Call nearest hospital
     */
    callHospital() {
        if (this.currentHospital && this.currentHospital.telepon) {
            window.location.href = `tel:${this.currentHospital.telepon}`;
        } else {
            NotificationSystem.show('Nomor telepon tidak tersedia', 'error');
        }
    },

    /**
     * Navigate to hospital using external maps
     */
    navigateToHospital() {
        if (this.currentHospital && this.currentHospital.koordinat) {
            const { lat, lng } = this.currentHospital.koordinat;
            // Open in Google Maps
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        } else {
            NotificationSystem.show('Koordinat tidak tersedia', 'error');
        }
    },

    /**
     * Show route to hospital
     */
    showRouteToHospital() {
        if (this.currentHospital) {
            this.navigateToHospital();
        } else {
            // Find nearest hospital
            if (window.HospitalModule && HospitalModule.hospitals && HospitalModule.hospitals.length > 0) {
                const nearest = HospitalModule.hospitals[0];
                this.currentHospital = nearest;
                this.navigateToHospital();
            } else {
                NotificationSystem.show('Mencari rumah sakit terdekat...', 'info');
                // Trigger location and search
                if (window.HospitalModule) {
                    HospitalModule.getCurrentLocation().then(() => {
                        if (HospitalModule.hospitals.length > 0) {
                            this.currentHospital = HospitalModule.hospitals[0];
                            this.navigateToHospital();
                        }
                    });
                }
            }
        }
    },

    /**
     * Dismiss emergency modal
     */
    dismiss() {
        const overlay = document.getElementById('emergency-overlay');
        overlay.classList.remove('active');
        
        // Stop any playing audio
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    },

    /**
     * Check if alert is currently active
     */
    isActive() {
        const overlay = document.getElementById('emergency-overlay');
        return overlay?.classList.contains('active');
    }
};

// Global exposure
window.EmergencyAlertSystem = EmergencyAlertSystem;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    EmergencyAlertSystem.init();
});

