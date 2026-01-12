/**
 * EduCerdas AI - Backend Server
 * Platform Pembelajaran Personalized dengan AI
 * 
 * Fitur:
 * - AI Recommendation Engine
 * - Learning Style Detection
 * - Fallback logic jika API AI gagal
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Ollama Configuration for Llama 3.2
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:latest';

// ============================================
// OPTIONAL REQUEST LOGGING SETUP
// ============================================

if (process.env.REQUEST_LOGGING_ENABLED === 'true') {
    const logDir = process.env.LOG_DIR || './logs';
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Request logging middleware
    app.use((req, res, next) => {
        const startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const logEntry = {
                timestamp: new Date().toISOString(),
                method: req.method,
                path: req.path,
                status: res.statusCode,
                ip: req.ip || req.connection.remoteAddress,
                duration: `${duration}ms`,
                userAgent: req.get('user-agent')
            };

            // Track AI endpoint usage
            if (req.path === '/api/ai' && process.env.TRACK_AI_USAGE === 'true') {
                logEntry.category = 'AI_REQUEST';
                logEntry.prompt_length = (req.body?.prompt || '').length;
            }

            const logPath = path.join(logDir, `access-${new Date().toISOString().split('T')[0]}.log`);
            fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');

            // Console output based on log level
            const level = process.env.LOG_LEVEL || 'info';
            if (level === 'debug' || (level === 'info' && res.statusCode >= 400)) {
                console.log(logEntry);
            }
        });

        next();
    });
}

// ============================================
// OPTIONAL RATE LIMITING SETUP
// ============================================

const rateLimitStore = new Map();

function cleanExpiredLimits() {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

function isRateLimited(ip, endpoint = 'general') {
    if (process.env.RATE_LIMIT_ENABLED !== 'true') return false;

    cleanExpiredLimits();

    const key = `${ip}:${endpoint}`;
    const now = Date.now();

    let limit;
    if (endpoint === 'ai') {
        limit = {
            window: parseInt(process.env.RATE_LIMIT_AI_WINDOW_MS || 60000),
            max: parseInt(process.env.RATE_LIMIT_AI_MAX_REQUESTS || 20)
        };
    } else {
        limit = {
            window: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000),
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100)
        };
    }

    const data = rateLimitStore.get(key) || { count: 0, resetTime: now + limit.window };

    if (now > data.resetTime) {
        data.count = 0;
        data.resetTime = now + limit.window;
    }

    data.count++;
    rateLimitStore.set(key, data);

    return data.count > limit.max;
}

function createRateLimitMiddleware(endpoint = 'general') {
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;

        if (isRateLimited(ip, endpoint)) {
            const limits = endpoint === 'ai'
                ? { window: process.env.RATE_LIMIT_AI_WINDOW_MS || '1 minute', max: process.env.RATE_LIMIT_AI_MAX_REQUESTS || 20 }
                : { window: process.env.RATE_LIMIT_WINDOW_MS || '15 minutes', max: process.env.RATE_LIMIT_MAX_REQUESTS || 100 };

            return res.status(429).json({
                success: false,
                error: `Rate limit exceeded. Max ${limits.max} requests per ${limits.window}. Try again later.`
            });
        }

        next();
    };
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// DATA MOCK - Repository Materi Pembelajaran
// ============================================

const LEARNING_MATERIALS = {
    'matematika': {
        'sd': {
            'visual': {
                title: 'Visual Matematika SD',
                content: 'Grafik dan diagram untuk memahami konsep bilangan',
                videoResources: ['https://youtu.be/M1O4AE3eZ3w'],
                interactiveModules: ['Bilangan Cacah', 'Pecahan Sederhana']
            },
            'audio': {
                title: 'Audio Matematika SD',
                content: 'Podcast dan penjelasan audio tentang operasi hitung',
                audioResources: ['Operasi Penjumlahan', 'Operasi Pengurangan'],
                interactiveModules: ['Berhitung Cepat']
            },
            'text': {
                title: 'Teks Matematika SD',
                content: 'Modul tertulis dengan contoh soal dan pembahasan',
                readingMaterials: ['Bangun Datar', 'Bangun Ruang'],
                interactiveModules: ['Soal Latihan', 'Pembahasan']
            }
        },
        'smp': {
            'visual': {
                title: 'Visual Matematika SMP',
                content: 'Animasi dan simulasi untuk aljabar dan geometri',
                videoResources: ['Aljabar Dasar', 'Teorema Pythagoras'],
                interactiveModules: ['Persamaan Linear', 'Kongruensi']
            },
            'audio': {
                title: 'Audio Matematika SMP',
                content: 'Penjelasan audio untuk konsep matematika SMP',
                audioResources: ['Rumus Cepat Matematika', 'Tips Ujian'],
                interactiveModules: ['Kuis Audio']
            },
            'text': {
                title: 'Teks Matematika SMP',
                content: 'Buku digital dan modul tertulis',
                readingMaterials: ['Aljabar', 'Geometri', 'Statistik'],
                interactiveModules: ['Bank Soal', 'Pembahasan']
            }
        },
        'sma': {
            'visual': {
                title: 'Visual Matematika SMA',
                content: 'Grafik fungsi dan visualisasi kalkulus',
                videoResources: ['Kalkulus Dasar', 'Turunan dan Integral'],
                interactiveModules: ['Fungsi Kuadrat', 'Limit']
            },
            'audio': {
                title: 'Audio Matematika SMA',
                content: 'Podcast matematika tingkat lanjut',
                audioResources: ['Tips SBMPTN', 'Pembahasan Tryout'],
                interactiveModules: ['Simulasi Ujian']
            },
            'text': {
                title: 'Teks Matematika SMA',
                content: 'Materi komprehensif untuk persiapan ujian',
                readingMaterials: ['Kalkulus', 'Trigonometri', 'Logika Matematika'],
                interactiveModules: ['Soal HOTS', 'Pembahasan']
            }
        }
    },
    'bahasa-indonesia': {
        'sd': {
            'visual': {
                title: 'Visual Bahasa Indonesia SD',
                content: 'Gambar dan komik untuk memahami cerita',
                videoResources: ['Cerita Rakyat', 'Puisi Bergambar'],
                interactiveModules: ['Kosakata Baru', 'Membaca Gambar']
            },
            'audio': {
                title: 'Audio Bahasa Indonesia SD',
                content: 'Cerita audio dan puisi yang dibacakan',
                audioResources: [' Dongeng', 'Puisi', 'Teks Reportase'],
                interactiveModules: ['Mendengarkan dan Menjawab']
            },
            'text': {
                title: 'Teks Bahasa Indonesia SD',
                content: 'Buku cerita dan latihan menulis',
                readingMaterials: ['Cerita Pendek', 'Teks Deskripsi'],
                interactiveModules: ['Menulis Kreatif', 'Tata Bahasa']
            }
        },
        'smp': {
            'visual': {
                title: 'Visual Bahasa Indonesia SMP',
                content: 'Infografis dan video pembelajaran bahasa',
                videoResources: ['Teks Editorial', 'Opini dan Fakta'],
                interactiveModules: ['Analisis Teks', '修辞']
            },
            'audio': {
                title: 'Audio Bahasa Indonesia SMP',
                content: 'Podcast dan debat audio',
                audioResources: ['Berita Terkini', 'Wawancara'],
                interactiveModules: ['Pidato', 'Presentasi']
            },
            'text': {
                title: 'Teks Bahasa Indonesia SMP',
                content: 'Kumpulan teks dan analisis sastra',
                readingMaterials: ['Novel', 'Puisi', 'Drama'],
                interactiveModules: ['Analisis Sastra', 'Menulis Esai']
            }
        },
        'sma': {
            'visual': {
                title: 'Visual Bahasa Indonesia SMA',
                content: 'Video analisis sastra dan presentasi',
                videoResources: ['Cerpen dan Novel', 'Retorika'],
                interactiveModules: ['Presentasi', 'Debat']
            },
            'audio': {
                title: 'Audio Bahasa Indonesia SMA',
                content: 'Audiobook dan diskusi sastra',
                audioResources: ['Novel Audio', 'Podcast Sastra'],
                interactiveModules: ['Diskusi Kelompok', 'Pidato']
            },
            'text': {
                title: 'Teks Bahasa Indonesia SMA',
                content: 'Materi bahasa Indonesia lengkap',
                readingMaterials: ['Sastra Indonesia', 'Bahasa Indonesia Pers'],
                interactiveModules: ['Skripsi', 'Makalah', 'Artikel']
            }
        }
    },
    'bahasa-inggris': {
        'sd': {
            'visual': {
                title: 'Visual Bahasa Inggris SD',
                content: 'Kartun dan video untuk vocabulary',
                videoResources: ['ABC Songs', 'Basic Conversations'],
                interactiveModules: ['Flashcards', 'Matching Games']
            },
            'audio': {
                title: 'Audio Bahasa Inggris SD',
                content: 'Lagu dan cerita audio',
                audioResources: ['English Songs', 'Story Time'],
                interactiveModules: ['Listening Practice', 'Pronunciation']
            },
            'text': {
                title: 'Teks Bahasa Inggris SD',
                content: 'Buku cerita bergambar dan latihan',
                readingMaterials: ['Picture Books', 'Basic Grammar'],
                interactiveModules: ['Vocabulary', 'Simple Sentences']
            }
        },
        'smp': {
            'visual': {
                title: 'Visual Bahasa Inggris SMP',
                content: 'Video dan infografis bahasa Inggris',
                videoResources: ['Grammar Videos', 'Conversation Practice'],
                interactiveModules: ['Listening Comprehension', 'Speaking']
            },
            'audio': {
                title: 'Audio Bahasa Inggris SMP',
                content: 'Podcast dan materi audio',
                audioResources: ['BBC Learning English', 'TED Talks'],
                interactiveModules: ['Dictation', 'Discussion']
            },
            'text': {
                title: 'Teks Bahasa Inggris SMP',
                content: 'Reading comprehension dan grammar',
                readingMaterials: ['Short Stories', 'News Articles'],
                interactiveModules: ['Grammar Exercises', 'Writing']
            }
        },
        'sma': {
            'visual': {
                title: 'Visual Bahasa Inggris SMA',
                content: 'Video advanced dan presentasi',
                videoResources: ['Academic English', 'Public Speaking'],
                interactiveModules: ['Presentation Skills', 'Debate']
            },
            'audio': {
                title: 'Audio Bahasa Inggris SMA',
                content: 'Podcast dan audiobook',
                audioResources: ['TED Talks', 'Podcasts'],
                interactiveModules: ['Advanced Listening', 'Note Taking']
            },
            'text': {
                title: 'Teks Bahasa Inggris SMA',
                content: 'Materi akademik bahasa Inggris',
                readingMaterials: ['Academic Papers', 'Literature'],
                interactiveModules: ['Essay Writing', 'Research']
            }
        }
    },
    'ipa': {
        'sd': {
            'visual': {
                title: 'Visual IPA SD',
                content: 'Animasi dan video tentang alam',
                videoResources: ['Tubuh Manusia', 'Tumbuhan', 'Hewan'],
                interactiveModules: ['Eksperimen Virtual', 'Pengamatan']
            },
            'audio': {
                title: 'Audio IPA SD',
                content: 'Cerita dan penjelasan audio',
                audioResources: ['Fakta Menarik', 'Penjelasan Alam'],
                interactiveModules: ['Quiz Audio']
            },
            'text': {
                title: 'Teks IPA SD',
                content: 'Buku pengetahuan alam',
                readingMaterials: ['Buku IPA SD', 'Fakta Alam'],
                interactiveModules: ['Soal Latihan', 'Eksperimen']
            }
        },
        'smp': {
            'visual': {
                title: 'Visual IPA SMP',
                content: 'Simulasi dan animasi ilmiah',
                videoResources: ['Fisika Dasar', 'Kimia Dasar', 'Biologi'],
                interactiveModules: ['Virtual Lab', 'Simulasi']
            },
            'audio': {
                title: 'Audio IPA SMP',
                content: 'Podcast sains',
                audioResources: ['Sains Populer', 'Penjelasan Konsep'],
                interactiveModules: ['Diskusi Sains']
            },
            'text': {
                title: 'Teks IPA SMP',
                content: 'Materi IPA komprehensif',
                readingMaterials: ['Fisika', 'Kimia', 'Biologi'],
                interactiveModules: ['Bank Soal', 'Laporan Praktikum']
            }
        },
        'sma': {
            'visual': {
                title: 'Visual IPA SMA',
                content: 'Simulasi advanced dan video kuliah',
                videoResources: ['Kalkulus', 'Fisika Kuantum', 'Biokimia'],
                interactiveModules: ['Lab Virtual', 'Penelitian']
            },
            'audio': {
                title: 'Audio IPA SMA',
                content: 'Podcast ilmiah',
                audioResources: ['Science Today', 'Research Podcasts'],
                interactiveModules: ['Seminar Audio']
            },
            'text': {
                title: 'Teks IPA SMA',
                content: 'Materi advanced untuk persiapan universitas',
                readingMaterials: ['Textbooks', 'Journals'],
                interactiveModules: ['Penelitian', 'Skripsi']
            }
        }
    },
    'ips': {
        'sd': {
            'visual': {
                title: 'Visual IPS SD',
                content: 'Peta dan gambar sejarah',
                videoResources: ['Sejarah Indonesia', 'Peta Dunia'],
                interactiveModules: ['Timeline', 'Peta Interaktif']
            },
            'audio': {
                title: 'Audio IPS SD',
                content: 'Cerita sejarah audio',
                audioResources: ['Cerita Sejarah', 'Legenda'],
                interactiveModules: ['Quiz Sejarah']
            },
            'text': {
                title: 'Teks IPS SD',
                content: 'Buku pengetahuan sosial',
                readingMaterials: ['Sejarah', 'Geografi'],
                interactiveModules: ['Soal Latihan']
            }
        },
        'smp': {
            'visual': {
                title: 'Visual IPS SMP',
                content: 'Infografis dan video sejarah',
                videoResources: ['Sejarah Dunia', 'Geografi'],
                interactiveModules: ['Timeline Interaktif', 'Peta']
            },
            'audio': {
                title: 'Audio IPS SMP',
                content: 'Podcast sejarah dan geografi',
                audioResources: ['History Podcasts', 'Geografi'],
                interactiveModules: ['Presentasi']
            },
            'text': {
                title: 'Teks IPS SMP',
                content: 'Materi IPS lengkap',
                readingMaterials: ['Sejarah', 'Ekonomi', 'Sosiologi'],
                interactiveModules: ['Esai', 'Analisis']
            }
        },
        'sma': {
            'visual': {
                title: 'Visual IPS SMA',
                content: 'Video dan simulasi sosial-ekonomi',
                videoResources: ['Ekonomi Global', 'Sosiologi'],
                interactiveModules: ['Studi Kasus', 'Analisis']
            },
            'audio': {
                title: 'Audio IPS SMA',
                content: 'Podcast ekonomi dan sosial',
                audioResources: ['News Analysis', 'Expert Interviews'],
                interactiveModules: ['Diskusi']
            },
            'text': {
                title: 'Teks IPS SMA',
                content: 'Materi advanced IPS',
                readingMaterials: ['Ekonomi', 'Sosiologi', 'Geografi'],
                interactiveModules: ['Penelitian', 'Makalah']
            }
        }
    }
};

// ============================================
// AI SERVICE - Rule-based Learning Recommendation
// ============================================

class LearningAIRecommendation {
    constructor() {
        this.fallbackMode = false;
    }

    /**
     * Deteksi gaya belajar siswa berdasarkan input
     */
    detectLearningStyle(profile) {
        const { learningStyle } = profile;

        // Jika sudah ada preferensi, gunakan itu
        if (learningStyle && ['visual', 'audio', 'text'].includes(learningStyle)) {
            return learningStyle;
        }

        // Rule-based detection berdasarkan usia dan preferensi
        const age = profile.age || 12;

        // Anak kecil cenderung lebih visual
        if (age < 10) return 'visual';
        // Remaja bisa mixed
        if (age < 15) return 'visual';
        // Dewasa lebih text-oriented
        return 'text';
    }

    /**
     * Generate rekomendasi pembelajaran berbasis AI
     */
    async generateRecommendation(studentProfile) {
        try {
            // Deteksi gaya belajar
            const learningStyle = this.detectLearningStyle(studentProfile);

            const educationLevel = studentProfile.educationLevel || 'sd';
            const subjects = studentProfile.subjects || ['matematika'];
            const specialNeeds = studentProfile.specialNeeds || [];

            // Generate rekomendasi untuk setiap mata pelajaran
            const recommendations = subjects.map(subject => {
                const material = LEARNING_MATERIALS[subject]?.[educationLevel]?.[learningStyle];

                if (material) {
                    return {
                        subject,
                        educationLevel,
                        learningStyle,
                        ...material,
                        accessibilityFeatures: this.getAccessibilityFeatures(specialNeeds),
                        estimatedDuration: this.getRecommendedDuration(educationLevel),
                        difficulty: this.getDifficultyLevel(educationLevel)
                    };
                }
                return null;
            }).filter(Boolean);

            // Hitung progress prediction
            const progressPrediction = this.predictProgress(recommendations, studentProfile);

            return {
                success: true,
                recommendations,
                learningStyle,
                progressPrediction,
                studySchedule: this.generateStudySchedule(recommendations, studentProfile),
                confidence: 0.85,
                mode: 'ai-enhanced'
            };
        } catch (error) {
            console.error('AI Recommendation Error:', error);
            return this.generateFallbackRecommendation(studentProfile);
        }
    }

    /**
     * Fallback jika AI gagal
     */
    generateFallbackRecommendation(profile) {
        this.fallbackMode = true;

        const educationLevel = profile.educationLevel || 'sd';
        const subjects = profile.subjects || ['matematika'];
        const specialNeeds = profile.specialNeeds || [];

        const recommendations = subjects.map(subject => ({
            subject,
            educationLevel,
            learningStyle: 'visual', // Default ke visual
            title: `Dasar ${subject}`,
            content: `Materi dasar ${subject} untuk tingkat ${educationLevel}`,
            accessibilityFeatures: this.getAccessibilityFeatures(specialNeeds),
            estimatedDuration: '30 menit',
            difficulty: 'Mudah',
            mode: 'fallback'
        }));

        return {
            success: true,
            recommendations,
            learningStyle: 'visual',
            progressPrediction: {
                estimatedCompletionDays: 7,
                weeklyStudyHours: 5,
                expectedImprovement: '20%'
            },
            studySchedule: {
                daily: ['08:00 - 08:30', '14:00 - 14:30'],
                weekly: ['Senin', 'Rabu', 'Jumat']
            },
            confidence: 0.65,
            mode: 'fallback'
        };
    }

    /**
     * Fitur aksesibilitas berdasarkan kebutuhan khusus
     */
    getAccessibilityFeatures(specialNeeds) {
        const features = {
            dyslexia: {
                fontType: 'OpenDyslexic',
                letterSpacing: '0.1em',
                lineHeight: 1.8,
                backgroundColor: '#f5f5dc',
                textToSpeech: true
            },
            autism: {
                simpleUI: true,
                clearInstructions: true,
                predictableNavigation: true,
                calmColors: true
            },
            focus: {
                minimalUI: true,
                noDistractions: true,
                timer: true,
                breakReminders: true
            }
        };

        const activeFeatures = {};
        specialNeeds.forEach(need => {
            if (features[need]) {
                Object.assign(activeFeatures, features[need]);
            }
        });

        return activeFeatures;
    }

    /**
     * Durasi belajar yang direkomendasikan
     */
    getRecommendedDuration(educationLevel) {
        const durations = {
            'sd': '20-30 menit',
            'smp': '30-45 menit',
            'sma': '45-60 menit'
        };
        return durations[educationLevel] || '30 menit';
    }

    /**
     * Tingkat kesulitan berdasarkan jenjang
     */
    getDifficultyLevel(educationLevel) {
        const levels = {
            'sd': 'Dasar',
            'smp': 'Menengah',
            'sma': 'Lanjutan'
        };
        return levels[educationLevel] || 'Dasar';
    }

    /**
     * Prediksi progress belajar
     */
    predictProgress(recommendations, profile) {
        const specialNeeds = profile.specialNeeds || [];
        const multiplier = specialNeeds.length > 0 ? 1.2 : 1; // Butuh waktu lebih lama jika ada kebutuhan khusus

        return {
            estimatedCompletionDays: Math.ceil(7 * multiplier),
            weeklyStudyHours: 5,
            expectedImprovement: `${15 + (specialNeeds.length * 5)}%`,
            adaptivePace: multiplier > 1 ? 'Lambat tapi pasti' : 'Normal'
        };
    }

    /**
     * Generate jadwal belajar
     */
    generateStudySchedule(recommendations, profile) {
        const educationLevel = profile.educationLevel || 'sd';
        const studyLength = educationLevel === 'sd' ? 20 : educationLevel === 'smp' ? 30 : 45;

        return {
            daily: [
                `Pagi: ${studyLength} menit (08:00 - 08:${studyLength})`,
                `Sore: ${studyLength} menit (15:00 - 15:${studyLength})`
            ],
            weekly: ['Senin', 'Rabu', 'Jumat'],
            tips: [
                'Istirahat setiap 25 menit belajar',
                'Ulangi materi yang sulit',
                'Praktekkan langsung',
                'Tidur cukup 8 jam'
            ]
        };
    }
}

