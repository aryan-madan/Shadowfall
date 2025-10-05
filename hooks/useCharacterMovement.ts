import { useState, useEffect, useCallback, useRef } from 'react';
import { SFX } from '../assets';

const MAX_SPEED = 1; 
const ACCEL = 0.1; 
const FRICTION = 0.42;

interface Bounds {
  width: number;
  height: number;
}

export interface Collider {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useMovement = (bounds: Bounds, initialPos: { x: number; y: number }, size: { width: number, height: number }, colliders: Collider[]) => {
  const [pos, setPos] = useState(initialPos);
  const keys = useRef<Record<string, boolean>>({});
  const vel = useRef({ x: 0, y: 0 });
  const loopId = useRef<number>();
  const walkSfx = useRef<HTMLAudioElement | null>(null);
  const isMoving = useRef(false);

  useEffect(() => {
    walkSfx.current = new Audio(SFX.walk);
    walkSfx.current.loop = true;
    walkSfx.current.volume = 0.4;
    return () => {
        walkSfx.current?.pause();
        walkSfx.current = null;
    }
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
    keys.current[e.key.toLowerCase()] = true;
  }, []);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    keys.current[e.key.toLowerCase()] = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (loopId.current) cancelAnimationFrame(loopId.current);
    };
  }, [onKeyDown, onKeyUp]);

  useEffect(() => {
    const update = () => {
      let dx = 0;
      let dy = 0;

      if (keys.current['w'] || keys.current['arrowup']) dy -= 1;
      if (keys.current['s'] || keys.current['arrowdown']) dy += 1;
      if (keys.current['a'] || keys.current['arrowleft']) dx -= 1;
      if (keys.current['d'] || keys.current['arrowright']) dx += 1;

      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) { dx /= len; dy /= len; }

      const targetVelX = dx * MAX_SPEED;
      const targetVelY = dy * MAX_SPEED;

      vel.current.x += (targetVelX - vel.current.x) * ACCEL;
      vel.current.y += (targetVelY - vel.current.y) * ACCEL;

      if (dx === 0) vel.current.x *= FRICTION;
      if (dy === 0) vel.current.y *= FRICTION;

      if (Math.abs(vel.current.x) < 0.01) vel.current.x = 0;
      if (Math.abs(vel.current.y) < 0.01) vel.current.y = 0;

      const movingNow = Math.abs(vel.current.x) > 0.05 || Math.abs(vel.current.y) > 0.05;

      if (movingNow && !isMoving.current) {
        walkSfx.current?.play().catch(e => {});
        isMoving.current = true;
      } else if (!movingNow && isMoving.current) {
        walkSfx.current?.pause();
        if (walkSfx.current) walkSfx.current.currentTime = 0;
        isMoving.current = false;
      }

      setPos(prev => {
        let newX = prev.x;
        let newY = prev.y;

        const nextX = prev.x + vel.current.x;
        const nextY = prev.y + vel.current.y;

        const checkCollision = (x: number, y: number): boolean => {
            const checkX = Math.floor(x + size.width / 2);
            const checkY = Math.floor(y + size.height - 8);

            for (const c of colliders) {
                if (checkX >= c.x && checkX <= c.x + c.width && checkY >= c.y && checkY <= c.y + c.height) return true;
            }
            return false;
        };

        if (!checkCollision(nextX, prev.y)) newX = nextX;
        if (!checkCollision(newX, nextY)) newY = nextY;

        newX = Math.max(0, Math.min(bounds.width - size.width, newX));
        newY = Math.max(0, Math.min(bounds.height - size.height, newY));
        
        if (prev.x === newX && prev.y === newY) return prev;
        return { x: newX, y: newY };
      });
      loopId.current = requestAnimationFrame(update);
    };

    loopId.current = requestAnimationFrame(update);
    return () => { if (loopId.current) cancelAnimationFrame(loopId.current); };
  }, [bounds, size.width, size.height, colliders]);

  return { pos, vel, setPos };
};