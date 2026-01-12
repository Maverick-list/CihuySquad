/**
 * Email Service - SehatKu AI
 * 
 * Menangani pengiriman email menggunakan provider pattern.
 * Support dummy, smtp, dan gmail modes via EMAIL_MODE env.
 * 
 * ENV Variables:
 * - EMAIL_MODE: dummy|smtp|gmail (default: dummy)
 * - SMTP_EMAIL: Email address for SMTP
 * - SMTP_PASSWORD: App password for SMTP
 * - SMTP_HOST: Custom SMTP host (optional)
 * - SMTP_PORT: Custom SMTP port (optional)
 * - SMTP_SECURE: Use TLS (optional)
 * - SMTP_FROM_NAME: Sender name (optional)
 * - FRONTEND_URL: Frontend URL for email links (optional)
 */

const emailService = require('./email/email-service');

// Export all methods from email service singleton
module.exports = {
    initEmailService: () => emailService.init(),
    sendWelcomeEmail: (user) => emailService.sendWelcomeEmail(user),
    sendResetPasswordEmail: (email, token, url) => emailService.sendResetPasswordEmail(email, token, url),
    sendPremiumActivationEmail: (user, details) => emailService.sendPremiumActivationEmail(user, details),
    sendEmail: (options) => emailService.sendEmail(options),
    isReady: () => emailService.isReady(),
    getMode: () => emailService.getMode()
};
