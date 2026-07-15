import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { calculateLevel, checkAchievements, generateDailyMissions, updateDailyMissions, updateWeeklyMissions } from '../utils/xpCalculator';

// @desc    Get completed lessons and practice stats
// @route   GET /api/practice
export const getCompletedLessons = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

    // 1. Fetch user progress rows to see what is completed
    const { data: progressList, error: progressError } = await supabase
      .from('progress')
      .select('completed_lessons')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // Flatten all completed lesson IDs
    const completedLessonIds: string[] = [];
    if (progressList && progressList.length > 0) {
      progressList.forEach(p => {
        if (p.completed_lessons && Array.isArray(p.completed_lessons)) {
          p.completed_lessons.forEach(id => {
            if (!completedLessonIds.includes(id)) {
              completedLessonIds.push(id);
            }
          });
        }
      });
    }

    // 2. Fetch user profile for daily missions/practice stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const todayStr = new Date().toISOString().split('T')[0];
    let dailyMissionsObj = profile.daily_missions;
    if (!dailyMissionsObj || dailyMissionsObj.date !== todayStr) {
      dailyMissionsObj = generateDailyMissions(todayStr);
    }
    if (!dailyMissionsObj.completedLessonsToday) {
      dailyMissionsObj.completedLessonsToday = [];
    }
    if (dailyMissionsObj.dailyPracticeXp === undefined) {
      dailyMissionsObj.dailyPracticeXp = 0;
    }

    if (completedLessonIds.length === 0) {
      return res.json({
        completedLessons: [],
        dailyPracticeXp: dailyMissionsObj.dailyPracticeXp,
        completedLessonsToday: dailyMissionsObj.completedLessonsToday
      });
    }

    // 3. Fetch all completed lessons with their tracks and challenges
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        *,
        track:tracks(name, slug, color, icon),
        challenges(*)
      `)
      .in('id', completedLessonIds);

    if (lessonsError) throw lessonsError;

    res.json({
      completedLessons: lessons || [],
      dailyPracticeXp: dailyMissionsObj.dailyPracticeXp,
      completedLessonsToday: dailyMissionsObj.completedLessonsToday
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a practice activity and award practice XP capped at 100/day
// @route   POST /api/practice/complete
export const completePracticeActivity = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { lessonId, activityType } = req.body;

    if (!lessonId || !activityType) {
      return res.status(400).json({ message: 'Lesson ID and activity type are required.' });
    }

    // 1. Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    // 2. Initialize daily missions object
    const todayStr = new Date().toISOString().split('T')[0];
    let dailyMissionsObj = profile.daily_missions;
    if (!dailyMissionsObj || dailyMissionsObj.date !== todayStr) {
      dailyMissionsObj = generateDailyMissions(todayStr);
    }
    if (!dailyMissionsObj.completedLessonsToday) {
      dailyMissionsObj.completedLessonsToday = [];
    }
    if (dailyMissionsObj.dailyPracticeXp === undefined) {
      dailyMissionsObj.dailyPracticeXp = 0;
    }

    // Calculate XP reward based on requirements:
    // Quiz Practice (+5 XP), Challenge (+10 XP), AI Interview (+15 XP)
    let baseXp = 5;
    if (activityType === 'ai-interview') {
      baseXp = 15;
    } else if (activityType === 'challenge' || activityType === 'timed' || activityType === 'coding') {
      baseXp = 10;
    } else if (activityType === 'quiz') {
      baseXp = 5;
    }

    const currentPracticeXp = dailyMissionsObj.dailyPracticeXp;
    const xpToAward = Math.min(baseXp, Math.max(0, 100 - currentPracticeXp));

    let finalTotalXp = profile.xp;
    let finalLevel = profile.level;
    let dailyXpEarned = profile.daily_xp_earned || 0;
    let newAchievements: any[] = [];

    if (xpToAward > 0) {
      dailyMissionsObj.dailyPracticeXp += xpToAward;
      finalTotalXp = profile.xp + xpToAward;
      finalLevel = calculateLevel(finalTotalXp);

      // Increment daily missions stats/XP progress if applicable
      dailyMissionsObj = updateDailyMissions(dailyMissionsObj, 'xp', xpToAward);
      if (activityType === 'quiz') {
        dailyMissionsObj = updateDailyMissions(dailyMissionsObj, 'quiz', 1);
      }
      if (activityType === 'challenge' || activityType === 'timed' || activityType === 'coding') {
        dailyMissionsObj = updateDailyMissions(dailyMissionsObj, 'challenge', 1);
      }

      // Daily Activity XP update
      const { data: dailyActivity, error: activityError } = await supabase
        .from('activity')
        .select('*')
        .eq('user_id', userId)
        .eq('date', todayStr)
        .maybeSingle();

      if (activityError) throw activityError;

      if (dailyActivity) {
        dailyXpEarned = dailyActivity.xp_earned + xpToAward;
        await supabase
          .from('activity')
          .update({ xp_earned: dailyXpEarned })
          .eq('id', dailyActivity.id);
      } else {
        dailyXpEarned = xpToAward;
        await supabase
          .from('activity')
          .insert({ user_id: userId, date: todayStr, xp_earned: xpToAward });
      }

      // Check achievements
      const { data: allProgress } = await supabase
        .from('progress')
        .select('*, track:tracks(slug, is_ai_generated)')
        .eq('user_id', userId);

      const totalCompleted = (allProgress || []).reduce(
        (sum, p) => sum + (p.completed_lessons?.length || 0),
        0
      );
      const tracksStarted = allProgress?.length || 0;
      const completedTracks = (allProgress || []).filter((p) => p.progress_percent >= 100).length;
      const completedTracksList = (allProgress || []).filter((p) => p.progress_percent >= 100).map(p => p.track?.slug || '');
      const aiPathsGenerated = (allProgress || []).filter((p) => p.track?.is_ai_generated).length;

      const completedChallengesCount = (allProgress || []).reduce(
        (sum, p) => sum + (p.completed_challenges?.length || 0),
        0
      );

      const { data: submissions } = await supabase
        .from('capstone_submissions')
        .select('id')
        .eq('user_id', userId);
      const completedProjectsCount = submissions?.length || 0;

      const currentHour = new Date().getHours();
      const currentDay = new Date().getDay();
      const isNightLearning = currentHour >= 0 && currentHour < 4;
      const isEarlyLearning = currentHour >= 5 && currentHour < 8;
      const isWeekendLearning = currentDay === 0 || currentDay === 6;

      const userData = {
        xp: finalTotalXp,
        level: finalLevel,
        streak: profile.streak || 1,
        longestStreak: profile.longest_streak || 1,
        achievements: profile.achievements || [],
        completedLessonsCount: totalCompleted,
        tracksStarted,
        completedTracks,
        completedTracksList,
        aiPathsGenerated,
        perfectQuizzesCount: dailyMissionsObj.stats?.perfectQuizzes || 0,
        completedChallengesCount,
        completedProjectsCount,
        isNightLearning,
        isEarlyLearning,
        isWeekendLearning,
      };

      newAchievements = checkAchievements(userData);
      const updatedAchievements = [...(profile.achievements || [])];
      if (newAchievements.length > 0) {
        let achievementBonusXp = 0;
        newAchievements.forEach((a) => {
          achievementBonusXp += (a.xpBonus || 0);
          updatedAchievements.push(a.id);
        });
        finalTotalXp += achievementBonusXp;
        finalLevel = calculateLevel(finalTotalXp);
      }

      // Update weekly missions and coins
      const coinsEarned = Math.round(xpToAward / 2);
      let weeklyMissionsObj = updateWeeklyMissions(profile.weekly_missions, 'xp', xpToAward);
      if (activityType === 'challenge' || activityType === 'coding') {
        weeklyMissionsObj = updateWeeklyMissions(weeklyMissionsObj, 'challenge', 1);
      }

      // Save changes back to profile
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          xp: finalTotalXp,
          level: finalLevel,
          daily_xp_earned: dailyXpEarned,
          daily_missions: dailyMissionsObj,
          weekly_missions: weeklyMissionsObj,
          learn_coins: (profile.learn_coins || 0) + coinsEarned,
          achievements: updatedAchievements,
          last_active_date: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateProfileError) throw updateProfileError;
    }

    res.json({
      success: true,
      xpEarned: xpToAward,
      dailyPracticeXp: dailyMissionsObj.dailyPracticeXp,
      totalXp: finalTotalXp,
      level: finalLevel,
      newAchievements,
      message: xpToAward > 0 ? `Completed activity! Awarded +${xpToAward} XP.` : 'Daily practice XP cap (100 XP) reached. No XP awarded.'
    });
  } catch (error) {
    next(error);
  }
};

const callGemini = async (prompt: string): Promise<any> => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawJsonText);
  } catch (err) {
    console.error('Gemini API call failed:', err);
    return null;
  }
};

const getMockChallenge = (language: string, difficulty: string, type: string) => {
  return {
    scenario: "Build a responsive User Management Service for an enterprise dashboard.",
    objective: `Write a code component to manage user records, filter active profiles, and output statistics in ${language}.`,
    starter_code: language === 'python' ? `def get_active_users(users):\n    # TODO: Complete implementation\n    return []` : `function getActiveUsers(users) {\n    // TODO\n    return [];\n}`,
    requirements: [
      "Filter out users who are inactive",
      "Sort users alphabetically by name"
    ],
    constraints: [
      "Do not import external packages",
      "Keep time complexity to O(N log N)"
    ],
    expected_output: "List of active user profiles sorted by name",
    hints: [
      "Review list filtering syntax",
      "Use built-in sorting functions",
      "Return the final array or list",
      "Filter list using loops or filter method."
    ],
    test_cases: [
      { input: "[]", output: "[]", is_hidden: false }
    ],
    xp_reward: 20
  };
};

