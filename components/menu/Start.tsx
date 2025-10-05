
import React from 'react';

interface StartMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  hasSaveData: boolean;
}

const StartMenu: React.FC<StartMenuProps> = ({ onNewGame, onContinue, hasSaveData }) => {
  return (
    <div 
        className="w-screen h-screen bg-[#0a0f18] text-cyan-300 flex flex-col items-center justify-center"
        style={{
            backgroundImage: 'linear-gradient(rgba(0, 150, 150, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 150, 150, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
        }}
    >
      <div className="scanline-overlay"></div>
      <div className="w-full max-w-4xl border-2 border-cyan-500/30 bg-black/30 p-12 shadow-2xl shadow-cyan-500/20 text-center backdrop-blur-sm">
        <div className="text-center relative">
          <h1 className="text-8xl font-bold tracking-widest glitch" data-text="SHADOWFALL">
            SHADOWFALL
          </h1>
          <p className="text-2xl text-red-500 mt-2">A TALE OF SACRIFICE</p>
        </div>
        <div className="mt-20 flex flex-col items-center space-y-6">
          {hasSaveData && (
               <button
                onClick={onContinue}
                className="menu-button text-4xl border-2 border-cyan-500 transition-all duration-300 px-12 py-4 rounded-sm font-bold w-96"
              >
                CONTINUE MISSION
              </button>
          )}
          <button
            onClick={onNewGame}
            className="menu-button text-4xl border-2 border-cyan-500 transition-all duration-300 px-12 py-4 rounded-sm font-bold w-96"
          >
            {hasSaveData ? 'NEW MISSION' : 'BEGIN MISSION'}
          </button>
        </div>
      </div>
      <div className="absolute bottom-4 text-center text-gray-500 text-lg">
        <p>Use [W][A][S][D] to move. Use [E] to interact. Press [Esc] to pause.</p>
        <p>Your choices matter. Sacrifices must be made.</p>
      </div>
      <style>
          {`
            .menu-button {
                position: relative;
                overflow: hidden;
                z-index: 1;
                color: #22d3ee;
                background-color: transparent;
            }
            .menu-button:hover {
                color: #0a0f18;
                box-shadow: 0 0 10px #22d3ee, 0 0 20px #22d3ee;
            }
            .menu-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background-color: #22d3ee;
                transition: left 0.3s ease-in-out;
                z-index: -1;
            }
            .menu-button:hover::before {
                left: 0;
            }
          `}
      </style>
    </div>
  );
};

export default StartMenu;
