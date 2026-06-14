import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';

// ==========================================
// 1. Dashboard Statistics
// ==========================================
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    
    // Six days ago at midnight local time (to cover exactly 7 days of charts: today + 6 past days)
    const sixDaysAgo = new Date(today);
    sixDaysAgo.setDate(today.getDate() - 6);
    sixDaysAgo.setHours(0, 0, 0, 0);

    // Seven days ago for active users (last 7 days active)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // 24 hours ago for daily signups
    const twentyFourHoursAgo = new Date(today);
    twentyFourHoursAgo.setHours(today.getHours() - 24);

    const toLocalDateStr = (dObj: Date) => {
      const year = dObj.getFullYear();
      const month = String(dObj.getMonth() + 1).padStart(2, '0');
      const day = String(dObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const sixDaysAgoStr = toLocalDateStr(sixDaysAgo);

    // Execute all queries in parallel to drastically improve load time
    const [
      totalUsersRes,
      activeUsersRes,
      xpDataRes,
      progressDataRes,
      aiPathsRes,
      dailySignupsRes,
      recentLogsRes,
      recentSignupsRes,
      recentActivitiesRes
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('last_active_date', sevenDaysAgo.toISOString()),
      supabase.from('profiles').select('xp'),
      supabase.from('progress').select('completed_lessons, progress_percent'),
      supabase.from('tracks').select('id', { count: 'exact', head: true }).eq('is_ai_generated', true),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', twentyFourHoursAgo.toISOString()),
      supabase.from('activity').select('*, profiles(name, username)').order('date', { ascending: false }).limit(10),
      supabase.from('profiles').select('created_at').gte('created_at', sixDaysAgo.toISOString()),
      supabase.from('activity').select('date, xp_earned').gte('date', sixDaysAgoStr)
    ]);

    // Error handling
    if (totalUsersRes.error) throw totalUsersRes.error;
    if (activeUsersRes.error) throw activeUsersRes.error;
    if (xpDataRes.error) throw xpDataRes.error;
    if (progressDataRes.error) throw progressDataRes.error;
    if (aiPathsRes.error) throw aiPathsRes.error;
    if (dailySignupsRes.error) throw dailySignupsRes.error;
    if (recentLogsRes.error) throw recentLogsRes.error;
    if (recentSignupsRes.error) throw recentSignupsRes.error;
    if (recentActivitiesRes.error) throw recentActivitiesRes.error;

    // A. User Counts
    const totalUsers = totalUsersRes.count || 0;
    const activeUsers = activeUsersRes.count || 0;

    // B. Total XP Sum
    const totalXp = (xpDataRes.data || []).reduce((sum, u) => sum + (u.xp || 0), 0);

    // C. Lessons & Track Completions
    const totalLessonsCompleted = (progressDataRes.data || []).reduce(
      (sum, p) => sum + (p.completed_lessons?.length || 0),
      0
    );
    const trackCompletions = (progressDataRes.data || []).filter(
      (p) => p.progress_percent >= 100
    ).length;

    // D. AI Generated paths count
    const aiPaths = aiPathsRes.count || 0;

    // E. Daily Signups (Last 24 Hours)
    const dailySignups = dailySignupsRes.count || 0;

    // F. Recent Activity Logs
    const recentActivity = (recentLogsRes.data || []).map((log: any) => ({
      id: log.id,
      date: log.date,
      xp: log.xp_earned,
      name: log.profiles?.name || 'Learner',
      username: log.profiles?.username || 'user',
    }));

    // G. Signups & Active Users charts data (last 7 days, processed in memory)
    const dailyStats = [];
    const signupDates = (recentSignupsRes.data || []).map(u => toLocalDateStr(new Date(u.created_at)));
    const activityList = recentActivitiesRes.data || [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = toLocalDateStr(d);

      // Signups count on this day
      const signupsOnDay = signupDates.filter(dStr => dStr === dateStr).length;

      // Active on this day: activity table entries
      const xpEarnedOnDay = activityList
        .filter((act: any) => act.date === dateStr)
        .reduce((sum: number, act: any) => sum + (act.xp_earned || 0), 0);

      dailyStats.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        signups: signupsOnDay,
        xpEarned: xpEarnedOnDay,
      });
    }

    // Platform Health Status details
    const health = {
      status: 'Healthy',
      database: 'Connected',
      apiUptime: process.uptime(),
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    };

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalXp,
        totalLessonsCompleted,
        trackCompletions,
        aiPathsGenerated: aiPaths,
        dailySignups,
      },
      recentActivity,
      dailyStats,
      health,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. User Management