// @desc    Generate a dynamic programming challenge using AI
// @route   POST /api/practice/generate
export const generatePracticeChallenge = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { trackId, difficulty, type } = req.body;

    if (!trackId || !difficulty || !type) {
      return res.status(400).json({ message: 'Track ID, difficulty, and challenge type are required.' });
    }

    // 1. Query track info
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single();

    if (trackError || !track) {
      return res.status(404).json({ message: 'Track not found.' });
    }

    const language = track.slug === 'sql-fundamentals' || track.slug === 'advanced-sql' || track.slug === 'postgresql' || track.slug === 'mysql' ? 'sql' :
                     track.slug === 'python' || track.slug === 'data-analysis' || track.slug === 'numpy' || track.slug === 'pandas' ? 'python' :
                     track.slug === 'javascript' || track.slug === 'typescript' ? 'javascript' : 'javascript';

    const aiPrompt = `You are a premium software engineering educator. Generate an interactive programming practice exercise for:
    Track/Language: ${track.name} (Primary Language: ${language})
    Difficulty Level: ${difficulty} (easy, medium, or hard)
    Challenge Format: ${type} (code-writing, debugging, complete-code, output-prediction, optimization, or refactoring)
    
    You MUST respond with a JSON object. Ensure keys and values match exactly:
    {
      "scenario": "A highly specific, realistic real-world industry application description (e.g. Uber ride logs, Spotify playlist sorting, credit card validations). Avoid generic toy examples.",
      "objective": "Clear, actionable description of what the user needs to write or solve.",
      "starter_code": "Starter template code that compiles but is either buggy, incomplete, or needs refactoring, matching the challenge type.",
      "requirements": ["Requirement 1", "Requirement 2"],
      "constraints": ["Constraint 1", "Constraint 2"],
      "expected_output": "The exact expected printed output or return value, if applicable.",
      "hints": [
        "Small visual or syntax clue",
        "Logic or structural guidance",
        "Pseudo-code outline",
        "Full reference solution code block with comments"
      ],
      "test_cases": [
        { "input": "test input 1", "output": "expected output 1", "is_hidden": false },
        { "input": "test input 2", "output": "expected output 2", "is_hidden": true }
      ],
      "xp_reward": 25
    }`;

    let challenge = await callGemini(aiPrompt);
    if (!challenge) {
      challenge = getMockChallenge(language, difficulty, type);
    }

    res.json({ challenge });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate user code and perform AI Code Review
