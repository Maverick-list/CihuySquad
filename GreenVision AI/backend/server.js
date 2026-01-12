/**
 * GreenVision AI - Backend Server
 * Express.js + Ollama Local LLM
 * 
 * Features:
 * - Ollama local LLM integration untuk AI Chat
 * - Fallback responses jika Ollama tidak tersedia
 * - CORS enabled untuk frontend
 * - Request logging
 * - Error handling
 * - Health check endpoint
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

// ============================================
// SERVER INITIALIZATION
// ============================================

const app = express();
const PORT = process.env.PORT || 5001;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// ============================================
// MIDDLEWARE
// ============================================

// CORS - Allow frontend requests
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:8001', 'http://localhost:8002', 'http://127.0.0.1:8000', 'http://127.0.0.1:8001', 'http://127.0.0.1:8002'],
  credentials: true
}));

// Body parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Static files - serve frontend
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// FALLBACK RESPONSES
// ============================================

const FALLBACK_RESPONSES = {
  climate: [
    '🌍 Berdasarkan prediksi lokal: Suhu meningkat 2-3°C, risiko banjir tinggi di Jabodetabek, kebakaran hutan sedang di Kalimantan. Adaptasi infrastruktur menjadi kunci.',
    '💨 Analisis emisi CO₂ global menunjukkan peningkatan 0.5% per tahun. Indonesia menyumbang 1.6% emisi global. Kita perlu aksi lebih cepat untuk dekarbonisasi.',
    '⚠️ Peringatan: Cuaca ekstrim meningkat 40% dalam dekade terakhir. Banjir, kekeringan, dan puting beliung semakin sering terjadi. Adaptasi infrastruktur menjadi prioritas.',
    '🌊 Naiknya permukaan laut mengancam 17 juta orang di pulau-pulau Indonesia. Proteksi pantai dan wetland restoration sangat penting.'
  ],
  energy: [
    '⚡ Energi terbarukan Indonesia mencapai 12% dari total produksi. Target 2030 adalah 23%. Kita bisa lebih baik dengan investasi di PLTS dan PLTB!',
    '☀️ Panel surya di rumah bisa hemat listrik hingga 50%. Investasi 15-25 juta bisa balik modal dalam 5-7 tahun. Sangat menguntungkan!',
    '💡 Setiap LED yang dipasang menghemat 80% energi vs lampu pijar. Meluas pemasangan LED bisa hemat energi nasional hingga 300 MW.',
    '🌬️ Energi angin Indonesia belum maksimal. Potensi 4,800 MW masih banyak yang belum dimanfaatkan. Terutama di pulau-pulau timur.'
  ],
  environment: [
    '♻️ Sampah plastik di lautan mencapai 80 juta ton per tahun. Indonesia menyumbang 10-20% dari total. Mulai dari rumah, pisahkan sampah organik & plastik.',
    '🌳 Reforestasi Indonesia menyerap 50 juta ton CO₂ per tahun. Bayangkan jika kita menanam 1 miliar pohon! Target 2030: 3 juta hektare hutan baru.',
    '🐠 Terumbu karang kehilangan 30% populasi global. Indonesia punya 30% terumbu karang dunia. Lindungi laut dengan MPA dan kurangi limbah plastik.',
    '💧 Kualitas air 40% wilayah Indonesia sudah tercemar. Gunakan air bijak, hindari pembuangan limbah sembarangan. Air bersih adalah hak semua orang.'
  ],
  default: [
    '🤖 Saya AI Konsultan GreenVision. Tanyakan tentang iklim, energi terbarukan, atau lingkungan hidup! Saya siap membantu aksi iklim Anda.',
    '🌱 Setiap aksi kecil punya dampak besar. Mari bersama jaga Bumi untuk generasi mendatang. Mulai dari sekarang, mulai dari rumah Anda.',
    '📚 Tidak memahami pertanyaanmu. Coba ulangi dengan kata kunci: iklim, energi, sampah, lingkungan, atau karbon.',
    '🌍 GreenVision AI siap membantu. Tanya tentang mitigasi atau adaptasi perubahan iklim! Saya punya data dan insights terbaru.',
    '💚 Komitmen kami: Edukasi iklim untuk semua orang. Teknologi AI untuk aksi nyata. Mari bergerak bersama menuju masa depan hijau.'
  ]
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get random fallback response
 */
