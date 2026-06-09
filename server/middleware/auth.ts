import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        id: string;
        name: string;
        email: string;
        xp: number;
        level: number;
        streak: number;
        longestStreak: number;
        lastActiveDate: string;
        dailyXpGoal: number;
        dailyXpEarned: number;
      };
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token using Supabase Auth Client
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }

    // Fetch public profile details or create if not found
    let profile: any;
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    if (!profileData) {
      const username = authUser.email ? authUser.email.split('@')[0] + Math.floor(Math.random() * 1000) : 'user_' + Math.floor(Math.random() * 100000);
      const name = authUser.user_metadata?.name || (authUser.email ? authUser.email.split('@')[0] : 'Learner');
      const todayStr = new Date().toISOString().split('T')[0];

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          name: name,
          email: authUser.email || '',
          username: username,
          xp: 0,
          level: 1,
          streak: 0,
          longest_streak: 0,
          daily_xp_goal: 50,
          daily_xp_earned: 0,
          last_active_date: new Date().toISOString(),
          daily_missions: {
            date: todayStr,
            missions: [
              { id: 'm1', text: 'Earn 50 XP today', xp: 20, target: 50, current: 0, type: 'xp', completed: false },
              { id: 'm2', text: 'Complete 1 lesson', xp: 20, target: 1, current: 0, type: 'lesson', completed: false },
              { id: 'm3', text: 'Solve 1 quiz challenge', xp: 10, target: 1, current: 0, type: 'quiz', completed: false }
            ],
            stats: {
              lessonsCompleted: 0,
              quizzesSolved: 0,
              perfectQuizzes: 0,
              projectsSubmitted: 0
            }
          }
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile on the fly:', createError);
        return res.status(401).json({ message: 'User profile not found and could not be created' });
      }
      profile = createdProfile;
    } else {
      profile = profileData;
    }

    // Map fields to match custom Mongoose properties to preserve interface compatibility
    const todayStr = new Date().toISOString().split('T')[0];
    let dailyXpEarned = profile.daily_xp_earned || 0;
    if (profile.last_active_date) {
      const lastActiveStr = new Date(profile.last_active_date).toISOString().split('T')[0];
      if (lastActiveStr !== todayStr) {
        dailyXpEarned = 0;
      }
    }

    req.user = {
      _id: profile.id,
      id: profile.id,
      name: profile.name,
      email: authUser.email || profile.email,
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak,
      longestStreak: profile.longest_streak,
      lastActiveDate: profile.last_active_date,
      dailyXpGoal: profile.daily_xp_goal,
      dailyXpEarned,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};
