
import React, { useState, useEffect } from 'react';
import { playSound } from '../../assets';

interface IntroScreenProps {
  onFinish: () => void;
}

const introText = "Every choice is a sacrifice. I sacrificed my savings for this laptop. The seller sacrificed its secrets... or so they thought. Now, I have to wonder... what will I have to sacrifice to uncover the truth?";

const IntroScreen: React.FC<IntroScreenProps> = ({ onFinish }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < introText.length) {
        setDisplayedText(prev => prev + introText.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  const handleFinish = () => {
    playSound('ui_click');
    onFinish();
  };

  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-gray-300 p-8">
        <div className="w-full max-w-4xl text-left">
            <p className="text-4xl leading-relaxed font-mono">
                {displayedText}
                <span className="animate-pulse">_</span>
            </p>
        </div>
        {!isTyping && (
            <div className="mt-20">
                <button
                    onClick={handleFinish}
                    className="menu-button text-3xl border-2 border-cyan-500 transition-all duration-300 px-10 py-3 rounded-sm font-bold animate-fade-in"
                >
                    Continue...
                </button>
            </div>
        )}
        <style>
            {`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease-in forwards;
                }
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

export default IntroScreen;
