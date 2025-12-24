
import React, { useState } from 'react';
import { CrystalType } from '../types';
import { CRYSTAL_CONFIGS } from '../constants';

interface CrystalDisplayProps {
  type: CrystalType;
  onClick: () => void;
  perClick: number;
}

const CrystalDisplay: React.FC<CrystalDisplayProps> = ({ type, onClick, perClick }) => {
  const [isAnimate, setIsAnimate] = useState(false);
  const [clickParticles, setClickParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    setIsAnimate(true);
    setTimeout(() => setIsAnimate(false), 100);
    
    const newParticle = {
      id: Date.now(),
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    };
    setClickParticles(prev => [...prev.slice(-10), newParticle]);
    setTimeout(() => {
      setClickParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);

    onClick();
  };

  const config = CRYSTAL_CONFIGS[type];

  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-sm h-[400px]">
      <div className="absolute top-6 left-6 text-slate-400 text-sm font-bold uppercase tracking-widest cinzel">
        Mining: {type}
      </div>
      
      <div 
        onClick={handleClick}
        className={`relative cursor-pointer transition-transform duration-75 active:scale-95 ${isAnimate ? 'scale-110' : 'scale-100'}`}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-48 h-48 crystal-glow"
          style={{ fill: config.color }}
        >
          <path d="M50 5 L85 30 L85 70 L50 95 L15 70 L15 30 Z" opacity="0.8" />
          <path d="M50 5 L50 95" stroke="white" strokeWidth="0.5" opacity="0.3" />
          <path d="M15 30 L85 30" stroke="white" strokeWidth="0.5" opacity="0.3" />
          <path d="M15 70 L85 70" stroke="white" strokeWidth="0.5" opacity="0.3" />
          <path d="M50 5 L15 70" stroke="white" strokeWidth="0.5" opacity="0.2" />
          <path d="M50 5 L85 70" stroke="white" strokeWidth="0.5" opacity="0.2" />
        </svg>

        {clickParticles.map(p => (
          <div 
            key={p.id}
            className="absolute pointer-events-none text-xl font-bold text-white animate-bounce-out"
            style={{ 
              left: p.x, 
              top: p.y - 20,
              textShadow: `0 0 5px ${config.color}`
            }}
          >
            +{perClick.toFixed(1)}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-slate-400 text-sm">Tap the crystal to harvest</p>
        <div className="flex gap-2 mt-2">
            <div className="px-3 py-1 bg-slate-900 rounded-full text-xs font-semibold text-purple-400 border border-purple-900">
                +{perClick.toFixed(1)} / Click
            </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-out {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
        }
        .animate-bounce-out {
          animation: bounce-out 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CrystalDisplay;
