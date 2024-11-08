import React, { useState, useCallback } from 'react';
import UserCard from './components/UserCard/UserCard';
import UserForm from './components/UserForm/UserForm';
import useUsers from './hooks/useUsers';
import './App.css';

function App() {
  // State for managing form visibility and editing
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Get user management functions from custom hook
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser
  } = useUsers();

  // Handle form submission for both create and edit
  const handleSubmit = useCallback(async (userData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(userData);
      }
      setIsFormVisible(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error; // Re-throw to be handled by the form
    }
  }, [editingUser, createUser, updateUser]);

  // Handle edit button click
  const handleEdit = useCallback((user) => {
    setEditingUser(user);
    setIsFormVisible(true);
  }, []);

  // Handle delete with confirmation
  const handleDelete = useCallback(async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  }, [deleteUser]);

  // Handle form cancel
  const handleCancel = useCallback(() => {
    setIsFormVisible(false);
    setEditingUser(null);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>User Management</h1>
        <button
          className="app-header__button"
          onClick={() => setIsFormVisible(true)}
          disabled={isFormVisible}
          data-testid="add-user-button"
        >
          Add New User
        </button>
      </header>

      <main className="app-content">
        {error && (
          <div className="app-error" role="alert" data-testid="error-message">
            {error}
          </div>
        )}

        {isFormVisible && (
          <div className="app-form-container">
            <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
            <UserForm
              user={editingUser}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        )}

        <div className="app-users">
          {loading ? (
            <div className="app-loading" data-testid="loading-indicator">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="app-empty" data-testid="empty-message">
              No users found. Click "Add New User" to create one.
            </div>
          ) : (
            <div className="app-users-grid">
              {users.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
