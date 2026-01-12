/**
 * Auth Routes - SehatKu AI
 *
 * Menangani autentikasi user: login, register, profile
 * Menggunakan JWT untuk session management
 */

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

const { authenticateToken } = require('../middleware/auth-middleware');

// POST /api/auth/register - Registrasi user baru
router.post('/register', authController.register);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// GET /api/auth/profile - Get user profile
router.get('/profile', authenticateToken, authController.getProfile);

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, authController.updateProfile);

// POST /api/auth/sync-medical-history - Sync AI survey to medical history
router.post('/sync-medical-history', authenticateToken, authController.syncMedicalHistory);

module.exports = router;

