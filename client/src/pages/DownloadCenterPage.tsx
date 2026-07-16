import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Trash2, FileText, Award, Layers, 
  HelpCircle, HardDrive, RefreshCcw, CheckCircle, Database
} from 'lucide-react';
import { offlineDb, DownloadedFile, OfflineLesson } from '../utils/offlineDb';
import PageTransition from '../components/layout/PageTransition';
import '../css/pages.css';

// Mock list of ready-to-download materials
const AVAILABLE_MATERIALS = [
  {
    id: 'cheatsheet-fs',
    title: 'Full Stack Web Developer Cheat Sheet',
    type: 'cheatsheet' as const,
    size: 24500, // bytes
    description: 'Comprehensive quick reference for HTML5, CSS3 Grid/Flexbox, ES6+ Javascript, and React Hooks.',
    content: 'Full Stack Web Developer Cheat Sheet:\n- CSS Flexbox: justify-content, align-items, flex-direction\n- ES6 Javascript: Map, Filter, Reduce, Promises, Async/Await\n- React Hooks: useState, useEffect, useContext, useCallback, useMemo\n- HTTP Codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error'
  },
  {
    id: 'cheatsheet-ai',
    title: 'AI Engineer Interview Cheat Sheet',
    type: 'cheatsheet' as const,
    size: 31200, // bytes
    description: 'Quick guide for Neural Network architectures, loss functions, optimizer comparisons, and PyTorch syntax.',
    content: 'AI Engineer Quick Guide:\n- Activation Functions: ReLU, Sigmoid, Tanh, Softmax\n- Optimizers: SGD, Adam, RMSprop\n- Loss Functions: Cross-Entropy, MSE, Huber Loss\n- PyTorch structure: torch.nn.Module, forward pass, autograd, optimizer.step()'
  },
  {
    id: 'notes-db-opt',
    title: 'Database Optimization Revision Notes',
    type: 'notes' as const,
    size: 42000, // bytes
    description: 'Deep dive revision notes on indexing strategies, query execution plans, normalization vs denormalization, and SQL tuning.',
    content: 'Database Optimization Notes:\n- Indexing: B-Tree Indexes, Hash Indexes, Covering Indexes\n- Query Plans: EXPLAIN ANALYZE, sequential scans vs index scans\n- Normalization: 1NF, 2NF, 3NF, BCNF (Boyce-Codd Normal Form)\n- Partitioning: Horizontal vs Vertical partitioning, Sharding'
  },
  {
    id: 'flashcard-python',
    title: 'Python Flashcards Stack (50 cards)',
    type: 'flashcard' as const,
    size: 15600, // bytes
    description: 'Pre-compiled offline flashcards covering Python OOP concepts, generators, decorators, and list comprehensions.',
    content: 'Python Flashcards:\n1. Generator: A function that returns an iterator using yield.\n2. Decorator: A function that takes another function and extends its behavior.\n3. List Comprehension: Concise syntax [x for x in list if condition].\n4. Dunder Methods: Special double underscore methods like __init__ or __str__.'
  },
  {
    id: 'report-track-sql',
    title: 'SQL Explorer Completed Track Learning Report',
    type: 'report' as const,
    size: 28000, // bytes
    description: 'Official verified track syllabus summary showing progress milestones, practice scores, and XP points.',
    content: 'Learning Report - SQL Explorer:\n- Track Completed on July 10, 2026\n- XP Earned: 1,200 XP\n- Syllabus covered: SELECT, JOINs, Group By, Subqueries, CTEs, Window Functions\n- Skill Verification Score: Expert (92%)'
  }
];

