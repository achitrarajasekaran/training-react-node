import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import useUsers from './hooks/useUsers';

// Mock the custom hook
jest.mock('./hooks/useUsers');

describe('App', () => {
    // Mock data
    const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
    ];

    // Mock hook implementation
    const mockUseUsers = {
        users: mockUsers,
        loading: false,
        error: null,
        createUser: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useUsers.mockImplementation(() => mockUseUsers);
    });

    describe('Initial Render', () => {
        it('displays user list when data is loaded', () => {
            render(<App />);

            // Check if users are displayed
            mockUsers.forEach(user => {
                expect(screen.getByText(user.name)).toBeInTheDocument();
                expect(screen.getByText(user.email)).toBeInTheDocument();
            });
        });

        it('shows loading state', () => {
            useUsers.mockImplementation(() => ({
                ...mockUseUsers,
                loading: true
            }));

            render(<App />);
            expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
        });

        it('shows error state', () => {
            useUsers.mockImplementation(() => ({
                ...mockUseUsers,
                error: 'Failed to fetch users'
            }));

            render(<App />);
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch users');
        });

        it('shows empty state when no users exist', () => {
            useUsers.mockImplementation(() => ({
                ...mockUseUsers,
                users: []
            }));

            render(<App />);
            expect(screen.getByTestId('empty-message')).toBeInTheDocument();
        });
    });

    describe('User Creation', () => {
        it('opens create form when Add New User is clicked', async () => {
            render(<App />);

            // Click add user button
            fireEvent.click(screen.getByTestId('add-user-button'));

            // Check if form is displayed
            expect(screen.getByText('Create New User')).toBeInTheDocument();
            expect(screen.getByTestId('user-form')).toBeInTheDocument();
        });

        it('creates new user successfully', async () => {
            const newUser = {
                name: 'New User',
                email: 'new@example.com',
                role: 'user'
            };

            mockUseUsers.createUser.mockResolvedValueOnce({
                id: '3',
                ...newUser
            });

            render(<App />);

            // Open form
            fireEvent.click(screen.getByTestId('add-user-button'));

            // Fill form
            await userEvent.type(screen.getByTestId('name-input'), newUser.name);
            await userEvent.type(screen.getByTestId('email-input'), newUser.email);
            await userEvent.selectOptions(screen.getByTestId('role-select'), newUser.role);

            // Submit form
            fireEvent.click(screen.getByTestId('submit-button'));

            // Verify createUser was called
            await waitFor(() => {
                expect(mockUseUsers.createUser).toHaveBeenCalledWith(newUser);
            });
        });
    });

    describe('User Update', () => {
        it('opens edit form with user data', async () => {
            render(<App />);

            // Find and click edit button for first user
            const editButtons = screen.getAllByTestId('edit-button');
            fireEvent.click(editButtons[0]);

            // Check if form is populated with user data
            await waitFor(() => {
                expect(screen.getByTestId('name-input')).toHaveValue(mockUsers[0].name);
                expect(screen.getByTestId('email-input')).toHaveValue(mockUsers[0].email);
                expect(screen.getByTestId('role-select')).toHaveValue(mockUsers[0].role);
            });
        });

        it('updates user successfully', async () => {
            const updatedData = {
                name: 'Updated Name',
                email: 'updated@example.com',
                role: 'admin'
            };

            render(<App />);

            // Open edit form
            const editButtons = screen.getAllByTestId('edit-button');
            fireEvent.click(editButtons[0]);

            // Update form fields
            const nameInput = screen.getByTestId('name-input');
            const emailInput = screen.getByTestId('email-input');
            const roleSelect = screen.getByTestId('role-select');

            await userEvent.clear(nameInput);
            await userEvent.clear(emailInput);

            await userEvent.type(nameInput, updatedData.name);
            await userEvent.type(emailInput, updatedData.email);
            await userEvent.selectOptions(roleSelect, updatedData.role);

            // Submit form
            fireEvent.click(screen.getByTestId('submit-button'));

            // Verify updateUser was called
            await waitFor(() => {
                expect(mockUseUsers.updateUser).toHaveBeenCalledWith(
                    mockUsers[0].id,
                    updatedData
                );
            });
        });
    });

    describe('User Deletion', () => {
        it('deletes user after confirmation', async () => {
            // Mock window.confirm
            const mockConfirm = jest.spyOn(window, 'confirm');
            mockConfirm.mockImplementation(() => true);

            render(<App />);

            // Find and click delete button for first user
            const deleteButtons = screen.getAllByTestId('delete-button');
            fireEvent.click(deleteButtons[0]);

            // Verify deleteUser was called
            await waitFor(() => {
                expect(mockUseUsers.deleteUser).toHaveBeenCalledWith(mockUsers[0].id);
            });

            mockConfirm.mockRestore();
        });

        it('does not delete user when confirmation is cancelled', async () => {
            // Mock window.confirm
            const mockConfirm = jest.spyOn(window, 'confirm');
            mockConfirm.mockImplementation(() => false);

            render(<App />);

            // Find and click delete button for first user
            const deleteButtons = screen.getAllByTestId('delete-button');
            fireEvent.click(deleteButtons[0]);

            // Verify deleteUser was not called
            expect(mockUseUsers.deleteUser).not.toHaveBeenCalled();

            mockConfirm.mockRestore();
        });
    });

    describe('Form Cancellation', () => {
        it('closes form when cancel is clicked', () => {
            render(<App />);

            // Open create form
            fireEvent.click(screen.getByTestId('add-user-button'));
            expect(screen.getByTestId('user-form')).toBeInTheDocument();

            // Click cancel
            fireEvent.click(screen.getByTestId('cancel-button'));
            expect(screen.queryByTestId('user-form')).not.toBeInTheDocument();
        });

        it('clears form state when cancelled', async () => {
            render(<App />);

            // Open create form and fill some data
            fireEvent.click(screen.getByTestId('add-user-button'));
            await userEvent.type(screen.getByTestId('name-input'), 'Test User');

            // Cancel form
            fireEvent.click(screen.getByTestId('cancel-button'));

            // Reopen form and verify it's empty
            fireEvent.click(screen.getByTestId('add-user-button'));
            expect(screen.getByTestId('name-input')).toHaveValue('');
        });
    });
});
