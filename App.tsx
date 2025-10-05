
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { WindowInstance, IconPositions, RiskyActionConfig, ConversationChoice, GameState, AppState } from './types';
import { FBI_APPS, NORMAL_APPS, ALL_OBJECTIVES } from './constants';
import { ALL_ASSET_URLS } from './assets';
import { ALL_LOCATIONS } from './components/desktop/Apps';
import Desktop from './components/desktop/Desktop';
import Taskbar from './components/desktop/Taskbar';
import Window from './components/desktop/Window';
import LoginScreen from './components/desktop/Login';
import LoadingScreen from './components/menu/Loading';
import RPGScene from './components/RPGScene';
import SystemFailureScreen from './components/menu/Failure';
import StartMenu from './components/menu/Start';
import ObjectiveNotification from './components/desktop/Notification';
import PauseMenu from './components/menu/Pause';
import IntroScreen from './components/menu/Intro';
import EndingScreen from './components/menu/Ending';

const SAVE_KEY = 'shadowfall_savegame';
const ADJECTIVES = ['Red', 'Shadow', 'Silent', 'Night', 'Cyber', 'Ghost', 'Zero', 'Dark'];
const NOUNS = ['Fall', 'Protocol', 'Reaper', 'Storm', 'Fox', 'Spectre', 'Dawn', 'Blade'];

