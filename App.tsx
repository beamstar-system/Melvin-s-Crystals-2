import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CrystalType, GameState, Upgrade } from './types';
import { INITIAL_UPGRADES, CRYSTAL_CONFIGS } from './constants';
import { consultMelvin } from './services/geminiService';
import CrystalDisplay from './components/CrystalDisplay';
import UpgradePanel from './components/UpgradePanel';
import MelvinDialogue from './components/MelvinDialogue';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    crystals: {
      [CrystalType.QUARTZ]: 0,
      [CrystalType.AMETHYST]: 0,
      [CrystalType.EMERALD]: 0,
      [CrystalType.RUBY]: 0,
      [CrystalType.CELESTITE]: 0,
    },
    totalCrystals: {
      [CrystalType.QUARTZ]: 0,
      [CrystalType.AMETHYST]: 0,
      [CrystalType.EMERALD]: 0,
      [CrystalType.RUBY]: 0,
      [CrystalType.CELESTITE]: 0,
    },
    upgrades: INITIAL_UPGRADES,
    lastUpdate: Date.now(),
    magicMultiplier: 1.0,
    melvinDialogue: "Ah, another apprentice! The crystals won't mine themselves, you know. Tap that Quartz and let's get started!",
    history: []
  });

  const [activeTab, setActiveTab] = useState<'upgrades' | 'stats' | 'lab'>('upgrades');
  const [selectedCrystal, setSelectedCrystal] = useState<CrystalType>(CrystalType.QUARTZ);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Calculations
  const getCrystalsPerClick = useCallback(() => {
    const clickUpgrades = state.upgrades.filter(u => u.type === 'click');
    const base = 1;
    const bonus = clickUpgrades.reduce((acc, u) => acc + (u.level * u.effect), 0);
    return (base + bonus) * state.magicMultiplier;
  }, [state.upgrades, state.magicMultiplier]);

  const getCrystalsPerSecond = useCallback(() => {
    const autoUpgrades = state.upgrades.filter(u => u.type === 'auto');
    return autoUpgrades.reduce((acc, u) => acc + (u.level * u.effect), 0) * state.magicMultiplier;
  }, [state.upgrades, state.magicMultiplier]);

  // Main Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const cps = prev.upgrades
          .filter(u => u.type === 'auto')
          .reduce((acc, u) => acc + (u.level * u.effect), 0) * prev.magicMultiplier;
        
        const tickReward = cps / 10;
        
        // Reward goes into the currently active crystal for simplicity, 
        // or we could distribute based on upgrade requirement type.
        // For this game, let's reward based on what's unlocked.
        const newState = { ...prev };
        const unlockedTypes = Object.entries(CRYSTAL_CONFIGS)
          .filter(([_, conf]) => prev.totalCrystals[CrystalType.QUARTZ] >= conf.unlockAt)
          .map(([type]) => type as CrystalType);
        
        // Distribution logic: divide idle income among all unlocked types
        const perTypeTick = tickReward / unlockedTypes.length;
        
        unlockedTypes.forEach(type => {
            newState.crystals[type] += perTypeTick;
            newState.totalCrystals[type] += perTypeTick;
        });

        return newState;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // History tracking
  useEffect(() => {
    const historyInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        history: [...prev.history.slice(-19), { 
          time: new Date().toLocaleTimeString(), 
          // Fix line 96: Cast values to number to allow addition in reduce
          value: Object.values(prev.crystals).reduce((a: number, b: any) => a + (b as number), 0) 
        }]
      }));
    }, 5000);
    return () => clearInterval(historyInterval);
  }, []);

  const handleCrystalClick = () => {
    const amount = getCrystalsPerClick();
    setState(prev => ({
      ...prev,
      crystals: { ...prev.crystals, [selectedCrystal]: prev.crystals[selectedCrystal] + amount },
      totalCrystals: { ...prev.totalCrystals, [selectedCrystal]: prev.totalCrystals[selectedCrystal] + amount },
    }));
  };

  const handlePurchase = (upgradeId: string) => {
    setState(prev => {
      const upgrade = prev.upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return prev;

      const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
      if (prev.crystals[upgrade.requiredType] < cost) return prev;

      return {
        ...prev,
        crystals: { ...prev.crystals, [upgrade.requiredType]: prev.crystals[upgrade.requiredType] - cost },
        upgrades: prev.upgrades.map(u => 
          u.id === upgradeId ? { ...u, level: u.level + 1 } : u
        )
      };
    });
  };

  const handleIncantation = async (text: string) => {
    setIsProcessingAI(true);
    const summary = `Crystals: ${JSON.stringify(state.crystals)}. Upgrades: ${state.upgrades.filter(u => u.level > 0).length} active. Total mined: ${JSON.stringify(state.totalCrystals)}`;
    try {
      const result = await consultMelvin(text, summary);
      setState(prev => ({
        ...prev,
        melvinDialogue: result.message,
        magicMultiplier: result.bonusMultiplier,
        // Optional: add lore to a state if desired
      }));
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header Stat Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-purple-600 p-2 rounded-xl shadow-lg shadow-purple-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="cinzel text-2xl font-bold text-white tracking-tight">Melvin's Crystals</h1>
            <p className="text-xs text-slate-500 font-mono">CPS: {getCrystalsPerSecond().toFixed(1)} / CPC: {getCrystalsPerClick().toFixed(1)}</p>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-2 md:pb-0">
          {Object.entries(CRYSTAL_CONFIGS).map(([type, config]) => {
            const isUnlocked = state.totalCrystals[CrystalType.QUARTZ] >= config.unlockAt;
            return (
              <div 
                key={type} 
                onClick={() => isUnlocked && setSelectedCrystal(type as CrystalType)}
                className={`flex flex-col items-center min-w-[80px] cursor-pointer transition-all ${isUnlocked ? (selectedCrystal === type ? 'scale-110' : 'opacity-80 hover:opacity-100') : 'opacity-20 grayscale'}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color, boxShadow: isUnlocked ? `0 0 8px ${config.color}` : 'none' }} />
                  <span className="text-xs font-bold text-slate-300 cinzel">{type}</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {Math.floor(state.crystals[type as CrystalType]).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Left Column: Visual Area */}
        <div className="lg:col-span-5 space-y-6">
          <CrystalDisplay 
            type={selectedCrystal} 
            onClick={handleCrystalClick} 
            perClick={getCrystalsPerClick()} 
          />
          
          <MelvinDialogue 
            message={state.melvinDialogue} 
            onSendIncantation={handleIncantation}
            isProcessing={isProcessingAI}
            magicMultiplier={state.magicMultiplier}
          />
        </div>

        {/* Right Column: Management Area */}
        <div className="lg:col-span-7 bg-slate-800/30 rounded-3xl border border-slate-700/50 flex flex-col shadow-xl overflow-hidden">
          <div className="flex border-b border-slate-700">
            <button 
              onClick={() => setActiveTab('upgrades')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest cinzel transition-colors ${activeTab === 'upgrades' ? 'bg-slate-700 text-purple-400 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Alchemy Lab
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest cinzel transition-colors ${activeTab === 'stats' ? 'bg-slate-700 text-purple-400 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Mystic Stats
            </button>
          </div>

          <div className="p-6 flex-grow">
            {activeTab === 'upgrades' ? (
              <UpgradePanel 
                upgrades={state.upgrades} 
                crystals={state.crystals} 
                onPurchase={handlePurchase} 
              />
            ) : (
              <div className="h-full flex flex-col gap-6">
                <div className="h-[250px] w-full bg-slate-900/40 rounded-xl p-4 border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase cinzel">Crystal Accumulation</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={state.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#a78bfa' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8b5cf6" 
                        strokeWidth={3} 
                        dot={false}
                        animationDuration={300}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(state.totalCrystals).map(([type, val]) => (
                    <div key={type} className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{type} Lifetime</div>
                      {/* Fix line 256: Cast unknown value to number for Math.floor */}
                      <div className="text-lg font-mono text-slate-200">{Math.floor(val as number).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center text-slate-600 text-[10px] uppercase tracking-[0.2em] py-4">
        &copy; 2024 Melvin's Alchemical Arts &bull; Powered by Arcane Intelligence
      </footer>
    </div>
  );
};

export default App;