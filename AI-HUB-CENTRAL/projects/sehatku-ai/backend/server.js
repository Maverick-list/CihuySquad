/**
 * Express Server - SehatKu AI
 * 
 * Main server file untuk backend API.
 * Menangani routing, middleware, dan koneksi database.
 * 
 * Fitur:
 * - RESTful API endpoints
 * - CORS untuk frontend integration
 * - Rate limiting untuk security
 * - Error handling middleware
 * - Request logging
 * - ENV validation
 * - Graceful shutdown
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database connection
const { connectDB, getDBStatus, DB_MODE, gracefulShutdown } = require('./config/database');

// Import email service
const { initEmailService, getMode: getEmailMode } = require('./services/email-service');

// Import shared storage
const sharedStorage = require('./services/shared-storage');

// Import routes
const healthRoutes = require('./routes/health-routes');
const aiRoutes = require('./routes/ai-routes');
const predictionRoutes = require('./routes/prediction-routes');
const authRoutes = require('./routes/auth-routes');
const premiumRoutes = require('./routes/premium-routes');
const hospitalRoutes = require('./routes/hospital-routes');
const mapsRoutes = require('./routes/maps-routes');
const emergencyRoutes = require('./routes/emergency-routes');

// Initialize Express app
const app = express();

// ==================== ENV VALIDATION ====================

const requiredEnvVars = [
    'JWT_SECRET'
];

const optionalEnvVars = [
    'MONGODB_URI',
    'SMTP_EMAIL',
    'SMTP_PASSWORD',
    'FRONTEND_URL',
    'EMAIL_MODE',
    'DB_MODE',
    'PORT',
    'NODE_ENV',
    'ALLOWED_ORIGINS',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS'
];

const validateEnv = () => {
    console.log('🔍 Validating environment variables...');

    let missingRequired = [];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missingRequired.push(envVar);
        }
    }

    if (missingRequired.length > 0) {
        console.warn(`⚠️  Missing required ENV variables: ${missingRequired.join(', ')}`);
        console.warn('   Using default values for development');
    }

    console.log(`✅ ENV validation complete`);
    console.log(`   DB_MODE: ${DB_MODE}`);
    console.log(`   Email mode: ${getEmailMode()}`);
};

// ==================== MIDDLEWARE ====================

/**
 * Helmet - Security headers
 * Melindungi dari common web vulnerabilities
 */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            mediaSrc: ["'self'", "data:", "blob:"],
            frameAncestors: ["'self'", "http://localhost:*", "http://127.0.0.1:*"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

/**
 * CORS - Cross-Origin Resource Sharing
 * Mengizinkan frontend untuk akses API
 */
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

/**
 * Compression - Compress response bodies
 * Mengurangi bandwidth dan mempercepat response
 */
app.use(compression());

/**
 * Body Parser - Parse JSON dan URL-encoded data
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Morgan - HTTP request logger
 * Log semua request untuk monitoring
 */
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Detailed logging untuk development
} else {
    app.use(morgan('combined')); // Standard Apache combined log untuk production
}

/**
 * General Rate Limiting - Mencegah abuse
 * Batasi jumlah request per IP
 */
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 menit
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Max 100 requests per window
    message: {
        success: false,
        message: 'Terlalu banyak request dari IP ini. Silakan coba lagi nanti.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

/**
 * Auth Rate Limiting - Stricter limits untuk auth endpoints
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10, // Max 10 attempts per window
    message: {
        success: false,
        message: 'Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// ==================== ROUTES ====================

/**
 * Health Check Endpoint
 * Untuk monitoring apakah server running
 */
app.get('/health', (req, res) => {
    const dbStatus = getDBStatus();

    res.status(200).json({
        success: true,
        message: 'SehatKu AI Server is running',
        version: '1.0.0',
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: {
            mode: dbStatus.mode,
            connected: dbStatus.connected,
            host: dbStatus.host
        },
        services: {
            email: getEmailMode()
        }
    });
});

/**
 * API Routes
 * Note: Apply authLimiter to specific auth endpoints in auth-routes.js
 */
app.use('/api/health', healthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/emergency', emergencyRoutes);

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Selamat datang di SehatKu AI API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: getDBStatus().mode,
        endpoints: {
            health: '/health',
            ai: '/api/ai',
            prediction: '/api/prediction',
            auth: '/api/auth',
            premium: '/api/premium',
            hospital: '/api/hospital'
        }
    });
});

/**
 * 404 Handler - Route tidak ditemukan
 */
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan',
        path: req.originalUrl
    });
});

/**
 * Global Error Handler
 * Menangani semua error yang terjadi di aplikasi
 */
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);

    // Don't expose error details in production
    const errorMessage = process.env.NODE_ENV === 'development'
        ? err.message
        : 'Terjadi kesalahan pada server';

    res.status(err.status || 500).json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            path: req.path,
            method: req.method
        })
    });
});

// ==================== SERVER STARTUP ====================

const PORT = process.env.PORT || 5000;

/**
 * Start server function
 * Connect ke database dulu, baru start server
 */
const startServer = async () => {
    try {
        // Validate environment
        validateEnv();

        // Connect ke database
        console.log('📦 Connecting to database...');
        const dbResult = await connectDB();

        if (!dbResult.success && DB_MODE === 'mongo') {
            console.warn('⚠️  MongoDB connection failed, but continuing...');
        }

        // Initialize email service
        console.log('📧 Initializing email service...');
        await initEmailService();

        // Initialize shared storage (single initialization point)
        sharedStorage.init();

        // Start Express server
        app.listen(PORT, () => {
            console.log(`\n🚀 SehatKu AI Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📦 Database: ${DB_MODE}`);
            console.log(`📧 Email: ${getEmailMode()}`);
            console.log(`🌐 API URL: http://localhost:${PORT}`);
            console.log(`📊 Health Check: http://localhost:${PORT}/health`);
            console.log(`\n💡 Tip: Set NODE_ENV=production untuk production deployment\n`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Graceful shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();

module.exports = app; // Export untuk testing

