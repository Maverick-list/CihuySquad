/**
 * SMTP Email Provider - SehatKu AI
 * 
 * Production-ready SMTP email provider using Nodemailer.
 * Supports Gmail and any SMTP server.
 */

const nodemailer = require('nodemailer');
const EmailProvider = require('./email-provider');

class SMTPProvider extends EmailProvider {
    constructor(config = {}) {
        super(config);
        this.name = 'smtp';
        this.transporter = null;
        this.fromEmail = config.fromEmail || process.env.SMTP_EMAIL;
        this.fromName = config.fromName || 'SehatKu AI';
    }

    /**
     * Initialize SMTP transporter
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Check for required credentials
            if (!this.fromEmail || !process.env.SMTP_PASSWORD) {
                throw new Error('SMTP credentials not configured');
            }

            // Create transporter based on configuration
            const auth = {
                user: this.fromEmail,
                pass: process.env.SMTP_PASSWORD
            };

            // Check if using Gmail service or custom SMTP
            if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
                // Custom SMTP server
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: this.fromEmail,
                        pass: process.env.SMTP_PASSWORD
                    }
                });
                console.log(`📧 Email provider: Custom SMTP (${process.env.SMTP_HOST})`);
            } else {
                // Default to Gmail
                this.transporter = nodemailer.createTransporter({
                    service: 'gmail',
                    auth: auth
                });
                console.log('📧 Email provider: Gmail SMTP');
            }

            // Verify connection
            await this.transporter.verify();
            console.log('✅ SMTP email provider ready');

            return Promise.resolve();
        } catch (error) {
            console.error('❌ Failed to initialize SMTP provider:', error.message);
            throw error;
        }
    }

    /**
     * Send email via SMTP
     * @param {Object} options - Email options
     * @returns {Promise<{success: boolean, error?: Error}>}
     */
    async sendEmail({ to, subject, html, text }) {
        try {
            if (!this.transporter) {
                throw new Error('SMTP transporter not initialized');
            }

            const mailOptions = {
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: to,
                subject: subject,
                html: html,
                text: text || this.stripHtml(html)
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            console.log(`✅ Email sent to ${to}: ${subject}`);
            
            return { 
                success: true, 
                messageId: result.messageId 
            };
        } catch (error) {
            console.error(`❌ Failed to send email to ${to}:`, error.message);
            return { 
                success: false, 
                error: error 
            };
        }
    }

    /**
     * Strip HTML tags for plain text version
     * @param {string} html - HTML content
     * @returns {string} Plain text
     */
    stripHtml(html) {
        return html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Check if provider is ready
     * @returns {boolean}
     */
    isReady() {
        return this.transporter !== null;
    }
}

module.exports = SMTPProvider;

