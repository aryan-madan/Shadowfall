

import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useCharacterMovement } from '../hooks/useCharacterMovement';
import { ALL_LOCATIONS, LocationDefinition } from './desktop/Apps';
import { PLAYER_GIFS, LAPTOP_ASSET, WAREHOUSE_BG_ASSET, TERMINAL_INTERACT_ASSET, CAFE_BG_ASSET, CAFE_PC_ASSET, PORTAL_ASSET, WORLD_HUB_BG_ASSET, FBI_HQ_BG_ASSET, DATACENTER_BG_ASSET, MAINFRAME_ASSET, playSound } from '../assets';

// --- SCENE CONFIGURATION ---

// Player sprite size (don't change unless you change the asset)
const PLAYER_SPRITE_SIZE = { width: 48, height: 64 };

// Scene dimensions (in pixels)
const SCENE_SIZES = {
    office: { width: 180, height: 192 },
    warehouse: { width: 1600, height: 900 },
    cafe: { width: 1200, height: 800 },
    hub: { width: 1200, height: 1200 },
    datacenter: { width: 1600, height: 900 },
    default: { width: 1200, height: 1200 }
};

// Zoom level of the camera
const ZOOM_LEVEL = 5;

// To edit the position of items like laptops, terminals, or portals,
// simply adjust the `x` and `y` coordinates for the desired scene below.
// The coordinates are pixels from the top-left corner of the scene.
// For reference, scene dimensions are defined in SCENE_SIZES above.
const SCENE_OBJECTS = {
    office: {
        laptop: { x: (180 / 2) + 40.5, y: 51.5, width: 24, height: 20 }, // Centered horizontally at top
        exit: { x: (180 / 2) - 45, y: 192 - 10, width: 0, height: 0 } // Centered at bottom
    },
    warehouse: {
        terminal: { x: 1600 - 32 - 100, y: 200, width: 32, height: 32 },
        exit: { x: 64, y: (900 / 2) - 32, width: 64, height: 64 }
    },
    cafe: {
        terminal: { x: 150, y: 350, width: 48, height: 48 },
        exit: { x: 1200 - 64 * 2, y: 800 - 64 - 50, width: 64, height: 64 }
    },
    datacenter: {
        mainframe: { x: (1600 / 2) - 64, y: 250, width: 128, height: 128 },
        exit: { x: 64, y: 900 - 64 * 2, width: 64, height: 64 }
    }
};

