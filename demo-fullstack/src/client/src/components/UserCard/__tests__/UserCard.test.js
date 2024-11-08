import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from '../UserCard';

describe('UserCard', () => {
    const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user'
    };

    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    beforeEach(() => {
        // Clear mock function calls before each test
        jest.clearAllMocks();
    });

    it('renders user information correctly', () => {
        render(
            <UserCard
                user={mockUser}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        // Check if all user information is displayed
        expect(screen.getByText(mockUser.name)).toBeInTheDocument();
        expect(screen.getByText(mockUser.email)).toBeInTheDocument();
        expect(screen.getByText(`Role: ${mockUser.role}`)).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        render(
            <UserCard
                user={mockUser}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        // Find and click edit button
        const editButton = screen.getByTestId('edit-button');
        fireEvent.click(editButton);

        // Verify onEdit was called with the user object
        expect(mockOnEdit).toHaveBeenCalledTimes(1);
        expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
    });

    it('calls onDelete when delete button is clicked', () => {
        render(
            <UserCard
                user={mockUser}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        // Find and click delete button
        const deleteButton = screen.getByTestId('delete-button');
        fireEvent.click(deleteButton);

        // Verify onDelete was called with the user id
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith(mockUser.id);
    });

    // Test prop validation
    it('throws error when required props are missing', () => {
        // Suppress console.error for this test as we expect prop type warnings
        const originalError = console.error;
        console.error = jest.fn();

        expect(() => {
            render(<UserCard />);
        }).toThrow();

        expect(() => {
            render(<UserCard user={mockUser} />);
        }).toThrow();

        expect(() => {
            render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
        }).toThrow();

        // Restore console.error
        console.error = originalError;
    });

    it('validates user prop shape', () => {
        // Suppress console.error for this test
        const originalError = console.error;
        console.error = jest.fn();

        const invalidUser = {
            id: '1',
            name: 'John Doe',
            // Missing required email
            role: 'invalid-role' // Invalid role
        };

        expect(() => {
            render(
                <UserCard
                    user={invalidUser}
                    onEdit={mockOnEdit}
                    onDelete={mockOnDelete}
                />
            );
        }).toThrow();

        // Restore console.error
        console.error = originalError;
    });

    // Test memo optimization
    it('does not re-render when props have not changed', () => {
        const { rerender } = render(
            <UserCard
                user={mockUser}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        // First render
        const firstRender = screen.getByTestId('user-card');

        // Re-render with same props
        rerender(
            <UserCard
                user={mockUser}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
            />
        );

        const secondRender = screen.getByTestId('user-card');

        // Verify it's the same instance
        expect(firstRender).toBe(secondRender);
    });
});
