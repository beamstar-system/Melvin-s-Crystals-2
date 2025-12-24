
import React, { useState } from 'react';

interface MelvinDialogueProps {
  message: string;
  onSendIncantation: (text: string) => void;
  isProcessing: boolean;
  magicMultiplier: number;
}

const MelvinDialogue: React.FC<MelvinDialogueProps> = ({ message, onSendIncantation, isProcessing, magicMultiplier }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendIncantation(input);
    setInput('');
  };

  return (
    <div className="bg-slate-800/80 rounded-2xl p-6 border border-purple-900/50 shadow-inner relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2">
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${magicMultiplier > 1 ? 'bg-purple-600 text-white animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
          Resonance: x{magicMultiplier.toFixed(2)}
        </div>
      </div>

      <div className="flex gap-4 items-start mb-4">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center border-2 border-purple-400 overflow-hidden shadow-lg shadow-purple-500/20">
          <img src="https://picsum.photos/seed/melvin/200/200" alt="Melvin" className="w-full h-full object-cover" />
        </div>
        <div className="flex-grow">
          <h4 className="cinzel text-purple-300 text-lg font-bold">Melvin the Eccentric</h4>
          <div className="text-slate-300 text-sm italic leading-relaxed min-h-[3rem]">
            {isProcessing ? (
              <span className="animate-pulse">Consulting the ancient scrolls...</span>
            ) : (
              `"${message}"`
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Whisper an incantation..."
          className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
          disabled={isProcessing}
        />
        <button 
          type="submit"
          disabled={isProcessing}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
        >
          {isProcessing ? '...' : 'Cast'}
        </button>
      </form>
    </div>
  );
};

export default MelvinDialogue;
