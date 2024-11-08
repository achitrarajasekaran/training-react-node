const { UserProvider } = require('../providers/userProvider');
const { UserRepository } = require('../repositories/userRepository');

// Mock the repository
jest.mock('../repositories/userRepository');

describe('UserProvider', () => {
    let provider;
    let mockRepository;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Setup mock repository instance
        mockRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        // Mock the constructor to return our mock repository
        UserRepository.mockImplementation(() => mockRepository);
        
        provider = new UserProvider();
    });

    describe('getUsers', () => {
        it('should fetch users from repository and cache them', async () => {
            const mockUsers = [
                { id: '1', name: 'User 1' },
                { id: '2', name: 'User 2' }
            ];

            mockRepository.findAll.mockResolvedValue(mockUsers);

            // First call should hit the repository
            const users1 = await provider.getUsers();
            expect(users1).toEqual(mockUsers);
            expect(mockRepository.findAll).toHaveBeenCalledTimes(1);

            // Second call should use cache
            const users2 = await provider.getUsers();
            expect(users2).toEqual(mockUsers);
            expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
        });

        it('should handle repository errors', async () => {
            mockRepository.findAll.mockRejectedValue(new Error('Database error'));

            await expect(provider.getUsers())
                .rejects
                .toThrow('Failed to fetch users: Database error');
        });
    });

    describe('getUserById', () => {
        it('should fetch user by id and cache result', async () => {
            const mockUser = { id: '1', name: 'Test User' };
            mockRepository.findById.mockResolvedValue(mockUser);

            // First call should hit the repository
            const user1 = await provider.getUserById('1');
            expect(user1).toEqual(mockUser);
            expect(mockRepository.findById).toHaveBeenCalledTimes(1);

            // Second call should use cache
            const user2 = await provider.getUserById('1');
            expect(user2).toEqual(mockUser);
            expect(mockRepository.findById).toHaveBeenCalledTimes(1);
        });

        it('should handle repository errors', async () => {
            mockRepository.findById.mockRejectedValue(new Error('User not found'));

            await expect(provider.getUserById('1'))
                .rejects
                .toThrow('Failed to fetch user: User not found');
        });
    });

    describe('createUser', () => {
        it('should create user and invalidate cache', async () => {
            const userData = { name: 'New User', email: 'new@example.com' };
            const createdUser = { ...userData, id: '1' };
            mockRepository.create.mockResolvedValue(createdUser);

            // First, populate the cache
            mockRepository.findAll.mockResolvedValue([]);
            await provider.getUsers();

            // Create new user
            const user = await provider.createUser(userData);
            expect(user).toEqual(createdUser);

            // Cache should be invalidated, so this should hit repository
            mockRepository.findAll.mockResolvedValue([createdUser]);
            const users = await provider.getUsers();
            expect(users).toEqual([createdUser]);
            expect(mockRepository.findAll).toHaveBeenCalledTimes(2);
        });
    });

    describe('updateUser', () => {
        it('should update user and invalidate related caches', async () => {
            const userId = '1';
            const updateData = { name: 'Updated Name' };
            const updatedUser = { id: userId, ...updateData };
            mockRepository.update.mockResolvedValue(updatedUser);

            // First, populate caches
            mockRepository.findById.mockResolvedValue({ id: userId, name: 'Original Name' });
            mockRepository.findAll.mockResolvedValue([{ id: userId, name: 'Original Name' }]);
            
            await provider.getUserById(userId);
            await provider.getUsers();

            // Update user
            const user = await provider.updateUser(userId, updateData);
            expect(user).toEqual(updatedUser);

            // Both caches should be invalidated
            mockRepository.findById.mockResolvedValue(updatedUser);
            mockRepository.findAll.mockResolvedValue([updatedUser]);

            const fetchedUser = await provider.getUserById(userId);
            const users = await provider.getUsers();

            expect(fetchedUser).toEqual(updatedUser);
            expect(users).toEqual([updatedUser]);
            expect(mockRepository.findById).toHaveBeenCalledTimes(2);
            expect(mockRepository.findAll).toHaveBeenCalledTimes(2);
        });
    });

    describe('deleteUser', () => {
        it('should delete user and invalidate related caches', async () => {
            const userId = '1';
            mockRepository.delete.mockResolvedValue(true);

            // First, populate caches
            mockRepository.findById.mockResolvedValue({ id: userId, name: 'Test User' });
            mockRepository.findAll.mockResolvedValue([{ id: userId, name: 'Test User' }]);
            
            await provider.getUserById(userId);
            await provider.getUsers();

            // Delete user
            const result = await provider.deleteUser(userId);
            expect(result).toBe(true);

            // Both caches should be invalidated
            mockRepository.findById.mockRejectedValue(new Error('User not found'));
            mockRepository.findAll.mockResolvedValue([]);

            await expect(provider.getUserById(userId)).rejects.toThrow();
            const users = await provider.getUsers();
            expect(users).toEqual([]);
        });
    });
});
