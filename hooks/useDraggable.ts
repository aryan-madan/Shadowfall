import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WindowInstance } from '../types';

interface DragProps {
  id: string;
  initialPos: { x: number; y: number };
  setWindows: React.Dispatch<React.SetStateAction<WindowInstance[]>>;
}

export const useDrag = ({ id, initialPos, setWindows }: DragProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const windowStart = useRef({ x: initialPos.x, y: initialPos.y });

  const onDragStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStart.current = { x: event.clientX, y: event.clientY };
    
    setWindows(prev => {
        const win = prev.find(w => w.id === id);
        if (win) windowStart.current = win.pos;
        return prev;
    });

  }, [id, setWindows]);

  const onDrag = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    
    setWindows(prev =>
      prev.map(w =>
        w.id === id ? { ...w, pos: { x: windowStart.current.x + dx, y: windowStart.current.y + dy } } : w
      )
    );
  }, [isDragging, id, setWindows]);

  const onDragEnd = useCallback(() => { setIsDragging(false); }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', onDragEnd);
    }
    return () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onDragEnd);
    };
  }, [isDragging, onDrag, onDragEnd]);

  return { onDragStart, isDragging };
};