function getRandomFallback(message) {
  const msgLower = message.toLowerCase();

  if (msgLower.includes('iklim') || msgLower.includes('cuaca') || msgLower.includes('banjir') || msgLower.includes('kebakaran') || msgLower.includes('suhu')) {
    return FALLBACK_RESPONSES.climate[Math.floor(Math.random() * FALLBACK_RESPONSES.climate.length)];
  } else if (msgLower.includes('energi') || msgLower.includes('karbon') || msgLower.includes('surya') || msgLower.includes('listrik') || msgLower.includes('kWh')) {
    return FALLBACK_RESPONSES.energy[Math.floor(Math.random() * FALLBACK_RESPONSES.energy.length)];
  } else if (msgLower.includes('sampah') || msgLower.includes('lingkungan') || msgLower.includes('plastik') || msgLower.includes('laut') || msgLower.includes('terumbu')) {
    return FALLBACK_RESPONSES.environment[Math.floor(Math.random() * FALLBACK_RESPONSES.environment.length)];
  } else {
    return FALLBACK_RESPONSES.default[Math.floor(Math.random() * FALLBACK_RESPONSES.default.length)];
  }
}

/**
 * Check if Ollama is available
 */
async function checkOllamaHealth() {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.warn(`⚠️ Ollama health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Get AI response dari Ollama
 */
async function getOllamaResponse(message) {
  try {
    // System prompt untuk AI konsultan iklim
    const systemPrompt = `Kamu adalah AI konsultan GreenVision yang ahli dalam perubahan iklim, energi terbarukan, dan lingkungan hidup. 
    
Tanggung jawabmu:
1. Edukasi tentang isu-isu iklim, energi, dan lingkungan
2. Sediakan insights berbasis data tentang Indonesia
3. Dorong aksi nyata dan gaya hidup berkelanjutan
4. Gunakan bahasa Indonesia yang mudah dipahami
5. Berikan referensi konkret dan statistik real

Jangan:
- Berikan saran medis atau legal
- Memberikan informasi yang tidak akurat
- Terlalu panjang (max 3-4 kalimat)
- Gunakan emoji berlebihan (1-2 saja per respons)`;

    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: process.env.OLLAMA_MODEL || 'llama3.2:latest',
        prompt: `${systemPrompt}\n\nPertanyaan: ${message}`,
        stream: false,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40
      },
      { timeout: 30000 }
    );

    if (response.data && response.data.response) {
      const cleanResponse = response.data.response
        .trim()
        .replace(/^Pertanyaan:.*?\n\n/s, '')
        .slice(0, 500);

      console.log(`✅ Ollama response received (${cleanResponse.length} chars)`);
      return cleanResponse;
    }

    return null;
  } catch (error) {
    console.error(`❌ Ollama API error: ${error.message}`);
    return null;
  }
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Health check
 */
app.get('/api/health', async (req, res) => {
  try {
    const ollamaHealth = await checkOllamaHealth();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      ollama: ollamaHealth ? 'connected' : 'disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * AI Chat endpoint
 * POST /api/ai/chat
 * Body: { message: string }
 * Returns: { reply: string, source: 'ollama' | 'fallback' }
 */
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`💬 Chat request: "${message.slice(0, 50)}..."`);

    // Try Ollama first
    const ollamaResponse = await getOllamaResponse(message);

    if (ollamaResponse) {
      return res.json({
        reply: ollamaResponse,
        source: 'ollama',
        timestamp: new Date().toISOString()
      });
    }

    // Fallback to rule-based response
    const fallbackResponse = getRandomFallback(message);
    console.log(`🔄 Using fallback response`);

    res.json({
      reply: fallbackResponse,
      source: 'fallback',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ Chat endpoint error: ${error.message}`);
    const fallbackResponse = getRandomFallback(req.body.message || '');

    res.json({
      reply: fallbackResponse,
      source: 'fallback-error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Climate data endpoint
 */
app.get('/api/climate/data', (req, res) => {
  const climateData = {
    regions: [
      { name: 'Jabodetabek', temp: 28, humidity: 75, floodRisk: 'Tinggi', score: 85 },
      { name: 'Jawa Tengah', temp: 26, humidity: 70, floodRisk: 'Sedang', score: 65 },
      { name: 'Kalimantan', temp: 29, humidity: 80, fireRisk: 'Tinggi', score: 70 },
      { name: 'Sulawesi', temp: 27, humidity: 72, hurricaneRisk: 'Sedang', score: 60 }
    ],
    timestamp: new Date().toISOString()
  };
  res.json(climateData);
});

/**
 * Energy insights endpoint
 */
app.get('/api/energy/insights', (req, res) => {
  const energyData = {
    renewable: {
      percentage: 12,
      target2030: 23,
      sources: {
        hydro: 6.5,
        geothermal: 3.4,
        solar: 0.1,
        wind: 0.9
      }
    },
    emissions: {
      total: 615,
      perCapita: 2.3,
      trend: '+0.5%'
    },
    timestamp: new Date().toISOString()
  };
  res.json(energyData);
});

/**
 * Environment data endpoint
 */
app.get('/api/environment/status', (req, res) => {
  const envData = {
    airQuality: {
      avgAQI: 65,
      status: 'Sedang',
      worstCities: ['Jakarta', 'Bandung', 'Medan']
    },
    forests: {
      coveragePercentage: 49.9,
      deforestationRate: '-0.3% per tahun',
      protectedAreas: 546
    },
    oceans: {
      coralBleaching: 30,
      plasticPollution: 'Kritis',
      mpaMarine: 17
    },
    timestamp: new Date().toISOString()
  };
  res.json(envData);
});

/**
 * Suggestion questions
 */
app.get('/api/suggestions', (req, res) => {
  const suggestions = [
    'Bagaimana cara mengurangi jejak karbon pribadi?',
    'Apa keuntungan panel surya untuk rumah?',
    'Bagaimana Indonesia mengatasi banjir?',
    'Solusi apa untuk mengurangi sampah plastik?',
    'Apakah energi terbarukan cukup untuk Indonesia?',
    'Apa dampak perubahan iklim terhadap pangan?'
  ];
  res.json({ suggestions });
});

// ============================================
// AUTH ROUTES (In-Memory Storage)
// ============================================

// In-memory user storage for development
let authUsers = [];
let userIdCounter = 1;

/**
 * POST /api/auth/register - Register new user
 * Backward compatible: accepts both 'name' and 'nama' fields
 */
app.post('/api/auth/register', (req, res) => {
  try {
    // DEBUG: Log request body
    console.log("REQ BODY:", req.body);
    console.log("REQ BODY TYPE:", typeof req.body);
    console.log("REQ HEADERS Content-Type:", req.headers['content-type']);

    // Backward compatible field mapping - uses BOTH nama and name
    const nama = req.body.nama || req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    console.log("MAPPED VALUES:", { nama, email, password: password ? '[HIDDEN]' : 'undefined' });

    // Validation - uses mapped values
    if (!nama || !email || !password) {
      console.log("VALIDATION FAILED: missing fields");
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }

    // Check if email already exists
    const existingUser = authUsers.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Create new user (password stored as plain text for development simplicity)
    const newUser = {
      id: userIdCounter++,
      nama: nama,
      email: email,
      password: password,
      createdAt: new Date().toISOString()
    };

    authUsers.push(newUser);

    console.log(`✅ New user registered: ${email}`);

    // Return response without password
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi'
    });
  }
});

/**
 * POST /api/auth/login - Login user
 */
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi'
      });
    }

    // Find user
    const user = authUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Verify password
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    console.log(`✅ User logged in: ${email}`);

    // Return response without password
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login berhasil',
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login'
    });
  }
});

