/**
 * Database Utilities - SehatKu AI
 * 
 * Shared helper functions untuk database operations.
 * Uses centralized database configuration.
 */

const mongoose = require('mongoose');
const { isMongoConnected: dbIsMongoConnected } = require('../config/database');

/**
 * Cek apakah MongoDB sudah terhubung
 * @returns {boolean} true jika koneksi ready (state = 1)
 */
const isMongoConnected = () => {
    return dbIsMongoConnected();
};

/**
 * Get current connection state
 * @returns {number} 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
 */
const getConnectionState = () => {
    return mongoose.connection.readyState;
};

/**
 * Get connection state label
 * @returns {string}
 */
const getConnectionStateLabel = () => {
    const states = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };
    return states[mongoose.connection.readyState] || 'Unknown';
};

module.exports = {
    isMongoConnected,
    getConnectionState,
    getConnectionStateLabel
};

