/**
 * Premium Routes - SehatKu AI
 *
 * Menangani fitur premium: aktivasi premium, konsultasi dokter, chat
 * Menggunakan JWT authentication dengan premium middleware
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const sharedStorage = require('../services/shared-storage');
const { isMongoConnected } = require('../utils/db-utils');
const { requirePremium, generatePremiumToken } = require('../middlewares/requirePremium');
const { sendPremiumActivationEmail } = require('../services/email-service');

const router = express.Router();

// JWT Secret
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

// Middleware untuk cek premium access
const checkPremium = async (req, res, next) => {
    // Check role first
    if (req.user.role === 'PREMIUM' || req.user.role === 'DOKTER') {
        return next();
    }

    // If not role-based premium, check isPremium field
    try {
        let user;
        if (isMongoConnected()) {
            user = await User.findById(req.user.userId);
        } else {
            user = sharedStorage.findUserById(req.user.userId);
        }

        if (user && user.isPremium === true) {
            // Update role to PREMIUM
            if (isMongoConnected()) {
                user.role = 'PREMIUM';
                await user.save();
            } else {
                sharedStorage.updateUser(user._id, { role: 'PREMIUM' });
            }
            return next();
        }
    } catch (error) {
        console.error('Premium check error:', error);
    }

    return res.status(403).json({
        success: false,
        message: 'Fitur ini memerlukan akses premium'
    });
};

// Dummy data untuk dokter (dalam production akan dari database)
const dummyDoctors = [
    {
        id: 'dr-001',
        nama: 'Dr. Sarah Putri, Sp.PD',
        spesialisasi: 'Penyakit Dalam',
        pengalaman: '8 tahun',
        rating: 4.8,
        reviewCount: 156,
        tarif: 150000,
        jadwal: ['Senin 09:00-17:00', 'Rabu 09:00-17:00', 'Jumat 09:00-17:00'],
        avatar: '👩‍⚕️'
    },
    {
        id: 'dr-002',
        nama: 'Dr. Ahmad Rahman, Sp.JP',
        spesialisasi: 'Jantung dan Pembuluh Darah',
        pengalaman: '12 tahun',
        rating: 4.9,
        reviewCount: 203,
        tarif: 200000,
        jadwal: ['Selasa 08:00-16:00', 'Kamis 08:00-16:00', 'Sabtu 08:00-16:00'],
        avatar: '👨‍⚕️'
    },
    {
        id: 'dr-003',
        nama: 'Dr. Maya Sari, Sp.KK',
        spesialisasi: 'Kulit dan Kelamin',
        pengalaman: '6 tahun',
        rating: 4.7,
        reviewCount: 89,
        tarif: 120000,
        jadwal: ['Senin 10:00-18:00', 'Selasa 10:00-18:00', 'Kamis 10:00-18:00'],
        avatar: '👩‍⚕️'
    }
];

// Dummy data untuk chat history
const chatHistory = new Map();

// POST /api/premium/upgrade - Upgrade ke premium dengan JWT refresh
router.post('/upgrade', authenticateToken, async (req, res) => {
    try {
        const { paymentMethod, duration } = req.body; // duration in months

        // Validasi input
        if (!paymentMethod || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Metode pembayaran dan durasi wajib diisi'
            });
        }

        // Get current user
        let user;
        if (isMongoConnected()) {
            user = await User.findById(req.user.userId);
        } else {
            user = sharedStorage.findUserById(req.user.userId);
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        // Mock payment processing (90% success rate)
        const paymentSuccess = Math.random() > 0.1;
        if (!paymentSuccess) {
            return res.status(402).json({
                success: false,
                message: 'Pembayaran gagal. Silakan coba lagi.'
            });
        }

        // Calculate premium details
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + duration);
        const paymentAmount = duration * 50000; // Rp 50,000 per bulan

        // Update user premium status
        user.role = 'PREMIUM';
        user.isPremium = true;
        user.premiumActivatedAt = now;
        user.premiumExpiresAt = expiresAt;

        if (isMongoConnected()) {
            await user.save();
        } else {
            sharedStorage.updateUser(user._id, {
                role: 'PREMIUM',
                isPremium: true,
                premiumActivatedAt: now,
                premiumExpiresAt: expiresAt
            });
            user = sharedStorage.findUserById(user._id);
        }

        // Generate NEW JWT with premium role
        const newToken = generatePremiumToken(user);

        // Send premium activation email
        const premiumDetails = {
            activatedAt: now,
            expiresAt: expiresAt,
            amount: paymentAmount,
            method: paymentMethod,
            duration: duration
        };
        
        try {
            await sendPremiumActivationEmail(user, premiumDetails);
        } catch (emailError) {
            console.error('Failed to send premium activation email:', emailError.message);
        }

        res.json({
            success: true,
            message: 'Premium berhasil diaktifkan!',
            token: newToken, // New JWT with premium role
            user: {
                _id: user._id,
                nama: user.nama,
                email: user.email,
                role: 'PREMIUM',
                isPremium: true,
                premiumActivatedAt: user.premiumActivatedAt,
                premiumExpiresAt: user.premiumExpiresAt
            },
            payment: {
                amount: paymentAmount,
                method: paymentMethod,
                duration: `${duration} bulan`,
                transactionId: `TXN-${Date.now()}`
            }
        });

    } catch (error) {
        console.error('Premium upgrade error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat upgrade premium'
        });
    }
});

// POST /api/premium/activate - Aktivasi premium (legacy endpoint)
// Kept for backward compatibility - same as upgrade
router.post('/activate', authenticateToken, async (req, res) => {
    // Treat as upgrade with default 1 month
    req.body.duration = req.body.duration || 1;
    
    // Inline upgrade logic for simplicity
    const { paymentMethod, duration } = req.body;

    if (!paymentMethod || !duration) {
        return res.status(400).json({
            success: false,
            message: 'Metode pembayaran dan durasi wajib diisi'
        });
    }

    let user;
    if (isMongoConnected()) {
        user = await User.findById(req.user.userId);
    } else {
        user = sharedStorage.findUserById(req.user.userId);
    }

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User tidak ditemukan'
        });
    }

    const paymentSuccess = Math.random() > 0.1;
    if (!paymentSuccess) {
        return res.status(402).json({
            success: false,
            message: 'Pembayaran gagal'
        });
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + duration);
    const paymentAmount = duration * 50000;

    user.role = 'PREMIUM';
    user.isPremium = true;
    user.premiumActivatedAt = now;
    user.premiumExpiresAt = expiresAt;

    if (isMongoConnected()) {
        await user.save();
    } else {
        sharedStorage.updateUser(user._id, {
            role: 'PREMIUM',
            isPremium: true,
            premiumActivatedAt: now,
            premiumExpiresAt: expiresAt
        });
        user = sharedStorage.findUserById(user._id);
    }

    const newToken = generatePremiumToken(user);

    try {
        await sendPremiumActivationEmail(user, { activatedAt: now, expiresAt, amount: paymentAmount, method: paymentMethod, duration });
    } catch (e) {
        console.error('Email error:', e.message);
    }

    res.json({
        success: true,
        message: 'Premium berhasil diaktifkan!',
        token: newToken,
        user: {
            _id: user._id,
            nama: user.nama,
            email: user.email,
            role: 'PREMIUM',
            isPremium: true,
            premiumActivatedAt: user.premiumActivatedAt,
            premiumExpiresAt: user.premiumExpiresAt
        },
        payment: {
            amount: paymentAmount,
            method: paymentMethod,
            duration: `${duration} bulan`,
            transactionId: `TXN-${Date.now()}`
        }
    });
});

// GET /api/premium/status - Cek status premium
router.get('/status', authenticateToken, async (req, res) => {
    try {
        let user;
        if (isMongoConnected()) {
            user = await User.findById(req.user.userId);
        } else {
            user = sharedStorage.findUserById(req.user.userId);
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const now = new Date();
        let isExpired = false;

        // Check expiration if premiumExpiresAt exists
        if (user.premiumExpiresAt) {
            isExpired = new Date(user.premiumExpiresAt) < now;

            // Auto-downgrade jika expired
            if (isExpired && user.role === 'PREMIUM') {
                if (isMongoConnected()) {
                    user.role = 'FREE';
                    user.isPremium = false;
                    await user.save();
                } else {
                    sharedStorage.updateUser(user._id, { role: 'FREE', isPremium: false });
                }
            }
        }

        res.json({
            success: true,
            premium: {
                isActive: user.isPremium === true && !isExpired,
                role: user.role,
                isPremium: user.isPremium,
                activatedAt: user.premiumActivatedAt,
                expiresAt: user.premiumExpiresAt,
                daysRemaining: user.premiumExpiresAt ?
                    Math.max(0, Math.ceil((new Date(user.premiumExpiresAt) - now) / (1000 * 60 * 60 * 24))) : 0
            }
        });

    } catch (error) {
        console.error('Premium status error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat cek status premium'
        });
    }
});

// GET /api/premium/doctors - List dokter tersedia (PREMIUM ONLY)
router.get('/doctors', authenticateToken, requirePremium, (req, res) => {
    try {
        res.json({
            success: true,
            doctors: dummyDoctors
        });

    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data dokter'
        });
    }
});

// POST /api/premium/consultation/start - Mulai konsultasi
router.post('/consultation/start', authenticateToken, requirePremium, (req, res) => {
    try {
        const { doctorId } = req.body;

        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'ID dokter wajib diisi'
            });
        }

        const doctor = dummyDoctors.find(d => d.id === doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Dokter tidak ditemukan'
            });
        }

        // Buat session konsultasi
        const sessionId = `consult-${req.user.userId}-${Date.now()}`;

        // Initialize chat history
        chatHistory.set(sessionId, [
            {
                id: '1',
                sender: 'doctor',
                message: `Halo! Saya ${doctor.nama}. Apa keluhan kesehatan yang Anda alami?`,
                timestamp: new Date(),
                type: 'text'
            }
        ]);

        res.json({
            success: true,
            message: 'Konsultasi dimulai',
            consultation: {
                sessionId,
                doctor,
                startedAt: new Date(),
                status: 'active'
            }
        });

    } catch (error) {
        console.error('Start consultation error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memulai konsultasi'
        });
    }
});

// GET /api/premium/consultation/:sessionId - Get chat history
router.get('/consultation/:sessionId', authenticateToken, requirePremium, (req, res) => {
    try {
        const { sessionId } = req.params;

        const messages = chatHistory.get(sessionId) || [];

        res.json({
            success: true,
            consultation: {
                sessionId,
                messages
            }
        });

    } catch (error) {
        console.error('Get consultation error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil riwayat konsultasi'
        });
    }
});

// POST /api/premium/consultation/:sessionId/message - Kirim pesan
router.post('/consultation/:sessionId/message', authenticateToken, requirePremium, (req, res) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Pesan tidak boleh kosong'
            });
        }

        let messages = chatHistory.get(sessionId);
        if (!messages) {
            return res.status(404).json({
                success: false,
                message: 'Sesi konsultasi tidak ditemukan'
            });
        }

        // Add user message
        const userMessage = {
            id: `msg-${Date.now()}-user`,
            sender: 'user',
            message: message.trim(),
            timestamp: new Date(),
            type: 'text'
        };

        messages.push(userMessage);

        // Simulate doctor response (dalam production akan menggunakan AI/ML)
        setTimeout(() => {
            const responses = [
                'Berdasarkan keluhan Anda, saya sarankan untuk melakukan pemeriksaan lebih lanjut.',
                'Apakah Anda memiliki riwayat penyakit tertentu atau sedang mengonsumsi obat?',
                'Coba jelaskan lebih detail tentang gejala yang Anda rasakan.',
                'Saya akan berikan rekomendasi pengobatan setelah mendengar keluhan lengkap Anda.',
                'Apakah gejala ini muncul secara tiba-tiba atau sudah lama?',
                'Pernahkah Anda mengalami gejala serupa sebelumnya?'
            ];

            const doctorResponse = {
                id: `msg-${Date.now()}-doctor`,
                sender: 'doctor',
                message: responses[Math.floor(Math.random() * responses.length)],
                timestamp: new Date(),
                type: 'text'
            };

            messages.push(doctorResponse);
        }, 1000 + Math.random() * 2000); // Random delay 1-3 detik

        res.json({
            success: true,
            message: userMessage
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengirim pesan'
        });
    }
});

// POST /api/premium/consultation/:sessionId/end - Akhiri konsultasi
router.post('/consultation/:sessionId/end', authenticateToken, requirePremium, (req, res) => {
    try {
        const { sessionId } = req.params;

        // Dalam production, simpan ke database
        chatHistory.delete(sessionId);

        res.json({
            success: true,
            message: 'Konsultasi telah diakhiri'
        });

    } catch (error) {
        console.error('End consultation error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengakhiri konsultasi'
        });
    }
});

module.exports = router;

