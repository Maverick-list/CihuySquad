/**
 * Auth Module - SehatKu AI
 *
 * Menangani authentication UI: login, register, profile
 * Integrasi dengan backend auth API
 */

const AuthModule = {
    currentView: 'login', // 'login', 'register', 'profile'
    isLoading: false,

    init() {
        this.createAuthUI();
        this.bindEvents();
        this.checkAuthStatus();
    },

    createAuthUI() {
        // Buat auth container
        const authContainer = document.createElement('div');
        authContainer.id = 'auth-container';
        authContainer.className = 'auth-container';
        authContainer.innerHTML = `
            <div class="auth-overlay" id="auth-overlay">
                <div class="auth-modal">
                    <div class="auth-header">
                        <h2 id="auth-title">Masuk ke SehatKu AI</h2>
                        <button class="auth-close" id="auth-close">&times;</button>
                    </div>

                    <div class="auth-content">
                        <!-- Login Form -->
                        <div id="login-form" class="auth-form active">
                            <form id="loginForm">
                                <div class="form-group">
                                    <label for="loginEmail">Email</label>
                                    <input type="email" id="loginEmail" required>
                                </div>

                                <div class="form-group">
                                    <label for="loginPassword">Password</label>
                                    <input type="password" id="loginPassword" required>
                                </div>

                                <button type="submit" class="auth-btn" id="loginBtn">
                                    <span class="btn-text">Masuk</span>
                                    <div class="btn-spinner" style="display: none;"></div>
                                </button>
                            </form>

                            <div class="auth-links">
                                <a href="#" id="showRegister">Belum punya akun? Daftar</a>
                            </div>
                        </div>

                        <!-- Register Form -->
                        <div id="register-form" class="auth-form">
                            <form id="registerForm">
                                <div class="form-group">
                                    <label for="registerName">Nama Lengkap</label>
                                    <input type="text" id="registerName" required>
                                </div>

                                <div class="form-group">
                                    <label for="registerEmail">Email</label>
                                    <input type="email" id="registerEmail" required>
                                </div>

                                <div class="form-group">
                                    <label for="registerPhone">Nomor Telepon</label>
                                    <input type="tel" id="registerPhone" required>
                                </div>

                                <div class="form-group">
                                    <label for="registerPassword">Password</label>
                                    <input type="password" id="registerPassword" required minlength="6">
                                </div>

                                <button type="submit" class="auth-btn" id="registerBtn">
                                    <span class="btn-text">Daftar</span>
                                    <div class="btn-spinner" style="display: none;"></div>
                                </button>
                            </form>

                            <div class="auth-links">
                                <a href="#" id="showLogin">Sudah punya akun? Masuk</a>
                            </div>
                        </div>

                        <!-- Profile View -->
                        <div id="profile-view" class="auth-form">
                            <div class="profile-info">
                                <div class="profile-avatar">
                                    <span id="profileInitials">U</span>
                                </div>
                                <h3 id="profileName">Nama User</h3>
                                <p id="profileEmail">email@example.com</p>
                                <div class="profile-role" id="profileRole">FREE</div>
                            </div>

                            <div class="profile-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Status Premium</span>
                                    <span class="stat-value" id="premiumStatus">Tidak Aktif</span>
                                </div>
                                <div class="stat-item" id="premiumExpiry" style="display: none;">
                                    <span class="stat-label">Berakhir</span>
                                    <span class="stat-value" id="premiumExpiryDate">-</span>
                                </div>
                            </div>

                            <div class="profile-actions">
                                <button class="auth-btn secondary" id="upgradeBtn" style="display: none;">
                                    Upgrade ke Premium
                                </button>
                                <button class="auth-btn danger" id="logoutBtn">Keluar</button>
                            </div>
                        </div>

                        <!-- Medical Profile Form (Mandatory) -->
                        <div id="medical-profile-form" class="auth-form">
                            <div class="text-center mb-4">
                                <h3>Lengkapi Profil Kesehatan</h3>
                                <p class="text-sm text-secondary">Data ini penting untuk analisis AI yang akurat.</p>
                            </div>
                            <form id="medicalProfileForm">
                                <div class="form-group">
                                    <label for="profTanggalLahir">Tanggal Lahir</label>
                                    <input type="date" id="profTanggalLahir" required>
                                </div>

                                <div class="form-row" style="display: flex; gap: 10px;">
                                    <div class="form-group" style="flex: 1;">
                                        <label for="profJenisKelamin">Jenis Kelamin</label>
                                        <select id="profJenisKelamin" class="input-field" required style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px;">
                                            <option value="">Pilih...</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>
                                    <div class="form-group" style="flex: 1;">
                                        <label for="profGolDarah">Gol. Darah</label>
                                        <select id="profGolDarah" class="input-field" required style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px;">
                                            <option value="Tidak Tahu">Tidak Tahu</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="AB">AB</option>
                                            <option value="O">O</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-row" style="display: flex; gap: 10px;">
                                    <div class="form-group" style="flex: 1;">
                                        <label for="profTinggi">Tinggi (cm)</label>
                                        <input type="number" id="profTinggi" required min="50" max="250">
                                    </div>
                                    <div class="form-group" style="flex: 1;">
                                        <label for="profBerat">Berat (kg)</label>
                                        <input type="number" id="profBerat" required min="10" max="300">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="profAlergi">Alergi (Opsional)</label>
                                    <input type="text" id="profAlergi" placeholder="Contoh: Kacang, Udang, Debu...">
                                </div>

                                <button type="submit" class="auth-btn" id="saveProfileBtn">
                                    <span class="btn-text">Simpan Profil</span>
                                    <div class="btn-spinner" style="display: none;"></div>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Tambahkan styles
        const styles = document.createElement('style');
        styles.textContent = `
            .auth-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
            }

            .auth-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .auth-modal {
                background: var(--bg-primary);
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                width: 100%;
                max-width: 400px;
                max-height: 90vh;
                overflow-y: auto;
            }

            .auth-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px 24px 16px;
                border-bottom: 1px solid var(--border-color);
            }

            .auth-header h2 {
                margin: 0;
                color: var(--text-primary);
                font-size: 1.5rem;
                font-weight: 600;
            }

            .auth-close {
                background: none;
                border: none;
                font-size: 24px;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
            }

            .auth-close:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }

            .auth-content {
                padding: 24px;
            }

            .auth-form {
                display: none;
            }

            .auth-form.active {
                display: block;
            }

            .form-group {
                margin-bottom: 16px;
            }

            .form-group label {
                display: block;
                margin-bottom: 6px;
                color: var(--text-primary);
                font-weight: 500;
            }

            .form-group input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                background: var(--bg-primary);
                color: var(--text-primary);
                font-size: 16px;
                transition: border-color 0.2s;
            }

            .form-group input:focus {
                outline: none;
                border-color: var(--accent-color);
            }

            .auth-btn {
                width: 100%;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                background: var(--accent-color);
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
                margin-top: 8px;
            }

            .auth-btn:hover:not(:disabled) {
                background: var(--accent-hover);
                transform: translateY(-1px);
            }

            .auth-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .auth-btn.secondary {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }

            .auth-btn.secondary:hover {
                background: var(--border-color);
            }

            .auth-btn.danger {
                background: #ef4444;
            }

            .auth-btn.danger:hover {
                background: #dc2626;
            }

            .btn-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .auth-links {
                text-align: center;
                margin-top: 16px;
            }

            .auth-links a {
                color: var(--accent-color);
                text-decoration: none;
                font-size: 14px;
            }

            .auth-links a:hover {
                text-decoration: underline;
            }

            .profile-info {
                text-align: center;
                margin-bottom: 24px;
            }

            .profile-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: var(--accent-color);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
                font-size: 32px;
                font-weight: bold;
                color: white;
            }

            .profile-info h3 {
                margin: 0 0 4px 0;
                color: var(--text-primary);
                font-size: 1.25rem;
            }

            .profile-info p {
                margin: 0 0 12px 0;
                color: var(--text-secondary);
            }

            .profile-role {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                background: var(--bg-secondary);
                color: var(--text-secondary);
            }

            .profile-role.premium {
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                color: white;
            }

            .profile-role.doctor {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
            }

            .profile-stats {
                background: var(--bg-secondary);
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 24px;
            }

            .stat-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .stat-item:last-child {
                margin-bottom: 0;
            }

            .stat-label {
                color: var(--text-secondary);
                font-size: 14px;
            }

            .stat-value {
                color: var(--text-primary);
                font-weight: 600;
            }

            .profile-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            @media (max-width: 480px) {
                .auth-overlay {
                    padding: 10px;
                }

                .auth-modal {
                    max-height: 95vh;
                }
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(authContainer);
    },

    bindEvents() {
        // Close modal
        document.getElementById('auth-close')?.addEventListener('click', () => {
            this.hide();
        });

        document.getElementById('auth-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'auth-overlay') {
                this.hide();
            }
        });

        // Form switches
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Medical Profile form
        document.getElementById('medicalProfileForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileUpdate();
        });

        // Profile actions
        document.getElementById('upgradeBtn')?.addEventListener('click', () => {
            this.showPremiumModal();
        });

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.handleLogout();
        });
    },

    show(view = 'login') {
        this.currentView = view;
        document.getElementById('auth-container').style.display = 'block';

        if (view === 'login') {
            this.showLogin();
        } else if (view === 'register') {
            this.showRegister();
        } else if (view === 'profile') {
            this.showProfile();
        } else if (view === 'medical-profile') {
            this.showMedicalProfile();
        }
    },

    hide() {
        document.getElementById('auth-container').style.display = 'none';
    },

    showLogin() {
        this.currentView = 'login';
        document.getElementById('auth-title').textContent = 'Masuk ke SehatKu AI';
        this.switchForm('login');
    },

    showRegister() {
        this.currentView = 'register';
        document.getElementById('auth-title').textContent = 'Daftar Akun Baru';
        this.switchForm('register');
    },

    showProfile() {
        this.currentView = 'profile';
        document.getElementById('auth-title').textContent = 'Profile Akun';
        this.switchForm('profile');
        this.loadProfile();
    },

    showMedicalProfile() {
        this.currentView = 'medical-profile';
        document.getElementById('auth-title').textContent = 'Lengkapi Profil Kesehatan';
        this.switchForm('medical-profile');

        // Remove close button for mandatory profile
        const closeBtn = document.getElementById('auth-close');
        if (closeBtn) closeBtn.style.display = 'none';
    },

    switchForm(formId) {
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        // Show target form
        document.getElementById(`${formId}-form`)?.classList.add('active');
    },

    async handleLogin() {
        if (this.isLoading) return;

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            NotificationSystem.show('Mohon isi email dan password', 'error');
            return;
        }

        this.setLoading('loginBtn', true);

        try {
            const response = await API.login({ email, password });

            if (response.success) {
                AppState.setAuth(response.token, response.user);
                NotificationSystem.show('Login berhasil!', 'success');

                // Check if profile is complete (isVerified is set by backend when profile complete)
                if (!response.user.isVerified && !response.user.isPremium) {
                    this.showMedicalProfile();
                } else {
                    this.hide();
                    this.updateUI();
                }
            } else {
                NotificationSystem.show(response.message || 'Login gagal', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            NotificationSystem.show('Terjadi kesalahan saat login', 'error');
        } finally {
            this.setLoading('loginBtn', false);
        }
    },

    async handleRegister() {
        if (this.isLoading) return;

        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const phone = document.getElementById('registerPhone').value.trim();
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !phone || !password) {
            NotificationSystem.show('Mohon isi semua field', 'error');
            return;
        }

        if (password.length < 6) {
            NotificationSystem.show('Password minimal 6 karakter', 'error');
            return;
        }

        this.setLoading('registerBtn', true);

        try {
            const response = await API.register({
                nama: name,
                email,
                nomorTelepon: phone,
                password
            });

            if (response.success) {
                AppState.setAuth(response.token, response.user);
                NotificationSystem.show('Registrasi berhasil!', 'success');

                // Show mandatory medical profile
                this.showMedicalProfile();
            } else {
                NotificationSystem.show(response.message || 'Registrasi gagal', 'error');
            }
        } catch (error) {
            console.error('Register error:', error);
            NotificationSystem.show('Terjadi kesalahan saat registrasi', 'error');
        } finally {
            this.setLoading('registerBtn', false);
        }
    },

    async handleProfileUpdate() {
        if (this.isLoading) return;

        const tanggalLahir = document.getElementById('profTanggalLahir').value;
        const jenisKelamin = document.getElementById('profJenisKelamin').value;
        const tinggiBadan = document.getElementById('profTinggi').value;
        const beratBadan = document.getElementById('profBerat').value;
        const golonganDarah = document.getElementById('profGolDarah').value;
        const alergiRaw = document.getElementById('profAlergi').value;

        if (!tanggalLahir || !jenisKelamin || !tinggiBadan || !beratBadan) {
            NotificationSystem.show('Mohon lengkapi data wajib', 'error');
            return;
        }

        const alergi = alergiRaw ? [{ jenis: 'Lainnya', nama: alergiRaw, tingkatKeparahan: 'Sedang' }] : [];

        this.setLoading('saveProfileBtn', true);

        try {
            const response = await API.updateProfile({
                tanggalLahir,
                jenisKelamin,
                tinggiBadan: parseFloat(tinggiBadan),
                beratBadan: parseFloat(beratBadan),
                golonganDarah,
                alergi
            });

            if (response.success) {
                // Update local user data
                AppState.auth.user = response.user;
                AppState.save();

                NotificationSystem.show('Profil kesehatan berhasil disimpan!', 'success');
                this.hide();
                this.updateUI();

                // Restore close button
                const closeBtn = document.getElementById('auth-close');
                if (closeBtn) closeBtn.style.display = 'flex';
            } else {
                NotificationSystem.show(response.message || 'Gagal menyimpan profil', 'error');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            NotificationSystem.show('Terjadi kesalahan saat menyimpan profil', 'error');
        } finally {
            this.setLoading('saveProfileBtn', false);
        }
    },

    async handleLogout() {
        try {
            await API.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }

        AppState.clearAuth();
        NotificationSystem.show('Logout berhasil', 'success');
        this.hide();
        this.updateUI();
    },

    async loadProfile() {
        try {
            const response = await API.getProfile();

            if (response.success) {
                const user = response.user;
                const initials = user.nama.split(' ').map(n => n[0]).join('').toUpperCase();

                document.getElementById('profileInitials').textContent = initials;
                document.getElementById('profileName').textContent = user.nama;
                document.getElementById('profileEmail').textContent = user.email;

                const roleElement = document.getElementById('profileRole');
                roleElement.textContent = user.role;
                roleElement.className = 'profile-role';

                if (user.role === 'PREMIUM') {
                    roleElement.classList.add('premium');
                } else if (user.role === 'DOKTER') {
                    roleElement.classList.add('doctor');
                }

                // Premium status
                const statusElement = document.getElementById('premiumStatus');
                const expiryElement = document.getElementById('premiumExpiry');

                if (user.isPremium && user.premiumExpiresAt) {
                    const expiryDate = new Date(user.premiumExpiresAt);
                    const now = new Date();

                    if (expiryDate > now) {
                        statusElement.textContent = 'Aktif';
                        statusElement.style.color = '#10b981';
                        document.getElementById('premiumExpiryDate').textContent =
                            expiryDate.toLocaleDateString('id-ID');
                        expiryElement.style.display = 'block';
                        document.getElementById('upgradeBtn').style.display = 'none';
                    } else {
                        statusElement.textContent = 'Expired';
                        statusElement.style.color = '#ef4444';
                        expiryElement.style.display = 'none';
                        document.getElementById('upgradeBtn').style.display = 'block';
                    }
                } else {
                    statusElement.textContent = 'Tidak Aktif';
                    statusElement.style.color = '#6b7280';
                    expiryElement.style.display = 'none';
                    document.getElementById('upgradeBtn').style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Load profile error:', error);
            NotificationSystem.show('Gagal memuat profile', 'error');
        }
    },

    checkAuthStatus() {
        if (AppState.auth.isAuthenticated) {
            this.updateUI();
        }
    },

    updateUI() {
        // Update navigation or other UI elements based on auth status
        const loginBtn = document.querySelector('[data-action="login"]');
        const profileBtn = document.querySelector('[data-action="profile"]');

        if (AppState.auth.isAuthenticated) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (profileBtn) profileBtn.style.display = 'block';
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (profileBtn) profileBtn.style.display = 'none';
        }
    },

    setLoading(buttonId, loading) {
        this.isLoading = loading;
        const btn = document.getElementById(buttonId);
        if (!btn) return;

        const text = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.btn-spinner');

        if (loading) {
            btn.disabled = true;
            if (text) text.style.display = 'none';
            if (spinner) spinner.style.display = 'block';
        } else {
            btn.disabled = false;
            if (text) text.style.display = 'block';
            if (spinner) spinner.style.display = 'none';
        }
    },

    showPremiumModal() {
        // This will be implemented in PremiumModule
        if (window.PremiumModule) {
            this.hide();
            PremiumModule.showUpgradeModal();
        } else {
            NotificationSystem.show('Fitur premium belum tersedia', 'info');
        }
    }
};

// Export untuk digunakan di app.js
window.AuthModule = AuthModule;