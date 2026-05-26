import { useState, useEffect } from 'react';
import { User, UserInput, PaginationMeta } from './types/user';
import { UserApi } from './api/userApi';
import { FilterPanel } from './components/FilterPanel';
import { UserList } from './components/UserList';
import { UserForm } from './components/UserForm';
import { Pagination } from './components/Pagination';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 4,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsers = async () => {
    setStatus('LOADING');
    try {
      const data = await UserApi.getUsers({
        search,
        page,
        limit: 4, 
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setUsers(data.users);
      setPagination(data.pagination);
      setStatus('SUCCESS');
    } catch (err: any) {
      setErrorMessage(err.message || 'Помилка при завантаженні');
      setStatus('ERROR');
    }
  };

  
  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); 
  };

  const handleReset = () => {
    setSearch('');
    setPage(1);
    setEditingUser(null);
  };

  const handleSubmit = async (userInput: UserInput) => {
    try {
      if (editingUser) {
        await UserApi.updateUser(editingUser.id, userInput);
        setEditingUser(null);
      } else {
        await UserApi.createUser(userInput);
      }
      fetchUsers(); 
    } catch (err: any) {
      throw new Error(err.message || 'Помилка при збереженні');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      try {
        await UserApi.deleteUser(id);
        fetchUsers(); 
      } catch (err: any) {
        alert(err.message || 'Помилка при видаленні');
      }
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>Керування користувачами та станом інтерфейсу</h1>
          <p className="subtitle">
            Референсний інтерфейс демонструє, як компоненти подання працюють через API.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Стан запиту:</span>
          <span className={`status-badge ${status.toLowerCase()}`}>
            {status}
          </span>
        </div>
      </header>

      {status === 'ERROR' && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-danger)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ color: 'var(--color-danger)' }}>Помилка з'єднання з сервером:</strong>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {errorMessage}. Будь ласка, переконайтеся, що бекенд-сервер запущений та база даних PostgreSQL налаштована.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers}>
            Повторити спробу
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left column: List and Filters */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <FilterPanel
            search={search}
            onSearchChange={handleSearchChange}
            onReset={handleReset}
          />
          
          <div className="card-title">
            <span>Список користувачів</span>
            <span className="status-badge success" style={{ fontSize: '0.7rem' }}>
              Активно
            </span>
          </div>

          <div style={{ flex: 1, minHeight: '300px' }}>
            {status === 'LOADING' && users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
                Завантаження даних з сервера...
              </div>
            ) : (
              <UserList
                users={users}
                onEdit={setEditingUser}
                onDelete={handleDelete}
              />
            )}
          </div>

          <Pagination
            meta={pagination}
            onPageChange={setPage}
          />
        </div>

        {/* Right column: Form */}
        <div>
          <UserForm
            editingUser={editingUser}
            onSubmit={handleSubmit}
            onCancel={() => setEditingUser(null)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
