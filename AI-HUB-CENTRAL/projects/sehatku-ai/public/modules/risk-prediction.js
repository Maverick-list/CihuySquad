/**
 * Risk Prediction Module
 * 
 * Modul untuk prediksi risiko penyakit dengan rule-based fallback system.
 * FITUR:
 * - Form input data kesehatan
 * - Kalkulasi BMI lokal
 * - Prediksi risiko dengan algoritma lokal (tidak bergantung ke API)
 * - Display hasil prediksi
 * - Error handling di setiap step
 * 
 * © 2026 SehatKu AI - Hackathon Ready
 */

// ==================== STATE ====================
let predictionFormData = null;

// ==================== FORM HANDLING ====================

/**
 * Initialize prediction form
 */
window.initRiskPrediction = function() {
    try {
        console.log('📊 Initializing Risk Prediction...');
        
        const form = document.getElementById('predictionForm');
        
        if (form) {
            form.addEventListener('submit', handlePredictionSubmit);

            // Auto-calculate BMI preview saat input berubah
            const tinggiInput = document.getElementById('tinggiBadan');
            const beratInput = document.getElementById('beratBadan');

            if (tinggiInput && beratInput) {
                tinggiInput.addEventListener('input', updateBMIPreview);
                beratInput.addEventListener('input', updateBMIPreview);
            }
        }
        
        console.log('✅ Risk Prediction initialized');
    } catch (error) {
        console.error('❌ Risk Prediction init error:', error);
    }
};

/**
 * Handle form submission
 */
