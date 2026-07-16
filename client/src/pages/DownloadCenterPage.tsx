import React, { useState, useEffect } from 'react';
import { 
  Download, Trash2, FileText, Award, Layers, 
  HardDrive, RefreshCcw, CheckCircle, Database, WifiOff
} from 'lucide-react';
import { offlineDb, DownloadedFile, OfflineLesson } from '../utils/offlineDb';
import PageHero from '../components/common/PageHero';
import '../css/pages.css';

const AVAILABLE_MATERIALS = [
  {
    id: 'cheatsheet-fs',
    title: 'Full Stack Web Developer Cheat Sheet',
    type: 'cheatsheet' as const,
    size: 24500,
    description: 'Comprehensive quick reference for HTML5, CSS3 Grid/Flexbox, ES6+ Javascript, and React Hooks.',
    content: 'Full Stack Web Developer Cheat Sheet:\n- CSS Flexbox: justify-content, align-items, flex-direction\n- ES6 Javascript: Map, Filter, Reduce, Promises, Async/Await\n- React Hooks: useState, useEffect, useContext, useCallback, useMemo\n- HTTP Codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error'
  },
  {
    id: 'cheatsheet-ai',
    title: 'AI Engineer Interview Cheat Sheet',
    type: 'cheatsheet' as const,
    size: 31200,
    description: 'Quick guide for Neural Network architectures, loss functions, optimizer comparisons, and PyTorch syntax.',
    content: 'AI Engineer Quick Guide:\n- Activation Functions: ReLU, Sigmoid, Tanh, Softmax\n- Optimizers: SGD, Adam, RMSprop\n- Loss Functions: Cross-Entropy, MSE, Huber Loss\n- PyTorch structure: torch.nn.Module, forward pass, autograd, optimizer.step()'
  },
  {
    id: 'notes-db-opt',
    title: 'Database Optimization Revision Notes',
    type: 'notes' as const,
    size: 42000,
    description: 'Deep dive revision notes on indexing strategies, query execution plans, normalization vs denormalization, and SQL tuning.',
    content: 'Database Optimization Notes:\n- Indexing: B-Tree Indexes, Hash Indexes, Covering Indexes\n- Query Plans: EXPLAIN ANALYZE, sequential scans vs index scans\n- Normalization: 1NF, 2NF, 3NF, BCNF (Boyce-Codd Normal Form)\n- Partitioning: Horizontal vs Vertical partitioning, Sharding'
  },
  {
    id: 'flashcard-python',
    title: 'Python Flashcards Stack (50 cards)',
    type: 'flashcard' as const,
    size: 15600,
    description: 'Pre-compiled offline flashcards covering Python OOP concepts, generators, decorators, and list comprehensions.',
    content: 'Python Flashcards:\n1. Generator: A function that returns an iterator using yield.\n2. Decorator: A function that takes another function and extends its behavior.\n3. List Comprehension: Concise syntax [x for x in list if condition].\n4. Dunder Methods: Special double underscore methods like __init__ or __str__.'
  },
  {
    id: 'report-track-sql',
    title: 'SQL Explorer Completed Track Learning Report',
    type: 'report' as const,
    size: 28000,
    description: 'Official verified track syllabus summary showing progress milestones, practice scores, and XP points.',
    content: 'Learning Report - SQL Explorer:\n- Track Completed on July 10, 2026\n- XP Earned: 1,200 XP\n- Syllabus covered: SELECT, JOINs, Group By, Subqueries, CTEs, Window Functions\n- Skill Verification Score: Expert (92%)'
  }
];

