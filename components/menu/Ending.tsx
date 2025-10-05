import React, { useState, useEffect } from 'react';
import { playSound } from '../../assets';

interface EndingProps {
  ending: 'A' | 'B' | null;
  onMenu: () => void;
}

const ENDINGS = {
  A: {
    title: "TRUTH", textColor: "text-cyan-400", borderColor: "border-cyan-500",
    lines: ["The Ghost Protocol is executed.", "Encrypted files from every federal agency are dumped onto the public web.", "Global markets crash. Governments are destabilized. Chaos reigns.", "The world you knew is gone, burned away by the harsh light of truth.", "But from the ashes, something new might grow.", "You are a traitor. A hero. A ghost.", "Your sacrifice gave the world a chance to be free."]
  },
  B: {
    title: "CONTROL", textColor: "text-red-500", borderColor: "border-red-500",
    lines: ["The Ghost Protocol is rewritten.", "You and Void become the secret puppeteers of the digital world.", "The system remains, but now it serves you.", "You manipulate markets, shift political power, and erase threats with a single command.", "Order is maintained. But it is an order built on lies, enforced from the shadows.", "You have become what you once hunted.", "Your sacrifice was your own integrity."]
  }
};

const Ending: React.FC<EndingProps> = ({ ending, onMenu }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const content = ending ? ENDINGS[ending] : null;

  useEffect(() => {
    if (!content) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < content.lines.length) {
        setLines(p => [...p, content.lines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsDone(true), 1000);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [content]);

  if (!content) return <div className="w-screen h-screen bg-black flex items-center justify-center text-gray-300">Loading ending...</div>;
  const returnToMenu = () => { playSound('ui_click'); onMenu(); }

  return (
    <div className={`w-screen h-screen bg-black flex flex-col items-center justify-center p-8 transition-opacity duration-1000 animate-fade-in`}>
        <div className={`w-full max-w-4xl text-left border-l-4 pl-8 ${content.borderColor}`}>
            {lines.map((line, i) => (<p key={i} className="text-4xl leading-relaxed font-mono text-gray-300 mb-6 animate-fade-in-line">{line}</p>))}
        </div>
        {isDone && (
            <div className="mt-20">
                <button onClick={returnToMenu} className={`menu-button-ending text-3xl border-2 transition-all duration-300 px-10 py-3 rounded-sm font-bold animate-fade-in ${content.textColor}`} style={{borderColor: 'currentColor'}}>FIN.</button>
            </div>
        )}
        <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in 1s ease-in forwards}@keyframes fade-in-line{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-line{animation:fade-in-line 1.5s ease-out forwards}.menu-button-ending{position:relative;overflow:hidden;z-index:1;background-color:transparent}.menu-button-ending:hover{color:#000;box-shadow:0 0 10px currentColor,0 0 20px currentColor}.menu-button-ending::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background-color:currentColor;transition:left .3s ease-in-out;z-index:-1}.menu-button-ending:hover::before{left:0}`}</style>
    </div>
  );
};

export default Ending;