import api from './api';

export interface LevelProgress {
  level: number;
  xpInLevel: number;
  xpNeeded: number;
  progress: number;
}

export interface SeasonInfo {
  seasonNumber: number;
  name: string;
  endsAt: string;
  exclusiveRewards: { id: string; name: string; rarity: string }[];
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'profile' | 'certificates' | 'dashboard' | 'editor';
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  description: string;
}

export interface Challenge {
  id: string;
  text: string;
  target: number;
  current: number;
  xp_reward: number;
  coins_reward?: number;
  completed: boolean;
  claimed?: boolean;
}

export interface RewardsStatusResponse {
  coins: number;
  dailyMissions: Challenge[];
  weeklyMissions: Challenge[];
  activeCosmetics: Record<string, string>;
  purchasedItems: string[];
  levelProgress: LevelProgress;
  season: SeasonInfo;
  shopItems: ShopItem[];
}

export const rewardsService = {
  getStatus: async (): Promise<RewardsStatusResponse> => {
    const { data } = await api.get<RewardsStatusResponse>('/rewards/status');
    return data;
  },

  purchase: async (itemId: string): Promise<{ success: boolean; coins: number; purchasedItems: string[] }> => {
    const { data } = await api.post<any>('/rewards/purchase', { itemId });
    return data;
  },

  equip: async (category: string, itemId: string | null): Promise<{ success: boolean; activeCosmetics: Record<string, string> }> => {
    const { data } = await api.post<any>('/rewards/equip', { category, itemId });
    return data;
  },

  claimChallenge: async (challengeType: 'daily' | 'weekly', challengeId: string): Promise<{
    success: boolean;
    xpEarned: number;
    coinsEarned: number;
    totalXp: number;
    level: number;
    coins: number;
  }> => {
    const { data } = await api.post<any>('/rewards/claim-challenge', { challengeType, challengeId });
    return data;
  }
};
