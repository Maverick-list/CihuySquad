/**
 * Health Routes
 * 
 * Endpoint untuk manajemen data kesehatan:
 * - Get health records
 * - Create health record
 * - Update health metrics
 */

const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/health-record-model');
const User = require('../models/user-model');

/**
 * GET /api/health/records/:userId
 * Get riwayat kesehatan user
 */
router.get('/records/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { recordType, limit, startDate, endDate } = req.query;

        // Build query options
        const options = {
            recordType,
            limit: parseInt(limit) || 50,
            startDate,
            endDate
        };

        // Get records dari database
        const records = await HealthRecord.getUserHistory(userId, options);

        res.json({
            success: true,
            count: records.length,
            records: records.map(r => r.getSummary())
        });

    } catch (error) {
        console.error('Error getting health records:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data kesehatan',
            error: error.message
        });
    }
});

/**
 * GET /api/health/record/:recordId
 * Get detail satu health record
 */
router.get('/record/:recordId', async (req, res) => {
    try {
        const { recordId } = req.params;

        const record = await HealthRecord.findById(recordId)
            .populate('userId', 'nama email')
            .populate('createdBy', 'nama role');

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Record tidak ditemukan'
            });
        }

        res.json({
            success: true,
            record
        });

    } catch (error) {
        console.error('Error getting health record:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data',
            error: error.message
        });
    }
});

/**
 * POST /api/health/record
 * Create new health record
 */
router.post('/record', async (req, res) => {
    try {
        const recordData = req.body;

        // Validasi userId
        if (!recordData.userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID wajib diisi'
            });
        }

        // Create record
        const record = new HealthRecord(recordData);
        await record.save();

        res.status(201).json({
            success: true,
            message: 'Health record berhasil dibuat',
            record: record.getSummary()
        });

    } catch (error) {
        console.error('Error creating health record:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menyimpan data',
            error: error.message
        });
    }
});

/**
 * GET /api/health/summary/:userId
 * Get ringkasan kesehatan user
 */
router.get('/summary/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user data
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        // Get health summary
        const summary = user.getHealthSummary();

        // Get recent records
        const recentRecords = await HealthRecord.getUserHistory(userId, { limit: 5 });

        res.json({
            success: true,
            summary,
            recentRecords: recentRecords.map(r => r.getSummary())
        });

    } catch (error) {
        console.error('Error getting health summary:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil ringkasan kesehatan',
            error: error.message
        });
    }
});

/**
 * POST /api/health/emergency
 * Emergency contact - kirim notifikasi darurat ke rumah sakit terdekat
 */
router.post('/emergency', async (req, res) => {
    try {
        const { lat, lng, emergencyType = 'general', description = '' } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Koordinat lokasi diperlukan'
            });
        }

        // Get user info if authenticated
        let userInfo = null;
        if (req.user) {
            userInfo = {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email
            };
        }

        // Find nearest hospitals (mock data for now)
        const nearestHospitals = await findNearestHospitals(lat, lng);

        // Send emergency notifications
        const notificationsSent = [];
        for (const hospital of nearestHospitals.slice(0, 3)) { // Send to top 3 hospitals
            try {
                await sendEmergencyNotification(hospital, {
                    lat,
                    lng,
                    emergencyType,
                    description,
                    userInfo,
                    timestamp: new Date()
                });
                notificationsSent.push(hospital);
            } catch (error) {
                console.error(`Failed to notify ${hospital.nama}:`, error);
            }
        }

        res.json({
            success: true,
            message: 'Panggilan darurat telah dikirim',
            notificationsSent: notificationsSent.length,
            nearestHospitals: nearestHospitals.slice(0, 3)
        });

    } catch (error) {
        console.error('Emergency contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat panggilan darurat',
            error: error.message
        });
    }
});

/**
 * Helper function to find nearest hospitals
 */
async function findNearestHospitals(lat, lng) {
    // Mock hospital data - in real implementation, this would query a database or external API
    const hospitals = [
        {
            id: 1,
            nama: 'RSUD Jakarta Pusat',
            alamat: 'Jl. Gedung Kesenian No.1, Jakarta Pusat',
            telepon: '(021) 384-2000',
            lat: -6.2088,
            lng: 106.8456,
            jarak: calculateDistance(lat, lng, -6.2088, 106.8456)
        },
        {
            id: 2,
            nama: 'RS Cipto Mangunkusumo',
            alamat: 'Jl. Diponegoro No.71, Jakarta Pusat',
            telepon: '(021) 390-7000',
            lat: -6.1972,
            lng: 106.8500,
            jarak: calculateDistance(lat, lng, -6.1972, 106.8500)
        },
        {
            id: 3,
            nama: 'RS Harapan Kita',
            alamat: 'Jl. S Parman No.87, Jakarta Barat',
            telepon: '(021) 568-4092',
            lat: -6.1769,
            lng: 106.7850,
            jarak: calculateDistance(lat, lng, -6.1769, 106.7850)
        },
        {
            id: 4,
            nama: 'RS Fatmawati',
            alamat: 'Jl. RS Fatmawati No.1, Jakarta Selatan',
            telepon: '(021) 750-1524',
            lat: -6.2886,
            lng: 106.7933,
            jarak: calculateDistance(lat, lng, -6.2886, 106.7933)
        },
        {
            id: 5,
            nama: 'RS Premier Bintaro',
            alamat: 'Jl. MH Thamrin No.1, Jakarta Selatan',
            telepon: '(021) 735-5000',
            lat: -6.2725,
            lng: 106.7583,
            jarak: calculateDistance(lat, lng, -6.2725, 106.7583)
        }
    ];

    // Sort by distance
    return hospitals.sort((a, b) => a.jarak - b.jarak);
}

/**
 * Helper function to send emergency notification
 */
async function sendEmergencyNotification(hospital, emergencyData) {
    const { lat, lng, emergencyType, description, userInfo, timestamp } = emergencyData;

    const message = `
🚨 EMERGENCY ALERT 🚨

Hospital: ${hospital.nama}
Location: ${lat}, ${lng}
Emergency Type: ${emergencyType}
Description: ${description}
Time: ${timestamp.toISOString()}

${userInfo ? `Patient Info:
Name: ${userInfo.name}
Contact: ${userInfo.email}
` : 'Anonymous emergency call'}

Please respond immediately!
    `.trim();

    // In real implementation, this would send SMS, email, or call to hospital
    console.log(`Emergency notification sent to ${hospital.nama}:`, message);

    // For now, just log the notification
    // TODO: Integrate with actual hospital notification system
}

/**
 * Helper function to calculate distance between two coordinates
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

module.exports = router;

/**
 * GET /api/health/test
 * Test route untuk memastikan server berjalan
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Health routes working!',
        timestamp: new Date().toISOString()
    });
});
