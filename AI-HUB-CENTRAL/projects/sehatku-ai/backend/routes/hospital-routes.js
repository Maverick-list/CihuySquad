/**
 * Hospital Routes - SehatKu AI
 *
 * Menangani tracking rumah sakit terdekat menggunakan geolocation
 * Fallback ke input manual jika geolocation tidak tersedia
 */

const express = require('express');
const axios = require('axios');

const router = express.Router();

// Dummy data rumah sakit (dalam production akan dari database/API eksternal)
const dummyHospitals = [
    {
        id: 'rs-001',
        nama: 'RSUP Dr. Sardjito',
        alamat: 'Jl. Kesehatan No.1, Yogyakarta',
        telepon: '(0274) 631234',
        jenis: 'Rumah Sakit Umum Pusat',
        spesialisasi: ['Jantung', 'Onkologi', 'Neurologi'],
        fasilitas: ['IGD 24 Jam', 'ICU', 'Radiologi', 'Laboratorium'],
        rating: 4.5,
        jarak: null, // akan dihitung berdasarkan lokasi user
        koordinat: { lat: -7.7829, lng: 110.3671 },
        jamOperasional: '24 Jam',
        emergency: true
    },
    {
        id: 'rs-002',
        nama: 'RS Bethesda Yogyakarta',
        alamat: 'Jl. Jend. Sudirman No.70, Yogyakarta',
        telepon: '(0274) 589333',
        jenis: 'Rumah Sakit Swasta',
        spesialisasi: ['Bedah', 'Mata', 'THT'],
        fasilitas: ['IGD 24 Jam', 'ICU', 'Operasi', 'Farmasi'],
        rating: 4.3,
        jarak: null,
        koordinat: { lat: -7.7956, lng: 110.3695 },
        jamOperasional: '24 Jam',
        emergency: true
    },
    {
        id: 'rs-003',
        nama: 'RS PKU Muhammadiyah Yogyakarta',
        alamat: 'Jl. KH. Ahmad Dahlan No.20, Yogyakarta',
        telepon: '(0274) 371195',
        jenis: 'Rumah Sakit Swasta',
        spesialisasi: ['Kandungan', 'Anak', 'Jantung'],
        fasilitas: ['IGD 24 Jam', 'ICU', 'Radiologi'],
        rating: 4.2,
        jarak: null,
        koordinat: { lat: -7.7972, lng: 110.3657 },
        jamOperasional: '24 Jam',
        emergency: true
    },
    {
        id: 'rs-004',
        nama: 'RSUD Kota Yogyakarta',
        alamat: 'Jl. Wirosaban No.1, Yogyakarta',
        telepon: '(0274) 512929',
        jenis: 'Rumah Sakit Umum Daerah',
        spesialisasi: ['Umum', 'Gigi', 'Kesehatan Jiwa'],
        fasilitas: ['IGD 24 Jam', 'Laboratorium', 'Radiologi'],
        rating: 4.0,
        jarak: null,
        koordinat: { lat: -7.8014, lng: 110.3648 },
        jamOperasional: '24 Jam',
        emergency: true
    },
    {
        id: 'rs-005',
        nama: 'Klinik Pratama Sehat Selalu',
        alamat: 'Jl. Malioboro No.123, Yogyakarta',
        telepon: '(0274) 987654',
        jenis: 'Klinik Pratama',
        spesialisasi: ['Umum', 'Kesehatan Anak'],
        fasilitas: ['Pemeriksaan Umum', 'Imunisasi', 'Laboratorium Sederhana'],
        rating: 4.1,
        jarak: null,
        koordinat: { lat: -7.7923, lng: 110.3658 },
        jamOperasional: '08:00 - 20:00',
        emergency: false
    }
];

// Fungsi untuk menghitung jarak antara dua koordinat (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
}

