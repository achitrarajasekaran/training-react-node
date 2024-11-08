const BaseRepository = require('./baseRepository');
const Joi = require('joi');

// User validation schema
const userSchema = Joi.object({
    id: Joi.string().uuid(),
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('user', 'admin').default('user'),
    createdAt: Joi.date().default(Date.now)
});

/**
 * User Repository
 * Handles data operations for users with validation and error handling
 */
class UserRepository extends BaseRepository {
    constructor() {
        super();
        // Mock database using Map
        this._users = new Map();
        
        // Add some mock data
        this._addMockData();
    }

    async create(userData) {
        try {
            // Validate user data
            const { error, value } = userSchema.validate(userData);
            if (error) {
                throw new Error(`Validation error: ${error.details[0].message}`);
            }

            // Generate UUID if not provided
            const user = {
                ...value,
                id: value.id || crypto.randomUUID(),
                createdAt: new Date()
            };

            this._users.set(user.id, user);
            return user;
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    async findById(id) {
        const user = this._users.get(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async findAll() {
        return Array.from(this._users.values());
    }

    async update(id, userData) {
        const existingUser = await this.findById(id);
        if (!existingUser) {
            throw new Error('User not found');
        }

        // Validate update data
        const { error, value } = userSchema.validate({
            ...existingUser,
            ...userData
        });

        if (error) {
            throw new Error(`Validation error: ${error.details[0].message}`);
        }

        const updatedUser = { ...existingUser, ...value };
        this._users.set(id, updatedUser);
        return updatedUser;
    }

    async delete(id) {
        const exists = this._users.has(id);
        if (!exists) {
            throw new Error('User not found');
        }
        this._users.delete(id);
        return true;
    }

    _addMockData() {
        const mockUsers = [
            {
                id: '550e8400-e29b-41d4-a716-446655440000',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin',
                createdAt: new Date()
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'user',
                createdAt: new Date()
            }
        ];

        mockUsers.forEach(user => this._users.set(user.id, user));
    }
}

module.exports = {
    UserRepository,
    userSchema
};
