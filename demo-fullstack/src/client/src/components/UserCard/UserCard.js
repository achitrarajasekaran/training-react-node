import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './UserCard.css';

/**
 * UserCard Component
 * A reusable component for displaying user information
 * Demonstrates prop validation and memo for performance optimization
 */
const UserCard = memo(({ user, onEdit, onDelete }) => {
    return (
        <div className="user-card" data-testid="user-card">
            <div className="user-card__content">
                <h3 className="user-card__name">{user.name}</h3>
                <p className="user-card__email">{user.email}</p>
                <p className="user-card__role">Role: {user.role}</p>
            </div>
            <div className="user-card__actions">
                <button
                    className="user-card__button user-card__button--edit"
                    onClick={() => onEdit(user)}
                    data-testid="edit-button"
                >
                    Edit
                </button>
                <button
                    className="user-card__button user-card__button--delete"
                    onClick={() => onDelete(user.id)}
                    data-testid="delete-button"
                >
                    Delete
                </button>
            </div>
        </div>
    );
});

UserCard.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        role: PropTypes.oneOf(['user', 'admin']).isRequired
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

// Display name for debugging
UserCard.displayName = 'UserCard';

export default UserCard;
