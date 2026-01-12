/**
 * Hospital Module - SehatKu AI
 *
 * Menangani tracking rumah sakit terdekat dengan geolocation
 * Fallback ke input manual jika geolocation tidak tersedia
 * Premium lock system untuk Google Maps
 */

const HospitalModule = {
    currentLocation: null,
    hospitals: [],
    isLoading: false,
    map: null,
    isPremium: false,

    init() {
        this.checkPremiumStatus();
        this.createHospitalUI();
        this.bindEvents();
    },

    checkPremiumStatus() {
        // Cek status premium dari AppState
        this.isPremium = window.AppState ? window.AppState.isPremium() : false;
    },

    createHospitalUI() {
        // Buat hospital container
        const hospitalContainer = document.createElement('div');
        hospitalContainer.id = 'hospital-container';
        hospitalContainer.innerHTML = `
            <!-- Hospital Tracking Modal -->
            <div class="hospital-overlay" id="hospital-overlay">
                <div class="hospital-modal">
                    <div class="hospital-header">
                        <h2>Cari Rumah Sakit Terdekat</h2>
                        <button class="hospital-close" id="hospital-close">&times;</button>
                    </div>

                    <div class="hospital-content">
                        ${!this.isPremium ? `
                            <!-- Premium Lock Overlay -->
                            <div class="premium-lock-overlay">
                                <div class="premium-lock-content">
                                    <div class="lock-icon">🔒</div>
                                    <h3>Fitur Premium</h3>
                                    <p>Fitur peta rumah sakit terdekat hanya tersedia untuk pengguna Premium</p>
                                    <button class="premium-upgrade-btn" id="premium-upgrade-btn">
                                        Upgrade Premium
                                    </button>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Map Container -->
                        <div class="map-container ${!this.isPremium ? 'locked' : ''}" id="map-container">
                            <div id="hospital-map" class="hospital-map"></div>
                            ${!this.isPremium ? '' : '<div class="map-loading" id="map-loading">Memuat peta...</div>'}
                        </div>

                        <!-- Hospital List -->
                        <div class="hospital-list" id="hospital-list">
                            <h3>Rumah Sakit Terdekat</h3>
                            <div id="hospital-items" class="hospital-items">
                                ${!this.isPremium ? `
                                    <div class="premium-placeholder">
                                        <p>🔒 Upgrade ke Premium untuk melihat daftar rumah sakit terdekat</p>
                                    </div>
                                ` : `
                                    <div class="loading-placeholder">
                                        <p>📍 Deteksi lokasi Anda untuk melihat rumah sakit terdekat</p>
                                    </div>
                                `}
                            </div>
                        </div>

                        <!-- Location Section -->
                        ${this.isPremium ? `
                            <div class="location-section">
                                <div class="location-input">
                                    <button class="location-btn" id="get-location-btn">
                                        <span class="btn-icon">📍</span>
                                        <span>Deteksi Lokasi Otomatis</span>
                                    </button>
                                    <div class="location-manual">
                                        <p style="margin: 8px 0; color: var(--text-secondary); font-size: 14px;">
                                            Atau masukkan koordinat manual:
                                        </p>
                                        <div class="coord-inputs">
                                            <input type="number" id="lat-input" placeholder="Latitude" step="0.000001">
                                            <input type="number" id="lng-input" placeholder="Longitude" step="0.000001">
                                            <button class="coord-btn" id="search-coord-btn">Cari</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(hospitalContainer);
    },

    async initializeMap(lat, lng) {
        // Init Leaflet Map
        const mapElement = document.getElementById('hospital-map');
        if (!mapElement) return;

        // Cleanup existing map if any
        if (this.map) {
            this.map.remove();
        }

        // Default location (Yogyakarta as backend default) or user location
        const center = [lat || -7.7956, lng || 110.3695];

        this.map = L.map(mapElement).setView(center, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // Add user marker if location known
        if (lat && lng) {
            L.marker(center).addTo(this.map)
                .bindPopup('<b>Lokasi Anda</b>')
                .openPopup();

            // Circle radius
            L.circle(center, {
                color: '#6366f1',
                fillColor: '#6366f1',
                fillOpacity: 0.1,
                radius: 2000 // 2km
            }).addTo(this.map);
        }

        // Fetch hospitals from API
        await this.fetchNearbyHospitals(lat, lng);
    },

    async fetchNearbyHospitals(lat, lng) {
        const hospitalList = document.getElementById('hospital-items');
        const loadingSpinner = document.getElementById('hospital-loading');

        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (hospitalList) hospitalList.innerHTML = '';

        try {
            // Call API
            const response = await API.getNearbyHospitals(lat, lng);

            if (response.success && response.hospitals) {
                this.hospitals = response.hospitals;
                this.renderHospitalList(this.hospitals);
                this.renderMapMarkers(this.hospitals);
            } else {
                throw new Error('Gagal mengambil data rumah sakit');
            }
        } catch (error) {
            console.error('Error fetching hospitals:', error);
            if (hospitalList) {
                hospitalList.innerHTML = `
                    <div class="no-results">
                        <p>⚠️ Gagal memuat data rumah sakit. Silakan coba lagi.</p>
                    </div>
                `;
            }
        } finally {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    },

    renderMapMarkers(hospitals) {
        if (!this.map) return;

        hospitals.forEach(h => {
            if (h.koordinat && h.koordinat.lat && h.koordinat.lng) {
                const marker = L.marker([h.koordinat.lat, h.koordinat.lng]).addTo(this.map);

                const popupContent = `
                    <div style="min-width: 200px;">
                        <h4 style="margin: 0 0 5px;">${h.nama}</h4>
                        <p style="margin: 0; font-size: 12px;">${h.jenis}</p>
                        <p style="margin: 5px 0 0; font-weight: bold; color: ${h.emergency ? '#ef4444' : '#10b981'}">
                            ${h.emergency ? '🚨 IGD 24 Jam' : '✅ Buka'}
                        </p>
                    </div>
                `;

                marker.bindPopup(popupContent);
            }
        });
    },

    renderHospitalList(hospitals) {
        const hospitalItems = document.getElementById('hospital-items');
        if (!hospitalItems) return;

        if (hospitals.length === 0) {
            hospitalItems.innerHTML = '<div class="no-results"><p>Tidak ada rumah sakit ditemukan di sekitar lokasi ini.</p></div>';
            return;
        }

        hospitalItems.innerHTML = hospitals.map(h => `
            <div class="hospital-card" onclick="HospitalModule.showDetail('${h.id}')">
                <div class="hospital-info">
                    <h4 class="hospital-name">${h.nama}</h4>
                    <span class="hospital-type">${h.jenis}</span>
                    <div class="hospital-address">
                        <span>📍</span> ${h.alamat}
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 8px;">
                        ${h.jarak ? `<span class="hospital-distance">📏 ${h.jarak.toFixed(1)} km</span>` : ''}
                        <div class="hospital-rating">⭐ ${h.rating}</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    showDetail(id) {
        const hospital = this.hospitals.find(h => h.id === id);
        if (!hospital) return;

        // Populate detail modal
        const detailContainer = document.getElementById('hospital-detail');
        if (detailContainer) {
            detailContainer.innerHTML = `
                <div class="detail-header">
                    <h3 class="detail-name">${hospital.nama}</h3>
                    <div class="detail-type">${hospital.jenis}</div>
                    <div style="margin-top: 5px; color: gold;">⭐ ${hospital.rating}</div>
                </div>
                
                <div class="detail-section">
                    <h4>📍 Alamat</h4>
                    <p>${hospital.alamat}</p>
                </div>

                <div class="detail-section">
                    <h4>📞 Kontak</h4>
                    <div class="detail-contact">
                        <a href="tel:${hospital.telepon}">${hospital.telepon}</a>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>🏥 Fasilitas</h4>
                    <div class="detail-list">
                        ${hospital.fasilitas.map(f => `<span class="detail-tag">${f}</span>`).join('')}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>👨‍⚕️ Spesialisasi</h4>
                    <div class="detail-list">
                        ${hospital.spesialisasi.map(s => `<span class="detail-tag">${s}</span>`).join('')}
                    </div>
                </div>
                
                ${hospital.emergency ? `
                    <div class="detail-section" style="margin-top: 20px;">
                        <button class="emergency-btn" onclick="window.location.href='tel:${hospital.telepon}'">
                            📞 Hubungi IGD
                        </button>
                    </div>
                ` : ''}
            `;

            this.showDetailModal();
        }
    },
    bindEvents() {
        // Close modals
        document.getElementById('hospital-close')?.addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('hospital-detail-close')?.addEventListener('click', () => {
            this.hideDetailModal();
        });

        // Click outside to close
        document.getElementById('hospital-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'hospital-overlay') {
                this.hideModal();
            }
        });

        document.getElementById('hospital-detail-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'hospital-detail-overlay') {
                this.hideDetailModal();
            }
        });

        // Location detection
        document.getElementById('get-location-btn')?.addEventListener('click', () => {
            this.getCurrentLocation();
        });

        // Manual coordinate search
        document.getElementById('search-coord-btn')?.addEventListener('click', () => {
            this.searchByCoordinates();
        });

        // Filters
        document.getElementById('specialty-filter')?.addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('limit-filter')?.addEventListener('change', () => {
            this.applyFilters();
        });

        // Emergency button
        document.getElementById('emergency-btn')?.addEventListener('click', () => {
            this.handleEmergency();
        });

        // Premium upgrade button (Legacy support, might not be needed if map is free)
        document.getElementById('premium-upgrade-btn')?.addEventListener('click', () => {
            this.hideModal();
            if (window.PremiumModule) {
                window.PremiumModule.showModal();
            }
        });
    },

    showModal() {
        const overlay = document.getElementById('hospital-overlay');
        if (overlay) overlay.style.display = 'flex';

        // Initialize map for everyone (Leaflet is free)
        setTimeout(() => {
            // If we have a stored location, use it, otherwise default
            const lat = this.currentLocation ? this.currentLocation.lat : undefined;
            const lng = this.currentLocation ? this.currentLocation.lng : undefined;
            this.initializeMap(lat, lng);
        }, 100);
    },

    hideModal() {
        const overlay = document.getElementById('hospital-overlay');
        if (overlay) overlay.style.display = 'none';

        // Remove map instance to clean up
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    },

    showDetailModal() {
        const overlay = document.getElementById('hospital-detail-overlay');
        if (overlay) overlay.style.display = 'flex';
    },

    hideDetailModal() {
        const overlay = document.getElementById('hospital-detail-overlay');
        if (overlay) overlay.style.display = 'none';
    },

    async getCurrentLocation() {
        const btn = document.getElementById('get-location-btn');
        const locationDiv = document.getElementById('current-location'); // Make sure this exists in your HTML or handle null
        const locationText = document.getElementById('location-text'); // Make sure this exists

        if (!navigator.geolocation) {
            NotificationSystem.show('Browser Anda tidak mendukung geolocation', 'error');
            return;
        }

        // Update UI
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="btn-icon">⏳</span><span>Mendeteksi lokasi...</span>';
        }

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                });
            });

            this.currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Auto search hospitals with new location
            this.initializeMap(this.currentLocation.lat, this.currentLocation.lng);
            NotificationSystem.show('Lokasi berhasil dideteksi!', 'success');

        } catch (error) {
            console.error('Geolocation error:', error);
            NotificationSystem.show('Gagal mendapatkan lokasi. Pastikan GPS aktif.', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span class="btn-icon">📍</span><span>Deteksi Lokasi Otomatis</span>';
            }
        }
    },

    searchByCoordinates() {
        const latInput = document.getElementById('lat-input');
        const lngInput = document.getElementById('lng-input');

        if (!latInput || !lngInput) return;

        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);

        if (isNaN(lat) || isNaN(lng)) {
            NotificationSystem.show('Masukkan koordinat yang valid', 'error');
            return;
        }

        this.currentLocation = { lat, lng };
        this.initializeMap(lat, lng);
    },

    applyFilters() {
        if (this.currentLocation) {
            this.fetchNearbyHospitals(this.currentLocation.lat, this.currentLocation.lng);
        }
    },

    async handleEmergency() {
        if (!this.currentLocation) {
            NotificationSystem.show('Deteksi lokasi terlebih dahulu untuk panggilan darurat', 'error');
            return;
        }

        if (!confirm('Apakah Anda yakin ingin melakukan panggilan darurat? Ini akan mengirim lokasi Anda ke rumah sakit terdekat.')) {
            return;
        }

        try {
            const response = await API.emergencyContact({
                lat: this.currentLocation.lat,
                lng: this.currentLocation.lng,
                emergencyType: 'general',
                description: 'Emergency call from SehatKu AI app'
            });

            if (response.success) {
                NotificationSystem.show('Panggilan darurat telah dikirim! Bantuan segera akan datang.', 'success');

                // Show nearest hospitals info in alert
                if (response.nearestHospitals && response.nearestHospitals.length > 0) {
                    let message = 'Rumah sakit terdekat yang dihubungi:\n';
                    response.nearestHospitals.forEach(hospital => {
                        message += `• ${hospital.nama}: ${hospital.telepon}\n`;
                    });
                    alert(message);
                }
            } else {
                NotificationSystem.show('Gagal mengirim panggilan darurat', 'error');
            }
        } catch (error) {
            console.error('Emergency contact error:', error);
            NotificationSystem.show('Terjadi kesalahan saat panggilan darurat', 'error');
        }
    }
};

// Export untuk digunakan di app.js
window.HospitalModule = HospitalModule;