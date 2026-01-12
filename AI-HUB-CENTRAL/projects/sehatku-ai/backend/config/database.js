/**
 * Database Configuration - SehatKu AI
 * 
 * Supports multiple database modes:
 * - DB_MODE=memory: In-memory storage for development/testing (sharedStorage)
 * - DB_MODE=mongo: Real MongoDB connection
 * 
 * Environment Variables:
 * - DB_MODE: memory|mongo (default: memory)
 * - MONGODB_URI: MongoDB connection string (for mongo mode)
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Database mode from environment
const DB_MODE = process.env.DB_MODE || 'memory';

let mongoServer = null;
let isConnected = false;

/**
 * Connect to database based on DB_MODE
 * @returns {Promise<{success: boolean, mode: string, error?: Error}>}
 */
const connectDB = async () => {
    if (isConnected) {
        return { success: true, mode: DB_MODE };
    }

    console.log(`🔄 Menghubungkan ke database (mode: ${DB_MODE})...`);

    try {
        if (DB_MODE === 'memory') {
            // Memory mode - use sharedStorage only, no MongoDB connection
            console.log('📦 Database mode: MEMORY (in-memory storage)');
            console.log('   Untuk production, gunakan DB_MODE=mongo dengan MONGODB_URI');
            isConnected = true;
            return { success: true, mode: 'memory' };
        }

        // MongoDB mode
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sehatku-ai';
        
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        const conn = await mongoose.connect(mongoURI, options);
        
        console.log(`✅ MongoDB terhubung: ${conn.connection.host}`);
        isConnected = true;

        // Setup connection event handlers
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB terputus');
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
            isConnected = true;
        });

        return { success: true, mode: 'mongo' };

    } catch (error) {
        console.error('❌ Error connecting to database:', error.message);
        
        if (DB_MODE === 'mongo') {
            // In mongo mode, failing to connect is critical
            console.warn('⚠️  Tidak dapat terhubung ke MongoDB');
            console.warn('💡 Periksa MONGODB_URI atau gunakan DB_MODE=memory untuk development');
            return { success: false, mode: 'mongo', error };
        }

        // In memory mode, we can continue without MongoDB
        console.warn('⚠️  MongoDB tidak tersedia, menggunakan memory mode');
        return { success: true, mode: 'memory' };
    }
};

/**
 * Get database connection status
 * @returns {Object} Connection status
 */
const getDBStatus = () => {
    const status = {
        mode: DB_MODE,
        connected: isConnected,
        readyState: isConnected ? 1 : 0,
        host: null,
        name: null
    };

    if (mongoose.connection.readyState === 1) {
        status.host = mongoose.connection.host;
        status.name = mongoose.connection.name;
    }

    return status;
};

/**
 * Check if MongoDB is connected
 * @returns {boolean}
 */
const isMongoConnected = () => {
    return isConnected && mongoose.connection.readyState === 1;
};

/**
 * Disconnect from database
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('✅ MongoDB connection closed');
        }
        isConnected = false;
    } catch (error) {
        console.error('❌ Error closing database connection:', error.message);
    }
};

/**
 * Graceful shutdown
 * @returns {Promise<void>}
 */
const gracefulShutdown = async () => {
    console.log('👋 Graceful shutdown...');
    await disconnectDB();
    process.exit(0);
};

module.exports = {
    connectDB,
    disconnectDB,
    getDBStatus,
    isMongoConnected,
    gracefulShutdown,
    DB_MODE
};