// ==========================================
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const callerRole = req.user!.role;
    const { search } = req.query;

    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Enforce Protection Rules:
    // Normal admins cannot see Owners or other Admin profiles.
    if (callerRole === 'admin') {
      query = query.eq('role', 'student');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    res.json({ users: users || [] });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, role, is_suspended } = req.body;
    const callerRole = req.user!.role;

    // Fetch user to update
    const { data: targetUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Protection Rule: ★ OWNER account cannot be edited or suspended.
    if (targetUser.role === 'owner') {
      return res.status(403).json({ message: 'Forbidden: ★ OWNER account cannot be modified by anyone.' });
    }

    // Protection Rule: Admins cannot edit other Admins or elevate users to Admin/Owner.
    if (callerRole === 'admin') {
      if (targetUser.role === 'admin') {
        return res.status(403).json({ message: 'Forbidden: Administrators cannot modify other administrator accounts.' });
      }
      if (role && role !== 'student') {
        return res.status(403).json({ message: 'Forbidden: Only the Owner can modify administrator roles.' });
      }
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (is_suspended !== undefined) updates.is_suspended = is_suspended;

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ message: 'User updated successfully', user: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const callerRole = req.user!.role;

    // Fetch user to delete
    const { data: targetUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Protection Rule: ★ OWNER account cannot be deleted.
    if (targetUser.role === 'owner') {
      return res.status(403).json({ message: 'Forbidden: ★ OWNER account cannot be deleted.' });
    }

    // Protection Rule: Admins cannot delete other Admins or Owners.
    if (callerRole === 'admin') {
      if (targetUser.role === 'admin') {
        return res.status(403).json({ message: 'Forbidden: Administrators cannot delete other administrator accounts.' });
      }
    }

    // Delete sub-table user data
    await supabase.from('progress').delete().eq('user_id', id);
    await supabase.from('activity').delete().eq('user_id', id);
    await supabase.from('certificates').delete().eq('user_id', id);
    await supabase.from('capstone_submissions').delete().eq('user_id', id);

    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. Track Management
// ==========================================
export const getTracks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    res.json({ tracks: tracks || [] });
  } catch (error) {
    next(error);
  }
};

export const createTrack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, slug, description, icon, color, display_order, is_ai_generated } = req.body;
    
    // Auto-calculate order if not provided
    let finalOrder = display_order;
    if (finalOrder === undefined) {
      const { data: maxTrack } = await supabase
        .from('tracks')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      finalOrder = maxTrack ? (maxTrack.display_order || 0) + 1 : 1;
    }

    const { data: track, error } = await supabase
      .from('tracks')
      .insert({
        name,
        slug,
        description,
        icon: icon || 'polygon',
        color: color || '#3B82F6',
        display_order: finalOrder,
        total_lessons: 0,
        is_ai_generated: is_ai_generated || false,
        capstone_project: req.body.capstone_project || {},
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Track created successfully', track });
  } catch (error) {
    next(error);
  }
};

export const updateTrack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, color, display_order, capstone_project } = req.body;

    const { data: track, error } = await supabase
      .from('tracks')
      .update({
        name,
        slug,
        description,
        icon,
        color,
        display_order,
        capstone_project,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Track updated successfully', track });
  } catch (error) {
    next(error);
  }
};

