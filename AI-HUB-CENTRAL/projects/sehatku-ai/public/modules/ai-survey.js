/**
 * AI Survey Module - SehatKu AI
 * 
 * Clinical data collection system using Llama 3.2 for intelligent surveys.
 * Automatically stores survey results to patient profiles.
 * 
 * Features:
 * - AI-guided health surveys
 * - Natural language responses parsing
 * - Automated profile updates
 * - Risk flag detection
 * 
 * © 2024 SehatKu AI - Enterprise Healthcare Platform
 */

const AISurveyModule = {
    // Survey states
    currentStep: 0,
    answers: {},
    isComplete: false,

    // Survey configurations
    surveys: {
        initial: {
            id: 'initial_health',
            name: 'Survei Kesehatan Awal',
            description: 'Bantu kami了解 kondisi kesehatan Anda untuk analisis yang lebih akurat',
            steps: [
                {
                    id: 'main_complaint',
                    type: 'text',
                    question: 'Apa keluhan utama atau gejala yang Anda rasakan saat ini?',
                    placeholder: 'Jelaskan gejala yang Anda alami...',
                    required: true
                },
                {
                    id: 'duration',
                    type: 'choice',
                    question: 'Berapa lama gejala ini sudah berlangsung?',
                    options: [
                        { value: 'hari', label: 'Kurang dari 1 hari' },
                        { value: 'minggu', label: '1 hari - 1 minggu' },
                        { value: 'bulan', label: '1 minggu - 1 bulan' },
                        { value: 'lebih', label: 'Lebih dari 1 bulan' }
                    ],
                    required: true
                },
                {
                    id: 'severity',
                    type: 'scale',
                    question: 'Seberapa parah gejala tersebut menurut skala 1-10?',
                    min: 1,
                    max: 10,
                    required: true
                },
                {
                    id: 'pain_location',
                    type: 'text',
                    question: 'Dimana lokasi ketidaknyamanan atau rasa sakit? (jika ada)',
                    placeholder: 'Contoh: Kepala, dada, perut...',
                    required: false
                },
                {
                    id: 'triggers',
                    type: 'text',
                    question: 'Apakah ada pemicu yang memperburuk gejala?',
                    placeholder: 'Contoh: makanan tertentu, aktivitas, stres...',
                    required: false
                },
                {
                    id: 'relievers',
                    type: 'text',
                    question: 'Apakah ada yang membantu meredakan gejala?',
                    placeholder: 'Contoh: istirahat, obat, posisi tertentu...',
                    required: false
                },
                {
                    id: 'medications',
                    type: 'text',
                    question: 'Obat apa yang sudah Anda konsumsi untuk kondisi ini?',
                    placeholder: 'Nama obat dan dosis (jika ada)...',
                    required: false
                },
                {
                    id: 'medical_history',
                    type: 'multiselect',
                    question: 'Apakah Anda memiliki riwayat penyakit berikut?',
                    options: [
                        { value: 'diabetes', label: 'Diabetes' },
                        { value: 'hipertensi', label: 'Hipertensi (Tekanan Darah Tinggi)' },
                        { value: 'jantung', label: 'Penyakit Jantung' },
                        { value: 'paru', label: 'Penyakit Paru' },
                        { value: 'ginjal', label: 'Penyakit Ginjal' },
                        { value: 'hati', label: 'Penyakit Hati' },
                        { value: 'kanker', label: 'Kanker' },
                        { value: 'mental', label: 'Kesehatan Mental' },
                        { value: 'lainnya', label: 'Lainnya' },
                        { value: 'tidak_ada', label: 'Tidak ada riwayat penyakit' }
                    ],
                    required: true
                },
                {
                    id: 'family_history',
                    type: 'multiselect',
                    question: 'Apakah ada riwayat penyakit keluarga?',
                    options: [
                        { value: 'jantung', label: 'Penyakit Jantung' },
                        { value: 'diabetes', label: 'Diabetes' },
                        { value: 'kanker', label: 'Kanker' },
                        { value: 'stroke', label: 'Stroke' },
                        { value: 'hipertensi', label: 'Hipertensi' },
                        { value: 'mental', label: 'Kesehatan Mental' },
                        { value: 'tidak_tahu', label: 'Tidak tahu' },
                        { value: 'tidak_ada', label: 'Tidak ada' }
                    ],
                    required: false
                },
                {
                    id: 'lifestyle',
                    type: 'choice',
                    question: 'Bagaimana gaya hidup Anda saat ini?',
                    options: [
                        { value: 'aktif', label: 'Aktif (Olahraga teratur)' },
                        { value: 'sedang', label: 'Sedang (Aktivitas fisik ringan)' },
                        { value: 'kurang', label: 'Kurang Aktif (Gaya hidup sedentary)' }
                    ],
                    required: true
                },
                {
                    id: 'smoking',
                    type: 'choice',
                    question: 'Apakah Anda merokok?',
                    options: [
                        { value: 'tidak', label: 'Tidak pernah' },
                        { value: 'mantan', label: 'Mantan perokok' },
                        { value: 'ya', label: 'Ya, aktif' }
                    ],
                    required: true
                },
                {
                    id: 'alcohol',
                    type: 'choice',
                    question: 'Apakah Anda mengonsumsi alkohol?',
                    options: [
                        { value: 'tidak', label: 'Tidak' },
                        { value: 'occasionally', label: 'Kadang-kadang' },
                        { value: 'regular', label: 'Secara teratur' }
                    ],
                    required: true
                },
                {
                    id: 'additional',
                    type: 'text',
                    question: 'Ada informasi lain yang ingin Anda sampaikan?',
                    placeholder: 'Informasi tambahan yang relevan...',
                    required: false
                }
            ]
        },
        follow_up: {
            id: 'follow_up',
            name: 'Survei Tindak Lanjut',
            description: 'Update kondisi kesehatan Anda',
            steps: [
                {
                    id: 'condition_change',
                    type: 'choice',
                    question: 'Bagaimana kondisi Anda sejak konsultasi terakhir?',
                    options: [
                        { value: 'better', label: 'Membaik' },
                        { value: 'same', label: 'Tetap sama' },
                        { value: 'worse', label: 'Memburuk' }
                    ],
                    required: true
                },
                {
                    id: 'symptoms_update',
                    type: 'text',
                    question: 'Deskripsikan perubahan gejala yang Anda rasakan',
                    placeholder: 'Jelaskan perubahan yang terjadi...',
                    required: true
                },
                {
                    id: 'medication_effects',
                    type: 'text',
                    question: 'Apakah ada efek samping dari obat yang dikonsumsi?',
                    placeholder: 'Jelaskan jika ada efek samping...',
                    required: false
                }
            ]
        }
    },

    /**
     * Initialize the survey module
     */
    init() {
        this.createSurveyUI();
        this.bindEvents();
        console.log('✅ AI Survey Module initialized');
    },

    /**
     * Create survey UI
     */
    createSurveyUI() {
        // Check if already exists
        if (document.getElementById('survey-container')) return;

        const container = document.createElement('div');
        container.id = 'survey-container';
        container.innerHTML = `
            <div class="survey-overlay" id="survey-overlay">
                <div class="survey-modal">
                    <div class="survey-header">
                        <div class="survey-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="survey-progress"></div>
                            </div>
                            <span class="progress-text" id="survey-progress-text">1 / 5</span>
                        </div>
                        <button class="survey-close" id="survey-close">&times;</button>
                    </div>

                    <div class="survey-content" id="survey-content">
                        <!-- Survey content will be dynamically inserted -->
                    </div>

                    <div class="survey-footer">
                        <button class="survey-btn secondary" id="survey-prev" style="display: none;">
                            ← Kembali
                        </button>
                        <button class="survey-btn primary" id="survey-next">
                            Lanjutkan →
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.id = 'survey-styles';
        styles.textContent = `
            .survey-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 10000;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .survey-overlay.active {
                display: flex;
            }

            .survey-modal {
                background: var(--bg-primary);
                border-radius: 20px;
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
                animation: modalSlideIn 0.3s ease;
            }

            @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .survey-header {
                padding: 24px;
                border-bottom: 1px solid var(--glass-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .survey-progress {
                flex: 1;
                margin-right: 20px;
            }

            .survey-progress .progress-bar {
                height: 6px;
                background: var(--glass-bg);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 8px;
            }

            .survey-progress .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary-500), var(--secondary-500));
                border-radius: 3px;
                transition: width 0.3s ease;
            }

            .survey-progress .progress-text {
                font-size: 12px;
                color: var(--text-secondary);
            }

            .survey-close {
                background: none;
                border: none;
                font-size: 28px;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }

            .survey-content {
                flex: 1;
                overflow-y: auto;
                padding: 32px 24px;
            }

            .survey-question {
                display: none;
            }

            .survey-question.active {
                display: block;
            }

            .survey-question h3 {
                font-size: 20px;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 24px;
                line-height: 1.4;
            }

            .survey-question .required {
                color: var(--error);
            }

            .survey-input {
                width: 100%;
                padding: 14px 16px;
                border: 2px solid var(--glass-border);
                border-radius: 12px;
                background: var(--bg-primary);
                color: var(--text-primary);
                font-size: 16px;
                transition: all 0.2s;
            }

            .survey-input:focus {
                outline: none;
                border-color: var(--primary-500);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .survey-input::placeholder {
                color: var(--text-tertiary);
            }

            textarea.survey-input {
                min-height: 120px;
                resize: vertical;
            }

            .survey-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .survey-option {
                display: flex;
                align-items: center;
                padding: 16px;
                background: var(--glass-bg);
                border: 2px solid var(--glass-border);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .survey-option:hover {
                border-color: var(--primary-500);
                background: var(--bg-secondary);
            }

            .survey-option.selected {
                border-color: var(--primary-500);
                background: var(--primary-50);
            }

            .survey-option input {
                display: none;
            }

            .survey-option .option-marker {
                width: 24px;
                height: 24px;
                border: 2px solid var(--glass-border);
                border-radius: 50%;
                margin-right: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .survey-option.selected .option-marker {
                background: var(--primary-500);
                border-color: var(--primary-500);
            }

            .survey-option.selected .option-marker::after {
                content: '✓';
                color: white;
                font-size: 14px;
            }

            .survey-option .option-label {
                font-size: 15px;
                color: var(--text-primary);
            }

            .survey-scale {
                display: flex;
                justify-content: space-between;
                gap: 8px;
                margin-top: 16px;
            }

            .survey-scale-value {
                flex: 1;
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid var(--glass-border);
                border-radius: 12px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.2s;
                background: var(--glass-bg);
            }

            .survey-scale-value:hover {
                border-color: var(--primary-500);
            }

            .survey-scale-value.selected {
                background: var(--primary-500);
                border-color: var(--primary-500);
                color: white;
            }

            .survey-footer {
                padding: 20px 24px;
                border-top: 1px solid var(--glass-border);
                display: flex;
                justify-content: space-between;
                gap: 12px;
            }

            .survey-btn {
                padding: 14px 28px;
                border: none;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .survey-btn.primary {
                background: linear-gradient(135deg, var(--primary-600), var(--primary-500));
                color: white;
                flex: 1;
            }

            .survey-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
            }

            .survey-btn.secondary {
                background: var(--glass-bg);
                color: var(--text-primary);
            }

            .survey-btn.secondary:hover {
                background: var(--bg-secondary);
            }

            .survey-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(container);
    },

    /**
     * Bind events
     */
    bindEvents() {
        const overlay = document.getElementById('survey-overlay');
        const closeBtn = document.getElementById('survey-close');
        const prevBtn = document.getElementById('survey-prev');
        const nextBtn = document.getElementById('survey-next');

        closeBtn?.addEventListener('click', () => this.close());

        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        prevBtn?.addEventListener('click', () => this.prevStep());
        nextBtn?.addEventListener('click', () => this.nextStep());
    },

    /**
     * Start a survey
     * @param {string} surveyId - Survey type ('initial' or 'follow_up')
     */
    start(surveyId = 'initial') {
        this.currentSurvey = this.surveys[surveyId];
        if (!this.currentSurvey) {
            NotificationSystem.show('Survei tidak ditemukan', 'error');
            return;
        }

        this.currentStep = 0;
        this.answers = {};
        this.isComplete = false;

        this.renderStep();
        this.updateProgress();

        document.getElementById('survey-overlay').classList.add('active');
    },

    /**
     * Render current step
     */
    renderStep() {
        const content = document.getElementById('survey-content');
        const step = this.currentSurvey.steps[this.currentStep];

        if (!step) return;

        const totalSteps = this.currentSurvey.steps.length;

        let inputHTML = '';

        switch (step.type) {
            case 'text':
                inputHTML = `
                    <textarea 
                        class="survey-input" 
                        id="survey-input"
                        placeholder="${step.placeholder || ''}"
                        rows="4"
                    >${this.answers[step.id] || ''}</textarea>
                `;
                break;

            case 'choice':
                inputHTML = `<div class="survey-options">`;
                step.options.forEach(opt => {
                    const isSelected = this.answers[step.id] === opt.value;
                    inputHTML += `
                        <label class="survey-option ${isSelected ? 'selected' : ''}">
                            <input 
                                type="radio" 
                                name="survey-${step.id}" 
                                value="${opt.value}"
                                ${isSelected ? 'checked' : ''}
                            >
                            <span class="option-marker"></span>
                            <span class="option-label">${opt.label}</span>
                        </label>
                    `;
                });
                inputHTML += `</div>`;
                break;

            case 'multiselect':
                const selectedValues = this.answers[step.id] || [];
                inputHTML = `<div class="survey-options">`;
                step.options.forEach(opt => {
                    const isSelected = selectedValues.includes(opt.value);
                    inputHTML += `
                        <label class="survey-option ${isSelected ? 'selected' : ''}">
                            <input 
                                type="checkbox" 
                                name="survey-${step.id}" 
                                value="${opt.value}"
                                ${isSelected ? 'checked' : ''}
                            >
                            <span class="option-marker"></span>
                            <span class="option-label">${opt.label}</span>
                        </label>
                    `;
                });
                inputHTML += `</div>`;
                break;

            case 'scale':
                inputHTML = `
                    <input 
                        type="range" 
                        class="survey-input" 
                        id="survey-input"
                        min="${step.min || 1}"
                        max="${step.max || 10}"
                        value="${this.answers[step.id] || Math.ceil((step.max || 10) / 2)}"
                        oninput="document.getElementById('scale-value').textContent = this.value"
                    >
                    <div class="survey-scale" id="scale-options">
                        ${Array.from({ length: (step.max || 10) - (step.min || 1) + 1 }, (_, i) => (i + (step.min || 1))).map(n => `
                            <div class="survey-scale-value ${this.answers[step.id] == n ? 'selected' : ''}" 
                                 onclick="document.getElementById('survey-input').value = ${n}; AISurveyModule.answers['${step.id}'] = ${n}; document.getElementById('scale-value').textContent = ${n}; document.querySelectorAll('.survey-scale-value').forEach(el => el.classList.remove('selected')); this.classList.add('selected')">
                                ${n}
                            </div>
                        `).join('')}
                    </div>
                    <p style="text-align: center; margin-top: 12px; color: var(--primary-500); font-weight: 600;">
                        Nilai: <span id="scale-value">${this.answers[step.id] || Math.ceil((step.max || 10) / 2)}</span>
                    </p>
                `;
                break;
        }

        content.innerHTML = `
            <div class="survey-question active">
                <h3>
                    ${step.question}
                    ${step.required ? '<span class="required">*</span>' : ''}
                </h3>
                ${inputHTML}
            </div>
        `;

        // Bind change events
        this.bindInputEvents(step);
    },

    /**
     * Bind input events for current step
     */
    bindInputEvents(step) {
        const input = document.getElementById('survey-input');

        if (step.type === 'text' && input) {
            input.addEventListener('input', (e) => {
                this.answers[step.id] = e.target.value;
            });
        }

        // Radio buttons
        document.querySelectorAll(`input[name="survey-${step.id}"]`).forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.answers[step.id] = e.target.value;
                // Update UI
                document.querySelectorAll(`.survey-option input[name="survey-${step.id}"]`).forEach(opt => {
                    opt.closest('.survey-option').classList.toggle('selected', opt.checked);
                });
            });
        });

        // Checkboxes
        document.querySelectorAll(`input[name="survey-${step.id}"]`).forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const current = this.answers[step.id] || [];
                if (e.target.checked) {
                    current.push(e.target.value);
                } else {
                    const idx = current.indexOf(e.target.value);
                    if (idx > -1) current.splice(idx, 1);
                }
                this.answers[step.id] = current;
                e.target.closest('.survey-option').classList.toggle('selected', e.target.checked);
            });
        });

        // Scale input
        if (step.type === 'scale' && input) {
            input.addEventListener('input', (e) => {
                this.answers[step.id] = parseInt(e.target.value);
                document.getElementById('scale-value').textContent = e.target.value;
                document.querySelectorAll('#scale-options .survey-scale-value').forEach(el => {
                    el.classList.toggle('selected', parseInt(el.textContent) === parseInt(e.target.value));
                });
            });
        }
    },

    /**
     * Update progress bar
     */
    updateProgress() {
        const totalSteps = this.currentSurvey.steps.length;
        const progress = ((this.currentStep + 1) / totalSteps) * 100;

        document.getElementById('survey-progress').style.width = `${progress}%`;
        document.getElementById('survey-progress-text').textContent =
            `${this.currentStep + 1} / ${totalSteps}`;

        // Update buttons
        const prevBtn = document.getElementById('survey-prev');
        const nextBtn = document.getElementById('survey-next');

        prevBtn.style.display = this.currentStep > 0 ? 'block' : 'none';
        nextBtn.textContent = this.currentStep < totalSteps - 1 ? 'Lanjutkan →' : 'Kirim Survei →';
    },

    /**
     * Go to next step
     */
    async nextStep() {
        const step = this.currentSurvey.steps[this.currentStep];

        // Validate required
        if (step.required && !this.answers[step.id]) {
            NotificationSystem.show('Pertanyaan ini wajib dijawab', 'warning');
            return;
        }

        // Save text input value
        const input = document.getElementById('survey-input');
        if (step.type === 'text' && input) {
            this.answers[step.id] = input.value;
        }

        if (this.currentStep < this.currentSurvey.steps.length - 1) {
            this.currentStep++;
            this.renderStep();
            this.updateProgress();
        } else {
            // Submit survey
            await this.submitSurvey();
        }
    },

    /**
     * Go to previous step
     */
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
            this.updateProgress();
        }
    },

    /**
     * Submit survey to backend with AI processing
     */
    async submitSurvey() {
        try {
            NotificationSystem.show('Menganalisis gejala dengan AI...', 'info');

            // Prepare survey data
            const surveyData = {
                initialSymptoms: this.answers.main_complaint || '',
                surveyAnswers: this.answers,
                timestamp: new Date().toISOString()
            };

            // Get user profile if authenticated
            let userProfile = {};
            if (AppState.auth.isAuthenticated && AppState.auth.user) {
                userProfile = {
                    age: AppState.auth.user.tanggalLahir ?
                        Math.floor((Date.now() - new Date(AppState.auth.user.tanggalLahir).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
                    jenisKelamin: AppState.auth.user.jenisKelamin,
                    golonganDarah: AppState.auth.user.golonganDarah,
                    tinggiBadan: AppState.auth.user.tinggiBadan,
                    beratBadan: AppState.auth.user.beratBadan,
                    alergi: AppState.auth.user.alergi || [],
                    riwayatPenyakit: AppState.auth.user.riwayatPenyakit || []
                };
            }

            // Call AI survey endpoint
            const response = await fetch(`${CONFIG.API_BASE_URL}/ai/conduct-survey`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AppState.auth.isAuthenticated ? `Bearer ${AppState.auth.token}` : ''
                },
                body: JSON.stringify({
                    initialSymptoms: surveyData.initialSymptoms,
                    userProfile: userProfile
                })
            });

            const result = await response.json();

            if (result.success) {
                const surveyResult = result.survey_result;

                // Check for emergency
                if (surveyResult.severity === 'Red') {
                    // Trigger emergency alert
                    window.dispatchEvent(new CustomEvent('ai-survey-result', {
                        detail: {
                            severity: surveyResult.severity,
                            diagnosis: surveyResult.preliminary_diagnosis,
                            action: surveyResult.recommended_action
                        }
                    }));
                }

                // Show results
                this.showResults(surveyResult);

                // Close survey
                this.close();

                NotificationSystem.show('Analisis AI selesai!', 'success');

            } else {
                NotificationSystem.show(result.message || 'Gagal memproses survei', 'error');
            }

        } catch (error) {
            console.error('Survey submission error:', error);
            NotificationSystem.show('Terjadi kesalahan saat memproses survei', 'error');
        }
    },

    /**
     * Show AI survey results
     * @param {Object} surveyResult - AI analysis result
     */
    showResults(surveyResult) {
        const severityColors = {
            'Green': { bg: '#10B981', text: '#064E3B', icon: '🟢' },
            'Yellow': { bg: '#F59E0B', text: '#92400E', icon: '🟡' },
            'Red': { bg: '#EF4444', text: '#7F1D1D', icon: '🔴' }
        };

        const colors = severityColors[surveyResult.severity] || severityColors['Green'];

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                <div class="p-6" style="background: linear-gradient(135deg, ${colors.bg}20, ${colors.bg}10); border-bottom: 3px solid ${colors.bg};">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <span class="text-3xl mr-3">${colors.icon}</span>
                            <div>
                                <h2 class="text-xl font-bold text-gray-800">Hasil Analisis AI</h2>
                                <p class="text-sm text-gray-600">Severity: ${surveyResult.severity}</p>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                </div>

                <div class="p-6 space-y-4 max-h-96 overflow-y-auto">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <h3 class="font-semibold text-gray-800 mb-2">Diagnosis Awal</h3>
                        <p class="text-gray-700">${surveyResult.preliminary_diagnosis}</p>
                    </div>

                    <div class="bg-blue-50 rounded-lg p-4">
                        <h3 class="font-semibold text-blue-800 mb-2">Tindakan yang Dianjurkan</h3>
                        <p class="text-blue-700">${surveyResult.recommended_action}</p>
                    </div>

                    ${surveyResult.clinical_questions && surveyResult.clinical_questions.length > 0 ? `
                        <div class="bg-yellow-50 rounded-lg p-4">
                            <h3 class="font-semibold text-yellow-800 mb-2">Pertanyaan Tindak Lanjut</h3>
                            <ol class="list-decimal list-inside text-yellow-700 space-y-1">
                                ${surveyResult.clinical_questions.map(q => `<li>${q}</li>`).join('')}
                            </ol>
                        </div>
                    ` : ''}

                    <div class="bg-gray-50 rounded-lg p-4">
                        <h3 class="font-semibold text-gray-800 mb-2">Urgency Level</h3>
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${surveyResult.urgency_level === 'emergency' ? 'bg-red-100 text-red-800' :
                surveyResult.urgency_level === 'high' ? 'bg-orange-100 text-orange-800' :
                    surveyResult.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
            }">
                            ${surveyResult.urgency_level?.toUpperCase() || 'LOW'}
                        </span>
                    </div>
                </div>

                <div class="p-6 bg-gray-50 flex gap-3">
                    <button onclick="this.closest('.fixed').remove()"
                            class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                        Tutup
                    </button>
                    ${surveyResult.severity !== 'Green' ? `
                        <button onclick="window.mapService?.getSmartRecommendations('${surveyResult.severity}'); this.closest('.fixed').remove()"
                                class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            Cari ${surveyResult.severity === 'Red' ? 'UGD' : 'Rumah Sakit'}
                        </button>
                    ` : `
                        <button onclick="window.mapService?.getSmartRecommendations('${surveyResult.severity}'); this.closest('.fixed').remove()"
                                class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                            Cari Apotek
                        </button>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },


    /**
     * Show AI analysis results
     */
    showAnalysis(analysis) {
        const modal = document.createElement('div');
        modal.className = 'survey-overlay active';
        modal.innerHTML = `
            <div class="survey-modal" style="max-width: 450px;">
                <div class="survey-header">
                    <h3>📊 Hasil Analisis Survei</h3>
                    <button class="survey-close" onclick="this.closest('.survey-overlay').remove()">&times;</button>
                </div>
                <div class="survey-content">
                    ${analysis.health_summary ? `
                        <div class="glass-card" style="margin-bottom: 16px;">
                            <h4 style="color: var(--primary-500); margin-bottom: 8px;">Ringkasan Kesehatan</h4>
                            <p>${analysis.health_summary}</p>
                        </div>
                    ` : ''}
                    
                    ${analysis.risk_flags && analysis.risk_flags.length > 0 ? `
                        <div class="glass-card" style="margin-bottom: 16px; border-left: 4px solid var(--warning);">
                            <h4 style="color: var(--warning); margin-bottom: 8px;">⚠️ Faktor Risiko Terdeteksi</h4>
                            <ul style="padding-left: 20px; margin: 0;">
                                ${analysis.risk_flags.map(flag => `<li>${flag}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${analysis.recommendations && analysis.recommendations.length > 0 ? `
                        <div class="glass-card">
                            <h4 style="color: var(--success); margin-bottom: 8px;">💡 Rekomendasi</h4>
                            <ul style="padding-left: 20px; margin: 0;">
                                ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                <div class="survey-footer">
                    <button class="survey-btn primary" onclick="this.closest('.survey-overlay').remove()">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    /**
     * Close survey modal
     */
    close() {
        document.getElementById('survey-overlay').classList.remove('active');
    }
};

// Global exposure
window.AISurveyModule = AISurveyModule;

