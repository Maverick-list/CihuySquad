/**
 * Email Service - SehatKu AI
 * 
 * Unified email service with pluggable providers.
 * Supports dummy, smtp, and gmail modes via EMAIL_MODE env.
 * 
 * Usage:
 * - EMAIL_MODE=dummy (default) - logs to console
 * - EMAIL_MODE=smtp - uses custom SMTP server
 * - EMAIL_MODE=gmail - uses Gmail SMTP
 */

const DummyProvider = require('./dummy-provider');
const SMTPProvider = require('./smtp-provider');

class EmailService {
    constructor() {
        this.provider = null;
        this.mode = 'dummy';
    }

    /**
     * Initialize email service with configured provider
     * @returns {Promise<void>}
     */
    async init() {
        // Get mode from environment
        this.mode = process.env.EMAIL_MODE || 'dummy';
        
        const config = {
            fromEmail: process.env.SMTP_EMAIL,
            fromName: process.env.SMTP_FROM_NAME || 'SehatKu AI'
        };

        switch (this.mode.toLowerCase()) {
            case 'smtp':
                this.provider = new SMTPProvider(config);
                break;
            case 'gmail':
                this.provider = new SMTPProvider({ ...config, useGmail: true });
                break;
            case 'dummy':
            default:
                this.provider = new DummyProvider(config);
                break;
        }

        await this.provider.init();
        return Promise.resolve();
    }

    /**
     * Send a welcome email to new user
     * @param {Object} user - User object with nama, email, isPremium
     * @returns {Promise<{success: boolean, error?: Error}>}
     */
    async sendWelcomeEmail(user) {
        const html = this.generateWelcomeHTML(user);
        return this.sendEmail({
            to: user.email,
            subject: 'Selamat Datang di SehatKu AI! 🎉',
            html
        });
    }

    /**
     * Send password reset email
     * @param {string} email - Recipient email
     * @param {string} resetToken - Reset token
     * @param {string} resetUrl - Full reset URL (optional, auto-generated if not provided)
     * @returns {Promise<{success: boolean, error?: Error}>}
     */
    async sendResetPasswordEmail(email, resetToken, resetUrl = null) {
        const url = resetUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        const html = this.generateResetPasswordHTML(email, url);
        return this.sendEmail({
            to: email,
            subject: 'Reset Password - SehatKu AI',
            html
        });
    }

    /**
     * Send premium activation email
     * @param {Object} user - User object
     * @param {Object} premiumDetails - Premium activation details
     * @returns {Promise<{success: boolean, error?: Error}>}
     */
    async sendPremiumActivationEmail(user, premiumDetails) {
        const html = this.generatePremiumActivationHTML(user, premiumDetails);
        return this.sendEmail({
            to: user.email,
            subject: '🎉 Selamat! Premium Aktif - SehatKu AI',
            html
        });
    }

    /**
     * Send generic email
     * @param {Object} options - Email options
     * @returns {Promise<{success: boolean, error?: Error}>}
     */
    async sendEmail({ to, subject, html }) {
        if (!this.provider) {
            console.error('❌ Email service not initialized');
            return { success: false, error: new Error('Email service not initialized') };
        }

        try {
            const result = await this.provider.sendEmail({ to, subject, html });
            return result;
        } catch (error) {
            console.error('❌ Email send error:', error.message);
            return { success: false, error };
        }
    }

    /**
     * Generate welcome email HTML
     * @param {Object} user - User object
     * @returns {string} HTML content
     */
    generateWelcomeHTML(user) {
        const status = user.isPremium ? 
            '<span style="color: #059669;">✨ Premium Member</span>' : 
            '<span style="color: #6b7280;">👤 Free Member</span>';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏥 SehatKu AI</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Platform Kesehatan Digital Terpercaya</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">Selamat Datang, ${this.escapeHtml(user.nama)}! 🎉</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
                Terima kasih telah bergabung dengan SehatKu AI. Kami senang Anda memutuskan untuk menjaga kesehatan bersama kami!
            </p>

            <!-- Account Details -->
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">📋 Detail Akun Anda</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Nama</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 500; text-align: right;">${this.escapeHtml(user.nama)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Email</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 500; text-align: right;">${this.escapeHtml(user.email)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280;">Status</td>
                        <td style="padding: 8px 0; font-weight: 500; text-align: right;">${status}</td>
                    </tr>
                </table>
            </div>

            <p style="color: #4b5563; line-height: 1.6;">
                Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi tim support kami.
            </p>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                    Mulai Sekarang
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 14px;">
            <p>Salam sehat,<br><strong>Tim SehatKu AI</strong></p>
            <p style="font-size: 12px; margin-top: 10px;">
                Email ini dikirim ke ${this.escapeHtml(user.email)}
            </p>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Generate reset password email HTML
     * @param {string} email - User email
     * @param {string} resetUrl - Reset URL
     * @returns {string} HTML content
     */
    generateResetPasswordHTML(email, resetUrl) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Reset Password</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">SehatKu AI</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">Lupa Password?</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
                Kami menerima permintaan untuk mereset password akun Anda di SehatKu AI.
            </p>

            <p style="color: #4b5563; line-height: 1.6;">
                Klik tombol di bawah untuk membuat password baru:
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    🔑 Reset Password
                </a>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>⚠️ Peringatan:</strong> Link ini akan expire dalam 15 menit.
                </p>
            </div>

            <p style="color: #6b7280; line-height: 1.6; font-size: 14px;">
                Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tidak akan berubah.
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 14px;">
            <p>Salam sehat,<br><strong>Tim SehatKu AI</strong></p>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Generate premium activation email HTML
     * @param {Object} user - User object
     * @param {Object} premiumDetails - Premium details
     * @returns {string} HTML content
     */
    generatePremiumActivationHTML(user, premiumDetails) {
        const expiresDate = new Date(premiumDetails.expiresAt).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✨ Premium Aktif!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">SehatKu AI</p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">Selamat, ${this.escapeHtml(user.nama)}! 🎉</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
                Selamat! Akun Premium Anda di SehatKu AI sekarang <strong>aktif</strong>. Anda sekarang memiliki akses ke semua fitur premium!
            </p>

            <!-- Premium Details -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">👑</div>
                <h3 style="margin: 0 0 15px 0; color: #92400e;">PREMIUM MEMBER</h3>
                <p style="margin: 0; color: #78350f; font-size: 14px;">Berlaku hingga</p>
                <p style="margin: 5px 0 0 0; color: #92400e; font-size: 20px; font-weight: bold;">${expiresDate}</p>
            </div>

            <!-- Benefits -->
            <h4 style="color: #374151; margin-bottom: 15px;">🎁 Keunggulan Premium:</h4>
            <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
                <li>Konsultasi dengan dokter spesialis</li>
                <li>Prediksi risiko kesehatan AI</li>
                <li>Riwayat kesehatan lengkap</li>
                <li>Prioritas support</li>
            </ul>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/premium" 
                   style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                    Jelajahi Fitur Premium
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 14px;">
            <p>Salam sehat,<br><strong>Tim SehatKu AI</strong></p>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#039;');
    }

    /**
     * Check if email service is ready
     * @returns {boolean}
     */
    isReady() {
        return this.provider && this.provider.isReady();
    }

    /**
     * Get current provider mode
     * @returns {string}
     */
    getMode() {
        return this.mode;
    }
}

// Export singleton instance
const emailService = new EmailService();

module.exports = emailService;

