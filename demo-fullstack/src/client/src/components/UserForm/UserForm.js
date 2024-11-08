import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './UserForm.css';

/**
 * UserForm Component
 * Handles user creation and editing with validation
 * Demonstrates form handling, validation, and error management
 */
const UserForm = ({ user, onSubmit, onCancel }) => {
    // Initialize form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'user'
    });

    // Validation state
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation rules
    const validateForm = useCallback(() => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Role validation
        if (!['user', 'admin'].includes(formData.role)) {
            newErrors.role = 'Invalid role selected';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Handle input changes
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (validateForm()) {
                await onSubmit(formData);
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: error.message
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="user-form" onSubmit={handleSubmit} data-testid="user-form">
            <div className="user-form__field">
                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                    data-testid="name-input"
                />
                {errors.name && (
                    <span className="user-form__error" data-testid="name-error">
                        {errors.name}
                    </span>
                )}
            </div>

            <div className="user-form__field">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    data-testid="email-input"
                />
                {errors.email && (
                    <span className="user-form__error" data-testid="email-error">
                        {errors.email}
                    </span>
                )}
            </div>

            <div className="user-form__field">
                <label htmlFor="role">Role</label>
                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={errors.role ? 'error' : ''}
                    data-testid="role-select"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                {errors.role && (
                    <span className="user-form__error" data-testid="role-error">
                        {errors.role}
                    </span>
                )}
            </div>

            {errors.submit && (
                <div className="user-form__error user-form__error--submit" data-testid="submit-error">
                    {errors.submit}
                </div>
            )}

            <div className="user-form__actions">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="user-form__button user-form__button--submit"
                    data-testid="submit-button"
                >
                    {isSubmitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="user-form__button user-form__button--cancel"
                    data-testid="cancel-button"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

UserForm.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
        role: PropTypes.oneOf(['user', 'admin'])
    }),
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default UserForm;
