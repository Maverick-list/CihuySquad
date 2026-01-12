/**
 * Symptom Checker Module
 * 
 * Modul untuk fitur AI Symptom Checker dengan rule-based fallback system.
 * FITUR:
 * - Input gejala dari user
 * - Rule-based analysis lokal (tidak bergantung ke API)
 * - Fallback otomatis jika API gagal
 * - Error handling di setiap step
 * 
 * © 2026 SehatKu AI - Hackathon Ready
 */

// ==================== STATE ====================
let currentSymptoms = [];

// ==================== SYMPTOM MANAGEMENT ====================

/**
 * Handle Enter key pada symptom input
 */
window.handleSymptomEnter = function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSymptom();
    }
};

/**
 * Tambah gejala ke list dengan validasi
 */
window.addSymptom = function () {
    try {
        const input = document.getElementById('symptomInput');
        if (!input) {
            console.warn('⚠️ Symptom input element not found');
            return;
        }

        const symptom = input.value.trim();

        // Validasi input
        if (!symptom) {
            showNotification('Mohon masukkan gejala terlebih dahulu', 'warning');
            return;
        }

        // Cek duplikat (case insensitive)
        const exists = currentSymptoms.some(s => s.toLowerCase() === symptom.toLowerCase());
        if (exists) {
            showNotification('Gejala sudah ditambahkan', 'warning');
            input.value = '';
            return;
        }

        // Tambah ke array
        currentSymptoms.push(symptom);

        // Update UI
        renderSymptomList();

        // Clear input
        input.value = '';

        // Enable analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
        }

        // Save to state
        AppState.symptoms = currentSymptoms;
        AppState.save();

        console.log(`✅ Symptom added: ${symptom}`);
    } catch (error) {
        console.error('❌ Error adding symptom:', error);
        showNotification('Gagal menambahkan gejala', 'error');
    }
};

/**
 * Hapus gejala dari list
 */
window.removeSymptom = function (index) {
    try {
        if (index >= 0 && index < currentSymptoms.length) {
            currentSymptoms.splice(index, 1);
            renderSymptomList();

            // Disable analyze button jika tidak ada gejala
            if (currentSymptoms.length === 0) {
                const analyzeBtn = document.getElementById('analyzeBtn');
                if (analyzeBtn) analyzeBtn.disabled = true;
            }

            // Update state
            AppState.symptoms = currentSymptoms;
            AppState.save();

            console.log(`✅ Symptom removed at index: ${index}`);
        }
    } catch (error) {
        console.error('❌ Error removing symptom:', error);
    }
};

/**
 * Render symptom list ke UI
 */
