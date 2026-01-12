/**
 * User Model
 * 
 * Schema untuk data pengguna aplikasi SehatKu AI.
 * Menyimpan informasi profil, kredensial, dan preferensi pengguna.
 * 
 * Fitur keamanan:
 * - Password di-hash menggunakan bcrypt
 * - Validasi email dan nomor telepon
 * - Privacy settings untuk kontrol data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    // Informasi Dasar
    nama: {
        type: String,
        required: [true, 'Nama wajib diisi'],
        trim: true,
        minlength: [2, 'Nama minimal 2 karakter'],
        maxlength: [100, 'Nama maksimal 100 karakter']
    },

    email: {
        type: String,
        required: [true, 'Email wajib diisi'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Email tidak valid']
    },

    nomorTelepon: {
        type: String,
        required: [true, 'Nomor telepon wajib diisi'],
        validate: {
            validator: function (v) {
                // Validasi format nomor telepon Indonesia
                return /^(\+62|62|0)[0-9]{9,12}$/.test(v);
            },
            message: 'Format nomor telepon tidak valid'
        }
    },

    password: {
        type: String,
        required: [true, 'Password wajib diisi'],
        minlength: [6, 'Password minimal 6 karakter'],
        select: false // Tidak di-return secara default untuk keamanan
    },

    // Profil Kesehatan
    tanggalLahir: {
        type: Date,
        required: [true, 'Tanggal lahir wajib diisi']
    },

    jenisKelamin: {
        type: String,
        enum: ['Laki-laki', 'Perempuan'],
        required: [true, 'Jenis kelamin wajib diisi']
    },

    golonganDarah: {
        type: String,
        enum: ['A', 'B', 'AB', 'O', 'Tidak Tahu'],
        default: 'Tidak Tahu'
    },

    tinggiBadan: {
        type: Number, // dalam cm
        min: [50, 'Tinggi badan tidak valid'],
        max: [250, 'Tinggi badan tidak valid']
    },

    beratBadan: {
        type: Number, // dalam kg
        min: [10, 'Berat badan tidak valid'],
        max: [300, 'Berat badan tidak valid']
    },

    // Riwayat Kesehatan
    riwayatPenyakit: [{
        namaPenyakit: String,
        tahunDiagnosis: Number,
        status: {
            type: String,
            enum: ['Sembuh', 'Dalam Perawatan', 'Kronis']
        }
    }],

    alergi: [{
        jenis: String, // Obat, Makanan, Lainnya
        nama: String,
        tingkatKeparahan: {
            type: String,
            enum: ['Ringan', 'Sedang', 'Berat']
        }
    }],

    obatRutin: [{
        namaObat: String,
        dosis: String,
        frekuensi: String,
        tujuan: String
    }],

    // Riwayat Medis dari AI Survey
    riwayatMedis: [{
        tanggal: {
            type: Date,
            default: Date.now
        },
        jenis: {
            type: String,
            enum: ['AI_SURVEY', 'MANUAL_ENTRY', 'DOCTOR_VISIT'],
            default: 'AI_SURVEY'
        },
        diagnosis: String,
        severity: {
            type: String,
            enum: ['Green', 'Yellow', 'Red']
        },
        recommended_action: String,
        notes: String,
        synced_from_ai: {
            type: Boolean,
            default: true
        }
    }],

    // Role & Status
    role: {
        type: String,
        enum: ['FREE', 'PREMIUM', 'DOKTER'],
        default: 'FREE'
    },

    // Premium Status
    isPremium: {
        type: Boolean,
        default: false
    },

    premiumActivatedAt: Date,

    premiumExpiresAt: Date,

    isVerified: {
        type: Boolean,
        default: false
    },

    // Privacy Settings
    privacySettings: {
        shareDataForResearch: {
            type: Boolean,
            default: false
        },
        allowAIAnalysis: {
            type: Boolean,
            default: true
        },
        showProfileToMedics: {
            type: Boolean,
            default: true
        }
    },

    // Metadata
    lastLogin: Date,

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Otomatis update createdAt dan updatedAt
});

/**
 * Middleware: Hash password sebelum save
 * Hanya hash jika password baru atau diubah
 */
userSchema.pre('save', async function (next) {
    // Jika password tidak dimodifikasi, skip
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt dan hash password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Method: Bandingkan password untuk login
 * @param {String} candidatePassword - Password yang diinput user
 * @returns {Boolean} - True jika password cocok
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing password');
    }
};

/**
 * Method: Hitung BMI (Body Mass Index)
 * @returns {Number} - Nilai BMI
 */
userSchema.methods.calculateBMI = function () {
    if (!this.beratBadan || !this.tinggiBadan) {
        return null;
    }

    const tinggiMeter = this.tinggiBadan / 100;
    const bmi = this.beratBadan / (tinggiMeter * tinggiMeter);
    return Math.round(bmi * 10) / 10; // Round ke 1 desimal
};

/**
 * Method: Hitung umur dari tanggal lahir
 * @returns {Number} - Umur dalam tahun
 */
userSchema.methods.calculateAge = function () {
    if (!this.tanggalLahir) {
        return null;
    }

    const today = new Date();
    const birthDate = new Date(this.tanggalLahir);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

/**
 * Method: Get profil kesehatan ringkas
 * @returns {Object} - Ringkasan profil kesehatan
 */
userSchema.methods.getHealthSummary = function () {
    return {
        nama: this.nama,
        umur: this.calculateAge(),
        jenisKelamin: this.jenisKelamin,
        golonganDarah: this.golonganDarah,
        bmi: this.calculateBMI(),
        riwayatPenyakitAktif: this.riwayatPenyakit.filter(p => p.status !== 'Sembuh').length,
        jumlahAlergi: this.alergi.length,
        jumlahObatRutin: this.obatRutin.length
    };
};

// Index untuk performa query
userSchema.index({ nomorTelepon: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
