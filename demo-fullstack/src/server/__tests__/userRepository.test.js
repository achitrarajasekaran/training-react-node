const { UserRepository } = require('../repositories/userRepository');

describe('UserRepository', () => {
    let repository;

    beforeEach(() => {
        repository = new UserRepository();
    });

    describe('create', () => {
        it('should create a new user with valid data', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                role: 'user'
            };

            const user = await repository.create(userData);
            expect(user).toMatchObject(userData);
            expect(user.id).toBeDefined();
            expect(user.createdAt).toBeInstanceOf(Date);
        });

        it('should throw error with invalid data', async () => {
            const invalidData = {
                name: 'T', // Too short
                email: 'invalid-email',
                role: 'invalid-role'
            };

            await expect(repository.create(invalidData))
                .rejects
                .toThrow('Validation error');
        });
    });

    describe('findById', () => {
        it('should find existing user by id', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                role: 'user'
            };

            const created = await repository.create(userData);
            const found = await repository.findById(created.id);
            expect(found).toEqual(created);
        });

        it('should throw error for non-existent user', async () => {
            await expect(repository.findById('non-existent-id'))
                .rejects
                .toThrow('User not found');
        });
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const users = await repository.findAll();
            expect(Array.isArray(users)).toBe(true);
            // Check mock data is present
            expect(users.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('update', () => {
        it('should update existing user', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                role: 'user'
            };

            const created = await repository.create(userData);
            const updateData = {
                name: 'Updated Name'
            };

            const updated = await repository.update(created.id, updateData);
            expect(updated.name).toBe(updateData.name);
            expect(updated.email).toBe(created.email);
        });

        it('should throw error for invalid update data', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                role: 'user'
            };

            const created = await repository.create(userData);
            const invalidData = {
                name: 'T' // Too short
            };

            await expect(repository.update(created.id, invalidData))
                .rejects
                .toThrow('Validation error');
        });
    });

    describe('delete', () => {
        it('should delete existing user', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                role: 'user'
            };

            const created = await repository.create(userData);
            await expect(repository.delete(created.id)).resolves.toBe(true);
            await expect(repository.findById(created.id))
                .rejects
                .toThrow('User not found');
        });

        it('should throw error for non-existent user', async () => {
            await expect(repository.delete('non-existent-id'))
                .rejects
                .toThrow('User not found');
        });
    });
});
