import express from 'express';
import { 
  getFriendsList, sendFriendRequest, acceptFriendRequest, rejectFriendRequest,
  getStudyGroups, createStudyGroup, joinStudyGroup, leaveStudyGroup,
  getForumPosts, createForumPost, createForumReply, upvoteForumItem,
  getPeerReviews, submitCodeForReview, createReviewComment,
  getSharedResources, shareResource, likeResource,
  searchUsers, getActivityFeed
} from '../controllers/communityController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Friends System
router.get('/friends', protect, getFriendsList);
router.get('/friends/search', protect, searchUsers);
router.post('/friends/request', protect, sendFriendRequest);
router.post('/friends/accept', protect, acceptFriendRequest);
router.post('/friends/reject', protect, rejectFriendRequest);
router.get('/activity', protect, getActivityFeed);


// Study Groups
router.get('/groups', protect, getStudyGroups);
router.post('/groups/create', protect, createStudyGroup);
router.post('/groups/join', protect, joinStudyGroup);
router.post('/groups/leave', protect, leaveStudyGroup);

// Forum Discussions
router.get('/forum', protect, getForumPosts);
router.post('/forum/post', protect, createForumPost);
router.post('/forum/reply', protect, createForumReply);
router.post('/forum/upvote', protect, upvoteForumItem);

// Peer Code Review
router.get('/peer-review', protect, getPeerReviews);
router.post('/peer-review/submit', protect, submitCodeForReview);
router.post('/peer-review/comment', protect, createReviewComment);

// Resource Sharing
router.get('/resources', protect, getSharedResources);
router.post('/resources/share', protect, shareResource);
router.post('/resources/like', protect, likeResource);

export default router;
