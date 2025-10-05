
import React, { useEffect } from 'react';

interface SystemFailureScreenProps {
  onReset: () => void;
}

const SystemFailureScreen: React.FC<SystemFailureScreenProps> = ({ onReset }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onReset();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onReset]);

  return (
    <div 
        className="fixed inset-0 bg-black z-[20000] flex flex-col items-center justify-center text-red-500"
        style={{ animation: 'screen-jump 0.5s infinite' }}
    >
      <div className="text-center">
        <h1 
          className="text-9xl font-bold glitch"
          data-text="SYSTEM FAILURE"
          style={{ animation: 'flicker-red 1.5s infinite alternate' }}
        >
          SYSTEM FAILURE
        </h1>
        <p className="text-4xl mt-4">KERNEL PANIC: CORE INTEGRITY COMPROMISED</p>
        <p className="text-3xl mt-12 animate-pulse">SYSTEM WILL RESET IN 5 SECONDS...</p>
      </div>
    </div>
  );
};

export default SystemFailureScreen;