window.handlePredictionSubmit = async function(event) {
    event.preventDefault();

    try {
        // Get form data
        const formData = getFormData();
        
        // Validasi
        if (!validateFormData(formData)) {
            return;
        }

        // Calculate BMI
        formData.bmi = calculateBMI(formData.tinggiBadan, formData.beratBadan);
        
        // Save form data untuk referensi
        predictionFormData = formData;
        AppState.userData = formData;
        AppState.save();

        // Show loading
        const resultsContainer = document.getElementById('predictionResults');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = '<div style="text-align: center; padding: 2rem;"><div class="loading-spinner" style="margin: 0 auto;"></div><p>Menganalisis data kesehatan Anda...</p></div>';
        }

        try {
            // Coba panggil API
            const predictions = await API.call('/prediction/all', {
                method: 'POST',
                timeout: 5000,
                body: JSON.stringify(formData)
            });

            if (predictions && predictions.success) {
                displayPredictionResults(predictions, formData);
                AppState.riskPredictions = predictions;
                AppState.save();
                
                const source = predictions.isFallback ? '(Mode Offline)' : '(AI Online)';
                showNotification(`Prediksi berhasil! ${source}`, 'success');
            } else {
                throw new Error('Invalid response');
            }

        } catch (apiError) {
            console.warn('⚠️ API call failed, using local prediction:', apiError.message);
            
            // Fallback ke kalkulasi lokal
            const localPredictions = performLocalPrediction(formData);
            displayPredictionResults(localPredictions, formData);
            
            // Simpan hasil
            AppState.riskPredictions = localPredictions;
            AppState.save();
            
            showNotification('Prediksi selesai (Mode Offline)', 'info');
        }

    } catch (error) {
        console.error('❌ Error predicting risk:', error);
        const resultsContainer = document.getElementById('predictionResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="glass-card" style="text-align: center; padding: 2rem; color: var(--error);">
                    <p>❌ Terjadi kesalahan saat memprediksi risiko.</p>
                    <p style="font-size: 0.875rem; color: var(--gray-400); margin-top: 0.5rem;">
                        Silakan coba lagi.
                    </p>
                </div>
            `;
        }
        showNotification('Gagal memprediksi risiko', 'error');
    }
};

/**
 * Get form data dengan validasi
 */
function getFormData() {
    try {
        return {
            umur: parseInt(document.getElementById('umur')?.value) || 30,
            jenisKelamin: document.getElementById('jenisKelamin')?.value || 'Laki-laki',
            tinggiBadan: parseInt(document.getElementById('tinggiBadan')?.value) || 170,
            beratBadan: parseInt(document.getElementById('beratBadan')?.value) || 70,
            aktivitasFisik: document.getElementById('aktivitasFisik')?.value || 'Sedang',
            merokok: document.getElementById('merokok')?.value || 'Tidak'
        };
    } catch (error) {
        console.error('❌ Error getting form data:', error);
        return {
            umur: 30,
            jenisKelamin: 'Laki-laki',
            tinggiBadan: 170,
            beratBadan: 70,
            aktivitasFisik: 'Sedang',
            merokok: 'Tidak'
        };
    }
}

/**
 * Validate form data
 */
function validateFormData(data) {
    if (!data.umur || data.umur < 1 || data.umur > 120) {
        showNotification('Umur tidak valid (harus 1-120 tahun)', 'warning');
        return false;
    }

    if (!data.jenisKelamin) {
        showNotification('Mohon pilih jenis kelamin', 'warning');
        return false;
    }

    if (!data.tinggiBadan || data.tinggiBadan < 50 || data.tinggiBadan > 250) {
        showNotification('Tinggi badan tidak valid (harus 50-250 cm)', 'warning');
        return false;
    }

    if (!data.beratBadan || data.beratBadan < 10 || data.beratBadan > 300) {
        showNotification('Berat badan tidak valid (harus 10-300 kg)', 'warning');
        return false;
    }

    return true;
}

/**
 * Calculate BMI
 */
function calculateBMI(tinggi, berat) {
    try {
        const tinggiMeter = tinggi / 100;
        if (tinggiMeter <= 0) return 0;
        return parseFloat((berat / (tinggiMeter * tinggiMeter)).toFixed(1));
    } catch (error) {
        console.error('❌ BMI calculation error:', error);
        return 0;
    }
}

/**
 * Update BMI preview (saat user mengetik)
 */
function updateBMIPreview() {
    try {
        const tinggi = document.getElementById('tinggiBadan')?.value;
        const berat = document.getElementById('beratBadan')?.value;

        if (tinggi && berat) {
            const bmi = calculateBMI(parseInt(tinggi), parseInt(berat));
            console.log(`BMI Preview: ${bmi.toFixed(1)}`);
        }
    } catch (error) {
        console.warn('⚠️ BMI preview error:', error);
    }
}

// ==================== LOCAL PREDICTION (FALLBACK) ====================

/**
 * Perform local prediction jika API gagal
 */
function performLocalPrediction(data) {
    // Kalkulasi BMI
    const bmi = calculateBMI(data.tinggiBadan, data.beratBadan);
    const bmiCategory = getBMICategory(bmi);
    
    // Faktor risiko base
    const age = data.umur || 30;
    const isSmoker = data.merokok === 'Ya';
    const aktivitasRendah = data.aktivitasFisik === 'Tidak Pernah' || data.aktivitasFisik === 'Jarang';
    const aktivitasTinggi = data.aktivitasFisik === 'Sering';
    const isObese = bmi >= 30;
    const isOverweight = bmi >= 25 && bmi < 30;
    const isMale = data.jenisKelamin === 'Laki-laki';
    const isOlder = age > 45;
    const isSenior = age > 60;
    
    // Kalkulasi risiko Diabetes
    let diabetesRisk = 20; // Base risk
    if (isObese) diabetesRisk += 25;
    else if (isOverweight) diabetesRisk += 15;
    
    if (isOlder) diabetesRisk += 20;
    else if (isSenior) diabetesRisk += 30;
    
    if (isSmoker) diabetesRisk += 15;
    if (aktivitasRendah) diabetesRisk += 15;
    if (aktivitasTinggi) diabetesRisk -= 15;
    
    diabetesRisk = Math.min(95, Math.max(5, diabetesRisk));
    
    // Kalkulasi risiko Hipertensi
    let hypertensionRisk = 15; // Base risk
    if (isObese) hypertensionRisk += 25;
    else if (isOverweight) diabetesRisk += 15;
    
    if (isOlder) hypertensionRisk += 25;
    else if (isSenior) hypertensionRisk += 35;
    
    if (isSmoker) hypertensionRisk += 20;
    if (aktivitasRendah) diabetesRisk += 10;
    
    hypertensionRisk = Math.min(95, Math.max(5, hypertensionRisk));
    
    // Kalkulasi risiko Kardiovaskular
    let cvdRisk = 10; // Base risk
    if (isObese) cvdRisk += 25;
    else if (isOverweight) cvdRisk += 15;
    
    if (isMale) cvdRisk += 5; // Pria berisiko lebih tinggi CV
    
    if (isOlder) cvdRisk += 25;
    else if (isSenior) cvdRisk += 40;
    
    if (isSmoker) cvdRisk += 30;
    if (aktivitasRendah) cvdRisk += 15;
    if (aktivitasTinggi) cvdRisk -= 20;
    
    cvdRisk = Math.min(95, Math.max(5, cvdRisk));
    
    return {
        diabetes: {
            success: true,
            riskScore: diabetesRisk,
            riskLevel: getRiskLevel(diabetesRisk),
            factors: getRiskFactors(data, 'diabetes', bmiCategory),
            recommendations: getRecommendations('diabetes', diabetesRisk),
            isFallback: true
        },
        hypertension: {
            success: true,
            riskScore: hypertensionRisk,
            riskLevel: getRiskLevel(hypertensionRisk),
            factors: getRiskFactors(data, 'hypertension', bmiCategory),
            recommendations: getRecommendations('hypertension', hypertensionRisk),
            isFallback: true
        },
        cardiovascular: {
            success: true,
            riskScore: cvdRisk,
            riskLevel: getRiskLevel(cvdRisk),
            factors: getRiskFactors(data, 'cardiovascular', bmiCategory),
            recommendations: getRecommendations('cardiovascular', cvdRisk),
            isFallback: true
        }
    };
}

/**
 * Get risk level berdasarkan score
 */
function getRiskLevel(score) {
    if (score < 25) return 'Rendah';
    if (score < 50) return 'Sedang';
    if (score < 75) return 'Tinggi';
    return 'Sangat Tinggi';
}

/**
 * Get risk factors
 */
function getRiskFactors(data, disease, bmiCategory) {
    const factors = [];
    const age = data.umur || 30;
    
    if (age > 40) factors.push('Usia di atas 40 tahun');
    if (age > 60) factors.push('Usia lanjut (>60 tahun)');
    if (data.merokok === 'Ya') factors.push('Merokok');
    if (data.aktivitasFisik === 'Tidak Pernah' || data.aktivitasFisik === 'Jarang') factors.push('Kurang aktivitas fisik');
    if (bmiCategory === 'Obesitas') factors.push('Obesitas');
    if (bmiCategory === 'Kelebihan Berat Badan') factors.push('Kelebihan berat badan');
    
    // Disease-specific factors
    if (disease === 'cardiovascular' && data.jenisKelamin === 'Laki-laki') {
        factors.push('Laki-laki berisiko lebih tinggi');
    }
    
    if (factors.length === 0) {
        factors.push('Gaya hidup relatif sehat');
    }
    
    return factors;
}

/**
 * Get recommendations berdasarkan disease dan risk score
 */
function getRecommendations(disease, riskScore) {
    const recommendations = [];
    
    // Rekomendasi umum
    recommendations.push('Jaga pola makan seimbang dengan nutrisi yang cukup');
    recommendations.push('Olahraga teratur minimal 150 menit per minggu');
    recommendations.push('Rutin melakukan pemeriksaan kesehatan');
    
    // Disease-specific
    if (disease === 'diabetes') {
        recommendations[0] = 'Kurangi konsumsi gula dan karbohidrat sederhana';
        recommendations.push('Perbanyak serat dari sayuran dan buah-buahan');
        recommendations.push('Kontrol gula darah secara rutin');
    } else if (disease === 'hypertension') {
        recommendations[0] = 'Batasi konsumsi garam (<5g per hari)';
        recommendations.push('Hindari makanan tinggi sodium');
        recommendations.push('Rutin mengukur tekanan darah');
    } else if (disease === 'cardiovascular') {
        recommendations.push('Hindari merokok dan paparan asap');
        recommendations.push('Kontrol kadar kolesterol');
        recommendations.push('Kelola stres dengan baik');
    }
    
    // Risk-specific
    if (riskScore > 50) {
        recommendations.push('');
        recommendations.push('⚠️ Segera konsultasi dengan dokter untuk pemeriksaan lebih lanjut');
    }
    if (riskScore > 75) {
        recommendations.push('⚠️ PERINGATAN: Risiko tinggi! Segera konsultasi medis.');
    }
    
    return recommendations;
}

/**
 * Get BMI category
 */
function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Kurus';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Kelebihan Berat Badan';
    return 'Obesitas';
}

/**
 * Get risk color untuk CSS
 */
function getRiskColor(riskLevel) {
    switch (riskLevel) {
        case 'Rendah': return 'success';
        case 'Sedang': return 'warning';
        case 'Tinggi': return 'error';
        case 'Sangat Tinggi': return 'error';
        default: return 'gray-400';
    }
}

// ==================== DISPLAY RESULTS ====================

/**
 * Display prediction results
 */
function displayPredictionResults(predictions, userData) {
    try {
        const container = document.getElementById('predictionResults');
        if (!container) {
            console.warn('⚠️ Prediction results container not found');
            return;
        }
        
        // Validasi predictions
        if (!predictions || typeof predictions !== 'object') {
            container.innerHTML = '<p style="color: var(--error);">❌ Hasil prediksi tidak valid</p>';
            return;
        }
        
        const bmi = calculateBMI(userData.tinggiBadan, userData.beratBadan);
        const bmiCategory = getBMICategory(bmi);
        
        let html = '';
        
        // BMI Info Card
        html += `
            <div class="glass-card" style="text-align: center; margin-bottom: 1rem;">
                <h4 style="color: var(--gray-400); font-size: 0.875rem; margin-bottom: 0.5rem;">BMI Anda</h4>
                <div style="font-size: 2.5rem; font-weight: 900; color: var(--primary-400);">
                    ${bmi.toFixed(1)}
                </div>
                <div style="color: var(--gray-300); margin-top: 0.5rem;">
                    ${bmiCategory}
                </div>
                ${predictions.isFallback ? '<small style="color: var(--gray-500);">(Kalkulasi Lokal)</small>' : ''}
            </div>
        `;
        
        // Prediction Cards
        const diseases = [
            { key: 'diabetes', name: 'Diabetes Tipe 2', icon: '🍬' },
            { key: 'hypertension', name: 'Hipertensi', icon: '❤️' },
            { key: 'cardiovascular', name: 'Kardiovaskular', icon: '🫀' }
        ];
        
        diseases.forEach(disease => {
            const prediction = predictions[disease.key];
            
            if (prediction && prediction.success) {
                html += createRiskCard(disease.name, disease.icon, prediction);
            }
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Error displaying prediction results:', error);
    }
}

/**
 * Create risk card HTML
 */
function createRiskCard(diseaseName, icon, prediction) {
    const { riskScore, riskLevel, recommendations, factors } = prediction;
    const riskColor = getRiskColor(riskLevel);
    
    let html = `
        <div class="risk-card">
            <h3 style="margin-bottom: 1rem;">${icon} ${diseaseName}</h3>
            
            <div class="risk-score" style="color: var(--${riskColor});">
                ${riskScore}%
            </div>
            
            <div class="risk-level risk-${riskLevel}">
                Risiko ${riskLevel}
            </div>
    `;
    
    // Factors
    if (factors && factors.length > 0) {
        html += `
            <div style="margin-top: 1rem;">
                <h4 style="font-size: 0.875rem; color: var(--gray-400); margin-bottom: 0.5rem;">Faktor Risiko:</h4>
                <ul style="color: var(--gray-300); font-size: 0.875rem; padding-left: 1.25rem; line-height: 1.6;">
                    ${factors.map(factor => `<li>${factor}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Recommendations
    if (recommendations && recommendations.length > 0) {
        const recText = recommendations.filter(r => r).map(rec => {
            if (rec.startsWith('⚠️')) {
                return `<li style="color: var(--warning); font-weight: 600;">${rec}</li>`;
            }
            return `<li>${rec}</li>`;
        }).join('');
        
        html += `
            <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md);">
                <h4 style="font-size: 0.875rem; margin-bottom: 0.5rem;">💡 Rekomendasi:</h4>
                <ul style="color: var(--gray-300); font-size: 0.875rem; padding-left: 1.25rem; line-height: 1.8;">
                    ${recText}
                </ul>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// Export functions
window.handlePredictionSubmit = window.handlePredictionSubmit;
window.initRiskPrediction = window.initRiskPrediction;

