/**
 * Health Record Model
 * 
 * Schema untuk menyimpan rekam medis dan riwayat konsultasi pengguna.
 * Setiap record terkait dengan user tertentu.
 * 
 * Fitur:
 * - Riwayat konsultasi dengan AI dan tenaga medis
 * - Hasil lab dan imaging
 * - Diagnosis dan treatment plan
 * - Privacy-aware dengan encryption support
 */

const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
    // Relasi ke User
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Tipe Record
    recordType: {
        type: String,
        enum: ['konsultasi_ai', 'konsultasi_medis', 'lab_result', 'imaging', 'diagnosis', 'resep'],
        required: true
    },

    // Tanggal Record
    tanggal: {
        type: Date,
        default: Date.now,
        required: true
    },

    // Data Konsultasi AI
    konsultasiAI: {
        gejala: [String], // Array gejala yang dilaporkan
        pertanyaanTambahan: [{
            pertanyaan: String,
            jawaban: String
        }],
        hasilAnalisis: {
            kemungkinanDiagnosis: [{
                nama: String,
                probabilitas: Number, // 0-100
                deskripsi: String
            }],
            tingkatKeparahan: {
                type: String,
                enum: ['Ringan', 'Sedang', 'Berat', 'Darurat']
            },
            rekomendasiTindakan: String,
            perluKonsultasiDokter: Boolean
        },
        aiModel: String, // Model AI yang digunakan (e.g., "llama2")
        confidence: Number // Confidence score AI (0-100)
    },

    // Data Konsultasi dengan Tenaga Medis
    konsultasiMedis: {
        dokterNama: String,
        dokterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        spesialisasi: String,
        keluhanUtama: String,
        catatanDokter: String,
        diagnosis: String,
        tindakan: String,
        resep: [{
            namaObat: String,
            dosis: String,
            frekuensi: String,
            durasi: String,
            instruksi: String
        }],
        rujukan: {
            perluRujukan: Boolean,
            tujuanRujukan: String,
            alasan: String
        }
    },

    // Hasil Lab
    labResult: {
        jenisTest: String,
        laboratorium: String,
        hasil: [{
            parameter: String,
            nilai: String,
            satuan: String,
            nilaiNormal: String,
            status: {
                type: String,
                enum: ['Normal', 'Rendah', 'Tinggi', 'Kritis']
            }
        }],
        interpretasi: String,
        dokumenUrl: String // URL ke file PDF hasil lab
    },

    // Hasil Imaging (Rontgen, CT Scan, dll)
    imaging: {
        jenisImaging: String,
        bagianTubuh: String,
        temuan: String,
        interpretasi: String,
        radiologNama: String,
        imageUrl: String // URL ke gambar hasil imaging
    },

    // Vital Signs (Tanda Vital)
    vitalSigns: {
        tekananDarah: {
            sistolik: Number,
            diastolik: Number
        },
        denyutNadi: Number, // bpm
        suhuTubuh: Number, // Celsius
        lajuPernapasan: Number, // per menit
        saturasi02: Number, // %
        beratBadan: Number, // kg
        tinggiBadan: Number // cm
    },

    // Catatan Tambahan
    catatan: String,

    // Attachment (foto, dokumen, dll)
    attachments: [{
        filename: String,
        url: String,
        type: String, // 'image', 'pdf', 'document'
        uploadedAt: Date
    }],

    // Status Record
    status: {
        type: String,
        enum: ['draft', 'final', 'amended'],
        default: 'final'
    },

    // Privacy
    isPrivate: {
        type: Boolean,
        default: false
    },

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

/**
 * Method: Get ringkasan record untuk display
 * @returns {Object} - Ringkasan record
 */
healthRecordSchema.methods.getSummary = function () {
    const summary = {
        id: this._id,
        tanggal: this.tanggal,
        recordType: this.recordType,
        status: this.status
    };

    // Tambahkan info spesifik berdasarkan tipe
    switch (this.recordType) {
        case 'konsultasi_ai':
            summary.diagnosis = this.konsultasiAI?.hasilAnalisis?.kemungkinanDiagnosis?.[0]?.nama;
            summary.tingkatKeparahan = this.konsultasiAI?.hasilAnalisis?.tingkatKeparahan;
            break;
        case 'konsultasi_medis':
            summary.dokter = this.konsultasiMedis?.dokterNama;
            summary.diagnosis = this.konsultasiMedis?.diagnosis;
            break;
        case 'lab_result':
            summary.jenisTest = this.labResult?.jenisTest;
            break;
        case 'imaging':
            summary.jenisImaging = this.imaging?.jenisImaging;
            break;
    }

    return summary;
};

/**
 * Static Method: Get riwayat kesehatan user
 * @param {ObjectId} userId - ID user
 * @param {Object} options - Filter options
 * @returns {Array} - Array of health records
 */
healthRecordSchema.statics.getUserHistory = async function (userId, options = {}) {
    const query = { userId };

    // Filter berdasarkan tipe record jika ada
    if (options.recordType) {
        query.recordType = options.recordType;
    }

    // Filter berdasarkan tanggal jika ada
    if (options.startDate || options.endDate) {
        query.tanggal = {};
        if (options.startDate) query.tanggal.$gte = new Date(options.startDate);
        if (options.endDate) query.tanggal.$lte = new Date(options.endDate);
    }

    return this.find(query)
        .sort({ tanggal: -1 }) // Urutkan dari terbaru
        .limit(options.limit || 50)
        .populate('createdBy', 'nama role')
        .exec();
};

// Indexes untuk performa query
healthRecordSchema.index({ userId: 1, tanggal: -1 });
healthRecordSchema.index({ recordType: 1 });
healthRecordSchema.index({ 'konsultasiMedis.dokterId': 1 });

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

module.exports = HealthRecord;
