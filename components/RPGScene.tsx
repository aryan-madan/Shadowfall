

import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useCharacterMovement } from '../hooks/useCharacterMovement';
import { ALL_LOCATIONS, LocationDefinition } from './desktop/Apps';
import { PLAYER_GIFS, LAPTOP_ASSET, WAREHOUSE_BG_ASSET, TERMINAL_INTERACT_ASSET, CAFE_BG_ASSET, CAFE_PC_ASSET, PORTAL_ASSET, WORLD_HUB_BG_ASSET, FBI_HQ_BG_ASSET, DATACENTER_BG_ASSET, MAINFRAME_ASSET } from '../assets';

// Player Assets
const PLAYER_SPRITE_SIZE = { width: 48, height: 64 };


const SCENE_SIZES = {
    office: { width: 360, height: 360 },
    warehouse: { width: 1600, height: 900 },
    cafe: { width: 1200, height: 800 },
    hub: { width: 1200, height: 1200 },
    datacenter: { width: 1600, height: 900 },
    default: { width: 1200, height: 1200 }
};

const ZOOM_LEVEL = 5;

interface RPGSceneProps {
  onAccessLaptop: () => void;
  onFindClue: (clueId: string) => void;
  onNavigate: (locationId: string) => void;
  locationId: string;
  storyProgress: number;
}


