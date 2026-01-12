# SehatKu AI - Arsitektur Sistem & Dokumentasi Teknis

## 🏗️ Arsitektur Sistem

### 1. Arsitektur 3-Tier

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                     (Frontend - PWA)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Symptom    │  │     Risk     │  │    Mental    │      │
│  │   Checker    │  │  Prediction  │  │    Health    │      │
│  │   Module     │  │    Module    │  │    Module    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         App.js - State Management & Routing            │ │
│  │         (LocalStorage + IndexedDB)                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ REST API (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│                   (Backend - Node.js/Express)                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Express Middleware Stack                   │ │
│  │  • CORS • Rate Limiting • Helmet • Compression         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AI Service  │  │  Prediction  │  │    Health    │      │
│  │   (Ollama)   │  │   Service    │  │   Records    │      │
│  │              │  │   (ML)       │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         │                                         │
         │ HTTP API                                │ Mongoose ODM
         ▼                                         ▼
┌──────────────────┐                    ┌──────────────────────┐
│   DATA LAYER     │                    │    DATA LAYER        │
│                  │                    │                      │
│  Ollama Server   │                    │  MongoDB Database    │
│  (Local LLM)     │                    │                      │
│  • Llama 2       │                    │  Collections:        │
│  • Privacy-first │                    │  • users             │
│  • Offline       │                    │  • healthrecords     │
└──────────────────┘                    └──────────────────────┘
```

---

## 🔄 Data Flow Diagram

### Symptom Checker Flow

```
User Input
    │
    ▼
[Add Symptom] ──────────────────┐
    │                           │
    ▼                           │
Symptom List                    │
(Frontend State)                │
    │                           │
    ▼                           │
[Analyze Button]                │
    │                           │
    ▼                           │
API Call: POST /api/ai/symptom-check
    │                           │
    ▼                           │
Backend: AI Service             │
    │                           │
    ├─> Build Prompt            │
    │                           │
    ├─> Call Ollama API         │
    │                           │
    ├─> Parse Response          │
    │                           │
    └─> Return Analysis         │
    │                           │
    ▼                           │
Frontend: Display Results       │
    │                           │
    ├─> Diagnosis Cards         │
    ├─> Severity Badge          │
    ├─> Recommendations         │
    └─> Doctor Consultation Flag│
    │                           │
    ▼                           │
Save to LocalStorage ◄──────────┘
```

### Risk Prediction Flow

```
User Input Form
    │
    ├─> Umur
    ├─> Tinggi/Berat (BMI auto-calc)
    ├─> Jenis Kelamin
    ├─> Lifestyle Factors
    │
    ▼
[Submit Form]
    │
    ▼
API Call: POST /api/prediction/all
    │
    ▼
Backend: Prediction Service
    │
    ├─> Extract Features
    │   ├─> Calculate BMI
    │   ├─> Age factor
    │   └─> Lifestyle factors
    │
    ├─> Parallel Predictions
    │   ├─> Diabetes Risk
    │   ├─> Hypertension Risk
    │   └─> Cardiovascular Risk
    │
    └─> Generate Recommendations
    │
    ▼
Frontend: Display Results
    │
    ├─> BMI Card
    ├─> Risk Cards (3)
    │   ├─> Risk Score %
    │   ├─> Risk Level
    │   ├─> Risk Factors
    │   └─> Recommendations
    │
    ▼
Save to Dashboard State
```

---

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  nama: String,
  email: String (unique, indexed),
  nomorTelepon: String (validated),
  password: String (hashed with bcrypt),
  
  // Health Profile
  tanggalLahir: Date,
  jenisKelamin: Enum['Laki-laki', 'Perempuan'],
  golonganDarah: Enum['A', 'B', 'AB', 'O', 'Tidak Tahu'],
  tinggiBadan: Number (cm),
  beratBadan: Number (kg),
  
  // Medical History
  riwayatPenyakit: [{
    namaPenyakit: String,
    tahunDiagnosis: Number,
    status: Enum['Sembuh', 'Dalam Perawatan', 'Kronis']
  }],
  
  alergi: [{
    jenis: String,
    nama: String,
    tingkatKeparahan: Enum['Ringan', 'Sedang', 'Berat']
  }],
  
  obatRutin: [{
    namaObat: String,
    dosis: String,
    frekuensi: String,
    tujuan: String
  }],
  
  // Privacy & Settings
  privacySettings: {
    shareDataForResearch: Boolean,
    allowAIAnalysis: Boolean,
    showProfileToMedics: Boolean
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Health Records Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  recordType: Enum[
    'konsultasi_ai',
    'konsultasi_medis',
    'lab_result',
    'imaging',
    'diagnosis',
    'resep'
  ],
  tanggal: Date (indexed),
  
  // AI Consultation Data
  konsultasiAI: {
    gejala: [String],
    pertanyaanTambahan: [{
      pertanyaan: String,
      jawaban: String
    }],
    hasilAnalisis: {
      kemungkinanDiagnosis: [{
        nama: String,
        probabilitas: Number,
        deskripsi: String
      }],
      tingkatKeparahan: Enum['Ringan', 'Sedang', 'Berat', 'Darurat'],
      rekomendasiTindakan: String,
      perluKonsultasiDokter: Boolean
    },
    aiModel: String,
    confidence: Number
  },
  
  // Medical Consultation Data
  konsultasiMedis: {
    dokterNama: String,
    dokterId: ObjectId (ref: 'User'),
    spesialisasi: String,
    keluhanUtama: String,
    catatanDokter: String,
    diagnosis: String,
    tindakan: String,
    resep: [{
      namaObat: String,
      dosis: String,
      frekuensi: String,
      durasi: String,
      instruksi: String
    }]
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security Implementation

### 1. Authentication & Authorization

```javascript
// Password Hashing (bcrypt)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password Comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### 2. API Security

```javascript
// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Terlalu banyak request. Silakan coba lagi nanti.'
});

// Security Headers (Helmet)
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));
```

### 3. Input Validation

```javascript
// Email Validation
email: {
  type: String,
  required: true,
  validate: [validator.isEmail, 'Email tidak valid']
}

// Phone Number Validation
nomorTelepon: {
  type: String,
  validate: {
    validator: function(v) {
      return /^(\+62|62|0)[0-9]{9,12}$/.test(v);
    },
    message: 'Format nomor telepon tidak valid'
  }
}
```

---

## 🤖 AI Implementation Details

### Ollama Integration

```javascript
class AIService {
  constructor() {
    this.baseURL = 'http://localhost:11434';
    this.model = 'llama2';
  }
  
  async generate(prompt, options = {}) {
    const payload = {
      model: this.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.9
      }
    };
    
    const response = await axios.post(
      `${this.baseURL}/api/generate`,
      payload
    );
    
    return response.data.response;
  }
}
```

### Prompt Engineering

```javascript
// Medical Context Prompt
buildSymptomPrompt(symptoms, userProfile) {
  let prompt = `Kamu adalah asisten kesehatan AI yang membantu 
  menganalisis gejala pasien di Indonesia.\n\n`;
  
  prompt += `PROFIL PASIEN:\n`;
  if (umur) prompt += `- Umur: ${umur} tahun\n`;
  if (jenisKelamin) prompt += `- Jenis Kelamin: ${jenisKelamin}\n`;
  
  prompt += `\nGEJALA YANG DILAPORKAN:\n`;
  symptoms.forEach((symptom, index) => {
    prompt += `${index + 1}. ${symptom}\n`;
  });
  
  prompt += `\nTUGAS:\n`;
  prompt += `1. Analisis gejala-gejala tersebut\n`;
  prompt += `2. Berikan 2-3 kemungkinan diagnosis\n`;
  prompt += `3. Tentukan tingkat keparahan\n`;
  prompt += `4. Berikan rekomendasi tindakan\n`;
  
  return prompt;
}
```

---

## 📱 Frontend Architecture

### State Management

```javascript
const AppState = {
  currentPage: 'home',
  userData: null,
  symptoms: [],
  conversationHistory: [],
  
  // Persistence
  load() {
    const saved = localStorage.getItem('sehatku_ai_data');
    if (saved) {
      Object.assign(this, JSON.parse(saved));
    }
  },
  
  save() {
    localStorage.setItem('sehatku_ai_data', JSON.stringify(this));
  }
};
```

### API Client with Fallback

```javascript
const API = {
  async call(endpoint, options = {}) {
    try {
      // Try real API
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      // Fallback to mock data
      return this.getMockResponse(endpoint, options);
    }
  }
};
```

---

## 🎨 Design Tokens

```css
:root {
  /* Colors */
  --primary-500: #6366f1;
  --secondary-500: #ec4899;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  
  /* Spacing */
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  
  /* Border Radius */
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  
  /* Glass Effect */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

---

## 📊 Performance Optimization

### 1. Code Splitting
- Modular JavaScript files
- Load modules on-demand

### 2. Asset Optimization
- Compressed CSS
- Minified JavaScript (production)
- Optimized images

### 3. Caching Strategy
- LocalStorage untuk state
- Service Workers (future)
- Browser caching headers

---

## 🧪 Testing Strategy

### Manual Testing Checklist

- ✅ Symptom Checker
  - [ ] Add symptoms
  - [ ] Remove symptoms
  - [ ] Analyze with AI
  - [ ] Display results
  - [ ] Error handling

- ✅ Risk Prediction
  - [ ] Form validation
  - [ ] BMI calculation
  - [ ] All predictions
  - [ ] Results display
  - [ ] Error handling

- ✅ Mental Health
  - [ ] Send messages
  - [ ] Receive responses
  - [ ] Crisis detection
  - [ ] Conversation history
  - [ ] Error handling

- ✅ Dashboard
  - [ ] BMI display
  - [ ] Metrics update
  - [ ] Data persistence

- ✅ Offline Mode
  - [ ] Disconnect internet
  - [ ] App still works
  - [ ] Mock data fallback

---

## 🚀 Deployment Checklist

### Production Readiness

- [ ] Environment variables configured
- [ ] MongoDB connection secured
- [ ] Ollama service running
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error logging implemented
- [ ] SSL/TLS certificates
- [ ] Domain configured
- [ ] CDN for static assets
- [ ] Monitoring & alerts

---

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless backend (easy to replicate)
- MongoDB sharding for large datasets
- Load balancer for multiple instances

### Vertical Scaling
- Optimize Ollama model size
- Database indexing
- Query optimization
- Caching layer (Redis)

---

**Dokumentasi Teknis SehatKu AI**
*Versi 1.0 - Hackathon MVP*
