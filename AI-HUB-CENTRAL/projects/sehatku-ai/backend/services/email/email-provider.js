/**
 * Email Provider Base Interface - SehatKu AI
 * 
 * Abstract base class for email providers.
 * All providers must implement these methods.
 */

class EmailProvider {
    constructor(config = {}) {
        this.name = 'base';
    }

    /**
     * Initialize the provider
     * @returns {Promise<void>}
     */
    async init() {
        throw new Error('init() must be implemented by provider');
    }

    /**
     * Send an email
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.html - Email HTML body
     * @returns {Promise<{success: boolean, error?: Error}>}
     */
    async sendEmail({ to, subject, html }) {
        throw new Error('sendEmail() must be implemented by provider');
    }

    /**
     * Check if provider is ready
     * @returns {boolean}
     */
    isReady() {
        return false;
    }
}

module.exports = EmailProvider;

