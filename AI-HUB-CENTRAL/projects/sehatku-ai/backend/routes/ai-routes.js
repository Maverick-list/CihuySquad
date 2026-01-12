/**
 * AI Routes
 * 
 * Endpoint untuk fitur AI:
 * - Symptom checker
 * - Mental health support
 * - Health education
 */

const express = require('express');
const router = express.Router();
const aiService = require('../services/ai-service');
const HealthRecord = require('../models/health-record-model');

const { authenticateToken, optionalAuth } = require('../middleware/auth-middleware');

/**
 * POST /api/ai/symptom-check
 * Analisis gejala dengan AI
 * 
 * Body:
 * - symptoms: Array of strings (gejala yang dialami)
 * - userProfile: Object (umur, jenis kelamin, dll)
 */
router.post('/symptom-check', optionalAuth, async (req, res) => {
    try {
        const { symptoms, userProfile } = req.body;
        const userId = req.user?.userId; // Get from token (optional)

        // Validasi input
        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Gejala harus berupa array dan tidak boleh kosong'
            });
        }

        // Analisis dengan AI
        const result = await aiService.analyzeSymptoms(symptoms, userProfile);

        // Jika ada userId, simpan ke database
        if (userId && result.success) {
            try {
                const healthRecord = new HealthRecord({
                    userId: userId,
                    recordType: 'konsultasi_ai',
                    konsultasiAI: {
                        gejala: symptoms,
                        hasilAnalisis: result.analysis,
                        aiModel: result.model,
                        confidence: 75 // Default confidence
                    }
                });

                await healthRecord.save();
                result.recordId = healthRecord._id;
            } catch (dbError) {
                console.error('Error saving health record:', dbError);
                // Tidak perlu return error, tetap kirim result AI
            }
        }

        res.json(result);

    } catch (error) {
        console.error('Error in symptom-check:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menganalisis gejala',
            error: error.message
        });
    }
});

/**
 * POST /api/ai/mental-health
 * AI companion untuk kesehatan mental
 * 
 * Body:
 * - message: String (pesan dari user)
 * - conversationHistory: Array (optional, riwayat percakapan)
 */
router.post('/mental-health', async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;

        // Validasi input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Pesan tidak boleh kosong'
            });
        }

        // Get AI response
        const result = await aiService.mentalHealthSupport(
            message,
            conversationHistory || []
        );

        res.json(result);

    } catch (error) {
        console.error('Error in mental-health:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada layanan kesehatan mental',
            error: error.message
        });
    }
});

/**
 * POST /api/ai/mental-health/chat
 * Alias untuk kompatibilitas frontend
 */
router.post('/mental-health/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Pesan tidak boleh kosong'
            });
        }

        // Get AI response
        const result = await aiService.mentalHealthSupport(
            message,
            history || []
        );

        res.json(result);

    } catch (error) {
        console.error('Error in mental-health/chat:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada layanan kesehatan mental',
            error: error.message
        });
    }
});

/**
 * GET /api/ai/status
 * Cek status AI service
 */
router.get('/status', async (req, res) => {
    try {
        const isAvailable = await aiService.isAvailable();

        res.json({
            success: true,
            aiServiceAvailable: isAvailable,
            model: process.env.OLLAMA_MODEL || 'llama2',
            message: isAvailable
                ? 'AI service tersedia'
                : 'AI service tidak tersedia. Pastikan Ollama running.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking AI service status',
            error: error.message
        });
    }
});

/**
 * POST /api/ai/conduct-survey
 * Conduct AI medical survey with clinical questions
 */
router.post('/conduct-survey', authenticateToken, async (req, res) => {
    try {
        const { initialSymptoms, userProfile } = req.body;
        const userId = req.user.userId;

        if (!initialSymptoms || typeof initialSymptoms !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Gejala awal harus berupa string'
            });
        }

        // Get complete user profile from database
        let completeProfile = userProfile || {};
        if (userId) {
            const User = require('../models/user-model');
            const user = await User.findById(userId).select('-password');
            if (user) {
                completeProfile = {
                    age: user.tanggalLahir ? Math.floor((Date.now() - user.tanggalLahir.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
                    jenisKelamin: user.jenisKelamin,
                    golonganDarah: user.golonganDarah,
                    tinggiBadan: user.tinggiBadan,
                    beratBadan: user.beratBadan,
                    alergi: user.alergi,
                    riwayatPenyakit: user.riwayatPenyakit
                };
            }
        }

        const result = await aiService.conductMedicalSurvey(initialSymptoms, completeProfile);

        if (result.success) {
            // Trigger emergency if severity is Red
            if (result.survey_result.severity === 'Red') {
                // Emit emergency event for frontend
                if (global.io) {
                    global.io.to(userId).emit('emergency-alert', result.survey_result);
                }
            }

            res.json({
                success: true,
                survey_result: result.survey_result,
                timestamp: result.timestamp
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Gagal melakukan survei AI',
                error: result.error
            });
        }

    } catch (error) {
        console.error('Conduct survey error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat melakukan survei',
            error: error.message
        });
    }
});

/**
 * POST /api/ai/process-survey-responses
 * Process follow-up survey responses and provide final assessment
 */
router.post('/process-survey-responses', authenticateToken, async (req, res) => {
    try {
        const { questionResponses, userProfile } = req.body;
        const userId = req.user.userId;

        if (!questionResponses || !Array.isArray(questionResponses)) {
            return res.status(400).json({
                success: false,
                message: 'Respons survei harus berupa array'
            });
        }

        // Get complete user profile
        let completeProfile = userProfile || {};
        if (userId) {
            const User = require('../models/user-model');
            const user = await User.findById(userId).select('-password');
            if (user) {
                completeProfile = {
                    age: user.tanggalLahir ? Math.floor((Date.now() - user.tanggalLahir.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
                    jenisKelamin: user.jenisKelamin,
                    golonganDarah: user.golonganDarah,
                    tinggiBadan: user.tinggiBadan,
                    beratBadan: user.beratBadan,
                    alergi: user.alergi,
                    riwayatPenyakit: user.riwayatPenyakit
                };
            }
        }

        const result = await aiService.processSurveyResponses(questionResponses, completeProfile);

        if (result.success) {
            // Auto-sync to medical history if needed
            if (result.final_assessment.sync_to_history && userId) {
                const authController = require('../controllers/authController');
                await authController.syncMedicalHistory({
                    user: { userId },
                    body: { surveyResult: result }
                }, {
                    json: () => { }, // Mock response
                    status: () => ({ json: () => { } })
                });
            }

            // Trigger emergency if severity is Red
            if (result.final_assessment.severity === 'Red') {
                if (global.io) {
                    global.io.to(userId).emit('emergency-alert', result.final_assessment);
                }
            }

            res.json({
                success: true,
                final_assessment: result.final_assessment,
                timestamp: result.timestamp
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Gagal memproses respons survei',
                error: result.error
            });
        }

    } catch (error) {
        console.error('Process survey responses error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memproses respons',
            error: error.message
        });
    }
});

module.exports = router;