// ============================================
// ROUTES API
// ============================================

const aiService = new LearningAIRecommendation();

// Endpoint: Buat profil siswa baru
app.post('/api/students', (req, res) => {
    try {
        const studentProfile = req.body;

        // Validasi input
        if (!studentProfile.age || !studentProfile.educationLevel) {
            return res.status(400).json({
                success: false,
                error: 'Age dan educationLevel wajib diisi'
            });
        }

        const studentId = 'student_' + Date.now();

        res.json({
            success: true,
            studentId,
            message: 'Profil siswa berhasil dibuat',
            profile: studentProfile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint: Get rekomendasi AI
app.post('/api/recommendations', async (req, res) => {
    try {
        const profile = req.body;

        const recommendation = await aiService.generateRecommendation(profile);

        res.json(recommendation);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: aiService.generateFallbackRecommendation(req.body)
        });
    }
});

// Endpoint: Get materi pembelajaran
app.get('/api/materials/:subject/:level', (req, res) => {
    try {
        const { subject, level } = req.params;

        const materials = {
            visual: LEARNING_MATERIALS[subject]?.[level]?.visual || null,
            audio: LEARNING_MATERIALS[subject]?.[level]?.audio || null,
            text: LEARNING_MATERIALS[subject]?.[level]?.text || null
        };

        if (!materials.visual && !materials.audio && !materials.text) {
            return res.status(404).json({
                success: false,
                error: 'Materi tidak ditemukan'
            });
        }

        res.json({
            success: true,
            materials,
            subject,
            level
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint: Quiz adaptif
app.post('/api/quiz', (req, res) => {
    try {
        const { subject, level, difficulty } = req.body;

        // Generate quiz berdasarkan level
        const quiz = generateQuiz(subject, level, difficulty);

        res.json({
            success: true,
            quiz,
            estimatedTime: '10 menit'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint: Feedback AI
app.post('/api/feedback', (req, res) => {
    try {
        const { studentId, quizResults, timeSpent } = req.body;

        const feedback = analyzeFeedback(quizResults, timeSpent);

        res.json({
            success: true,
            feedback,
            recommendations: aiService.generateRecommendation({
                educationLevel: quizResults?.level || 'sd'
            })
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint: Proxy to OpenAI (server-side). Requires env var OPENAI_API_KEY.
app.post('/api/ai', createRateLimitMiddleware('ai'), async (req, res) => {
    try {
        const { prompt, messages } = req.body || {};

        if (!prompt && !messages) {
            return res.status(400).json({ success: false, error: 'Field "prompt" or "messages" is required' });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            // Graceful fallback: indicate proxy is not configured so frontend can use local rules
            return res.json({ success: true, fallback: true, reply: 'OPENAI_API_KEY not configured on server. Using local fallback responses.' });
        }

        // Build chat messages payload (accepts either 'messages' array or simple 'prompt' string)
        const chatMessages = messages || [{ role: 'user', content: prompt }];

        // Use OpenAI Chat Completions endpoint
        const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                messages: chatMessages,
                max_tokens: 600,
                temperature: 0.7
            })
        });

        if (!openaiResp.ok) {
            const text = await openaiResp.text();
            console.error('OpenAI API error:', openaiResp.status, text);
            return res.status(502).json({ success: false, error: 'OpenAI API error', detail: text });
        }

        const data = await openaiResp.json();
        const reply = (data.choices && data.choices[0] && (data.choices[0].message?.content || data.choices[0].text)) || '';

        return res.json({ success: true, fallback: false, reply, raw: data });
    } catch (error) {
        console.error('AI proxy error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint: Progress tracking
app.get('/api/progress/:studentId', (req, res) => {
    try {
        const { studentId } = req.params;

        // Return mock progress data
        res.json({
            success: true,
            progress: {
                totalHours: 5.5,
                completedModules: 12,
                averageScore: 78,
                streak: 5,
                achievements: ['First Quiz', 'Week Learner', 'Perfect Score'],
                weeklyGoal: {
                    current: 3,
                    target: 5,
                    percentage: 60
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint: Health check
app.get('/api/health', async (req, res) => {
    let ollamaStatus = 'disconnected';
    try {
        await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 3000 });
        ollamaStatus = 'connected';
    } catch (e) { /* Ollama not running */ }

    res.json({
        status: 'healthy',
        service: 'EduCerdas AI',
        mode: aiService.fallbackMode ? 'fallback' : 'ai-enhanced',
        ollama: ollamaStatus,
        model: OLLAMA_MODEL,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// OLLAMA AI CHAT ENDPOINT - Llama 3.2
// ============================================

const CHAT_FALLBACK_RESPONSES = [
    '🎓 Maaf, saya sedang dalam mode offline. Coba lagi nanti atau gunakan fitur rekomendasi pembelajaran.',
    '📚 AI sedang tidak tersedia. Silakan coba fitur quiz atau materi pembelajaran.',
    '💡 Koneksi ke AI terputus. Anda masih bisa menggunakan semua fitur pembelajaran lainnya.'
];

async function getOllamaResponse(message) {
    try {
        const systemPrompt = `Kamu adalah EduCerdas AI, asisten pembelajaran cerdas untuk siswa Indonesia.

Tanggung jawabmu:
1. Membantu siswa memahami materi pelajaran (Matematika, IPA, IPS, Bahasa)
2. Memberikan penjelasan yang mudah dipahami sesuai jenjang (SD/SMP/SMA)
3. Mendukung pembelajaran inklusif untuk siswa berkebutuhan khusus
4. Memberikan motivasi dan tips belajar

Gunakan bahasa Indonesia yang ramah dan mudah dipahami. Berikan jawaban singkat (2-4 kalimat).`;

        const response = await axios.post(
            `${OLLAMA_URL}/api/generate`,
            {
                model: OLLAMA_MODEL,
                prompt: `${systemPrompt}\n\nPertanyaan siswa: ${message}`,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 300
                }
            },
            { timeout: 30000 }
        );

        if (response.data && response.data.response) {
            return response.data.response.trim().slice(0, 500);
        }
        return null;
    } catch (error) {
        console.error('❌ Ollama error:', error.message);
        return null;
    }
}

// POST /api/ai/chat - AI Chat dengan Llama 3.2
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        console.log(`📩 Chat message received: "${message.substring(0, 50)}..."`);

        // Try Ollama first
        const aiResponse = await getOllamaResponse(message.trim());

        if (aiResponse) {
            console.log('✅ Ollama response received');
            return res.json({
                success: true,
                reply: aiResponse,
                source: 'llama3.2',
                timestamp: new Date().toISOString()
            });
        }

        // Fallback response
        const fallback = CHAT_FALLBACK_RESPONSES[Math.floor(Math.random() * CHAT_FALLBACK_RESPONSES.length)];
        console.log('⚠️ Using fallback response');

        res.json({
            success: true,
            reply: fallback,
            source: 'fallback',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Chat error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan pada server'
        });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateQuiz(subject, level, difficulty) {
    const quizTemplates = {
        matematika: {
            'sd': [
                { question: 'Berapakah 5 + 7?', options: ['10', '11', '12', '13'], answer: 2 },
                { question: 'Berapakah 10 - 4?', options: ['5', '6', '7', '8'], answer: 1 },
                { question: 'Berapakah 3 × 4?', options: ['10', '11', '12', '13'], answer: 2 }
            ],
            'smp': [
                { question: 'Jika x + 5 = 12, berapakah x?', options: ['5', '6', '7', '8'], answer: 2 },
                { question: 'Berapakah √49?', options: ['5', '6', '7', '8'], answer: 2 },
                { question: 'Berapakah 2³?', options: ['6', '8', '9', '10'], answer: 1 }
            ],
            'sma': [
                { question: 'Turunan dari x² adalah...', options: ['x', '2x', 'x²', '2'], answer: 1 },
                { question: 'Integral dari 2x dx adalah...', options: ['x²', '2x²', 'x² + C', '2'], answer: 2 },
                { question: 'Sin 90° = ...', options: ['0', '1', '0.5', '-1'], answer: 1 }
            ]
        },
        'bahasa-indonesia': {
            'sd': [
                { question: 'Kata sinonim dari "besar" adalah...', options: ['Kecil', 'Rapat', 'Lapang', 'Aksi'], answer: 2 },
                { question: 'Kataantonim dari "cepat" adalah...', options: ['Laju', 'Lambat', 'Cepat', 'R Geos'], answer: 1 }
            ],
            'smp': [
                { question: 'Kata "mengetik" memiliki imbuhan...', options: ['me-', 'pe-', 'be-', 'di-'], answer: 0 },
                { question: 'Kalimat efektif adalah...', options: ['Panjang', 'Jelas dan singkat', 'Banyak kata', 'Bahasa asing'], answer: 1 }
            ],
            'sma': [
                { question: 'Puisi yang membandingkan dua hal disebut...', options: ['Metafora', 'Simbol', 'Personifikasi', 'Hiperbola'], answer: 0 },
                { question: 'Gaya bahasa yang memberikan sifat manusia pada benda disebut...', options: ['Metafora', 'Simbol', 'Personifikasi', 'Sinestesia'], answer: 2 }
            ]
        },
        'bahasa-inggris': {
            'sd': [
                { question: '"Apple" dalam bahasa Indonesia adalah...', options: ['Apel', 'Jeruk', 'Mangga', 'Pisang'], answer: 0 },
                { question: '"Good morning" berarti...', options: ['Selamat siang', 'Selamat pagi', 'Selamat sore', 'Selamat malam'], answer: 1 }
            ],
            'smp': [
                { question: 'Past tense dari "go" adalah...', options: ['Go', 'Gone', 'Went', 'Going'], answer: 2 },
                { question: '"Although" adalah konjungsi...', options: ['Addition', 'Contrast', 'Time', 'Cause'], answer: 1 }
            ],
            'sma': [
                { question: '"Despite" vs "Although" sama artinya dengan...', options: ['Although', 'Because', 'However', 'Therefore'], answer: 0 },
                { question: 'Conditional sentence type 1 menggunakan...', options: ['Present simple + will', 'Past simple + would', 'Past perfect + would have', 'Present perfect + have'], answer: 0 }
            ]
        },
        ipa: {
            'sd': [
                { question: 'Hewan yang memakan tumbuhan disebut...', options: ['Karnivora', 'Omnivora', 'Herbivora', 'Insektivora'], answer: 2 },
                { question: 'Air berubah menjadi es disebut...', options: ['Mencair', 'Membeku', 'Menguap', 'Mengembun'], answer: 1 }
            ],
            'smp': [
                { question: 'Satuan SI untuk massa adalah...', options: ['Meter', 'Kilogram', 'Newton', 'Liter'], answer: 1 },
                { question: 'Rumus untuk kecepatan adalah...', options: ['m × t', 's / t', 't / s', 's × t'], answer: 1 }
            ],
            'sma': [
                { question: 'Rumus E = mc² dipopulerkan oleh...', options: ['Newton', 'Einstein', 'Tesla', 'Hawking'], answer: 1 },
                { question: 'Reaksi yang melepaskan energi disebut...', options: ['Endoterm', 'Eksoterm', 'Isoterm', 'Adiabatik'], answer: 1 }
            ]
        },
        ips: {
            'sd': [
                { question: 'Ibukota Indonesia adalah...', options: ['Bandung', 'Jakarta', 'Surabaya', 'Yogyakarta'], answer: 1 },
                { question: 'Benua terpadat di dunia adalah...', options: ['Afrika', 'Amerika', 'Asia', 'Eropa'], answer: 2 }
            ],
            'smp': [
                { question: 'Pelukis lukisan "Monalisa" adalah...', options: ['Van Gogh', 'Michelangelo', 'Da Vinci', 'Rembrandt'], answer: 2 },
                { question: 'Perang Diponegoro terjadi tahun...', options: ['1825-1830', '1830-1835', '1945-1949', '1950-1955'], answer: 0 }
            ],
            'sma': [
                { question: 'Teori-teori masyarakat Weber termasuk dalam aliran...', options: ['Strukturalisme', 'Fungsionalisme', 'Interpretatif', 'Konflik'], answer: 3 },
                { question: 'Krisis ekonomi 1998 di Indonesia ditandai dengan...', options: ['Nilai tukar rupiah jatuh', 'Inflasi 100%', 'IMF masuk', 'Semua benar'], answer: 3 }
            ]
        }
    };

    const subjectQuiz = quizTemplates[subject] || quizTemplates['matematika'];
    const levelQuiz = subjectQuiz[level] || subjectQuiz['sd'];

    // Return 3-5 soal
    return {
        id: 'quiz_' + Date.now(),
        subject,
        level,
        difficulty: difficulty || 'medium',
        questions: levelQuiz.slice(0, 5),
        passingScore: 60,
        instructions: 'Jawablah pertanyaan berikut dengan memilih jawaban yang benar'
    };
}

function analyzeFeedback(quizResults, timeSpent) {
    if (!quizResults) {
        return {
            overallScore: 0,
            strengths: [],
            weaknesses: [],
            suggestions: ['Kerjakan quiz untuk mendapatkan feedback']
        };
    }

    const score = quizResults.score || 75;
    const correctCount = Math.round((score / 100) * (quizResults.questions?.length || 5));

    return {
        overallScore: score,
        correctAnswers: correctCount,
        totalQuestions: quizResults.questions?.length || 5,
        timeSpent: timeSpent || '10 menit',
        strengths: score >= 80 ? ['Pemahaman kuat', 'Jawaban cepat'] : score >= 60 ? ['Pemahaman cukup', 'Perlu latihan'] : ['Perlu banyak latihan', 'Jangan menyerah'],
        weaknesses: score < 80 ? ['Ada materi yang belum dipahami', 'Perlu review'] : [],
        suggestions: score < 60 ?
            ['Mulai dari materi dasar', 'Ulangi materi 2-3 kali', 'Gunakan mode visual'] :
            score < 80 ? ['Tingkatkan latihan soal', 'Fokus pada materi yang salah'] :
                ['Pertahankan prestasi', 'Coba materi yang lebih sulit']
    };
}

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 EduCerdas AI - Server Started Successfully!         ║
║                                                           ║
║   📡 Server running at: http://localhost:${PORT}          ║
║   📊 API Health: http://localhost:${PORT}/api/health      ║
║                                                           ║
║   🚀 Mode: AI-Enhanced (with Fallback)                   ║
║                                                           ║
║   ✨ Fitur:                                               ║
║   • Personalisasi pembelajaran                           ║
║   • AI Recommendation Engine                             ║
║   • Mode Inklusif (Disleksia, Autisme, Fokus)            ║
║   • Quiz Adaptif                                         ║
║   • Progress Tracking                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;

