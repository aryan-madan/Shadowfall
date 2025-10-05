
import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  assetUrls: string[];
  onLoaded: () => void;
}

const loadingSteps = [
    'INITIATING KERNEL...',
    'MOUNTING VIRTUAL FILE SYSTEM...',
    'LOADING SECURITY PROTOCOLS...',
    'DECRYPTING ASSET MANIFEST...',
    'ESTABLISHING SECURE UPLINK...',
    'CALIBRATING HAPTIC FEEDBACK...',
    'DECOMPRESSING TEXTURES...',
    'RENDERING UI ELEMENTS...',
    'FINALIZING BOOT SEQUENCE...',
    'SYSTEM READY.',
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ assetUrls, onLoaded }) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(loadingSteps[0]);
  const totalAssets = assetUrls.length;

  useEffect(() => {
    let mounted = true;
    let loaded = 0;

    if (totalAssets === 0) {
      onLoaded();
      return;
    }

    const onAssetLoad = () => {
        if (mounted) {
          loaded++;
          setLoadedCount(loaded);
          if (loaded === totalAssets) {
            setTimeout(onLoaded, 500 + loadingSteps.length * 150);
          }
        }
    };

    assetUrls.forEach(url => {
      const extension = url.split('.').pop()?.toLowerCase();
      if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
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

    return () => {
      mounted = false;
    };
  }, [assetUrls, onLoaded, totalAssets]);

  useEffect(() => {
      let stepIndex = 0;
      const interval = setInterval(() => {
          stepIndex++;
          if (stepIndex < loadingSteps.length) {
              setCurrentStep(loadingSteps[stepIndex]);
          } else {
              clearInterval(interval);
          }
      }, 150);

      return () => clearInterval(interval);
  }, []);

  const progress = totalAssets > 0 ? (loadedCount / totalAssets) * 100 : 100;

  return (
    <div className="w-screen h-screen bg-[#0a0f18] text-cyan-300 flex flex-col items-center justify-center">
       <div className="scanline-overlay"></div>
      <div className="text-center w-full max-w-2xl">
        <h1 className="text-6xl font-bold tracking-widest glitch" data-text="SHADOWFALL OS">
          SHADOWFALL OS
        </h1>
        <p className="text-2xl text-red-500 mt-4 animate-pulse">SYSTEM BOOT SEQUENCE INITIATED</p>
        
        <div className="mt-12 text-left bg-black/30 p-4 border border-cyan-700/50 h-32 overflow-hidden">
            <p className="text-xl text-green-400 animate-pulse">{`> ${currentStep}`}</p>
        </div>
        
        <div className="w-full mt-8 bg-slate-800 border border-cyan-700/50 rounded-sm">
          <div
            className="h-4 bg-cyan-500 transition-all duration-300"
            style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 8px #22d3ee'
            }}
          ></div>
        </div>
        <p className="mt-2 text-xl">{loadedCount} / {totalAssets} ASSETS DECRYPTED</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
