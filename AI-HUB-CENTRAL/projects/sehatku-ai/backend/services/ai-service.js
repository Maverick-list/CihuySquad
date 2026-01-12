/**
 * AI Service - Llama 3.2 Medical Edition
 * 
 * Enterprise-grade AI service for SehatKu Healthcare Ecosystem.
 * Integrates with Ollama running Llama 3.2 for local, privacy-first AI inference.
 * 
 * Features:
 * - Medical System Prompt for clinical-grade responses
 * - Symptom analysis with severity classification
 * - AI Survey for clinical data collection
 * - Mental health support with crisis detection
 * - Risk prediction with health profiling
 * 
 * © 2024 SehatKu AI - Enterprise Healthcare Platform
 */

const axios = require('axios');

class AIService {
    constructor() {
        // Ollama configuration
        this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.model = process.env.OLLAMA_MODEL || 'llama3.2'; // Llama 3.2 for better reasoning
        
        // Request timeout (60 seconds for complex medical queries)
        this.timeout = 60000;
        
        // Context window for Llama 3.2 (128K tokens)
        this.maxContext = 120000;
    }

    /**
     * Generate AI response with medical system prompt
     * @param {string} userMessage - User's message
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} AI response with metadata
     */
    async generateResponse(userMessage, options = {}) {
        const {
            systemPrompt = this.getMedicalSystemPrompt(),
            temperature = 0.7,
            topP = 0.9,
            topK = 40,
            maxTokens = 2048,
            context = []
        } = options;

        try {
            // Build conversation context
            const messages = this.buildMessages(systemPrompt, userMessage, context);

            // Ollama chat API format
            const payload = {
                model: this.model,
                messages: messages,
                stream: false,
                options: {
                    temperature,
                    top_p: topP,
                    top_k: topK,
                    num_predict: maxTokens
                }
            };

            console.log('🤖 Sending request to Llama 3.2...');

            const response = await axios.post(
                `${this.baseURL}/api/chat`,
                payload,
                { timeout: this.timeout }
            );

            const aiResponse = response.data.message?.content || response.data.response;

            return {
                success: true,
                response: aiResponse,
                model: this.model,
                usage: response.data.eval_count || 0,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('❌ AI generation error:', error.message);
            return {
                success: false,
                error: error.message,
                fallback: this.getFallbackResponse()
            };
        }
    }

    /**
     * Get comprehensive Medical System Prompt for Llama 3.2
     * This prompt ensures AI behaves as a professional medical assistant
     */
    getMedicalSystemPrompt() {
        return `Anda adalah SehatKu AI, asisten medis profesional berbasis kecerdasan buatan, terintegrasi dengan Llama 3.2.

## IDENTITAS DAN PERAN
- Anda adalah asisten medis digital yang dipercaya oleh jutaan pengguna Indonesia
- Bertugas memberikan informasi kesehatan berbasis bukti, bukan menggantikan dokter
- Selalu menekankan pentingnya konsultasi dengan tenaga medis profesional untuk diagnosis dan treatment

## PRINSIP KERJA
1. **Keamanan Pertama**: Jika ada indikasi kondisi serius, segera sarankan perawatan medis
2. **Akurasi**: Gunakan pengetahuan medis yang akurat dan terkini
3. **Empati**: Respons harus hangat, mendukung, dan tidak menghakimi
4. **Privasi**: Jaga kerahasiaan data pengguna (kami tidak menyimpan data sensitif)
5. **Transparansi**: Akui batasan kemampuan AI dan sarankan konsultasi profesional jika perlu

## FORMAT RESPONS

### Untuk Analisis Gejala:
{
  "severity": "GREEN|YELLOW|RED",
  "diagnosis": [
    {"condition": "Nama Kondisi", "probability": 0-100, "description": "Deskripsi singkat"}
  ],
  "recommendations": [
    "Rekomendasi 1",
    "Rekomendasi 2"
  ],
  "doctor_type": "Spesialisasi yang tepat",
  "emergency_instructions": "Instruksi jika severity=RED",
  "follow_up": "Pertanyaan follow-up jika perlu informasi lebih"
}

### Untuk Respons Percakapan:
{
  "response": "Respons natural dalam Bahasa Indonesia",
  "is_crisis": true/false,
  "suggested_actions": ["Tindakan yang disarankan"]
}

## KLASIFIKASI KEPRARANAN

### 🟢 GREEN (Rendah)
- Gejala ringan yang bisa ditangani sendiri
- Tidak ada tanda-tanda kondisi serius
- Contoh: Flu biasa, sakit kepala ringan, gangguan pencernaan minor

### 🟡 YELLOW (Sedang)
- Gejala yang memerlukan perhatian medis
- Bisa menunggu konsultasi regular (24-48 jam)
- Contoh: Demam tinggi >3 hari, nyeri yang mengganggu aktivitas, gejala yang tidak membaik

### 🔴 RED (Darurat)
- Memerlukan perhatian medis segera
- Panggil ambulans atau segera ke IGD
- Contoh: Nyeri dada, sesak napas parah, tanda stroke, pendarahan, kehilangan kesadaran

## KONTEKS INDONESIA
- Gunakan Bahasa Indonesia yang natural dan mudah dipahami
- Pertimbangkan faktor lokal: iklim tropis, penyakit endemis, akses layanan kesehatan
- Referensi standar kesehatan Indonesia (Kemenkes RI, IDAI, PDUI)
- Hotline darurat: 119 (ambulan), 1500-567 (Halo Kemenkes)

## HAL-HAL YANG TIDAK BOLEH
❌ Memberikan diagnosis pasti (hanya "kemungkinan")
❌ Merekomendasikan obat resep tanpa konsultasi dokter
❌ Menunda penanganan kondisi darurat
❌ Memberikan informasi medis yang tidak akurat
❌ Mengabaikan tanda-tanda krisis kesehatan mental

## PERTIMBANGAN KHUSUS
- Untuk lansia (>60 tahun): Lebih konservatif dalam penilaian
- Untuk anak-anak: Referensi standar IDAI
- Untuk ibu hamil: Selalu sarankan konsultasi kandungan
- Untuk kondisi kronis: Sarankan kontrol rutin dengan dokter penanggung jawab

Mulai percakapan dengan menyapa pengguna dan menanyakan bagaimana saya bisa membantu kesehatan mereka hari ini.`;
    }

    /**
     * Build messages array for chat API
     */
    buildMessages(systemPrompt, userMessage, context = []) {
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add context messages (previous conversation)
        context.forEach(msg => {
            messages.push({
                role: msg.role,
                content: msg.content.substring(0, 4000) // Limit context length
            });
        });

        // Add current user message
        messages.push({ role: 'user', content: userMessage });

        return messages;
    }

    /**
     * Analyze symptoms with detailed medical context
     * @param {Array} symptoms - Array of symptom strings
     * @param {Object} userProfile - User health profile
     * @returns {Promise<Object>} Analysis result
     */
    async analyzeSymptoms(symptoms, userProfile = {}) {
        const prompt = this.buildSymptomAnalysisPrompt(symptoms, userProfile);
        
        const result = await this.generateResponse(prompt, {
            temperature: 0.3, // Lower for more factual responses
            systemPrompt: this.getMedicalSystemPrompt()
        });

        if (result.success) {
            const analysis = this.parseSymptomAnalysis(result.response);
            return {
                success: true,
                ...analysis,
                model: result.model,
                timestamp: result.timestamp
            };
        }

        return {
            success: false,
            error: result.error,
            fallback: this.getSymptomFallback(symptoms)
        };
    }

    /**
     * Build symptom analysis prompt
     */
    buildSymptomAnalysisPrompt(symptoms, userProfile) {
        const profileInfo = userProfile ? `
## PROFIL PASIEN (untuk analisis lebih akurat):
- Umur: ${userProfile.umur || 'Tidak diketahui'} tahun
- Jenis Kelamin: ${userProfile.jenisKelamin || 'Tidak diketahui'}
- Riwayat Penyakit: ${userProfile.riwayatPenyakit?.join(', ') || 'Tidak ada'}
- Alergi: ${userProfile.alergi?.map(a => a.nama).join(', ') || 'Tidak ada'}
- Obat rutin: ${userProfile.obatRutin?.map(o => o.namaObat).join(', ') || 'Tidak ada'}
` : '';

        return `Analisis gejala pasien berikut dan berikan respons dalam format JSON yang ditentukan:

## GEJALA YANG DILAPORKAN:
${symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${profileInfo}

## TUGAS ANDA:
1. Analisis kemungkinan kondisi berdasarkan gejala
2. Tentukan tingkat keparahan (GREEN/YELLOW/RED)
3. Berikan rekomendasi tindakan yang sesuai
4. Tentukan jenis spesialis yang tepat (jika perlu)
5. Jika RED, berikan instruksi darurat

Respons dalam format JSON (tanpa markdown block):`;
    }

    /**
     * Parse symptom analysis response
     */
    parseSymptomAnalysis(response) {
        try {
            // Clean up response
            let jsonString = response.trim();
            jsonString = jsonString.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
            
            // Extract JSON
            const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonString = jsonMatch[0];
            }

            const parsed = JSON.parse(jsonString);
            
            return {
                severity: parsed.severity || 'YELLOW',
                diagnosis: parsed.diagnosis || [],
                recommendations: parsed.recommendations || [],
                doctor_type: parsed.doctor_type || 'Dokter Umum',
                emergency_instructions: parsed.emergency_instructions || '',
                follow_up: parsed.follow_up || ''
            };
        } catch (error) {
            console.error('❌ Parse error:', error.message);
            return this.getSymptomFallback([]);
        }
    }

