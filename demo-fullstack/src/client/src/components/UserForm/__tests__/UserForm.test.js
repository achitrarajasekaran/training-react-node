import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserForm from '../UserForm';

describe('UserForm', () => {
    const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user'
    };

    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders empty form in create mode', () => {
        render(
            <UserForm
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );

        // Check if form fields are empty
        expect(screen.getByTestId('name-input')).toHaveValue('');
        expect(screen.getByTestId('email-input')).toHaveValue('');
        expect(screen.getByTestId('role-select')).toHaveValue('user');
        expect(screen.getByTestId('submit-button')).toHaveTextContent('Create User');
    });

    it('renders form with user data in edit mode', () => {
        render(
            <UserForm
                user={mockUser}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
            />
        );

        // Check if form fields are populated with user data
        expect(screen.getByTestId('name-input')).toHaveValue(mockUser.name);
        expect(screen.getByTestId('email-input')).toHaveValue(mockUser.email);
        expect(screen.getByTestId('role-select')).toHaveValue(mockUser.role);
        expect(screen.getByTestId('submit-button')).toHaveTextContent('Update User');
    });

    describe('Form Validation', () => {
        it('shows validation errors for empty required fields', async () => {
            render(
                <UserForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            // Submit form without filling required fields
            fireEvent.click(screen.getByTestId('submit-button'));

            // Check for validation error messages
            await waitFor(() => {
                expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required');
                expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
            });

            // Verify onSubmit was not called
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('validates email format', async () => {
            render(
                <UserForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            // Enter invalid email
            await userEvent.type(screen.getByTestId('name-input'), 'John Doe');
            await userEvent.type(screen.getByTestId('email-input'), 'invalid-email');

            // Submit form
            fireEvent.click(screen.getByTestId('submit-button'));

            // Check for email validation error
            await waitFor(() => {
                expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email format');
            });

            // Verify onSubmit was not called
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('validates minimum name length', async () => {
            render(
                <UserForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            // Enter single character name
            await userEvent.type(screen.getByTestId('name-input'), 'J');

            // Submit form
            fireEvent.click(screen.getByTestId('submit-button'));

            // Check for name validation error
            await waitFor(() => {
                expect(screen.getByTestId('name-error')).toHaveTextContent('Name must be at least 2 characters');
            });

            // Verify onSubmit was not called
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    describe('Form Submission', () => {
        it('submits form with valid data', async () => {
            render(
                <UserForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            // Fill form with valid data
            await userEvent.type(screen.getByTestId('name-input'), 'John Doe');
            await userEvent.type(screen.getByTestId('email-input'), 'john@example.com');
            await userEvent.selectOptions(screen.getByTestId('role-select'), 'admin');

            // Submit form
            fireEvent.click(screen.getByTestId('submit-button'));

            // Verify onSubmit was called with correct data
            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith({
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'admin'
                });
            });
        });

        it('handles submission errors', async () => {
            const submitError = new Error('Submission failed');
            mockOnSubmit.mockRejectedValueOnce(submitError);

            render(
                <UserForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            // Fill form with valid data
            await userEvent.type(screen.getByTestId('name-input'), 'John Doe');
            await userEvent.type(screen.getByTestId('email-input'), 'john@example.com');

            // Submit form
            fireEvent.click(screen.getByTestId('submit-button'));

            // Check for submission error message
            await waitFor(() => {
                expect(screen.getByTestId('submit-error')).toHaveTextContent('Submission failed');
            });
        });
    });

    describe('Form Interaction', () => {
        it('clears validation errors when user starts typing', async () => {
            render(
                <UserForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            // Submit empty form to trigger validation errors
            fireEvent.click(screen.getByTestId('submit-button'));

            // Wait for validation errors
            await waitFor(() => {
                expect(screen.getByTestId('name-error')).toBeInTheDocument();
            });

            // Start typing in name field
            await userEvent.type(screen.getByTestId('name-input'), 'J');

            // Verify error is cleared
            expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
        });

        it('calls onCancel when cancel button is clicked', () => {
            render(
                <UserForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            fireEvent.click(screen.getByTestId('cancel-button'));
            expect(mockOnCancel).toHaveBeenCalled();
        });

        it('disables buttons during submission', async () => {
            // Mock onSubmit to delay resolution
            mockOnSubmit.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

            render(
                <UserForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            // Fill form with valid data
            await userEvent.type(screen.getByTestId('name-input'), 'John Doe');
            await userEvent.type(screen.getByTestId('email-input'), 'john@example.com');

            // Submit form
            fireEvent.click(screen.getByTestId('submit-button'));

            // Verify buttons are disabled during submission
            expect(screen.getByTestId('submit-button')).toBeDisabled();
            expect(screen.getByTestId('cancel-button')).toBeDisabled();
            expect(screen.getByTestId('submit-button')).toHaveTextContent('Saving...');
        });
    });
});
