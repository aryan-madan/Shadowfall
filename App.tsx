import React, { useState, useCallback, useEffect, useRef } from 'react';
import { WindowInstance, IconPositions, DialogueChoice, SaveFile, GameScreen } from './types';
import { WORK_APPS, HOME_APPS, MISSIONS } from './constants';
import { ASSET_URLS, playSound, SFX } from './assets';
import { LOCATIONS } from './components/desktop/Apps';
import Desktop from './components/desktop/Desktop';
import Taskbar from './components/desktop/Taskbar';
import Window from './components/desktop/Window';
import Login from './components/desktop/Login';
import LoadingScreen from './components/menu/Loading';
import World from './components/RPGScene';
import CrashScreen from './components/menu/Failure';
import StartMenu from './components/menu/Start';
import Notification from './components/desktop/Notification';
import Pause from './components/menu/Pause';
import Intro from './components/menu/Intro';
import Ending from './components/menu/Ending';
import FastTravel from './components/menu/Travel';

const SAVE_KEY = 'shadowfall_save';
const PW_ADJ = ['Vindertech', 'Tilted', 'Ender', 'Nether', 'Golden', 'Victory', 'Flank', 'Giga'];
const PW_NOUNS = ['Scythe', 'Towers', 'Dragon', 'Rift', 'Scar', 'Royale', 'Creeper', 'Chad'];

