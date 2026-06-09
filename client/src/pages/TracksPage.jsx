import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { trackService } from '../services/trackService';
import ProgressBar from '../components/common/ProgressBar';
import PageTransition from '../components/layout/PageTransition';

const TRACK_ICONS = {
  sql: '🗄️',
  python: '🐍',
  webdev: '🌐',
  ai: '🤖',
  datascience: '📈',
  java: '☕',
  javascript: '⚡',
  typescript: '🟦',
  'c-lang': '📟',
  cpp: '🚀',
  csharp: '🎯',
  'go-lang': '🐹',
  rust: '🦀',
  kotlin: '🎯',
  swift: '🦅',
  php: '🐘',
  html: '📄',
  css: '🎨',
  react: '⚛️',
  nextjs: '🌐',
  angular: '🅰️',
  vuejs: '🟢',
  nodejs: '🟢',
  expressjs: '🚂',
  tailwindcss: '🍃',
  'android-dev': '🤖',
  flutter: '🦋',
  'react-native': '⚛️',
  swiftui: '🦅',
  'ios-dev': '🍎',
  'advanced-sql': '🗄️',
  postgresql: '🐘',
  mysql: '🐬',
  mongodb: '🍃',
  redis: '🟥',
  'db-design': '📐',
  'data-analysis': '📊',
  numpy: '📐',
  pandas: '🐼',
  'data-viz': '📈',
  statistics: '🧮',
  'prompt-eng': '💬',
  nlp: '🗣️',
  'computer-vision': '👁️',
  'generative-ai': '🎨',
  'llm-engineering': '🤖',
  'ai-agents': '🕵️',
  'rag-systems': '📚',
  'deep-learning': '🧠',
  linux: '🐧',
  'git-github': '🐙',
  docker: '🐳',
  kubernetes: '☸️',
  aws: '☁️',
  azure: '☁️',
  'google-cloud': '☁️',
  cicd: '🤖',
  terraform: '🏗️',
  'security-fundamentals': '🛡️',
  'network-security': '🔒',
  'ethical-hacking': '🕵️',
  pentesting: '🎯',
  'web-security': '🌐',
  'digital-forensics': '🔍',
  'data-structures': '🧱',
  algorithms: '🧮',
  'system-design': '📐',
  'design-patterns': '🧩',
  oop: '⚙️',
  'software-arch': '🏛️',
  'frontend-career': '💼',
  'backend-career': '💼',
  'fullstack-career': '💼',
  'mobile-career': '💼',
  'data-analyst': '💼',
  'ml-engineer': '💼',
  'devops-engineer': '💼',
  'cloud-engineer': '💼',
  'cyber-analyst': '💼',
  'product-management-track': '📊',
  'uiux-design': '🎨',
  'agile-framework': '🔄',
  'scrum-framework': '🏉',
  'business-analysis': '📈'
};

