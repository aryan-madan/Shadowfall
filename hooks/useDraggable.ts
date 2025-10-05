
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WindowInstance } from '../types';

interface UseDraggableProps {
  id: string;
  initialPosition: { x: number; y: number };
  setWindows: React.Dispatch<React.SetStateAction<WindowInstance[]>>;
}

export const useDraggable = ({ id, initialPosition, setWindows }: UseDraggableProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: initialPosition.x, y: initialPosition.y });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    setWindows(prevWindows => {
        const currentWindow = prevWindows.find(w => w.id === id);
        if (currentWindow) {
            windowStartPos.current = currentWindow.position;
        }
        return prevWindows;
    });

  }, [id, setWindows]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    setWindows(prevWindows =>
      prevWindows.map(w =>
        w.id === id
          ? { ...w, position: { x: windowStartPos.current.x + dx, y: windowStartPos.current.y + dy } }
          : w
      )
    );
  }, [isDragging, id, setWindows]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return { handleMouseDown, isDragging };
};