const generatePassword = () => {
    const adj = PW_ADJ[Math.floor(Math.random() * PW_ADJ.length)];
    const noun = PW_NOUNS[Math.floor(Math.random() * PW_NOUNS.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    return `${adj.toUpperCase()}${noun.toUpperCase()}${num}`;
};

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [zIndex, setZIndex] = useState<number>(10);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [screen, setScreen] = useState<GameScreen>('main_menu');
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [story, setStory] = useState<number>(0);
  const [locationId, setLocationId] = useState<string>('player_room');
  const [iconPositions, setIconPositions] = useState<IconPositions>({});
  const [sysHealth, setSysHealth] = useState<number>(100);
  const [isCrashed, setIsCrashed] = useState<boolean>(false);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [isTakingDamage, setIsTakingDamage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const prevHealth = useRef(sysHealth);
  const [mission, setMission] = useState<string | null>(null);
  const prevStory = useRef(story);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [password, setPassword] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [openedApps, setOpenedApps] = useState<Set<string>>(new Set());
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [ending, setEnding] = useState<'A' | 'B' | null>(null);
  const [disabledSystems, setDisabledSystems] = useState<string[]>([]);
  const [showTravel, setShowTravel] = useState(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const isAgentDesktop = screen === 'agent_desktop';
  const apps = isAgentDesktop ? WORK_APPS : HOME_APPS;

  useEffect(() => {
    bgMusicRef.current = new Audio(SFX.bg_music);
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.25;
    return () => {
        bgMusicRef.current?.pause();
        bgMusicRef.current = null;
    }
  }, []);

  const playMusic = useCallback(() => { bgMusicRef.current?.play().catch(e => {}); }, []);
  const pauseMusic = useCallback(() => { bgMusicRef.current?.pause(); }, []);
  const stopMusic = useCallback(() => { if (bgMusicRef.current) { bgMusicRef.current.pause(); bgMusicRef.current.currentTime = 0; } }, []);

  const saveGame = useCallback(() => {
    if (!gameLoaded) return;
    const data: SaveFile = {
      screen, story, sysHealth, choices, password, locationId,
      openedApps: Array.from(openedApps),
      disabledSystems,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    setHasSave(true);
  }, [screen, story, sysHealth, choices, password, locationId, gameLoaded, openedApps, disabledSystems]);

  const newGame = useCallback(() => {
    const newPass = generatePassword();
    setStory(0);
    setSysHealth(100);
    setChoices({});
    setPassword(newPass);
    setLocationId('player_room');
    setWindows([]);
    setActiveId(null);
    setIsCrashed(false);
    setShowLogin(false);
    setIsPaused(false);
    setOpenedApps(new Set());
    setEnding(null);
    setDisabledSystems([]);
    setShowIntro(true);
    playMusic();
  }, [playMusic]);

  const loadGame = useCallback(() => {
    const savedJSON = localStorage.getItem(SAVE_KEY);
    if (savedJSON) {
      const data: SaveFile = JSON.parse(savedJSON);
      if (data.locationId === 'fbi_hq') data.locationId = 'player_room';
      setScreen(data.screen === 'game_ending' ? 'main_menu' : data.screen);
      setStory(data.story);
      setSysHealth(data.sysHealth);
      setChoices(data.choices);
      setPassword(data.password || generatePassword());
      setLocationId(data.locationId);
      setOpenedApps(new Set(data.openedApps || []));
      setDisabledSystems(data.disabledSystems || []);
      setEnding(null);
      setHasSave(true);
    } else {
        setHasSave(false);
    }
    setGameLoaded(true);
  }, []);
  
  const continueGame = useCallback(() => {
    loadGame();
    setScreen(prev => prev === 'main_menu' ? 'game_world' : prev);
    playMusic();
  }, [loadGame, playMusic]);
  
  const resetGame = () => {
    localStorage.removeItem(SAVE_KEY);
    setHasSave(false);
    newGame();
    setShowIntro(false);
    setEnding(null);
    setScreen('main_menu');
    stopMusic();
  }

  useEffect(() => { loadGame(); }, [loadGame]);
  useEffect(() => { saveGame(); }, [saveGame]);

  useEffect(() => {
    const icons: IconPositions = {};
    const currentApps = screen === 'agent_desktop' ? WORK_APPS : HOME_APPS;
    currentApps.forEach((app, index) => {
      const row = Math.floor(index / 10);
      const col = index % 10;
      icons[app.id] = { x: 16 + row * 120, y: 16 + col * 120 };
    });
    setIconPositions(icons);
  }, [screen]);

  useEffect(() => {
    if (screen === 'agent_desktop') document.body.className = 'fbi-theme';
    else if (screen === 'personal_desktop') document.body.className = 'day-theme';
    else document.body.className = '';
  }, [screen]);
  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            if(screen !== 'main_menu' && screen !== 'game_ending' && !showLogin && !isCrashed && !showIntro) {
                if (showTravel) setShowTravel(false);
                else setIsPaused(p => !p);
            }
        }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, showLogin, isCrashed, showIntro, showTravel]);

  useEffect(() => {
      if (gameLoaded && !showIntro && screen !== 'main_menu' && screen !== 'game_ending') {
          playSound(isPaused ? 'pause_in' : 'pause_out', 0.6);
      }
      if (!gameLoaded || showIntro) return;
      if (isPaused) pauseMusic();
      else if (screen !== 'main_menu' && screen !== 'game_ending') playMusic();
  }, [isPaused, gameLoaded, showIntro, screen, playMusic, pauseMusic]);

  useEffect(() => {
    if ((isAgentDesktop && sysHealth <= 0 && !isCrashed) || screen === 'game_ending') {
      stopMusic();
      if (isAgentDesktop && !isCrashed) {
        playSound('system_crash');
        setIsCrashed(true);
      }
    }
    if (sysHealth < prevHealth.current) {
      playSound('system_damage', 0.7);
      setIsTakingDamage(true);
      setTimeout(() => setIsTakingDamage(false), 300);
    }
    prevHealth.current = sysHealth;
  }, [sysHealth, isAgentDesktop, isCrashed, stopMusic, screen]);

  useEffect(() => {
    if (story !== prevStory.current) {
        const m = [...MISSIONS].reverse().find(obj => story >= obj.progressRequirement);
        if (m && m.text !== mission) {
            playSound('new_objective', 0.6);
            setMission(m.text);
        } else if (!m) {
            setMission(null);
        }
    }
    prevStory.current = story;
  }, [story, mission]);

  useEffect(() => {
    if (isAgentDesktop && story === 1 && openedApps.size === WORK_APPS.length) {
        advanceStory(0.1);
    }
  }, [openedApps, story, isAgentDesktop]);
  
  const advanceStory = (amount: number) => { setStory(p => Math.max(p, p + amount)); }

  const openApp = useCallback((appId: string) => {
    if (appId === 'secure_access') { playSound('ui_click'); setShowLogin(true); return; }
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    if (isAgentDesktop) {
        if (!openedApps.has(appId)) setOpenedApps(p => new Set(p).add(appId));
        if (appId === 'case_files' && story === 2) advanceStory(0.1);
    }
    const openWin = windows.find(w => w.appId === appId && !w.isMinimized);
    if (openWin) { focusWindow(openWin.id); return; }
    playSound('window_open', 0.6);
    const id = `win-${Date.now()}`;
    const newWin: WindowInstance = {
      id, appId: app.id, title: app.name,
      pos: { x: Math.random() * 200 + 150, y: Math.random() * 100 + 50 },
      size: { width: app.initialSize?.width ?? 640, height: app.initialSize?.height ?? 480 },
      isMinimized: false, isMaximized: false, zIndex,
    };
    setWindows(p => [...p, newWin]);
    setZIndex(p => p + 1);
    setActiveId(id);
  }, [windows, zIndex, apps, isAgentDesktop, openedApps, story]);

  const closeWindow = useCallback((id: string) => {
    playSound('window_close', 0.6);
    setWindows(p => p.map(w => w.id === id ? { ...w, isClosing: true } : w));
  }, []);

  const removeWindow = useCallback((id: string) => {
    setWindows(p => p.filter(w => w.id !== id));
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  const focusWindow = useCallback((id: string) => {
    if (id === activeId) return;
    setWindows(p => p.map(w => w.id === id ? { ...w, zIndex, isMinimized: false } : w));
    setZIndex(p => p + 1);
    setActiveId(id);
  }, [zIndex, activeId]);

  const minimizeWindow = useCallback((id: string) => {
    playSound('window_minimize', 0.6);
    setWindows(p => p.map(w => {
        if (w.id === id) {
          const min = !w.isMinimized;
          if (min && activeId === id) setActiveId(null);
          if (!min) focusWindow(id);
          return { ...w, isMinimized: min };
        }
        return w;
      })
    );
  }, [activeId, focusWindow]);

  const onAuth = (pass: string) => {
    const ok = pass === password;
    playSound(ok ? 'login_success' : 'login_fail');
    if (ok) {
      setScreen('agent_desktop');
      setShowLogin(false);
      setWindows([]);
      setActiveId(null);
      if (story < 1) setStory(1);
    }
    return ok;
  };

  const logout = () => { playSound('logout'); setScreen('personal_desktop'); setWindows([]); setActiveId(null); }
  const leaveComputer = () => { setScreen('game_world'); setWindows([]); setActiveId(null); }
  const useComputer = () => { setScreen('personal_desktop'); setWindows([]); setActiveId(null); }
  
  const disableSystem = useCallback((name: string, cost: number) => {
    playSound('system_damage', 0.8);
    setDisabledSystems(p => [...p, name]);
    setSysHealth(p => Math.max(0, p - cost));
  }, []);

  const onClueFound = (clueId: string) => {
    if (clueId === 'cafe_terminal' && story < 2) setStory(2);
    setScreen('agent_desktop');
  };
  
  const makeChoice = (choice: DialogueChoice) => {
    if (choice.dialogueId === 'final_choice') { setEnding(choice.id as 'A' | 'B'); setScreen('game_ending'); return; }
    setChoices(p => ({...p, [choice.dialogueId]: choice.id}));
    if (choice.healthChange) setSysHealth(p => Math.max(0, Math.min(100, p + choice.healthChange)));
    if (choice.progressChange) setStory(p => p + choice.progressChange);
  }

  const onIntroDone = () => { setShowIntro(false); setScreen('game_world'); };

  const renderDesktop = () => (
    <>
      <Desktop onOpen={openApp} apps={apps} isAgentDesktop={isAgentDesktop} iconPositions={iconPositions}/>
      {windows.filter(w => !w.isMinimized).map(win => {
        const app = apps.find(a => a.id === win.appId);
        if (!app) return null;
        return (<Window key={win.id} win={win} app={app} onClose={closeWindow} onRemove={removeWindow} onFocus={focusWindow} onMinimize={minimizeWindow} setWindows={setWindows} isActive={win.id === activeId} isAgentDesktop={isAgentDesktop} story={story} onClueFound={onClueFound} locationId={locationId} sysHealth={sysHealth} choices={choices} onChoice={makeChoice} onAdvanceStory={advanceStory} password={password} disabledSystems={disabledSystems} onDisableSystem={disableSystem} />);
      })}
      <Taskbar windows={windows} onFocus={focusWindow} onMinimize={minimizeWindow} activeId={activeId} isAgentDesktop={isAgentDesktop} onLogout={isAgentDesktop ? logout : undefined} onExit={!isAgentDesktop ? leaveComputer : undefined} apps={apps} health={sysHealth} disabledSystems={disabledSystems} />
    </>
  );

  const renderScreen = () => {
    if (!gameLoaded) return null;
    if (showIntro) return <Intro onDone={onIntroDone} />;
    if (isCrashed) return <CrashScreen onReset={resetGame} />;
    switch (screen) {
      case 'main_menu': return <StartMenu onNew={newGame} onContinue={continueGame} canContinue={hasSave} />;
      case 'game_ending': return <Ending ending={ending} onMenu={resetGame} />;
      case 'game_world': return <World onAccessComputer={useComputer} onClueFound={onClueFound} onOpenTravel={() => setShowTravel(true)} locationId={locationId} story={story} />;
      case 'personal_desktop':
      case 'agent_desktop': return renderDesktop();
      default: return null;
    }
  };
  
  const healthClass = () => {
      if (!isAgentDesktop) return '';
      if (sysHealth < 40) return 'system-critical';
      if (sysHealth < 70) return 'system-unstable';
      return 'integrity-stable';
  }

  const className = `w-screen h-screen overflow-hidden select-none ${isAgentDesktop ? 'text-gray-200' : ''} ${healthClass()}`;
  if (isLoading) return <LoadingScreen assets={ASSET_URLS} onDone={() => setIsLoading(false)} />;

  return (
    <div className={className}>
      {isPaused && <Pause onResume={() => setIsPaused(false)} onMenu={resetGame} />}
      {showTravel && (
        <FastTravel scenes={LOCATIONS} locationId={locationId} story={story} onTravel={(id) => { setLocationId(id); setScreen('game_world'); setShowTravel(false); }} onClose={() => setShowTravel(false)} />
      )}
      {isAgentDesktop && (
        <>
          <div className="vignette" />
          <div className="scanlines" />
          <div className="absolute inset-0 bg-red-800 pointer-events-none transition-opacity duration-500" style={{ opacity: Math.max(0, (70 - sysHealth) / 100 * 0.4) }} />
          {isTakingDamage && <div className="absolute inset-0 bg-red-500 pointer-events-none damage-flash z-[20000]" />}
          {mission && !disabledSystems.includes('OBJECTIVE_TRACKER') && (
            <Notification text={mission} onClose={() => setMission(null)} />
           )}
        </>
      )}
      {renderScreen()}
      {showLogin && <Login onAuth={onAuth} onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default App;