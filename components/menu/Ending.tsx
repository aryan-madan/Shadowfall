import React, { useState, useEffect } from 'react';

interface EndingScreenProps {
  ending: 'A' | 'B' | null;
  onMainMenu: () => void;
}

const ENDINGS = {
  A: {
    title: "TRUTH",
    color: "text-cyan-400",
    borderColor: "border-cyan-500",
    buttonColor: "cyan",
    text: [
      "The Ghost Protocol is executed.",
      "Encrypted files from every federal agency are dumped onto the public web.",
      "Global markets crash. Governments are destabilized. Chaos reigns.",
      "The world you knew is gone, burned away by the harsh light of truth.",
      "But from the ashes, something new might grow.",
      "You are a traitor. A hero. A ghost.",
      "Your sacrifice gave the world a chance to be free."
    ]
  },
  B: {
    title: "CONTROL",
    color: "text-red-500",
    borderColor: "border-red-500",
    buttonColor: "red",
    text: [
      "The Ghost Protocol is rewritten.",
      "You and Void become the secret puppeteers of the digital world.",
      "The system remains, but now it serves you.",
      "You manipulate markets, shift political power, and erase threats with a single command.",
      "Order is maintained. But it is an order built on lies, enforced from the shadows.",
      "You have become what you once hunted.",
      "Your sacrifice was your own integrity."
    ]
  }
};

const EndingScreen: React.FC<EndingScreenProps> = ({ ending, onMainMenu }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const content = ending ? ENDINGS[ending] : null;

  useEffect(() => {
    if (!content) return;

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < content.text.length) {
        setLines(prev => [...prev, content.text[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsFinished(true), 1000);
      }
    }, 2500); // Time between lines appearing

    return () => clearInterval(interval);
  }, [content]);

  if (!content) {
    return (
        <div className="w-screen h-screen bg-black flex items-center justify-center text-gray-300">
            Loading ending...
        </div>
    );
  }

  return (
    <div className={`w-screen h-screen bg-black flex flex-col items-center justify-center p-8 transition-opacity duration-1000 animate-fade-in`}>
        <div className={`w-full max-w-4xl text-left border-l-4 pl-8 ${content.borderColor}`}>
            {lines.map((line, index) => (
                <p key={index} className="text-4xl leading-relaxed font-mono text-gray-300 mb-6 animate-fade-in-line">
                    {line}
                </p>
            ))}
        </div>
        {isFinished && (
            <div className="mt-20">
                <button
                    onClick={onMainMenu}
                    className={`menu-button-ending text-3xl border-2 transition-all duration-300 px-10 py-3 rounded-sm font-bold animate-fade-in ${content.color}`}
                    style={{borderColor: 'currentColor'}}
                >
                    FIN.
                </button>
            </div>
        )}
        <style>
            {`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 1s ease-in forwards; }

                @keyframes fade-in-line {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-line { animation: fade-in-line 1.5s ease-out forwards; }
                
                .menu-button-ending {
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
                    background-color: transparent;
                }
                .menu-button-ending:hover {
                    color: #000;
                    box-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
                }
                .menu-button-ending::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background-color: currentColor;
                    transition: left 0.3s ease-in-out;
                    z-index: -1;
                }
                .menu-button-ending:hover::before {
                    left: 0;
                }
            `}
        </style>
    </div>
  );
};

export default EndingScreen;