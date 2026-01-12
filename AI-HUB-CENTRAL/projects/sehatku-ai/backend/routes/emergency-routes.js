/**
 * Emergency Routes - SehatKu AI
 *
 * Emergency event logging and management
 */

const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth-middleware');

/**
 * POST /api/emergency/log
 * Log emergency events for analytics and monitoring
 */
router.post('/log', authenticateToken, async (req, res) => {
    try {
        const { type, timestamp, severity, diagnosis, userLocation, userAgent } = req.body;
        const userId = req.user.userId;

        // Log emergency event (in production, this would go to a monitoring system)
        console.log('🚨 EMERGENCY EVENT LOGGED:', {
            userId,
            type,
            timestamp,
            severity,
            diagnosis,
            userLocation,
            userAgent,
            loggedAt: new Date().toISOString()
        });

        // In a real implementation, you might:
        // 1. Store in emergency_logs collection
        // 2. Send notifications to medical staff
        // 3. Trigger emergency response protocols
        // 4. Send alerts to emergency contacts

        res.json({
            success: true,
            message: 'Emergency event logged successfully',
            event_id: `emergency_${Date.now()}_${userId}`,
            logged_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Emergency log error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mencatat event darurat',
            error: error.message
        });
    }
});

/**
 * GET /api/emergency/contacts
 * Get emergency contact information
 */
router.get('/contacts', authenticateToken, async (req, res) => {
    try {
        const emergencyContacts = {
            ambulance: {
                name: 'Ambulans',
                number: '118',
                description: 'Layanan ambulans darurat'
            },
            police: {
                name: 'Kepolisian',
                number: '110',
                description: 'Layanan kepolisian'
            },
            fire: {
                name: 'Pemadam Kebakaran',
                number: '113',
                description: 'Layanan pemadam kebakaran'
            },
            emergency_room: {
                name: 'UGD',
                number: '119',
                description: 'Unit Gawat Darurat'
            },
            poison_control: {
                name: 'Pusat Racun',
                number: '119',
                description: 'Pusat Informasi dan Rujukan Keracunan'
            }
        };

        res.json({
            success: true,
            emergency_contacts: emergencyContacts,
            note: 'Nomor darurat di Indonesia'
        });

    } catch (error) {
        console.error('Emergency contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil kontak darurat',
            error: error.message
        });
    }
});

/**
 * POST /api/emergency/alert-contacts
 * Send emergency alerts to user's emergency contacts
 */
router.post('/alert-contacts', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { emergencyType, location, message } = req.body;

        // In a real implementation, this would:
        // 1. Get user's emergency contacts from profile
        // 2. Send SMS/email alerts
        // 3. Notify emergency services if needed

        console.log('🚨 EMERGENCY ALERT TO CONTACTS:', {
            userId,
            emergencyType,
            location,
            message,
            timestamp: new Date().toISOString()
        });

        // Mock response
        res.json({
            success: true,
            message: 'Emergency alerts sent to contacts',
            alerts_sent: [
                { type: 'sms', recipient: 'emergency_contact_1', status: 'sent' },
                { type: 'email', recipient: 'emergency_contact_2', status: 'sent' }
            ],
            emergency_services_notified: true
        });

    } catch (error) {
        console.error('Emergency alert contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengirim alert darurat',
            error: error.message
        });
    }
});

module.exports = router;