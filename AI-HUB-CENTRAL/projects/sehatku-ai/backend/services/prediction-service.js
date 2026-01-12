/**
 * Prediction Service
 * 
 * Service untuk prediksi risiko penyakit menggunakan machine learning.
 * Menggunakan model yang sudah di-train untuk memprediksi:
 * - Risiko diabetes
 * - Risiko hipertensi
 * - Risiko penyakit kardiovaskular
 * 
 * Model menggunakan data kesehatan user seperti:
 * - BMI, umur, jenis kelamin
 * - Riwayat penyakit keluarga
 * - Gaya hidup (merokok, olahraga, dll)
 */

class PredictionService {
    constructor() {
        // Threshold untuk klasifikasi risiko
        this.riskThresholds = {
            low: 0.3,
            medium: 0.6,
            high: 0.8
        };
    }

    /**
     * Prediksi risiko diabetes
     * @param {Object} userData - Data user untuk prediksi
     * @returns {Object} - Hasil prediksi
     */
    async predictDiabetesRisk(userData) {
        try {
            // Extract features dari user data
            const features = this.extractDiabetesFeatures(userData);

            // Validasi features
            if (!this.validateFeatures(features)) {
                throw new Error('Data tidak lengkap untuk prediksi');
            }

            // Calculate risk score (simplified model)
            // Dalam production, ini akan menggunakan trained ML model
            const riskScore = this.calculateDiabetesRisk(features);

            // Classify risk level
            const riskLevel = this.classifyRisk(riskScore);

            // Generate recommendations
            const recommendations = this.getDiabetesRecommendations(riskLevel, features);

            return {
                success: true,
                disease: 'Diabetes Tipe 2',
                riskScore: Math.round(riskScore * 100), // Convert to percentage
                riskLevel: riskLevel,
                recommendations: recommendations,
                factors: this.identifyRiskFactors(features, 'diabetes'),
                timestamp: new Date()
            };

        } catch (error) {
            console.error('❌ Error predicting diabetes risk:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Prediksi risiko hipertensi
     * @param {Object} userData - Data user
     * @returns {Object} - Hasil prediksi
     */
    async predictHypertensionRisk(userData) {
        try {
            const features = this.extractHypertensionFeatures(userData);

            if (!this.validateFeatures(features)) {
                throw new Error('Data tidak lengkap untuk prediksi');
            }

            const riskScore = this.calculateHypertensionRisk(features);
            const riskLevel = this.classifyRisk(riskScore);
            const recommendations = this.getHypertensionRecommendations(riskLevel, features);

            return {
                success: true,
                disease: 'Hipertensi',
                riskScore: Math.round(riskScore * 100),
                riskLevel: riskLevel,
                recommendations: recommendations,
                factors: this.identifyRiskFactors(features, 'hypertension'),
                timestamp: new Date()
            };

        } catch (error) {
            console.error('❌ Error predicting hypertension risk:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Prediksi risiko penyakit kardiovaskular
     * @param {Object} userData - Data user
     * @returns {Object} - Hasil prediksi
     */
    async predictCardiovascularRisk(userData) {
        try {
            const features = this.extractCardiovascularFeatures(userData);

            if (!this.validateFeatures(features)) {
                throw new Error('Data tidak lengkap untuk prediksi');
            }

            const riskScore = this.calculateCardiovascularRisk(features);
            const riskLevel = this.classifyRisk(riskScore);
            const recommendations = this.getCardiovascularRecommendations(riskLevel, features);

            return {
                success: true,
                disease: 'Penyakit Kardiovaskular',
                riskScore: Math.round(riskScore * 100),
                riskLevel: riskLevel,
                recommendations: recommendations,
                factors: this.identifyRiskFactors(features, 'cardiovascular'),
                timestamp: new Date()
            };

        } catch (error) {
            console.error('❌ Error predicting cardiovascular risk:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extract features untuk prediksi diabetes
     * @private
     */
    extractDiabetesFeatures(userData) {
        const { umur, bmi, jenisKelamin, riwayatPenyakitKeluarga, aktivitasFisik, pola_makan } = userData;

        return {
            umur: umur || 0,
            bmi: bmi || 0,
            isMale: jenisKelamin === 'Laki-laki' ? 1 : 0,
            familyHistory: riwayatPenyakitKeluarga?.includes('Diabetes') ? 1 : 0,
            lowActivity: aktivitasFisik === 'Jarang' || aktivitasFisik === 'Tidak Pernah' ? 1 : 0,
            poorDiet: pola_makan === 'Tidak Sehat' ? 1 : 0
        };
    }

    /**
     * Extract features untuk prediksi hipertensi
     * @private
     */
    extractHypertensionFeatures(userData) {
        const { umur, bmi, jenisKelamin, riwayatPenyakitKeluarga, merokok, konsumsiGaram, stres } = userData;

        return {
            umur: umur || 0,
            bmi: bmi || 0,
            isMale: jenisKelamin === 'Laki-laki' ? 1 : 0,
            familyHistory: riwayatPenyakitKeluarga?.includes('Hipertensi') ? 1 : 0,
            smoker: merokok === 'Ya' ? 1 : 0,
            highSalt: konsumsiGaram === 'Tinggi' ? 1 : 0,
            highStress: stres === 'Tinggi' ? 1 : 0
        };
    }

    /**
     * Extract features untuk prediksi kardiovaskular
     * @private
     */
    extractCardiovascularFeatures(userData) {
        const { umur, bmi, jenisKelamin, riwayatPenyakitKeluarga, merokok, kolesterol, tekananDarah } = userData;

        return {
            umur: umur || 0,
            bmi: bmi || 0,
            isMale: jenisKelamin === 'Laki-laki' ? 1 : 0,
            familyHistory: riwayatPenyakitKeluarga?.includes('Jantung') ? 1 : 0,
            smoker: merokok === 'Ya' ? 1 : 0,
            highCholesterol: kolesterol > 200 ? 1 : 0,
            highBP: tekananDarah?.sistolik > 140 ? 1 : 0
        };
    }

    /**
     * Calculate diabetes risk score (simplified model)
     * Dalam production, gunakan trained ML model
     * @private
     */
    calculateDiabetesRisk(features) {
        let score = 0;

        // Age factor
        if (features.umur > 45) score += 0.2;
        if (features.umur > 60) score += 0.1;

        // BMI factor
        if (features.bmi > 25) score += 0.15;
        if (features.bmi > 30) score += 0.15;

        // Family history
        if (features.familyHistory) score += 0.2;

        // Lifestyle factors
        if (features.lowActivity) score += 0.1;
        if (features.poorDiet) score += 0.1;

        return Math.min(score, 1.0); // Cap at 1.0
    }

    /**
     * Calculate hypertension risk score
     * @private
     */
    calculateHypertensionRisk(features) {
        let score = 0;

        if (features.umur > 40) score += 0.15;
        if (features.umur > 60) score += 0.15;
        if (features.bmi > 25) score += 0.15;
        if (features.bmi > 30) score += 0.1;
        if (features.familyHistory) score += 0.2;
        if (features.smoker) score += 0.15;
        if (features.highSalt) score += 0.1;
        if (features.highStress) score += 0.1;

        return Math.min(score, 1.0);
    }

    /**
     * Calculate cardiovascular risk score
     * @private
     */
    calculateCardiovascularRisk(features) {
        let score = 0;

        if (features.umur > 50) score += 0.2;
        if (features.umur > 65) score += 0.15;
        if (features.bmi > 30) score += 0.15;
        if (features.familyHistory) score += 0.2;
        if (features.smoker) score += 0.2;
        if (features.highCholesterol) score += 0.15;
        if (features.highBP) score += 0.15;

        return Math.min(score, 1.0);
    }

    /**
     * Classify risk level berdasarkan score
     * @private
     */
    classifyRisk(score) {
        if (score < this.riskThresholds.low) return 'Rendah';
        if (score < this.riskThresholds.medium) return 'Sedang';
        if (score < this.riskThresholds.high) return 'Tinggi';
        return 'Sangat Tinggi';
    }

    /**
     * Validate features
     * @private
     */
    validateFeatures(features) {
        return features.umur > 0 && features.bmi > 0;
    }

    /**
     * Identify risk factors
     * @private
     */
    identifyRiskFactors(features, diseaseType) {
        const factors = [];

        if (features.umur > 45) factors.push('Usia di atas 45 tahun');
        if (features.bmi > 25) factors.push('Kelebihan berat badan (BMI > 25)');
        if (features.bmi > 30) factors.push('Obesitas (BMI > 30)');
        if (features.familyHistory) factors.push('Riwayat penyakit dalam keluarga');
        if (features.smoker) factors.push('Merokok');
        if (features.lowActivity) factors.push('Kurang aktivitas fisik');
        if (features.poorDiet) factors.push('Pola makan tidak sehat');
        if (features.highSalt) factors.push('Konsumsi garam tinggi');
        if (features.highStress) factors.push('Tingkat stres tinggi');
        if (features.highCholesterol) factors.push('Kolesterol tinggi');
        if (features.highBP) factors.push('Tekanan darah tinggi');

        return factors;
    }

    /**
     * Get recommendations untuk diabetes
     * @private
     */
    getDiabetesRecommendations(riskLevel, features) {
        const recommendations = [];

        if (riskLevel === 'Rendah') {
            recommendations.push('Pertahankan gaya hidup sehat Anda');
            recommendations.push('Lakukan pemeriksaan gula darah rutin setiap tahun');
        } else {
            recommendations.push('Konsultasikan dengan dokter untuk pemeriksaan gula darah');
            if (features.bmi > 25) recommendations.push('Turunkan berat badan hingga BMI normal (18.5-24.9)');
            if (features.lowActivity) recommendations.push('Tingkatkan aktivitas fisik minimal 30 menit/hari');
            if (features.poorDiet) recommendations.push('Perbaiki pola makan dengan mengurangi gula dan karbohidrat olahan');
            recommendations.push('Lakukan pemeriksaan HbA1c dan gula darah puasa');
        }

        return recommendations;
    }

    /**
     * Get recommendations untuk hipertensi
     * @private
     */
    getHypertensionRecommendations(riskLevel, features) {
        const recommendations = [];

        if (riskLevel === 'Rendah') {
            recommendations.push('Pertahankan tekanan darah normal dengan gaya hidup sehat');
            recommendations.push('Cek tekanan darah setiap 6 bulan');
        } else {
            recommendations.push('Segera periksa tekanan darah ke dokter atau puskesmas');
            if (features.highSalt) recommendations.push('Kurangi konsumsi garam (maksimal 5 gram/hari)');
            if (features.smoker) recommendations.push('Berhenti merokok untuk menurunkan risiko');
            if (features.bmi > 25) recommendations.push('Turunkan berat badan');
            if (features.highStress) recommendations.push('Kelola stres dengan meditasi atau relaksasi');
            recommendations.push('Tingkatkan konsumsi buah dan sayur');
        }

        return recommendations;
    }

    /**
     * Get recommendations untuk kardiovaskular
     * @private
     */
    getCardiovascularRecommendations(riskLevel, features) {
        const recommendations = [];

        if (riskLevel === 'Rendah') {
            recommendations.push('Pertahankan kesehatan jantung dengan olahraga teratur');
            recommendations.push('Lakukan medical check-up rutin');
        } else {
            recommendations.push('Konsultasi dengan dokter spesialis jantung');
            if (features.smoker) recommendations.push('SEGERA berhenti merokok');
            if (features.highCholesterol) recommendations.push('Kontrol kolesterol dengan diet dan obat jika perlu');
            if (features.highBP) recommendations.push('Kontrol tekanan darah secara rutin');
            recommendations.push('Lakukan pemeriksaan EKG dan profil lipid');
            recommendations.push('Olahraga aerobik 150 menit/minggu');
        }

        return recommendations;
    }
}

// Export singleton instance
module.exports = new PredictionService();
