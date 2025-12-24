
export enum CrystalType {
  QUARTZ = 'Quartz',
  AMETHYST = 'Amethyst',
  EMERALD = 'Emerald',
  RUBY = 'Ruby',
  CELESTITE = 'Celestite'
}

export interface CrystalData {
  type: CrystalType;
  amount: number;
  totalEarned: number;
  color: string;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  effect: number; // Crystals per second or per click
  type: 'click' | 'auto';
  requiredType: CrystalType;
}

export interface GameState {
  crystals: Record<CrystalType, number>;
  totalCrystals: Record<CrystalType, number>;
  upgrades: Upgrade[];
  lastUpdate: number;
  magicMultiplier: number;
  melvinDialogue: string;
  history: { time: string; value: number }[];
}

export interface AlchemicalResponse {
  message: string;
  bonusMultiplier: number;
  unlockedLore: string;
}
