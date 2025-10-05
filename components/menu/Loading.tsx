import React, { useState, useEffect } from 'react';

interface LoadingProps {
  assets: string[];
  onDone: () => void;
}

const bootSteps = [
    'INITIATING KERNEL...', 'MOUNTING VFS...', 'LOADING SECURITY PROTOCOLS...', 'DECRYPTING ASSET MANIFEST...',
    'ESTABLISHING UPLINK...', 'CALIBRATING HAPTICS...', 'DECOMPRESSING TEXTURES...', 'RENDERING UI...',
    'FINALIZING BOOT...', 'SYSTEM READY.',
];

const LoadingScreen: React.FC<LoadingProps> = ({ assets, onDone }) => {
  const [loaded, setLoaded] = useState(0);
  const [step, setStep] = useState(bootSteps[0]);
  const total = assets.length;

  useEffect(() => {
    let mounted = true;
    let count = 0;
    if (total === 0) { onDone(); return; }

    const onAssetLoad = () => {
        if (mounted) {
          count++;
          setLoaded(count);
          if (count === total) setTimeout(onDone, 500 + bootSteps.length * 150);
        }
    };

    assets.forEach(url => {
      const isAudio = ['.mp3', '.wav', '.ogg'].some(ext => url.endsWith(ext));
      if (isAudio) {
        const audio = new Audio();
        audio.src = url;
        audio.addEventListener('canplaythrough', onAssetLoad, { once: true });
        audio.addEventListener('error', onAssetLoad, { once: true });
      } else {
        const img = new Image();
        img.src = url;
        img.onload = onAssetLoad;
        img.onerror = onAssetLoad;
      }
    });

    return () => { mounted = false; };
  }, [assets, onDone, total]);

  useEffect(() => {
      let i = 0;
      const interval = setInterval(() => {
          i++;
          if (i < bootSteps.length) setStep(bootSteps[i]);
          else clearInterval(interval);
      }, 150);
      return () => clearInterval(interval);
  }, []);

  const progress = total > 0 ? (loaded / total) * 100 : 100;

  return (
    <div className="w-screen h-screen bg-[#0a0f18] text-cyan-300 flex flex-col items-center justify-center">
       <div className="scanlines"></div>
      <div className="text-center w-full max-w-2xl">
        <h1 className="text-6xl font-bold tracking-widest glitch" data-text="SHADOWFALL OS">SHADOWFALL OS</h1>
        <p className="text-2xl text-red-500 mt-4 animate-pulse">SYSTEM BOOT SEQUENCE INITIATED</p>
        <div className="mt-12 text-left bg-black/30 p-4 border border-cyan-700/50 h-32 overflow-hidden">
            <p className="text-xl text-green-400 animate-pulse">{`> ${step}`}</p>
        </div>
        <div className="w-full mt-8 bg-slate-800 border border-cyan-700/50 rounded-sm">
          <div className="h-4 bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%`, boxShadow: '0 0 8px #22d3ee' }} />
        </div>
        <p className="mt-2 text-xl">{loaded} / {total} ASSETS DECRYPTED</p>
      </div>
    </div>
  );
};

export default LoadingScreen;