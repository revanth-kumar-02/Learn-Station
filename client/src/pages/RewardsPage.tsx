import React, { useState, useEffect } from 'react';
import { rewardsService, RewardsStatusResponse, ShopItem } from '../services/rewardsService';
import { useAuth } from '../context/AuthContext';
import { 
  Coins, Trophy, Calendar, CheckCircle2, Circle, Flame, Sparkles, 
  Lock, Award, Shield, User, GraduationCap, Code2, Monitor, AlertCircle
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import '../css/pages.css';

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export default function RewardsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<RewardsStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'profile' | 'editor' | 'dashboard' | 'certificates'>('all');
  
  // Celebration modal / particle state
  const [celebration, setCelebration] = useState<{
    visible: boolean;
    title: string;
    msg: string;
  } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    fetchRewardsStatus();
  }, []);

  const fetchRewardsStatus = async () => {
    try {
      setLoading(true);
      const res = await rewardsService.getStatus();
      setData(res);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load rewards dashboard status.');
    } finally {
      setLoading(false);
    }
  };

  const triggerCelebrationParticles = (title: string, msg: string) => {
    setCelebration({ visible: true, title, msg });
    
    // Spawn 30 random emoji particles radiating outwards
    const emojis = ['🪙', '🎉', '✨', '🏆', '🔥'];
    const newParticles: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: 0,
      y: 0
    }));

    setParticles(newParticles);
    
    // Clear celebration popup after 3.5 seconds
    setTimeout(() => {
      setCelebration(null);
      setParticles([]);
    }, 3500);
  };

  const handleClaim = async (type: 'daily' | 'weekly', id: string, name: string) => {
    try {
      const res = await rewardsService.claimChallenge(type, id);
      if (res.success) {
        triggerCelebrationParticles(
          'Challenge Completed! 🎉',
          `You earned +${res.xpEarned} XP and +${res.coinsEarned} LearnCoins for completing "${name}"!`
        );
        fetchRewardsStatus();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to claim challenge reward.');
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    try {
      const res = await rewardsService.purchase(item.id);
      if (res.success) {
        triggerCelebrationParticles(
          'Item Purchased! 🛍️',
          `You unlocked "${item.name}" for ${item.cost} LearnCoins!`
        );
        fetchRewardsStatus();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to purchase shop item.');
    }
  };

  const handleEquip = async (category: string, itemId: string | null) => {
    try {
      const res = await rewardsService.equip(category, itemId);
      if (res.success) {
        fetchRewardsStatus();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to equip cosmetic item.');
    }
  };

  if (loading && !data) {
    return (
      <div className="page-std">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-std">
        <div className="container">
          <div className="std-empty">
            <div className="std-empty__icon"><AlertCircle size={24} /></div>
            <p className="std-empty__title">Error loading rewards</p>
            <p className="std-empty__desc">{error}</p>
            <button className="btn btn--primary btn--sm" onClick={fetchRewardsStatus}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const { coins, dailyMissions, weeklyMissions, activeCosmetics, purchasedItems, levelProgress, season, shopItems } = data!;

  const filteredShopItems = activeTab === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === activeTab);

  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'rarity-mythic';
      case 'legendary': return 'rarity-legendary';
      case 'epic': return 'rarity-epic';
      case 'rare': return 'rarity-rare';
      default: return 'rarity-common';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile': return <User size={14} />;
      case 'certificates': return <GraduationCap size={14} />;
      case 'editor': return <Code2 size={14} />;
      default: return <Monitor size={14} />;
    }
  };

  return (
    <div className="page-std animate-fade-in" style={{ position: 'relative' }}>
      <PageHeader
        icon={<Coins size={22} />}
        color="amber"
        eyebrow="Gamification & Progression"
        title="Rewards & Economy"
        description="Maintain streaks, complete missions, collect rare cosmetics, and build consistent habits."
        stats={[
          { label: 'LearnCoins', value: coins },
          { label: 'Level',      value: levelProgress.level },
          { label: 'XP Progress', value: `${Math.round(levelProgress.progress * 100)}%` },
          { label: 'Season',     value: season?.name || 'Active' },
        ]}
      />

      <div className="container" style={{ marginTop: '0px' }}>

        {/* 2. MAIN LAYOUT GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }} className="rewards-grid">
          
          {/* LEFT COLUMN: Challenges & Shop */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* CHALLENGE HUB */}
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Trophy style={{ color: 'var(--accent-blue)' }} size={20} /> Challenges & Missions
              </h2>
              
              {/* Daily Challenges */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} /> Daily Missions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dailyMissions.map((m) => (
                    <div 
                      key={m.id} 
                      className={`mission-card ${m.completed ? 'mission-card--completed' : ''} ${m.claimed ? 'mission-card--claimed' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                        <div style={{ flexShrink: 0 }}>
                          {m.completed ? (
                            <CheckCircle2 className="text-accent-green" size={20} />
                          ) : (
                            <Circle className="text-secondary" size={20} />
                          )}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="text-primary" style={{ fontWeight: 600, fontSize: '13.5px' }}>{m.text}</div>
                          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div className="xp-progress-bar-outer" style={{ width: '80px', height: '6px', margin: 0 }}>
                              <div className="xp-progress-bar-inner" style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }} />
                            </div>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>
                              {m.current} / {m.target}
                            </span>
                            <span className="std-badge std-badge--amber" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              +25 XP
                            </span>
                            <span className="std-badge std-badge--blue" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              +10 Coins
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ flexShrink: 0, marginLeft: '12px' }}>
                        {m.completed && !m.claimed && (
                          <button className="btn btn--primary btn--sm" onClick={() => handleClaim('daily', m.id, m.text)} style={{ padding: '6px 14px', fontSize: '12px' }}>
                            Claim
                          </button>
                        )}
                        {m.claimed && (
                          <span className="text-secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Claimed</span>
                        )}
                        {!m.completed && (
                          <span className="text-secondary" style={{ fontSize: '11px', fontWeight: 500 }}>Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Challenges */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={15} /> Weekly Milestones
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {weeklyMissions.map((m) => (
                    <div 
                      key={m.id} 
                      className={`mission-card ${m.completed ? 'mission-card--completed' : ''} ${m.claimed ? 'mission-card--claimed' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                        <div style={{ flexShrink: 0 }}>
                          {m.completed ? (
                            <CheckCircle2 className="text-accent-green" size={20} />
                          ) : (
                            <Circle className="text-secondary" size={20} />
                          )}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="text-primary" style={{ fontWeight: 600, fontSize: '13.5px' }}>{m.text}</div>
                          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div className="xp-progress-bar-outer" style={{ width: '80px', height: '6px', margin: 0 }}>
                              <div className="xp-progress-bar-inner" style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }} />
                            </div>
                            <span className="text-secondary" style={{ fontSize: '11px' }}>
                              {m.current} / {m.target}
                            </span>
                            <span className="std-badge std-badge--violet" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              +{m.xp_reward} XP
                            </span>
                            <span className="std-badge std-badge--blue" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              +{m.coins_reward} Coins
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ flexShrink: 0, marginLeft: '12px' }}>
                        {m.completed && !m.claimed && (
                          <button className="btn btn--primary btn--sm" onClick={() => handleClaim('weekly', m.id, m.text)} style={{ padding: '6px 14px', fontSize: '12px' }}>
                            Claim
                          </button>
                        )}
                        {m.claimed && (
                          <span className="text-secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Claimed</span>
                        )}
                        {!m.completed && (
                          <span className="text-secondary" style={{ fontSize: '11px', fontWeight: 500 }}>Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* REWARD SHOP */}
            <div>
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Coins style={{ color: 'var(--accent-blue)' }} size={20} /> Rewards & Cosmetics Shop
              </h2>
              <p className="text-secondary" style={{ fontSize: '13px', marginBottom: '20px' }}>Purchase custom skins, styling accents, name coloring, and frames with LearnCoins. No pay-to-win items.</p>

              {/* TAB SELECTORS */}
              <div className="std-tabs" style={{ marginBottom: '20px' }}>
                {(['all', 'profile', 'editor', 'dashboard', 'certificates'] as const).map((tab) => (
                  <button 
                    key={tab} 
                    className={`std-tab ${activeTab === tab ? 'std-tab--active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab !== 'all' && getCategoryIcon(tab)}
                    {tab}
                  </button>
                ))}
              </div>

              {/* SHOP GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {filteredShopItems.map((item) => {
                  const isPurchased = purchasedItems.includes(item.id);
                  const isEquipped = activeCosmetics[item.category] === item.id;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`std-card ${isEquipped ? 'border-accent-blue' : ''}`}
                      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', minHeight: '180px', position: 'relative' }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span className={`std-badge ${getRarityClass(item.rarity)}`} style={{ textTransform: 'uppercase', fontSize: '9px', fontWeight: 700 }}>
                            {item.rarity}
                          </span>
                          <span className="text-secondary" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
                            {item.category}
                          </span>
                        </div>
                        <h4 className="text-primary" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{item.name}</h4>
                        <p className="text-secondary" style={{ fontSize: '11px', marginBottom: '16px', lineHeight: 1.4 }}>{item.description}</p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                        {!isPurchased ? (
                          <button 
                            className="btn btn--primary btn--sm" 
                            style={{ flex: 1, fontSize: '12px', padding: '8px 12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                            disabled={coins < item.cost}
                            onClick={() => handlePurchase(item)}
                          >
                            <Coins size={12} /> Buy ({item.cost})
                          </button>
                        ) : (
                          <>
                            <button 
                              className={`btn btn--sm ${isEquipped ? 'btn--secondary' : 'btn--primary'}`}
                              style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
                              onClick={() => handleEquip(item.category, isEquipped ? null : item.id)}
                            >
                              {isEquipped ? 'Unequip' : 'Equip'}
                            </button>
                            <span className="text-accent-green" style={{ fontSize: '11px', fontWeight: 600 }}>Owned</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Seasons + Streaks + Collections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* LEARNCOINS WALLET CARD */}
            <div className="coins-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Virtual Wallet Balance</span>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', letterSpacing: '0.5px' }}>{coins.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: 500 }}>Coins</span></div>
                </div>
                <div className="coins-card__chip"></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '28px' }}>
                <div>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.6, display: 'block' }}>Card Holder</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{user?.name || 'LearnStation Student'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.6, display: 'block' }}>Account Rank</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Level {levelProgress.level}</span>
                </div>
              </div>
              <div className="coins-card__bg-icon">🪙</div>
            </div>

            {/* XP PROGRESS BAR CONTAINER */}
            <div className="xp-progress-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                <span className="text-primary" style={{ fontWeight: 700, fontSize: '13px' }}>Current Progression</span>
                <span className="text-secondary" style={{ fontSize: '11.5px' }}>
                  {Math.round(levelProgress.progress * 100)}% to Level {levelProgress.level + 1}
                </span>
              </div>
              <div className="xp-progress-bar-outer" style={{ marginBottom: '8px' }}>
                <div className="xp-progress-bar-inner" style={{ width: `${levelProgress.progress * 100}%` }}></div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Earn XP by completing coding tracks, daily practices, and community reviews.</span>
            </div>

            {/* CURRENT SEASON CARD */}
            <div className="seasonal-event-card">
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} className="text-accent-violet" /> Seasonal Event
              </h3>
              
              <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{season.name}</div>
                <div className="text-secondary" style={{ fontSize: '11px', marginTop: '4px' }}>
                  Ends: {new Date(season.endsAt).toLocaleDateString()}
                </div>
              </div>

              <h4 style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Exclusive Event Cosmetics</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {season.exclusiveRewards.map((reward) => (
                  <div key={reward.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', background: 'var(--bg-tertiary)', padding: '6px 10px', borderRadius: 'var(--radius-md)' }}>
                    <span className="text-primary" style={{ fontWeight: 500 }}>{reward.name}</span>
                    <span className={`std-badge ${getRarityClass(reward.rarity)}`} style={{ fontSize: '8.5px', fontWeight: 700 }}>
                      {reward.rarity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* STREAK GOALS & REWARDS */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} style={{ color: '#ef4444' }} /> Learning Streak
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Longest Streak</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>30 Days</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Next Milestone</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>60 Days</div>
                </div>
              </div>

              <h4 style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>Streak Milestones</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { days: 7, title: 'Week 1 Complete', reward: 'Bronze Medal', unlocked: true },
                  { days: 14, title: 'Consistent Learner', reward: 'Silver Medal', unlocked: true },
                  { days: 30, title: 'Habit Builder', reward: 'Dracula Theme', unlocked: true },
                  { days: 60, title: 'Code Warrior', reward: 'Emerald Name Color', unlocked: false },
                  { days: 100, title: 'Elite Dev', reward: 'Legendary Seal', unlocked: false }
                ].map((m) => (
                  <div key={m.days} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: m.unlocked ? 1 : 0.55 }}>
                    {m.unlocked ? (
                      <Sparkles size={14} style={{ color: '#eab308' }} />
                    ) : (
                      <Lock size={14} className="text-secondary" />
                    )}
                    <div style={{ flex: 1 }}>
                      <div className="text-primary" style={{ fontSize: '12px', fontWeight: 600 }}>{m.days} Days Streak</div>
                      <div className="text-secondary" style={{ fontSize: '11px' }}>{m.title} ({m.reward})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLLECTIONS GALLERY */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} style={{ color: 'var(--accent-violet)' }} /> Rarity Collections
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Python Beginner Certificate', rarity: 'common' },
                  { name: 'Dracula Theme skin', rarity: 'rare' },
                  { name: 'Gold Frame avatar decoration', rarity: 'epic' },
                  { name: 'Cyberpunk editor style', rarity: 'legendary' },
                  { name: 'Royal Seal cert background', rarity: 'mythic' }
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span className="text-primary" style={{ fontWeight: 500 }}>{c.name}</span>
                    <span className={`std-badge ${getRarityClass(c.rarity)}`} style={{ fontSize: '8.5px', fontWeight: 700 }}>
                      {c.rarity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* 3. DYNAMIC CELEBRATION POPUP OVERLAY */}
        {celebration && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.45)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(6px)'
          }}>
            {/* EMOJI PARTICLES LAYER */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
              {particles.map((p, index) => {
                const angle = (index / particles.length) * 360 * (Math.PI / 180);
                const distance = 120 + Math.random() * 80;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                
                return (
                  <div 
                    key={p.id}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '28px',
                      animation: 'particleMove 1.5s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      ['--tx' as any]: `${tx}px`,
                      ['--ty' as any]: `${ty}px`
                    }}
                  >
                    {p.emoji}
                  </div>
                );
              })}
            </div>

            {/* DIALOG BOX */}
            <div 
              className="std-card" 
              style={{ 
                background: 'var(--bg-secondary)', 
                padding: '32px 40px', 
                borderRadius: 'var(--radius-xl)', 
                textAlign: 'center', 
                maxWidth: '420px', 
                boxShadow: 'var(--shadow-xl)',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
              }}
            >
              <Coins size={60} className="coin-icon-spin" style={{ color: '#eab308', marginBottom: '16px' }} />
              <h2 className="text-primary" style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>{celebration.title}</h2>
              <p className="text-secondary" style={{ fontSize: '13.5px', lineHeight: 1.6, marginBottom: '24px' }}>{celebration.msg}</p>
              <button className="btn btn--primary" onClick={() => setCelebration(null)} style={{ padding: '8px 24px', fontSize: '13px' }}>
                Awesome!
              </button>
            </div>

            <style>{`
              @keyframes particleMove {
                0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
                100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.2); opacity: 0; }
              }
              @keyframes popIn {
                0% { transform: scale(0.6); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </div>
        )}

      </div>{/* /container */}
    </div>
  );
}
