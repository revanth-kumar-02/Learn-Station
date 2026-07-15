import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { calculateLevel, xpProgressInLevel, updateWeeklyMissions, generateDailyMissions } from '../utils/xpCalculator';

// --- COSMETIC SHOP ITEMS DEFINITION ---
export const SHOP_ITEMS = [
  { id: 'avatar_gold', name: 'Gold Border Frame', category: 'profile', cost: 150, rarity: 'epic', description: 'Glow with a gold accent frame around your avatar.' },
  { id: 'avatar_neon', name: 'Neon Cyber Frame', category: 'profile', cost: 250, rarity: 'legendary', description: 'Pulse with a dynamic neon cyber frame.' },
  { id: 'name_emerald', name: 'Emerald Name Color', category: 'profile', cost: 100, rarity: 'rare', description: 'Change your display name color to emerald green.' },
  { id: 'name_sunset', name: 'Sunset Gradient Name', category: 'profile', cost: 200, rarity: 'epic', description: 'Apply a beautiful sunset red-to-orange name gradient.' },
  
  { id: 'editor_cyberpunk', name: 'Cyberpunk Theme', category: 'editor', cost: 300, rarity: 'legendary', description: 'Transform the editor into high-contrast cyberpunk neon.' },
  { id: 'editor_dracula', name: 'Dracula Theme', category: 'editor', cost: 150, rarity: 'rare', description: 'The famous Dracula color scheme for your editor.' },
  { id: 'editor_monokai', name: 'Monokai Theme', category: 'editor', cost: 100, rarity: 'common', description: 'Retro Monokai styling.' },
  
  { id: 'dashboard_glass', name: 'Glassmorphism Panels', category: 'dashboard', cost: 200, rarity: 'epic', description: 'Apply frosted glass panel styles to your learning metrics.' },
  { id: 'cert_royal', name: 'Royal Gold Completion Seal', category: 'certificates', cost: 400, rarity: 'mythic', description: 'Affixes a royal gold foil seal to all generated certificates.' },
];

