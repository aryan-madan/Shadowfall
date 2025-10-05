
import React, { useState, useEffect } from 'react';

interface LoginScreenProps {
  onLoginAttempt: (password: string) => boolean;
  onClose: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginAttempt, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLoginAttempt(password);
    if (!success) {
      setError('ACCESS DENIED: Incorrect Credentials');
      setPassword('');
    }
  };
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  }

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center"
        onClick={handleOverlayClick}
    >
      <div className="bg-[#0a0f18] border-2 border-red-500/80 w-full max-w-md p-8 rounded-lg shadow-2xl shadow-red-500/20">
        <h1 
          className="text-5xl font-bold text-red-500 text-center tracking-widest glitch"
          data-text="[ SECURE SYSTEM ACCESS ]"
        >
          [ SECURE SYSTEM ACCESS ]
        </h1>
        <p className="text-center text-gray-400 mt-2 mb-6">Enter credentials to proceed</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-cyan-300 text-lg font-bold mb-2" htmlFor="username">
              AGENT ID
            </label>
            <input 
              id="username"
              type="text"
              value="AGENT_77"
              disabled
              className="w-full bg-slate-800 border border-cyan-700 p-2 rounded text-gray-500 cursor-not-allowed focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <label className="block text-cyan-300 text-lg font-bold mb-2" htmlFor="password">
              PASSWORD
            </label>
            <input 
              id="password"
              type="password"
              ref={inputRef}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-cyan-700 p-2 rounded text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4 animate-pulse">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 px-4 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xl"
          >
            AUTHENTICATE
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