const RPGScene: React.FC<RPGSceneProps> = ({ onAccessLaptop, onFindClue, onNavigate, locationId, storyProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportBounds, setViewportBounds] = useState({ width: 0, height: 0 });
  const location = ALL_LOCATIONS[locationId];
  const [isSceneReady, setIsSceneReady] = useState(false);

  const sceneSize = useMemo(() => {
    return SCENE_SIZES[location?.sceneType || 'default'] || SCENE_SIZES.default;
  }, [location]);

  const initialPosition = useMemo(() => ({
    x: sceneSize.width / 2 - PLAYER_SPRITE_SIZE.width / 2,
    y: sceneSize.height - PLAYER_SPRITE_SIZE.height - 20,
  }), [sceneSize]);

  const { position, velocity, setPosition: setPlayerPosition } = useCharacterMovement(sceneSize, initialPosition, PLAYER_SPRITE_SIZE);
  const [characterState, setCharacterState] = useState('idle');

  const [cameraPosition, setCameraPosition] = useState(initialPosition);
  const playerPositionRef = useRef(position);
  const animationFrameId = useRef<number>();
  
  // force a re-render shortly after the component mounts or the location changes
  // helps resolve timing issues where scene elements are misaligned on the initial paint
  useEffect(() => {
    setIsSceneReady(false);
    const timer = setTimeout(() => {
      // re-measure bounds just in case the layout shifted (works ig js re render)
      if (containerRef.current) {
        setViewportBounds({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
      setIsSceneReady(true);
    }, 50); //
    return () => clearTimeout(timer);
  }, [locationId]);

  useEffect(() => {
    setPlayerPosition(initialPosition);
    setCameraPosition(initialPosition);
  }, [locationId, initialPosition, setPlayerPosition]);


  useEffect(() => {
    playerPositionRef.current = position;
  }, [position]);

  // Character animation state logic
  useEffect(() => {
    // FIX: changed arrow function to a function declaration to resolve a potential toolchain error
    function determineState() {
        const vel = velocity.current;
        const threshold = 0.1;
        let newState = 'idle';

        if (Math.abs(vel.x) > threshold || Math.abs(vel.y) > threshold) {
            const angle = Math.atan2(vel.y, vel.x) * 180 / Math.PI;

            if (angle >= -22.5 && angle < 22.5) newState = 'right';
            else if (angle >= 22.5 && angle < 67.5) newState = 'bottomright';
            else if (angle >= 67.5 && angle < 112.5) newState = 'down';
            else if (angle >= 112.5 && angle < 157.5) newState = 'bottomleft';
            else if (angle >= 157.5 || angle < -157.5) newState = 'left';
            else if (angle >= -157.5 && angle < -112.5) newState = 'topleft';
            else if (angle >= -112.5 && angle < -67.5) newState = 'up';
            else if (angle >= -67.5 && angle < -22.5) newState = 'topright';
        }
        
        if (characterState !== newState) {
            setCharacterState(newState);
        }
    }
    const id = setInterval(determineState, 50); // Check state periodically
    return () => clearInterval(id);
  }, [velocity, characterState]);
  
  // Camera smoothing loop
  useEffect(() => {
    const LERP_FACTOR = 0.08; // smoothing factor, lower is smoother

    const updateCamera = () => {
      setCameraPosition(prevCamPos => {
        const targetPos = playerPositionRef.current;
        const dx = targetPos.x - prevCamPos.x;
        const dy = targetPos.y - prevCamPos.y;

        // If camera is very close, snap to final position to stop updates.
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
          if (prevCamPos.x !== targetPos.x || prevCamPos.y !== targetPos.y) {
            return targetPos;
          }
          return prevCamPos; // no change needed
        }

        // interpolate the camera position
        const newX = prevCamPos.x + dx * LERP_FACTOR;
        const newY = prevCamPos.y + dy * LERP_FACTOR;
        
        return { x: newX, y: newY };
      });
      
      animationFrameId.current = requestAnimationFrame(updateCamera);
    };

    animationFrameId.current = requestAnimationFrame(updateCamera);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); // Empty array ensures the loop is set up only once.

  useLayoutEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        setViewportBounds({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);
  
  const scenePositions = useMemo(() => {
    if (!location || !location.sceneType) return null;
    const portalSize = { width: 64, height: 64 };
    
    switch (location.sceneType) {
        case 'office': {
            const laptopWidth = 48; const laptopHeight = 48;
            return {
              laptop: { x: 250, y: 160, width: laptopWidth, height: laptopHeight },
              exit: { x: 60, y: 160, ...portalSize }
            };
        }
        case 'warehouse': {
            const terminalWidth = 32; const terminalHeight = 32;
            return {
                terminal: { x: sceneSize.width - terminalWidth - 100, y: 200, width: terminalWidth, height: terminalHeight },
                exit: { x: portalSize.width, y: sceneSize.height / 2 - portalSize.height / 2, ...portalSize }
            }
        }
        case 'cafe': {
            const terminalWidth = 48; const terminalHeight = 48;
            return {
                terminal: { x: 150, y: 350, width: terminalWidth, height: terminalHeight },
                exit: { x: sceneSize.width - portalSize.width * 2, y: sceneSize.height - portalSize.height - 50, ...portalSize }
            }
        }
        case 'datacenter': {
            const mainframeWidth = 128; const mainframeHeight = 128;
            return {
                mainframe: { x: sceneSize.width / 2 - mainframeWidth / 2, y: 250, width: mainframeWidth, height: mainframeHeight },
                exit: { x: portalSize.width, y: sceneSize.height - portalSize.height * 2, ...portalSize }
            }
        }
        case 'hub': {
            const portals: (LocationDefinition & {pos: {x:number, y:number}})[] = [];
            const availableLocations = Object.values(ALL_LOCATIONS).filter(l => l.id !== 'world_map' && storyProgress >= l.unlockedAt);
            const numPortals = availableLocations.length;
            const radiusX = sceneSize.width * 0.35;
            const radiusY = sceneSize.height * 0.25;
            const centerX = sceneSize.width / 2;
            const centerY = sceneSize.height / 2;

            availableLocations.forEach((loc, i) => {
                const angle = (i / numPortals) * 2 * Math.PI;
                portals.push({
                    ...loc,
                    pos: {
                        x: centerX + radiusX * Math.cos(angle) - portalSize.width / 2,
                        y: centerY + radiusY * Math.sin(angle) - portalSize.height / 2,
                    }
                });
            });
            return { portals, portalSize };
        }
        default: return {};
    }
  }, [sceneSize, location, storyProgress]);

  const interaction = useMemo(() => {
    if (!scenePositions || !location || !location.sceneType) return null;

    const playerCenterX = position.x + PLAYER_SPRITE_SIZE.width / 2;
    const playerCenterY = position.y + PLAYER_SPRITE_SIZE.height / 2;
    
    const checkProximity = (targetX: number, targetY: number, targetW: number, targetH: number, threshold: number) => {
        const targetCenterX = targetX + targetW / 2;
        const targetCenterY = targetY + targetH / 2;
        const distance = Math.sqrt(Math.pow(playerCenterX - targetCenterX, 2) + Math.pow(playerCenterY - targetCenterY, 2));
        return distance < threshold;
    }

    if (scenePositions.laptop && checkProximity(scenePositions.laptop.x, scenePositions.laptop.y, scenePositions.laptop.width, scenePositions.laptop.height, 60)) {
        return { type: 'laptop', text: 'Press [E] to access' };
    }
    
    if (scenePositions.terminal && checkProximity(scenePositions.terminal.x, scenePositions.terminal.y, scenePositions.terminal.width, scenePositions.terminal.height, 60)) {
        const type = location.sceneType === 'warehouse' ? 'terminal_warehouse' : 'terminal_cafe';
        const text = location.sceneType === 'warehouse' ? 'Press [E] to interact' : 'Press [E] to access PC';
        return { type, text };
    }
    
    if (scenePositions.mainframe && checkProximity(scenePositions.mainframe.x, scenePositions.mainframe.y, scenePositions.mainframe.width, scenePositions.mainframe.height, 80)) {
        return { type: 'mainframe', text: 'Press [E] to connect to the core' };
    }

    if (scenePositions.exit && checkProximity(scenePositions.exit.x, scenePositions.exit.y, scenePositions.exit.width, scenePositions.exit.height, 60)) {
        return { type: 'portal', text: 'Press [E] to enter World Map', destination: 'world_map' };
    }

    if (location.sceneType === 'hub' && scenePositions.portals) {
        for (const portal of scenePositions.portals) {
            if (checkProximity(portal.pos.x, portal.pos.y, scenePositions.portalSize.width, scenePositions.portalSize.height, 60)) {
                return { type: 'portal', text: `Press [E] to travel to ${portal.name}`, destination: portal.id };
            }
        }
    }

    return null;
  }, [position, scenePositions, location]);

  useEffect(() => {
    if (interaction) {
      const handleInteract = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'e') {
          if (interaction.type === 'laptop') onAccessLaptop();
          if (interaction.type === 'terminal_warehouse') onFindClue('warehouse_terminal');
          if (interaction.type === 'terminal_cafe') onFindClue('cafe_terminal');
          if (interaction.type === 'mainframe') onFindClue('europa_mainframe');
          if (interaction.type === 'portal') onNavigate(interaction.destination);
        }
      };
      window.addEventListener('keydown', handleInteract);
      return () => window.removeEventListener('keydown', handleInteract);
    }
  }, [interaction, onAccessLaptop, onFindClue, onNavigate]);
  
  const sceneTransform = useMemo(() => {
    if (viewportBounds.width === 0) {
      return { transform: `translate3d(0px, 0px, 0) scale(${ZOOM_LEVEL})` };
    }

    const cameraCenterX = cameraPosition.x + PLAYER_SPRITE_SIZE.width / 2;
    const cameraCenterY = cameraPosition.y + PLAYER_SPRITE_SIZE.height / 2;

    let targetX = viewportBounds.width / 2 - cameraCenterX * ZOOM_LEVEL;
    let targetY = viewportBounds.height / 2 - cameraCenterY * ZOOM_LEVEL;

    const minX = viewportBounds.width - sceneSize.width * ZOOM_LEVEL;
    const minY = viewportBounds.height - sceneSize.height * ZOOM_LEVEL;
    const maxX = 0;
    const maxY = 0;

    const finalX = Math.max(minX, Math.min(maxX, targetX));
    const finalY = Math.max(minY, Math.min(maxY, targetY));

    return {
      transform: `translate3d(${finalX}px, ${finalY}px, 0) scale(${ZOOM_LEVEL})`,
    };
  }, [cameraPosition, viewportBounds, sceneSize]);

  const currentGif = useMemo(() => {
    return PLAYER_GIFS[characterState as keyof typeof PLAYER_GIFS] || PLAYER_GIFS.idle;
  }, [characterState]);

  if (!isSceneReady || viewportBounds.width === 0 || !scenePositions || !location) {
    return <div ref={containerRef} className="absolute inset-0 bg-[#0a0f18] flex items-center justify-center text-cyan-300">Loading Scene...</div>;
  }
  
  const sceneStyle = () => {
    switch (location.sceneType) {
        case 'office':
            return { 
                backgroundImage: `url(${FBI_HQ_BG_ASSET})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            };
        case 'warehouse':
            return {
                backgroundImage: `url(${WAREHOUSE_BG_ASSET}), radial-gradient(ellipse at 50% 50%, #1a1a1a 40%, black 100%)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            };
        case 'cafe':
            return {
                backgroundImage: `url(${CAFE_BG_ASSET})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }
        case 'hub':
            return {
                backgroundImage: `url(${WORLD_HUB_BG_ASSET})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }
        case 'datacenter':
            return {
                backgroundImage: `url(${DATACENTER_BG_ASSET})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }
        default:
            return { backgroundColor: '#0a0f18' };
    }
  }

  return (
    <div 
        ref={containerRef} 
        className="absolute inset-0 overflow-hidden select-none bg-[#0a0f18]"
        style={{ animation: 'fadeIn 0.5s ease-in-out', imageRendering: 'pixelated' }}
    >
        <div
            className="absolute top-0 left-0"
            style={{ 
                ...sceneTransform,
                width: sceneSize.width,
                height: sceneSize.height,
                transformOrigin: 'top left',
                ...sceneStyle()
            }}
        >
            {/* Scene specific items */}
            {location.sceneType === 'office' && scenePositions.laptop && (
                <>
                    {/* Desk is now part of the background image */}
                    <img src={LAPTOP_ASSET} alt="Laptop" className="absolute laptop-glow" style={{ left: scenePositions.laptop.x, top: scenePositions.laptop.y, width: scenePositions.laptop.width, height: scenePositions.laptop.height }} />
                </>
            )}
            {location.sceneType === 'warehouse' && scenePositions.terminal && (
                <img src={TERMINAL_INTERACT_ASSET} alt="Terminal" className="absolute terminal-glow" style={{ left: scenePositions.terminal.x, top: scenePositions.terminal.y, width: scenePositions.terminal.width, height: scenePositions.terminal.height }} />
            )}
            {location.sceneType === 'cafe' && scenePositions.terminal && (
                <img src={CAFE_PC_ASSET} alt="Cyber Cafe PC" className="absolute laptop-glow" style={{ left: scenePositions.terminal.x, top: scenePositions.terminal.y, width: scenePositions.terminal.width, height: scenePositions.terminal.height }} />
            )}
            {location.sceneType === 'datacenter' && scenePositions.mainframe && (
                <img src={MAINFRAME_ASSET} alt="Mainframe" className="absolute terminal-glow" style={{ left: scenePositions.mainframe.x, top: scenePositions.mainframe.y, width: scenePositions.mainframe.width, height: scenePositions.mainframe.height }} />
            )}

            {/* Portals and Exits */}
            {scenePositions.exit && (
                <img src={PORTAL_ASSET} alt="Exit Portal" className="absolute portal-glow" style={{ left: scenePositions.exit.x, top: scenePositions.exit.y, width: scenePositions.exit.width, height: scenePositions.exit.height }} />
            )}
            {location.sceneType === 'hub' && scenePositions.portals?.map(portal => (
                <div key={portal.id} className="absolute" style={{ left: portal.pos.x, top: portal.pos.y }}>
                    <img src={PORTAL_ASSET} alt={`Portal to ${portal.name}`} className="portal-glow" style={{ width: scenePositions.portalSize.width, height: scenePositions.portalSize.height }}/>
                    <div className="text-center w-full absolute -bottom-5 text-cyan-200 text-base font-bold" style={{ textShadow: '0 0 5px black' }}>{portal.name}</div>
                </div>
            ))}
            
            {/* Player */}
            <div className="absolute" style={{ left: position.x, top: position.y, width: PLAYER_SPRITE_SIZE.width, height: PLAYER_SPRITE_SIZE.height }}>
                <img 
                    src={currentGif}
                    alt="Player character"
                    className="pixelated w-full h-full"
                />
            </div>
        </div>
        
        <div className="absolute top-4 left-4 text-cyan-200 bg-black/50 p-2 rounded z-10 text-lg">
            LOCATION: {location.name}
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-cyan-300 z-10">
            {interaction && (
                <p className="mt-2 text-3xl font-bold bg-cyan-500 text-black px-4 py-1 rounded animate-pulse">
                    {interaction.text}
                </p>
            )}
        </div>
        <style>
        {`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes screenGlow {
                0%, 100% { box-shadow: 0 0 8px 3px rgba(34, 211, 238, 0.5); }
                50% { box-shadow: 0 0 12px 5px rgba(34, 211, 238, 0.7); }
            }
            .laptop-glow {
                animation: screenGlow 3s infinite ease-in-out;
            }
            @keyframes terminalGlow {
                0%, 100% { box-shadow: 0 0 8px 3px rgba(239, 68, 68, 0.5); filter: brightness(1); }
                50% { box-shadow: 0 0 12px 5px rgba(239, 68, 68, 0.7); filter: brightness(1.2); }
            }
            .terminal-glow {
                animation: terminalGlow 2.5s infinite ease-in-out;
            }
            @keyframes portalGlow {
                0%, 100% { filter: drop-shadow(0 0 10px #0ff) drop-shadow(0 0 2px #fff); }
                50% { filter: drop-shadow(0 0 20px #0ff) drop-shadow(0 0 5px #fff); }
            }
            .portal-glow {
                animation: portalGlow 2.5s infinite ease-in-out;
            }
        `}
        </style>
    </div>
  );
};

export default RPGScene;
