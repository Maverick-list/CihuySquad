/**
 * Emergency Module - SehatKu AI
 *
 * Global emergency notification system with audio alerts.
 * Triggers high-priority modals and audio notifications for critical situations.
 *
 * Features:
 * - Global notification listener for Red severity alerts
 * - High-priority emergency modal with instructions
 * - Web Audio API integration for emergency_alert.mp3
 * - Automatic ER highlighting on map
 * - Emergency contact integration
 */

class EmergencyModule {
    constructor() {
        this.isActive = false;
        this.audioContext = null;
        this.audioBuffer = null;
        this.emergencyModal = null;
        this.alertSound = null;

        // Emergency contacts (Indonesian emergency numbers)
        this.emergencyContacts = {
            ambulance: '118',
            police: '110',
            fire: '113',
            emergencyRoom: '119'
        };

        this.init();
    }

    /**
     * Initialize emergency module
     */
    init() {
        this.createEmergencyModal();
        this.loadEmergencySound();
        this.setupGlobalListener();
    }

    /**
     * Setup global listener for emergency events
     */
    setupGlobalListener() {
        // Listen for custom emergency events
        window.addEventListener('emergency-alert', (event) => {
            this.triggerEmergency(event.detail);
        });

        // Listen for AI survey results with Red severity
        window.addEventListener('ai-survey-result', (event) => {
            const { severity, diagnosis, action } = event.detail;
            if (severity === 'Red') {
                this.triggerEmergency({
                    severity,
                    diagnosis,
                    recommendedAction: action,
                    timestamp: new Date()
                });
            }
        });
    }

    /**
     * Trigger emergency alert system
     * @param {Object} emergencyData - Emergency data from AI assessment
     */
    async triggerEmergency(emergencyData) {
        if (this.isActive) return; // Prevent multiple simultaneous emergencies

        this.isActive = true;

        try {
            // Play emergency sound
            await this.playEmergencySound();

            // Show emergency modal
            this.showEmergencyModal(emergencyData);

            // Highlight nearest ER on map if available
            if (window.mapService && window.mapService.userLocation) {
                await this.highlightNearestER();
            }

            // Log emergency event
            this.logEmergencyEvent(emergencyData);

        } catch (error) {
            console.error('Emergency trigger error:', error);
            // Fallback: show basic alert
            alert('EMERGENCY: ' + emergencyData.diagnosis + '\n' + emergencyData.recommendedAction);
        }
    }

    /**
     * Load emergency alert sound using Web Audio API
     */
    async loadEmergencySound() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Load emergency sound file
            const response = await fetch('/assets/audio/emergency_alert.mp3');
            const arrayBuffer = await response.arrayBuffer();

