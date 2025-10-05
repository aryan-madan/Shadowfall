import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useMovement, Collider } from '../hooks/useCharacterMovement';
import { LOCATIONS } from './desktop/Apps';
import { PLAYER_SPRITES, LAPTOP_IMAGE, CAFE_BACKGROUND_IMAGE, EXIT_PORTAL_IMAGE, APARTMENT_BACKGROUND_IMAGE, playSound } from '../assets';

const PLAYER_SIZE = { width: 48, height: 64 };

const SCENE_SIZES = {
    office: { width: 180, height: 192 },
    cafe: { width: 640, height: 360 },
    default: { width: 1200, height: 1200 }
};

const ZOOM = 5;

const INTERACTABLES = {
    office: {
        laptop: { x: (180 / 2) + 40.5, y: 51.5, width: 24, height: 20 },
        exit: { x: (180 / 2) - 45, y: 192 - 10, width: 0, height: 0 }
    },
    cafe: {
        laptop: { x: 290, y: 240, width: 24, height: 20 },
        exit: { x: 1200 - 64 * 2, y: 800 - 64 - 50, width: 64, height: 64 }
    }
};

const COLLIDERS: Record<string, Collider[]> = {
    office: [
        { x: 90, y: 50, width: 80, height: 50 },
        { x: 20, y: 60, width: 70, height: 80 },
    ],
    cafe: [
        { x: 850, y: 0, width: 350, height: 500 }, { x: 0, y: 200, width: 300, height: 500 },
        { x: 450, y: 250, width: 150, height: 100 }, { x: 450, y: 550, width: 150, height: 100 },
    ],
    default: [],
};

interface WorldProps {
  onAccessComputer: () => void;
  onClueFound: (clueId: string) => void;
  onOpenTravel: () => void;
  locationId: string;
  story: number;
}


