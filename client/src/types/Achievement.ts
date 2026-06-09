export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'Standard' | 'Rare' | 'Legendary';
  icon: string;
  earned: boolean;
  targetCount?: number;
  targetValue?: number;
  xpBonus?: number;
}

export interface AchievementsResponse {
  achievements: Achievement[];
}