export const deleteTrack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Delete child challenges, lessons, modules, and track
    const { data: lessons } = await supabase.from('lessons').select('id').eq('track_id', id);
    const lessonIds = (lessons || []).map((l) => l.id);

    if (lessonIds.length > 0) {
      await supabase.from('challenges').delete().in('lesson_id', lessonIds);
    }
    await supabase.from('lessons').delete().eq('track_id', id);
    await supabase.from('modules').delete().eq('track_id', id);
    await supabase.from('progress').delete().eq('track_id', id);

    const { error: trackErr } = await supabase.from('tracks').delete().eq('id', id);
    if (trackErr) throw trackErr;

    res.json({ message: 'Track and all associated curriculum deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. Module Management
// ==========================================
export const getModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { track_id } = req.query;
    let query = supabase.from('modules').select('*, track:tracks(name)');
    if (track_id) {
      query = query.eq('track_id', track_id);
    }
    const { data: modules, error } = await query.order('display_order', { ascending: true });
    if (error) throw error;
    res.json({ modules: modules || [] });
  } catch (error) {
    next(error);
  }
};

export const createModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { track_id, name, display_order, learning_objective, mini_project } = req.body;

    let finalOrder = display_order;
    if (finalOrder === undefined) {
      const { data: maxMod } = await supabase
        .from('modules')
        .select('display_order')
        .eq('track_id', track_id)
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      finalOrder = maxMod ? (maxMod.display_order || 0) + 1 : 1;
    }

    const { data: mod, error } = await supabase
      .from('modules')
      .insert({
        track_id,
        name,
        display_order: finalOrder,
        learning_objective: learning_objective || '',
        mini_project: mini_project || {},
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Module created successfully', module: mod });
  } catch (error) {
    next(error);
  }
};

export const updateModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, display_order, learning_objective, mini_project } = req.body;

    const { data: mod, error } = await supabase
      .from('modules')
      .update({
        name,
        display_order,
        learning_objective,
        mini_project,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Module updated successfully', module: mod });
  } catch (error) {
    next(error);
  }
};

export const deleteModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Delete associated lessons & challenges
    const { data: lessons } = await supabase.from('lessons').select('id').eq('module_id', id);
    const lessonIds = (lessons || []).map((l) => l.id);

    if (lessonIds.length > 0) {
      await supabase.from('challenges').delete().in('lesson_id', lessonIds);
      await supabase.from('lessons').delete().in('id', lessonIds);
    }

    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'Module and all contained lessons deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. Lesson Management
// ==========================================
export const getLessons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { track_id, module_id } = req.query;
    let query = supabase.from('lessons').select('*, track:tracks(name), module:modules(name)');
    if (track_id) query = query.eq('track_id', track_id);
    if (module_id) query = query.eq('module_id', module_id);

    const { data: lessons, error } = await query.order('display_order', { ascending: true });
    if (error) throw error;
    res.json({ lessons: lessons || [] });
  } catch (error) {
    next(error);
  }
};

