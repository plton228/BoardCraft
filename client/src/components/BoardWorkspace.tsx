import React, { useState, useEffect, useRef } from 'react';
import { WhiteboardCanvas } from './WhiteboardCanvas';
import type { BoardElement } from './WhiteboardCanvas';
import { AccessibleModal } from './AccessibleModal';
import { ArrowLeft, Share2, MousePointer, Pencil, Type, StickyNote, Square, Circle as CircleIcon, Trash2, Clock, Check } from 'lucide-react';

interface BoardWorkspaceProps {
  boardId: string;
  token: string;
  onBack: () => void;
}

export const BoardWorkspace: React.FC<BoardWorkspaceProps> = ({ boardId, token, onBack }) => {
  const [boardTitle, setBoardTitle] = useState('Завантаження...');
  const [isPublic, setIsPublic] = useState(false);
  const [elements, setElements] = useState<BoardElement[]>([]);
  
  const [tool, setTool] = useState<'select' | 'pen' | 'text' | 'sticky' | 'rectangle' | 'circle'>('select');
  const [activeColor, setActiveColor] = useState('#3b82f6');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [timestamp, setTimestamp] = useState<{ name: string; timeStr: string } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Colors available in the property panel
  const colors = [
    '#000000', // Black
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow/Orange
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#fef08a', // Pastel Yellow (Sticky default)
    '#bbf7d0', // Pastel Green
    '#bfdbfe'  // Pastel Blue
  ];

  // 1. Fetch Board Meta and Elements on Mount
  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        // Fetch Board Details
        const boardRes = await fetch(`http://localhost:5000/api/boards/${boardId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const boardJson = await boardRes.json();
        if (boardJson.success) {
          setBoardTitle(boardJson.data.title);
          setIsPublic(boardJson.data.isPublic);
        }

        // Fetch Board Elements
        const elementsRes = await fetch(`http://localhost:5000/api/boards/${boardId}/elements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const elementsJson = await elementsRes.json();
        if (elementsJson.success) {
          setElements(elementsJson.data);
        }
      } catch (err) {
        console.error('Error fetching board workspace data:', err);
      }
    };

    fetchBoardData();
  }, [boardId, token]);

  // 2. Autosave elements on change (Debounced to avoid excessive API requests)
  const saveElementsToBackend = async (currentElements: BoardElement[]) => {
    setIsSaving(true);
    try {
      await fetch(`http://localhost:5000/api/boards/${boardId}/elements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ elements: currentElements })
      });
    } catch (err) {
      console.error('Autosave error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleElementsChange = (updatedElements: BoardElement[]) => {
    setElements(updatedElements);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveElementsToBackend(updatedElements);
    }, 1500); // Save after 1.5 seconds of inactivity
  };

  // 3. Update Board title on blur
  const handleTitleBlur = async () => {
    try {
      await fetch(`http://localhost:5000/api/boards/${boardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: boardTitle, isPublic })
      });
    } catch (err) {
      console.error('Error updating board title:', err);
    }
  };

  // 4. Update Board public status
  const handlePublicToggle = async (newPublicVal: boolean) => {
    setIsPublic(newPublicVal);
    try {
      await fetch(`http://localhost:5000/api/boards/${boardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: boardTitle, isPublic: newPublicVal })
      });
    } catch (err) {
      console.error('Error updating board visibility:', err);
    }
  };

  // 5. Delete Selected Element
  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    const updated = elements.filter(el => el.id !== selectedElementId);
    handleElementsChange(updated);
    setSelectedElementId(null);
  };

  // 6. Update Color of Selected Element
  const handleColorChange = (color: string) => {
    if (!selectedElementId) return;
    const updated = elements.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, color };
      }
      return el;
    });
    handleElementsChange(updated);
  };

  // 7. Time Stamp Generator (Required by college reports)
  const generateTimestamp = () => {
    const name = 'Павліченко Платон';
    const now = new Date();
    const timeStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    
    // Output to console as required by report guidelines
    console.log('--- Часовий штамп ІНДЗ ---');
    console.log('Розробник: ' + name);
    console.log('Час генерації: ' + timeStr);
    console.log('--------------------------');

    setTimestamp({ name, timeStr });
  };

  // 8. Drag Start Handler for Drag'n'Drop Toolbar buttons
  const handleDragStart = (e: React.DragEvent, type: BoardElement['type'], color?: string) => {
    e.dataTransfer.setData('text/plain', type);
    if (color) {
      e.dataTransfer.setData('text/color', color);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);

  return (
    <div className="workspace-container">
      {/* Top Header */}
      <header className="workspace-header">
        <div className="workspace-header-left">
          <button className="btn btn-secondary" onClick={onBack} aria-label="Назад до списку дошок">
            <ArrowLeft size={16} /> Назад
          </button>
          <input
            type="text"
            className="workspace-title-input"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Назва дошки"
          />
          {isSaving ? (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Збереження...</span>
          ) : (
            <span style={{ fontSize: '12px', color: '#10b981' }}>Збережено</span>
          )}
        </div>

        <div className="workspace-header-right">
          {timestamp && (
            <div className="timestamp-card-inline">
              <Clock size={14} />
              <span><strong>{timestamp.name}</strong> • {timestamp.timeStr}</span>
            </div>
          )}
          
          <button className="btn btn-secondary" onClick={generateTimestamp} title="Згенерувати штамп часу">
            <Clock size={16} /> Штамп часу
          </button>
          
          <button className="btn btn-primary" onClick={() => setIsShareModalOpen(true)}>
            <Share2 size={16} /> Поділитися
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="workspace-area">
        
        {/* Left Floating Toolbar */}
        <nav className="left-toolbar" aria-label="Панель інструментів дошки">
          <button 
            className={`toolbar-btn ${tool === 'select' ? 'active' : ''}`}
            onClick={() => setTool('select')}
            title="Інструмент виділення (Select)"
          >
            <MousePointer size={20} />
          </button>
          
          <button 
            className={`toolbar-btn ${tool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
            title="Пензель малювання (Pen)"
          >
            <Pencil size={20} />
          </button>

          <button 
            className={`toolbar-btn ${tool === 'text' ? 'active' : ''}`}
            onClick={() => setTool('text')}
            draggable
            onDragStart={(e) => handleDragStart(e, 'text')}
            title="Текстовий блок (Драг-н-Дроп на Canvas)"
          >
            <Type size={20} />
          </button>

          <button 
            className={`toolbar-btn ${tool === 'sticky' ? 'active' : ''}`}
            onClick={() => setTool('sticky')}
            draggable
            onDragStart={(e) => handleDragStart(e, 'sticky', '#fef08a')}
            title="Кольоровий стікер (Драг-н-Дроп на Canvas)"
          >
            <StickyNote size={20} />
          </button>

          <button 
            className={`toolbar-btn ${tool === 'rectangle' ? 'active' : ''}`}
            onClick={() => setTool('rectangle')}
            draggable
            onDragStart={(e) => handleDragStart(e, 'rectangle')}
            title="Прямокутник (Драг-н-Дроп на Canvas)"
          >
            <Square size={20} />
          </button>

          <button 
            className={`toolbar-btn ${tool === 'circle' ? 'active' : ''}`}
            onClick={() => setTool('circle')}
            draggable
            onDragStart={(e) => handleDragStart(e, 'circle')}
            title="Коло (Драг-н-Дроп на Canvas)"
          >
            <CircleIcon size={20} />
          </button>
        </nav>

        {/* Center Canvas */}
        <WhiteboardCanvas
          elements={elements}
          onElementsChange={handleElementsChange}
          tool={tool}
          activeColor={activeColor}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
        />

        {/* Right Properties Panel */}
        {selectedElement && (
          <div className="right-properties">
            <div className="property-group">
              <span className="property-label">Тип елемента</span>
              <p style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>
                {selectedElement.type === 'line' ? 'Пензель' : selectedElement.type}
              </p>
            </div>

            <div className="property-group">
              <span className="property-label">Колір елемента</span>
              <div className="color-grid">
                {colors.map(col => (
                  <button
                    key={col}
                    className={`color-dot ${selectedElement.color === col ? 'active' : ''}`}
                    style={{ backgroundColor: col }}
                    onClick={() => handleColorChange(col)}
                    aria-label={`Вибрати колір ${col}`}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <button 
                className="btn btn-danger btn-block"
                onClick={handleDeleteSelected}
              >
                <Trash2 size={16} /> Видалити елемент
              </button>
            </div>
          </div>
        )}

        {/* Active Tool Color picker (if nothing selected) */}
        {!selectedElement && tool !== 'select' && (
          <div className="right-properties">
            <div className="property-group">
              <span className="property-label">Колір пензля/фігури</span>
              <div className="color-grid">
                {colors.slice(0, 7).map(col => (
                  <button
                    key={col}
                    className={`color-dot ${activeColor === col ? 'active' : ''}`}
                    style={{ backgroundColor: col }}
                    onClick={() => setActiveColor(col)}
                    aria-label={`Вибрати колір ${col}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accessible Sharing Modal */}
      <AccessibleModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Налаштування спільного доступу"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>Будь ласка, оберіть тип доступу для дошки <strong>"{boardTitle}"</strong>:</p>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '15px' }}>
            <input 
              type="checkbox" 
              checked={isPublic} 
              onChange={(e) => handlePublicToggle(e.target.checked)} 
              style={{ width: '18px', height: '18px' }}
            />
            Публічний доступ (інші користувачі зможуть переглядати дошку)
          </label>

          {isPublic && (
            <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Посилання для перегляду:</p>
              <code style={{ fontSize: '12px', color: 'var(--primary)', wordBreak: 'break-all' }}>
                http://localhost:5173/board/{boardId}
              </code>
            </div>
          )}

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setIsShareModalOpen(false)}>
              <Check size={16} /> Готово
            </button>
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
};
