
import { CrystalType, Upgrade } from './types';

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'click_1',
    name: 'Sharpened Pickaxe',
    description: 'Increases crystals gained per click.',
    baseCost: 15,
    costMultiplier: 1.2,
    level: 0,
    effect: 1,
    type: 'click',
    requiredType: CrystalType.QUARTZ
  },
  {
    id: 'auto_1',
    name: 'Crystal Golem',
    description: 'A friendly construct that mines for you.',
    baseCost: 100,
    costMultiplier: 1.15,
    level: 0,
    effect: 1,
    type: 'auto',
    requiredType: CrystalType.QUARTZ
  },
  {
    id: 'auto_2',
    name: 'Arcane Conduit',
    description: 'Extracts energy from the ley lines.',
    baseCost: 500,
    costMultiplier: 1.18,
    level: 0,
    effect: 5,
    type: 'auto',
    requiredType: CrystalType.AMETHYST
  },
  {
    id: 'auto_3',
    name: 'Emerald Refinery',
    description: 'Highly efficient processing plant.',
    baseCost: 2500,
    costMultiplier: 1.25,
    level: 0,
    effect: 25,
    type: 'auto',
    requiredType: CrystalType.EMERALD
  }
];

export const CRYSTAL_CONFIGS: Record<CrystalType, { color: string; unlockAt: number }> = {
  [CrystalType.QUARTZ]: { color: '#e2e8f0', unlockAt: 0 },
  [CrystalType.AMETHYST]: { color: '#a78bfa', unlockAt: 500 },
  [CrystalType.EMERALD]: { color: '#34d399', unlockAt: 5000 },
  [CrystalType.RUBY]: { color: '#f87171', unlockAt: 25000 },
  [CrystalType.CELESTITE]: { color: '#60a5fa', unlockAt: 100000 },
};
