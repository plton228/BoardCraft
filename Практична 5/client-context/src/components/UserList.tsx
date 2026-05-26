import React from 'react';
import { User } from '../types/user';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete }) => {
  if (users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
        Користувачів не знайдено. Спробуйте змінити фільтри пошуку.
      </div>
    );
  }

  return (
    <div className="user-list-container">
      {users.map((user) => (
        <div key={user.id} className="user-card">
          <div className="user-info">
            <h3>{user.name}</h3>
            <div className="user-email">{user.email}</div>
            <div className="user-meta">
              <span className="badge badge-role">{user.role}</span>
              <span className="badge badge-department">{user.department}</span>
            </div>
          </div>
          <div className="user-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit(user)}
              style={{ marginRight: '0.25rem' }}
            >
              Редагувати
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(user.id)}>
              Видалити
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
