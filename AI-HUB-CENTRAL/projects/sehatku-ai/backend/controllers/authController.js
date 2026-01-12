/**
 * Auth Controller - SehatKu AI
 *
 * Handles user authentication with mandatory patient profile requirements.
 * Ensures all users complete health profiles before accessing AI features.
 *
 * Features:
 * - Mandatory profile completion during registration
 * - JWT-based authentication
 * - Profile validation and updates
 * - Medical history synchronization
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const { sendWelcomeEmail } = require('../services/email-service');
const sharedStorage = require('../services/shared-storage');
const { isMongoConnected } = require('../utils/db-utils');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth-middleware');

class AuthController {
    /**
     * Register new user with mandatory health profile
     */
    async register(req, res) {
        try {
            const {
                nama,
                email,
                nomorTelepon,
                password,
                tanggalLahir,
                jenisKelamin,
                golonganDarah,
                tinggiBadan,
                beratBadan,
                alergi = [],
                riwayatPenyakit = []
            } = req.body;

            // Validate required fields
            const requiredFields = [
                'nama', 'email', 'nomorTelepon', 'password',
                'tanggalLahir', 'jenisKelamin', 'golonganDarah',
                'tinggiBadan', 'beratBadan'
            ];

            const missingFields = requiredFields.filter(field => !req.body[field]);
            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Field berikut wajib diisi: ${missingFields.join(', ')}`,
                    required_fields: requiredFields
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format email tidak valid'
                });
            }

            // Validate phone number (Indonesian format)
            const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
            if (!phoneRegex.test(nomorTelepon)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format nomor telepon tidak valid'
                });
            }

            // Validate age (must be 18+ for medical services)
            const birthDate = new Date(tanggalLahir);
            const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 18) {
                return res.status(400).json({
                    success: false,
                    message: 'Layanan kesehatan hanya untuk pengguna berusia 18 tahun ke atas'
                });
            }

            if (isMongoConnected()) {
                // Check if email already exists
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email sudah terdaftar'
                    });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 12);

                // Create new user with complete profile
                const newUser = new User({
                    nama,
                    email,
                    nomorTelepon,
                    password: hashedPassword,
                    tanggalLahir: birthDate,
                    jenisKelamin,
                    golonganDarah,
                    tinggiBadan: Number(tinggiBadan),
                    beratBadan: Number(beratBadan),
                    alergi: Array.isArray(alergi) ? alergi : [],
                    riwayatPenyakit: Array.isArray(riwayatPenyakit) ? riwayatPenyakit : [],
                    role: 'FREE',
                    isPremium: false,
                    isVerified: false
                });

                await newUser.save();

                // Send welcome email
                await sendWelcomeEmail(newUser);

                // Generate JWT token
                const token = jwt.sign(
                    { userId: newUser._id, email: newUser.email, role: newUser.role },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                // Return user data without sensitive information
                const userResponse = {
                    _id: newUser._id,
                    nama: newUser.nama,
                    email: newUser.email,
                    nomorTelepon: newUser.nomorTelepon,
                    role: newUser.role,
                    isPremium: newUser.isPremium,
                    profileComplete: true,
                    createdAt: newUser.createdAt
                };

                res.status(201).json({
                    success: true,
                    message: 'Registrasi berhasil dengan profil kesehatan lengkap',
                    user: userResponse,
                    token,
                    next_steps: ['Lengkapi survei kesehatan AI', 'Mulai konsultasi']
                });

            } else {
                // Development mode with sharedStorage
                const existingUser = sharedStorage.findUserByEmail(email);
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email sudah terdaftar'
                    });
                }

                const hashedPassword = await bcrypt.hash(password, 12);

                const newUser = sharedStorage.addUser({
                    nama,
                    email,
                    nomorTelepon,
                    password: hashedPassword,
                    tanggalLahir: birthDate,
                    jenisKelamin,
                    golonganDarah,
                    tinggiBadan: Number(tinggiBadan),
                    beratBadan: Number(beratBadan),
                    alergi: Array.isArray(alergi) ? alergi : [],
                    riwayatPenyakit: Array.isArray(riwayatPenyakit) ? riwayatPenyakit : [],
                    role: 'FREE',
                    isPremium: false,
                    isVerified: false
                });

                await sendWelcomeEmail(newUser);

                const token = jwt.sign(
                    { userId: newUser._id, email: newUser.email, role: newUser.role },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                const { password: _, ...userResponse } = newUser;
                userResponse.profileComplete = true;

                res.status(201).json({
                    success: true,
                    message: 'Registrasi berhasil (development mode)',
                    user: userResponse,
                    token
                });
            }

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat registrasi',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Login user
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email dan password wajib diisi'
                });
            }

            let user = null;

            if (isMongoConnected()) {
                user = await User.findOne({ email }).select('+password');
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Email atau password salah'
                    });
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return res.status(401).json({
                        success: false,
                        message: 'Email atau password salah'
                    });
                }

                // Update last login
                user.lastLogin = new Date();
                await user.save();

            } else {
                user = sharedStorage.findUserByEmail(email);
                if (!user || !(await bcrypt.compare(password, user.password))) {
                    return res.status(401).json({
                        success: false,
                        message: 'Email atau password salah'
                    });
                }
            }

            // Generate token
            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Return user data
            const userResponse = {
                _id: user._id,
                nama: user.nama,
                email: user.email,
                nomorTelepon: user.nomorTelepon,
                role: user.role,
                isPremium: user.isPremium,
                profileComplete: this.isProfileComplete(user),
                lastLogin: user.lastLogin
            };

            res.json({
                success: true,
                message: 'Login berhasil',
                user: userResponse,
                token
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat login'
            });
        }
    }

    /**
     * Get user profile
     */
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;

            let user = null;

            if (isMongoConnected()) {
                user = await User.findById(userId);
            } else {
                user = sharedStorage.findUserById(userId);
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User tidak ditemukan'
                });
            }

            const userResponse = {
                _id: user._id,
                nama: user.nama,
                email: user.email,
                nomorTelepon: user.nomorTelepon,
                tanggalLahir: user.tanggalLahir,
                jenisKelamin: user.jenisKelamin,
                golonganDarah: user.golonganDarah,
                tinggiBadan: user.tinggiBadan,
                beratBadan: user.beratBadan,
                alergi: user.alergi || [],
                riwayatPenyakit: user.riwayatPenyakit || [],
                role: user.role,
                isPremium: user.isPremium,
                profileComplete: this.isProfileComplete(user),
                lastLogin: user.lastLogin
            };

            res.json({
                success: true,
                user: userResponse
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil profil'
            });
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const updates = req.body;

            // Prevent updating sensitive fields
            const allowedFields = [
                'nama', 'nomorTelepon', 'tanggalLahir', 'jenisKelamin',
                'golonganDarah', 'tinggiBadan', 'beratBadan', 'alergi', 'riwayatPenyakit'
            ];

            const filteredUpdates = {};
            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredUpdates[key] = updates[key];
                }
            });

            let user = null;

            if (isMongoConnected()) {
                user = await User.findByIdAndUpdate(userId, filteredUpdates, { new: true });
            } else {
                user = sharedStorage.updateUser(userId, filteredUpdates);
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User tidak ditemukan'
                });
            }

            const userResponse = {
                _id: user._id,
                nama: user.nama,
                email: user.email,
                nomorTelepon: user.nomorTelepon,
                tanggalLahir: user.tanggalLahir,
                jenisKelamin: user.jenisKelamin,
                golonganDarah: user.golonganDarah,
                tinggiBadan: user.tinggiBadan,
                beratBadan: user.beratBadan,
                alergi: user.alergi || [],
                riwayatPenyakit: user.riwayatPenyakit || [],
                role: user.role,
                isPremium: user.isPremium,
                profileComplete: this.isProfileComplete(user)
            };

            res.json({
                success: true,
                message: 'Profil berhasil diperbarui',
                user: userResponse
            });

        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat memperbarui profil'
            });
        }
    }

    /**
     * Sync AI survey results to medical history
     */
    async syncMedicalHistory(req, res) {
        try {
            const userId = req.user.userId;
            const { surveyResult } = req.body;

            if (!surveyResult || !surveyResult.final_assessment) {
                return res.status(400).json({
                    success: false,
                    message: 'Data survei tidak valid'
                });
            }

            const medicalEntry = {
                tanggal: new Date(),
                jenis: 'AI_SURVEY',
                diagnosis: surveyResult.final_assessment.preliminary_diagnosis,
                severity: surveyResult.final_assessment.severity,
                recommended_action: surveyResult.final_assessment.recommended_action,
                notes: `AI Assessment - ${surveyResult.final_assessment.urgency_level} priority`
            };

            let user = null;

            if (isMongoConnected()) {
                user = await User.findById(userId);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User tidak ditemukan'
                    });
                }

                // Add to medical history
                if (!user.riwayatMedis) user.riwayatMedis = [];
                user.riwayatMedis.push(medicalEntry);
                await user.save();

            } else {
                user = sharedStorage.findUserById(userId);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User tidak ditemukan'
                    });
                }

                if (!user.riwayatMedis) user.riwayatMedis = [];
                user.riwayatMedis.push(medicalEntry);
                sharedStorage.updateUser(userId, { riwayatMedis: user.riwayatMedis });
            }

            res.json({
                success: true,
                message: 'Riwayat medis berhasil disinkronisasi',
                synced_entry: medicalEntry
            });

        } catch (error) {
            console.error('Sync medical history error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat menyinkronisasi riwayat medis'
            });
        }
    }

    /**
     * Check if user profile is complete
     */
    isProfileComplete(user) {
        const requiredFields = [
            'nama', 'email', 'nomorTelepon', 'tanggalLahir', 'jenisKelamin',
            'golonganDarah', 'tinggiBadan', 'beratBadan'
        ];

        return requiredFields.every(field => {
            const value = user[field];
            return value !== null && value !== undefined && value !== '';
        });
    }
}

module.exports = new AuthController();