// Extended premium static metadata for tracks
const TRACK_PREMIUM_META = {
  sql: {
    difficulty: 'Beginner',
    time: '6 hours',
    xp: '600 XP',
    quizzes: 24,
    projects: '6 mini-projects',
    careers: ['Data Analyst', 'Database Administrator', 'Backend Engineer'],
    syllabus: [
      'Relational Database Basics & SELECT Statements',
      'Filtering & Sorting with WHERE, ORDER BY',
      'JOINS: Connecting Tables Like a Pro',
      'Aggregation & Grouping (SUM, AVG, GROUP BY)',
      'Subqueries & Common Table Expressions (CTEs)',
      'Database Schema Design & Constraints'
    ]
  },
  python: {
    difficulty: 'Beginner',
    time: '8 hours',
    xp: '600 XP',
    quizzes: 24,
    projects: '6 mini-projects',
    careers: ['Software Developer', 'Data Scientist', 'Automation Engineer'],
    syllabus: [
      'Python Variables, Data Types, & Operations',
      'Control Flow: Conditions, Loops & Iterators',
      'Defining & Using Functions, Scope, & Modules',
      'Data Structures: Lists, Dictionaries, Sets, Tuples',
      'Object-Oriented Programming (Classes & Objects)',
      'File Handling & Exception Control'
    ]
  },
  webdev: {
    difficulty: 'Intermediate',
    time: '12 hours',
    xp: '600 XP',
    quizzes: 24,
    projects: '6 mini-projects',
    careers: ['Frontend Developer', 'Full Stack Engineer', 'UI/UX Developer'],
    syllabus: [
      'HTML5 Semantics & Structure',
      'CSS3 Layouts: Flexbox, Grid & Responsive Design',
      'JavaScript ES6+ Syntax & DOM Manipulation',
      'Asynchronous JS & Fetching REST APIs',
      'Introduction to React Components & State Management',
      'Stateful SPAs & Deploying Web Applications'
    ]
  },
  ai: {
    difficulty: 'Advanced',
    time: '10 hours',
    xp: '600 XP',
    quizzes: 24,
    projects: '6 mini-projects',
    careers: ['AI Engineer', 'NLP Engineer', 'Machine Learning Architect'],
    syllabus: [
      'Introduction to Machine Learning & Neural Networks',
      'Natural Language Processing & Embeddings',
      'Generative AI & Transformer Models (GPT)',
      'Prompt Engineering & Agent Frameworks',
      'Vector Databases & Retrieval-Augmented Generation (RAG)',
      'Ethical AI, Bias Mitigation & Production Guardrails'
    ]
  },
  datascience: {
    difficulty: 'Intermediate',
    time: '10 hours',
    xp: '600 XP',
    quizzes: 24,
    projects: '6 mini-projects',
    careers: ['Data Scientist', 'BI Analyst', 'Quantitative Researcher'],
    syllabus: [
      'Data Manipulation with NumPy & Pandas',
      'Data Visualization: Matplotlib & Seaborn',
      'Exploratory Data Analysis (EDA) Techniques',
      'Statistical Analysis: Distributions & Hypothesis Testing',
      'Introduction to Scikit-Learn Regression & Classification',
      'Data Cleaning Pipelines & Visual Reports'
    ]
  },
  java: {
    difficulty: 'Intermediate',
    time: '9 hours',
    xp: '600 XP',
    quizzes: 24,
    projects: '6 mini-projects',
    careers: ['Java Backend Developer', 'Enterprise Architect', 'Android Engineer'],
    syllabus: [
      'Java Syntax, Variables & Basic Operators',
      'Conditional Logic, Loops & Control Flow',
      'OOP Principles: Inheritance, Polymorphism, Encapsulation',
      'Data Collections: Lists, Maps, & Sets Frameworks',
      'Exception Handling & Robust Logging',
      'Multithreading, Streams API & Backend Server Basics'
    ]
  },
  javascript: {
    difficulty: 'Beginner',
    time: '5 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['Frontend Developer', 'Full Stack Developer'],
    syllabus: ['Variables & Scoping Rules', 'Arrow Functions', 'DOM manipulation', 'Async-await Operations']
  },
  react: {
    difficulty: 'Intermediate',
    time: '6 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['Frontend Developer', 'React Developer'],
    syllabus: ['JSX & Virtual DOM', 'Components & Props', 'useState & useEffect hooks', 'State Management Context']
  },
  'git-github': {
    difficulty: 'Beginner',
    time: '3 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['Software Developer', 'DevOps Specialist'],
    syllabus: ['Git Commits & Branching', 'Merge Conflict Resolution', 'Rebase vs Merge', 'GitHub PR workflow']
  },
  'data-structures': {
    difficulty: 'Intermediate',
    time: '7 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['Algorithm Engineer', 'Backend Developer'],
    syllabus: ['Linear lists, Queues & Stacks', 'Hash tables collisions', 'Binary search trees', 'Graphs representation']
  },
  algorithms: {
    difficulty: 'Advanced',
    time: '8 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['Algorithm Scientist', 'Software Architect'],
    syllabus: ['Big O notation analysis', 'Recursion & Sorting', 'Dynamic Programming', 'Graph traversals']
  },
  'prompt-eng': {
    difficulty: 'Beginner',
    time: '4 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['AI Prompt Engineer', 'NLP Architect'],
    syllabus: ['System directives', 'Few-Shot priming', 'Chain-of-thought methods', 'JSON output schemas']
  },
  docker: {
    difficulty: 'Intermediate',
    time: '4 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['DevOps Engineer', 'Infrastructure Engineer'],
    syllabus: ['Docker Containers concepts', 'Dockerfile configurations', 'Volumes persistence', 'Compose multi-container']
  },
  nodejs: {
    difficulty: 'Intermediate',
    time: '6 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['Node.js Backend Developer', 'API Engineer'],
    syllabus: ['Event Loop runtime', 'File System operations', 'HTTP core modules', 'Buffers & Stream pipelines']
  },
  typescript: {
    difficulty: 'Intermediate',
    time: '5 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['Frontend Engineer', 'TS Architect'],
    syllabus: ['Static types annotations', 'Interfaces & Aliases', 'Generics foundations', 'Decorators & tsconfig']
  },
  flutter: {
    difficulty: 'Intermediate',
    time: '7 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['Mobile Developer', 'Flutter Developer'],
    syllabus: ['Dart grammar basics', 'Stateless & Stateful widgets', 'Widget layouts tree', 'State management models']
  },
  aws: {
    difficulty: 'Intermediate',
    time: '8 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['Cloud Architect', 'AWS Administrator'],
    syllabus: ['AWS Account IAM permissions', 'VPC virtual networks', 'EC2 Virtual instances', 'S3 Object buckets']
  },
  kubernetes: {
    difficulty: 'Advanced',
    time: '8 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['DevOps Specialist', 'SRE Engineer'],
    syllabus: ['Kubernetes Cluster layout', 'Pods & Deployment templates', 'Services networking routing', 'Ingress controllers']
  },
  'system-design': {
    difficulty: 'Advanced',
    time: '9 hours',
    xp: '300 XP',
    quizzes: 12,
    projects: '3 mini-projects',
    careers: ['Systems Architect', 'Lead Developer'],
    syllabus: ['Load Balancers scaling', 'Caching architectures CDN', 'Database scaling replicas', 'Message Queues Kafka']
  }
};