// @desc    Get user rewards status, coins, challenges and season stats
// @route   GET /api/rewards/status
export const getRewardsStatus = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

    // 1. Fetch profile details
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    // 2. Initialize daily challenges if needed
    const todayStr = new Date().toISOString().split('T')[0];
    let dailyMissions = profile.daily_missions;
    if (!dailyMissions || dailyMissions.date !== todayStr) {
      dailyMissions = generateDailyMissions(todayStr);
      await supabase
        .from('profiles')
        .update({ daily_missions: dailyMissions })
        .eq('id', userId);
    }

    // 3. Initialize weekly challenges if needed
    let weeklyMissions = profile.weekly_missions;
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const weekStartStr = monday.toISOString().split('T')[0];

    if (!weeklyMissions || weeklyMissions.week_start !== weekStartStr) {
      weeklyMissions = {
        week_start: weekStartStr,
        missions: [
          { id: 'module', text: 'Complete 1 Module', target: 1, current: 0, xp_reward: 100, coins_reward: 50, completed: false, claimed: false },
          { id: 'xp', text: 'Earn 700 XP', target: 700, current: 0, xp_reward: 150, coins_reward: 75, completed: false, claimed: false },
          { id: 'challenge', text: 'Finish 15 Coding Exercises', target: 15, current: 0, xp_reward: 100, coins_reward: 50, completed: false, claimed: false },
          { id: 'assessment', text: 'Complete 1 Assessment', target: 1, current: 0, xp_reward: 100, coins_reward: 50, completed: false, claimed: false }
        ]
      };
      await supabase
        .from('profiles')
        .update({ weekly_missions: weeklyMissions })
        .eq('id', userId);
    }

    // 4. Calculate level progress
    const progress = xpProgressInLevel(profile.xp || 0);

    // 5. Hardcoded Season metadata for Sprint 4.5
    const seasonInfo = {
      seasonNumber: 1,
      name: 'Season 1: Backend Builder',
      endsAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
      exclusiveRewards: [
        { id: 'editor_cyberpunk', name: 'Cyberpunk Theme', rarity: 'legendary' },
        { id: 'cert_royal', name: 'Royal Gold Seal', rarity: 'mythic' }
      ]
    };

    res.json({
      coins: profile.learn_coins || 0,
      dailyMissions: dailyMissions.missions || [],
      weeklyMissions: weeklyMissions.missions || [],
      activeCosmetics: profile.active_cosmetics || {},
      purchasedItems: profile.purchased_items || [],
      levelProgress: progress,
      season: seasonInfo,
      shopItems: SHOP_ITEMS
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Purchase cosmetic item from the Reward Shop
// @route   POST /api/rewards/purchase
export const purchaseRewardItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.body;

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Cosmetic item not found in shop.' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    const currentCoins = profile.learn_coins || 0;
    const purchased = profile.purchased_items || [];

    if (purchased.includes(itemId)) {
      return res.status(400).json({ message: 'You have already purchased this item.' });
    }

    if (currentCoins < item.cost) {
      return res.status(400).json({ message: `Insufficient LearnCoins. Required: ${item.cost}, You have: ${currentCoins}` });
    }

    const updatedPurchased = [...purchased, itemId];
    const remainingCoins = currentCoins - item.cost;

    await supabase
      .from('profiles')
      .update({
        learn_coins: remainingCoins,
        purchased_items: updatedPurchased
      })
      .eq('id', userId);

    res.json({
      success: true,
      message: `Successfully purchased ${item.name}!`,
      coins: remainingCoins,
      purchasedItems: updatedPurchased
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Equip or unequip a purchased cosmetic item
// @route   POST /api/rewards/equip
export const equipCosmetic = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { category, itemId } = req.body; // itemId is null to unequip

    if (!category) {
      return res.status(400).json({ message: 'Category is required.' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    const purchased = profile.purchased_items || [];
    if (itemId && !purchased.includes(itemId)) {
      return res.status(400).json({ message: 'You must purchase this cosmetic item before equipping it.' });
    }

    const activeCosmetics = { ...(profile.active_cosmetics || {}) };
    if (itemId) {
      activeCosmetics[category] = itemId;
    } else {
      delete activeCosmetics[category];
    }

    await supabase
      .from('profiles')
      .update({ active_cosmetics: activeCosmetics })
      .eq('id', userId);

    res.json({
      success: true,
      activeCosmetics
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Claim completion rewards for daily or weekly challenges
// @route   POST /api/rewards/claim-challenge
export const claimChallenge = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { challengeType, challengeId } = req.body; // challengeType is 'daily' or 'weekly'

    if (!challengeType || !challengeId) {
      return res.status(400).json({ message: 'Challenge type and challenge ID are required.' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    let xpToAward = 0;
    let coinsToAward = 0;
    let dbUpdatePayload: any = {};

    if (challengeType === 'daily') {
      const dailyObj = profile.daily_missions || {};
      const missions = dailyObj.missions || [];
      const missionIdx = missions.findIndex((m: any) => m.id === challengeId);

      if (missionIdx === -1) {
        return res.status(404).json({ message: 'Daily challenge not found.' });
      }

      const m = missions[missionIdx];
      if (!m.completed) {
        return res.status(400).json({ message: 'This challenge is not completed yet.' });
      }
      if (m.claimed) {
        return res.status(400).json({ message: 'Challenge reward already claimed.' });
      }

      m.claimed = true;
      xpToAward = m.xp_reward || 25;
      coinsToAward = 10; // 10 coins reward for daily mission completion

      dbUpdatePayload.daily_missions = dailyObj;
    } else if (challengeType === 'weekly') {
      const weeklyObj = profile.weekly_missions || {};
      const missions = weeklyObj.missions || [];
      const missionIdx = missions.findIndex((m: any) => m.id === challengeId);

      if (missionIdx === -1) {
        return res.status(404).json({ message: 'Weekly challenge not found.' });
      }

      const m = missions[missionIdx];
      if (!m.completed) {
        return res.status(400).json({ message: 'This challenge is not completed yet.' });
      }
      if (m.claimed) {
        return res.status(400).json({ message: 'Challenge reward already claimed.' });
      }

      m.claimed = true;
      xpToAward = m.xp_reward || 100;
      coinsToAward = m.coins_reward || 50;

      dbUpdatePayload.weekly_missions = weeklyObj;
    } else {
      return res.status(400).json({ message: 'Invalid challenge type. Use daily or weekly.' });
    }

    const finalXp = (profile.xp || 0) + xpToAward;
    const finalLevel = calculateLevel(finalXp);
    const finalCoins = (profile.learn_coins || 0) + coinsToAward;

    dbUpdatePayload.xp = finalXp;
    dbUpdatePayload.level = finalLevel;
    dbUpdatePayload.learn_coins = finalCoins;

    await supabase
      .from('profiles')
      .update(dbUpdatePayload)
      .eq('id', userId);

    res.json({
      success: true,
      xpEarned: xpToAward,
      coinsEarned: coinsToAward,
      totalXp: finalXp,
      level: finalLevel,
      coins: finalCoins
    });
  } catch (err) {
    next(err);
  }
};
