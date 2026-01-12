/**
 * Dashboard Module
 * 
 * Modul untuk Health Dashboard dengan error handling yang robust.
 * FITUR:
 * - Display health metrics
 * - Data visualization placeholder
 * - Statistics
 * - Fallback untuk semua state kosong
 * 
 * © 2026 SehatKu AI - Hackathon Ready
 */

// ==================== DASHBOARD UPDATE ====================

/**
 * Initialize Dashboard Module
 */
window.initDashboard = async function () {
    try {
        console.log('📈 Initializing Dashboard...');

        // Load user profile dari API jika authenticated
        if (AppState.auth && AppState.auth.isAuthenticated) {
            await loadProfileData();
        }

        // Update dashboard dengan data yang ada
        updateDashboard();

        console.log('✅ Dashboard initialized');
    } catch (error) {
        console.error('❌ Dashboard init error:', error);
    }
};

/**
 * Load user profile data from API
 */
async function loadProfileData() {
    try {
        const response = await API.getProfile();

        if (response.success && response.user) {
            // Update AppState dengan data dari server
            AppState.userData = {
                nama: response.user.nama,
                tinggiBadan: response.user.tinggiBadan,
                beratBadan: response.user.beratBadan,
                jenisKelamin: response.user.jenisKelamin,
                golonganDarah: response.user.golonganDarah,
                tanggalLahir: response.user.tanggalLahir,
                alergi: response.user.alergi || [],
                riwayatPenyakit: response.user.riwayatPenyakit || []
            };
            AppState.save();
            console.log('✅ Profile data loaded from server');
        }
    } catch (error) {
        console.warn('⚠️ Failed to load profile from API, using cached data:', error.message);
    }
}

/**
 * Update dashboard dengan data terbaru
 */
window.updateDashboard = function () {
    try {
        // Update semua metrics
        updateBMIMetric();
        updateConsultationCount();
        updateHighestRisk();
        updateHealthStatus();
        updateChart();

        console.log('✅ Dashboard updated');
    } catch (error) {
        console.error('❌ Error updating dashboard:', error);
    }
};

/**
 * Update BMI metric dengan aman
 */
function updateBMIMetric() {
    try {
        const bmiValue = document.getElementById('bmiValue');
        const bmiCategory = document.getElementById('bmiCategory');

        if (!bmiValue || !bmiCategory) {
            console.warn('⚠️ BMI elements not found');
            return;
        }

        // Get user data dengan fallback
        let userData = null;
        try {
            userData = AppState.userData ||
                (AppState.healthMetrics && AppState.healthMetrics.userData) ||
                null;
        } catch (e) {
            userData = null;
        }

        if (userData && userData.tinggiBadan && userData.beratBadan) {
            const tinggiMeter = userData.tinggiBadan / 100;
            const bmi = userData.beratBadan / (tinggiMeter * tinggiMeter);

            if (isNaN(bmi) || !isFinite(bmi)) {
                bmiValue.textContent = '-';
                bmiCategory.textContent = 'Data tidak valid';
                return;
            }

            bmiValue.textContent = bmi.toFixed(1);

            const category = getBMICategory(bmi);
            bmiCategory.textContent = category;
            bmiCategory.style.color = getBMICategoryColor(bmi);
        } else {
            // State default (tidak error)
            bmiValue.textContent = '-';
            bmiCategory.textContent = 'Belum ada data';
            bmiCategory.style.color = 'var(--gray-400)';
        }
    } catch (error) {
        console.error('❌ Error updating BMI metric:', error);
        // Set ke state aman
        const bmiValue = document.getElementById('bmiValue');
        const bmiCategory = document.getElementById('bmiCategory');
        if (bmiValue) bmiValue.textContent = '-';
        if (bmiCategory) {
            bmiCategory.textContent = 'Tidak tersedia';
            bmiCategory.style.color = 'var(--gray-400)';
        }
    }
}

/**
 * Update consultation count dengan aman
 */
function updateConsultationCount() {
    try {
        const countElement = document.getElementById('consultationCount');
        if (!countElement) {
            console.warn('⚠️ Consultation count element not found');
            return;
        }

        // Hitung dari conversation history dan symptoms dengan fallback
        let chatCount = 0;
        let symptomCount = 0;

        try {
            if (AppState.conversationHistory && Array.isArray(AppState.conversationHistory)) {
                chatCount = AppState.conversationHistory.filter(m => m.role === 'user').length;
            }
            if (AppState.symptoms && Array.isArray(AppState.symptoms)) {
                symptomCount = AppState.symptoms.length > 0 ? 1 : 0;
            }
        } catch (e) {
            chatCount = 0;
            symptomCount = 0;
        }

        const totalCount = chatCount + symptomCount;
        countElement.textContent = totalCount.toString();

    } catch (error) {
        console.error('❌ Error updating consultation count:', error);
        const countElement = document.getElementById('consultationCount');
        if (countElement) countElement.textContent = '0';
    }
}

/**
 * Update highest risk dengan aman
 */
