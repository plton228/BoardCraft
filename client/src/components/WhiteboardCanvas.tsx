import React, { useRef, useState, useEffect } from 'react';

export interface BoardElement {
  id: string;
  type: 'line' | 'text' | 'sticky' | 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  content: string; // JSON points for line, text content for text/sticky
  zIndex: number;
}

interface WhiteboardCanvasProps {
  elements: BoardElement[];
  onElementsChange: (elements: BoardElement[]) => void;
  tool: 'select' | 'pen' | 'text' | 'sticky' | 'rectangle' | 'circle';
  activeColor: string;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  elements,
  onElementsChange,
  tool,
  activeColor,
  selectedElementId,
  onSelectElement
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLinePoints, setCurrentLinePoints] = useState<{x: number, y: number}[]>([]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isResizing, setIsResizing] = useState(false);
  const [resizedElementId, setResizedElementId] = useState<string | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });

  // Redraw canvas lines whenever elements change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter and draw all line elements
    elements.forEach(el => {
      if (el.type === 'line') {
        try {
          const points = JSON.parse(el.content);
          if (points.length < 2) return;

          ctx.beginPath();
          ctx.strokeStyle = el.color;
          ctx.lineWidth = 4;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';

          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
        } catch (e) {
          console.error('Error drawing line element:', e);
        }
      }
    });
  }, [elements]);

  // Adjust canvas size to fit container
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Force redraw
      const temp = [...elements];
      onElementsChange(temp);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [elements]);

  // ==========================================
  // CANVAS MOUSE DRAWING (Pencil)
  // ==========================================
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'pen') {
      onSelectElement(null);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentLinePoints([{ x, y }]);

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.moveTo(x, y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'pen') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentLinePoints(prev => [...prev, { x, y }]);

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || tool !== 'pen') return;
    setIsDrawing(false);

    if (currentLinePoints.length > 1) {
      const newLineElement: BoardElement = {
        id: Math.random().toString(36).substring(7),
        type: 'line',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        color: activeColor,
        content: JSON.stringify(currentLinePoints),
        zIndex: elements.length
      };
      onElementsChange([...elements, newLineElement]);
    }
    setCurrentLinePoints([]);
  };

  // ==========================================
  // ELEMENT CLICK / CREATION
  // ==========================================
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'select' || tool === 'pen') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement: BoardElement = {
      id: Math.random().toString(36).substring(7),
      type: tool,
      x: x - (tool === 'sticky' ? 75 : 100),
      y: y - (tool === 'sticky' ? 75 : 50),
      width: tool === 'sticky' ? 150 : 200,
      height: tool === 'sticky' ? 150 : 100,
      color: tool === 'sticky' ? '#fef08a' : activeColor, // default yellow for sticky
      content: tool === 'sticky' ? 'Новий стікер' : (tool === 'text' ? 'Введіть текст...' : ''),
      zIndex: elements.length
    };

    onElementsChange([...elements, newElement]);
    onSelectElement(newElement.id);
  };

  // ==========================================
  // DRAG & DROP TOOLBAR -> CANVAS
  // ==========================================
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') as BoardElement['type'] | '';
    const color = e.dataTransfer.getData('text/color') || activeColor;

    if (!type || !['sticky', 'rectangle', 'circle', 'text'].includes(type)) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement: BoardElement = {
      id: Math.random().toString(36).substring(7),
      type: type as any,
      x: x - (type === 'sticky' ? 75 : 100),
      y: y - (type === 'sticky' ? 75 : 50),
      width: type === 'sticky' ? 150 : 200,
      height: type === 'sticky' ? 150 : 100,
      color: type === 'sticky' && color === activeColor ? '#fef08a' : color,
      content: type === 'sticky' ? 'Стікер з полиці' : (type === 'text' ? 'Введіть текст...' : ''),
      zIndex: elements.length
    };

    onElementsChange([...elements, newElement]);
    onSelectElement(newElement.id);
  };

  // ==========================================
  // MOVE & RESIZE LOGIC (IN DOM)
  // ==========================================
  const handleElementMouseDown = (e: React.MouseEvent, el: BoardElement) => {
    if (tool !== 'select') return;
    e.stopPropagation();

    onSelectElement(el.id);
    setIsDragging(true);
    setDraggedElementId(el.id);
    setDragOffset({
      x: e.clientX - el.x,
      y: e.clientY - el.y
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, el: BoardElement) => {
    e.stopPropagation();
    e.preventDefault();

    setIsResizing(true);
    setResizedElementId(el.id);
    setResizeStartSize({ width: el.width, height: el.height });
    setResizeStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleWorkspaceMouseMove = (e: React.MouseEvent) => {
    if (isDragging && draggedElementId) {
      const updated = elements.map(el => {
        if (el.id === draggedElementId) {
          return {
            ...el,
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
          };
        }
        return el;
      });
      onElementsChange(updated);
    }

    if (isResizing && resizedElementId) {
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      
      const updated = elements.map(el => {
        if (el.id === resizedElementId) {
          return {
            ...el,
            width: Math.max(50, resizeStartSize.width + deltaX),
            height: Math.max(50, resizeStartSize.height + deltaY)
          };
        }
        return el;
      });
      onElementsChange(updated);
    }
  };

  const handleWorkspaceMouseUp = () => {
    setIsDragging(false);
    setDraggedElementId(null);
    setIsResizing(false);
    setResizedElementId(null);
  };

  const handleTextChange = (id: string, text: string) => {
    const updated = elements.map(el => {
      if (el.id === id) {
        return { ...el, content: text };
      }
      return el;
    });
    onElementsChange(updated);
  };

  return (
    <div 
      className="canvas-wrapper" 
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleWorkspaceMouseMove}
      onMouseUp={handleWorkspaceMouseUp}
      onMouseLeave={handleWorkspaceMouseUp}
    >
      <canvas
        ref={canvasRef}
        className={`whiteboard-canvas ${tool === 'select' ? 'select-mode' : ''}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onClick={handleCanvasClick}
      />

      {/* Render Text, Sticky Notes, Rectangles and Circles in DOM */}
      {elements.map(el => {
        if (el.type === 'line') return null;

        const isSelected = el.id === selectedElementId;
        const style: React.CSSProperties = {
          left: `${el.x}px`,
          top: `${el.y}px`,
          width: `${el.width}px`,
          height: `${el.height}px`,
          zIndex: el.zIndex,
          position: 'absolute'
        };

        if (el.type === 'sticky') {
          style.backgroundColor = el.color;
          style.transform = 'rotate(-1deg)';
        } else if (el.type === 'rectangle') {
          style.border = `3px solid ${el.color}`;
          style.backgroundColor = 'transparent';
        } else if (el.type === 'circle') {
          style.border = `3px solid ${el.color}`;
          style.borderRadius = '50%';
          style.backgroundColor = 'transparent';
        } else if (el.type === 'text') {
          style.border = isSelected ? '1px dashed var(--primary)' : '1px solid transparent';
          style.backgroundColor = 'transparent';
          style.boxShadow = 'none';
        }

        return (
          <div
            key={el.id}
            style={style}
            className={`canvas-element ${el.type} ${isSelected ? 'selected' : ''}`}
            onMouseDown={(e) => handleElementMouseDown(e, el)}
          >
            {(el.type === 'sticky' || el.type === 'text') ? (
              <textarea
                value={el.content}
                onChange={(e) => handleTextChange(el.id, e.target.value)}
                disabled={tool !== 'select'}
                placeholder={el.type === 'sticky' ? 'Напишіть щось...' : 'Введіть текст...'}
              />
            ) : null}

            {isSelected && (
              <div 
                className="element-resize-handle"
                onMouseDown={(e) => handleResizeMouseDown(e, el)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