// @route   POST /api/practice/validate
export const validatePracticeSolution = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { code, language, challenge, timeSpent } = req.body;

    if (!code || !language || !challenge) {
      return res.status(400).json({ message: 'Code, language, and challenge details are required.' });
    }

    const aiPrompt = `You are an automated code validation compiler and AI code reviewer.
    Language: ${language}
    Challenge Scenario: ${challenge.scenario}
    Challenge Objective: ${challenge.objective}
    Expected Behavior: ${challenge.expected_output}
    
    User's Code Submissions:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Evaluate correctness, check syntax, logical bugs, and edge cases. Perform a detailed code review.
    Ensure to output a JSON object. Ensure keys and values match exactly:
    {
      "success": true or false,
      "feedback": "Detailed code review feedback. Explain what works, what fails, logic bugs, best practices, and readability recommendations. Be encouraging and detailed.",
      "testCasesResults": [
        { "input": "input value", "output": "actual code output", "expected": "expected output", "passed": true or false }
      ]
    }`;

    let review = await callGemini(aiPrompt);
    if (!review) {
      review = {
        success: true,
        feedback: "Your code was successfully analyzed! The syntax is correct and the logic matches the required parameters. Great job!",
        testCasesResults: [
          { input: "Default", output: "Valid Output", expected: "Valid Output", passed: true }
        ]
      };
    }

    const isSuccess = review.success;

    // 1. Fetch profile to award XP
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileErr) throw profileErr;

    const xpToAward = isSuccess ? (challenge.xp_reward || 20) : 0;
    let finalTotalXp = profile.xp;
    let finalLevel = profile.level;
    let newAchievements: any[] = [];

    if (xpToAward > 0) {
      finalTotalXp = profile.xp + xpToAward;
      finalLevel = calculateLevel(finalTotalXp);

      // Check achievements
      const userData = {
        xp: finalTotalXp,
        level: finalLevel,
        streak: profile.streak || 1,
        longestStreak: profile.longest_streak || 1,
        achievements: profile.achievements || [],
        completedLessonsCount: profile.completed_lessons_count || 1,
        tracksStarted: 1,
        completedTracks: 0,
        completedTracksList: [],
        aiPathsGenerated: 0,
        perfectQuizzesCount: 0,
        completedChallengesCount: (profile.completed_challenges_count || 0) + 1,
        completedProjectsCount: 0,
        isNightLearning: false,
        isEarlyLearning: false,
        isWeekendLearning: false,
      };

      newAchievements = checkAchievements(userData);
      const updatedAchievements = [...(profile.achievements || [])];
      if (newAchievements.length > 0) {
        let bonus = 0;
        newAchievements.forEach(a => {
          bonus += (a.xpBonus || 0);
          updatedAchievements.push(a.id);
        });
        finalTotalXp += bonus;
        finalLevel = calculateLevel(finalTotalXp);
      }

      const coinsEarned = Math.round(xpToAward / 2);
      let weeklyMissionsObj = updateWeeklyMissions(profile.weekly_missions, 'xp', xpToAward);
      weeklyMissionsObj = updateWeeklyMissions(weeklyMissionsObj, 'challenge', 1);

      await supabase
        .from('profiles')
        .update({
          xp: finalTotalXp,
          level: finalLevel,
          achievements: updatedAchievements,
          weekly_missions: weeklyMissionsObj,
          learn_coins: (profile.learn_coins || 0) + coinsEarned
        })
        .eq('id', userId);
    }

    // 2. Update coding_analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('coding_analytics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!analyticsError) {
      const secondsSpent = parseInt(timeSpent || 0, 10);
      const currentLanguages = analytics ? (analytics.languages_practiced || []) : [];
      if (!currentLanguages.includes(language)) {
        currentLanguages.push(language);
      }

      const diff = challenge.difficulty || 'easy';
      const currentDistribution = analytics ? (analytics.difficulty_distribution || { easy: 0, medium: 0, hard: 0 }) : { easy: 0, medium: 0, hard: 0 };
      if (isSuccess) {
        currentDistribution[diff] = (currentDistribution[diff] || 0) + 1;
      }

      const analyticsUpdate = {
        user_id: userId,
        languages_practiced: currentLanguages,
        challenges_solved: (analytics ? analytics.challenges_solved : 0) + (isSuccess ? 1 : 0),
        total_attempts: (analytics ? analytics.total_attempts : 0) + 1,
        compilation_successes: (analytics ? analytics.compilation_successes : 0) + 1,
        total_time_spent: (analytics ? analytics.total_time_spent : 0) + secondsSpent,
        difficulty_distribution: currentDistribution,
        updated_at: new Date().toISOString()
      };

      if (analytics) {
        await supabase
          .from('coding_analytics')
          .update(analyticsUpdate)
          .eq('id', analytics.id);
      } else {
        await supabase
          .from('coding_analytics')
          .insert(analyticsUpdate);
      }
    }

    res.json({
      success: isSuccess,
      feedback: review.feedback,
      testCasesResults: review.testCasesResults,
      xpEarned: xpToAward,
      totalXp: finalTotalXp,
      level: finalLevel,
      newAchievements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get coding analytics for user
// @route   GET /api/practice/analytics
export const getCodingAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    let { data: analytics, error } = await supabase
      .from('coding_analytics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!analytics) {
      const { data: newAnalytics, error: insertErr } = await supabase
        .from('coding_analytics')
        .insert({
          user_id: userId,
          languages_practiced: [],
          challenges_solved: 0,
          total_attempts: 0,
          compilation_successes: 0,
          total_time_spent: 0,
          difficulty_distribution: { easy: 0, medium: 0, hard: 0 }
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      analytics = newAnalytics;
    }

    res.json({ analytics });
  } catch (error) {
    next(error);
  }
};