const TRACK_CATEGORIES = {
  // Databases
  sql: 'Databases',
  'advanced-sql': 'Databases',
  postgresql: 'Databases',
  mysql: 'Databases',
  mongodb: 'Databases',
  redis: 'Databases',
  'db-design': 'Databases',

  // Programming
  python: 'Programming',
  java: 'Programming',
  javascript: 'Programming',
  typescript: 'Programming',
  'c-lang': 'Programming',
  cpp: 'Programming',
  csharp: 'Programming',
  'go-lang': 'Programming',
  rust: 'Programming',
  kotlin: 'Programming',
  swift: 'Programming',
  php: 'Programming',

  // Web Development
  webdev: 'Web Development',
  html: 'Web Development',
  css: 'Web Development',
  react: 'Web Development',
  nextjs: 'Web Development',
  angular: 'Web Development',
  vuejs: 'Web Development',
  nodejs: 'Web Development',
  expressjs: 'Web Development',
  tailwindcss: 'Web Development',

  // Mobile Development
  'android-dev': 'Mobile Development',
  flutter: 'Mobile Development',
  'react-native': 'Mobile Development',
  swiftui: 'Mobile Development',
  'ios-dev': 'Mobile Development',

  // Data Science
  datascience: 'Data Science',
  'data-analysis': 'Data Science',
  numpy: 'Data Science',
  pandas: 'Data Science',
  'data-viz': 'Data Science',
  statistics: 'Data Science',

  // Artificial Intelligence
  ai: 'Artificial Intelligence',
  'prompt-eng': 'Artificial Intelligence',
  nlp: 'Artificial Intelligence',
  'computer-vision': 'Artificial Intelligence',
  'generative-ai': 'Artificial Intelligence',
  'llm-engineering': 'Artificial Intelligence',
  'ai-agents': 'Artificial Intelligence',
  'rag-systems': 'Artificial Intelligence',
  'deep-learning': 'Artificial Intelligence',

  // Cloud & DevOps
  linux: 'Cloud & DevOps',
  'git-github': 'Cloud & DevOps',
  docker: 'Cloud & DevOps',
  kubernetes: 'Cloud & DevOps',
  aws: 'Cloud & DevOps',
  azure: 'Cloud & DevOps',
  'google-cloud': 'Cloud & DevOps',
  cicd: 'Cloud & DevOps',
  terraform: 'Cloud & DevOps',

  // Cyber Security
  'security-fundamentals': 'Cyber Security',
  'network-security': 'Cyber Security',
  'ethical-hacking': 'Cyber Security',
  pentesting: 'Cyber Security',
  'web-security': 'Cyber Security',
  'digital-forensics': 'Cyber Security',

  // Software Engineering
  'data-structures': 'Software Engineering',
  algorithms: 'Software Engineering',
  'system-design': 'Software Engineering',
  'design-patterns': 'Software Engineering',
  oop: 'Software Engineering',
  'software-arch': 'Software Engineering',

  // Career Tracks
  'frontend-career': 'Career Tracks',
  'backend-career': 'Career Tracks',
  'fullstack-career': 'Career Tracks',
  'mobile-career': 'Career Tracks',
  'data-analyst': 'Career Tracks',
  'ml-engineer': 'Career Tracks',
  'devops-engineer': 'Career Tracks',
  'cloud-engineer': 'Career Tracks',
  'cyber-analyst': 'Career Tracks',

  // Business & Product
  'product-management-track': 'Business & Product',
  'uiux-design': 'Business & Product',
  'agile-framework': 'Business & Product',
  'scrum-framework': 'Business & Product',
  'business-analysis': 'Business & Product'
};