function renderSymptomList() {
    try {
        const container = document.getElementById('symptomList');
        if (!container) {
            console.warn('⚠️ Symptom list container not found');
            return;
        }

        if (currentSymptoms.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-500); text-align: center;">Belum ada gejala yang ditambahkan</p>';
            return;
        }

        container.innerHTML = currentSymptoms.map((symptom, index) => `
            <div class="symptom-tag">
                <span>${escapeHtml(symptom)}</span>
                <button onclick="removeSymptom(${index})" aria-label="Hapus gejala">×</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('❌ Error rendering symptom list:', error);
    }
}

// ==================== AI ANALYSIS ====================

/**
 * Analisis gejala dengan AI (atau fallback lokal jika API gagal)
 */
window.analyzeSymptoms = async function () {
    try {
        // Validasi
        if (currentSymptoms.length === 0) {
            showNotification('Mohon tambahkan minimal 1 gejala', 'warning');
            return;
        }

        const analyzeBtn = document.getElementById('analyzeBtn');
        const resultContainer = document.getElementById('analysisResult');
        const resultContent = document.getElementById('analysisContent');

        if (!analyzeBtn || !resultContainer || !resultContent) {
            console.warn('⚠️ Required elements not found');
            return;
        }

        // Show loading
        setButtonLoading(analyzeBtn, true);
        resultContainer.style.display = 'block';
        resultContent.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div class="loading-spinner" style="margin: 0 auto;"></div>
                <p>AI sedang menganalisis gejala Anda...</p>
            </div>
        `;

        // Get user profile (jika ada)
        const userProfile = AppState.userData || {};

        try {
            // Prepare headers
            const headers = {};
            if (AppState.auth.token) {
                headers['Authorization'] = `Bearer ${AppState.auth.token}`;
            }

            // Coba panggil API (dengan timeout)
            const response = await API.call('/ai/symptom-check', {
                method: 'POST',
                timeout: 15000, // Increase timeout for AI
                headers: headers,
                body: JSON.stringify({
                    symptoms: currentSymptoms,
                    userProfile: userProfile
                })
            });

            // Display hasil (baik dari API maupun fallback)
            if (response && response.analysis) {
                displayAnalysisResult(response.analysis);
                const source = response.isFallback ? '(Mode Offline)' : '(AI Online)';
                showNotification(`Analisis selesai! ${source}`, 'success');
            } else {
                throw new Error('Invalid response format');
            }

        } catch (apiError) {
            console.warn('⚠️ API call failed, using local analysis:', apiError.message);

            // Fallback ke rule-based analysis lokal
            const localAnalysis = performLocalAnalysis(currentSymptoms);
            displayAnalysisResult(localAnalysis);
            showNotification('Analisis selesai (Mode Offline)', 'info');
        }

    } catch (error) {
        console.error('❌ Error analyzing symptoms:', error);
        const resultContent = document.getElementById('analysisContent');
        if (resultContent) {
            resultContent.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--error);">
                    <p>❌ Terjadi kesalahan saat menganalisis gejala.</p>
                    <p style="font-size: 0.875rem; color: var(--gray-400); margin-top: 0.5rem;">
                        Silakan coba lagi atau hubungi support.
                    </p>
                </div>
            `;
        }
        showNotification('Gagal menganalisis gejala', 'error');
    } finally {
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            setButtonLoading(analyzeBtn, false);
        }
    }
};

/**
 * Rule-based analysis lokal
 * Ini akan digunakan jika API gagal atau timeout
 */
function performLocalAnalysis(symptoms) {
    const symptomText = symptoms.join(' ').toLowerCase();
    const diagnosis = [];
    let tingkatKeparahan = 'Ringan';
    let perluKonsultasiDokter = false;

    // Keyword mapping untuk diagnosis
    const conditionMapping = {
        'demam': { name: 'Demam', prob: 90, desc: 'Peningkatan suhu tubuh di atas normal (>37.5°C)', severity: 'Sedang' },
        'panas': { name: 'Demam', prob: 85, desc: 'Peningkatan suhu tubuh', severity: 'Sedang' },
        'batuk': { name: 'Batuk', prob: 75, desc: 'Iritasi pada saluran pernapasan', severity: 'Ringan' },
        'pilek': { name: 'Pilek/Influenza', prob: 80, desc: 'Infeksi saluran pernapasan atas', severity: 'Ringan' },
        'sakit kepala': { name: 'Sakit Kepala', prob: 85, desc: 'Nyeri pada area kepala', severity: 'Ringan' },
        'pusing': { name: 'Pusing', prob: 75, desc: 'Kehilangan keseimbangan sementara', severity: 'Ringan' },
        'mual': { name: 'Mual', prob: 70, desc: 'Sensasi ingin muntah', severity: 'Ringan' },
        'muntah': { name: 'Muntah', prob: 65, desc: 'Pengosongan perut secara paksa', severity: 'Sedang' },
        'diare': { name: 'Diare', prob: 70, desc: 'Pergerakan usus yang meningkat', severity: 'Sedang' },
        'sakit perut': { name: 'Sakit Perut', prob: 75, desc: 'Nyeri pada area perut', severity: 'Ringan' },
        'lemah': { name: 'Kelelahan', prob: 80, desc: 'Kondisi tubuh yang kurang bertenaga', severity: 'Ringan' },
        'lelah': { name: 'Kelelahan', prob: 75, desc: 'Kondisi tubuh yang kurang bertenaga', severity: 'Ringan' },
        'nyeri otot': { name: 'Nyeri Otot', prob: 70, desc: 'Nyeri pada jaringan otot', severity: 'Ringan' },
        'sesak napas': { name: 'Sesak Napas', prob: 60, desc: 'Kesulitan bernapas', severity: 'Berat' },
        'nyeri dada': { name: 'Nyeri Dada', prob: 55, desc: 'Nyeri di area dada', severity: 'Berat' }
    };

    // Analyze symptoms
    for (const [keyword, condition] of Object.entries(conditionMapping)) {
        if (symptomText.includes(keyword)) {
            diagnosis.push({
                nama: condition.name,
                probabilitas: condition.prob,
                deskripsi: condition.desc
            });

            if (condition.severity === 'Berat') {
                tingkatKeparahan = 'Berat';
                perluKonsultasiDokter = true;
            } else if (condition.severity === 'Sedang' && tingkatKeparahan !== 'Berat') {
                tingkatKeparahan = 'Sedang';
            }
        }
    }

    // Jika tidak ada diagnosis, beri rekomendasi umum
    if (diagnosis.length === 0) {
        diagnosis.push({
            nama: 'Perlu Evaluasi Lebih Lanjut',
            probabilitas: 50,
            deskripsi: 'Gejala yang Anda rasakan memerlukan pemeriksaan medis untuk diagnosis akurat.'
        });
        perluKonsultasiDokter = true;
    }

    // Generate rekomendasi
    let rekomendasiTindakan = generateRecommendations(diagnosis, tingkatKeparahan);

    return {
        tingkatKeparahan,
        kemungkinanDiagnosis: diagnosis.slice(0, 3),
        rekomendasiTindakan: rekomendasiTindakan,
        perluKonsultasiDokter,
        isLocalAnalysis: true
    };
}

/**
 * Generate rekomendasi berdasarkan diagnosis
 */
function generateRecommendations(diagnosis, severity) {
    let recommendations = [];

    // Rekomendasi umum
    recommendations.push('Istirahat yang cukup (7-8 jam per hari)');
    recommendations.push('Konsumsi air putih yang cukup (minimal 2 liter per hari)');
    recommendations.push('Konsumsi makanan bergizi seimbang');

    // Rekomendasi berdasarkan severity
    if (severity === 'Berat') {
        recommendations = [
            '⚠️ SEGERA konsultasi dengan dokter atau tenaga medis',
            'Jika gejala memburuk, segera ke IGD atau rumah sakit terdekat',
            'Jangan menunda pemeriksaan medis'
        ];
    } else if (severity === 'Sedang') {
        recommendations.push('Disarankan untuk konsultasi dengan dokter dalam 1-2 hari');
    }

    // Rekomendasi spesifik berdasarkan keyword
    const symptomText = diagnosis.map(d => d.nama.toLowerCase()).join(' ');

    if (symptomText.includes('demam')) {
        recommendations.push('Kompres hangat untuk menurunkan suhu');
        recommendations.push('Konsumsi parasetamol sesuai dosis jika diperlukan');
    }

    if (symptomText.includes('batuk') || symptomText.includes('pilek')) {
        recommendations.push('Konsumsi jahe hangat atau madu');
        recommendations.push('Hindari udara dingin dan asap');
    }

    if (symptomText.includes('sakit kepala') || symptomText.includes('pusing')) {
        recommendations.push('Istirahat di ruangan yang tenang dan gelap');
        recommendations.push('Hindari layar komputer/HP terlalu lama');
        recommendations.push('Minum air yang cukup');
    }

    if (symptomText.includes('mual') || symptomText.includes('muntah')) {
        recommendations.push('Hindari makanan pedas, berminyak, dan berat');
        recommendations.push('Konsumsi makanan dalam porsi kecil tapi sering');
        recommendations.push('Minum air jahe hangat atau oralit');
    }

    return recommendations.join('\n');
}

/**
 * Display hasil analisis AI ke UI
 */
function displayAnalysisResult(analysis) {
    try {
        const resultContent = document.getElementById('analysisContent');
        if (!resultContent) {
            console.warn('⚠️ Analysis content element not found');
            return;
        }

        // Validasi analysis object
        if (!analysis || typeof analysis !== 'object') {
            resultContent.innerHTML = '<p style="text-align: center; color: var(--error);">❌ Hasil analisis tidak valid</p>';
            return;
        }

        // Normalize keys (handle both old and new structure)
        const diagnosisList = analysis.diagnosis || analysis.kemungkinanDiagnosis || [];
        const severityRaw = analysis.severity || analysis.tingkatKeparahan || 'Yellow';
        const recommendation = analysis.recommendation || analysis.rekomendasiTindakan || '';
        const doctorType = analysis.doctor_type || '';
        const alertMessage = analysis.alert_message || '';
        const needsDoctor = analysis.perluKonsultasiDokter || severityRaw === 'Red' || severityRaw === 'Berat' || severityRaw === 'Darurat';

        // Map severity to UI class and label
        let severityClass = 'Yellow';
        let severityLabel = 'Sedang';

        if (['Green', 'Ringan'].includes(severityRaw)) {
            severityClass = 'Ringan';
            severityLabel = 'Ringan (Aman)';
        } else if (['Yellow', 'Sedang'].includes(severityRaw)) {
            severityClass = 'Sedang';
            severityLabel = 'Sedang (Perlu Perhatian)';
        } else if (['Red', 'Berat', 'Darurat'].includes(severityRaw)) {
            severityClass = 'Berat';
            severityLabel = 'DARURAT / BAHAYA';
        }

        // Build HTML untuk hasil
        let html = '';

        // Show Red Alert if critical
        if (severityClass === 'Berat') {
            html += `
                <div class="emergency-alert-banner">
                    <div class="alert-icon">🚨</div>
                    <div class="alert-content">
                        <h3>PERHATIAN MEDIS SEGERA DIPERLUKAN</h3>
                        <p>${alertMessage || 'Kondisi ini memerlukan penanganan medis segera.'}</p>
                    </div>
                </div>
            `;

            // Trigger emergency sound/modal if needed (handled in Task 4)
            if (window.triggerEmergencyAlert) window.triggerEmergencyAlert();
        }

        // Badge tingkat keparahan
        html += `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h4 style="color: var(--gray-400); font-size: 0.875rem; margin-bottom: 0.5rem;">Tingkat Keparahan</h4>
                <span class="severity-badge severity-${severityClass}">
                    ${severityLabel}
                </span>
                ${analysis.isLocalAnalysis ? '<br><small style="color: var(--gray-500);">(Analisis Lokal)</small>' : ''}
            </div>
        `;

        // Kemungkinan Diagnosis
        if (diagnosisList && diagnosisList.length > 0) {
            html += '<h4 style="margin-bottom: 1rem;">🔍 Kemungkinan Diagnosis</h4>';

            diagnosisList.forEach((d, index) => {
                // Handle different diagnosis object structures
                const name = d.name || d.nama || 'Tidak Diketahui';
                const prob = d.probability || d.probabilitas || 0;
                const desc = d.description || d.deskripsi || '';

                html += `
                    <div class="diagnosis-item">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                            <strong style="color: var(--gray-100);">${index + 1}. ${name}</strong>
                            <span style="color: var(--primary-400); font-weight: 600;">${prob}%</span>
                        </div>
                        ${desc ? `<p style="color: var(--gray-400); font-size: 0.875rem;">${desc}</p>` : ''}
                    </div>
                `;
            });
        }

        // Rekomendasi
        if (recommendation) {
            const formattedRec = recommendation.replace(/\n/g, '<br>');
            html += `
                <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: 0.5rem;">💡 Rekomendasi</h4>
                    <p style="color: var(--gray-300); line-height: 1.8;">${formattedRec}</p>
                </div>
            `;
        }

        // Consult Doctor
        if (needsDoctor || doctorType) {
            html += `
                <div style="margin-top: 1rem; padding: 1rem; background: var(--warning); color: white; border-radius: var(--radius-md);">
                    <strong>⚠️ Penting:</strong> Disarankan konsultasi dengan <strong>${doctorType || 'Dokter'}</strong>.
                    <button onclick="if(window.PremiumModule) window.PremiumModule.showConsultationModal()" style="display: block; width: 100%; margin-top: 10px; padding: 10px; background: white; color: var(--warning); border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                        👨‍⚕️ Konsultasi Sekarang
                    </button>
                </div>
            `;
        }

        // Disclaimer
        html += `
            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--glass-bg); border-radius: var(--radius-md); font-size: 0.875rem; color: var(--gray-400); border: 1px solid var(--glass-border);">
                <strong>Disclaimer:</strong> Hasil analisis ini bersifat informatif dan tidak menggantikan diagnosis medis profesional. 
                Selalu konsultasikan kondisi kesehatan Anda dengan dokter.
            </div>
        `;

        // Add CSS for emergency alert if not exists
        if (!document.getElementById('emergency-styles')) {
            const style = document.createElement('style');
            style.id = 'emergency-styles';
            style.textContent = `
                .emergency-alert-banner {
                    background: #ef4444;
                    color: white;
                    padding: 16px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 20px;
                    animation: pulse-red 2s infinite;
                }
                .alert-icon { font-size: 32px; }
                .alert-content h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: bold; }
                .alert-content p { margin: 0; font-size: 14px; opacity: 0.9; }
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `;
            document.head.appendChild(style);
        }

        resultContent.innerHTML = html;

    } catch (error) {
        console.error('❌ Error displaying analysis result:', error);
    }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Escape HTML untuk mencegah XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Set button loading state
 */
function setButtonLoading(button, isLoading) {
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '⏳ Memproses...';
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || 'Analisis dengan AI';
    }
}

/**
 * Initialize symptom checker saat page load
 */
window.initSymptomChecker = function () {
    try {
        console.log('🩺 Initializing Symptom Checker...');

        // Load saved symptoms jika ada
        if (AppState.symptoms && Array.isArray(AppState.symptoms) && AppState.symptoms.length > 0) {
            currentSymptoms = AppState.symptoms;
            renderSymptomList();
            const analyzeBtn = document.getElementById('analyzeBtn');
            if (analyzeBtn) analyzeBtn.disabled = false;
        }

        console.log('✅ Symptom Checker initialized');
    } catch (error) {
        console.error('❌ Symptom Checker init error:', error);
    }
};

// Export untuk global access
window.handleSymptomEnter = handleSymptomEnter;
window.addSymptom = addSymptom;
window.removeSymptom = removeSymptom;
window.analyzeSymptoms = analyzeSymptoms;
window.initSymptomChecker = window.initSymptomChecker;

