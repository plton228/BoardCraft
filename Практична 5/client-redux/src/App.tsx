import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { fetchUsers, createUser, updateUser, deleteUser, setSelectedUser } from './store/userSlice';
import { setSearch, setPage, resetFilters } from './store/uiSlice';
import { FilterPanel } from './components/FilterPanel';
import { UserList } from './components/UserList';
import { UserForm } from './components/UserForm';
import { Pagination } from './components/Pagination';
import { UserInput } from './types/user';

function App() {
  const dispatch = useAppDispatch();

  
  const { users, selectedUser, pagination, loading, error } = useAppSelector((state) => state.users);
  const { search, page } = useAppSelector((state) => state.ui);

  
  useEffect(() => {
    dispatch(fetchUsers({ search, page }));
  }, [dispatch, search, page]);

  const handleSubmit = async (userInput: UserInput) => {
    if (selectedUser) {
      await dispatch(updateUser({ id: selectedUser.id, user: userInput })).unwrap();
    } else {
      await dispatch(createUser(userInput)).unwrap();
    }
  };

  const handleEditSelect = (user: any) => {
    dispatch(setSelectedUser(user));
  };

  const handleEditCancel = () => {
    dispatch(setSelectedUser(null));
  };

  const handleSearchChange = (val: string) => {
    dispatch(setSearch(val));
  };

  const handlePageChange = (p: number) => {
    dispatch(setPage(p));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    dispatch(setSelectedUser(null));
  };

  const handleDelete = (id: number) => {
    dispatch(deleteUser(id));
  };

  const getStatusText = () => {
    if (loading) return 'LOADING';
    if (error) return 'ERROR';
    return 'SUCCESS';
  };

  const status = getStatusText();

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>Керування даними та Redux Toolkit State</h1>
          <p className="subtitle">
            Практична 5: Частина 2. Сховище є єдиним джерелом істини. Пошуковий запит та сторінка зберігаються в localStorage.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Стан запиту:</span>
          <span className={`status-badge ${status.toLowerCase()}`}>
            {status}
          </span>
        </div>
      </header>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-danger)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ color: 'var(--color-danger)' }}>Помилка сховища (Redux):</strong>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {error}. Переконайтеся, що бекенд-сервер запущений та база даних PostgreSQL налаштована.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => dispatch(fetchUsers({ search, page }))}>
            Повторити спробу
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        {}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <FilterPanel
            search={search}
            onSearchChange={handleSearchChange}
            onReset={handleReset}
          />
          
          <div className="card-title">
            <span>Список користувачів</span>
            <span className="status-badge success" style={{ fontSize: '0.7rem' }}>
              Redux Toolkit
            </span>
          </div>

          <div style={{ flex: 1, minHeight: '300px' }}>
            {loading && users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
                Завантаження даних з сервера...
              </div>
            ) : (
              <UserList
                users={users}
                onEdit={handleEditSelect}
                onDelete={handleDelete}
              />
            )}
          </div>

          <Pagination
            meta={pagination}
            onPageChange={handlePageChange}
          />
        </div>

        {}
        <div>
          <UserForm
            editingUser={selectedUser}
            onSubmit={handleSubmit}
            onCancel={handleEditCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