const CATEGORIES = [
  { id: 'All', name: 'All Categories', icon: '🌐' },
  { id: 'Programming', name: 'Programming', icon: '💻' },
  { id: 'Web Development', name: 'Web Development', icon: '🖥️' },
  { id: 'Mobile Development', name: 'Mobile Development', icon: '📱' },
  { id: 'Databases', name: 'Databases', icon: '🗄️' },
  { id: 'Data Science', name: 'Data Science', icon: '📊' },
  { id: 'Artificial Intelligence', name: 'Artificial Intelligence', icon: '🤖' },
  { id: 'Cloud & DevOps', name: 'Cloud & DevOps', icon: '☁️' },
  { id: 'Cyber Security', name: 'Cyber Security', icon: '🛡️' },
  { id: 'Software Engineering', name: 'Software Engineering', icon: '📐' },
  { id: 'Career Tracks', name: 'Career Tracks', icon: '💼' },
  { id: 'Business & Product', name: 'Business & Product', icon: '📈' },
  { id: 'Custom Path', name: 'Custom Paths', icon: '🪄' }
];

const CAREER_PATHS = [
  {
    title: 'Backend Developer',
    description: 'Build fast, scalable server-side systems and databases.',
    icon: '⚡',
    recommended: ['sql', 'python', 'java'],
    color: '#3b82f6'
  },
  {
    title: 'Data Scientist',
    description: 'Clean data, build models, and discover business intelligence.',
    icon: '📈',
    recommended: ['python', 'datascience', 'sql'],
    color: '#10b981'
  },
  {
    title: 'AI Architect',
    description: 'Integrate LLMs, neural networks, and prompt systems.',
    icon: '🧠',
    recommended: ['python', 'ai'],
    color: '#a855f7'
  },
  {
    title: 'Full Stack Engineer',
    description: 'Design interactive frontends and connect them to databases.',
    icon: '🌐',
    recommended: ['webdev', 'sql'],
    color: '#ec4899'
  }
];

