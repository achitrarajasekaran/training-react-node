const { UserRepository } = require('../repositories/userRepository');

/**
 * User Provider
 * Provides a higher-level abstraction for user-related operations
 * Handles business logic, caching, and additional error handling
 */
class UserProvider {
    constructor() {
        this._repository = new UserRepository();
        this._cache = new Map();
        this._cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get all users with caching
     * @returns {Promise<Array>} List of users
     */
    async getUsers() {
        try {
            const cachedData = this._getFromCache('users');
            if (cachedData) {
                return cachedData;
            }

            const users = await this._repository.findAll();
            this._setCache('users', users);
            return users;
        } catch (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    }

    /**
     * Get user by ID with caching
     * @param {string} id User ID
     * @returns {Promise<Object>} User object
     */
    async getUserById(id) {
        try {
            const cacheKey = `user_${id}`;
            const cachedData = this._getFromCache(cacheKey);
            if (cachedData) {
                return cachedData;
            }

            const user = await this._repository.findById(id);
            this._setCache(cacheKey, user);
            return user;
        } catch (error) {
            throw new Error(`Failed to fetch user: ${error.message}`);
        }
    }

    /**
     * Create new user
     * @param {Object} userData User data
     * @returns {Promise<Object>} Created user
     */
    async createUser(userData) {
        try {
            const user = await this._repository.create(userData);
            this._invalidateCache('users');
            return user;
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    /**
     * Update existing user
     * @param {string} id User ID
     * @param {Object} userData Updated user data
     * @returns {Promise<Object>} Updated user
     */
    async updateUser(id, userData) {
        try {
            const user = await this._repository.update(id, userData);
            this._invalidateCache('users');
            this._invalidateCache(`user_${id}`);
            return user;
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    /**
     * Delete user
     * @param {string} id User ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteUser(id) {
        try {
            const result = await this._repository.delete(id);
            this._invalidateCache('users');
            this._invalidateCache(`user_${id}`);
            return result;
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    // Private cache methods
    _getFromCache(key) {
        const cached = this._cache.get(key);
        if (cached && Date.now() - cached.timestamp < this._cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    _setCache(key, data) {
        this._cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    _invalidateCache(key) {
        this._cache.delete(key);
    }
}

module.exports = {
    UserProvider
};