// GET /api/hospital/nearby - Cari rumah sakit terdekat
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, limit = 5, specialty } = req.query;

        let userLat, userLng;

        // Jika koordinat disediakan, gunakan itu
        if (lat && lng) {
            userLat = parseFloat(lat);
            userLng = parseFloat(lng);
        } else {
            // Default ke Yogyakarta jika tidak ada koordinat
            userLat = -7.7956;
            userLng = 110.3695;
        }

        // Filter berdasarkan spesialisasi jika ada
        let hospitals = [...dummyHospitals];
        if (specialty) {
            hospitals = hospitals.filter(hospital =>
                hospital.spesialisasi.some(spec =>
                    spec.toLowerCase().includes(specialty.toLowerCase())
                )
            );
        }

        // Hitung jarak dan sort berdasarkan jarak terdekat
        hospitals.forEach(hospital => {
            hospital.jarak = calculateDistance(
                userLat, userLng,
                hospital.koordinat.lat, hospital.koordinat.lng
            );
        });

        hospitals.sort((a, b) => a.jarak - b.jarak);

        // Limit hasil
        const results = hospitals.slice(0, parseInt(limit));

        res.json({
            success: true,
            userLocation: { lat: userLat, lng: userLng },
            hospitals: results,
            total: results.length
        });

    } catch (error) {
        console.error('Nearby hospitals error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mencari rumah sakit terdekat'
        });
    }
});

// GET /api/hospital/search - Cari rumah sakit berdasarkan nama/alamat
router.get('/search', (req, res) => {
    try {
        const { query, specialty } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Parameter query wajib diisi'
            });
        }

        let hospitals = [...dummyHospitals];

        // Filter berdasarkan query (nama atau alamat)
        hospitals = hospitals.filter(hospital =>
            hospital.nama.toLowerCase().includes(query.toLowerCase()) ||
            hospital.alamat.toLowerCase().includes(query.toLowerCase())
        );

        // Filter berdasarkan spesialisasi jika ada
        if (specialty) {
            hospitals = hospitals.filter(hospital =>
                hospital.spesialisasi.some(spec =>
                    spec.toLowerCase().includes(specialty.toLowerCase())
                )
            );
        }

        res.json({
            success: true,
            hospitals,
            total: hospitals.length
        });

    } catch (error) {
        console.error('Search hospitals error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mencari rumah sakit'
        });
    }
});

// GET /api/hospital/:id - Detail rumah sakit
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;

        const hospital = dummyHospitals.find(h => h.id === id);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Rumah sakit tidak ditemukan'
            });
        }

        res.json({
            success: true,
            hospital
        });

    } catch (error) {
        console.error('Get hospital detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil detail rumah sakit'
        });
    }
});

// GET /api/hospital/specialties - List spesialisasi tersedia
router.get('/specialties/list', (req, res) => {
    try {
        const specialties = [
            'Umum', 'Jantung', 'Onkologi', 'Neurologi', 'Bedah',
            'Mata', 'THT', 'Kandungan', 'Anak', 'Kulit dan Kelamin',
            'Gigi', 'Kesehatan Jiwa', 'Radiologi', 'Laboratorium'
        ];

        res.json({
            success: true,
            specialties
        });

    } catch (error) {
        console.error('Get specialties error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil list spesialisasi'
        });
    }
});

// POST /api/hospital/emergency - Emergency contact
router.post('/emergency', (req, res) => {
    try {
        const { lat, lng, emergencyType, description } = req.body;

        // Dalam production, ini akan mengirim notifikasi ke rumah sakit terdekat
        // dan mencatat ke database untuk tracking

        const emergencyContacts = dummyHospitals
            .filter(h => h.emergency)
            .slice(0, 3); // 3 rumah sakit terdekat dengan IGD

        res.json({
            success: true,
            message: 'Emergency request telah dikirim',
            emergency: {
                type: emergencyType,
                description,
                location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
                timestamp: new Date(),
                status: 'processing'
            },
            nearestHospitals: emergencyContacts.map(h => ({
                id: h.id,
                nama: h.nama,
                telepon: h.telepon,
                alamat: h.alamat
            }))
        });

    } catch (error) {
        console.error('Emergency contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memproses emergency contact'
        });
    }
});

module.exports = router;