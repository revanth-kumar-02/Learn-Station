import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import { createNotification } from '../utils/notifications';

// ================= FRIENDS SYSTEM =================

// @desc    Get friends lists, pending, and suggestions
// @route   GET /api/community/friends
export const getFriendsList = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

    // 1. Fetch user's friends list
    const { data: friendsRows, error: friendsErr } = await supabase
      .from('friends')
      .select('*, sender:profiles!user_id(*), receiver:profiles!friend_id(*)')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (friendsErr) throw friendsErr;

    const friendsList = (friendsRows || []).map(row => {
      const isSender = row.user_id === userId;
      return {
        id: row.id,
        status: row.status,
        friendProfile: isSender ? row.receiver : row.sender,
        isOutgoing: isSender
      };
    });

    // Filter into categories
    const activeFriends = friendsList.filter(f => f.status === 'accepted').map(f => f.friendProfile);
    const pendingIncoming = friendsList.filter(f => f.status === 'pending' && !f.isOutgoing).map(f => f.friendProfile);
    const pendingOutgoing = friendsList.filter(f => f.status === 'pending' && f.isOutgoing).map(f => f.friendProfile);

    // 2. Suggestions: fetch recent users that are not current friends or pending
    const existingIds = [userId, ...friendsList.map(f => f.friendProfile?.id).filter(Boolean)];
    const { data: suggestions } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${existingIds.join(',')})`)
      .limit(5);

    res.json({
      active: activeFriends,
      incoming: pendingIncoming,
      outgoing: pendingOutgoing,
      suggestions: suggestions || []
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a friend request
// @route   POST /api/community/friends/request
export const sendFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { friendId } = req.body;

    if (!friendId) return res.status(400).json({ message: 'Friend ID is required.' });

    const { error } = await supabase
      .from('friends')
      .insert({ user_id: userId, friend_id: friendId, status: 'pending' });

    if (error) {
      return res.status(400).json({ message: 'Friend request already exists or cannot be sent.' });
    }

    // Send notifications
    await createNotification(
      friendId,
      'New Friend Request! 👋',
      'A student wants to connect with you on LearnStation.',
      'Connection',
      '👥',
      '/community'
    );

    res.json({ success: true, message: 'Friend request sent.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept a friend request
// @route   POST /api/community/friends/accept
export const acceptFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { friendId } = req.body;

    if (!friendId) return res.status(400).json({ message: 'Friend ID is required.' });

    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('user_id', friendId)
      .eq('friend_id', userId);

    if (error) throw error;

    await createNotification(
      friendId,
      'Friend Request Accepted! 🎉',
      'You are now connected with another student on LearnStation.',
      'Connection',
      '👥',
      '/community'
    );

    res.json({ success: true, message: 'Friend request accepted.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject/Cancel a friend request
// @route   POST /api/community/friends/reject
export const rejectFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { friendId } = req.body;

    if (!friendId) return res.status(400).json({ message: 'Friend ID is required.' });

    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

    if (error) throw error;

    res.json({ success: true, message: 'Connection request deleted.' });
  } catch (err) {
    next(err);
  }
};

// ================= STUDY GROUPS =================

// @desc    Get study groups
// @route   GET /api/community/groups
export const getStudyGroups = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

    // Get groups user belongs to
    const { data: memberRows } = await supabase
      .from('study_group_members')
      .select('group_id')
      .eq('user_id', userId);

    const groupIds = (memberRows || []).map(r => r.group_id);

    let myGroups: any[] = [];
    if (groupIds.length > 0) {
      const { data } = await supabase
        .from('study_groups')
        .select('*')
        .in('id', groupIds);
      myGroups = data || [];
    }

    // Get all groups for discovery
    const { data: discoverGroups } = await supabase
      .from('study_groups')
      .select('*')
      .limit(10);

    res.json({
      myGroups,
      discover: (discoverGroups || []).filter(g => !groupIds.includes(g.id))
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create study group
// @route   POST /api/community/groups/create
export const createStudyGroup = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { name, description, category, learningGoal } = req.body;

    if (!name) return res.status(400).json({ message: 'Group Name is required.' });

    const { data: group, error } = await supabase
      .from('study_groups')
      .insert({ name, description, category, learning_goal: learningGoal, admin_id: userId })
      .select()
      .single();

    if (error || !group) throw error;

    // Join as admin
    await supabase
      .from('study_group_members')
      .insert({ group_id: group.id, user_id: userId, role: 'admin' });

    res.json({ success: true, group });
  } catch (err) {
    next(err);
  }
};

// @desc    Join study group
// @route   POST /api/community/groups/join
export const joinStudyGroup = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { groupId } = req.body;

    if (!groupId) return res.status(400).json({ message: 'Group ID is required.' });

    const { error } = await supabase
      .from('study_group_members')
      .insert({ group_id: groupId, user_id: userId, role: 'member' });

    if (error) {
      return res.status(400).json({ message: 'You are already a member of this study group.' });
    }

    res.json({ success: true, message: 'Joined study group successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Leave study group
// @route   POST /api/community/groups/leave
export const leaveStudyGroup = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { groupId } = req.body;

    if (!groupId) return res.status(400).json({ message: 'Group ID is required.' });

    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true, message: 'Left study group.' });
  } catch (err) {
    next(err);
  }
};

// ================= FORUM DISCUSSIONS =================

// @desc    Get forum posts by track
// @route   GET /api/community/forum
export const getForumPosts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { trackId } = req.query;

    let query = supabase
      .from('forum_posts')
      .select('*, author:profiles(name, username, avatar_url, level, reputation), replies:forum_replies(*, author:profiles(name, username, avatar_url))')
      .order('created_at', { ascending: false });

    if (trackId) {
      query = query.eq('track_id', trackId);
    }

    const { data: posts, error } = await query;
    if (error) throw error;

    res.json({ posts: posts || [] });
  } catch (err) {
    next(err);
  }
};

// @desc    Create question thread
// @route   POST /api/community/forum/post
export const createForumPost = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { trackId, title, content } = req.body;

    if (!trackId || !title || !content) {
      return res.status(400).json({ message: 'Track ID, title, and content are required.' });
    }

    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({ user_id: userId, track_id: trackId, title, content })
      .select()
      .single();

    if (error || !post) throw error;

    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// @desc    Reply to thread
// @route   POST /api/community/forum/reply
export const createForumReply = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { postId, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({ message: 'Post ID and content are required.' });
    }

    const { data: reply, error } = await supabase
      .from('forum_replies')
      .insert({ user_id: userId, post_id: postId, content })
      .select()
      .single();

    if (error || !reply) throw error;

    // Notify thread owner
    const { data: post } = await supabase.from('forum_posts').select('user_id, title').eq('id', postId).single();
    if (post && post.user_id !== userId) {
      await createNotification(
        post.user_id,
        'New Forum Reply! 💬',
        `A student answered your forum thread: "${post.title.substring(0, 30)}..."`,
        'Forum',
        '💬',
        '/community'
      );
    }

    res.json({ success: true, reply });
  } catch (err) {
    next(err);
  }
};

// @desc    Upvote post or reply
// @route   POST /api/community/forum/upvote
export const upvoteForumItem = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { itemId, type } = req.body; // type is 'post' | 'reply'

    if (!itemId || !type) return res.status(400).json({ message: 'Item ID and Type are required.' });

    if (type === 'post') {
      const { data: post } = await supabase.from('forum_posts').select('upvotes, user_id').eq('id', itemId).single();
      if (post) {
        await supabase.from('forum_posts').update({ upvotes: (post.upvotes || 0) + 1 }).eq('id', itemId);
        // Increase author reputation
        const { data: profile } = await supabase.from('profiles').select('reputation').eq('id', post.user_id).single();
        if (profile) {
          await supabase.from('profiles').update({ reputation: (profile.reputation || 0) + 5 }).eq('id', post.user_id);
        }
      }
    } else {
      const { data: reply } = await supabase.from('forum_replies').select('upvotes, user_id').eq('id', itemId).single();
      if (reply) {
        await supabase.from('forum_replies').update({ upvotes: (reply.upvotes || 0) + 1 }).eq('id', itemId);
        // Increase author reputation
        const { data: profile } = await supabase.from('profiles').select('reputation').eq('id', reply.user_id).single();
        if (profile) {
          await supabase.from('profiles').update({ reputation: (profile.reputation || 0) + 5 }).eq('id', reply.user_id);
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ================= PEER CODE REVIEW =================

// @desc    Get code reviews
// @route   GET /api/community/peer-review
export const getPeerReviews = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { data: reviews, error } = await supabase
      .from('peer_code_reviews')
      .select('*, author:profiles(name, username, avatar_url, level), comments:peer_code_comments(*, author:profiles(name, username, avatar_url))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ reviews: reviews || [] });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit code solution for review
// @route   POST /api/community/peer-review/submit
export const submitCodeForReview = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { title, code, language, description } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({ message: 'Title, code, and language are required.' });
    }

    const { data: review, error } = await supabase
      .from('peer_code_reviews')
      .insert({ user_id: userId, title, code, language, description })
      .select()
      .single();

    if (error || !review) throw error;

    res.json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

// @desc    Comment on code review
// @route   POST /api/community/peer-review/comment
export const createReviewComment = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { reviewId, category, comment } = req.body;

    if (!reviewId || !category || !comment) {
      return res.status(400).json({ message: 'Review ID, category, and comment are required.' });
    }

    const { data: newComment, error } = await supabase
      .from('peer_code_comments')
      .insert({ user_id: userId, review_id: reviewId, category, comment })
      .select()
      .single();

    if (error || !newComment) throw error;

    // Notify original reviewer
    const { data: review } = await supabase.from('peer_code_reviews').select('user_id, title').eq('id', reviewId).single();
    if (review && review.user_id !== userId) {
      await createNotification(
        review.user_id,
        'Code Review Received! 💻',
        `A student left feedback on your code solution: "${review.title.substring(0, 30)}..."`,
        'CodeReview',
        '💻',
        '/community'
      );

      // Award reputation points for helping
      const { data: helper } = await supabase.from('profiles').select('reputation').eq('id', userId).single();
      if (helper) {
        await supabase.from('profiles').update({ reputation: (helper.reputation || 0) + 15 }).eq('id', userId);
      }
    }

    res.json({ success: true, comment: newComment });
  } catch (err) {
    next(err);
  }
};

// ================= RESOURCE SHARING =================

// @desc    List resources
// @route   GET /api/community/resources
export const getSharedResources = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { data: resources, error } = await supabase
      .from('community_resources')
      .select('*, author:profiles(name, username, avatar_url, level)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ resources: resources || [] });
  } catch (err) {
    next(err);
  }
};

// @desc    Share a new resource
// @route   POST /api/community/resources/share
export const shareResource = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { title, description, type, content } = req.body;

    if (!title || !type || !content) {
      return res.status(400).json({ message: 'Title, type, and content are required.' });
    }

    const { data: resource, error } = await supabase
      .from('community_resources')
      .insert({ user_id: userId, title, description, type, content })
      .select()
      .single();

    if (error || !resource) throw error;

    // Award reputation for sharing notes
    const { data: helper } = await supabase.from('profiles').select('reputation').eq('id', userId).single();
    if (helper) {
      await supabase.from('profiles').update({ reputation: (helper.reputation || 0) + 10 }).eq('id', userId);
    }

    res.json({ success: true, resource });
  } catch (err) {
    next(err);
  }
};

// @desc    Like a resource
// @route   POST /api/community/resources/like
export const likeResource = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { resourceId } = req.body;

    if (!resourceId) return res.status(400).json({ message: 'Resource ID is required.' });

    const { data: resObj } = await supabase.from('community_resources').select('likes, user_id').eq('id', resourceId).single();
    if (resObj) {
      await supabase.from('community_resources').update({ likes: (resObj.likes || 0) + 1 }).eq('id', resourceId);
      // Award reputation points
      const { data: helper } = await supabase.from('profiles').select('reputation').eq('id', resObj.user_id).single();
      if (helper) {
        await supabase.from('profiles').update({ reputation: (helper.reputation || 0) + 5 }).eq('id', resObj.user_id);
      }
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
