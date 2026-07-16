import React, { useState, useEffect } from 'react';
import { rewardsService, RewardsStatusResponse, ShopItem, Challenge } from '../services/rewardsService';
import { 
  Coins, Trophy, Calendar, CheckCircle2, Circle, Flame, Sparkles, 
  Lock, Award, Shield, User, GraduationCap, Code2, Monitor, AlertCircle, Star
} from 'lucide-react';
import PageHero from '../components/common/PageHero';
import '../css/pages.css';

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export default function RewardsPage() {
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
    
    // Spawn 25 random emoji particles radiating outwards
    const emojis = ['🪙', '🎉', '✨', '🎓', '🏆', '🔥'];
    const newParticles: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: 0,
      y: 0
    }));

    setParticles(newParticles);
    
    // Clear celebration popup after 3 seconds
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
        // Refresh local status
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

  // Filter items based on active tab
  const filteredShopItems = activeTab === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === activeTab);

  // Rarity labels formatter helper
  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'rarity-mythic';
      case 'legendary': return 'rarity-legendary';
      case 'epic': return 'rarity-epic';
      case 'rare': return 'rarity-rare';
      default: return 'rarity-common';
    }
  };

  // Icon selector for category tab
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'profile': return <User size={16} />;
      case 'certificates': return <GraduationCap size={16} />;
      case 'editor': return <Code2 size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  return (
    <div className="page-std" style={{ position: 'relative' }}>
      <div className="container">

      {/* ── Hero ── */}
      <PageHero
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
        actions={
          <div style={{ textAlign: 'center' }}>
            <Coins size={36} style={{ color: 'var(--accent-amber)', display: 'block', margin: '0 auto 4px' }} />
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{coins}</span>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>LearnCoins</p>
          </div>
        }
      />

      {/* 2. MAIN LAYOUT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
        
        {/* LEFT COLUMN: Challenges & Shop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* CHALLENGE HUB */}
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Trophy style={{ color: 'var(--accent-blue)' }} /> Challenges & Missions
            </h2>
            
            {/* Daily Challenges */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> Daily Challenges
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dailyMissions.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      {m.completed ? (
                        <CheckCircle2 className="rarity-rare" size={20} />
                      ) : (
                        <Circle className="text-secondary" size={20} />
                      )}
                      <div>
                        <div className="text-primary" style={{ fontWeight: 600, fontSize: '14px' }}>{m.text}</div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                          <span className="text-secondary" style={{ fontSize: '11px' }}>
                            Progress: {m.current} / {m.target}
                          </span>
                          <span style={{ fontSize: '11px', color: '#eab308', fontWeight: 600 }}>
                            +25 XP & 10 Coins
                          </span>
                        </div>
                      </div>
                    </div>
                    {m.completed && !m.claimed && (
                      <button className="btn btn-primary" onClick={() => handleClaim('daily', m.id, m.text)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Claim
                      </button>
                    )}
                    {m.claimed && (
                      <span className="text-secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Claimed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Challenges */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} /> Weekly Challenges
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {weeklyMissions.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      {m.completed ? (
                        <CheckCircle2 className="rarity-rare" size={20} />
                      ) : (
                        <Circle className="text-secondary" size={20} />
                      )}
                      <div>
                        <div className="text-primary" style={{ fontWeight: 600, fontSize: '14px' }}>{m.text}</div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                          <span className="text-secondary" style={{ fontSize: '11px' }}>
                            Progress: {m.current} / {m.target}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--accent-violet)', fontWeight: 600 }}>
                            +{m.xp_reward} XP & {m.coins_reward} Coins
                          </span>
                        </div>
                      </div>
                    </div>
                    {m.completed && !m.claimed && (
                      <button className="btn btn-primary" onClick={() => handleClaim('weekly', m.id, m.text)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Claim
                      </button>
                    )}
                    {m.claimed && (
                      <span className="text-secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Claimed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* REWARD SHOP */}
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Coins style={{ color: 'var(--accent-blue)' }} /> Rewards & Cosmetics Shop
            </h2>
            <p className="text-secondary" style={{ fontSize: '13px', marginBottom: '20px' }}>Purchase custom skins, styling accents, name coloring, and frames with LearnCoins. No pay-to-win items.</p>

            {/* TAB SELECTORS */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              {(['all', 'profile', 'editor', 'dashboard', 'certificates'] as const).map((tab) => (
                <button 
                  key={tab} 
                  className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize', fontSize: '13px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab !== 'all' && getCategoryIcon(tab)}
                  {tab}
                </button>
              ))}
            </div>

            {/* SHOP GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {filteredShopItems.map((item) => {
                const isPurchased = purchasedItems.includes(item.id);
                const isEquipped = activeCosmetics[item.category] === item.id;
                
                return (
                  <div 
                    key={item.id} 
                    className={`reward-card ${isEquipped ? 'reward-card--equipped' : ''}`}
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className={`achievement-tier-badge ${getRarityClass(item.rarity)}`} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                          {item.rarity}
                        </span>
                        <span className="text-secondary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-primary" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{item.name}</h4>
                      <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '16px', lineHeight: 1.4 }}>{item.description}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                      {!isPurchased ? (
                        <button 
                          className="btn btn-primary" 
                          style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
                          disabled={coins < item.cost}
                          onClick={() => handlePurchase(item)}
                        >
                          Buy ({item.cost} Coins)
                        </button>
                      ) : (
                        <>
                          <button 
                            className={`btn ${isEquipped ? 'btn-secondary' : 'btn-primary'}`}
                            style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
                            onClick={() => handleEquip(item.category, isEquipped ? null : item.id)}
                          >
                            {isEquipped ? 'Unequip' : 'Equip'}
                          </button>
                          <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>Owned</span>
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
          
          {/* CURRENT SEASON CARD */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} className="rarity-legendary" /> Seasonal Event
            </h3>
            
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', marginBottom: '16px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{season.name}</div>
              <div className="text-secondary" style={{ fontSize: '11px', marginTop: '4px' }}>
                Ends in: {new Date(season.endsAt).toLocaleDateString()}
              </div>
            </div>

            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>Exclusive Rewards</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {season.exclusiveRewards.map((reward) => (
                <div key={reward.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span className="text-primary" style={{ fontWeight: 500 }}>{reward.name}</span>
                  <span className={`achievement-tier-badge ${getRarityClass(reward.rarity)}`} style={{ fontSize: '9px' }}>
                    {reward.rarity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* STREAK GOALS & REWARDS */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} style={{ color: '#ef4444' }} /> Learning Streak
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Longest Streak</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>30 Days</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Milestone Target</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>60 Days</div>
              </div>
            </div>

            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>Streak Milestones</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { days: 7, title: 'Week 1 Complete', reward: 'Bronze Medal', unlocked: true },
                { days: 14, title: 'Consistent Learner', reward: 'Silver Medal', unlocked: true },
                { days: 30, title: 'Habit Builder', reward: 'Dracula Theme', unlocked: true },
                { days: 60, title: 'Code Warrior', reward: 'Emerald Name Color', unlocked: false },
                { days: 100, title: 'Elite Dev', reward: 'Legendary Seal', unlocked: false }
              ].map((m) => (
                <div key={m.days} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: m.unlocked ? 1 : 0.6 }}>
                  {m.unlocked ? (
                    <Sparkles size={16} style={{ color: '#eab308' }} />
                  ) : (
                    <Lock size={16} className="text-secondary" />
                  )}
                  <div style={{ flex: 1 }}>
                    <div className="text-primary" style={{ fontSize: '13px', fontWeight: 600 }}>{m.days} Days Streak</div>
                    <div className="text-secondary" style={{ fontSize: '11px' }}>{m.title} ({m.reward})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLLECTIONS GALLERY */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: 'var(--accent-violet)' }} /> Rarity Collections
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'Python Beginner Certificate', rarity: 'common' },
                { name: 'Dracula Theme skin', rarity: 'rare' },
                { name: 'Gold Frame avatar decoration', rarity: 'epic' },
                { name: 'Cyberpunk editor style', rarity: 'legendary' },
                { name: 'Royal Seal cert background', rarity: 'mythic' }
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span className="text-primary" style={{ fontWeight: 500 }}>{c.name}</span>
                  <span className={`achievement-tier-badge ${getRarityClass(c.rarity)}`} style={{ fontSize: '9px' }}>
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
          background: 'rgba(0, 0, 0, 0.45)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(4px)'
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
                    // Define keyframe custom values inline
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
            className="reward-card" 
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
            <h2 className="text-primary" style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>{celebration.title}</h2>
            <p className="text-secondary" style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>{celebration.msg}</p>
            <button className="btn btn-primary" onClick={() => setCelebration(null)} style={{ padding: '8px 24px', fontSize: '13px' }}>
              Awesome!
            </button>
          </div>

          {/* KEYFRAME ANIMATIONS DEFINITIONS */}
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