const AVAILABLE_OFFLINE_LESSONS = [
  {
    slug: 'intro-to-react-hooks',
    title: 'Introduction to React Hooks',
    trackName: 'Web Developer Path',
    content: 'React hooks let you use state and other React features without writing a class. The most common hooks are useState (for state management) and useEffect (for side-effects). Always call hooks at the top level of your function, and only call them from React function components or custom hooks.',
    flashcards: ['useState: handles component state', 'useEffect: handles side-effects', 'useContext: reads context variables'],
    summary: 'Master the fundamentals of React function hooks for dynamic frontend UI state management.',
    practiceQuestions: [
      { q: 'Which hook should you use for api fetches?', options: ['useState', 'useEffect', 'useMemo'], correct: 'useEffect' }
    ]
  },
  {
    slug: 'advanced-sql-joins',
    title: 'Advanced SQL JOINS & Subqueries',
    trackName: 'SQL Explorer Path',
    content: 'SQL JOINS allow you to query data from multiple tables. Inner Join returns matched rows; Left Join returns all rows from the left table and matched rows from the right; Right Join returns all rows from the right; Full Join returns all rows from both tables when matches exist.',
    flashcards: ['INNER JOIN: exact match only', 'LEFT JOIN: all left table rows', 'FULL JOIN: all rows from both tables'],
    summary: 'Deepen database queries knowledge by mastering outer joins, cross joins, and nested subqueries.',
    practiceQuestions: [
      { q: 'Which JOIN returns only matching records from both tables?', options: ['LEFT JOIN', 'FULL JOIN', 'INNER JOIN'], correct: 'INNER JOIN' }
    ]
  }
];