const World: React.FC<WorldProps> = ({ onAccessComputer, onClueFound, onOpenTravel, locationId, story }) => {
  const container = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const location = LOCATIONS[locationId];
  const [isLoaded, setIsLoaded] = useState(false);
  const [showColliders, setShowColliders] = useState(false);
  
  const sceneSize = useMemo(() => SCENE_SIZES[location?.worldType as keyof typeof SCENE_SIZES] || SCENE_SIZES.default, [location]);
  const colliders = useMemo(() => COLLIDERS[location?.worldType as keyof typeof COLLIDERS] || [], [location]);

  const initialPos = useMemo(() => ({
    x: sceneSize.width / 2 - PLAYER_SIZE.width / 2,
    y: sceneSize.height - PLAYER_SIZE.height - 20,
  }), [sceneSize]);

  const { pos: charPos, vel: charVel, setPos: setCharPos } = useMovement(sceneSize, initialPos, PLAYER_SIZE, colliders);
  const [anim, setAnim] = useState('idle');
  
  const [cameraPos, setCameraPos] = useState(initialPos);
  const charPosRef = useRef(charPos);
  const cameraFrame = useRef<number>();
  
  useEffect(() => {
    setIsLoaded(false);
    const timer = setTimeout(() => {
      if (container.current) setViewport({ width: container.current.clientWidth, height: container.current.clientHeight });
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [locationId]);

  useEffect(() => { setCharPos(initialPos); setCameraPos(initialPos); }, [locationId, initialPos, setCharPos]);
  useEffect(() => { charPosRef.current = charPos; }, [charPos]);

  useEffect(() => {
    function updateAnim() {
        const vel = charVel.current;
        let newAnim = 'idle';
        if (Math.abs(vel.x) > 0.1 || Math.abs(vel.y) > 0.1) {
            const angle = Math.atan2(vel.y, vel.x) * 180 / Math.PI;
            if (angle >= -22.5 && angle < 22.5) newAnim = 'right';
            else if (angle >= 22.5 && angle < 67.5) newAnim = 'bottomright';
            else if (angle >= 67.5 && angle < 112.5) newAnim = 'down';
            else if (angle >= 112.5 && angle < 157.5) newAnim = 'bottomleft';
            else if (angle >= 157.5 || angle < -157.5) newAnim = 'left';
            else if (angle >= -157.5 && angle < -112.5) newAnim = 'topleft';
            else if (angle >= -112.5 && angle < -67.5) newAnim = 'up';
            else if (angle >= -67.5 && angle < -22.5) newAnim = 'topright';
        }
        if (anim !== newAnim) setAnim(newAnim);
    }
    const id = setInterval(updateAnim, 50);
    return () => clearInterval(id);
  }, [charVel, anim]);
  
  useEffect(() => {
    const SMOOTHING = 0.08;
    const updateCam = () => {
      setCameraPos(p => {
        const target = charPosRef.current;
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return (p.x !== target.x || p.y !== target.y) ? target : p;
        return { x: p.x + dx * SMOOTHING, y: p.y + dy * SMOOTHING };
      });
      cameraFrame.current = requestAnimationFrame(updateCam);
    };
    cameraFrame.current = requestAnimationFrame(updateCam);
    return () => { if (cameraFrame.current) cancelAnimationFrame(cameraFrame.current); };
  }, []);

  useLayoutEffect(() => {
    const updateViewport = () => {
      if (container.current) setViewport({ width: container.current.clientWidth, height: container.current.clientHeight });
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);
  
  useEffect(() => {
    const onDebug = (e: KeyboardEvent) => { if (e.key === '`') setShowColliders(p => !p); };
    window.addEventListener('keydown', onDebug);
    return () => window.removeEventListener('keydown', onDebug);
  }, []);
  
  const interactables = useMemo(() => {
    if (!location || !location.worldType) return null;
    return INTERACTABLES[location.worldType as keyof typeof INTERACTABLES] || {};
  }, [location]);

  const activeInteraction = useMemo(() => {
    if (!interactables || !location || !location.worldType) return null;
    const pX = charPos.x + PLAYER_SIZE.width / 2;
    const pY = charPos.y + PLAYER_SIZE.height / 2;
    const isClose = (tx: number, ty: number, tw: number, th: number, thresh: number) => Math.sqrt(Math.pow(pX - (tx + tw/2), 2) + Math.pow(pY - (ty + th/2), 2)) < thresh;

    if ('laptop' in interactables && interactables.laptop && isClose(interactables.laptop.x, interactables.laptop.y, interactables.laptop.width, interactables.laptop.height, 60)) {
        if (location.worldType === 'office') return { type: 'laptop', text: 'Press [E] to access' };
        if (location.worldType === 'cafe') return { type: 'terminal_cafe', text: 'Press [E] to interact' };
    }
    if ('exit' in interactables && interactables.exit && isClose(interactables.exit.x, interactables.exit.y, interactables.exit.width, interactables.exit.height, 60)) return { type: 'fast_travel', text: 'Press [E] to Fast Travel' };
    return null;
  }, [charPos, interactables, location]);

  useEffect(() => {
    if (activeInteraction) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'e') {
          if (activeInteraction.type === 'fast_travel') { playSound('rpg_portal', 0.7); onOpenTravel(); }
          else {
            playSound('rpg_interact', 0.7);
            if (activeInteraction.type === 'laptop') onAccessComputer();
            if (activeInteraction.type === 'terminal_cafe') onClueFound('cafe_terminal');
          }
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [activeInteraction, onAccessComputer, onClueFound, onOpenTravel]);
  
  const sceneTransform = useMemo(() => {
    if (viewport.width === 0) return { transform: `translate3d(0px, 0px, 0) scale(${ZOOM})` };
    const scaledW = sceneSize.width * ZOOM;
    const scaledH = sceneSize.height * ZOOM;
    let tx, ty;
    if (scaledW <= viewport.width) tx = (viewport.width - scaledW) / 2;
    else tx = Math.max(viewport.width - scaledW, Math.min(0, viewport.width / 2 - (cameraPos.x + PLAYER_SIZE.width / 2) * ZOOM));
    if (scaledH <= viewport.height) ty = (viewport.height - scaledH) / 2;
    else ty = Math.max(viewport.height - scaledH, Math.min(0, viewport.height / 2 - (cameraPos.y + PLAYER_SIZE.height / 2) * ZOOM));
    return { transform: `translate3d(${tx}px, ${ty}px, 0) scale(${ZOOM})` };
  }, [cameraPos, viewport, sceneSize]);

  const sprite = useMemo(() => PLAYER_SPRITES[anim as keyof typeof PLAYER_SPRITES] || PLAYER_SPRITES.idle, [anim]);

  if (!isLoaded || viewport.width === 0 || !interactables || !location) {
    return <div ref={container} className="absolute inset-0 bg-[#0a0f18] flex items-center justify-center text-cyan-300">Loading Scene...</div>;
  }
  
  const bgStyle = () => {
    switch (location.worldType) {
        case 'office': return { backgroundImage: `url(${APARTMENT_BACKGROUND_IMAGE})` };
        case 'cafe': return { backgroundImage: `url(${CAFE_BACKGROUND_IMAGE})` };
        default: return { backgroundColor: '#0a0f18' };
    }
  }

  const renderObj = (obj: any, asset: string, alt: string, className: string) => obj ? <img src={asset} alt={alt} className={`absolute ${className}`} style={{ left: obj.x, top: obj.y, width: obj.width, height: obj.height }} /> : null;

  return (
    <div ref={container} className="absolute inset-0 overflow-hidden select-none bg-[#0a0f18]" style={{ animation: 'fadeIn 0.5s ease-in-out', imageRendering: 'pixelated' }}>
        <div className="absolute top-0 left-0" style={{ ...sceneTransform, width: sceneSize.width, height: sceneSize.height, transformOrigin: 'top left', backgroundSize: 'cover', backgroundPosition: 'center', ...bgStyle() }}>
            {renderObj((interactables as any).laptop, LAPTOP_IMAGE, 'Computer', 'laptop-glow')}
            {renderObj((interactables as any).exit, EXIT_PORTAL_IMAGE, 'Exit Portal', 'portal-glow')}
            <div className="absolute" style={{ left: charPos.x, top: charPos.y, width: PLAYER_SIZE.width, height: PLAYER_SIZE.height }}>
                <img src={sprite} alt="Player" className="pixel-art w-full h-full" />
                {showColliders && <div className="absolute bg-yellow-400" style={{ left: PLAYER_SIZE.width / 2 - 2, top: PLAYER_SIZE.height - 8 - 2, width: 4, height: 4, zIndex: 1001 }} />}
            </div>
            {showColliders && colliders.map((c, i) => ( <div key={`c-${i}`} className="absolute" style={{ left: c.x, top: c.y, width: c.width, height: c.height, backgroundColor: 'rgba(255, 0, 0, 0.4)', border: '1px solid #ff0000', zIndex: 1000 }} /> ))}
        </div>
        <div className="absolute top-4 left-4 text-cyan-200 bg-black/50 p-2 rounded z-10 text-lg">LOCATION: {location.name}</div>
        {showColliders && <div className="absolute top-14 left-4 text-red-500 bg-black/50 p-2 rounded z-10 text-lg font-bold">COLLISION DEBUG (`~`)</div>}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-cyan-300 z-10">
            {activeInteraction && (<p className="mt-2 text-3xl font-bold bg-cyan-500 text-black px-4 py-1 rounded animate-pulse">{activeInteraction.text}</p>)}
        </div>
        <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes screenGlow{0%,100%{box-shadow:0 0 8px 3px rgba(34,211,238,0.5)}50%{box-shadow:0 0 12px 5px rgba(34,211,238,0.7)}}.laptop-glow{animation:screenGlow 3s infinite ease-in-out}@keyframes terminalGlow{0%,100%{box-shadow:0 0 8px 3px rgba(239,68,68,0.5);filter:brightness(1)}50%{box-shadow:0 0 12px 5px rgba(239,68,68,0.7);filter:brightness(1.2)}}.terminal-glow{animation:terminalGlow 2.5s infinite ease-in-out}@keyframes portalGlow{0%,100%{filter:drop-shadow(0 0 10px #0ff) drop-shadow(0 0 2px #fff)}50%{filter:drop-shadow(0 0 20px #0ff) drop-shadow(0 0 5px #fff)}}.portal-glow{animation:portalGlow 2.5s infinite ease-in-out}`}</style>
    </div>
  );
};

export default World;