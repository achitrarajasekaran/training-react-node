import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing user data and operations
 * Demonstrates useState, useEffect, and useCallback hooks
 */
const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:3001/api/users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create user
    const createUser = useCallback(async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:3001/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                throw new Error('Failed to create user');
            }
            const newUser = await response.json();
            setUsers(prevUsers => [...prevUsers, newUser]);
            return newUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update user
    const updateUser = useCallback(async (id, userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:3001/api/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
            const updatedUser = await response.json();
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === id ? updatedUser : user
                )
            );
            return updatedUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete user
    const deleteUser = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:3001/api/users/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            setUsers(prevUsers =>
                prevUsers.filter(user => user.id !== id)
            );
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Load users on mount
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        refreshUsers: fetchUsers
    };
};

export default useUsers;
