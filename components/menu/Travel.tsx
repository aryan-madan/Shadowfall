import React from 'react';
import { Scene } from '../desktop/Apps';
import { TRAVEL_MENU_BACKGROUND_IMAGE, playSound } from '../../assets';

interface FastTravelProps {
  scenes: Record<string, Scene>;
  locationId: string;
  story: number;
  onTravel: (locationId: string) => void;
  onClose: () => void;
}

const FastTravel: React.FC<FastTravelProps> = ({ scenes, locationId, story, onTravel, onClose }) => {
  const travel = (id: string) => { playSound('rpg_portal'); onTravel(id); };
  const close = () => { playSound('window_close'); onClose(); };
  // FIX: Explicitly type `s` as `Scene` to prevent type errors when accessing its properties.
  const unlocked = Object.values(scenes).filter((s: Scene) => s.worldType && story >= s.progressRequirement);

  return (
    <div className="fixed inset-0 z-[15000] flex items-center justify-center" style={{ animation: 'menu-fade-in 0.3s forwards' }}>
      <div className="w-full max-w-4xl h-[80vh] text-cyan-300 bg-slate-900/80 border-2 border-cyan-500/50 p-8 rounded-lg shadow-2xl shadow-cyan-500/20 relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${TRAVEL_MENU_BACKGROUND_IMAGE})` }} />
        <div className="relative z-10 h-full flex flex-col">
            <div className="text-center mb-6">
                <h1 className="text-6xl font-bold tracking-widest glitch" data-text="FAST TRAVEL">FAST TRAVEL</h1>
                <p className="text-xl text-red-500 mt-1">Select Destination</p>
            </div>
            <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                {unlocked.map(s => (
                    <button key={s.id} onClick={() => travel(s.id)} disabled={s.id === locationId} className="w-full text-left bg-black/40 hover:bg-cyan-800/70 p-4 rounded transition-colors border border-cyan-700/50 disabled:bg-cyan-600/30 disabled:cursor-not-allowed">
                        <h2 className="text-2xl font-bold">{s.name} {s.id === locationId && '(CURRENT)'}</h2>
                        <p className="text-lg text-gray-400">{s.description}</p>
                    </button>
                ))}
            </div>
            <div className="text-center mt-6">
                 <button onClick={close} className="menu-button text-2xl border-2 border-cyan-500 transition-all duration-300 px-10 py-3 rounded-sm font-bold">CLOSE</button>
            </div>
        </div>
      </div>
      <style>{`.menu-button{position:relative;overflow:hidden;z-index:1;color:#22d3ee;background-color:transparent}.menu-button:hover{color:#0a0f18;box-shadow:0 0 10px #22d3ee,0 0 20px #22d3ee}.menu-button::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background-color:#22d3ee;transition:left .3s ease-in-out;z-index:-1}.menu-button:hover::before{left:0}`}</style>
    </div>
  );
};

export default FastTravel;
