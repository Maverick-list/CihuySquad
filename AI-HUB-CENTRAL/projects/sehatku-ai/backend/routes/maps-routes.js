/**
 * Maps Routes - SehatKu AI
 *
 * Google Maps integration for hospital and pharmacy navigation
 * Real-time location services and directions
 */

const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth-middleware');

/**
 * GET /api/maps/nearby-places
 * Find nearby hospitals and pharmacies
 */
router.get('/nearby-places', authenticateToken, async (req, res) => {
    try {
        const { lat, lng, type = 'hospital', radius = 5000 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Koordinat latitude dan longitude wajib diisi'
            });
        }

        // Note: In a real implementation, this would call Google Places API
        // For now, we'll return mock data structure
        const mockPlaces = {
            hospital: [
                {
                    id: 'hospital_1',
                    name: 'RSUP Dr. Sardjito',
                    address: 'Jl. Kesehatan No.1, Yogyakarta',
                    location: { lat: parseFloat(lat) + 0.01, lng: parseFloat(lng) + 0.01 },
                    rating: 4.5,
                    types: ['hospital', 'emergency_room'],
                    distance: '2.3 km',
                    duration: '8 mins'
                },
                {
                    id: 'hospital_2',
                    name: 'RS Bethesda Yogyakarta',
                    address: 'Jl. Jend. Sudirman No.70, Yogyakarta',
                    location: { lat: parseFloat(lat) - 0.005, lng: parseFloat(lng) - 0.005 },
                    rating: 4.2,
                    types: ['hospital'],
                    distance: '1.8 km',
                    duration: '6 mins'
                }
            ],
            pharmacy: [
                {
                    id: 'pharmacy_1',
                    name: 'Apotek Kimia Farma',
                    address: 'Jl. Malioboro No.123, Yogyakarta',
                    location: { lat: parseFloat(lat) + 0.002, lng: parseFloat(lng) + 0.002 },
                    rating: 4.0,
                    types: ['pharmacy'],
                    distance: '0.5 km',
                    duration: '2 mins'
                },
                {
                    id: 'pharmacy_2',
                    name: 'Apotek K24',
                    address: 'Jl. Prawirotaman No.45, Yogyakarta',
                    location: { lat: parseFloat(lat) - 0.003, lng: parseFloat(lng) + 0.003 },
                    rating: 4.3,
                    types: ['pharmacy'],
                    distance: '0.8 km',
                    duration: '3 mins'
                }
            ]
        };

        const places = mockPlaces[type] || [];

        res.json({
            success: true,
            places: places,
            search_params: {
                location: { lat: parseFloat(lat), lng: parseFloat(lng) },
                type,
                radius: parseInt(radius)
            }
        });

    } catch (error) {
        console.error('Nearby places error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mencari tempat terdekat',
            error: error.message
        });
    }
});

/**
 * GET /api/maps/directions
 * Get directions to a destination
 */
router.get('/directions', authenticateToken, async (req, res) => {
    try {
        const { originLat, originLng, destLat, destLng, travelMode = 'DRIVING' } = req.query;

        if (!originLat || !originLng || !destLat || !destLng) {
            return res.status(400).json({
                success: false,
                message: 'Koordinat origin dan destination wajib diisi'
            });
        }

        // Mock directions response
        const mockDirections = {
            distance: {
                text: '2.3 km',
                value: 2300
            },
            duration: {
                text: '8 mins',
                value: 480
            },
            steps: [
                {
                    instructions: 'Head north on Jl. Malioboro toward Jl. Ahmad Yani',
                    distance: { text: '0.5 km', value: 500 },
                    duration: { text: '2 mins', value: 120 }
                },
                {
                    instructions: 'Turn right onto Jl. Ahmad Yani',
                    distance: { text: '1.2 km', value: 1200 },
                    duration: { text: '4 mins', value: 240 }
                },
                {
                    instructions: 'Turn left onto Jl. Kesehatan',
                    distance: { text: '0.6 km', value: 600 },
                    duration: { text: '2 mins', value: 120 }
                }
            ],
            bounds: {
                northeast: { lat: parseFloat(destLat) + 0.01, lng: parseFloat(destLng) + 0.01 },
                southwest: { lat: parseFloat(originLat) - 0.01, lng: parseFloat(originLng) - 0.01 }
            }
        };

        res.json({
            success: true,
            directions: mockDirections,
            route_params: {
                origin: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
                destination: { lat: parseFloat(destLat), lng: parseFloat(destLng) },
                travelMode
            }
        });

    } catch (error) {
        console.error('Directions error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mendapatkan rute',
            error: error.message
        });
    }
});

