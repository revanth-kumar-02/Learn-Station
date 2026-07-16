import React, { useState, useEffect } from 'react';
import { 
  communityService, UserProfile, StudyGroup, ForumPost, 
  PeerReview, SharedResource, ForumReply, ReviewComment 
} from '../services/communityService';
import { 
  Users, UserPlus, Check, X, MessageSquare, Code, BookOpen, 
  Award, Heart, Share2, Compass, Plus, Send, ShieldAlert,
  ThumbsUp, Calendar, AlertCircle, FileText, CheckCircle, Play
} from 'lucide-react';
import '../css/pages.css';

type SectionTab = 'friends' | 'groups' | 'forums' | 'peer-review' | 'resources';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<SectionTab>('friends');
  const [loading, setLoading] = useState(true);

  // --- FRIENDS STATE ---
  const [friendsData, setFriendsData] = useState<{ active: UserProfile[]; incoming: UserProfile[]; outgoing: UserProfile[]; suggestions: UserProfile[] }>({
    active: [], incoming: [], outgoing: [], suggestions: []
  });

  // --- STUDY GROUPS STATE ---
  const [groupsData, setGroupsData] = useState<{ myGroups: StudyGroup[]; discover: StudyGroup[] }>({
    myGroups: [], discover: []
  });
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupCategory, setGroupCategory] = useState('Python');
  const [groupGoal, setGroupGoal] = useState('Complete Python Track');

  // --- FORUMS STATE ---
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [forumTrackId, setForumTrackId] = useState('python-basics');
  const [activePost, setActivePost] = useState<ForumPost | null>(null);
  const [replyInput, setReplyInput] = useState('');

  // --- PEER REVIEW STATE ---
  const [peerReviews, setPeerReviews] = useState<PeerReview[]>([]);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewCode, setReviewCode] = useState('');
  const [reviewLang, setReviewLang] = useState('Python');
  const [reviewDesc, setReviewDesc] = useState('');
  const [activeReview, setActiveReview] = useState<PeerReview | null>(null);
  const [commentCategory, setCommentCategory] = useState<'readability' | 'logic' | 'best-practices' | 'performance' | 'style'>('readability');
  const [commentInput, setCommentInput] = useState('');

  // --- RESOURCES STATE ---
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([]);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDesc, setResourceDesc] = useState('');
  const [resourceType, setResourceType] = useState<'notes' | 'cheatsheet' | 'mindmap' | 'template' | 'snippet'>('notes');
  const [resourceContent, setResourceContent] = useState('');

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        const res = await communityService.getFriends();
        setFriendsData(res);
      } else if (activeTab === 'groups') {
        const res = await communityService.getStudyGroups();
        setGroupsData(res);
      } else if (activeTab === 'forums') {
        const res = await communityService.getForumPosts();
        setForumPosts(res.posts);
      } else if (activeTab === 'peer-review') {
        const res = await communityService.getPeerReviews();
        setPeerReviews(res.reviews);
      } else if (activeTab === 'resources') {
        const res = await communityService.getSharedResources();
        setSharedResources(res.resources);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- FRIENDS ACTIONS ---
  const sendRequest = async (id: string) => {
    await communityService.sendFriendRequest(id);
    loadTabData();
  };

  const acceptRequest = async (id: string) => {
    await communityService.acceptFriendRequest(id);
    loadTabData();
  };

  const rejectRequest = async (id: string) => {
    await communityService.rejectFriendRequest(id);
    loadTabData();
  };

  // --- GROUPS ACTIONS ---
  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return;
    await communityService.createStudyGroup({ name: groupName, description: groupDesc, category: groupCategory, learningGoal: groupGoal });
    setGroupName('');
    setGroupDesc('');
    loadTabData();
  };

  const joinGroup = async (id: string) => {
    await communityService.joinStudyGroup(id);
    loadTabData();
  };

  const leaveGroup = async (id: string) => {
    await communityService.leaveStudyGroup(id);
    loadTabData();
  };

  // --- FORUMS ACTIONS ---
  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;
    await communityService.createForumPost({ trackId: forumTrackId, title: newPostTitle, content: newPostContent });
    setNewPostTitle('');
    setNewPostContent('');
    loadTabData();
  };

  const postReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost || !replyInput) return;
    await communityService.createForumReply({ postId: activePost.id, content: replyInput });
    setReplyInput('');
    const refreshedPosts = await communityService.getForumPosts();
    const updatedPost = refreshedPosts.posts.find(p => p.id === activePost.id);
    if (updatedPost) setActivePost(updatedPost);
  };

  const upvoteItem = async (id: string, type: 'post' | 'reply') => {
    await communityService.upvoteForumItem(id, type);
    if (activePost && type === 'reply') {
      const refreshedPosts = await communityService.getForumPosts();
      const updatedPost = refreshedPosts.posts.find(p => p.id === activePost.id);
      if (updatedPost) setActivePost(updatedPost);
    } else {
      loadTabData();
    }
  };

  // --- PEER REVIEW ACTIONS ---
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle || !reviewCode) return;
    await communityService.submitCodeForReview({ title: reviewTitle, code: reviewCode, language: reviewLang, description: reviewDesc });
    setReviewTitle('');
    setReviewCode('');
    setReviewDesc('');
    loadTabData();
  };

  const postReviewComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview || !commentInput) return;
    await communityService.createReviewComment({ reviewId: activeReview.id, category: commentCategory, comment: commentInput });
    setCommentInput('');
    const refreshedReviews = await communityService.getPeerReviews();
    const updatedReview = refreshedReviews.reviews.find(r => r.id === activeReview.id);
    if (updatedReview) setActiveReview(updatedReview);
  };

  // --- RESOURCES ACTIONS ---
  const shareNewResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle || !resourceContent) return;
    await communityService.shareResource({ title: resourceTitle, description: resourceDesc, type: resourceType, content: resourceContent });
    setResourceTitle('');
    setResourceDesc('');
    setResourceContent('');
    loadTabData();
  };

  const likeRes = async (id: string) => {
    await communityService.likeResource(id);
    loadTabData();
  };

  return (
    <div className="admin-container">
      
      {/* HEADER HERO */}
      <div className="admin-header-card" style={{ marginBottom: '32px' }}>
        <span className="badge badge-accent" style={{ marginBottom: '8px' }}>
          <Users size={12} style={{ marginRight: '4px' }} /> Collaborative Learning
        </span>
        <h1 className="admin-title">Community & Study Groups</h1>
        <p className="admin-subtitle">Connect with peers, collaborate on code reviews, clear doubts, and share templates.</p>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '32px', overflowX: 'auto' }}>
        {(['friends', 'groups', 'forums', 'peer-review', 'resources'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => { setActiveTab(tab); setActivePost(null); setActiveReview(null); }}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {tab === 'friends' && <Users size={16} />}
            {tab === 'groups' && <Compass size={16} />}
            {tab === 'forums' && <MessageSquare size={16} />}
            {tab === 'peer-review' && <Code size={16} />}
            {tab === 'resources' && <BookOpen size={16} />}
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <div>
          
          {/* ================== FRIENDS VIEW ================== */}
          {activeTab === 'friends' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
              <div>
                <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Your Friends ({friendsData.active.length})</h3>
                {friendsData.active.length === 0 ? (
                  <p className="text-secondary" style={{ fontSize: '13px' }}>You haven't added any friends yet. Check suggestions to get started!</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {friendsData.active.map((f) => (
                      <div key={f.id} style={{ display: 'flex', gap: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-lg)', alignItems: 'center' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--border)', overflow: 'hidden' }}>
                          <img src={f.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="text-primary" style={{ fontWeight: 700, fontSize: '14px' }}>{f.name}</span>
                            <span className="badge badge-accent" style={{ fontSize: '10px', padding: '2px 6px' }}>Lvl {f.level}</span>
                          </div>
                          <div className="text-secondary" style={{ fontSize: '11px', marginTop: '2px' }}>@{f.username} • {f.reputation} Rep</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* FRIEND ACTIVITY FEED (Sprint 6.6) */}
                <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 800, marginTop: '40px', marginBottom: '20px' }}>Friend Activity Feed</h3>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { user: 'Alice', action: 'completed Python Lesson 12', time: '10 mins ago' },
                    { user: 'Bob', action: 'earned SQL Expert Badge', time: '2 hours ago' },
                    { user: 'Charlie', action: 'joined Python Study Group', time: '1 day ago' }
                  ].map((act, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', paddingBottom: '10px' }}>
                      <span className="text-primary">
                        <strong>{act.user}</strong> {act.action}
                      </span>
                      <span className="text-secondary" style={{ fontSize: '11px' }}>{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {/* INCOMING REQUESTS */}
                {friendsData.incoming.length > 0 && (
                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
                    <h4 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px' }}>Pending Requests</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {friendsData.incoming.map((f) => (
                        <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="text-primary" style={{ fontSize: '13px', fontWeight: 600 }}>{f.name}</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => acceptRequest(f.id)} className="btn btn-primary" style={{ padding: '4px 8px' }}><Check size={14} /></button>
                            <button onClick={() => rejectRequest(f.id)} className="btn btn-secondary" style={{ padding: '4px 8px' }}><X size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUGGESTIONS */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                  <h4 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px' }}>Suggestions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {friendsData.suggestions.map((f) => (
                      <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div className="text-primary" style={{ fontSize: '13px', fontWeight: 600 }}>{f.name}</div>
                          <div className="text-secondary" style={{ fontSize: '11px' }}>Lvl {f.level}</div>
                        </div>
                        <button onClick={() => sendRequest(f.id)} className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 10px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <UserPlus size={12} /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================== STUDY GROUPS VIEW ================== */}
          {activeTab === 'groups' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
              <div>
                <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>My Study Groups</h3>
                {groupsData.myGroups.length === 0 ? (
                  <p className="text-secondary" style={{ fontSize: '13px' }}>You haven't joined any study groups yet. Browse the discovery board on the right!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {groupsData.myGroups.map((g) => (
                      <div key={g.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 className="text-primary" style={{ fontSize: '16px', fontWeight: 700 }}>{g.name}</h4>
                          <span className="badge badge-accent" style={{ fontSize: '11px' }}>{g.category}</span>
                        </div>
                        <p className="text-secondary" style={{ fontSize: '13px', marginBottom: '16px', lineHeight: 1.4 }}>{g.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                          <span className="text-secondary"><strong>Goal:</strong> {g.learning_goal || 'None'}</span>
                          <button onClick={() => leaveGroup(g.id)} className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 12px', color: '#ef4444' }}>
                            Leave Group
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                {/* CREATE GROUP FORM */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-xl)', marginBottom: '24px' }}>
                  <h4 className="text-primary" style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Create Study Group</h4>
                  <form onSubmit={createGroup}>
                    <div style={{ marginBottom: '12px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Group Name</label>
                      <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }} required />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description</label>
                      <textarea value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} rows={2} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)', resize: 'vertical' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Goal</label>
                      <input type="text" value={groupGoal} onChange={(e) => setGroupGoal(e.target.value)} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Create Group</button>
                  </form>
                </div>

                {/* DISCOVER GROUPS */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
                  <h4 className="text-primary" style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Discover Groups</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {groupsData.discover.map((g) => (
                      <div key={g.id} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="text-primary" style={{ fontWeight: 700, fontSize: '13px' }}>{g.name}</span>
                          <button onClick={() => joinGroup(g.id)} className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }}>Join</button>
                        </div>
                        <p className="text-secondary" style={{ fontSize: '11px', marginTop: '4px' }}>{g.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================== DISCUSSION FORUM ================== */}
          {activeTab === 'forums' && (
            <div>
              {!activePost ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
                  
                  {/* POSTS LIST */}
                  <div>
                    <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Discussion Forum Threads</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {forumPosts.map((post) => (
                        <div 
                          key={post.id} 
                          onClick={() => setActivePost(post)}
                          style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>
                              Posted by <strong>{post.author?.name || 'Learner'}</strong> in {post.track_id}
                            </span>
                            <span className="badge badge-accent" style={{ fontSize: '10px' }}>
                              {post.replies?.length || 0} replies
                            </span>
                          </div>
                          <h4 className="text-primary" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{post.title}</h4>
                          <p className="text-secondary" style={{ fontSize: '12px', lineHeight: 1.4 }}>{post.content.substring(0, 160)}...</p>

                          <div style={{ display: 'flex', gap: '16px', marginTop: '14px', alignItems: 'center' }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); upvoteItem(post.id, 'post'); }} 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <ThumbsUp size={12} /> {post.upvotes || 0} Upvotes
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SUBMIT THREAD FORM */}
                  <div>
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
                      <h4 className="text-primary" style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Ask a Question</h4>
                      <form onSubmit={createPost}>
                        <div style={{ marginBottom: '12px' }}>
                          <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Track Scope</label>
                          <select 
                            value={forumTrackId} 
                            onChange={(e) => setForumTrackId(e.target.value)}
                            style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }}
                          >
                            <option value="python-basics">Python Basics</option>
                            <option value="sql-intermediate">SQL JOINs</option>
                            <option value="web-dev">HTML & CSS Layouts</option>
                          </select>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Question Title</label>
                          <input type="text" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }} required />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Explain the Problem</label>
                          <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} rows={4} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)', resize: 'vertical' }} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Publish Thread</button>
                      </form>
                    </div>
                  </div>

                </div>
              ) : (
                /* DETAILED THREAD VIEW */
                <div>
                  <button onClick={() => setActivePost(null)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
                    ← Back to Forum Threads
                  </button>

                  <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="text-secondary" style={{ fontSize: '12px' }}>
                        Posted by <strong>{activePost.author?.name}</strong> • {new Date(activePost.created_at).toLocaleDateString()}
                      </span>
                      <button onClick={() => upvoteItem(activePost.id, 'post')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '4px' }}>
                        <ThumbsUp size={12} /> {activePost.upvotes || 0}
                      </button>
                    </div>
                    <h3 className="text-primary" style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>{activePost.title}</h3>
                    <p className="text-primary" style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{activePost.content}</p>
                  </div>

                  {/* REPLIES LIST */}
                  <h4 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Answers / Discussion ({activePost.replies?.length || 0})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    {activePost.replies?.map((rep) => (
                      <div key={rep.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="text-secondary" style={{ fontSize: '11px' }}>
                            Answered by <strong>{rep.author?.name || 'Learner'}</strong>
                          </span>
                          <button onClick={() => upvoteItem(rep.id, 'reply')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', gap: '4px' }}>
                            <ThumbsUp size={10} /> {rep.upvotes || 0}
                          </button>
                        </div>
                        <p className="text-primary" style={{ fontSize: '13px', lineHeight: 1.5 }}>{rep.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* REPLY INPUT FORM */}
                  <form onSubmit={postReply} style={{ display: 'flex', gap: '12px' }}>
                    <input 
                      type="text" 
                      placeholder="Write your answer or suggestion..." 
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '13px' }}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '6px' }}>
                      <Send size={16} /> Send Answer
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ================== PEER CODE REVIEW ================== */}
          {activeTab === 'peer-review' && (
            <div>
              {!activeReview ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
                  
                  {/* REVIEWS SUBMISSIONS */}
                  <div>
                    <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Peer Code Reviews</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {peerReviews.map((rev) => (
                        <div 
                          key={rev.id} 
                          onClick={() => setActiveReview(rev)}
                          style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', padding: '20px', cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>
                              Shared by <strong>{rev.author?.name || 'Learner'}</strong>
                            </span>
                            <span className="badge badge-accent" style={{ fontSize: '10px' }}>{rev.language}</span>
                          </div>
                          <h4 className="text-primary" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{rev.title}</h4>
                          <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '12px' }}>{rev.description || 'No description provided.'}</p>
                          <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 600 }}>
                            {rev.comments?.length || 0} reviews feedback posted
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SHARE WORK FORM */}
                  <div>
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
                      <h4 className="text-primary" style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Share Code for Review</h4>
                      <form onSubmit={submitReview}>
                        <div style={{ marginBottom: '12px' }}>
                          <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Title</label>
                          <input type="text" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }} required />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Programming Language</label>
                          <select value={reviewLang} onChange={(e) => setReviewLang(e.target.value)} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                            <option value="Python">Python</option>
                            <option value="SQL">SQL</option>
                            <option value="JavaScript">JavaScript</option>
                          </select>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Explain the Problem / Task</label>
                          <textarea value={reviewDesc} onChange={(e) => setReviewDesc(e.target.value)} rows={2} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)', resize: 'vertical' }} />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Source Code</label>
                          <textarea value={reviewCode} onChange={(e) => setReviewCode(e.target.value)} rows={6} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', resize: 'vertical' }} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Submit Snippet</button>
                      </form>
                    </div>
                  </div>

                </div>
              ) : (
                /* REVIEW WORKSPACE DETAIL */
                <div>
                  <button onClick={() => setActiveReview(null)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
                    ← Back to Peer Reviews
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }}>
                    
                    {/* CODE SNIPPET AND DESC */}
                    <div>
                      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', padding: '24px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span className="text-secondary" style={{ fontSize: '12px' }}>
                            Shared by <strong>{activeReview.author?.name}</strong> • {new Date(activeReview.created_at).toLocaleDateString()}
                          </span>
                          <span className="badge badge-accent">{activeReview.language}</span>
                        </div>
                        <h3 className="text-primary" style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{activeReview.title}</h3>
                        <p className="text-secondary" style={{ fontSize: '13px', marginBottom: '20px' }}>{activeReview.description}</p>

                        <pre style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', overflowX: 'auto' }}>
                          <code>{activeReview.code}</code>
                        </pre>
                      </div>

                      {/* LEAVE FEEDBACK FORM */}
                      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
                        <h4 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Leave Educational Feedback</h4>
                        <form onSubmit={postReviewComment}>
                          <div style={{ marginBottom: '12px' }}>
                            <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Review Category</label>
                            <select value={commentCategory} onChange={(e) => setCommentCategory(e.target.value as any)} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                              <option value="readability">Readability & Naming</option>
                              <option value="logic">Code Logic</option>
                              <option value="best-practices">Best Practices</option>
                              <option value="performance">Complexity & Performance</option>
                              <option value="style">Formatting & Style</option>
                            </select>
                          </div>
                          <div style={{ marginBottom: '16px' }}>
                            <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Constructive Suggestions</label>
                            <textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} rows={3} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)', resize: 'vertical' }} required />
                          </div>
                          <button type="submit" className="btn btn-primary">Submit Feedback</button>
                        </form>
                      </div>
                    </div>

                    {/* COMMENTS LIST */}
                    <div>
                      <h4 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Review Comments ({activeReview.comments?.length || 0})</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {activeReview.comments?.map((c) => (
                          <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span className="text-secondary" style={{ fontSize: '11px' }}>
                                Reviewed by <strong>{c.author?.name || 'Helper'}</strong>
                              </span>
                              <span className="badge badge-accent" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{c.category}</span>
                            </div>
                            <p className="text-primary" style={{ fontSize: '12px', lineHeight: 1.5 }}>{c.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================== RESOURCES VIEW ================== */}
          {activeTab === 'resources' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
              
              {/* RESOURCE TIMELINE */}
              <div>
                <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Shared Notes & Study Templates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sharedResources.map((res) => (
                    <div key={res.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="text-secondary" style={{ fontSize: '11px' }}>
                          Shared by <strong>{res.author?.name || 'Helper'}</strong>
                        </span>
                        <span className="badge badge-accent" style={{ fontSize: '10px', textTransform: 'capitalize' }}>{res.type}</span>
                      </div>
                      <h4 className="text-primary" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{res.title}</h4>
                      <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '14px' }}>{res.description}</p>
                      
                      <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto', marginBottom: '16px' }}>
                        {res.content}
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button onClick={() => likeRes(res.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Heart size={12} style={{ color: '#ef4444' }} /> {res.likes || 0} Likes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHARE RESOURCES FORM */}
              <div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
                  <h4 className="text-primary" style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Share Study Resource</h4>
                  <form onSubmit={shareNewResource}>
                    <div style={{ marginBottom: '12px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Title</label>
                      <input type="text" value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }} required />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Resource Type</label>
                      <select value={resourceType} onChange={(e) => setResourceType(e.target.value as any)} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                        <option value="notes">Revision Notes</option>
                        <option value="cheatsheet">Cheat Sheet</option>
                        <option value="mindmap">Mind Map Outline</option>
                        <option value="template">Project Template</option>
                        <option value="snippet">Code Snippet</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Short Description</label>
                      <textarea value={resourceDesc} onChange={(e) => setResourceDesc(e.target.value)} rows={2} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)', resize: 'vertical' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Resource Content (Markdown or Text)</label>
                      <textarea value={resourceContent} onChange={(e) => setResourceContent(e.target.value)} rows={5} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)', resize: 'vertical' }} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Publish Resource</button>
                  </form>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
