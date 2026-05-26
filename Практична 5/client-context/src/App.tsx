import { useEffect } from 'react';
import { useUsers } from './hooks/useUsers';
import { FilterPanel } from './components/FilterPanel';
import { UserList } from './components/UserList';
import { UserForm } from './components/UserForm';
import { Pagination } from './components/Pagination';
import { UserInput } from './types/user';

function App() {
  const {
    users,
    selectedUser,
    pagination,
    search,
    page,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    setSelectedUser,
    setSearch,
    setPage,
    resetFilters,
  } = useUsers();

  
  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const handleSubmit = async (userInput: UserInput) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, userInput);
    } else {
      await createUser(userInput);
    }
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
          <h1>Керування даними та Context State (useReducer)</h1>
          <p className="subtitle">
            Практична 5: Частина 1. Стан координується через React Context та useReducer за допомогою хука useUsers.
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
            <strong style={{ color: 'var(--color-danger)' }}>Помилка запиту:</strong>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {error}. Будь ласка, переконайтеся, що бекенд-сервер запущений та база даних PostgreSQL налаштована.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers}>
            Повторити спробу
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        {}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <FilterPanel
            search={search}
            onSearchChange={setSearch}
            onReset={resetFilters}
          />
          
          <div className="card-title">
            <span>Список користувачів</span>
            <span className="status-badge success" style={{ fontSize: '0.7rem' }}>
              React Context
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
                onEdit={setSelectedUser}
                onDelete={deleteUser}
              />
            )}
          </div>

          <Pagination
            meta={pagination}
            onPageChange={setPage}
          />
        </div>

        {}
        <div>
          <UserForm
            editingUser={selectedUser}
            onSubmit={handleSubmit}
            onCancel={() => setSelectedUser(null)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
