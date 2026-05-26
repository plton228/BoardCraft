import React, { useState, useEffect } from 'react';
import { User, UserInput } from '../types/user';

interface UserFormProps {
  editingUser: User | null;
  onSubmit: (user: UserInput) => Promise<void>;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  editingUser,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Розробник');
  const [department, setDepartment] = useState('Інженерія');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setRole(editingUser.role);
      setDepartment(editingUser.department);
    } else {
      setName('');
      setEmail('');
      setRole('Розробник');
      setDepartment('Інженерія');
    }
    setError('');
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError("Ім'я є обов'язковим");
      return;
    }
    if (!email.trim()) {
      setError("Email є обов'язковим");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name, email, role, department });
      if (!editingUser) {
        
        setName('');
        setEmail('');
        setRole('Розробник');
        setDepartment('Інженерія');
      }
    } catch (err: any) {
      setError(err.message || 'Сталася помилка при збереженні');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setName('');
    setEmail('');
    setRole('Розробник');
    setDepartment('Інженерія');
    setError('');
    if (editingUser) {
      onCancel();
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">
        {editingUser ? 'Редагувати користувача' : 'Створення користувача'}
      </h3>
      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Форма використовує локальний стан, а збереження проходить через загальний API.
      </p>

      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', borderLeft: '3px solid var(--color-danger)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="userName">Ім'я</label>
          <input
            id="userName"
            type="text"
            className="form-control"
            placeholder="Наприклад, Олена Коваль"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="userEmail">Email</label>
          <input
            id="userEmail"
            type="email"
            className="form-control"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="userRole">Роль</label>
          <select
            id="userRole"
            className="form-control"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={submitting}
            style={{ appearance: 'none', background: 'var(--bg-primary)' }}
          >
            <option value="Адміністратор">Адміністратор</option>
            <option value="Менеджер">Менеджер</option>
            <option value="Аналітик">Аналітик</option>
            <option value="Розробник">Розробник</option>
            <option value="Оператор">Оператор</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="userDepartment">Підрозділ</label>
          <input
            id="userDepartment"
            type="text"
            className="form-control"
            placeholder="Аналітика даних, інженерія..."
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
            {submitting ? 'Збереження...' : editingUser ? 'Зберегти зміни' : 'Створити запис'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={submitting}>
            {editingUser ? 'Скасувати' : 'Очистити форму'}
          </button>
        </div>
      </form>
    </div>
  );
};
