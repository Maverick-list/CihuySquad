/**
 * Prediction Routes
 * 
 * Endpoint untuk prediksi risiko penyakit:
 * - Diabetes
 * - Hipertensi
 * - Kardiovaskular
 */

const express = require('express');
const router = express.Router();
const predictionService = require('../services/prediction-service');

/**
 * POST /api/prediction/diabetes
 * Prediksi risiko diabetes
 * 
 * Body:
 * - umur: Number
 * - bmi: Number
 * - jenisKelamin: String
 * - riwayatPenyakitKeluarga: Array
 * - aktivitasFisik: String
 * - pola_makan: String
 */
router.post('/diabetes', async (req, res) => {
    try {
        const userData = req.body;

        // Validasi input dasar
        if (!userData.umur || !userData.bmi) {
            return res.status(400).json({
                success: false,
                message: 'Data umur dan BMI wajib diisi'
            });
        }

        // Prediksi risiko
        const result = await predictionService.predictDiabetesRisk(userData);

        res.json(result);

    } catch (error) {
        console.error('Error in diabetes prediction:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memprediksi risiko diabetes',
            error: error.message
        });
    }
});

/**
 * POST /api/prediction/hypertension
 * Prediksi risiko hipertensi
 */
router.post('/hypertension', async (req, res) => {
    try {
        const userData = req.body;

        if (!userData.umur || !userData.bmi) {
            return res.status(400).json({
                success: false,
                message: 'Data umur dan BMI wajib diisi'
            });
        }

        const result = await predictionService.predictHypertensionRisk(userData);

        res.json(result);

    } catch (error) {
        console.error('Error in hypertension prediction:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memprediksi risiko hipertensi',
            error: error.message
        });
    }
});

/**
 * POST /api/prediction/cardiovascular
 * Prediksi risiko penyakit kardiovaskular
 */
router.post('/cardiovascular', async (req, res) => {
    try {
        const userData = req.body;

        if (!userData.umur || !userData.bmi) {
            return res.status(400).json({
                success: false,
                message: 'Data umur dan BMI wajib diisi'
            });
        }

        const result = await predictionService.predictCardiovascularRisk(userData);

        res.json(result);

    } catch (error) {
        console.error('Error in cardiovascular prediction:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memprediksi risiko kardiovaskular',
            error: error.message
        });
    }
});

/**
 * POST /api/prediction/all
 * Prediksi semua risiko sekaligus
 */
router.post('/all', async (req, res) => {
    try {
        const userData = req.body;

        if (!userData.umur || !userData.bmi) {
            return res.status(400).json({
                success: false,
                message: 'Data umur dan BMI wajib diisi'
            });
        }

        // Jalankan semua prediksi secara parallel
        const [diabetes, hypertension, cardiovascular] = await Promise.all([
            predictionService.predictDiabetesRisk(userData),
            predictionService.predictHypertensionRisk(userData),
            predictionService.predictCardiovascularRisk(userData)
        ]);

        res.json({
            success: true,
            predictions: {
                diabetes,
                hypertension,
                cardiovascular
            },
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Error in all predictions:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memprediksi risiko penyakit',
            error: error.message
        });
    }
});

module.exports = router;