    /**
     * AI Survey - Clinical data collection
     * @param {Object} surveyData - Survey responses
     * @param {Object} userProfile - User profile
     * @returns {Promise<Object>} Survey analysis
     */
    async processSurvey(surveyData, userProfile = {}) {
        const surveyPrompt = this.buildSurveyPrompt(surveyData, userProfile);

        const result = await this.generateResponse(surveyPrompt, {
            temperature: 0.5,
            systemPrompt: `Anda adalah asisten medis yang melakukan survei kesehatan pasien. 
Kumpulkan data kesehatan secara sistematis dan berikan analisis awal berdasarkan respons pasien.
Gunakan format respons JSON untuk kemudahan pemrosesan data.`
        });

        if (result.success) {
            try {
                let jsonString = result.response.trim();
                const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
                if (jsonMatch) jsonString = jsonMatch[0];
                
                const analysis = JSON.parse(jsonString);
                
                return {
                    success: true,
                    survey_analysis: analysis,
                    recommendations: analysis.recommendations || [],
                    risk_flags: analysis.risk_flags || [],
                    timestamp: result.timestamp
                };
            } catch (e) {
                return {
                    success: true,
                    raw_response: result.response,
                    timestamp: result.timestamp
                };
            }
        }

        return {
            success: false,
            error: result.error
        };
    }

