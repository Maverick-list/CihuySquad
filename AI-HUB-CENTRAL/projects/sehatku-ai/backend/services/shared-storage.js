/**
 * Shared Storage Service - SehatKu AI
 *
 * In-memory storage yang di-share antara routes
 * Digunakan saat MongoDB tidak tersedia (development mode)
 */

module.exports = {
    // In-memory user storage
    users: [],
    userIdCounter: 1,

    // Reset tokens for password reset
    resetTokens: new Map(),

    // Chat history for premium consultations
    chatHistory: new Map(),
    chatIdCounter: 1,

    // Initialize with existing users if any
    init(existingUsers = [], existingCounter = 1) {
        this.users = existingUsers;
        this.userIdCounter = existingCounter;
    },

    // User methods
    addUser(user) {
        user._id = this.userIdCounter++;
        user.createdAt = new Date();
        user.premiumActivatedAt = null;
        user.premiumExpiresAt = null;
        this.users.push(user);
        return user;
    },

    findUserByEmail(email) {
        return this.users.find(u => u.email === email);
    },

    findUserById(id) {
        return this.users.find(u => u._id === id);
    },

    updateUser(id, updates) {
        const index = this.users.findIndex(u => u._id === id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updates };
            return this.users[index];
        }
        return null;
    },

    // Reset token methods
    addResetToken(token, userId, expiry) {
        this.resetTokens.set(token, { userId, expiry });
    },

    getResetToken(token) {
        return this.resetTokens.get(token);
    },

    deleteResetToken(token) {
        this.resetTokens.delete(token);
    },

    // Chat methods
    createChatSession(userId, doctorId) {
        const sessionId = `consult-${userId}-${Date.now()}`;
        this.chatHistory.set(sessionId, []);
        return sessionId;
    },

    getChatMessages(sessionId) {
        return this.chatHistory.get(sessionId) || [];
    },

    addChatMessage(sessionId, message) {
        const messages = this.chatHistory.get(sessionId) || [];
        messages.push(message);
        this.chatHistory.set(sessionId, messages);
    },

    deleteChatSession(sessionId) {
        this.chatHistory.delete(sessionId);
    },

    // Clear all data (for testing)
    clear() {
        this.users = [];
        this.userIdCounter = 1;
        this.resetTokens.clear();
        this.chatHistory.clear();
    }
};