export const createLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      track_id,
      module_id,
      title,
      slug,
      display_order,
      estimated_minutes,
      xp_reward,
      concept_title,
      concept_content,
      concept_highlights,
      example_language,
      example_code,
      example_explanation,
      practice_type,
      practice_instruction,
      practice_template,
      practice_answer,
      summary,
    } = req.body;

    let finalOrder = display_order;
    if (finalOrder === undefined) {
      const { data: maxL } = await supabase
        .from('lessons')
        .select('display_order')
        .eq('module_id', module_id)
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      finalOrder = maxL ? (maxL.display_order || 0) + 1 : 1;
    }

    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        track_id,
        module_id,
        title,
        slug,
        display_order: finalOrder,
        estimated_minutes: estimated_minutes || 10,
        xp_reward: xp_reward || 50,
        concept_title,
        concept_content,
        concept_highlights: concept_highlights || [],
        example_language,
        example_code,
        example_explanation,
        practice_type,
        practice_instruction,
        practice_template,
        practice_answer,
        summary,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment track total_lessons
    const { data: currentTrack } = await supabase.from('tracks').select('total_lessons').eq('id', track_id).single();
    if (currentTrack) {
      await supabase
        .from('tracks')
        .update({ total_lessons: (currentTrack.total_lessons || 0) + 1 })
        .eq('id', track_id);
    }

    res.json({ message: 'Lesson created successfully', lesson });
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      display_order,
      estimated_minutes,
      xp_reward,
      concept_title,
      concept_content,
      concept_highlights,
      example_language,
      example_code,
      example_explanation,
      practice_type,
      practice_instruction,
      practice_template,
      practice_answer,
      summary,
    } = req.body;

    const { data: lesson, error } = await supabase
      .from('lessons')
      .update({
        title,
        slug,
        display_order,
        estimated_minutes,
        xp_reward,
        concept_title,
        concept_content,
        concept_highlights,
        example_language,
        example_code,
        example_explanation,
        practice_type,
        practice_instruction,
        practice_template,
        practice_answer,
        summary,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Lesson updated successfully', lesson });
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Get track_id to decrement total lessons
    const { data: lesson } = await supabase.from('lessons').select('track_id').eq('id', id).single();

    // Delete challenges
    await supabase.from('challenges').delete().eq('lesson_id', id);

    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;

    if (lesson) {
      const { data: currentTrack } = await supabase.from('tracks').select('total_lessons').eq('id', lesson.track_id).single();
      if (currentTrack) {
        await supabase
          .from('tracks')
          .update({ total_lessons: Math.max(0, (currentTrack.total_lessons || 1) - 1) })
          .eq('id', lesson.track_id);
      }
    }

    res.json({ message: 'Lesson and all challenges deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. Quiz / Challenges Management
// ==========================================
export const getChallenges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { lesson_id } = req.query;
    let query = supabase.from('challenges').select('*, lesson:lessons(title)');
    if (lesson_id) query = query.eq('lesson_id', lesson_id);

    const { data: challenges, error } = await query;
    if (error) throw error;
    res.json({ challenges: challenges || [] });
  } catch (error) {
    next(error);
  }
};

export const createChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      lesson_id,
      type,
      question,
      options,
      correct_index,
      template,
      answer,
      explanation,
      xp_reward,
    } = req.body;

    const { data: challenge, error } = await supabase
      .from('challenges')
      .insert({
        lesson_id,
        type: type || 'multiple-choice',
        question,
        options: options || [],
        correct_index: correct_index !== undefined ? correct_index : 0,
        template: template || null,
        answer: answer || null,
        explanation: explanation || '',
        xp_reward: xp_reward || 10,
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Quiz challenge created successfully', challenge });
  } catch (error) {
    next(error);
  }
};

export const updateChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      type,
      question,
      options,
      correct_index,
      template,
      answer,
      explanation,
      xp_reward,
    } = req.body;

    const { data: challenge, error } = await supabase
      .from('challenges')
      .update({
        type,
        question,
        options,
        correct_index,
        template,
        answer,
        explanation,
        xp_reward,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Quiz challenge updated successfully', challenge });
  } catch (error) {
    next(error);
  }
};

export const deleteChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('challenges').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Quiz challenge deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. System Settings
// ==========================================
export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: settings, error } = await supabase.from('system_settings').select('*');
    if (error) throw error;

    const settingsMap = (settings || []).reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, any>);

    res.json({ settings: settingsMap });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updates = req.body; // e.g. { ai_generation_enabled: false, maintenance_mode: true }

    for (const [key, value] of Object.entries(updates)) {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value });
      if (error) throw error;
    }

    res.json({ message: 'System settings updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8. Announcements
// ==========================================
export const getAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ announcements: announcements || [] });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, type, is_active } = req.body;

    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        type: type || 'info',
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Announcement created successfully', announcement });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
