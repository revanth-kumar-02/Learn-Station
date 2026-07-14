import { supabase } from '../config/db';

/**
 * Creates a notification in the database for a user, respecting their preferences.
 * 
 * @param userId - The ID of the user receiving the notification
 * @param title - Notification title
 * @param message - Detailed message body
 * @param type - Notification type (e.g. 'Learning', 'Achievement', 'XP', 'Level Up', 'Badge', 'Certificate', 'AI', 'Announcement', 'Admin', 'Leaderboard', 'Streak')
 * @param icon - Emoji or icon class name
 * @param actionUrl - Optional link to open when notification is clicked
 * @param metadata - Optional extra payload data
 * @param scheduledAt - Optional date/time when this notification becomes active/visible
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string,
  icon: string,
  actionUrl?: string,
  metadata?: any,
  scheduledAt?: string
): Promise<void> => {
  try {
    // 1. Fetch user's settings to check if they have enabled notifications for this category
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (settingsError) {
      console.error('[Notification Engine] Error fetching settings for check:', settingsError);
    }

    // Determine if notification is enabled based on user preference
    let isEnabled = true;
    if (settings) {
      const typeLower = type.toLowerCase();
      if ((typeLower === 'learning' || typeLower === 'xp') && !settings.lesson_notifications) {
        isEnabled = false;
      } else if ((typeLower === 'achievement' || typeLower === 'badge' || typeLower === 'level up') && !settings.achievement_notifications) {
        isEnabled = false;
      } else if (typeLower === 'ai' && !settings.ai_notifications) {
        isEnabled = false;
      } else if (typeLower === 'certificate' && !settings.certificate_notifications) {
        isEnabled = false;
      } else if (typeLower === 'announcement' && !settings.announcement_notifications) {
        isEnabled = false;
      }
    }

    if (!isEnabled) {
      console.log(`[Notification Engine] Muted: User ${userId} has muted type "${type}" notifications`);
      return;
    }

    // 2. Insert notification
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        icon,
        action_url: actionUrl || null,
        metadata: metadata || null,
        scheduled_at: scheduledAt || new Date().toISOString()
      });

    if (insertError) {
      console.error('[Notification Engine] Error inserting notification record:', insertError);
    } else {
      console.log(`[Notification Engine] Created "${title}" notification for user ${userId}`);
    }
  } catch (err) {
    console.error('[Notification Engine] Failed to dispatch notification:', err);
  }
};