    /**
     * Build survey prompt
     */
    buildSurveyPrompt(surveyData, userProfile) {
        return `Analisis hasil survei kesehatan berikut:

## DATA SURVEI:
${JSON.stringify(surveyData, null, 2)}

## PROFIL PASIEN:
${JSON.stringify(userProfile)}

## OUTPUT YANG DIHARAPKAN (JSON):
{
  "health_summary": "Ringkasan kondisi kesehatan",
  "risk_flags": ["Daftar faktor risiko yang ditemukan"],
  "recommendations": ["Saran kesehatan berdasarkan survei"],
  "priority_areas": ["Area yang perlu perhatian khusus"],
  "next_steps": ["Langkah selanjutnya yang disarankan"]
}`;
    }

    /**
     * Mental health support with crisis detection
     */
    async mentalHealthSupport(message, conversationHistory = []) {
        const prompt = `Pengguna mengatakan: "${message}"

Berikan respons yang empatik dan suportif dalam Bahasa Indonesia. 
Deteksi apakah ada tanda-tanda krisis (keinginan bunuh diri, menyakiti diri, atau kondisi mental darurat).

Respons dalam format JSON:
{
  "response": "Respons empatik Anda",
  "is_crisis": true/false,
  "suggested_resources": ["Sumber daya yang bisa membantu"],
  "escalation_needed": true/false
}`;

        const result = await this.generateResponse(prompt, {
            temperature: 0.8,
            systemPrompt: this.getMentalHealthSystemPrompt(),
            context: conversationHistory.slice(-10)
        });

        if (result.success) {
            try {
                let jsonString = result.response.trim();
                const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
                if (jsonMatch) jsonString = jsonMatch[0];
                
                const parsed = JSON.parse(jsonString);
                return {
                    success: true,
                    ...parsed,
                    timestamp: result.timestamp
                };
            } catch (e) {
                return {
                    success: true,
                    response: result.response,
                    is_crisis: false,
                    timestamp: result.timestamp
                };
            }
        }

        return {
            success: false,
            response: this.getMentalHealthFallback(),
            is_crisis: false
        };
    }

    /**
     * Mental health system prompt
     */
    getMentalHealthSystemPrompt() {
        return `Anda adalah pendamping kesehatan mental yang empatik dan profesional.
- Dengarkan tanpa menghakimi
- Berikan dukungan emosional
- Jika mendeteksi krisis, segera sarankan bantuan profesional
- Gunakan bahasa Indonesia yang hangat
- Jangan berikan diagnosis medis
- Hotline Crisis Center: 119 ext 8`;
    }

