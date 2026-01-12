# SehatKu AI - Platform Kesehatan Digital

## 🚀 Cara Menjalankan Aplikasi

### ⚠️ PENTING: Gunakan HTTP Server

Aplikasi **HARUS** dijalankan melalui HTTP server untuk menghindari CORS errors dan memastikan semua fitur berfungsi dengan baik.

**JANGAN** buka file `index.html` langsung dengan double-click (file://).

---

### Opsi 1: Menggunakan Start Script (Recommended)

```bash
cd "/Users/amifwahyudiilmi/Documents/Hackathon - 2/sehatku-ai"
./start.sh
```

Script akan otomatis:
- Detect Python 3
- Start HTTP server di port 8000
- Buka browser ke `http://localhost:8000`

---

### Opsi 2: Python HTTP Server Manual

```bash
cd "/Users/amifwahyudiilmi/Documents/Hackathon - 2/sehatku-ai/public"
python3 -m http.server 8000
```

Lalu buka browser: `http://localhost:8000`

---

### Opsi 3: VS Code Live Server

1. Install extension "Live Server" di VS Code
2. Right-click pada `public/index.html`
3. Pilih "Open with Live Server"

---

### Opsi 4: npx http-server

```bash
cd "/Users/amifwahyudiilmi/Documents/Hackathon - 2/sehatku-ai"
npx http-server public -p 8000
```

---

## ✅ Verifikasi Aplikasi Berjalan

Setelah server running, buka browser dan pastikan:

1. ✅ Loading screen muncul (3 detik)
2. ✅ Visual storytelling page muncul
3. ✅ Scroll animations berfungsi
4. ✅ Button "Mulai Sekarang" berfungsi
5. ✅ Main app muncul dengan smooth transition
6. ✅ **Tidak ada error di console**

### Cek Console Browser

Tekan `F12` atau `Cmd+Option+I` untuk buka Developer Tools.

**Expected console output:**
```
SehatKu AI - Initializing...
✅ SehatKu AI core loaded successfully
✅ Navigation initialized
```

**Jika ada error:**
- CORS error → Pastikan menggunakan HTTP server, bukan file://
- Function not defined → Refresh halaman
- Module not loaded → Cek network tab, pastikan semua JS files loaded

---

## 🎯 Fitur Utama

### 1. Visual Storytelling Page ⭐ NEW!
- Scroll-based animations
- 5 narrative sections
- Cinematic transitions
- Skip button tersedia

### 2. Streaming AI Chatbot ⭐ WOW FACTOR!
- Character-by-character streaming
- Thinking indicator
- Smooth auto-scroll
- Professional error handling

### 3. Symptom Checker
- Add multiple symptoms
- AI analysis
- Diagnosis recommendations

### 4. Risk Prediction
- BMI calculation
- Disease risk assessment
- Personalized recommendations

### 5. Dashboard
- Health metrics overview
- Consultation history
- Real-time updates

---

## 🛡️ Stabilitas & Error Handling

### Global Error Handling
- Try-catch di semua async functions
- Window error handlers
- Graceful degradation
- User-friendly error messages

### Offline Mode
- Demo mode aktif by default
- Mock data untuk semua API calls
- Berfungsi tanpa internet

### Responsive Design
- ✅ Mobile (375px+)
- ✅ Tablet (768px+)
- ✅ Laptop (1024px+)
- ✅ Desktop (1920px+)

---

## 📱 Testing Multi-Device

### Browser DevTools
1. Buka DevTools (`F12`)
2. Click "Toggle Device Toolbar" (`Cmd+Shift+M`)
3. Test berbagai device:
   - iPhone SE (375px)
   - iPad (768px)
   - Laptop (1024px)
   - Desktop (1920px)

### Expected Behavior
- Navigation menu collapse di mobile
- Grid layouts adapt ke screen size
- Touch-friendly buttons
- No horizontal scroll
- Readable text di semua sizes

---

## 🔧 Troubleshooting

### Problem: Blank Screen
**Solution:**
1. Check console untuk errors
2. Refresh halaman (`Cmd+R`)
3. Clear cache (`Cmd+Shift+R`)
4. Pastikan menggunakan HTTP server

### Problem: Features Tidak Berfungsi
**Solution:**
1. Check console errors
2. Verify semua JS files loaded (Network tab)
3. Pastikan tidak ada CORS errors
4. Try different browser

### Problem: Animations Lag
**Solution:**
1. Close unnecessary browser tabs
2. Disable browser extensions
3. Check CPU usage
4. Try Chrome/Firefox (best performance)

### Problem: Storytelling Page Tidak Muncul
**Solution:**
1. Wait 3 seconds untuk loading
2. Check console untuk errors
3. Refresh halaman
4. Verify `storytelling.js` loaded

---

## 📊 Project Structure

```
sehatku-ai/
├── public/
│   ├── index.html              # Main HTML
│   ├── styles.css              # All styles + responsive
│   ├── app.js                  # Core app logic
│   ├── assets/
│   │   └── logo.svg           # Animated logo
│   └── modules/
│       ├── storytelling.js    # Scroll animations
│       ├── mental-health.js   # Streaming chatbot
│       ├── symptom-checker.js # Symptom analysis
│       ├── risk-prediction.js # Risk assessment
│       └── dashboard.js       # Health dashboard
├── backend/                    # Optional backend
├── start.sh                    # HTTP server script
├── DEMO_SCRIPT.md             # Demo flow guide
└── README.md                  # This file
```

---

## 🎬 Demo Preparation

### Pre-Demo Checklist
- [ ] Start HTTP server
- [ ] Test complete flow (loading → storytelling → features)
- [ ] Verify streaming chat works
- [ ] Check all animations smooth
- [ ] Clear browser cache
- [ ] Prepare backup browser tab

### Demo Flow (3.5 minutes)
1. **Loading & Storytelling** (60s) - First impression
2. **Streaming Chat** (90s) - WOW factor
3. **Other Features** (60s) - Breadth
4. **Closing** (30s) - Impact

Lihat `DEMO_SCRIPT.md` untuk detail lengkap.

---

## 🏆 Key Selling Points

1. **Visual Storytelling** - Memorable first impression
2. **Streaming AI** - Real-time, like ChatGPT
3. **Micro-Animations** - Production quality
4. **Offline-Capable** - Works without internet
5. **Responsive** - Works on all devices
6. **Stable** - Comprehensive error handling

---

## 💻 Development

### Tech Stack
- **Frontend**: Vanilla JS, HTML5, CSS3
- **Backend**: Express + MongoDB (optional)
- **AI**: Ollama (optional, has fallback)
- **Deployment**: Static hosting ready

### Code Quality
- ✅ 100% Bahasa Indonesia comments
- ✅ Modular architecture
- ✅ Error handling everywhere
- ✅ Graceful degradation
- ✅ No console errors

---

## 📞 Support

### Hotlines
- **Kesehatan Mental**: 119
- **Halo Kemenkes**: 1500-567

### Project Info
- **Email**: info@sehatku.ai
- **Hackathon**: 2026
- **Team**: SehatKu AI

---

## 🎯 Quick Start Commands

```bash
# Clone/Navigate to project
cd "/Users/amifwahyudiilmi/Documents/Hackathon - 2/sehatku-ai"

# Make start script executable
chmod +x start.sh

# Start server
./start.sh

# Or use Python directly
cd public && python3 -m http.server 8000
```

**Then open:** `http://localhost:8000`

---

## ✨ Status

**Status:** ✅ **100% DEMO READY**

**Confidence Level:** 🔥 **Very High**

**Expected Result:** 🏆 **Top 3 Finish**

---

*SehatKu AI - Kesehatan Anda, Prioritas Kami* ❤️