const generatePassword = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    return `${adj.toUpperCase()}${noun.toUpperCase()}${num}`;
};

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [nextZIndex, setNextZIndex] = useState<number>(10);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('start_menu');
  const [isLoginVisible, setIsLoginVisible] = useState<boolean>(false);
  const [storyProgress, setStoryProgress] = useState<number>(0);
  const [currentLocationId, setCurrentLocationId] = useState<string>('player_room');
  const [iconPositions, setIconPositions] = useState<IconPositions>({});
  const [systemIntegrity, setSystemIntegrity] = useState<number>(100);
  const [isSystemCrashed, setIsSystemCrashed] = useState<boolean>(false);
  const [madeChoices, setMadeChoices] = useState<Record<string, string>>({});
  const [isTakingDamage, setIsTakingDamage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const prevIntegrity = useRef(systemIntegrity);
  const [currentObjective, setCurrentObjective] = useState<string | null>(null);
  const prevStoryProgress = useRef(storyProgress);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSaveData, setHasSaveData] = useState(false);
  const [password, setPassword] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [openedFbiApps, setOpenedFbiApps] = useState<Set<string>>(new Set());
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [chosenEnding, setChosenEnding] = useState<'A' | 'B' | null>(null);

  const isFbiMode = appState === 'fbi_desktop';
  const currentApps = isFbiMode ? FBI_APPS : NORMAL_APPS;

  const saveState = useCallback(() => {
    if (!isLoaded) return;
    const gameState: GameState = {
      appState, storyProgress, systemIntegrity, madeChoices, password, currentLocationId,
      openedFbiApps: Array.from(openedFbiApps),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    setHasSaveData(true);
  }, [appState, storyProgress, systemIntegrity, madeChoices, password, currentLocationId, isLoaded, openedFbiApps]);

  const startNewGame = useCallback(() => {
    const newPassword = generatePassword();
    setStoryProgress(0);
    setSystemIntegrity(100);
    setMadeChoices({});
    setPassword(newPassword);
    setCurrentLocationId('player_room');
    setWindows([]);
    setActiveWindowId(null);
    setIsSystemCrashed(false);
    setIsLoginVisible(false);
    setIsPaused(false);
    setOpenedFbiApps(new Set());
    setChosenEnding(null);
    setShowIntro(true);
  }, []);

  const loadState = useCallback(() => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      const gameState: GameState = JSON.parse(savedData);
      
      if (gameState.currentLocationId === 'fbi_hq') {
        gameState.currentLocationId = 'player_room';
      }
      
      setAppState(gameState.appState === 'ending' ? 'start_menu' : gameState.appState);
      setStoryProgress(gameState.storyProgress);
      setSystemIntegrity(gameState.systemIntegrity);
      setMadeChoices(gameState.madeChoices);
      setPassword(gameState.password || generatePassword());
      setCurrentLocationId(gameState.currentLocationId);
      setOpenedFbiApps(new Set(gameState.openedFbiApps || []));
      setChosenEnding(null);
      setHasSaveData(true);
    } else {
        setHasSaveData(false);
    }
    setIsLoaded(true);
  }, []);
  
  const resetGame = () => {
    localStorage.removeItem(SAVE_KEY);
    setHasSaveData(false);
    startNewGame();
    setShowIntro(false);
    setChosenEnding(null);
    setAppState('start_menu');
  }

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    saveState();
  }, [saveState]);

  useEffect(() => {
    const initialPositions: IconPositions = {};
    const desktopApps = appState === 'fbi_desktop' ? FBI_APPS : NORMAL_APPS;
    desktopApps.forEach((app, index) => {
      const row = Math.floor(index / 10);
      const col = index % 10;
      initialPositions[app.id] = { x: 16 + row * 120, y: 16 + col * 120 };
    });
    setIconPositions(initialPositions);
  }, [appState]);

  useEffect(() => {
    if (appState === 'fbi_desktop') {
      document.body.className = 'fbi-theme';
    } else if (appState === 'normal_desktop') {
      document.body.className = 'normal-theme';
    } else {
      document.body.className = '';
    }
  }, [appState]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            if(appState !== 'start_menu' && appState !== 'ending' && !isLoginVisible && !isSystemCrashed && !showIntro) {
                setIsPaused(p => !p);
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, isLoginVisible, isSystemCrashed, showIntro]);

  useEffect(() => {
    if (isFbiMode && systemIntegrity <= 0 && !isSystemCrashed) {
      setIsSystemCrashed(true);
    }
    if (systemIntegrity < prevIntegrity.current) {
      setIsTakingDamage(true);
      setTimeout(() => setIsTakingDamage(false), 300);
    }
    prevIntegrity.current = systemIntegrity;
  }, [systemIntegrity, isFbiMode, isSystemCrashed]);

  useEffect(() => {
    if (storyProgress !== prevStoryProgress.current) {
        const objective = [...ALL_OBJECTIVES]
            .reverse()
            .find(obj => storyProgress >= obj.requiredProgress);
        
        if (objective) {
            setCurrentObjective(objective.text);
        } else {
            setCurrentObjective(null);
        }
    }
    prevStoryProgress.current = storyProgress;
  }, [storyProgress]);

  useEffect(() => {
    if (isFbiMode && storyProgress === 1 && openedFbiApps.size === FBI_APPS.length) {
        handleAdvanceStory(0.1);
    }
  }, [openedFbiApps, storyProgress, isFbiMode]);
  
  const handleAdvanceStory = (amount: number) => {
    setStoryProgress(prev => prev + amount);
  }

  const openApp = useCallback((appId: string) => {
    if (appId === 'secure_access') {
      setIsLoginVisible(true);
      return;
    }

    const app = currentApps.find(a => a.id === appId);
    if (!app) return;

    if (isFbiMode) {
        if (!openedFbiApps.has(appId)) {
            setOpenedFbiApps(prev => new Set(prev).add(appId));
        }
        if (appId === 'case_files' && storyProgress === 2) {
            handleAdvanceStory(0.1);
        }
    }

    const existingWindow = windows.find(w => w.appId === appId && !w.isMinimized);
    if (existingWindow) {
      focusWindow(existingWindow.id);
      return;
    }
    
    const newWindowId = `win-${Date.now()}`;
    const newWindow: WindowInstance = {
      id: newWindowId,
      appId: app.id,
      title: app.name,
      position: { x: Math.random() * 200 + 150, y: Math.random() * 100 + 50 },
      size: { width: app.defaultSize?.width ?? 640, height: app.defaultSize?.height ?? 480 },
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
    };
    
    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
    setActiveWindowId(newWindowId);
  }, [windows, nextZIndex, currentApps, isFbiMode, openedFbiApps, storyProgress]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isClosing: true } : w));
  }, []);

  const removeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
        setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const focusWindow = useCallback((id: string) => {
    if (id === activeWindowId) return;
    setWindows(prev =>
      prev.map(w =>
        w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
      )
    );
    setNextZIndex(prev => prev + 1);
    setActiveWindowId(id);
  }, [nextZIndex, activeWindowId]);

  const toggleMinimize = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          const isMinimized = !w.isMinimized;
          if (isMinimized && activeWindowId === id) {
              setActiveWindowId(null);
          }
          if (!isMinimized) {
              focusWindow(id);
          }
          return { ...w, isMinimized };
        }
        return w;
      })
    );
  }, [activeWindowId, focusWindow]);

  const handleLoginAttempt = (passwordAttempt: string) => {
    if (passwordAttempt === password) {
      setAppState('fbi_desktop');
      setIsLoginVisible(false);
      setWindows([]);
      setActiveWindowId(null);
      if (storyProgress < 1) {
        setStoryProgress(1);
      }
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setAppState('normal_desktop');
    setWindows([]);
    setActiveWindowId(null);
  }

  const handleReturnToRoom = () => {
    setAppState('rpg');
    setWindows([]);
    setActiveWindowId(null);
  }

  const handleRiskyAction = useCallback((config: RiskyActionConfig): boolean => {
    const isSuccess = Math.random() < config.successChance;
    const integrityCost = isSuccess ? config.integrityCostSuccess : config.integrityCostFailure;
    
    setSystemIntegrity(prev => Math.max(0, prev - integrityCost));

    return isSuccess;
  }, []);

  const repairSystem = useCallback((amount: number) => {
    setSystemIntegrity(prev => Math.min(100, prev + amount));
  }, []);

  const handleAccessLaptop = () => {
    setAppState('normal_desktop');
    setWindows([]);
    setActiveWindowId(null);
  }

  const handleNavigate = (locationId: string) => {
    setCurrentLocationId(locationId);
    setAppState('rpg');
  };

  const handleFindClue = (clueId: string) => {
    if (clueId === 'warehouse_terminal' && storyProgress < 2) {
      setStoryProgress(2);
    }
    if (clueId === 'cafe_terminal' && storyProgress < 3) {
      setStoryProgress(3);
    }
    if (clueId === 'europa_mainframe' && storyProgress < 3.2) {
      setStoryProgress(3.2);
    }
    setAppState('fbi_desktop');
  };
  
  const handleChoice = (choice: ConversationChoice) => {
    if (choice.conversationId === 'final_choice') {
        setChosenEnding(choice.id as 'A' | 'B');
        setAppState('ending');
        return;
    }

    setMadeChoices(prev => ({...prev, [choice.conversationId]: choice.id}));
    if (choice.integrityChange) {
        setSystemIntegrity(prev => Math.max(0, Math.min(100, prev + choice.integrityChange)));
    }
    if (choice.storyProgressChange) {
        setStoryProgress(prev => prev + choice.storyProgressChange);
    }
  }

  const handleIntroFinish = () => {
    setShowIntro(false);
    setAppState('rpg');
  };

  const renderDesktop = () => (
    <>
      <Desktop onOpenApp={openApp} apps={currentApps} isLoggedIn={isFbiMode} iconPositions={iconPositions}/>
      
      {windows.filter(w => !w.isMinimized).map(win => {
        const app = currentApps.find(a => a.id === win.appId);
        if (!app) return null;
        return (
            <Window
              key={win.id}
              instance={win}
              app={app}
              onClose={closeWindow}
              onRemove={removeWindow}
              onFocus={focusWindow}
              onMinimize={toggleMinimize}
              setWindows={setWindows}
              isActive={win.id === activeWindowId}
              isLoggedIn={isFbiMode}
              storyProgress={storyProgress}
              onFindClue={handleFindClue}
              currentLocationId={currentLocationId}
              systemIntegrity={systemIntegrity}
              onRiskyAction={handleRiskyAction}
              onRepairSystem={repairSystem}
              madeChoices={madeChoices}
              onChoice={handleChoice}
              onAdvanceStory={handleAdvanceStory}
              password={password}
            />
        );
      })}
      
      <Taskbar 
        openWindows={windows} 
        onFocusWindow={focusWindow} 
        onToggleMinimize={toggleMinimize} 
        activeWindowId={activeWindowId}
        isLoggedIn={isFbiMode}
        onLogout={isFbiMode ? handleLogout : undefined}
        onReturnToRoom={!isFbiMode ? handleReturnToRoom : undefined}
        apps={currentApps}
        systemIntegrity={systemIntegrity}
      />
    </>
  );

  const renderContent = () => {
    if (!isLoaded) {
        return null;
    }
    if (showIntro) {
      return <IntroScreen onFinish={handleIntroFinish} />;
    }
    if (isSystemCrashed) {
        return <SystemFailureScreen onReset={resetGame} />;
    }
    switch (appState) {
      case 'start_menu':
        return <StartMenu onNewGame={startNewGame} onContinue={() => {
            loadState();
            setAppState(prev => prev === 'start_menu' ? 'rpg' : prev);
        }} hasSaveData={hasSaveData} />;
      case 'ending':
        return <EndingScreen ending={chosenEnding} onMainMenu={resetGame} />;
      case 'rpg':
        return <RPGScene 
          onAccessLaptop={handleAccessLaptop} 
          onFindClue={handleFindClue}
          onNavigate={handleNavigate}
          locationId={currentLocationId} 
          storyProgress={storyProgress}
        />;
      case 'normal_desktop':
      case 'fbi_desktop':
        return renderDesktop();
      default:
        return null;
    }
  };
  
  const getIntegrityClass = () => {
      if (!isFbiMode) return '';
      if (systemIntegrity < 40) return 'integrity-critical';
      if (systemIntegrity < 70) return 'integrity-unstable';
      return 'integrity-stable';
  }

  const mainClass = `w-screen h-screen overflow-hidden select-none ${isFbiMode ? 'text-gray-200' : ''} ${getIntegrityClass()}`;
  
  if (isLoading) {
    return <LoadingScreen assetUrls={ALL_ASSET_URLS} onLoaded={() => setIsLoading(false)} />;
  }

  return (
    <div className={mainClass}>
      {isPaused && <PauseMenu onResume={() => setIsPaused(false)} onMainMenu={resetGame} />}
      {isFbiMode && (
        <>
          <div className="vignette-overlay" />
          <div className="scanline-overlay" />
          <div className="absolute inset-0 bg-red-800 pointer-events-none transition-opacity duration-500" style={{ opacity: Math.max(0, (70 - systemIntegrity) / 100 * 0.4) }} />
          {isTakingDamage && <div className="absolute inset-0 bg-red-500 pointer-events-none damage-flash z-[20000]" />}
          {currentObjective && (
            <ObjectiveNotification 
                objective={currentObjective} 
                onClose={() => setCurrentObjective(null)}
            />
           )}
        </>
      )}
      
      {renderContent()}
      
      {isLoginVisible && <LoginScreen onLoginAttempt={handleLoginAttempt} onClose={() => setIsLoginVisible(false)} />}
    </div>
  );
};

export default App;