// Mock available offline lessons (Sprint 8.2)
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

  // Download a file to local IndexedDB (Sprint 8.4)
  const handleDownloadFile = async (material: typeof AVAILABLE_MATERIALS[0]) => {
    try {
      // Check if already downloaded
      const exists = downloadedFiles.some(f => f.id === material.id);
      if (exists) {
        showToast('ℹ️ File is already downloaded!');
        return;
      }

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
  };

  // Delete a downloaded file
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

  // Toggle download/offline availability for lessons (Sprint 8.2)
  const handleDownloadLesson = async (lesson: typeof AVAILABLE_OFFLINE_LESSONS[0]) => {
    try {
      const exists = offlineLessons.some(l => l.slug === lesson.slug);
      if (exists) {
        // Delete lesson
        await offlineDb.deleteLesson(lesson.slug);
        showToast('🗑️ Lesson removed from offline cache.');
      } else {
        // Cache lesson
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
        showToast(`📥 "${lesson.title}" saved for offline learning!`);
      }
      loadOfflineData();
    } catch (err) {
      console.error(err);
      showToast('❌ Offline caching error.');
    }
  };

  const handleClearAllOfflineData = async () => {
    if (window.confirm('Are you sure you want to delete all offline data (lessons & files)?')) {
      try {
        for (const file of downloadedFiles) {
          await offlineDb.deleteDownload(file.id);
        }
        for (const lesson of offlineLessons) {
          await offlineDb.deleteLesson(lesson.slug);
        }
        showToast('🧹 Stored offline database cleared successfully.');
        loadOfflineData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'certificate':
        return <Award size={20} style={{ color: 'var(--accent-amber)' }} />;
      case 'report':
        return <Layers size={20} style={{ color: 'var(--accent-green)' }} />;
      case 'notes':
      case 'cheatsheet':
        return <FileText size={20} style={{ color: 'var(--accent-blue)' }} />;
      default:
        return <FileText size={20} style={{ color: 'var(--text-secondary)' }} />;
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

  return (
    <PageTransition>
      <div className="download-center-page" style={{ padding: 'var(--space-8) 0', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, margin: 0 }}>Download & Offline Hub</h1>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Access and manage study notes, flashcards, reports, and lessons offline.
              </p>
            </div>
            {!navigator.onLine && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ef4444', color: '#ffffff', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>
                Offline Mode Active
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }}>
            <div>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
                <button 
                  onClick={() => setActiveSubTab('files')} 
                  className={`btn ${activeSubTab === 'files' ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ fontSize: '13px' }}
                >
                  <FileText size={14} /> Downloaded Files ({downloadedFiles.length})
                </button>
                <button 
                  onClick={() => setActiveSubTab('lessons')} 
                  className={`btn ${activeSubTab === 'lessons' ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ fontSize: '13px' }}
                >
                  <Layers size={14} /> Offline Lessons ({offlineLessons.length})
                </button>
              </div>

              {/* Toast Alert */}
              <AnimatePresence>
                {toast && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{ backgroundColor: 'var(--accent-blue)', color: '#ffffff', padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}
                  >
                    {toast}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subtab Contents */}
              {activeSubTab === 'files' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Downloaded Files List */}
                  <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Downloaded Local Files</h3>
                    {downloadedFiles.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                        No files currently stored offline. Download reference files below to enable offline reading.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {downloadedFiles.map((file) => (
                          <div 
                            key={file.id} 
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {getFileIcon(file.type)}
                              <div>
                                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{file.title}</h4>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                  Type: <span style={{ textTransform: 'capitalize' }}>{file.type}</span> • Size: {formatSize(file.size)} • Date: {file.downloadDate}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => {
                                  // Open local content review popup
                                  alert(`Offline file preview:\n\n${file.title}\n\n${file.content}`);
                                }} 
                                className="btn btn-secondary" 
                                style={{ fontSize: '11px', padding: '4px 10px' }}
                              >
                                View File
                              </button>
                              <button 
                                onClick={() => handleDeleteFile(file.id)} 
                                className="btn btn-secondary" 
                                style={{ color: '#ef4444', padding: '4px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Downloads Registry */}
                  <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Available Reference Material (PDF/Text Offline Notes)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {AVAILABLE_MATERIALS.map((material) => {
                        const isDownloaded = downloadedFiles.some(f => f.id === material.id);
                        return (
                          <div 
                            key={material.id} 
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}
                          >
                            <div style={{ flex: 1, paddingRight: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent-blue)', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                  {material.type}
                                </span>
                                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{material.title}</h4>
                              </div>
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>{material.description}</p>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                Estimated Size: {formatSize(material.size)}
                              </span>
                            </div>
                            <button 
                              onClick={() => handleDownloadFile(material)} 
                              className={`btn ${isDownloaded ? 'btn-secondary' : 'btn-primary'}`} 
                              style={{ display: 'flex', gap: '6px', fontSize: '11px', padding: '6px 12px' }}
                              disabled={isDownloaded}
                            >
                              {isDownloaded ? (
                                <>
                                  <CheckCircle size={13} /> Stored
                                </>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Cached Lessons list */}
                  <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Offline Cached Lessons</h3>
                    {offlineLessons.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                        No lessons cached offline. Toggle offline access on available syllabus content below to download study materials.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {offlineLessons.map((lesson) => (
                          <div 
                            key={lesson.slug}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)' }}
                          >
                            <div>
                              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{lesson.title}</h4>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                Track: {lesson.trackName} • Saved: {lesson.downloadedAt}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => {
                                  alert(`Offline Lesson View:\n\n${lesson.title}\n\n${lesson.content}\n\nSummary:\n${lesson.summary}`);
                                }} 
                                className="btn btn-secondary" 
                                style={{ fontSize: '11px', padding: '4px 10px' }}
                              >
                                Study Offline
                              </button>
                              <button 
                                onClick={() => {
                                  // remove lesson
                                  offlineDb.deleteLesson(lesson.slug);
                                  showToast('🗑️ Lesson deleted from cache.');
                                  loadOfflineData();
                                }} 
                                className="btn btn-secondary" 
                                style={{ color: '#ef4444', padding: '4px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Syllabus Lessons to Download */}
                  <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Syllabus Lessons Available Offline</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {AVAILABLE_OFFLINE_LESSONS.map((lesson) => {
                        const isCached = offlineLessons.some(l => l.slug === lesson.slug);
                        return (
                          <div 
                            key={lesson.slug}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}
                          >
                            <div style={{ flex: 1, paddingRight: '16px' }}>
                              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{lesson.title}</h4>
                              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Syllabus: {lesson.trackName} — {lesson.summary}</p>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                Flashcards: {lesson.flashcards.length} cards • Practice Questions: {lesson.practiceQuestions.length}
                              </span>
                            </div>
                            <button 
                              onClick={() => handleDownloadLesson(lesson)} 
                              className={`btn ${isCached ? 'btn-secondary' : 'btn-primary'}`} 
                              style={{ fontSize: '11px', padding: '6px 12px' }}
                            >
                              {isCached ? 'Remove Offline' : 'Keep Offline'}
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
              <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HardDrive size={16} /> Storage Manager
                </h3>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <span>IndexedDB Cache</span>
                    <span>{formatSize(storageStats.usage)}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${Math.max(usagePercent, 2)}%`, 
                        height: '100%', 
                        backgroundColor: 'var(--accent-blue)', 
                        borderRadius: 'var(--radius-full)' 
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                    Quota allocated: {formatSize(storageStats.quota)}
                  </span>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '16px 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={loadOfflineData} 
                    className="btn btn-secondary" 
                    style={{ width: '100%', fontSize: '12px', gap: '6px', justifyContent: 'center' }}
                  >
                    <RefreshCcw size={12} /> Refresh Storage
                  </button>
                  <button 
                    onClick={handleClearAllOfflineData} 
                    className="btn btn-secondary" 
                    style={{ width: '100%', fontSize: '12px', color: '#ef4444', borderColor: '#ef4444', opacity: 0.8, justifyContent: 'center' }}
                  >
                    Clear Cache
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
                  <h4 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    How it works
                  </h4>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    LearnStation caches assets locally using IndexedDB. Stored items can be opened, read, and tested on even when network access is unavailable.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