            // Decode audio data
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        } catch (error) {
            console.warn('Could not load emergency sound:', error);
            // Fallback to system beep
            this.alertSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzeO1fLNfCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzeO1fLNfCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzeO1fLNfCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzeO1fLNfCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzeO1fLNfCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzeO1fLNfCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzeO1fLNfCsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQd');
        }
    }

    /**
     * Play emergency alert sound
     */
    async playEmergencySound() {
        try {
            if (this.audioBuffer && this.audioContext) {
                // Create audio source
                const source = this.audioContext.createBufferSource();
                source.buffer = this.audioBuffer;

                // Create gain node for volume control
                const gainNode = this.audioContext.createGain();
                gainNode.gain.setValueAtTime(0.8, this.audioContext.currentTime); // 80% volume

                // Connect nodes
                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                // Play sound (loop for emergency)
                source.loop = true;
                source.start(0);

                // Stop after 10 seconds
                setTimeout(() => {
                    source.stop();
                }, 10000);

            } else if (this.alertSound) {
                // Fallback to HTML5 audio
                this.alertSound.loop = true;
                await this.alertSound.play();

                // Stop after 10 seconds
                setTimeout(() => {
                    this.alertSound.pause();
                    this.alertSound.currentTime = 0;
                }, 10000);
            }

        } catch (error) {
            console.warn('Could not play emergency sound:', error);
            // Fallback: system beep alert
            if ('vibrate' in navigator) {
                navigator.vibrate([500, 200, 500, 200, 500]); // Emergency vibration pattern
            }
        }
    }

    /**
     * Create emergency modal element
     */
    createEmergencyModal() {
        const modal = document.createElement('div');
        modal.id = 'emergency-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-red-900 bg-opacity-90 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
                <!-- Emergency Header -->
                <div class="bg-red-600 text-white p-6 text-center">
                    <div class="flex items-center justify-center mb-4">
                        <div class="animate-pulse">
                            <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                    </div>
                    <h2 class="text-2xl font-bold mb-2">DARURAT MEDIS</h2>
                    <p class="text-red-100">Situasi Kritis - Tindakan Segera Diperlukan</p>
                </div>

                <!-- Emergency Content -->
                <div class="p-6">
                    <div id="emergency-content">
                        <!-- Dynamic content will be inserted here -->
                    </div>

                    <!-- Emergency Actions -->
                    <div class="mt-6 space-y-3">
                        <button id="call-ambulance" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                            </svg>
                            Hubungi Ambulans (118)
                        </button>

                        <button id="find-er" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                            </svg>
                            Cari UGD Terdekat
                        </button>

                        <button id="emergency-info" class="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            Informasi Darurat
                        </button>
                    </div>
                </div>

                <!-- Close Button -->
                <div class="bg-gray-50 px-6 py-4 text-center">
                    <button id="close-emergency" class="text-gray-600 hover:text-gray-800 font-medium">
                        Tutup Peringatan
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.emergencyModal = modal;

        // Setup event listeners
        this.setupModalEventListeners();
    }

    /**
     * Setup modal event listeners
     */
    setupModalEventListeners() {
        const closeBtn = this.emergencyModal.querySelector('#close-emergency');
        const ambulanceBtn = this.emergencyModal.querySelector('#call-ambulance');
        const erBtn = this.emergencyModal.querySelector('#find-er');
        const infoBtn = this.emergencyModal.querySelector('#emergency-info');

        closeBtn.addEventListener('click', () => this.hideEmergencyModal());
        ambulanceBtn.addEventListener('click', () => this.callEmergency('ambulance'));
        erBtn.addEventListener('click', () => this.findNearestER());
        infoBtn.addEventListener('click', () => this.showEmergencyInfo());
    }

    /**
     * Show emergency modal with specific data
     * @param {Object} emergencyData - Emergency assessment data
     */
    showEmergencyModal(emergencyData) {
        const content = this.emergencyModal.querySelector('#emergency-content');

        content.innerHTML = `
            <div class="text-center mb-4">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                </div>
            </div>

            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 class="font-bold text-red-800 mb-2">Diagnosis Awal:</h3>
                <p class="text-red-700">${emergencyData.diagnosis || 'Kondisi kritis terdeteksi'}</p>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 class="font-bold text-blue-800 mb-2">Tindakan Segera:</h3>
                <p class="text-blue-700">${emergencyData.recommendedAction || 'Segera cari bantuan medis profesional'}</p>
            </div>

            <div class="text-sm text-gray-600">
                <p>Waktu deteksi: ${new Date(emergencyData.timestamp).toLocaleString('id-ID')}</p>
            </div>
        `;

        this.emergencyModal.classList.remove('hidden');
        this.emergencyModal.classList.add('flex');
    }

    /**
     * Hide emergency modal
     */
    hideEmergencyModal() {
        this.emergencyModal.classList.add('hidden');
        this.emergencyModal.classList.remove('flex');
        this.isActive = false;
    }

    /**
     * Call emergency service
     * @param {string} service - Emergency service type
     */
    callEmergency(service) {
        const number = this.emergencyContacts[service];
        if (number) {
            window.location.href = `tel:${number}`;
        }
    }

    /**
     * Find and highlight nearest emergency room
     */
    async findNearestER() {
        if (!window.mapService) {
            alert('Layanan peta tidak tersedia');
            return;
        }

        try {
            const hospitals = await window.mapService.searchNearbyPlaces(
                window.mapService.userLocation,
                'hospital',
                10000 // 10km radius
            );

            // Filter for emergency rooms
            const erHospitals = hospitals.filter(h =>
                h.types.includes('hospital') &&
                (h.name.toLowerCase().includes('ugd') ||
                    h.name.toLowerCase().includes('emergency') ||
                    h.name.toLowerCase().includes('gawat darurat'))
            );

            if (erHospitals.length > 0) {
                const nearestER = erHospitals[0];
                window.mapService.highlightEmergencyRoom(nearestER.location);

                // Show directions
                await window.mapService.getDirections(nearestER.location);
            } else {
                // Fallback to nearest hospital
                const nearestHospital = hospitals[0];
                if (nearestHospital) {
                    window.mapService.highlightEmergencyRoom(nearestHospital.location);
                    await window.mapService.getDirections(nearestHospital.location);
                }
            }
        } catch (error) {
            console.error('Error finding ER:', error);
            alert('Tidak dapat menemukan UGD terdekat');
        }
    }

    /**
     * Show emergency information
     */
    showEmergencyInfo() {
        const info = `
INFORMASI DARURAT - SehatKu AI

Nomor Darurat Indonesia:
• Ambulans: 118
• Polisi: 110
• Pemadam Kebakaran: 113
• UGD: 119

Langkah-langkah Darurat:
1. Pastikan keselamatan diri dan orang lain
2. Hubungi layanan darurat segera
3. Berikan informasi lokasi yang jelas
4. Ikuti instruksi petugas medis
5. Jangan panik, tetap tenang

Aplikasi ini memberikan diagnosis awal berdasarkan AI.
Selalu konsultasikan dengan dokter untuk diagnosis pasti.
        `;

        alert(info);
    }

    /**
     * Highlight nearest ER on map
     */
    async highlightNearestER() {
        if (!window.mapService) return;

        try {
            const hospitals = await window.mapService.searchNearbyPlaces(
                window.mapService.userLocation,
                'hospital',
                15000 // 15km for emergency
            );

            const erHospitals = hospitals.filter(h =>
                h.types.includes('hospital') &&
                (h.name.toLowerCase().includes('ugd') ||
                    h.name.toLowerCase().includes('emergency'))
            );

            if (erHospitals.length > 0) {
                window.mapService.highlightEmergencyRoom(erHospitals[0].location);
            }
        } catch (error) {
            console.warn('Could not highlight ER:', error);
        }
    }

    /**
     * Log emergency event for analytics
     * @param {Object} emergencyData - Emergency data
     */
    logEmergencyEvent(emergencyData) {
        const logData = {
            type: 'emergency_triggered',
            timestamp: new Date().toISOString(),
            severity: emergencyData.severity,
            diagnosis: emergencyData.diagnosis,
            userLocation: window.mapService?.userLocation || null,
            userAgent: navigator.userAgent
        };

        // Send to backend for logging
        fetch('/api/emergency/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(logData)
        }).catch(error => {
            console.warn('Could not log emergency event:', error);
        });

        // Store locally as fallback
        const emergencyLogs = JSON.parse(localStorage.getItem('emergency_logs') || '[]');
        emergencyLogs.push(logData);
        localStorage.setItem('emergency_logs', JSON.stringify(emergencyLogs.slice(-10))); // Keep last 10
    }

    /**
     * Manual emergency trigger (for testing)
     */
    triggerTestEmergency() {
        this.triggerEmergency({
            severity: 'Red',
            diagnosis: 'Test Emergency - Kondisi Kritis',
            recommendedAction: 'Segera hubungi layanan darurat',
            timestamp: new Date()
        });
    }
}

// Export an instance wrapper for use in browser
// This allows window.EmergencyModule.init() to work
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmergencyModule;
} else {
    // Create a wrapper that matches the expected interface
    window.EmergencyModule = {
        _instance: null,
        init() {
            if (!this._instance) {
                this._instance = new EmergencyModule();
            }
            console.log('✅ Emergency Module initialized');
            return this._instance;
        },
        trigger(data) {
            if (this._instance) {
                this._instance.triggerEmergency(data);
            }
        },
        triggerTest() {
            if (this._instance) {
                this._instance.triggerTestEmergency();
            }
        }
    };
}