export default function DownloadCenterPage() {
  const [downloadedFiles, setDownloadedFiles] = useState<DownloadedFile[]>([]);
  const [offlineLessons, setOfflineLessons] = useState<OfflineLesson[]>([]);
  const [storageStats, setStorageStats] = useState({ usage: 0, quota: 50 * 1024 * 1024 }); // 50MB default
  const [activeSubTab, setActiveSubTab] = useState<'files' | 'lessons'>('files');
  const [toast, setToast] = useState<string | null>(null);

  // Download simulation progress states
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});
  const [downloadingLessons, setDownloadingLessons] = useState<Record<string, number>>({});

  useEffect(() => {
    loadOfflineData();
  }, []);

  const loadOfflineData = async () => {
    try {
      const files = await offlineDb.getAllDownloads();
      const lessons = await offlineDb.getAllLessons();
      const storage = await offlineDb.getStorageUsage();
      
      setDownloadedFiles(files);
      setOfflineLessons(lessons);
      setStorageStats(storage);
    } catch (err) {
      console.error('Error reading IndexedDB records:', err);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const simulateProgress = (id: string, isLesson: boolean, onComplete: () => void) => {
    let progress = 0;
    const setter = isLesson ? setDownloadingLessons : setDownloadingIds;
    
    setter(prev => ({ ...prev, [id]: 0 }));
    
    const interval = setInterval(() => {
      progress += 10;
      setter(prev => ({ ...prev, [id]: progress }));
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setter(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
          onComplete();
        }, 200);
      }
    }, 120);
  };

  const handleDownloadFile = async (material: typeof AVAILABLE_MATERIALS[0]) => {
    const exists = downloadedFiles.some(f => f.id === material.id);
    if (exists) {
      showToast('ℹ️ File is already downloaded!');
      return;
    }

    simulateProgress(material.id, false, async () => {
      try {
        const fileRecord: DownloadedFile = {
          id: material.id,
          title: material.title,
          type: material.type,
          size: material.size,
          downloadDate: new Date().toLocaleDateString(),
          content: material.content
        };

        await offlineDb.saveDownload(fileRecord);
        showToast(`📥 "${material.title}" downloaded offline!`);
        loadOfflineData();
      } catch (err) {
        console.error(err);
        showToast('❌ Failed to download file.');
      }
    });
  };

  const handleDeleteFile = async (id: string) => {
    try {
      await offlineDb.deleteDownload(id);
      showToast('🗑️ File deleted from offline storage.');
      loadOfflineData();
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to delete file.');
    }
  };

  const handleDownloadLesson = async (lesson: typeof AVAILABLE_OFFLINE_LESSONS[0]) => {
    const exists = offlineLessons.some(l => l.slug === lesson.slug);
    if (exists) {
      // Remove directly without simulation
      try {
        await offlineDb.deleteLesson(lesson.slug);
        showToast('🗑️ Lesson removed from offline cache.');
        loadOfflineData();
      } catch (err) {
        showToast('❌ Caching error.');
      }
      return;
    }

    simulateProgress(lesson.slug, true, async () => {
      try {
        const offlineRecord: OfflineLesson = {
          slug: lesson.slug,
          title: lesson.title,
          trackName: lesson.trackName,
          content: lesson.content,
          flashcards: lesson.flashcards,
          summary: lesson.summary,
          practiceQuestions: lesson.practiceQuestions,
          downloadedAt: new Date().toLocaleDateString()
        };
        await offlineDb.saveLesson(offlineRecord);
        showToast(`📥 "${lesson.title}" saved offline!`);
        loadOfflineData();
      } catch (err) {
        console.error(err);
        showToast('❌ Offline caching error.');
      }
    });
  };

  const handleClearAllOfflineData = async () => {
    if (window.confirm('Are you sure you want to delete all offline data?')) {
      try {
        for (const file of downloadedFiles) {
          await offlineDb.deleteDownload(file.id);
        }
        for (const lesson of offlineLessons) {
          await offlineDb.deleteLesson(lesson.slug);
        }
        showToast('🧹 Offline database cache cleared.');
        loadOfflineData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'report':
        return <Layers size={18} style={{ color: 'var(--accent-green)' }} />;
      case 'notes':
      case 'cheatsheet':
        return <FileText size={18} style={{ color: 'var(--accent-blue)' }} />;
      default:
        return <FileText size={18} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usagePercent = Math.min((storageStats.usage / (storageStats.quota || 1)) * 100, 100);

  const RenderEmptyState = ({ desc }: { desc: string }) => (
    <div className="std-empty" style={{ padding: '30px 10px' }}>
      <svg className="empty-illustration" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
      </svg>
      <p className="std-empty__title">Offline Cache Empty</p>
      <p className="std-empty__desc">{desc}</p>
    </div>
  );

  return (
    <div className="page-std">
      <div className="container">

        {/* ── Hero ── */}
        <PageHero
          icon={<Database size={22} />}
          color="green"
          eyebrow="Offline Access"
          title="Download & Offline Hub"
          description="Access and manage study notes, flashcards, reports, and lessons even without an internet connection."
          stats={[
            { label: 'Offline Files',    value: downloadedFiles.length },
            { label: 'Offline Lessons',  value: offlineLessons.length },
            { label: 'Storage Used',     value: formatSize(storageStats.usage) },
          ]}
          actions={
            !navigator.onLine ? (
              <span className="std-badge std-badge--rose" style={{ gap: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center' }}>
                <WifiOff size={12} /> Offline Mode
              </span>
            ) : (
              <span className="std-badge std-badge--green" style={{ gap: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center' }}>
                🟢 Network Connected
              </span>
            )
          }
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }} className="rewards-grid">
          <div>
            {/* Tabs */}
            <div className="std-tabs" style={{ marginBottom: '24px' }}>
              <button
                onClick={() => setActiveSubTab('files')}
                className={`std-tab ${activeSubTab === 'files' ? 'std-tab--active' : ''}`}
              >
                <FileText size={14} /> Reference Files ({downloadedFiles.length})
              </button>
              <button
                onClick={() => setActiveSubTab('lessons')}
                className={`std-tab ${activeSubTab === 'lessons' ? 'std-tab--active' : ''}`}
              >
                <Layers size={14} /> Offline Lessons ({offlineLessons.length})
              </button>
            </div>

            {/* Toast Alert */}
            {toast && (
              <div 
                style={{ backgroundColor: 'var(--accent-blue)', color: '#ffffff', padding: '12px 16px', borderRadius: 'var(--radius-lg)', fontSize: '13px', fontWeight: 600, marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}
              >
                {toast}
              </div>
            )}

            {/* Subtab Contents */}
            {activeSubTab === 'files' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Downloaded Files List */}
                <div className="std-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Downloaded Reference Material</h3>
                  {downloadedFiles.length === 0 ? (
                    <RenderEmptyState desc="No reference files downloaded yet. Choose materials below to save locally." />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {downloadedFiles.map((file) => (
                        <div key={file.id} className="download-card">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                            <div style={{ flexShrink: 0 }}>{getFileIcon(file.type)}</div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.title}</h4>
                              <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }} className="text-secondary">
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>{file.type}</span>
                                <span style={{ fontSize: '11px' }}>•</span>
                                <span style={{ fontSize: '11px' }}>Size: {formatSize(file.size)}</span>
                                <span style={{ fontSize: '11px' }}>•</span>
                                <span style={{ fontSize: '11px' }}>Date: {file.downloadDate}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <button 
                              onClick={() => alert(`Offline preview:\n\n${file.title}\n\n${file.content}`)} 
                              className="btn btn--secondary btn--sm" 
                              style={{ fontSize: '11.5px', padding: '6px 14px' }}
                            >
                              Open File
                            </button>
                            <button 
                              onClick={() => handleDeleteFile(file.id)} 
                              className="btn btn--secondary btn--sm" 
                              style={{ color: 'var(--accent-rose)', border: '1px solid hsla(346,77%,50%,0.2)', padding: '6px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Downloads Registry */}
                <div className="std-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Available Reference Library</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {AVAILABLE_MATERIALS.map((material) => {
                      const isDownloaded = downloadedFiles.some(f => f.id === material.id);
                      const downloadingProgress = downloadingIds[material.id];
                      const isDownloading = downloadingProgress !== undefined;
                      
                      return (
                        <div 
                          key={material.id} 
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}
                        >
                          <div style={{ flex: 1, paddingRight: '16px', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span className="std-badge std-badge--blue" style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', textTransform: 'uppercase' }}>
                                {material.type}
                              </span>
                              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{material.title}</h4>
                            </div>
                            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>{material.description}</p>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              Expected Size: {formatSize(material.size)}
                            </span>
                            
                            {isDownloading && (
                              <div style={{ maxWidth: '200px', marginTop: '8px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--accent-green)', fontWeight: 600 }}>Downloading... {downloadingProgress}%</span>
                                <div className="download-progress-bar">
                                  <div className="download-progress-fill" style={{ width: `${downloadingProgress}%` }} />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => handleDownloadFile(material)} 
                            className={`btn btn--sm ${isDownloaded ? 'btn--secondary' : 'btn--primary'}`} 
                            style={{ display: 'flex', gap: '6px', fontSize: '11.5px', padding: '6px 14px', flexShrink: 0 }}
                            disabled={isDownloaded || isDownloading}
                          >
                            {isDownloaded ? (
                              <>
                                <CheckCircle size={13} /> Stored
                              </>
                            ) : isDownloading ? (
                              'Saving...'
                            ) : (
                              <>
                                <Download size={13} /> Download
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Cached Lessons list */}
                <div className="std-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Offline Cached Lessons</h3>
                  {offlineLessons.length === 0 ? (
                    <RenderEmptyState desc="No lessons cached. Add lessons to keep them offline below." />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {offlineLessons.map((lesson) => (
                        <div key={lesson.slug} className="download-card">
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</h4>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }} className="text-secondary">
                              <span style={{ fontSize: '11px', fontWeight: 600 }}>{lesson.trackName}</span>
                              <span style={{ fontSize: '11px' }}>•</span>
                              <span style={{ fontSize: '11px' }}>Saved: {lesson.downloadedAt}</span>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <button 
                              onClick={() => alert(`Offline Lesson:\n\n${lesson.title}\n\n${lesson.content}\n\nSummary:\n${lesson.summary}`)} 
                              className="btn btn--secondary btn--sm" 
                              style={{ fontSize: '11.5px', padding: '6px 14px' }}
                            >
                              Study Offline
                            </button>
                            <button 
                              onClick={async () => {
                                await offlineDb.deleteLesson(lesson.slug);
                                showToast('🗑️ Lesson deleted from cache.');
                                loadOfflineData();
                              }} 
                              className="btn btn--secondary btn--sm" 
                              style={{ color: 'var(--accent-rose)', border: '1px solid hsla(346,77%,50%,0.2)', padding: '6px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Syllabus Lessons to Download */}
                <div className="std-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Syllabus Lessons Available Offline</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {AVAILABLE_OFFLINE_LESSONS.map((lesson) => {
                      const isCached = offlineLessons.some(l => l.slug === lesson.slug);
                      const downloadingProgress = downloadingLessons[lesson.slug];
                      const isDownloading = downloadingProgress !== undefined;
                      
                      return (
                        <div 
                          key={lesson.slug}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}
                        >
                          <div style={{ flex: 1, paddingRight: '16px', minWidth: 0 }}>
                            <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</h4>
                            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Syllabus: {lesson.trackName} — {lesson.summary}</p>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                              Flashcards: {lesson.flashcards.length} cards • Practice Questions: {lesson.practiceQuestions.length}
                            </span>
                            
                            {isDownloading && (
                              <div style={{ maxWidth: '200px', marginTop: '8px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--accent-green)', fontWeight: 600 }}>Downloading... {downloadingProgress}%</span>
                                <div className="download-progress-bar">
                                  <div className="download-progress-fill" style={{ width: `${downloadingProgress}%` }} />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => handleDownloadLesson(lesson)} 
                            className={`btn btn--sm ${isCached ? 'btn--secondary' : 'btn--primary'}`} 
                            style={{ fontSize: '11.5px', padding: '6px 14px', flexShrink: 0 }}
                            disabled={isDownloading}
                          >
                            {isCached ? (
                              'Remove Offline'
                            ) : isDownloading ? (
                              'Saving...'
                            ) : (
                              'Keep Offline'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar storage controls */}
          <div>
            <div className="storage-card" style={{ position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardDrive size={16} style={{ color: 'var(--accent-green)' }} /> Storage Manager
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                  <span>Local IndexedDB Cache</span>
                  <span>{formatSize(storageStats.usage)}</span>
                </div>
                <div className="xp-progress-bar-outer" style={{ height: '8px' }}>
                  <div 
                    className="xp-progress-bar-inner"
                    style={{ 
                      width: `${Math.max(usagePercent, 2)}%`, 
                      background: 'linear-gradient(90deg, var(--accent-green) 0%, var(--accent-blue) 100%)' 
                    }} 
                  />
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  Allocated Quota Limit: {formatSize(storageStats.quota)}
                </span>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '16px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={loadOfflineData} 
                  className="btn btn--secondary btn--sm" 
                  style={{ width: '100%', fontSize: '12px', gap: '6px', justifyContent: 'center', display: 'flex', alignItems: 'center' }}
                >
                  <RefreshCcw size={12} /> Sync Storage
                </button>
                <button 
                  onClick={handleClearAllOfflineData} 
                  className="btn btn--secondary btn--sm" 
                  style={{ width: '100%', fontSize: '12px', color: 'var(--accent-rose)', border: '1px solid hsla(346,77%,50%,0.2)', justifyContent: 'center', display: 'flex', alignItems: 'center' }}
                >
                  Clear Local Cache
                </button>
              </div>

              <div 
                style={{ 
                  marginTop: '24px', 
                  padding: '12px', 
                  border: '1px dashed var(--border)', 
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)'
                }}
              >
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  Offline Information
                </h4>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  LearnStation stores learning files, note cards, and lesson syllabus content locally in the browser sandbox. You can access all saved materials fully offline.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
