import { useState, useEffect } from 'react';
import { BoardWorkspace } from './components/BoardWorkspace';
import { Layout, Plus, Trash2, LogOut, Lock, Globe, Clipboard, LogIn, UserPlus } from 'lucide-react';

interface Board {
  id: string;
  title: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export default function App() {
  // Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem('boardcraft_token'));
  const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);

  // Navigation State
  const [currentView, setCurrentView] = useState<'auth' | 'dashboard' | 'workspace'>('auth');
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard State
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardPublic, setNewBoardPublic] = useState(false);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  // 1. Auto-login validation on mount if token exists
  useEffect(() => {
    if (token) {
      const validateSession = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const json = await res.json();
          if (json.success) {
            setUser(json.user);
            setCurrentView('dashboard');
          } else {
            // Token expired or invalid
            handleLogout();
          }
        } catch (e) {
          console.error('Session validation error:', e);
          handleLogout();
        }
      };
      validateSession();
    } else {
      setCurrentView('auth');
    }
  }, [token]);

  // 2. Fetch Board List (only if logged in and in dashboard)
  useEffect(() => {
    if (token && currentView === 'dashboard') {
      const fetchBoards = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/boards', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const json = await res.json();
          if (json.success) {
            setBoards(json.data);
          }
        } catch (e) {
          console.error('Error fetching boards:', e);
        }
      };
      fetchBoards();
    }
  }, [token, currentView]);

  // ==========================================
  // AUTHENTICATION LOGIC
  // ==========================================
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const url = isLogin 
      ? 'http://localhost:5000/api/auth/login' 
      : 'http://localhost:5000/api/auth/register';

    const bodyPayload = isLogin 
      ? { email: emailInput, password: passwordInput }
      : { username: usernameInput, email: emailInput, password: passwordInput };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const json = await res.json();

      if (json.success) {
        localStorage.setItem('boardcraft_token', json.token);
        setToken(json.token);
        setUser(json.user);
        setCurrentView('dashboard');
        
        // Reset form inputs
        setUsernameInput('');
        setEmailInput('');
        setPasswordInput('');
      } else {
        setAuthError(json.error || json.errors?.[0]?.message || 'Помилка авторизації');
      }
    } catch (err) {
      setAuthError('Не вдалося з’єднатися із сервером. Переконайтеся, що бекенд запущено.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('boardcraft_token');
    setToken(null);
    setUser(null);
    setCurrentView('auth');
    setActiveBoardId(null);
  };

  // ==========================================
  // BOARDS CRUD LOGIC
  // ==========================================
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !token) return;

    try {
      const res = await fetch('http://localhost:5000/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newBoardTitle, isPublic: newBoardPublic })
      });
      const json = await res.json();

      if (json.success) {
        setBoards([json.data, ...boards]);
        setNewBoardTitle('');
        setNewBoardPublic(false);
        setIsCreatingBoard(false);
      }
    } catch (e) {
      console.error('Error creating board:', e);
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid triggering open click
    if (!token) return;

    if (!confirm('Ви впевнені, що хочете видалити цю дошку та всі її елементи?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/boards/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();

      if (json.success) {
        setBoards(boards.filter(b => b.id !== id));
      }
    } catch (e) {
      console.error('Error deleting board:', e);
    }
  };

  // ==========================================
  // RENDER SECTIONS
  // ==========================================

  // A. AUTH VIEW
  if (currentView === 'auth') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Clipboard size={32} color="var(--primary)" /> BoardCraft
            </h1>
            <p>{isLogin ? 'Введіть дані для входу в акаунт' : 'Створіть новий акаунт'}</p>
          </div>

          {authError && <div className="alert-error">{authError}</div>}

          <form onSubmit={handleAuthSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Ім’я користувача</label>
                <input
                  type="text"
                  className="form-input"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Введіть ім’я"
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Електронна пошта</label>
              <input
                type="email"
                className="form-input"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                className="form-input"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Мінімум 6 символів"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {isLogin ? 'Увійти' : 'Зареєструватися'}
            </button>
          </form>

          <div className="auth-footer">
            <span>
              {isLogin ? 'Ще немає акаунту? ' : 'Вже зареєстровані? '}
            </span>
            <button 
              className="auth-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError(null);
              }}
            >
              {isLogin ? 'Створити акаунт' : 'Увійти'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // B. WORKSPACE VIEW
  if (currentView === 'workspace' && activeBoardId && token) {
    return (
      <BoardWorkspace
        boardId={activeBoardId}
        token={token}
        onBack={() => {
          setActiveBoardId(null);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  // C. DASHBOARD VIEW (Default)
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layout size={36} color="var(--primary)" /> BoardCraft
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            Вітаємо, <strong>{user?.username}</strong>! Тут ваші інтерактивні дошки.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setIsCreatingBoard(!isCreatingBoard)}
          >
            <Plus size={18} /> Нова дошка
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleLogout}
            title="Вийти з акаунту"
          >
            <LogOut size={18} /> Вийти
          </button>
        </div>
      </header>

      {/* New Board Modal/Collapse Form */}
      {isCreatingBoard && (
        <div style={{
          background: 'var(--bg-card)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{ marginBottom: '16px' }}>Створення нової спільної дошки</h3>
          <form onSubmit={handleCreateBoard} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Назва дошки</label>
              <input
                type="text"
                className="form-input"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Наприклад: Проектний дизайн"
                required
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '45px' }}>
              <input
                type="checkbox"
                id="new-public"
                checked={newBoardPublic}
                onChange={(e) => setNewBoardPublic(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="new-public" style={{ fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>
                Публічний доступ
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">Створити</button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsCreatingBoard(false)}
              >
                Скасувати
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Board List Grid */}
      {boards.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          <Layout size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-main)' }}>У вас ще немає створених дошок</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '20px' }}>
            Створіть свою першу дошку, щоб розпочати малювання та клеїти стікери.
          </p>
          <button className="btn btn-primary" onClick={() => setIsCreatingBoard(true)}>
            <Plus size={18} /> Створити дошку
          </button>
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map(b => (
            <div 
              key={b.id} 
              className="board-card"
              onClick={() => {
                setActiveBoardId(b.id);
                setCurrentView('workspace');
              }}
            >
              <div>
                <h3 className="board-card-title">{b.title}</h3>
                <span className="board-card-meta">
                  Оновлено: {new Date(b.updatedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`board-badge ${b.isPublic ? 'public' : ''}`}>
                  {b.isPublic ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={12} /> Публічна</span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> Приватна</span>
                  )}
                </span>
                
                <button 
                  className="board-delete-btn"
                  onClick={(e) => handleDeleteBoard(e, b.id)}
                  title="Видалити дошку"
                  aria-label="Видалити дошку"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Author and Course Metadata Footer */}
      <footer style={{
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <p>ІНДЗ з дисципліни "Web-технології та Web-дизайн"</p>
        <p style={{ marginTop: '4px' }}>
          Виконав студент групи <strong>1п-23</strong>: <strong>Павліченко Платон Сергійович</strong> (Варіант 13)
        </p>
      </footer>
    </div>
  );
}