export default function TracksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewTrack, setPreviewTrack] = useState(null);

  useEffect(() => {
    trackService.getAll()
      .then((data) => {
        setTracks(data.tracks || []);
      })
      .catch((err) => console.error('Error fetching tracks:', err))
      .finally(() => setLoading(false));
  }, []);

  // Enrich track items with static premium metadata
  const enrichedTracks = tracks.map(track => {
    const meta = TRACK_PREMIUM_META[track.slug] || {
      difficulty: track.isAiGenerated ? 'Custom' : 'Intermediate',
      time: '4 hours',
      xp: `${(track.totalLessons || 0) * 25} XP`,
      quizzes: track.totalLessons || 0,
      projects: '1 capstone project',
      careers: ['Specialized Field Developer'],
      syllabus: ['Course Foundations', 'Applied Labs', 'Capstone Challenge']
    };
    return { ...track, meta };
  });

  // Filter logic
  const filteredTracks = enrichedTracks.filter(track => {
    const matchesSearch = track.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      track.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === 'All' || 
      track.meta.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    const trackCategory = track.isAiGenerated ? 'Custom Path' : (TRACK_CATEGORIES[track.slug] || 'Other');
    const matchesCategory = selectedCategory === 'All' || 
      trackCategory === selectedCategory;

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  // Current track / Continue learning spot
  const activeTrack = enrichedTracks.find(t => t.id === user?.currentTrack);

  // Recommendations: Tracks not started yet (progress percent is 0)
  const recommendedTracks = enrichedTracks.filter(t => 
    t.id !== user?.currentTrack && (!t.progress || t.progress.progressPercent === 0)
  ).slice(0, 3);

  const handleStartTrack = (track) => {
    setPreviewTrack(null);
    if (track.isAiGenerated) {
      navigate(`/ai-workspace/${track.slug}`);
    } else if (track.progress?.currentLessonSlug) {
      navigate(`/lesson/${track.progress.currentLessonSlug}`);
    } else {
      navigate(`/track/${track.slug}`);
    }
  };

  return (
    <PageTransition>
      <div className="tracks-discover-page">
        {/* Abstract design blobs */}
        <div className="gradient-orb gradient-orb--1" style={{ '--orb-color': 'var(--accent-blue)', '--orb-size': '600px', top: '-15%', left: '-10%' }} />
        <div className="gradient-orb gradient-orb--2" style={{ '--orb-color': 'var(--accent-violet)', '--orb-size': '450px', bottom: '10%', right: '-5%' }} />

        <div className="container discover-container">
          
          {/* Header & Filter Controls */}
          <header className="discover-header">
            <h1 className="discover-title">Explore Learning Discoveries</h1>
            <p className="discover-subtitle">Discover expert tracks and generate paths tailored to your career milestones.</p>
            
            <div className="discover-controls">
              <div className="discover-search__wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="What would you like to master today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="discover-search__input"
                />
              </div>
              <div className="discover-chips">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    className={`discover-chip ${selectedDifficulty === diff ? 'discover-chip--active' : ''}`}
                    onClick={() => setSelectedDifficulty(diff)}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="discover-category-filters">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${selectedCategory === cat.id ? 'category-chip--active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="category-chip__icon">{cat.icon}</span>
                  <span className="category-chip__name">{cat.name}</span>
                </button>
              ))}
            </div>
          </header>

          {/* Continue Learning Spotlight */}
          {activeTrack && !searchQuery && selectedDifficulty === 'All' && selectedCategory === 'All' && (
            <section className="discover-section continue-spotlight">
              <h2 className="section-title">Continue Learning</h2>
              <div className="spotlight-card" style={{ '--border-glow': activeTrack.color }}>
                <div className="spotlight-card__info">
                  <div className="spotlight-card__tag" style={{ background: `${activeTrack.color}15`, color: activeTrack.color }}>
                    Active Track
                  </div>
                  <h3 className="spotlight-title">{activeTrack.name}</h3>
                  <p className="spotlight-desc">{activeTrack.description}</p>
                  
                  <div className="spotlight-progress-block">
                    <div className="progress-labels">
                      <span>{activeTrack.progress?.progressPercent || 0}% Completed</span>
                      <span>{activeTrack.progress?.completedLessons || 0} / {activeTrack.totalLessons} Lessons</span>
                    </div>
                    <ProgressBar
                      value={activeTrack.progress?.completedLessons || 0}
                      max={activeTrack.totalLessons}
                      color={activeTrack.color}
                      size="md"
                    />
                  </div>

                  <div className="spotlight-actions">
                    <button 
                      onClick={() => handleStartTrack(activeTrack)} 
                      className="btn btn--primary btn--lg spotlight-btn"
                      style={{ background: activeTrack.color, borderColor: activeTrack.color }}
                    >
                      Resume Learning
                    </button>
                    <button onClick={() => setPreviewTrack(activeTrack)} className="btn btn--ghost btn--lg spotlight-preview-btn">
                      Quick View
                    </button>
                  </div>
                </div>
                
                <div className="spotlight-card__graphic">
                  <div className="spotlight-icon" style={{ background: `${activeTrack.color}15`, color: activeTrack.color }}>
                    {TRACK_ICONS[activeTrack.slug] || '📚'}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Recommendations Row */}
          {recommendedTracks.length > 0 && !searchQuery && selectedDifficulty === 'All' && selectedCategory === 'All' && (
            <section className="discover-section recommendations-row">
              <h2 className="section-title">Recommended For You</h2>
              <div className="netflix-row">
                {recommendedTracks.map((track) => (
                  <div 
                    key={track.id} 
                    className="netflix-card" 
                    style={{ '--track-accent': track.color }}
                    onClick={() => setPreviewTrack(track)}
                  >
                    <div className="netflix-card__header">
                      <div className="netflix-card__icon" style={{ background: `${track.color}12`, color: track.color }}>
                        {TRACK_ICONS[track.slug] || '📚'}
                      </div>
                      <span className="netflix-badge font-semibold" style={{ background: `${track.color}15`, color: track.color }}>
                        {track.meta.difficulty}
                      </span>
                    </div>
                    <h3 className="netflix-card__title">{track.name}</h3>
                    <p className="netflix-card__desc">{track.description}</p>
                    
                    <div className="netflix-card__meta">
                      <span>⏱ {track.meta.time}</span>
                      <span>✦ {track.meta.xp}</span>
                    </div>
                    
                    <div className="netflix-card__hover-details">
                      <div className="hover-stat">📂 {track.meta.projects}</div>
                      <div className="hover-stat">🏆 {track.meta.quizzes} Quizzes</div>
                      <button 
                        type="button" 
                        className="netflix-hover-btn" 
                        onClick={(e) => { e.stopPropagation(); handleStartTrack(track); }}
                      >
                        Start Learning →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Tracks Discovery Catalog */}
          <section className="discover-section catalog-grid-section">
            <h2 className="section-title">
              {searchQuery || selectedDifficulty !== 'All' || selectedCategory !== 'All' 
                ? `${selectedCategory !== 'All' ? selectedCategory : 'Filtered'} Tracks` 
                : 'All Learning Tracks'}
            </h2>
            
            {loading ? (
              <div className="discover-catalog__loading">
                <span className="catalog-spinner">⏳</span>
                <p>Loading course catalog...</p>
              </div>
            ) : filteredTracks.length === 0 ? (
              <div className="discover-catalog__empty">
                <span>🗂️</span>
                <h3>No Tracks Found</h3>
                <p>Try clearing your filters or search query to explore other tracks.</p>
              </div>
            ) : (
              <div className="discover-grid">
                {filteredTracks.map((track) => (
                  <div 
                    key={track.id} 
                    className="catalog-card"
                    style={{ '--catalog-accent': track.color }}
                    onClick={() => setPreviewTrack(track)}
                  >
                    <div className="catalog-card__body">
                      <div className="catalog-card__badge-row">
                        <span className="difficulty-badge" style={{ borderColor: `${track.color}40`, color: track.color }}>
                          {track.meta.difficulty}
                        </span>
                        <span className="time-badge">⏱ {track.meta.time}</span>
                      </div>
                      
                      <h3 className="catalog-card__title">{track.name}</h3>
                      <p className="catalog-card__desc">{track.description}</p>
                      
                      <div className="catalog-card__metrics">
                        <div className="metric-item">
                          <span className="metric-icon">🏆</span>
                          <span className="metric-text">{track.meta.quizzes} Quizzes</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-icon">📂</span>
                          <span className="metric-text">{track.meta.projects}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-icon">✦</span>
                          <span className="metric-text">{track.meta.xp}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="catalog-card__footer">
                      <span className="catalog-preview-trigger">Quick View</span>
                      <button 
                        type="button" 
                        className="catalog-action-btn"
                        onClick={(e) => { e.stopPropagation(); handleStartTrack(track); }}
                        style={{ background: track.color }}
                      >
                        Start →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Career Path Recommendations */}
          {!searchQuery && selectedDifficulty === 'All' && selectedCategory === 'All' && (
            <section className="discover-section career-paths-section">
              <div className="career-section-header">
                <h2 className="section-title">Career Alignment Paths</h2>
                <p className="section-subtitle">Unlock specialized industry roles by stacking the right skill tracks.</p>
              </div>
              
              <div className="careers-deck">
                {CAREER_PATHS.map((path) => (
                  <div key={path.title} className="career-card" style={{ '--career-accent-color': path.color }}>
                    <div className="career-card__header">
                      <span className="career-card__icon">{path.icon}</span>
                      <h3 className="career-card__title">{path.title}</h3>
                    </div>
                    <p className="career-card__desc">{path.description}</p>
                    
                    <div className="career-card__recommendations">
                      <div className="rec-label font-semibold">Recommended Skill Stack:</div>
                      <div className="rec-tags">
                        {path.recommended.map((slug) => {
                          const matchingTrack = enrichedTracks.find(t => t.slug === slug);
                          if (!matchingTrack) return null;
                          return (
                            <span 
                              key={slug} 
                              className="rec-tag" 
                              onClick={() => setPreviewTrack(matchingTrack)}
                              style={{ borderLeft: `3px solid ${matchingTrack.color}` }}
                            >
                              {matchingTrack.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Achievement Rewards Preview */}
          {!searchQuery && selectedDifficulty === 'All' && selectedCategory === 'All' && (
            <section className="discover-section achievements-spotlight">
              <div className="achievements-card">
                <div className="achievements-card__info">
                  <span className="achievements-card__icon">🏆</span>
                  <h2 className="achievements-title">Collect Completion Badges</h2>
                  <p className="achievements-desc">
                    Finish the lessons, clear the quiz gating with a 4/5 or better, and pass the final Capstone project in any track to unlock exclusive profile badges and boost your total XP ranking!
                  </p>
                </div>
                <div className="badges-preview">
                  <div className="badge-preview-item" title="SQL Master">
                    <span className="badge-icon">🗄️</span>
                    <strong>SQL Master</strong>
                  </div>
                  <div className="badge-preview-item" title="Python Guru">
                    <span className="badge-icon">🐍</span>
                    <strong>Python Guru</strong>
                  </div>
                  <div className="badge-preview-item" title="Vanguard Dev">
                    <span className="badge-icon">🌐</span>
                    <strong>Web Expert</strong>
                  </div>
                  <div className="badge-preview-item" title="Neural Pioneer">
                    <span className="badge-icon">🤖</span>
                    <strong>AI Pioneer</strong>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* Track Detail Preview Modal (Slide-in Drawer) */}
        <AnimatePresence>
          {previewTrack && (
            <motion.div 
              className="track-preview-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewTrack(null)}
            >
              <motion.div 
                className="track-preview-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                onClick={(e) => e.stopPropagation()}
                style={{ '--drawer-accent-color': previewTrack.color }}
              >
                <button className="drawer-close-btn" onClick={() => setPreviewTrack(null)}>
                  ✕
                </button>
                
                <div className="drawer-header">
                  <div className="drawer-icon" style={{ background: `${previewTrack.color}15`, color: previewTrack.color }}>
                    {TRACK_ICONS[previewTrack.slug] || previewTrack.icon || '📚'}
                  </div>
                  <span className="difficulty-badge" style={{ borderColor: `${previewTrack.color}40`, color: previewTrack.color }}>
                    {previewTrack.meta.difficulty}
                  </span>
                  <h2 className="drawer-title">{previewTrack.name}</h2>
                  <p className="drawer-desc">{previewTrack.description}</p>
                </div>

                <div className="drawer-body">
                  {/* Quick stats grid */}
                  <div className="drawer-stats-grid">
                    <div className="drawer-stat-item">
                      <span className="stat-label">Estimated Time</span>
                      <span className="stat-value">⏱ {previewTrack.meta.time}</span>
                    </div>
                    <div className="drawer-stat-item">
                      <span className="stat-label">XP Pool</span>
                      <span className="stat-value">✦ {previewTrack.meta.xp}</span>
                    </div>
                    <div className="drawer-stat-item">
                      <span className="stat-label">Quiz Gating</span>
                      <span className="stat-value">📋 {previewTrack.meta.quizzes} Quizzes</span>
                    </div>
                    <div className="drawer-stat-item">
                      <span className="stat-label">Projects</span>
                      <span className="stat-value">📂 {previewTrack.meta.projects}</span>
                    </div>
                  </div>

                  {/* Career opportunities */}
                  <div className="drawer-section">
                    <h3 className="section-title">Career Opportunities</h3>
                    <div className="career-rec-tags">
                      {previewTrack.meta.careers.map((role) => (
                        <span key={role} className="career-rec-tag">
                          💼 {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Course Syllabus outline */}
                  <div className="drawer-section">
                    <h3 className="section-title">Track Syllabus Overview</h3>
                    <div className="syllabus-timeline">
                      {previewTrack.meta.syllabus.map((topic, index) => (
                        <div key={topic} className="syllabus-item">
                          <div className="syllabus-number" style={{ background: `${previewTrack.color}20`, color: previewTrack.color }}>
                            {index + 1}
                          </div>
                          <p className="syllabus-text">{topic}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="drawer-footer">
                  <button 
                    type="button" 
                    onClick={() => handleStartTrack(previewTrack)}
                    className="btn btn--primary btn--xl drawer-start-btn"
                    style={{ background: previewTrack.color, borderColor: previewTrack.color }}
                  >
                    {previewTrack.progress?.progressPercent > 0 ? 'Resume Learning' : 'Start Track'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}