// --- END OF CONFIGURATION ---

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
  
  // State and refs for smoothed camera
  const [cameraPosition, setCameraPosition] = useState(initialPosition);
  const playerPositionRef = useRef(position);
  const animationFrameId = useRef<number>();
  
  // This effect forces a re-render shortly after the component mounts or the location changes.
  // This helps resolve timing issues where scene elements are misaligned on the initial paint.
  useEffect(() => {
    setIsSceneReady(false);
    const timer = setTimeout(() => {
      // Re-measure bounds just in case the layout shifted
      if (containerRef.current) {
        setViewportBounds({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
      setIsSceneReady(true);
    }, 50); // A small delay is enough for the DOM to settle.
    return () => clearTimeout(timer);
  }, [locationId]);

  // When location changes, reset player and camera to the new initial position
  useEffect(() => {
    setPlayerPosition(initialPosition);
    setCameraPosition(initialPosition);
  }, [locationId, initialPosition, setPlayerPosition]);


  useEffect(() => {
    playerPositionRef.current = position;
  }, [position]);

  // Character animation state logic
  useEffect(() => {
    // FIX: Changed arrow function to a function declaration to resolve a potential toolchain error.
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
    const LERP_FACTOR = 0.08; // Smoothing factor; lower is smoother

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
          return prevCamPos; // No change needed
        }

        // Interpolate the camera position
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
    
    const definedPositions = SCENE_OBJECTS[location.sceneType as keyof typeof SCENE_OBJECTS];
    if (definedPositions) {
        return definedPositions;
    }
    
    // Hub portals are generated dynamically based on story progress
    if (location.sceneType === 'hub') {
        const portalSize = { width: 64, height: 64 };
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
    return {};
  }, [location, storyProgress, sceneSize]);

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

    if ('laptop' in scenePositions && scenePositions.laptop && checkProximity(scenePositions.laptop.x, scenePositions.laptop.y, scenePositions.laptop.width, scenePositions.laptop.height, 60)) {
        return { type: 'laptop', text: 'Press [E] to access' };
    }
    
    if ('terminal' in scenePositions && scenePositions.terminal && checkProximity(scenePositions.terminal.x, scenePositions.terminal.y, scenePositions.terminal.width, scenePositions.terminal.height, 60)) {
        const type = location.sceneType === 'warehouse' ? 'terminal_warehouse' : 'terminal_cafe';
        const text = location.sceneType === 'warehouse' ? 'Press [E] to interact' : 'Press [E] to access PC';
        return { type, text };
    }
    
    if ('mainframe' in scenePositions && scenePositions.mainframe && checkProximity(scenePositions.mainframe.x, scenePositions.mainframe.y, scenePositions.mainframe.width, scenePositions.mainframe.height, 80)) {
        return { type: 'mainframe', text: 'Press [E] to connect to the core' };
    }

    if ('exit' in scenePositions && scenePositions.exit && checkProximity(scenePositions.exit.x, scenePositions.exit.y, scenePositions.exit.width, scenePositions.exit.height, 60)) {
        return { type: 'portal', text: 'Press [E] to enter World Map', destination: 'world_map' };
    }

    if (location.sceneType === 'hub' && 'portals' in scenePositions && scenePositions.portals && 'portalSize' in scenePositions && scenePositions.portalSize) {
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
          if (interaction.type === 'portal') {
            playSound('rpg_portal', 0.7);
            onNavigate(interaction.destination);
          } else {
            playSound('rpg_interact', 0.7);
            if (interaction.type === 'laptop') onAccessLaptop();
            if (interaction.type === 'terminal_warehouse') onFindClue('warehouse_terminal');
            if (interaction.type === 'terminal_cafe') onFindClue('cafe_terminal');
            if (interaction.type === 'mainframe') onFindClue('europa_mainframe');
          }
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

    const scaledSceneWidth = sceneSize.width * ZOOM_LEVEL;
    const scaledSceneHeight = sceneSize.height * ZOOM_LEVEL;
    let finalX, finalY;

    // Handle horizontal positioning
    if (scaledSceneWidth <= viewportBounds.width) {
      // Scene is smaller than viewport, so center it
      finalX = (viewportBounds.width - scaledSceneWidth) / 2;
    } else {
      // Scene is larger, so pan with camera, clamping at edges
      const cameraCenterX = cameraPosition.x + PLAYER_SPRITE_SIZE.width / 2;
      const targetX = viewportBounds.width / 2 - cameraCenterX * ZOOM_LEVEL;
      const minX = viewportBounds.width - scaledSceneWidth;
      const maxX = 0;
      finalX = Math.max(minX, Math.min(maxX, targetX));
    }

    // Handle vertical positioning
    if (scaledSceneHeight <= viewportBounds.height) {
      // Scene is smaller than viewport, so center it
      finalY = (viewportBounds.height - scaledSceneHeight) / 2;
    } else {
      // Scene is larger, so pan with camera, clamping at edges
      const cameraCenterY = cameraPosition.y + PLAYER_SPRITE_SIZE.height / 2;
      const targetY = viewportBounds.height / 2 - cameraCenterY * ZOOM_LEVEL;
      const minY = viewportBounds.height - scaledSceneHeight;
      const maxY = 0;
      finalY = Math.max(minY, Math.min(maxY, targetY));
    }

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

  const renderSceneObject = (obj: any, type: string, asset: string, alt: string, className: string) => {
    if (!obj) return null;
    return <img src={asset} alt={alt} className={`absolute ${className}`} style={{ left: obj.x, top: obj.y, width: obj.width, height: obj.height }} />;
  };

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
            {renderSceneObject((scenePositions as any).laptop, 'laptop', LAPTOP_ASSET, 'Laptop', 'laptop-glow')}
            {renderSceneObject((scenePositions as any).terminal, 'terminal', location.sceneType === 'cafe' ? CAFE_PC_ASSET : TERMINAL_INTERACT_ASSET, 'Terminal', location.sceneType === 'cafe' ? 'laptop-glow' : 'terminal-glow')}
            {renderSceneObject((scenePositions as any).mainframe, 'mainframe', MAINFRAME_ASSET, 'Mainframe', 'terminal-glow')}
            
            {/* Portals and Exits */}
            {renderSceneObject((scenePositions as any).exit, 'exit', PORTAL_ASSET, 'Exit Portal', 'portal-glow')}

            {'portals' in scenePositions && scenePositions.portals?.map(portal => (
                <div key={portal.id} className="absolute" style={{ left: portal.pos.x, top: portal.pos.y }}>
                    <img src={PORTAL_ASSET} alt={`Portal to ${portal.name}`} className="portal-glow" style={{ width: (scenePositions as any).portalSize.width, height: (scenePositions as any).portalSize.height }}/>
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