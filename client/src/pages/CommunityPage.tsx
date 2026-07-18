import React, { useState, useEffect } from 'react';
import { 
  communityService, UserProfile, StudyGroup, ForumPost, 
  PeerReview, SharedResource, ActivityFeedItem
} from '../services/communityService';
import { 
  Users, UserPlus, Check, X, MessageSquare, Code, BookOpen, 
  Award, Heart, Compass, Plus, Send, ShieldAlert,
  ThumbsUp, Calendar, AlertCircle, FileText, CheckCircle, Play, Sparkles
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { supabase } from '../supabase';
import '../css/pages.css';

type SectionTab = 'friends' | 'groups' | 'forums' | 'peer-review' | 'resources';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<SectionTab>('friends');
  const [loading, setLoading] = useState(true);

  // --- FRIENDS STATE ---
  const [friendsData, setFriendsData] = useState<{ active: UserProfile[]; incoming: UserProfile[]; outgoing: UserProfile[]; suggestions: UserProfile[] }>({
    active: [], incoming: [], outgoing: [], suggestions: []
  });

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[] | null>(null);

  // --- ACTIVITY FEED STATE ---
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);

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
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  // --- REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    const channel = supabase
      .channel('community-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends' }, () => {
        loadTabData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_groups' }, () => {
        loadTabData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts' }, () => {
        loadTabData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_replies' }, () => {
        loadTabData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'peer_code_reviews' }, () => {
        loadTabData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_resources' }, () => {
        loadTabData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        const [friends, feedRes] = await Promise.all([
          communityService.getFriends(),
          communityService.getActivityFeed()
        ]);
        setFriendsData(friends);
        setActivityFeed(feedRes.feed);
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

  // --- FORUM ACTIONS ---
  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;
    await communityService.createForumPost({ title: newPostTitle, content: newPostContent, trackId: forumTrackId });
    setNewPostTitle('');
    setNewPostContent('');
    loadTabData();
  };

  const postReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput || !activePost) return;
    const res = await communityService.createForumReply({ postId: activePost.id, content: replyInput });
    setReplyInput('');
    // Update active post with new replies
    setActivePost(prev => prev ? {
      ...prev,
      replies: [...(prev.replies || []), res.reply]
    } : null);
  };

  const upvoteItem = async (itemId: string, type: 'post' | 'reply') => {
    try {
      const res = await communityService.upvoteForumItem(itemId, type);
      if (res.success) {
        if (type === 'post') {
          setForumPosts(prev => prev.map(p => p.id === itemId ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p));
          if (activePost && activePost.id === itemId) {
            setActivePost(prev => prev ? { ...prev, upvotes: (prev.upvotes || 0) + 1 } : null);
          }
        } else if (activePost) {
          setActivePost(prev => {
            if (!prev) return null;
            return {
              ...prev,
              replies: prev.replies.map(r => r.id === itemId ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r)
            };
          });
        }
      }
    } catch (err) {
      console.error(err);
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
    if (!commentInput || !activeReview) return;
    const res = await communityService.createReviewComment({ reviewId: activeReview.id, category: commentCategory, comment: commentInput });
    setCommentInput('');
    // Update active review comments
    setActiveReview(prev => prev ? {
      ...prev,
      comments: [...(prev.comments || []), res.comment]
    } : null);
  };

  // --- USER SEARCH ---
  const handleSearchUsers = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await communityService.searchUsers(val);
      setSearchResults(res.users);
    } catch (err) {
      console.error(err);
    }
  };

  // --- FILE UPLOAD TO SUPABASE STORAGE ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `resources/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('community-resources')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('community-resources')
        .getPublicUrl(filePath);

      setResourceContent(data.publicUrl);
      alert('File uploaded successfully! The public URL is populated in the content field.');
    } catch (err: any) {
      console.error('[Storage Upload Error]', err);
      alert('Error uploading file to Supabase Storage: ' + err.message);
    } finally {
      setUploadingFile(false);
    }
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
    const res = await communityService.likeResource(id);
    if (res.success) {
      setSharedResources(prev => prev.map(item => item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item));
    }
  };

  // --- Empty State Component ---
  const RenderEmptyState = ({ title, desc }: { title: string, desc: string }) => (
    <div className="std-empty" style={{ padding: '40px 20px' }}>
      <svg className="empty-illustration" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
      <p className="std-empty__title">{title}</p>
      <p className="std-empty__desc">{desc}</p>
    </div>
  );

  return (
    <div className="page-std animate-fade-in">
      <PageHeader
        icon={<Users size={22} />}
        color="violet"
        eyebrow="Collaborative Learning"
        title="Community & Study Groups"
        description="Connect with peers, collaborate on code reviews, clear doubts, and share templates."
        stats={[
          { label: 'Friends',    value: friendsData.active.length },
          { label: 'My Groups',  value: groupsData.myGroups.length },
          { label: 'Forum Posts', value: forumPosts.length },
        ]}
      />

      <div className="container" style={{ marginTop: '0px' }}>

      {/* TOP NAVIGATION TABS */}
      <div className="std-tabs" style={{ marginBottom: '24px' }}>
        {(['friends', 'groups', 'forums', 'peer-review', 'resources'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => { setActiveTab(tab); setActivePost(null); setActiveReview(null); }}
            className={`std-tab ${activeTab === tab ? 'std-tab--active' : ''}`}
          >
            {tab === 'friends'     && <Users size={14} />}
            {tab === 'groups'      && <Compass size={14} />}
            {tab === 'forums'      && <MessageSquare size={14} />}
            {tab === 'peer-review' && <Code size={14} />}
            {tab === 'resources'   && <BookOpen size={14} />}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }} className="rewards-grid">
              <div>
                
                {/* FRIEND STATISTICS CARDS */}
                <div className="std-stat-grid std-stat-grid--3" style={{ marginBottom: '28px' }}>
                  <div className="std-stat-card">
                    <span className="std-stat-card__label">Active Network</span>
                    <span className="std-stat-card__value">{friendsData.active.length} <span style={{ fontSize: '12px', fontWeight: 500 }}>friends</span></span>
                  </div>
                  <div className="std-stat-card">
                    <span className="std-stat-card__label">Incoming Requests</span>
                    <span className="std-stat-card__value">{friendsData.incoming.length} <span style={{ fontSize: '12px', fontWeight: 500 }}>pending</span></span>
                  </div>
                  <div className="std-stat-card">
                    <span className="std-stat-card__label">Total Reputation</span>
                    <span className="std-stat-card__value">
                      {friendsData.active.reduce((acc, f) => acc + (f.reputation || 0), 0) + 75} Rep
                    </span>
                  </div>
                </div>

                <h3 className="section-title" style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Your Friends List</h3>
                {friendsData.active.length === 0 ? (
                  <RenderEmptyState 
                    title="No Friends Yet" 
                    desc="Check suggestions on the right side panel to send your first friend request!" 
                  />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {friendsData.active.map((f) => (
                      <div key={f.id} className="std-card" style={{ display: 'flex', gap: '14px', padding: '16px', alignItems: 'center' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={f.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="text-primary" style={{ fontWeight: 700, fontSize: '13.5px' }}>{f.name}</span>
                            <span className="std-badge std-badge--violet" style={{ fontSize: '9px', padding: '1px 5px' }}>Lv.{f.level}</span>
                          </div>
                          <div className="text-secondary" style={{ fontSize: '11px', marginTop: '3px' }}>@{f.username} • {f.reputation} Reputation</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}                {/* COMMUNITY ACTIVITY FEED */}
                <h3 className="section-title" style={{ fontSize: '15px', fontWeight: 800, marginTop: '40px', marginBottom: '16px' }}>Community Activity Feed</h3>
                {activityFeed.length === 0 ? (
                  <span className="text-secondary" style={{ fontSize: '11.5px' }}>No community activities logged yet.</span>
                ) : (
                  <div className="timeline-list">
                    {activityFeed.map((act) => (
                      <div key={act.id} className="timeline-card">
                        <div className="timeline-marker" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px' }}>
                          <span className="text-primary" style={{ fontSize: '13px' }}>
                            <strong style={{ fontWeight: 700 }}>{act.username}</strong> {act.description}
                          </span>
                          <span className="text-secondary" style={{ fontSize: '10.5px', flexShrink: 0 }}>
                            {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                {/* INCOMING REQUESTS */}
                {friendsData.incoming.length > 0 && (
                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-xl)', marginBottom: '24px' }}>
                    <h4 className="text-primary" style={{ fontSize: '13.5px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} className="text-accent-amber" /> Pending Requests
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {friendsData.incoming.map((f) => (
                        <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                          <div>
                            <span className="text-primary" style={{ fontSize: '12.5px', fontWeight: 700, display: 'block' }}>{f.name}</span>
                            <span className="text-secondary" style={{ fontSize: '10.5px' }}>Lvl {f.level}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => acceptRequest(f.id)} className="btn btn--primary btn--sm" style={{ padding: '6px 8px' }}><Check size={13} /></button>
                            <button onClick={() => rejectRequest(f.id)} className="btn btn--secondary btn--sm" style={{ padding: '6px 8px' }}><X size={13} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SEARCH PEERS */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-xl)', marginBottom: '24px' }}>
                  <h4 className="text-primary" style={{ fontSize: '13.5px', fontWeight: 800, marginBottom: '12px' }}>Find Peers</h4>
                  <input 
                    type="text" 
                    placeholder="Search by name or username..." 
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '12.5px', color: 'var(--text-primary)', marginBottom: '12px' }}
                  />
                  {searchResults !== null && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span className="text-secondary" style={{ fontSize: '10.5px', fontWeight: 600 }}>Search Results:</span>
                      {searchResults.length === 0 ? (
                        <span className="text-secondary" style={{ fontSize: '11px' }}>No matching learners found.</span>
                      ) : (
                        searchResults.map((f) => (
                          <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                            <div>
                              <div className="text-primary" style={{ fontSize: '12.5px', fontWeight: 700 }}>{f.name}</div>
                              <div className="text-secondary" style={{ fontSize: '10.5px' }}>@{f.username} • Lvl {f.level}</div>
                            </div>
                            <button onClick={() => sendRequest(f.id)} className="btn btn--secondary btn--sm" style={{ fontSize: '11px', padding: '6px 10px' }}>
                              Add
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* SUGGESTIONS */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-xl)' }}>
                  <h4 className="text-primary" style={{ fontSize: '13.5px', fontWeight: 800, marginBottom: '14px' }}>Suggested Learners</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {friendsData.suggestions.length === 0 ? (
                      <span className="text-secondary" style={{ fontSize: '11px' }}>No suggestions available at this time.</span>
                    ) : (
                      friendsData.suggestions.map((f) => (
                        <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: 'var(--radius-lg)' }}>
                          <div>
                            <div className="text-primary" style={{ fontSize: '12.5px', fontWeight: 700 }}>{f.name}</div>
                            <div className="text-secondary" style={{ fontSize: '10.5px', marginTop: '2px' }}>Lvl {f.level} • {f.reputation || 0} Rep</div>
                          </div>
                          <button onClick={() => sendRequest(f.id)} className="btn btn--secondary btn--sm" style={{ fontSize: '11px', padding: '6px 10px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <UserPlus size={11} /> Add
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================== STUDY GROUPS VIEW ================== */}
          {activeTab === 'groups' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }} className="rewards-grid">
              <div>
                <h3 className="section-title" style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>My Study Groups</h3>
                {groupsData.myGroups.length === 0 ? (
                  <RenderEmptyState 
                    title="No Joined Groups" 
                    desc="You haven't joined any study groups. Join one from the discovery list or create your own!" 
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {groupsData.myGroups.map((g) => (
                      <div key={g.id} className="std-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 className="text-primary" style={{ fontSize: '15.5px', fontWeight: 800 }}>{g.name}</h4>
                          <span className="std-badge std-badge--violet" style={{ fontSize: '11px', padding: '2px 8px' }}>{g.category}</span>
                        </div>
                        <p className="text-secondary" style={{ fontSize: '12.5px', marginBottom: '18px', lineHeight: 1.45 }}>{g.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                          <span className="text-secondary"><strong>Goal:</strong> {g.learning_goal || 'None'}</span>
                          <button onClick={() => leaveGroup(g.id)} className="btn btn--secondary btn--sm" style={{ fontSize: '11.5px', padding: '6px 14px', color: 'var(--accent-rose)', border: '1px solid hsla(346,77%,50%,0.2)' }}>
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
                  <h4 className="text-primary" style={{ fontSize: '14.5px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={15} /> Create Study Group
                  </h4>
                  <form onSubmit={createGroup}>
                    <div style={{ marginBottom: '12px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Group Name</label>
                      <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }} required />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Category Track</label>
                      <select value={groupCategory} onChange={(e) => setGroupCategory(e.target.value)} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                        <option value="Python">Python</option>
                        <option value="SQL">SQL</option>
                        <option value="Web-Dev">Web Development</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Description</label>
                      <textarea value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} rows={2} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)', resize: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Learning Target</label>
                      <input type="text" value={groupGoal} onChange={(e) => setGroupGoal(e.target.value)} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }} />
                    </div>
                    <button type="submit" className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>Create Group</button>
                  </form>
                </div>

                {/* DISCOVER GROUPS */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
                  <h4 className="text-primary" style={{ fontSize: '14.5px', fontWeight: 800, marginBottom: '16px' }}>Discover Groups</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {groupsData.discover.length === 0 ? (
                      <span className="text-secondary" style={{ fontSize: '11px' }}>No discoverable groups found.</span>
                    ) : (
                      groupsData.discover.map((g) => (
                        <div key={g.id} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="text-primary" style={{ fontWeight: 700, fontSize: '13px' }}>{g.name}</span>
                            <button onClick={() => joinGroup(g.id)} className="btn btn--secondary btn--sm" style={{ fontSize: '11px', padding: '4px 10px' }}>Join</button>
                          </div>
                          <p className="text-secondary" style={{ fontSize: '11px', marginTop: '4px', lineHeight: 1.35 }}>{g.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================== DISCUSSION FORUM ================== */}
          {activeTab === 'forums' && (
            <div>
              {!activePost ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }} className="rewards-grid">
                  
                  {/* POSTS LIST */}
                  <div>
                    <h3 className="section-title" style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Discussion Forum Threads</h3>
                    {forumPosts.length === 0 ? (
                      <RenderEmptyState 
                        title="No Forum Threads" 
                        desc="Be the first to ask a technical question in the community forum!" 
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {forumPosts.map((post) => (
                          <div 
                            key={post.id} 
                            onClick={() => setActivePost(post)}
                            className="std-card"
                            style={{ padding: '20px', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span className="text-secondary" style={{ fontSize: '11px' }}>
                                Posted by <strong style={{ fontWeight: 700 }}>{post.author?.name || 'Learner'}</strong> in {post.track_id}
                              </span>
                              <span className="std-badge std-badge--blue" style={{ fontSize: '10px' }}>
                                {post.replies?.length || 0} replies
                              </span>
                            </div>
                            <h4 className="text-primary" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{post.title}</h4>
                            <p className="text-secondary" style={{ fontSize: '12px', lineHeight: 1.45 }}>{post.content.substring(0, 160)}...</p>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', alignItems: 'center' }}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); upvoteItem(post.id, 'post'); }} 
                                className="btn btn--secondary btn--sm" 
                                style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <ThumbsUp size={11} /> {post.upvotes || 0} Upvotes
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SUBMIT THREAD FORM */}
                  <div>
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
                      <h4 className="text-primary" style={{ fontSize: '14.5px', fontWeight: 800, marginBottom: '16px' }}>Ask a Question</h4>
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
                        <button type="submit" className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>Publish Thread</button>
                      </form>
                    </div>
                  </div>

                </div>
              ) : (
                /* DETAILED THREAD VIEW */
                <div>
                  <button onClick={() => setActivePost(null)} className="btn btn--secondary btn--sm" style={{ marginBottom: '20px' }}>
                    ← Back to Forum Threads
                  </button>

                  <div className="std-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="text-secondary" style={{ fontSize: '11.5px' }}>
                        Posted by <strong>{activePost.author?.name}</strong> • {new Date(activePost.created_at).toLocaleDateString()}
                      </span>
                      <button onClick={() => upvoteItem(activePost.id, 'post')} className="btn btn--secondary btn--sm" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '4px' }}>
                        <ThumbsUp size={12} /> {activePost.upvotes || 0}
                      </button>
                    </div>
                    <h3 className="text-primary" style={{ fontSize: '17px', fontWeight: 800, marginBottom: '12px' }}>{activePost.title}</h3>
                    <p className="text-primary" style={{ fontSize: '13.5px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{activePost.content}</p>
                  </div>

                  {/* REPLIES LIST */}
                  <h4 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Answers / Discussion ({activePost.replies?.length || 0})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                    {(activePost.replies || []).map((rep) => (
                      <div key={rep.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-tertiary)', padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="text-secondary" style={{ fontSize: '11px' }}>
                            Answered by <strong>{rep.author?.name || 'Learner'}</strong>
                          </span>
                          <button onClick={() => upvoteItem(rep.id, 'reply')} className="btn btn--secondary btn--sm" style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', gap: '4px' }}>
                            <ThumbsUp size={10} /> {rep.upvotes || 0}
                          </button>
                        </div>
                        <p className="text-primary" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>{rep.content}</p>
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
                    <button type="submit" className="btn btn--primary" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Send size={15} /> Send Answer
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
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }} className="rewards-grid">
                  
                  {/* REVIEWS SUBMISSIONS */}
                  <div>
                    <h3 className="section-title" style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Peer Code Reviews</h3>
                    {peerReviews.length === 0 ? (
                      <RenderEmptyState 
                        title="No Code Review Snippets" 
                        desc="Need assistance? Share a piece of your code to request reviews and optimization suggestions!" 
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {peerReviews.map((rev) => (
                          <div 
                            key={rev.id} 
                            onClick={() => setActiveReview(rev)}
                            className="std-card"
                            style={{ padding: '20px', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span className="text-secondary" style={{ fontSize: '11px' }}>
                                Shared by <strong style={{ fontWeight: 700 }}>{rev.author?.name || 'Learner'}</strong>
                              </span>
                              <span className="std-badge std-badge--violet" style={{ fontSize: '10px', fontWeight: 700 }}>{rev.language}</span>
                            </div>
                            <h4 className="text-primary" style={{ fontSize: '14.5px', fontWeight: 700, marginBottom: '6px' }}>{rev.title}</h4>
                            <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '14px' }}>{rev.description || 'No description provided.'}</p>
                            <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 600 }}>
                              {rev.comments?.length || 0} reviews feedback posted
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SHARE WORK FORM */}
                  <div>
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
                      <h4 className="text-primary" style={{ fontSize: '14.5px', fontWeight: 800, marginBottom: '16px' }}>Share Code for Review</h4>
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
                          <textarea value={reviewCode} onChange={(e) => setReviewCode(e.target.value)} rows={6} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', resize: 'vertical' }} required />
                        </div>
                        <button type="submit" className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>Submit Snippet</button>
                      </form>
                    </div>
                  </div>

                </div>
              ) : (
                /* REVIEW WORKSPACE DETAIL */
                <div>
                  <button onClick={() => setActiveReview(null)} className="btn btn--secondary btn--sm" style={{ marginBottom: '20px' }}>
                    ← Back to Peer Reviews
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px' }} className="rewards-grid">
                    
                    {/* CODE SNIPPET AND DESC */}
                    <div>
                      <div className="std-card" style={{ padding: '24px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span className="text-secondary" style={{ fontSize: '11.5px' }}>
                            Shared by <strong>{activeReview.author?.name}</strong> • {new Date(activeReview.created_at).toLocaleDateString()}
                          </span>
                          <span className="std-badge std-badge--violet" style={{ fontSize: '10px', fontWeight: 700 }}>{activeReview.language}</span>
                        </div>
                        <h3 className="text-primary" style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>{activeReview.title}</h3>
                        <p className="text-secondary" style={{ fontSize: '12.5px', marginBottom: '20px', lineHeight: 1.4 }}>{activeReview.description}</p>

                        <pre style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', overflowX: 'auto', border: '1px solid var(--border)' }}>
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
                          <button type="submit" className="btn btn--primary">Submit Feedback</button>
                        </form>
                      </div>
                    </div>

                    {/* COMMENTS LIST */}
                    <div>
                      <h4 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Review Comments ({activeReview.comments?.length || 0})</h4>
                      {(!activeReview.comments || activeReview.comments.length === 0) ? (
                        <p className="text-secondary" style={{ fontSize: '12px' }}>No review feedback comments posted yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {activeReview.comments.map((c) => (
                            <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-tertiary)', padding: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span className="text-secondary" style={{ fontSize: '11px' }}>
                                  Reviewed by <strong>{c.author?.name || 'Helper'}</strong>
                                </span>
                                <span className="std-badge std-badge--violet" style={{ fontSize: '8.5px', textTransform: 'uppercase', fontWeight: 700 }}>{c.category}</span>
                              </div>
                              <p className="text-primary" style={{ fontSize: '12.5px', lineHeight: 1.45 }}>{c.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================== RESOURCES VIEW ================== */}
          {activeTab === 'resources' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }} className="rewards-grid">
              
              {/* RESOURCE TIMELINE */}
              <div>
                <h3 className="section-title" style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Shared Notes & Study Templates</h3>
                {sharedResources.length === 0 ? (
                  <RenderEmptyState 
                    title="No Shared Resources" 
                    desc="Publish your revision sheets, cheatsheets, or code templates to share with fellow learners!" 
                  />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {sharedResources.map((res) => (
                      <div key={res.id} className="resource-card">
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>
                              Shared by <strong>{res.author?.name || 'Helper'}</strong>
                            </span>
                            <span className="std-badge std-badge--violet" style={{ fontSize: '9px', textTransform: 'capitalize', fontWeight: 700 }}>{res.type}</span>
                          </div>
                          <h4 className="text-primary" style={{ fontSize: '14.5px', fontWeight: 700, marginBottom: '6px' }}>{res.title}</h4>
                          <p className="text-secondary" style={{ fontSize: '11.5px', marginBottom: '14px', lineHeight: 1.4 }}>{res.description}</p>
                          
                          <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto', marginBottom: '16px' }}>
                            {res.content}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                          <button onClick={() => likeRes(res.id)} className="btn btn--secondary btn--sm" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Heart size={11} style={{ color: '#ef4444' }} /> {res.likes || 0} Likes
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SHARE RESOURCES FORM */}
              <div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
                  <h4 className="text-primary" style={{ fontSize: '14.5px', fontWeight: 800, marginBottom: '16px' }}>Share Study Resource</h4>
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
                      <textarea value={resourceDesc} onChange={(e) => setResourceDesc(e.target.value)} rows={2} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)', resize: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Upload Document (Optional)</label>
                      <input 
                        type="file" 
                        onChange={handleFileUpload} 
                        style={{ width: '100%', fontSize: '12px', color: 'var(--text-secondary)' }} 
                        accept=".pdf,.txt,.md,.json,.js,.py,.ts"
                      />
                      {uploadingFile && <span className="text-secondary" style={{ fontSize: '10px', marginTop: '4px', display: 'block' }}>Uploading to Supabase Storage...</span>}
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label className="text-secondary" style={{ fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Resource Content (Markdown, Text, or File Link)</label>
                      <textarea value={resourceContent} onChange={(e) => setResourceContent(e.target.value)} rows={5} style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)', resize: 'vertical' }} required />
                    </div>
                    <button type="submit" className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>Publish Resource</button>
                  </form>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      </div>{/* /container */}
    </div>
  );
}
