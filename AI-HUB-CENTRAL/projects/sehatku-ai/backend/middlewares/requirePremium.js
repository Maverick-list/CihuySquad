/**
 * Require Premium Middleware - SehatKu AI
 * 
 * Middleware untuk memverifikasi akses premium user.
 * Compatible dengan JWT authentication system.
 * 
 * Usage:
 * const { requirePremium } = require('../middlewares/requirePremium');
 * router.get('/premium-feature', authenticateToken, requirePremium, handler);
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const sharedStorage = require('../services/shared-storage');
const { isMongoConnected } = require('../utils/db-utils');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sehatku_ai_secret_key_2026';

/**
 * Main requirePremium middleware
 * Checks if user has valid JWT and premium status
 */
const requirePremium = async (req, res, next) => {
    try {
        // Ensure authenticateToken middleware ran first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan'
            });
        }

        const { userId } = req.user;

        // Check role first (fast path for already-upgraded users)
        if (req.user.role === 'PREMIUM' || req.user.role === 'DOKTER') {
            return next();
        }

        // Check isPremium flag in database
        let user;
        if (isMongoConnected()) {
            user = await User.findById(userId);
        } else {
            user = sharedStorage.findUserById(userId);
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        // Check premium status
        if (user.isPremium !== true) {
            return res.status(403).json({
                success: false,
                message: 'Akses premium diperlukan',
                code: 'PREMIUM_REQUIRED',
                upgradeUrl: '/premium/upgrade'
            });
        }

        // Check if premium expired
        if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date()) {
            return res.status(403).json({
                success: false,
                message: 'Premium Anda telah expired. Silakan renew.',
                code: 'PREMIUM_EXPIRED',
                upgradeUrl: '/premium/upgrade'
            });
        }

        // Premium access granted
        next();
    } catch (error) {
        console.error('❌ Premium middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memverifikasi akses premium'
        });
    }
};

/**
 * Optional: Generate new JWT with premium role after upgrade
 * @param {Object} user - User object from database
 * @returns {string} New JWT token
 */
const generatePremiumToken = (user) => {
    return jwt.sign(
        {
            userId: user._id || user.id,
            email: user.email,
            role: 'PREMIUM',
            isPremium: true
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Optional: Middleware that allows both free and premium
 * but provides different data based on status
 */
const optionalPremium = async (req, res, next) => {
    try {
        if (!req.user) {
            req.isPremium = false;
            return next();
        }

        const { userId } = req.user;

        // Quick check from JWT first
        if (req.user.role === 'PREMIUM' || req.user.isPremium === true) {
            req.isPremium = true;
            return next();
        }

        // Check database
        let user;
        if (isMongoConnected()) {
            user = await User.findById(userId);
        } else {
            user = sharedStorage.findUserById(userId);
        }

        req.isPremium = user && user.isPremium === true && 
            (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) >= new Date());

        next();
    } catch (error) {
        console.error('❌ Optional premium middleware error:', error);
        req.isPremium = false;
        next();
    }
};

module.exports = {
    requirePremium,
    generatePremiumToken,
    optionalPremium
};

