const request = require('supertest');
const app = require('../index');
const { UserProvider } = require('../providers/userProvider');

// Mock the UserProvider
jest.mock('../providers/userProvider');

describe('API Integration Tests', () => {
    let mockProvider;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup mock provider
        mockProvider = {
            getUsers: jest.fn(),
            getUserById: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn()
        };

        // Mock the constructor to return our mock provider
        UserProvider.mockImplementation(() => mockProvider);
    });

    describe('GET /api/users', () => {
        it('should return users successfully', async () => {
            const mockUsers = [
                { id: '1', name: 'User 1', email: 'user1@example.com' },
                { id: '2', name: 'User 2', email: 'user2@example.com' }
            ];

            mockProvider.getUsers.mockResolvedValue(mockUsers);

            const response = await request(app)
                .get('/api/users')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual(mockUsers);
        });

        it('should handle provider errors', async () => {
            mockProvider.getUsers.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .get('/api/users')
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body.error).toBeDefined();
        });

        it('should return fallback response when circuit breaker trips', async () => {
            // Simulate timeout to trigger circuit breaker
            mockProvider.getUsers.mockImplementation(() => new Promise(resolve => {
                setTimeout(resolve, 5000); // Longer than circuit breaker timeout
            }));

            const response = await request(app)
                .get('/api/users')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.fallback).toBe(true);
            expect(response.body.error).toBe('Service temporarily unavailable');
        });
    });

    // Test middleware
    describe('Request Logger Middleware', () => {
        it('should log requests', async () => {
            const mockUsers = [{ id: '1', name: 'User 1' }];
            mockProvider.getUsers.mockResolvedValue(mockUsers);

            // Spy on console.info
            const consoleSpy = jest.spyOn(console, 'info');

            await request(app)
                .get('/api/users')
                .expect(200);

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('Error Handling Middleware', () => {
        it('should handle validation errors', async () => {
            mockProvider.getUsers.mockRejectedValue({
                name: 'ValidationError',
                message: 'Invalid data'
            });

            const response = await request(app)
                .get('/api/users')
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.error.message).toBe('Invalid data');
        });

        it('should handle not found errors', async () => {
            mockProvider.getUsers.mockRejectedValue({
                name: 'NotFoundError',
                message: 'Resource not found'
            });

            const response = await request(app)
                .get('/api/users')
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body.error.message).toBe('Resource not found');
        });

        it('should handle unexpected errors', async () => {
            mockProvider.getUsers.mockRejectedValue(new Error('Unexpected error'));

            const response = await request(app)
                .get('/api/users')
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body.error.message).toBe('Internal Server Error');
        });
    });
});
