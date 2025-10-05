

import { useState, useEffect, useCallback, useRef } from 'react';
import { WindowInstance } from '../types';
import { AUDIO_ASSETS } from '../assets';

// --- Movement Physics ---
// Max speed in pixels per frame.
const MAX_SPEED = 1; 
// How quickly the character reaches max speed. Lower is "floatier". (0 to 1)
const ACCELERATION = 0.1; 
// How quickly the character stops. Higher is more slippery. (0 to 1)
const FRICTION = 0.42;

interface Bounds {
  width: number;
  height: number;
}

export const useCharacterMovement = (bounds: Bounds, initialPosition: { x: number; y: number }, playerSize: { width: number, height: number }) => {
  const [position, setPosition] = useState(initialPosition);
  const keys = useRef<Record<string, boolean>>({});
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();
  const walkingSoundRef = useRef<HTMLAudioElement | null>(null);
  const isMovingRef = useRef(false);

  // Initialize audio once on component mount
  useEffect(() => {
    walkingSoundRef.current = new Audio(AUDIO_ASSETS.walk);
    walkingSoundRef.current.loop = true;
    walkingSoundRef.current.volume = 0.4;
    return () => {
        // Cleanup audio when component unmounts
        walkingSoundRef.current?.pause();
        walkingSoundRef.current = null;
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent browser default actions for arrow keys (scrolling)
    // FIX: Replaced .includes with .indexOf() > -1 for broader compatibility to fix a potential toolchain error.
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(e.key.toLowerCase()) > -1) {
        e.preventDefault();
    }
    keys.current[e.key.toLowerCase()] = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keys.current[e.key.toLowerCase()] = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleKeyDown, handleKeyUp]);

  // Movement logic
  useEffect(() => {
    const gameLoop = () => {
      let dx = 0;
      let dy = 0;

      // Determine movement direction
      if (keys.current['w'] || keys.current['arrowup']) dy -= 1;
      if (keys.current['s'] || keys.current['arrowdown']) dy += 1;
      if (keys.current['a'] || keys.current['arrowleft']) dx -= 1;
      if (keys.current['d'] || keys.current['arrowright']) dx += 1;

      // Normalize diagonal movement to prevent faster speed
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0) {
        dx = (dx / length);
        dy = (dy / length);
      }

      // Target velocity
      const targetVX = dx * MAX_SPEED;
      const targetVY = dy * MAX_SPEED;

      // Smoothly approach target velocity (acceleration)
      velocity.current.x += (targetVX - velocity.current.x) * ACCELERATION;
      velocity.current.y += (targetVY - velocity.current.y) * ACCELERATION;

      // Apply friction if there's no input in that axis
      if (dx === 0) {
        velocity.current.x *= FRICTION;
      }
      if (dy === 0) {
        velocity.current.y *= FRICTION;
      }

      // Stop movement if velocity is negligible to prevent endless tiny movements
      if (Math.abs(velocity.current.x) < 0.01) velocity.current.x = 0;
      if (Math.abs(velocity.current.y) < 0.01) velocity.current.y = 0;

      // Handle walking sound based on velocity
      const isCurrentlyMoving = Math.abs(velocity.current.x) > 0.05 || Math.abs(velocity.current.y) > 0.05;

      if (isCurrentlyMoving && !isMovingRef.current) {
        walkingSoundRef.current?.play().catch(e => console.error("Audio play failed. User interaction might be required first.", e));
        isMovingRef.current = true;
      } else if (!isCurrentlyMoving && isMovingRef.current) {
        walkingSoundRef.current?.pause();
        if (walkingSoundRef.current) {
          walkingSoundRef.current.currentTime = 0;
        }
        isMovingRef.current = false;
      }

      setPosition(prev => {
        let newX = prev.x + velocity.current.x;
        let newY = prev.y + velocity.current.y;

        // Clamp position within bounds
        newX = Math.max(0, Math.min(bounds.width - playerSize.width, newX));
        newY = Math.max(0, Math.min(bounds.height - playerSize.height, newY));
        
        // No need to update if position hasn't changed
        if (prev.x === newX && prev.y === newY) {
            return prev;
        }

        return { x: newX, y: newY };
      });
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [bounds, playerSize.width, playerSize.height]);

  return { position, velocity, setPosition };
};
