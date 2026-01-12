const jwt = require('jsonwebtoken');

// JWT Secret (gunakan env var di production)
const JWT_SECRET = process.env.JWT_SECRET || 'sehatku_ai_secret_key_2026';

// Middleware untuk verifikasi token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak ditemukan'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token tidak valid'
            });
        }
        req.user = user;
        next();
    });
};

// Middleware opsional - tidak reject jika token tidak ada
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Tidak ada token, lanjutkan tanpa user
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Token invalid, tapi tetap lanjutkan
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
};

module.exports = { authenticateToken, optionalAuth, JWT_SECRET };
