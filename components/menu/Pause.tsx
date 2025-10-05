
import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onMainMenu: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onMainMenu }) => {
  return (
    <div
      className="fixed inset-0 z-[15000] flex items-center justify-center"
      style={{ animation: 'fade-in-bg 0.3s forwards' }}
    >
      <div className="w-full max-w-lg text-center text-cyan-300 bg-slate-900/80 border-2 border-cyan-500/50 p-12 rounded-lg shadow-2xl shadow-cyan-500/20">
        <h1 className="text-7xl font-bold tracking-widest glitch" data-text="PAUSED">
          PAUSED
        </h1>
        <div className="mt-12 flex flex-col space-y-6">
          <button
            onClick={onResume}
            className="menu-button text-3xl border-2 border-cyan-500 transition-all duration-300 px-10 py-3 rounded-sm font-bold"
          >
            RESUME
          </button>
          <button
            onClick={onMainMenu}
            className="menu-button-danger text-3xl border-2 border-red-500 transition-all duration-300 px-10 py-3 rounded-sm font-bold"
          >
            MAIN MENU
          </button>
        </div>
      </div>
      <style>
          {`
            .menu-button, .menu-button-danger {
                position: relative;
                overflow: hidden;
                z-index: 1;
                background-color: transparent;
            }
            .menu-button {
                color: #22d3ee;
            }
            .menu-button-danger {
                color: #ef4444;
            }

            .menu-button:hover, .menu-button-danger:hover {
                color: #0a0f18;
            }
            .menu-button:hover {
                box-shadow: 0 0 10px #22d3ee, 0 0 20px #22d3ee;
            }
            .menu-button-danger:hover {
                box-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444;
            }

            .menu-button::before, .menu-button-danger::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                transition: left 0.3s ease-in-out;
                z-index: -1;
            }
            .menu-button::before {
                background-color: #22d3ee;
            }
            .menu-button-danger::before {
                background-color: #ef4444;
            }

            .menu-button:hover::before, .menu-button-danger:hover::before {
                left: 0;
            }
          `}
      </style>
    </div>
  );
};

export default PauseMenu;
