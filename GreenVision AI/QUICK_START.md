# 🌍 GreenVision AI - Quick Start Guide

Platform Aksi Iklim dengan AI Lokal (Ollama). Bangun bersama untuk Bumi yang lebih hijau!

## 📋 Prerequisites

- Node.js v14+ dan npm
- Ollama (untuk AI local LLM) - **OPTIONAL** (fallback responses jika tidak tersedia)
- Terminal/Command Prompt

## 🚀 Instalasi & Setup

### 1. Install Dependencies

```bash
cd "GreenVision AI"
npm install
```

Output yang diharapkan:
```
added XX packages in Xs
```

### 2. Setup Ollama (Recommended)

**Ollama** adalah local LLM runtime yang aman dan cepat. Tidak perlu API key!

#### Windows/Mac:
1. Download dari https://ollama.ai
2. Install seperti aplikasi normal
3. Buka Terminal/Command Prompt
4. Jalankan: `ollama serve`
5. Di terminal baru: `ollama pull mistral`

#### Linux:
```bash
curl https://ollama.ai/install.sh | sh
ollama serve
# Terminal baru:
ollama pull mistral
```

**Verifikasi Ollama**:
```bash
curl http://localhost:11434/api/tags
# Harus return JSON dengan model list
```

### 3. Jalankan Backend

```bash
npm start
```

Output:
```
==================================================
🌍 GreenVision AI Backend Server
==================================================
✅ Server running on http://localhost:3000
🤖 Ollama URL: http://localhost:11434
📍 Static files: [path]/public
==================================================

✅ Ollama connection: OK
```

> **Jika Ollama tidak tersedia**: Server akan menggunakan fallback responses (tetap berfungsi!)

### 4. Jalankan Frontend (Terminal Baru)

```bash
cd GreenVision\ AI/public
python3 -m http.server 8000
```

Atau jika Python 2:
```bash
python -m SimpleHTTPServer 8000
```

Output:
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/)
```

### 5. Akses Aplikasi

Buka browser: **http://localhost:8000**

Atau coba endpoints lain:
- Frontend: http://localhost:8000 atau http://127.0.0.1:8000
- Backend API: http://localhost:3000/api/health
- Climate Data: http://localhost:3000/api/climate/data
- Energy Insights: http://localhost:3000/api/energy/insights

## 🎯 Fitur Utama

### 🏠 Beranda
- Hero section dengan CTA buttons
- Feature cards grid (4 fitur utama)
- Floating animations

### 🌍 Monitor Iklim
- Real-time climate cards
- Risk indicators (banjir, kebakaran, kekeringan)
- Alert system

### ⚡ Energi & Karbon
- Carbon footprint calculator
- Renewable energy insights
- Efficiency tips dengan animated charts

### 🌱 Lingkungan
- Air quality monitoring
- Waste management education
- Biodiversity stats

### 💬 AI Chat
- Chat dengan AI lokal (Ollama)
- Fallback responses jika Ollama unavailable
- Contextual answers tentang iklim, energi, lingkungan
- Chat history persistence

### 🎨 Dark/Light Mode
- Toggle button di nav
- Smooth transitions
- localStorage persistence

### 📱 Responsive Design
- Desktop (1024px+)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🤖 AI Integration Details

### Ollama (Recommended)
- **Model**: Mistral (7B)
- **Local**: Tidak perlu internet
- **Privacy**: Data tidak dikirim ke server eksternal
- **Speed**: Tergantung GPU (biasanya 2-10 detik per respons)

### Fallback Mode
Jika Ollama tidak tersedia:
- Sistem menggunakan rule-based responses
- Context-aware answers berdasarkan keywords
- Tetap memberikan informasi akurat tentang iklim & energi

**Fallback dibuat untuk 4 kategori**:
1. **Climate**: Cuaca, banjir, kebakaran, suhu, iklim
2. **Energy**: Energi, karbon, surya, listrik, kWh
3. **Environment**: Sampah, lingkungan, plastik, laut, terumbu
4. **Default**: Pertanyaan umum & greeting

## 🔧 Konfigurasi Environment

Buat file `.env` di root folder (optional):

```env
# Backend Server
PORT=3000
NODE_ENV=development

# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Frontend API
FRONTEND_API_URL=http://localhost:3000
```

Default (tanpa .env):
- PORT: 3000
- OLLAMA_URL: http://localhost:11434
- OLLAMA_MODEL: mistral

## 📊 API Endpoints

### Health Check
```
GET /api/health
Response: { status, timestamp, ollama: 'connected|disconnected', version }
```

### AI Chat
```
POST /api/ai/chat
Body: { message: "Bagaimana cara mengurangi jejak karbon?" }
Response: { reply, source: 'ollama|fallback', timestamp }
```

### Climate Data
```
GET /api/climate/data
Response: { regions: [...], timestamp }
```

### Energy Insights
```
GET /api/energy/insights
Response: { renewable, emissions, timestamp }
```

### Environment Status
```
GET /api/environment/status
Response: { airQuality, forests, oceans, timestamp }
```

### Suggestions
```
GET /api/suggestions
Response: { suggestions: [...] }
```

## 🐛 Troubleshooting

### ❌ "Cannot find module 'express'"
**Solution**: `npm install`

### ❌ "Port 3000 already in use"
**Solution**: 
```bash
# Change PORT in .env:
PORT=3001
npm start
```

Atau kill process:
```bash
# macOS/Linux
lsof -i :3000
kill -9 [PID]

# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

### ❌ "Cannot find module 'http.server'"
**Solution**: Gunakan Python:
```bash
# macOS/Linux
python3 -m http.server 8000

# Windows
python -m http.server 8000
```

### ⚠️ Ollama connection failed
**Solusi**:
1. Check Ollama running: `curl http://localhost:11434/api/tags`
2. Jika error: Buka Terminal baru dan jalankan: `ollama serve`
3. Server akan otomatis fallback ke rule-based responses

### ❌ "CORS error" atau "Cannot reach backend"
**Solusi**:
1. Pastikan backend running: `npm start`
2. Check URL di browser console
3. Cek firewall/antivirus jangan block port 3000

### 🐢 Chat response sangat lambat
**Reason**: Ollama generating responses (normal untuk 7B model)
- First response: 10-30 detik
- Subsequent: 2-5 detik
- Tergantung GPU/CPU

**Optimization**:
- Upgrade ke GPU (NVIDIA CUDA)
- Gunakan model lebih kecil: `ollama pull neural-chat`
- Reduce response length di backend/server.js (line ~250)

## 📚 Project Structure

```
GreenVision AI/
├── package.json          # Dependencies & scripts
├── public/
│   ├── index.html        # Frontend markup (1500+ lines)
│   ├── app.js            # Frontend logic (1200+ lines)
│   ├── styles.css        # Styling & animations (1800+ lines)
│   ├── manifest.json     # PWA config
│   └── assets/           # Images, icons
├── backend/
│   └── server.js         # Express + Ollama (500+ lines)
└── scripts/
    └── (utility scripts)
```

## 🚀 Performance Tips

1. **Disable Ollama di production** jika server resources terbatas
2. **Cache responses** untuk pertanyaan yang sering
3. **Implement rate limiting** jika public API
4. **Use GPU** untuk Ollama: `CUDA_VISIBLE_DEVICES=0 ollama serve`

## 📱 Testing di Mobile

### Local Testing
```bash
# Cari IP lokal:
ipconfig getifaddr en0  # macOS
hostname -I             # Linux
ipconfig                # Windows

# Akses dari mobile: http://[IP]:8000
```

### Production URLs
- Custom domain: Replace `localhost` dengan domain
- HTTPS: Use reverse proxy (nginx, Apache)
- PWA: Manifest.json siap untuk web app installation

## 🔐 Security Notes

- ✅ Ollama lokal: Data tidak dikirim ke cloud
- ✅ No API keys needed: Tidak ada credentials di frontend
- ✅ CORS configured: Hanya accept dari localhost
- ⚠️ Production: Ganti CORS origin list

## 📖 Documentation

- [README.md](./README.md) - Overview lengkap
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [FEATURES.md](./FEATURES.md) - Detailed feature docs

## 💚 Support & Contribution

Punya bugs atau saran?
1. Check existing issues
2. Test di local environment
3. Dokumentasi errors dengan screenshot
4. Submit improvements!

---

**Happy coding! 🌍✨**

Build dengan ❤️ untuk aksi iklim Indonesia.
