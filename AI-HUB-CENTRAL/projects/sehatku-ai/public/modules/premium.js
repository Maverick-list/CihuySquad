/**
 * Premium Module - SehatKu AI
 * 
 * Menangani fitur premium: upgrade, konsultasi dokter, chat
 * Dengan premium lock UI untuk non-premium users
 */

const PremiumModule = {
    currentConsultation: null,
    doctors: [],
    isLoading: false,

    init() {
        this.createPremiumUI();
        this.bindEvents();
        this.updatePremiumUI();
    },

    /**
     * Check if current user is premium
     */
    isPremium() {
        const user = AppState.auth?.user;
        if (!user) return false;
        
        const storedUser = JSON.parse(localStorage.getItem('sehatku_user') || '{}');
        const currentUser = user._id ? user : storedUser;
        
        if (currentUser.isPremium === true) {
            if (currentUser.premiumExpiresAt) {
                return new Date(currentUser.premiumExpiresAt) > new Date();
            }
            return true;
        }
        return currentUser.role === 'PREMIUM';
    },

    /**
     * Show premium required modal
     */
    showPremiumRequired(message = 'Fitur ini memerlukan akses premium') {
        let modal = document.getElementById('premium-required-modal');
        if (!modal) {
            modal = this.createPremiumRequiredModal();
            document.body.appendChild(modal);
        }
        const messageEl = modal.querySelector('#premium-required-message');
        if (messageEl) messageEl.textContent = message;
        modal.style.display = 'flex';
    },

    createPremiumRequiredModal() {
        const modal = document.createElement('div');
        modal.id = 'premium-required-modal';
        modal.className = 'premium-overlay';
        modal.innerHTML = `
            <div class="premium-modal">
                <div class="premium-header">
                    <div class="premium-lock-icon">🔒</div>
                    <h2>Akses Premium Diperlukan</h2>
                    <button class="premium-close" onclick="PremiumModule.hidePremiumRequired()">&times;</button>
                </div>
                <div class="premium-content">
                    <p id="premium-required-message">Fitur ini memerlukan akses premium</p>
                    <div class="premium-benefit-preview">
                        <h4>Keuntungan Premium:</h4>
                        <ul>
                            <li>✅ Konsultasi dokter 24/7</li>
                            <li>✅ Chat real-time dengan dokter</li>
                            <li>✅ Riwayat kesehatan lengkap</li>
                            <li>✅ Prediksi risiko advance</li>
                        </ul>
                    </div>
                    <button class="premium-btn" onclick="PremiumModule.showUpgradeModal(); PremiumModule.hidePremiumRequired();">
                        ✨ Upgrade ke Premium
                    </button>
                    <p class="premium-subtitle">Hanya Rp 50.000/bulan</p>
                </div>
        `;
        return modal;
    },

    hidePremiumRequired() {
        const modal = document.getElementById('premium-required-modal');
        if (modal) modal.style.display = 'none';
    },

    updatePremiumUI() {
        const isUserPremium = this.isPremium();
        const premiumNavBtn = document.getElementById('nav-premium-btn');
        if (premiumNavBtn) {
            if (isUserPremium) {
                premiumNavBtn.innerHTML = '⭐ Premium Aktif';
                premiumNavBtn.classList.add('premium-active');
            } else {
                premiumNavBtn.innerHTML = '✨ Upgrade Premium';
                premiumNavBtn.classList.remove('premium-active');
            }
        }
        document.querySelectorAll('.feature-card[data-premium="true"]').forEach(card => {
            if (!isUserPremium) {
                card.classList.add('locked');
                if (!card.querySelector('.premium-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'premium-badge';
                    badge.innerHTML = '🔒 Premium';
                    card.style.position = 'relative';
                    card.appendChild(badge);
                }
            } else {
                card.classList.remove('locked');
                const badge = card.querySelector('.premium-badge');
                if (badge) badge.remove();
            }
        });
    },

    createPremiumUI() {
        const premiumContainer = document.createElement('div');
        premiumContainer.id = 'premium-container';
        premiumContainer.innerHTML = `
            <div class="premium-overlay" id="premium-upgrade-overlay">
                <div class="premium-modal">
                    <div class="premium-header">
                        <div class="premium-crown">👑</div>
                        <h2>Upgrade ke Premium</h2>
                        <button class="premium-close" id="premium-upgrade-close">&times;</button>
                    </div>
                    <div class="premium-content">
                        <div class="premium-benefits">
                            <h3>Keuntungan Premium</h3>
                            <ul class="benefits-list">
                                <li>✅ Konsultasi dokter 24/7</li>
                                <li>✅ Chat real-time dengan dokter</li>
                                <li>✅ Riwayat kesehatan lengkap</li>
                                <li>✅ Prediksi risiko advance</li>
                            </ul>
                        </div>
                        <div class="premium-plans">
                            <div class="plan-card active" data-duration="1">
                                <h4>1 Bulan</h4>
                                <div class="plan-price">Rp 50.000</div>
                            <div class="plan-card" data-duration="3">
                                <h4>3 Bulan</h4>
                                <div class="plan-price">Rp 135.000</div>
                            <div class="plan-card" data-duration="12">
                                <h4>12 Bulan</h4>
                                <div class="plan-price">Rp 500.000</div>
                        </div>
                        <div class="payment-form">
                            <h4>Metode Pembayaran</h4>
                            <div class="payment-methods">
                                <label class="payment-method">
                                    <input type="radio" name="paymentMethod" value="gopay" checked>
                                    <span>GoPay</span>
                                </label>
                                <label class="payment-method">
                                    <input type="radio" name="paymentMethod" value="ovo">
                                    <span>OVO</span>
                                </label>
                                <label class="payment-method">
                                    <input type="radio" name="paymentMethod" value="dana">
                                    <span>DANA</span>
                                </label>
                                <label class="payment-method">
                                    <input type="radio" name="paymentMethod" value="transfer">
                                    <span>Transfer</span>
                                </label>
                            </div>
                            <button class="premium-btn" id="upgradeConfirmBtn">🚀 Upgrade Sekarang</button>
                        </div>
                </div>
            <div class="premium-overlay" id="consultation-overlay">
                <div class="premium-modal large">
                    <div class="premium-header">
                        <h2 id="consultation-title">Pilih Dokter</h2>
                        <button class="premium-close" id="consultation-close">&times;</button>
                    </div>
                    <div class="premium-content">
                        <div id="doctor-list" class="doctor-list"></div>
                        <div id="chat-interface" class="chat-interface" style="display:none;">
                            <div class="chat-header">
                                <div class="doctor-info">
                                    <div class="doctor-avatar" id="chat-doctor-avatar">👨‍⚕️</div>
                                    <div class="doctor-details">
                                        <h4 id="chat-doctor-name">Dr.</h4>
                                        <p id="chat-doctor-specialty"></p>
                                    </div>
                                <button class="end-chat-btn" id="endChatBtn">Akhiri</button>
                            </div>
                            <div class="chat-messages" id="chat-messages"></div>
                            <div class="chat-input">
                                <input type="text" id="chat-input" placeholder="Ketik pesan...">
                                <button id="send-message-btn">Kirim</button>
                            </div>
                    </div>
            </div>
        `;

        const styles = document.createElement('style');
        styles.textContent = `
            .premium-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                z-index: 10001; display: none;
                background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
            }
            .premium-modal {
                background: var(--bg-primary); border-radius: 16px;
                box-shadow: 0 25px 50px rgba(0,0,0,0.4);
                width: 100%; max-width: 500px; max-height: 90vh;
                margin: 20px; overflow-y: auto;
            }
            .premium-modal.large { max-width: 800px; }
            .premium-header {
                display: flex; flex-direction: column; align-items: center;
                padding: 24px; border-bottom: 1px solid var(--glass-border);
            }
            .premium-header h2 { margin: 12px 0 0 0; color: var(--text-primary); font-size: 1.5rem; }
            .premium-close {
                position: absolute; top: 16px; right: 16px;
                background: var(--bg-secondary); border: 1px solid var(--glass-border);
                font-size: 24px; color: var(--text-secondary); cursor: pointer;
                padding: 4px 10px; border-radius: 50%; width: 36px; height: 36px;
            }
            .premium-close:hover { background: var(--error); color: white; }
            .premium-crown, .premium-lock-icon { font-size: 48px; }
            .premium-content { padding: 24px; }
            .premium-plans { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 20px; }
            .plan-card {
                border: 2px solid var(--glass-border); border-radius: 12px;
                padding: 16px; text-align: center; cursor: pointer;
                background: var(--bg-secondary); transition: all 0.2s;
            }
            .plan-card.active { border-color: var(--primary-500); background: rgba(99,102,241,0.1); }
            .plan-price { font-size: 1.25rem; font-weight: bold; color: var(--primary-500); }
            .payment-methods { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
            .payment-method {
                display: flex; align-items: center; gap: 8px; padding: 12px;
                border: 2px solid var(--glass-border); border-radius: 8px;
                cursor: pointer; background: var(--bg-secondary);
            }
            .premium-btn {
                width: 100%; padding: 14px; border: none; border-radius: 10px;
                background: linear-gradient(135deg, var(--primary-600), var(--primary-500));
                color: white; font-size: 1rem; font-weight: 600; cursor: pointer;
            }
            .premium-btn:hover { transform: translateY(-2px); }
            .premium-badge {
                position: absolute; top: -8px; right: -8px;
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                color: white; padding: 4px 10px; border-radius: 20px;
                font-size: 0.7rem; font-weight: 700;
            }
            .doctor-card {
                border: 1px solid var(--glass-border); border-radius: 12px;
                padding: 16px; display: flex; align-items: center; gap: 16px;
                background: var(--bg-secondary); margin-bottom: 12px;
            }
            .doctor-avatar {
                width: 56px; height: 56px; border-radius: 50%;
                background: linear-gradient(135deg, var(--primary-600), var(--primary-500));
                display: flex; align-items: center; justify-content: center; font-size: 24px;
            }
            .consult-btn {
                padding: 8px 16px; border: none; border-radius: 8px;
                background: var(--primary-500); color: white; cursor: pointer;
            }
            .chat-interface { display: flex; flex-direction: column; height: 500px; }
            .chat-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 16px; border-bottom: 1px solid var(--glass-border);
                background: var(--bg-secondary);
            }
            .chat-messages {
                flex: 1; overflow-y: auto; padding: 16px; display: flex;
                flex-direction: column; gap: 12px; background: var(--bg-primary);
            }
            .message {
                max-width: 75%; padding: 12px 16px; border-radius: 16px;
                font-size: 0.95rem;
            }
            .message.user { align-self: flex-end; background: var(--primary-500); color: white; }
            .message.doctor { align-self: flex-start; background: var(--bg-secondary); }
            .chat-input { display: flex; gap: 10px; padding: 16px; border-top: 1px solid var(--glass-border); background: var(--bg-secondary); }
            .chat-input input { flex: 1; padding: 12px; border: 2px solid var(--glass-border); border-radius: 10px; }
            .chat-input button { padding: 12px 24px; border: none; border-radius: 10px; background: var(--primary-500); color: white; cursor: pointer; }
        `;
        document.head.appendChild(styles);
        document.body.appendChild(premiumContainer);
    },

    bindEvents() {
        document.getElementById('premium-upgrade-close')?.addEventListener('click', () => this.hideUpgradeModal());
        document.getElementById('consultation-close')?.addEventListener('click', () => this.hideConsultationModal());
        document.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
        document.getElementById('upgradeConfirmBtn')?.addEventListener('click', () => this.handleUpgrade());
        document.getElementById('send-message-btn')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.sendMessage(); });
        document.getElementById('endChatBtn')?.addEventListener('click', () => this.endConsultation());
    },

    showUpgradeModal() {
        if (!AppState.auth.isAuthenticated) {
            NotificationSystem.show('Silakan login terlebih dahulu', 'error');
            if (window.AuthModule) AuthModule.show('login');
            return;
        }
        document.getElementById('premium-upgrade-overlay').style.display = 'flex';
    },

    hideUpgradeModal() { document.getElementById('premium-upgrade-overlay').style.display = 'none'; },

    showConsultationModal() {
        if (!this.isPremium()) { this.showPremiumRequired(); return; }
        document.getElementById('consultation-overlay').style.display = 'flex';
        this.loadDoctors();
    },

    hideConsultationModal() {
        document.getElementById('consultation-overlay').style.display = 'none';
        this.currentConsultation = null;
    },

    async loadDoctors() {
        const doctorList = document.getElementById('doctor-list');
        try {
            const response = await API.getDoctors();
            if (response.success) {
                this.doctors = response.doctors;
                doctorList.innerHTML = this.doctors.map(d => `
                    <div class="doctor-card">
                        <div class="doctor-avatar">${d.avatar}</div>
                        <div class="doctor-info">
                            <h4>${this.escapeHtml(d.nama)}</h4>
                            <p>${this.escapeHtml(d.spesialisasi)}</p>
                            <p>⭐ ${d.rating} (${d.reviewCount} ulasan)</p>
                        </div>
                        <button class="consult-btn" onclick="PremiumModule.startConsultation('${d.id}')">Konsultasi</button>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Load doctors error:', error);
            NotificationSystem.show('Gagal memuat data dokter', 'error');
        }
    },

    async startConsultation(doctorId) {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;
        try {
            const response = await API.startConsultation(doctorId);
            if (response.success) {
                this.currentConsultation = { sessionId: response.consultation.sessionId, doctor: response.consultation.doctor };
                document.getElementById('doctor-list').style.display = 'none';
                document.getElementById('chat-interface').style.display = 'flex';
                document.getElementById('chat-doctor-avatar').textContent = doctor.avatar;
                document.getElementById('chat-doctor-name').textContent = doctor.nama;
                document.getElementById('chat-doctor-specialty').textContent = doctor.spesialisasi;
                NotificationSystem.show('Konsultasi dimulai!', 'success');
            }
        } catch (error) {
            console.error(error);
            NotificationSystem.show('Gagal memulai konsultasi', 'error');
        }
    },

    async sendMessage() {
        if (!this.currentConsultation) return;
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;
        input.value = '';
        try {
            const response = await API.sendConsultationMessage(this.currentConsultation.sessionId, message);
            if (response.success) {
                const messages = document.getElementById('chat-messages');
                messages.innerHTML += `<div class="message user"><p>${this.escapeHtml(message)}</p></div>`;
                messages.scrollTop = messages.scrollHeight;
            }
        } catch (error) {
            console.error(error);
        }
    },

    async endConsultation() {
        if (!this.currentConsultation) return;
        if (confirm('Akhiri konsultasi?')) {
            this.hideConsultationModal();
            NotificationSystem.show('Konsultasi telah diakhiri', 'success');
        }
    },

    async handleUpgrade() {
        const selectedPlan = document.querySelector('.plan-card.active');
        if (!selectedPlan) { NotificationSystem.show('Pilih paket premium', 'error'); return; }
        const duration = parseInt(selectedPlan.dataset.duration);
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'gopay';
        try {
            const response = await API.activatePremium({ paymentMethod, duration });
            if (response.success) {
                AppState.auth.user = response.user;
                AppState.auth.token = response.token;
                AppState.save();
                NotificationSystem.show('🎉 Premium berhasil diaktifkan!', 'success');
                this.hideUpgradeModal();
                this.updatePremiumUI();
                if (window.AuthModule) AuthModule.updateUI();
            } else {
                NotificationSystem.show(response.message || 'Gagal', 'error');
            }
        } catch (error) {
            console.error(error);
            NotificationSystem.show('Terjadi kesalahan', 'error');
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.PremiumModule = PremiumModule;