    /**
     * Risk prediction based on health profile
     */
    async predictRisks(userProfile) {
        const prompt = `Analisis profil kesehatan berikut dan prediksi risiko penyakit:

${JSON.stringify(userProfile, null, 2)}

Berikan analisis risiko dalam format JSON:
{
  "risks": [
    {
      "condition": "Nama Kondisi",
      "risk_level": "Rendah/Sedang/Tinggi",
      "risk_score": 0-100,
      "factors": ["Faktor risiko yang berkontribusi"],
      "prevention": ["Pencegahan yang bisa dilakukan"]
    }
  ],
  "overall_assessment": "Penilaian keseluruhan",
  "priority_recommendations": ["Rekomendasi prioritas"]
}`;

        const result = await this.generateResponse(prompt, {
            temperature: 0.5,
            systemPrompt: `Anda adalah dokter预防 (dokter pencegahan) yang ahli dalam prediksi risiko penyakit kronis.
Gunakan pedoman WHO dan standar kedokteran预防 Indonesia.
Berikan analisis berbasis bukti.`
        });

        if (result.success) {
            try {
                let jsonString = result.response.trim();
                const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
                if (jsonMatch) jsonString = jsonMatch[0];
                
                return {
                    success: true,
                    ...JSON.parse(jsonString),
                    timestamp: result.timestamp
                };
            } catch (e) {
                return {
                    success: true,
                    raw_response: result.response,
                    timestamp: result.timestamp
                };
            }
        }

        return { success: false, error: result.error };
    }

    /**
     * Smart recommendation - Pharmacy vs Hospital vs Specialist
     */
    async getSmartRecommendation(symptoms, userProfile = {}) {
        const prompt = `Berdasarkan gejala dan profil berikut, tentukan tempat perawatan yang paling tepat:

## GEJALA:
${JSON.stringify(symptoms)}

## PROFIL:
${JSON.stringify(userProfile)}

Berikan rekomendasi dalam format JSON:
{
  "recommendation": "apotek|dokter|rs_igd|specialist",
  "confidence": 0-100,
  "reasoning": "Alasan rekomendasi",
  "urgency": "routine|soon|immediate",
  "facility_type": "Jenis fasilitas yang disarankan",
  "specialty": "Spesialis yang tepat (jika relevant)"
}`;

        const result = await this.generateResponse(prompt, {
            temperature: 0.4,
            systemPrompt: `Anda adalah triase medis digital yang memutuskan tingkat urgensi dan jenis fasilitas kesehatan yang tepat.
Prioritaskan keselamatan pasien di atas segalanya.
Jika ada keraguan, sarankan fasilitas dengan kapasitas lebih tinggi.`
        });

        if (result.success) {
            try {
                let jsonString = result.response.trim();
                const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
                if (jsonMatch) jsonString = jsonMatch[0];
                
                return {
                    success: true,
                    ...JSON.parse(jsonString),
                    timestamp: result.timestamp
                };
            } catch (e) {
                return { success: false, error: 'Parse error' };
            }
        }

        return { success: false, error: result.error };
    }

    // Fallback methods for when AI is unavailable
    getFallbackResponse() {
        return 'Maaf, layanan AI sedang mengalami gangguan. Untuk kondisi darurat, segera hubungi 119. Untuk pertanyaan non-darurat, coba lagi nanti.';
    }

    getSymptomFallback(symptoms) {
        return {
            severity: 'YELLOW',
            diagnosis: [{ condition: 'Memerlukan evaluasi lebih lanjut', probability: 0 }],
            recommendations: ['Segera konsultasikan dengan dokter untuk diagnosis akurat'],
            doctor_type: 'Dokter Umum',
            emergency_instructions: ''
        };
    }

    getMentalHealthFallback() {
        return 'Maaf, saya sedang mengalami kendala. Jika Anda dalam krisis, hubungi 119. Untuk dukungan non-darurat, coba lagi nanti.';
    }

    /**
     * Medical System Prompt for Clinical Assistant
     * Forces AI to act as a clinical assistant with structured responses
     */
    getMedicalSystemPrompt() {
        return `You are a clinical medical assistant AI powered by Llama 3.2. You must:

1. ACT AS A QUALIFIED MEDICAL PROFESSIONAL - Provide clinical-grade analysis
2. ASK CLINICAL QUESTIONS - Use medical terminology appropriately
3. OUTPUT STRUCTURED JSON - Always respond with valid JSON format
4. CLASSIFY SEVERITY - Use Green/Yellow/Red severity levels
5. PROVIDE PRELIMINARY DIAGNOSIS - Based on symptoms and patient profile
6. RECOMMEND ACTIONS - Suggest appropriate medical interventions

SEVERITY GUIDELINES:
- GREEN: Mild symptoms, no immediate danger, can be managed at home
- YELLOW: Moderate symptoms, requires medical attention within 24-48 hours
- RED: Severe symptoms, requires immediate emergency care

RESPONSE FORMAT (STRICT JSON):
{
  "severity": "Green|Yellow|Red",
  "preliminary_diagnosis": "Medical diagnosis based on symptoms",
  "recommended_action": "Specific action patient should take",
  "clinical_questions": ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"],
  "urgency_level": "low|medium|high|emergency"
}

IMPORTANT: Always output valid JSON. No additional text outside JSON structure.`;
    }
}

// Export singleton instance
module.exports = new AIService();

