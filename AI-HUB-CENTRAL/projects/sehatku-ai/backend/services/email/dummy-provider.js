/**
 * Dummy Email Provider - SehatKu AI
 * 
 * Development-only email provider that logs emails to console.
 * Perfect for testing without SMTP credentials.
 */

const EmailProvider = require('./email-provider');

class DummyProvider extends EmailProvider {
    constructor(config = {}) {
        super(config);
        this.name = 'dummy';
        this.logs = [];
    }

    /**
     * Initialize dummy provider (no setup needed)
     * @returns {Promise<void>}
     */
    async init() {
        console.log('📧 Email provider: DUMMY mode (development only)');
        return Promise.resolve();
    }

    /**
     * Send email by logging to console
     * @param {Object} options - Email options
     * @returns {Promise<{success: boolean, error?: Error}>}
     */
    async sendEmail({ to, subject, html }) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, to, subject, html };
        this.logs.push(logEntry);

        // Log to console with styling
        console.log('\n' + '='.repeat(60));
        console.log('📧 [DUMMY EMAIL]');
        console.log('='.repeat(60));
        console.log(`🕐 Time: ${timestamp}`);
        console.log(`📬 To: ${to}`);
        console.log(`📌 Subject: ${subject}`);
        console.log(`📄 Body preview: ${html.substring(0, 200)}...`);
        console.log('='.repeat(60) + '\n');

        return { success: true };
    }

    /**
     * Get all logged emails (for testing)
     * @returns {Array}
     */
    getLogs() {
        return this.logs;
    }

    /**
     * Clear email logs
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * Check if provider is ready
     * @returns {boolean}
     */
    isReady() {
        return true;
    }
}

module.exports = DummyProvider;

