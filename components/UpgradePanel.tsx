
import React from 'react';
import { Upgrade, CrystalType } from '../types';
import { CRYSTAL_CONFIGS } from '../constants';

interface UpgradePanelProps {
  upgrades: Upgrade[];
  crystals: Record<CrystalType, number>;
  onPurchase: (upgradeId: string) => void;
}

const UpgradePanel: React.FC<UpgradePanelProps> = ({ upgrades, crystals, onPurchase }) => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] pr-2">
      {upgrades.map((upgrade) => {
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
        const canAfford = crystals[upgrade.requiredType] >= cost;
        const crystalColor = CRYSTAL_CONFIGS[upgrade.requiredType].color;

        return (
          <button
            key={upgrade.id}
            onClick={() => onPurchase(upgrade.id)}
            disabled={!canAfford}
            className={`group text-left p-4 rounded-xl border transition-all duration-200 ${
              canAfford 
                ? 'bg-slate-800 border-slate-700 hover:border-purple-500 hover:bg-slate-700' 
                : 'bg-slate-900 border-slate-800 opacity-60 grayscale cursor-not-allowed'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                {upgrade.name} (Lv. {upgrade.level})
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                {upgrade.type === 'click' ? 'Click Boost' : 'Auto Mine'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{upgrade.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: crystalColor, boxShadow: `0 0 8px ${crystalColor}` }}
                />
                <span className={`text-sm font-bold ${canAfford ? 'text-slate-200' : 'text-red-400'}`}>
                  {cost.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                +{upgrade.effect} {upgrade.type === 'click' ? 'per click' : '/ sec'}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default UpgradePanel;