/**
 * GET /api/maps/place-details
 * Get detailed information about a specific place
 */
router.get('/place-details', authenticateToken, async (req, res) => {
    try {
        const { placeId } = req.query;

        if (!placeId) {
            return res.status(400).json({
                success: false,
                message: 'Place ID wajib diisi'
            });
        }

        // Mock place details
        const mockPlaceDetails = {
            place_id: placeId,
            name: 'RSUP Dr. Sardjito',
            formatted_address: 'Jl. Kesehatan No.1, Yogyakarta 55281, Indonesia',
            geometry: {
                location: { lat: -7.7828, lng: 110.3743 }
            },
            formatted_phone_number: '(0274) 631238',
            website: 'https://rsup-sardjito.jogjaprov.go.id',
            rating: 4.5,
            reviews: [
                {
                    author_name: 'Ahmad S.',
                    rating: 5,
                    text: 'Pelayanan medis yang sangat baik dan profesional.'
                }
            ],
            opening_hours: {
                open_now: true,
                weekday_text: [
                    'Monday: Open 24 hours',
                    'Tuesday: Open 24 hours',
                    'Wednesday: Open 24 hours',
                    'Thursday: Open 24 hours',
                    'Friday: Open 24 hours',
                    'Saturday: Open 24 hours',
                    'Sunday: Open 24 hours'
                ]
            },
            types: ['hospital', 'health', 'point_of_interest', 'establishment']
        };

        res.json({
            success: true,
            place_details: mockPlaceDetails
        });

    } catch (error) {
        console.error('Place details error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mendapatkan detail tempat',
            error: error.message
        });
    }
});

/**
 * GET /api/maps/smart-recommendations
 * Get smart recommendations based on severity
 */
router.get('/smart-recommendations', authenticateToken, async (req, res) => {
    try {
        const { severity, lat, lng } = req.query;

        if (!severity || !['Green', 'Yellow', 'Red'].includes(severity)) {
            return res.status(400).json({
                success: false,
                message: 'Severity harus Green, Yellow, atau Red'
            });
        }

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Koordinat lokasi wajib diisi'
            });
        }

        let recommendations = {};

        if (severity === 'Red') {
            recommendations = {
                type: 'emergency',
                places: [
                    {
                        id: 'er_1',
                        name: 'UGD RSUP Dr. Sardjito',
                        address: 'Jl. Kesehatan No.1, Yogyakarta',
                        distance: '2.3 km',
                        duration: '8 mins',
                        priority: 'high'
                    }
                ],
                message: 'DARURAT: Segera ke Unit Gawat Darurat terdekat!',
                actions: ['call_ambulance', 'find_er', 'emergency_contacts']
            };
        } else if (severity === 'Yellow') {
            recommendations = {
                type: 'hospital',
                places: [
                    {
                        id: 'hospital_1',
                        name: 'RSUP Dr. Sardjito',
                        specialty: 'Umum',
                        distance: '2.3 km',
                        duration: '8 mins'
                    },
                    {
                        id: 'clinic_1',
                        name: 'Klinik Pratama Sehat',
                        specialty: 'Umum',
                        distance: '1.1 km',
                        duration: '4 mins'
                    }
                ],
                message: 'Kunjungi rumah sakit terdekat untuk pemeriksaan lebih lanjut',
                actions: ['book_appointment', 'get_directions']
            };
        } else {
            recommendations = {
                type: 'pharmacy',
                places: [
                    {
                        id: 'pharmacy_1',
                        name: 'Apotek Kimia Farma',
                        distance: '0.5 km',
                        duration: '2 mins',
                        services: ['obat_bebas', 'obat_resep', 'konsultasi']
                    },
                    {
                        id: 'pharmacy_2',
                        name: 'Apotek K24',
                        distance: '0.8 km',
                        duration: '3 mins',
                        services: ['obat_bebas', 'obat_resep', 'layanan_24jam']
                    }
                ],
                message: 'Kunjungi apotek terdekat untuk mendapatkan obat',
                actions: ['get_directions', 'check_stock']
            };
        }

        res.json({
            success: true,
            recommendations,
            severity,
            location: { lat: parseFloat(lat), lng: parseFloat(lng) }
        });

    } catch (error) {
        console.error('Smart recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mendapatkan rekomendasi',
            error: error.message
        });
    }
});

module.exports = router;