/**
 * GET /api/auth/users - Get all users (for testing)
 */
app.get('/api/auth/users', (req, res) => {
  const usersWithoutPassword = authUsers.map(({ password, ...user }) => user);
  res.json({
    success: true,
    count: usersWithoutPassword.length,
    users: usersWithoutPassword
  });
});

// ============================================
// FRONTEND ROUTING (SPA)
// ============================================

/**
 * Fallback untuk SPA - serve index.html (GET requests only)
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error(`❌ Server error: ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan'
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🌍 GreenVision AI Backend Server');
  console.log('='.repeat(50));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🤖 Ollama URL: ${OLLAMA_URL}`);
  console.log(`📍 Static files: ${path.join(__dirname, '../public')}`);
  console.log('='.repeat(50) + '\n');

  // Check Ollama health
  checkOllamaHealth().then(isHealthy => {
    if (isHealthy) {
      console.log('✅ Ollama connection: OK');
    } else {
      console.log('⚠️  Ollama not available - using fallback responses');
      console.log('💡 To enable Ollama:');
      console.log('   1. Install Ollama from https://ollama.ai');
      console.log('   2. Run: ollama serve');
      console.log('   3. Pull model: ollama pull mistral');
      console.log('   4. Restart this server\n');
    }
  });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// ============================================
// EXPORTS
// ============================================

module.exports = app;