function updateHighestRisk() {
    try {
        const riskElement = document.getElementById('highestRisk');
        if (!riskElement) {
            console.warn('⚠️ Highest risk element not found');
            return;
        }

        let highestRisk = '-';
        let riskColor = 'var(--gray-400)';

        try {
            // Cek dari risk predictions
            if (AppState.riskPredictions && typeof AppState.riskPredictions === 'object') {
                const predictions = AppState.riskPredictions;
                let maxRisk = 0;
                let riskName = '';

                if (predictions.diabetes && predictions.diabetes.riskScore > maxRisk) {
                    maxRisk = predictions.diabetes.riskScore;
                    riskName = 'Diabetes';
                }
                if (predictions.hypertension && predictions.hypertension.riskScore > maxRisk) {
                    maxRisk = predictions.hypertension.riskScore;
                    riskName = 'Hipertensi';
                }
                if (predictions.cardiovascular && predictions.cardiovascular.riskScore > maxRisk) {
                    maxRisk = predictions.cardiovascular.riskScore;
                    riskName = 'Kardiovaskular';
                }

                if (maxRisk > 0) {
                    highestRisk = riskName;
                    if (maxRisk > 75) {
                        riskColor = 'var(--error)';
                    } else if (maxRisk > 50) {
                        riskColor = 'var(--warning)';
                    } else {
                        riskColor = 'var(--success)';
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ Error reading risk predictions:', e);
        }

        riskElement.textContent = highestRisk;
        riskElement.style.color = riskColor;

    } catch (error) {
        console.error('❌ Error updating highest risk:', error);
        const riskElement = document.getElementById('highestRisk');
        if (riskElement) {
            riskElement.textContent = '-';
            riskElement.style.color = 'var(--gray-400)';
        }
    }
}

/**
 * Update health status dengan aman
 */
function updateHealthStatus() {
    try {
        const statusElement = document.getElementById('healthStatus');
        if (!statusElement) {
            console.warn('⚠️ Health status element not found');
            return;
        }

        let status = 'Belum Dinilai';
        let statusColor = 'var(--gray-400)';

        try {
            // Simple logic berdasarkan BMI dan data lain
            let userData = AppState.userData;

            if (userData && userData.tinggiBadan && userData.beratBadan) {
                const tinggiMeter = userData.tinggiBadan / 100;
                const bmi = userData.beratBadan / (tinggiMeter * tinggiMeter);

                if (isNaN(bmi) || !isFinite(bmi)) {
                    status = 'Data Tidak Valid';
                    statusColor = 'var(--gray-400)';
                } else if (bmi >= 18.5 && bmi < 25) {
                    status = 'Baik';
                    statusColor = 'var(--success)';
                } else if (bmi < 18.5 || (bmi >= 25 && bmi < 30)) {
                    status = 'Perlu Perhatian';
                    statusColor = 'var(--warning)';
                } else {
                    status = 'Perlu Tindakan';
                    statusColor = 'var(--error)';
                }
            }
        } catch (e) {
            console.warn('⚠️ Error calculating health status:', e);
        }

        statusElement.textContent = status;
        statusElement.style.color = statusColor;

    } catch (error) {
        console.error('❌ Error updating health status:', error);
        const statusElement = document.getElementById('healthStatus');
        if (statusElement) {
            statusElement.textContent = 'Error';
            statusElement.style.color = 'var(--gray-400)';
        }
    }
}

/**
 * Update chart placeholder
 */
function updateChart() {
    try {
        const chartContainer = document.getElementById('chartContainer');
        if (!chartContainer) {
            console.warn('⚠️ Chart container not found');
            return;
        }

        // Cek apakah ada data konsultasi
        let hasData = false;
        try {
            hasData = AppState.conversationHistory && AppState.conversationHistory.length > 2;
        } catch (e) {
            hasData = false;
        }

        if (hasData) {
            // Placeholder untuk chart dengan data
            chartContainer.innerHTML = `
                <div style="text-align: center; color: var(--gray-500); padding: 2rem;">
                    <p>📊 Data konsultasi cukup untuk visualisasi</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                        Grafik akan ditampilkan di sini
                    </p>
                </div>
            `;
        } else {
            // Placeholder default
            chartContainer.innerHTML = `
                <div style="text-align: center; color: var(--gray-500); padding: 2rem;">
                    <p>📊 Riwayat Konsultasi</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem; opacity: 0.7;">
                        Lakukan konsultasi dan prediksi untuk melihat trend kesehatan Anda
                    </p>
                    <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 0.5rem; opacity: 0.5;">
                        <span style="font-size: 1.5rem;">📝</span>
                        <span style="font-size: 1.5rem;">📊</span>
                        <span style="font-size: 1.5rem;">📈</span>
                    </div>
                </div>
            `;
        }

    } catch (error) {
        console.error('❌ Error updating chart:', error);
    }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get BMI category
 */
function getBMICategory(bmi) {
    if (isNaN(bmi) || !isFinite(bmi)) return 'Tidak Valid';
    if (bmi < 18.5) return 'Kurus';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Kelebihan Berat Badan';
    return 'Obesitas';
}

/**
 * Get BMI category color
 */
function getBMICategoryColor(bmi) {
    if (isNaN(bmi) || !isFinite(bmi)) return 'var(--gray-400)';
    if (bmi < 18.5) return 'var(--warning)';
    if (bmi < 25) return 'var(--success)';
    if (bmi < 30) return 'var(--warning)';
    return 'var(--error)';
}

// Export functions
window.initDashboard = window.initDashboard;
window.updateDashboard = window.updateDashboard;

