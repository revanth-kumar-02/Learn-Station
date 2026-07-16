import React, { useState, useEffect, useRef } from 'react';
import { 
  careerService, ResumeData, PortfolioData, 
  ShowcasedProject, CompanyPrep, LearningReportMetrics 
} from '../services/careerService';
import { 
  Trophy, Briefcase, FileText, Globe, Code, 
  Award, TrendingUp, Download, Eye, Plus, 
  Trash2, ExternalLink, RefreshCw, Send, CheckCircle, HelpCircle,
  User, Mail, Sparkles, ChevronRight, Share2, Printer, Check, Copy,
  ArrowRight, Play, BookOpen, AlertCircle, RefreshCcw
} from 'lucide-react';
import GithubIcon from '../components/common/GithubIcon';
import LinkedinIcon from '../components/common/LinkedinIcon';
import PageHero from '../components/common/PageHero';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/pages.css';

type SubTab = 
  | 'dashboard' 
  | 'roadmap' 
  | 'resume' 
  | 'portfolio' 
  | 'github' 
  | 'linkedin'
  | 'placement' 
  | 'verification' 
  | 'showcase' 
  | 'reports';

interface PracticeQuestion {
  id: number;
  type: 'aptitude' | 'reasoning' | 'programming';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

const APTITUDE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 1,
    type: 'aptitude',
    question: 'A train 125 m long passes a man, running at 5 km/hr in the same direction in which the train is going, in 10 seconds. The speed of the train is:',
    options: ['45 km/hr', '50 km/hr', '54 km/hr', '55 km/hr'],
    answer: '50 km/hr',
    explanation: 'Relative speed = Length / Time = 125m / 10s = 12.5 m/s = 12.5 * 18/5 = 45 km/hr. Since they are going in the same direction, Relative Speed = Speed of train - Speed of man. Therefore, Speed of train = 45 + 5 = 50 km/hr.'
  },
  {
    id: 2,
    type: 'aptitude',
    question: 'A sum of money at simple interest amounts to $815 in 3 years and to $854 in 4 years. The sum is:',
    options: ['$650', '$690', '$698', '$700'],
    answer: '$698',
    explanation: 'Interest in 1 year = $854 - $815 = $39. Interest in 3 years = $39 * 3 = $117. Principal sum = Amount in 3 years - Interest in 3 years = $815 - $117 = $698.'
  }
];

const REASONING_QUESTIONS: PracticeQuestion[] = [
  {
    id: 3,
    type: 'reasoning',
    question: 'Pointing to a photograph, Vipul said, "She is the daughter of my grandfather\'s only son." How is Vipul related to the girl in the photograph?',
    options: ['Father', 'Brother', 'Uncle', 'Cousin'],
    answer: 'Brother',
    explanation: "Vipul's grandfather's only son is Vipul's father. The daughter of Vipul's father is Vipul's sister. So Vipul is the brother of the girl."
  },
  {
    id: 4,
    type: 'reasoning',
    question: 'Find the missing number in the sequence: 3, 12, 48, 192, ?',
    options: ['576', '768', '960', '384'],
    answer: '768',
    explanation: 'Each term in the sequence is multiplied by 4: 3 * 4 = 12, 12 * 4 = 48, 48 * 4 = 192, 192 * 4 = 768.'
  }
];

const ASSESSMENT_TASKS = [
  {
    id: 'f1',
    topic: 'Frontend Development',
    title: 'Implement Array Debouncer',
    question: 'Write a JavaScript function "debounce" that limits the rate at which a function can fire. It should delay execution until after "wait" milliseconds have elapsed since the last time the debounced function was invoked.',
    template: 'function debounce(func, wait) {\n  let timeout;\n  return function(...args) {\n    // Write your code here\n  };\n}',
    testCase: 'const start = Date.now();\nconst fn = debounce(() => { console.log(Date.now() - start); }, 100);',
    answerKeyword: 'clearTimeout'
  },
  {
    id: 'b1',
    topic: 'Backend Development',
    title: 'Design API Rate Limiter Middleware',
    question: 'Implement an Express.js middleware "rateLimiter" that restricts requests from a specific IP to a maximum of 5 requests per minute.',
    template: 'const ipRequests = {};\nfunction rateLimiter(req, res, next) {\n  const ip = req.ip;\n  // Implement sliding window rate limit\n}',
    testCase: 'rateLimiter(req, res, next)',
    answerKeyword: 'next()'
  },
  {
    id: 'd1',
    topic: 'Database Management',
    title: 'Optimize N+1 Query Pattern',
    question: 'Given users and posts relations, write an SQL query to retrieve all users who have written more than 3 posts in the category "Engineering" during 2026, including their post counts.',
    template: 'SELECT u.id, u.name, COUNT(p.id) as post_count\nFROM users u\n-- JOIN and filter\nGROUP BY u.id;',
    testCase: 'HAVING COUNT(p.id) > 3',
    answerKeyword: 'HAVING'
  }
];

const CAREER_ROADMAPS = [
  {
    goal: 'Frontend Developer',
    description: 'Build interactive, performant, and beautiful client-side web applications.',
    time: '4-6 Months',
    skills: ['HTML/CSS Semantics', 'TypeScript Static Types', 'React State & Hooks', 'Vite & Frontend Build Tools', 'Web Accessibility (A11y)', 'SEO Optimization'],
    tracks: ['HTML Fundamentals', 'Advanced CSS & Layouts', 'JavaScript', 'TypeScript', 'React', 'Tailwind CSS', 'UI/UX Design'],
    projects: ['Personal Portfolio Website', 'Responsive SaaS Dashboard', 'Interactive E-commerce Store'],
    challenges: ['CSS Flexbox Grid Practice', 'Async API Data Fetching', 'React Performance Profiler']
  },
  {
    goal: 'Backend Developer',
    description: 'Architect scalable web servers, database schemas, API frameworks, and authentication pipelines.',
    time: '5-7 Months',
    skills: ['Server-Side Architectures', 'REST API Design', 'Relational & NoSQL Schema Design', 'JWT Authentication', 'Caching Pipelines', 'System Integrations'],
    tracks: ['Node.js', 'Express.js', 'Advanced SQL', 'PostgreSQL', 'MongoDB', 'Redis Caching', 'Database Design'],
    projects: ['RESTful Content Management Server', 'Realtime Chat Service Backend', 'Payment Gateway Integration Service'],
    challenges: ['Write SQL Window Functions', 'Implement JWT Middleware Auth', 'Database Transaction Isolation Check']
  },
  {
    goal: 'Full Stack Developer',
    description: 'Master both client and server architectures to build complete end-to-end applications.',
    time: '6-8 Months',
    skills: ['SPA Frontend Frameworks', 'REST API Architecture', 'Database Integrations', 'Client-Server Session Auth', 'CI/CD Pipeline Building', 'Environment Management'],
    tracks: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'PostgreSQL', 'Docker', 'CI/CD Pipelines'],
    projects: ['Gamified Learning Platform Workspace', 'Collaborative Project Management Tool', 'Social Portfolio Hub'],
    challenges: ['Complete End-to-End Auth flow', 'Implement File Upload and S3 storage', 'Dockerize Client-Server-DB setup']
  },
  {
    goal: 'AI Engineer',
    description: 'Build autonomous agents, Prompt workflows, RAG document search systems, and deploy LLM applications.',
    time: '6-9 Months',
    skills: ['Prompt Engineering & Directives', 'RAG Retrieval Systems', 'Autonomous Agentic Design', 'Vector Database Search', 'Model Fine-Tuning PEFT/LoRA', 'Deep Learning Architectures'],
    tracks: ['Prompt Engineering', 'NLP', 'Generative AI', 'LLM Engineering', 'AI Agents', 'RAG Systems', 'Deep Learning'],
    projects: ['Context-Aware RAG Knowledge Assistant', 'Multi-Agent Code Explainer System', 'Fine-Tuned Customer Support Chatbot'],
    challenges: ['Design Tool-Calling Specifications', 'Write Vector Similarity Cosine Search', 'PEFT Dataset Token Validation']
  },
  {
    goal: 'Data Scientist',
    description: 'Clean raw data streams, apply statistical methods, train machine learning models, and design dashboards.',
    time: '5-8 Months',
    skills: ['Data Cleaning & Transformations', 'Statistical Analysis', 'Interactive Visualization', 'Machine Learning Training', 'Feature Engineering', 'BI Dashboards'],
    tracks: ['Data Analysis', 'NumPy', 'Pandas', 'Data Visualization', 'Statistics', 'MongoDB', 'Database Design'],
    projects: ['Predictive Sales Trends Model', 'Interactive Financial Analysis Dashboard', 'Customer Segmentation Model'],
    challenges: ['DataFrame GroupBy Multi-Index aggregations', 'Train Linear/Logistic Regressions', 'Z-Score Normalization Implementation']
  },
  {
    goal: 'Cloud Engineer',
    description: 'Design multi-region networks, serverless functions, Infrastructure as Code, and deploy secure architectures.',
    time: '6-8 Months',
    skills: ['Infrastructure as Code (IaC)', 'VPC Network Subnetting', 'Serverless Deployments', 'Container Orchestration', 'Monitoring and Logging', 'Cloud IAM Security'],
    tracks: ['Linux Fundamentals', 'Git & GitHub', 'Docker', 'Kubernetes', 'AWS Cloud', 'Google Cloud', 'Terraform IaC'],
    projects: ['Multi-Tier AWS High-Availability Web App', 'Terraform Automated VPC Orchestration', 'Serverless Event-Driven Image Processor'],
    challenges: ['Write Terraform State Locking configs', 'Kubernetes Ingress and Services Routing', 'Docker Multi-stage Builds']
  },
  {
    goal: 'Cyber Security Analyst',
    description: 'Perform risk audits, network sniffing, web threat mitigations, penetration tests, and digital forensics.',
    time: '6-9 Months',
    skills: ['Risk Assessment audits', 'Vulnerability Scanning', 'Ethical Hacking frameworks', 'OWASP Top 10 mitigations', 'Disk Data Acquisition', 'Access Control IAM'],
    tracks: ['Security Fundamentals', 'Network Security', 'Ethical Hacking', 'Pentesting', 'Web Security', 'Digital Forensics'],
    projects: ['Web App Penetration Audit Report', 'Network IDS Sniffing dashboard', 'Incident Response & Analysis Writeup'],
    challenges: ['Mitigate SQL Injection and XSS flaws', 'Configure Port Audits and Firewalls', 'Analyze syslog files for intrusion patterns']
  },
  {
    goal: 'Mobile Developer',
    description: 'Build native and cross-platform mobile apps for Android and iOS devices.',
    time: '5-7 Months',
    skills: ['Mobile UI Layout structures', 'State Bindings UI updates', 'Local SQLite storage', 'Device hardware integration', 'Offline Sync patterns', 'App Store Submission rules'],
    tracks: ['Android Development', 'Flutter & Dart', 'React Native', 'SwiftUI', 'iOS Development', 'UI/UX Design'],
    projects: ['Cross-platform Habit Tracker App', 'Native iOS Health/Fitness Tracker', 'Dynamic Offline News App'],
    challenges: ['Implement Native Camera hardware bridges', 'Setup SQLite Data Syncing', 'Build AppStore submission layouts']
  }
];

export default function CareerDashboardPage() {
  const [activeTab, setActiveTab] = useState<SubTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // --- RESUME STATE ---
  const [resume, setResume] = useState<ResumeData>({ template: 'modern', experience: [], education: [], additional_skills: [] });
  const [profile, setProfile] = useState<any>(null);
  const [completedTracks, setCompletedTracks] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [resumeProjects, setResumeProjects] = useState<any[]>([]);

  const [expCompany, setExpCompany] = useState('');
  const [expRole, setExpRole] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDetails, setExpDetails] = useState('');

  const [eduInstitution, setEduInstitution] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduYear, setEduYear] = useState('');

  const [additionalSkillInput, setAdditionalSkillInput] = useState('');

  // --- PORTFOLIO STATE ---
  const [portfolio, setPortfolio] = useState<PortfolioData>({ 
    theme: 'minimal', 
    slug: '', 
    custom_sections: {
      about: '',
      contact_email: '',
      linkedin_url: '',
      show_sections: ['About', 'Skills', 'Learning Progress', 'Projects', 'Certificates', 'Achievements', 'GitHub', 'Contact']
    }, 
    is_published: false 
  });
  const [deploymentLog, setDeploymentLog] = useState<string[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  // --- SHOWCASE PROJECTS STATE ---
  const [projects, setProjects] = useState<ShowcasedProject[]>([]);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projLive, setProjLive] = useState('');

  // --- GITHUB INTEGRATION STATE ---
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [githubStats, setGithubStats] = useState<any>(null);
  const [showcasedRepos, setShowcasedRepos] = useState<string[]>([]);

  // --- LINKEDIN SHARING STATE ---
  const [shareAchievementType, setShareAchievementType] = useState<'track' | 'cert' | 'badge' | 'milestone'>('track');
  const [shareTitle, setShareTitle] = useState('');
  const [shareIcon, setShareIcon] = useState('🎓');
  const [sharePreviewUrl, setSharePreviewUrl] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // --- PLACEMENT PREP STATE ---
  const [companies, setCompanies] = useState<CompanyPrep[]>([]);
  const [selectedPrepTab, setSelectedPrepTab] = useState<'aptitude' | 'reasoning' | 'questions' | 'mock' | 'companies'>('companies');
  const [selectedCompanyIdx, setSelectedCompanyIdx] = useState<number>(0);
  const [prepAnswers, setPrepAnswers] = useState<Record<string, string>>({});
  const [prepRevealed, setPrepRevealed] = useState<Record<string, boolean>>({});

  // Coding Workspace in Placement Prep
  const [companyCodingInput, setCompanyCodingInput] = useState<string>('');
  const [compilingCode, setCompilingCode] = useState(false);
  const [codingConsole, setCodingConsole] = useState<string[]>([]);

  // Mock Test State
  const [mockActive, setMockActive] = useState(false);
  const [mockScore, setMockScore] = useState<number | null>(null);
  const [mockSelectedAnswers, setMockSelectedAnswers] = useState<Record<number, string>>({});

  // --- SKILL VERIFICATION STATE ---
  const [activeVerificationIdx, setActiveVerificationIdx] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [skillReports, setSkillReports] = useState<any[]>([]);

  // --- REPORTS STATE ---
  const [report, setReport] = useState<any>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>('weekly');

  // --- CAREER ROADMAP STATE ---
  const [activeRoadmapGoal, setActiveRoadmapGoal] = useState<string>('Full Stack Developer');

  const resumePrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCareerData();
  }, [activeTab]);

  const loadCareerData = async () => {
    setLoading(true);
    try {
      // Resume data fetches profile, completed tracks, certificates, projects
      const res = await careerService.getResume();
      setResume(res.resume);
      setProfile(res.profile);
      setCompletedTracks(res.completedTracks || []);
      setCertificates(res.certificates || []);
      setResumeProjects(res.projects || []);

      if (res.profile?.github_connected) {
        setGithubConnected(true);
        setGithubUsername(res.profile.github_username || '');
        setGithubStats(res.profile.github_stats || null);
      }

      // Portfolio settings
      const portRes = await careerService.getPortfolio();
      setPortfolio(portRes.portfolio);

      // Showcased projects
      const projRes = await careerService.getProjects();
      setProjects(projRes.projects);

      // Placement Prep
      const companyRes = await careerService.getPlacementPrep();
      setCompanies(companyRes.companies);

      // Reports
      const reportRes = await careerService.getLearningReports();
      setReport(reportRes.report);

      // Load simulated skill reports from profile.github_stats or localStorage
      const localReports = localStorage.getItem('ls_skill_reports');
      if (localReports) {
        setSkillReports(JSON.parse(localReports));
      } else {
        const initialReports = [
          { topic: 'SQL Databases', level: 'Advanced', date: '2026-06-12', score: 92 },
          { topic: 'React Web Apps', level: 'Intermediate', date: '2026-07-04', score: 78 }
        ];
        setSkillReports(initialReports);
        localStorage.setItem('ls_skill_reports', JSON.stringify(initialReports));
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- RESUME BUILDER ACTIONS ---
  const addExperience = () => {
    if (!expCompany || !expRole) return;
    const newExp = [...(resume.experience || []), { company: expCompany, role: expRole, duration: expDuration, details: expDetails }];
    setResume(prev => ({ ...prev, experience: newExp }));
    setExpCompany('');
    setExpRole('');
    setExpDuration('');
    setExpDetails('');
  };

  const deleteExperience = (index: number) => {
    const newExp = [...(resume.experience || [])];
    newExp.splice(index, 1);
    setResume(prev => ({ ...prev, experience: newExp }));
  };

  const addEducation = () => {
    if (!eduInstitution || !eduDegree) return;
    const newEdu = [...(resume.education || []), { institution: eduInstitution, degree: eduDegree, year: eduYear }];
    setResume(prev => ({ ...prev, education: newEdu }));
    setEduInstitution('');
    setEduDegree('');
    setEduYear('');
  };

  const deleteEducation = (index: number) => {
    const newEdu = [...(resume.education || [])];
    newEdu.splice(index, 1);
    setResume(prev => ({ ...prev, education: newEdu }));
  };

  const addAdditionalSkill = () => {
    if (!additionalSkillInput) return;
    const skills = [...(resume.additional_skills || []), additionalSkillInput];
    setResume(prev => ({ ...prev, additional_skills: skills }));
    setAdditionalSkillInput('');
  };

  const removeAdditionalSkill = (index: number) => {
    const skills = [...(resume.additional_skills || [])];
    skills.splice(index, 1);
    setResume(prev => ({ ...prev, additional_skills: skills }));
  };

  const saveResumeData = async () => {
    await careerService.saveResume({
      template: resume.template,
      experience: resume.experience,
      education: resume.education,
      additional_skills: resume.additional_skills
    } as any);
    alert('Resume configuration saved successfully!');
  };

  // Print/PDF Handler
  const handlePrintResume = () => {
    const printContent = document.getElementById('resume-print-area');
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    const originalStyle = document.body.style.cssText;

    document.body.innerHTML = printContent.innerHTML;
    document.body.style.background = '#ffffff';
    document.body.style.color = '#000000';
    document.body.style.padding = '0';

    window.print();
    
    // Reload page to restore original state safely
    window.location.reload();
  };

  // DOCX Export Simulator (Office Open XML / HTML Mime format)
  const handleWordExport = () => {
    const content = document.getElementById('resume-print-area')?.innerHTML || '';
    const htmlString = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Resume</title><style>body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #333333; } h1 { font-size: 22pt; color: #111111; margin-bottom: 2px; } h2 { font-size: 14pt; border-bottom: 1px solid #cccccc; margin-top: 15px; color: #3b82f6; } .item-title { font-weight: bold; } .item-meta { color: #666666; font-size: 9pt; }</style></head>
      <body>${content}</body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlString], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile?.name?.replace(/\s+/g, '_') || 'Resume'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PORTFOLIO ACTIONS ---
  const savePortfolioData = async () => {
    await careerService.savePortfolio(portfolio);
    alert('Portfolio configuration saved successfully!');
  };

  // Deploy Simulator
  const handleDeployPortfolio = (provider: 'vercel' | 'netlify' | 'github') => {
    setDeploying(true);
    setDeployedUrl(null);
    setDeploymentLog([
      `[1/4] Connecting repository link to ${provider.toUpperCase()} edge runner...`,
    ]);

    setTimeout(() => {
      setDeploymentLog(prev => [...prev, `[2/4] Parsing configuration and installing Vite packages...`]);
    }, 1000);

    setTimeout(() => {
      setDeploymentLog(prev => [...prev, `[3/4] Building static HTML5 client bundle (size: 14.5MB)...`]);
    }, 2200);

    setTimeout(() => {
      setDeploymentLog(prev => [
        ...prev, 
        `[4/4] Generating SSL certificates and routing custom alias domain...`,
        `✔ Deployed successfully to ${provider}.com!`,
        `🚀 Shareable Link: http://localhost:5173/p/${portfolio.slug}`
      ]);
      setDeploying(false);
      setDeployedUrl(`http://localhost:5173/p/${portfolio.slug}`);
      // Save is_published automatically
      setPortfolio(prev => ({ ...prev, is_published: true }));
      careerService.savePortfolio({ ...portfolio, is_published: true });
    }, 3800);
  };

  // --- GITHUB ACTIONS ---
  const handleConnectGithub = async () => {
    if (!githubUsername) return;
    const res = await careerService.connectGithub(githubUsername);
    if (res.success) {
      setGithubConnected(true);
      setGithubStats(res.stats);
      alert('GitHub account connected successfully!');
    }
  };

  const handleDisconnectGithub = async () => {
    setGithubConnected(false);
    setGithubStats(null);
    setGithubUsername('');
    // Remove from profile in DB
    await careerService.connectGithub('');
    alert('GitHub account disconnected.');
  };

  // --- PROJECT SHOWCASE ACTIONS ---
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName) return;
    const newProj: ShowcasedProject = {
      project_name: projName,
      description: projDesc,
      technologies: projTech.split(',').map(t => t.trim()).filter(Boolean),
      github_url: projGithub,
      live_url: projLive,
      skills_used: projTech.split(',').map(t => t.trim()).filter(Boolean)
    };
    await careerService.saveProject(newProj);
    setProjName('');
    setProjDesc('');
    setProjTech('');
    setProjGithub('');
    setProjLive('');
    // Reload projects
    const projRes = await careerService.getProjects();
    setProjects(projRes.projects);
    alert('Project added to showcase directory!');
  };

  const handleDeleteProject = async (id: string) => {
    await careerService.deleteProject(id);
    const projRes = await careerService.getProjects();
    setProjects(projRes.projects);
  };

  // --- LINKEDIN SHARING ---
  const handleGenerateShareCard = (type: 'track' | 'cert' | 'badge' | 'milestone', title: string, icon = '🎓') => {
    setShareAchievementType(type);
    setShareTitle(title);
    setShareIcon(icon);
    setSharePreviewUrl(`http://localhost:5173/share/achievement-${Date.now()}`);
    setShareModalOpen(true);
  };

  // --- PLACEMENT PREPARATION HANDLERS ---
  const handleRevealAnswer = (key: string) => {
    setPrepRevealed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Code runner in Company Prep
  const runCompanyCodingChallenge = (sol: string) => {
    setCompilingCode(true);
    setCodingConsole(['Initializing compiler environment...', 'Loading test harnesses...']);
    
    setTimeout(() => {
      setCodingConsole(prev => [...prev, 'Compiling source code files...']);
    }, 800);

    setTimeout(() => {
      // Validate keyword
      const lines = companyCodingInput.trim().split('\n');
      if (lines.length < 3) {
        setCodingConsole(prev => [...prev, '❌ Compiler Error: Code snippet is too short or missing main structure.']);
        setCompilingCode(false);
        return;
      }
      
      const containsLogic = companyCodingInput.includes('while') || companyCodingInput.includes('for') || companyCodingInput.includes('if');
      
      if (containsLogic) {
        setCodingConsole(prev => [
          ...prev,
          'Running Test Case 1: [Normal Input] - PASSED',
          'Running Test Case 2: [Boundary/Zero Input] - PASSED',
          'Running Test Case 3: [Large Scale Stress Input] - PASSED',
          '✔ Executed successfully. All 3/3 test cases passed!'
        ]);
      } else {
        setCodingConsole(prev => [
          ...prev,
          'Running Test Case 1: [Normal Input] - FAILED (Returned incorrect value)',
          'Running Test Case 2: [Boundary/Zero Input] - FAILED (Logical boundary mismatch)',
          '❌ Execution completed. 0/3 test cases passed. Reference solution: \n' + sol
        ]);
      }
      setCompilingCode(false);
    }, 2000);
  };

  // Mock Test Functions
  const startMockTest = () => {
    setMockActive(true);
    setMockScore(null);
    setMockSelectedAnswers({});
  };

  const submitMockTest = () => {
    const totalQuestions = [...APTITUDE_QUESTIONS, ...REASONING_QUESTIONS];
    let score = 0;
    totalQuestions.forEach((q) => {
      if (mockSelectedAnswers[q.id] === q.answer) {
        score++;
      }
    });

    const percent = Math.round((score / totalQuestions.length) * 100);
    setMockScore(percent);
    setMockActive(false);
    
    // Add to placement readiness index dynamically
    alert(`Mock Test completed! You scored ${percent}%. Placement Readiness Index updated!`);
  };

  // --- SKILL VERIFICATION HANDLERS ---
  const startSkillVerification = (idx: number) => {
    setActiveVerificationIdx(idx);
    setVerificationCode(ASSESSMENT_TASKS[idx].template);
    setVerificationResult(null);
  };

  const runSkillVerification = (keyword: string, topic: string) => {
    setVerifying(true);
    
    setTimeout(() => {
      const code = verificationCode.toLowerCase();
      const hasKeyword = code.includes(keyword.toLowerCase());
      
      if (hasKeyword) {
        setVerificationResult('success');
        // Add to skill reports
        const newReport = {
          topic,
          level: 'Expert',
          date: new Date().toISOString().split('T')[0],
          score: 95
        };
        const updated = [newReport, ...skillReports];
        setSkillReports(updated);
        localStorage.setItem('ls_skill_reports', JSON.stringify(updated));
      } else {
        setVerificationResult('failure');
      }
      setVerifying(false);
    }, 2500);
  };

  // --- RENDER FUNCTIONS ---
  
  // Dynamic recommendations helper
  const getGoalRecommendations = (goal: string) => {
    const roadmap = CAREER_ROADMAPS.find(r => r.goal === goal);
    if (!roadmap) return { tracks: [], projects: [], skills: [] };
    
    return {
      tracks: roadmap.tracks.slice(0, 3),
      projects: roadmap.projects.slice(0, 2),
      skills: roadmap.skills.slice(0, 3)
    };
  };

  return (
    <div className="page-std">
      <div className="container">

      {/* ── Hero ── */}
      <PageHero
        icon={<Briefcase size={22} />}
        color="blue"
        eyebrow="Career Development"
        title="Career Hub"
        description="Bridge your learning achievements into employment opportunities — resumes, portfolios, placement prep and more."
        stats={[
          { label: 'Resume',    value: resume.experience?.length > 0 ? 'Complete' : 'Draft' },
          { label: 'Portfolio', value: portfolio.is_published ? 'Published' : 'Offline' },
          { label: 'GitHub',    value: githubConnected ? 'Linked' : 'Not Linked' },
        ]}
      />

      {/* ── Sidebar + Panel Layout ── */}
      <div className="std-layout">

        {/* LEFT SIDEBAR MENU */}
        <div className="std-sidebar">
          <div className="std-sidebar__header">
            <p className="std-sidebar__title"><Briefcase size={14} /> LearnStation Career</p>
            <p className="std-sidebar__desc">Bridge learning and employment</p>
          </div>

          <button onClick={() => setActiveTab('dashboard')}  className={`std-nav-btn ${activeTab === 'dashboard'  ? 'std-nav-btn--active' : ''}`}><Trophy size={15} /> Career Dashboard</button>
          <button onClick={() => setActiveTab('roadmap')}    className={`std-nav-btn ${activeTab === 'roadmap'    ? 'std-nav-btn--active' : ''}`}><BookOpen size={15} /> Career Roadmaps</button>
          <button onClick={() => setActiveTab('resume')}     className={`std-nav-btn ${activeTab === 'resume'     ? 'std-nav-btn--active' : ''}`}><FileText size={15} /> Resume Builder</button>
          <button onClick={() => setActiveTab('portfolio')}  className={`std-nav-btn ${activeTab === 'portfolio'  ? 'std-nav-btn--active' : ''}`}><Globe size={15} /> Portfolio Generator</button>
          <button onClick={() => setActiveTab('github')}     className={`std-nav-btn ${activeTab === 'github'     ? 'std-nav-btn--active' : ''}`}><GithubIcon size={15} /> GitHub Integration</button>
          <button onClick={() => setActiveTab('linkedin')}   className={`std-nav-btn ${activeTab === 'linkedin'   ? 'std-nav-btn--active' : ''}`}><LinkedinIcon size={15} /> LinkedIn Sharing</button>
          <button onClick={() => setActiveTab('placement')}  className={`std-nav-btn ${activeTab === 'placement'  ? 'std-nav-btn--active' : ''}`}><Award size={15} /> Placement Prep</button>
          <button onClick={() => setActiveTab('verification')} className={`std-nav-btn ${activeTab === 'verification' ? 'std-nav-btn--active' : ''}`}><CheckCircle size={15} /> Skill Verification</button>
          <button onClick={() => setActiveTab('showcase')}   className={`std-nav-btn ${activeTab === 'showcase'   ? 'std-nav-btn--active' : ''}`}><Code size={15} /> Project Showcase</button>
          <button onClick={() => setActiveTab('reports')}    className={`std-nav-btn ${activeTab === 'reports'    ? 'std-nav-btn--active' : ''}`}><TrendingUp size={15} /> Learning Reports</button>
        </div>
        {/* ACTIVE PANEL */}
        <div className="std-panel">
        
        {/* ================== CAREER DASHBOARD VIEW ================== */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>Career Dashboard</h2>
                <p className="text-secondary" style={{ fontSize: '12px' }}>Align your curriculums to employment opportunities.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="text-secondary" style={{ fontSize: '12px', fontWeight: 600 }}>Active Goal:</span>
                <select 
                  value={activeRoadmapGoal}
                  onChange={(e) => setActiveRoadmapGoal(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600 }}
                >
                  {CAREER_ROADMAPS.map((r, i) => (
                    <option key={i} value={r.goal}>{r.goal}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dash Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <span className="text-secondary" style={{ fontSize: '11px', fontWeight: 600 }}>Goal Alignment</span>
                <h3 className="text-primary" style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px' }}>{activeRoadmapGoal}</h3>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <span className="text-secondary" style={{ fontSize: '11px', fontWeight: 600 }}>Mock Placement Index</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', color: 'var(--accent-green)' }}>
                  {mockScore !== null ? `${mockScore}%` : '85%'} Ready
                </h3>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <span className="text-secondary" style={{ fontSize: '11px', fontWeight: 600 }}>Resume Status</span>
                <h3 className="text-primary" style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px' }}>
                  {resume.experience?.length > 0 ? '✔ Complete' : '⚠️ Missing Experience'}
                </h3>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <span className="text-secondary" style={{ fontSize: '11px', fontWeight: 600 }}>Portfolio Status</span>
                <h3 className="text-primary" style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px' }}>
                  {portfolio.is_published ? '✔ Published' : '⚠️ Offline'}
                </h3>
              </div>
            </div>

            {/* AI Recommendations */}
            <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-xl)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-amber)' }} />
                <h3 className="text-primary" style={{ fontSize: '14px', fontWeight: 800 }}>AI Career Recommendations for {activeRoadmapGoal}</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>Recommended Tracks</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
                    {getGoalRecommendations(activeRoadmapGoal).tracks.map((track, i) => (
                      <li key={i} style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <CheckCircle size={14} style={{ color: 'var(--accent-blue)' }} /> {track}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>Recommended Capstone Projects</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
                    {getGoalRecommendations(activeRoadmapGoal).projects.map((proj, i) => (
                      <li key={i} style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <Code size={14} style={{ color: 'var(--accent-green)' }} /> {proj}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>Recommended Skills</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
                    {getGoalRecommendations(activeRoadmapGoal).skills.map((skill, i) => (
                      <li key={i} style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <Award size={14} style={{ color: 'var(--accent-amber)' }} /> {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>LinkedIn Milestone Generator</h3>
                <div style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center' }}>
                  <LinkedinIcon size={32} style={{ color: '#0077b5', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Generate stylized milestone cards for Completed Tracks, Badges, or Certificates.</p>
                  <button onClick={() => setActiveTab('linkedin')} className="btn btn-secondary" style={{ fontSize: '12px', margin: '0 auto' }}>Generate Share Card</button>
                </div>
              </div>
              <div>
                <h3 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>GitHub Contributions</h3>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', background: 'var(--bg-tertiary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status: {githubConnected ? 'Linked' : 'Not Linked'}</span>
                    <button onClick={() => setActiveTab('github')} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>Manage</button>
                  </div>
                  {githubConnected ? (
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>@{githubUsername}</span>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Commits tracked inside LearnStation: {githubStats?.commits || 0}</p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Link your GitHub account under the GitHub tab to fetch analytics.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================== CAREER ROADMAPS TAB ================== */}
        {activeTab === 'roadmap' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>Role Career Roadmaps</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Verify curriculum steps and tracks needed to clear developer roles.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {CAREER_ROADMAPS.map((rm, i) => (
                <div 
                  key={i} 
                  style={{
                    border: '1px solid var(--border)', 
                    background: activeRoadmapGoal === rm.goal ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', 
                    padding: '20px', 
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: activeRoadmapGoal === rm.goal ? 'var(--shadow-glow-blue)' : 'none',
                    borderLeft: activeRoadmapGoal === rm.goal ? '4px solid var(--accent-blue)' : '1px solid var(--border)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{rm.goal}</h3>
                      <span style={{ fontSize: '10px', background: 'var(--border)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>{rm.time}</span>
                    </div>
                    <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '16px', lineHeight: 1.4 }}>{rm.description}</p>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Required Tracks</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {rm.tracks.slice(0, 4).map((t, idx) => (
                          <span key={idx} className="badge badge-secondary" style={{ fontSize: '9px' }}>{t}</span>
                        ))}
                        {rm.tracks.length > 4 && <span style={{ fontSize: '9px', color: 'var(--text-muted)', alignSelf: 'center' }}>+{rm.tracks.length - 4} more</span>}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setActiveRoadmapGoal(rm.goal);
                      alert(`Switched career goal to: ${rm.goal}! recommendations updated.`);
                    }} 
                    className={`btn ${activeRoadmapGoal === rm.goal ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ width: '100%', fontSize: '12px', justifyContent: 'center' }}
                  >
                    {activeRoadmapGoal === rm.goal ? 'Active Goal' : 'Switch to Goal'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================== RESUME BUILDER ================== */}
        {activeTab === 'resume' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>ATS Resume Builder</h2>
                <p className="text-secondary" style={{ fontSize: '12px' }}>Compile printable PDF and Word documents auto-populated with learning stats.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handlePrintResume} className="btn btn-secondary" style={{ fontSize: '12px', display: 'flex', gap: '6px' }}>
                  <Printer size={14} /> Print / Export PDF
                </button>
                <button onClick={handleWordExport} className="btn btn-secondary" style={{ fontSize: '12px', display: 'flex', gap: '6px' }}>
                  <Download size={14} /> Word (DOCX)
                </button>
              </div>
            </div>

            {/* Config & Preview Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
              
              {/* Form Config */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Template picker */}
                <div>
                  <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Select Layout Template</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['modern', 'professional', 'ats', 'minimal'] as const).map(t => (
                      <button 
                        key={t}
                        onClick={() => setResume(prev => ({ ...prev, template: t }))}
                        className={`btn ${resume.template === t ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '11px', textTransform: 'capitalize', padding: '6px 12px' }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Forms */}
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                  <h3 className="text-primary" style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Work Experience</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Company Name" value={expCompany} onChange={(e) => setExpCompany(e.target.value)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', fontSize: '12px', color: 'var(--text-primary)' }} />
                    <input type="text" placeholder="Role/Job Title" value={expRole} onChange={(e) => setExpRole(e.target.value)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', fontSize: '12px', color: 'var(--text-primary)' }} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <input type="text" placeholder="Duration (e.g. Jan 2025 - Present)" value={expDuration} onChange={(e) => setExpDuration(e.target.value)} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', fontSize: '12px', color: 'var(--text-primary)' }} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <textarea placeholder="Job description, achievements, etc." value={expDetails} onChange={(e) => setExpDetails(e.target.value)} rows={2} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', fontSize: '12px', color: 'var(--text-primary)', resize: 'vertical' }} />
                  </div>
                  <button onClick={addExperience} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', gap: '4px' }}>
                    <Plus size={12} /> Add Experience Item
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    {resume.experience?.map((exp, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{exp.role} @ {exp.company}</span>
                        <button onClick={() => deleteExperience(i)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education Forms */}
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                  <h3 className="text-primary" style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Education Details</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Institution" value={eduInstitution} onChange={(e) => setEduInstitution(e.target.value)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', fontSize: '12px', color: 'var(--text-primary)' }} />
                    <input type="text" placeholder="Degree / Specialization" value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', fontSize: '12px', color: 'var(--text-primary)' }} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <input type="text" placeholder="Passing Year" value={eduYear} onChange={(e) => setEduYear(e.target.value)} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', fontSize: '12px', color: 'var(--text-primary)' }} />
                  </div>
                  <button onClick={addEducation} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', gap: '4px' }}>
                    <Plus size={12} /> Add Education Item
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    {resume.education?.map((edu, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{edu.degree} - {edu.institution}</span>
                        <button onClick={() => deleteEducation(i)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Skills */}
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                  <h3 className="text-primary" style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Additional Skills</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Skill Name (e.g. AWS, Next.js)" value={additionalSkillInput} onChange={(e) => setAdditionalSkillInput(e.target.value)} style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', fontSize: '12px', color: 'var(--text-primary)' }} />
                    <button onClick={addAdditionalSkill} className="btn btn-secondary" style={{ fontSize: '12px' }}>Add</button>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {resume.additional_skills?.map((s, idx) => (
                      <span key={idx} className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 10px' }}>
                        {s} <button onClick={() => removeAdditionalSkill(idx)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex' }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <button onClick={saveResumeData} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Resume Data</button>
              </div>

              {/* LIVE RESUME DOCUMENT PREVIEW */}
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '32px', color: '#000000', fontFamily: "'Inter', sans-serif", boxShadow: 'var(--shadow-md)', maxHeight: '78vh', overflowY: 'auto' }}>
                <div id="resume-print-area" style={{ padding: '10px' }}>
                  
                  {/* MODERN TEMPLATE */}
                  {resume.template === 'modern' && (
                    <div>
                      <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '16px', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#1e293b' }}>{profile?.name}</h1>
                        <p style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600, margin: '4px 0 0' }}>Software Engineer</p>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>@{profile?.username} | learnstation.edu/u/{profile?.username}</p>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#2563eb', fontWeight: 700, margin: '0 0 10px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Education</h2>
                        {resume.education?.map((edu, i) => (
                          <div key={i} style={{ marginBottom: '8px', fontSize: '12px' }}>
                            <span style={{ fontWeight: 700 }}>{edu.degree}</span> - <span>{edu.institution}</span> ({edu.year})
                          </div>
                        ))}
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#2563eb', fontWeight: 700, margin: '0 0 10px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Experience</h2>
                        {resume.experience?.map((exp, i) => (
                          <div key={i} style={{ marginBottom: '12px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                              <span>{exp.role}</span>
                              <span style={{ color: '#64748b' }}>{exp.duration}</span>
                            </div>
                            <p style={{ margin: '2px 0 0', fontWeight: 600, color: '#475569' }}>{exp.company}</p>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '11px', lineHeight: 1.4 }}>{exp.details}</p>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#2563eb', fontWeight: 700, margin: '0 0 10px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Verified Skills</h2>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {completedTracks.map((t, idx) => (
                            <span key={idx} style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', color: '#334155' }}>{t.name}</span>
                          ))}
                          {resume.additional_skills?.map((s, idx) => (
                            <span key={idx} style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', color: '#334155' }}>{s}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#2563eb', fontWeight: 700, margin: '0 0 10px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Verified Credentials</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#475569' }}>
                          {certificates.map((c, i) => (
                            <span key={i}>🎖️ Certificate of Track Completion: {c.track?.name} (ID: {c.certificate_id})</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MINIMAL/PROFESSIONAL/ATS TEMPLATES */}
                  {resume.template !== 'modern' && (
                    <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{profile?.name}</h1>
                        <p style={{ color: '#475569', margin: 0 }}>@{profile?.username} | learnstation.edu/u/{profile?.username}</p>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ borderBottom: '1px solid #000000', paddingBottom: '2px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>Work Experience</h3>
                        {resume.experience?.map((exp, i) => (
                          <div key={i} style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                              <span>{exp.role} - {exp.company}</span>
                              <span>{exp.duration}</span>
                            </div>
                            <p style={{ margin: '4px 0 0', color: '#475569' }}>{exp.details}</p>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ borderBottom: '1px solid #000000', paddingBottom: '2px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>Education</h3>
                        {resume.education?.map((edu, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{edu.degree} | {edu.institution}</span>
                            <span>{edu.year}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ borderBottom: '1px solid #000000', paddingBottom: '2px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>Technical Skills</h3>
                        <p style={{ margin: '4px 0 0' }}>
                          <span style={{ fontWeight: 'bold' }}>Core Skills:</span> {completedTracks.map(t => t.name).join(', ')}
                          {resume.additional_skills?.length > 0 && `, ${resume.additional_skills.join(', ')}`}
                        </p>
                      </div>

                      <div>
                        <h3 style={{ borderBottom: '1px solid #000000', paddingBottom: '2px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>Certificates</h3>
                        {certificates.map((c, i) => (
                          <div key={i}>• {c.track?.name} (ID: {c.certificate_id})</div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================== PORTFOLIO WEBSITE GENERATOR ================== */}
        {activeTab === 'portfolio' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>Portfolio Generator</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Instantly compile a personal landing page showing tracks, badges, and project demos.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              {/* Settings Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Public URL Slug</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="text-secondary" style={{ fontSize: '13px' }}>learnstation.edu/p/</span>
                    <input 
                      type="text" 
                      value={portfolio.slug} 
                      onChange={(e) => setPortfolio(prev => ({ ...prev, slug: e.target.value }))}
                      style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Layout Theme Colorway</label>
                  <select 
                    value={portfolio.theme} 
                    onChange={(e) => setPortfolio(prev => ({ ...prev, theme: e.target.value as any }))}
                    style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }}
                  >
                    <option value="minimal">Minimal White</option>
                    <option value="developer">Developer (Mono Dark Mode)</option>
                    <option value="creative">Creative Neon Purple (Glassmorphism)</option>
                  </select>
                </div>

                {/* Section selection */}
                <div>
                  <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Visible Sections</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {['About', 'Skills', 'Learning Progress', 'Projects', 'Certificates', 'Achievements', 'GitHub', 'Contact'].map((sec) => {
                      const sections = portfolio.custom_sections?.show_sections || [];
                      const isChecked = sections.includes(sec);

                      return (
                        <label key={sec} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const newSections = e.target.checked 
                                ? [...sections, sec] 
                                : sections.filter((s: string) => s !== sec);
                              setPortfolio(prev => ({
                                ...prev,
                                custom_sections: { ...prev.custom_sections, show_sections: newSections }
                              }));
                            }}
                          />
                          <span>{sec}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Section Bio / Contact */}
                <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Custom Overlay Fields</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea 
                      placeholder="About section overlay bio..."
                      value={portfolio.custom_sections?.about || ''}
                      onChange={(e) => setPortfolio(prev => ({
                        ...prev,
                        custom_sections: { ...prev.custom_sections, about: e.target.value }
                      }))}
                      rows={2}
                      style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', fontSize: '12px', color: 'var(--text-primary)' }}
                    />
                    <input 
                      type="text"
                      placeholder="Contact Email"
                      value={portfolio.custom_sections?.contact_email || ''}
                      onChange={(e) => setPortfolio(prev => ({
                        ...prev,
                        custom_sections: { ...prev.custom_sections, contact_email: e.target.value }
                      }))}
                      style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', fontSize: '12px', color: 'var(--text-primary)' }}
                    />
                    <input 
                      type="text"
                      placeholder="LinkedIn Profile URL"
                      value={portfolio.custom_sections?.linkedin_url || ''}
                      onChange={(e) => setPortfolio(prev => ({
                        ...prev,
                        custom_sections: { ...prev.custom_sections, linkedin_url: e.target.value }
                      }))}
                      style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', fontSize: '12px', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={savePortfolioData} className="btn btn-primary">Save Settings</button>
                  {portfolio.is_published && (
                    <a href={`http://localhost:5173/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      View Live Portfolio <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* Publication / Deployment Simulator */}
              <div>
                <h3 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>Publishing Platforms Deployment</h3>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button onClick={() => handleDeployPortfolio('vercel')} className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', justifyContent: 'center' }}>Deploy to Vercel</button>
                  <button onClick={() => handleDeployPortfolio('netlify')} className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', justifyContent: 'center' }}>Publish to Netlify</button>
                  <button onClick={() => handleDeployPortfolio('github')} className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', justifyContent: 'center' }}>GitHub Pages</button>
                </div>

                {/* Console Log */}
                {(deploying || deploymentLog.length > 0) && (
                  <div style={{ background: '#0f172a', color: '#38bdf8', padding: '20px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '11px', minHeight: '180px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid #1e293b' }}>
                    <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '6px', marginBottom: '6px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                      <span>DEPLOYMENT CONSOLE</span>
                      {deploying && <RefreshCw size={12} className="animate-spin" />}
                    </div>
                    {deploymentLog.map((log, i) => (
                      <div key={i} style={{ color: log.startsWith('✔') ? '#4ade80' : log.startsWith('🚀') ? '#f472b6' : '#38bdf8' }}>{log}</div>
                    ))}
                    {deployedUrl && (
                      <div style={{ marginTop: '12px' }}>
                        <a href={deployedUrl} target="_blank" rel="noopener noreferrer" style={{ background: '#4ade80', color: '#0f172a', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }}>Visit Public Link</a>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ================== GITHUB INTEGRATION ================== */}
        {activeTab === 'github' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>GitHub Integration</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Import repositories and showcase coding consistency calendars directly on your profile.</p>
            </div>

            {!githubConnected ? (
              <div style={{ maxWidth: '400px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="text-secondary" style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>GitHub Profile Username</label>
                  <input 
                    type="text" 
                    placeholder="e.g. torvalds"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: 'var(--text-primary)' }}
                  />
                </div>
                <button onClick={handleConnectGithub} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
                  <GithubIcon size={16} /> Connect Account
                </button>
              </div>
            ) : (
              <div>
                {/* Stats Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>{githubStats?.repos || 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Repositories</div>
                  </div>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>{githubStats?.stars || 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Stars Received</div>
                  </div>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>{githubStats?.commits || 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Commits Tracked</div>
                  </div>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-blue)' }}>{githubStats?.languages?.[0]}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Top Language</div>
                  </div>
                </div>

                {/* Repository Showcaser */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Select Repositories to Showcase</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {githubStats?.repositoriesList?.map((repo: any, i: number) => {
                      const isShowcased = showcasedRepos.includes(repo.name);
                      
                      return (
                        <div 
                          key={i} 
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '16px',
                            background: isShowcased ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'
                          }}
                        >
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 700 }}>{repo.name}</h4>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{repo.desc}</p>
                          </div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                            <input 
                              type="checkbox"
                              checked={isShowcased}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setShowcasedRepos([...showcasedRepos, repo.name]);
                                } else {
                                  setShowcasedRepos(showcasedRepos.filter(r => r !== repo.name));
                                }
                              }}
                            />
                            <span>Showcase</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button onClick={handleDisconnectGithub} className="btn btn-secondary" style={{ color: '#ef4444' }}>Disconnect GitHub Profile</button>
              </div>
            )}
          </div>
        )}

        {/* ================== LINKEDIN SHARING ================== */}
        {activeTab === 'linkedin' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>Milestone Share Cards</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Generate elegant accomplishment graphics to share with your network.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Completed Tracks cards */}
              {completedTracks.map((t, idx) => (
                <div key={idx} style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '24px' }}>{t.icon || '🎓'}</span>
                    <h3 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginTop: '10px' }}>Completed {t.name} Track</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Milestone unlocked.</p>
                  </div>
                  <button onClick={() => handleGenerateShareCard('track', `I successfully completed the "${t.name}" learning track on LearnStation!`, t.icon)} className="btn btn-secondary" style={{ fontSize: '12px', width: '100%', marginTop: '16px', justifyContent: 'center', gap: '6px' }}>
                    <Share2 size={12} /> Share Milestone
                  </button>
                </div>
              ))}

              {/* Certificates */}
              {certificates.map((cert, idx) => (
                <div key={idx} style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '24px' }}>🎖️</span>
                    <h3 className="text-primary" style={{ fontSize: '14px', fontWeight: 800, marginTop: '10px' }}>{cert.track?.name} Certificate</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>ID: {cert.certificate_id}</p>
                  </div>
                  <button onClick={() => handleGenerateShareCard('cert', `Check out my verified "${cert.track?.name}" certificate on LearnStation (ID: ${cert.certificate_id})!`, '🎖️')} className="btn btn-secondary" style={{ fontSize: '12px', width: '100%', marginTop: '16px', justifyContent: 'center', gap: '6px' }}>
                    <Share2 size={12} /> Share Certificate
                  </button>
                </div>
              ))}

              {/* If no achievements */}
              {completedTracks.length === 0 && certificates.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                  <AlertCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No completed milestones to share yet. Complete a track or earn a certificate first!</p>
                </div>
              )}
            </div>

            {/* Share card popup modal */}
            {shareModalOpen && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '32px', borderRadius: '16px', maxWidth: '480px', width: '90%', boxShadow: 'var(--shadow-xl)', textAlign: 'center' }}>
                  <h3 className="text-primary" style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Accomplishment Share Card</h3>
                  
                  {/* Share Card Graphic Preview */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #0f172a 100%)',
                    borderRadius: '12px',
                    padding: '30px',
                    color: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '24px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                  }}>
                    <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>{shareIcon}</span>
                    <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0' }}>{shareTitle}</h4>
                    <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '0 0 20px 0' }}>Verified student credential details from LearnStation platform.</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', fontSize: '10px', color: '#94a3b8' }}>
                      <span>STUDENT: {profile?.name}</span>
                      <span>LEARNSTATION 🎓</span>
                    </div>
                  </div>

                  {/* Sharing links */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharePreviewUrl)}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary" 
                      style={{ fontSize: '12px', background: '#0077b5', display: 'flex', gap: '6px' }}
                    >
                      <LinkedinIcon size={14} /> LinkedIn
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle + ' ' + sharePreviewUrl)}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary" 
                      style={{ fontSize: '12px', background: '#1da1f2', display: 'flex', gap: '6px' }}
                    >
                      Share on X
                    </a>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(sharePreviewUrl);
                        alert('Shareable URL copied to clipboard!');
                      }} 
                      className="btn btn-secondary" 
                      style={{ fontSize: '12px', display: 'flex', gap: '6px' }}
                    >
                      <Copy size={14} /> Copy Link
                    </button>
                  </div>

                  <button onClick={() => setShareModalOpen(false)} className="btn btn-secondary" style={{ width: '100%' }}>Close Preview</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================== PLACEMENT PREPARATION ================== */}
        {activeTab === 'placement' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>Placement Preparation</h2>
                <p className="text-secondary" style={{ fontSize: '12px' }}>Review interview blueprints, aptitude tests, and coding challenges tailored for top tech employers.</p>
              </div>
              
              {/* Prep subtab selectors */}
              <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px' }}>
                {(['companies', 'aptitude', 'reasoning', 'questions', 'mock'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => { setSelectedPrepTab(t); setMockActive(false); }}
                    className={`btn ${selectedPrepTab === t ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', textTransform: 'capitalize', padding: '6px 12px', border: 'none', background: selectedPrepTab === t ? '' : 'none', color: selectedPrepTab === t ? '' : 'var(--text-secondary)' }}
                  >
                    {t === 'questions' ? 'Interview Qs' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* PREP SUBTAB CONTENT */}

            {/* 1. COMPANIES PREP */}
            {selectedPrepTab === 'companies' && companies.length > 0 && (
              <div>
                {/* List & Details Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '32px' }}>
                  {/* Left Company Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {companies.map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedCompanyIdx(i)}
                        className={`btn ${selectedCompanyIdx === i ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ justifyContent: 'flex-start', fontSize: '12px', width: '100%' }}
                      >
                        {c.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Right Details Panel */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', background: 'var(--bg-tertiary)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>{companies[selectedCompanyIdx].name} Prep Guide</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                      {/* Roadmap */}
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Learning Roadmap</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                          {companies[selectedCompanyIdx].roadmap.map((step, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent-blue)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>{idx + 1}</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mock Qs */}
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Important Questions</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                          {(companies[selectedCompanyIdx] as any).questions?.map((item: any, idx: number) => (
                            <div key={idx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, display: 'block' }}>Q: {item.q}</span>
                              <button onClick={() => handleRevealAnswer(`${selectedCompanyIdx}-${idx}`)} className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '10px', marginTop: '4px' }}>
                                {prepRevealed[`${selectedCompanyIdx}-${idx}`] ? 'Hide Answer' : 'Reveal Answer'}
                              </button>
                              {prepRevealed[`${selectedCompanyIdx}-${idx}`] && (
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>{item.a}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Coding Challenge workspace */}
                    {(companies[selectedCompanyIdx] as any).codingChallenges && (
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Top Coding Challenge</span>
                        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginTop: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>{(companies[selectedCompanyIdx] as any).codingChallenges[0].title}</span>
                            <span className="badge badge-secondary" style={{ fontSize: '10px', background: 'orange', color: '#ffffff' }}>{(companies[selectedCompanyIdx] as any).codingChallenges[0].difficulty}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{(companies[selectedCompanyIdx] as any).codingChallenges[0].desc}</p>
                          
                          {/* Code Editor */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                            <textarea 
                              value={companyCodingInput || (companies[selectedCompanyIdx] as any).codingChallenges[0].solution}
                              onChange={(e) => setCompanyCodingInput(e.target.value)}
                              rows={8}
                              style={{ width: '100%', background: '#1e293b', color: '#f8fafc', fontFamily: 'monospace', fontSize: '12px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <button 
                                onClick={() => runCompanyCodingChallenge((companies[selectedCompanyIdx] as any).codingChallenges[0].solution)} 
                                disabled={compilingCode}
                                className="btn btn-primary" 
                                style={{ fontSize: '12px' }}
                              >
                                {compilingCode ? 'Compiling...' : 'Run Test Cases'}
                              </button>
                            </div>
                          </div>

                          {/* Coding execution console */}
                          {codingConsole.length > 0 && (
                            <div style={{ background: '#0f172a', color: '#38bdf8', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '11px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {codingConsole.map((line, i) => (
                                <div key={i} style={{ color: line.startsWith('❌') ? '#ef4444' : line.startsWith('✔') ? '#4ade80' : '#38bdf8' }}>{line}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

            {/* 2. APTITUDE PRACTICE */}
            {selectedPrepTab === 'aptitude' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {APTITUDE_QUESTIONS.map((q) => (
                  <div key={q.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', background: 'var(--bg-tertiary)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700 }}>{q.question}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                      {q.options?.map((opt) => {
                        const isSelected = prepAnswers[q.id] === opt;
                        return (
                          <button 
                            key={opt}
                            onClick={() => setPrepAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '12px', justifyContent: 'flex-start' }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {prepAnswers[q.id] && (
                      <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: prepAnswers[q.id] === q.answer ? 'var(--accent-green)' : 'var(--accent-rose)' }}>
                          {prepAnswers[q.id] === q.answer ? '✔ Correct Answer!' : `❌ Incorrect (Correct: ${q.answer})`}
                        </span>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 3. REASONING PRACTICE */}
            {selectedPrepTab === 'reasoning' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {REASONING_QUESTIONS.map((q) => (
                  <div key={q.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', background: 'var(--bg-tertiary)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700 }}>{q.question}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                      {q.options?.map((opt) => {
                        const isSelected = prepAnswers[q.id] === opt;
                        return (
                          <button 
                            key={opt}
                            onClick={() => setPrepAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '12px', justifyContent: 'flex-start' }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {prepAnswers[q.id] && (
                      <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: prepAnswers[q.id] === q.answer ? 'var(--accent-green)' : 'var(--accent-rose)' }}>
                          {prepAnswers[q.id] === q.answer ? '✔ Correct Answer!' : `❌ Incorrect (Correct: ${q.answer})`}
                        </span>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 4. INTERVIEW QUESTIONS */}
            {selectedPrepTab === 'questions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { q: 'Explain OOP Pillars in detail.', a: 'Encapsulation binds data and functions. Inheritance passes attributes to subclasses. Polymorphism enables dynamic method overriding. Abstraction hides background complexities.' },
                  { q: 'What is the purpose of database Indexes?', a: 'Database indexes speed up retrieval operations by structuring keys (like B-Trees) to locate rows without full table scans.' },
                  { q: 'What is the difference between processes and threads?', a: 'A process is an executing program instance with independent memory resources. A thread is the smallest execution unit within a process, sharing the parent process\'s memory context.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>{item.q}</span>
                    <button onClick={() => handleRevealAnswer(`general-q-${idx}`)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', marginTop: '8px' }}>
                      {prepRevealed[`general-q-${idx}`] ? 'Hide Answer' : 'Reveal Answer'}
                    </button>
                    {prepRevealed[`general-q-${idx}`] && (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px', lineHeight: 1.4 }}>{item.a}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 5. MOCK TESTS */}
            {selectedPrepTab === 'mock' && (
              <div style={{ textAlign: 'center', padding: '40px', border: '1px solid var(--border)', borderRadius: '16px', background: 'var(--bg-tertiary)' }}>
                {!mockActive ? (
                  <div>
                    <Award size={48} style={{ color: 'var(--accent-blue)', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Complete placement readiness mock assessment</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: '20px' }}>This test contains a mix of quantitative aptitude, reasoning, and programming questions. Duration: 10 mins.</p>
                    <button onClick={startMockTest} className="btn btn-primary" style={{ margin: '0 auto' }}>Start Assessment Test</button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '20px' }}>Active Placement Mock Test</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {[...APTITUDE_QUESTIONS, ...REASONING_QUESTIONS].map((q, idx) => (
                        <div key={q.id}>
                          <p style={{ fontSize: '13px', fontWeight: 700 }}>{idx + 1}. {q.question}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                            {q.options?.map((opt) => (
                              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '12px' }}>
                                <input 
                                  type="radio" 
                                  name={`mock-${q.id}`} 
                                  checked={mockSelectedAnswers[q.id] === opt} 
                                  onChange={() => setMockSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))} 
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                      <button onClick={submitMockTest} className="btn btn-primary">Submit Test</button>
                      <button onClick={() => setMockActive(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ================== SKILL VERIFICATION ================== */}
        {activeTab === 'verification' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>Practical Skill Verification</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Validate your competencies through coding and practical problem-solving challenges.</p>
            </div>

            {/* List of Assessments */}
            {activeVerificationIdx === null ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px' }}>
                {/* Available Tests */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Available Practical Assessments</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {ASSESSMENT_TASKS.map((task, i) => (
                      <div key={task.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>{task.topic}</span>
                          <h4 style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>{task.title}</h4>
                        </div>
                        <button onClick={() => startSkillVerification(i)} className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }}>Start</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Reports List */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Verified Skill Reports</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {skillReports.map((rep, i) => (
                      <div key={i} style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-green)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: 700 }}>{rep.topic}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified: {rep.date}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)', display: 'block' }}>{rep.level}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Score: {rep.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              // Active Assessment IDE Workspace
              <div style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', background: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{ASSESSMENT_TASKS[activeVerificationIdx].topic}</span>
                  <button onClick={() => setActiveVerificationIdx(null)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>Back</button>
                </div>
                
                <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>{ASSESSMENT_TASKS[activeVerificationIdx].title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.4 }}>{ASSESSMENT_TASKS[activeVerificationIdx].question}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  <textarea 
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    rows={8}
                    style={{ width: '100%', background: '#1e293b', color: '#f8fafc', fontFamily: 'monospace', fontSize: '12px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button 
                      onClick={() => runSkillVerification(ASSESSMENT_TASKS[activeVerificationIdx].answerKeyword, ASSESSMENT_TASKS[activeVerificationIdx].topic)} 
                      disabled={verifying}
                      className="btn btn-primary"
                      style={{ fontSize: '12px' }}
                    >
                      {verifying ? 'Evaluating Snippet...' : 'Submit Assessment'}
                    </button>
                    <button onClick={() => setVerificationCode(ASSESSMENT_TASKS[activeVerificationIdx].template)} className="btn btn-secondary" style={{ fontSize: '12px' }}>Reset</button>
                  </div>
                </div>

                {/* Verification result loader/banner */}
                {verifying && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                    <RefreshCw size={14} className="animate-spin" />
                    <span style={{ fontSize: '12px' }}>Compiling code against test cases, measuring efficiency ratios...</span>
                  </div>
                )}

                {verificationResult === 'success' && (
                  <div style={{ marginTop: '16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--accent-green)', padding: '16px', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', display: 'block' }}>✔ Assessment Verification Passed!</span>
                    <p style={{ fontSize: '11px', marginTop: '4px' }}>Your solution successfully resolved all system asserts. Verified Skill Report generated at Expert level!</p>
                  </div>
                )}

                {verificationResult === 'failure' && (
                  <div style={{ marginTop: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--accent-rose)', padding: '16px', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', display: 'block' }}>❌ Assessment Verification Failed</span>
                    <p style={{ fontSize: '11px', marginTop: '4px' }}>Make sure to implement the core asynchronous and Rate-Limit middleware callbacks correctly.</p>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ================== PROJECT SHOWCASE ================== */}
        {activeTab === 'showcase' && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>Project Showcase</h2>
              <p className="text-secondary" style={{ fontSize: '12px' }}>Manage details of your workspaces and projects to showcase live demo links.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleAddProject} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
              <h3 className="text-primary" style={{ fontSize: '13px', fontWeight: 800, marginBottom: '16px' }}>Register Showcase Project</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <input type="text" placeholder="Project Name" value={projName} onChange={(e) => setProjName(e.target.value)} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '12px', color: 'var(--text-primary)' }} required />
                <input type="text" placeholder="Technologies Used (comma separated)" value={projTech} onChange={(e) => setProjTech(e.target.value)} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '12px', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <input type="text" placeholder="GitHub Repository URL" value={projGithub} onChange={(e) => setProjGithub(e.target.value)} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '12px', color: 'var(--text-primary)' }} />
                <input type="text" placeholder="Live Demo URL" value={projLive} onChange={(e) => setProjLive(e.target.value)} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '12px', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <textarea placeholder="Brief description of your project..." value={projDesc} onChange={(e) => setProjDesc(e.target.value)} rows={2} style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '12px', color: 'var(--text-primary)', resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ display: 'flex', gap: '6px', fontSize: '12px' }}>
                <Plus size={14} /> Add Project Card
              </button>
            </form>

            {/* List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {projects.map((proj) => (
                <div key={proj.id} style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 className="text-primary" style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{proj.project_name}</h3>
                    <p className="text-secondary" style={{ fontSize: '11px', marginBottom: '12px', lineHeight: 1.4 }}>{proj.description}</p>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {proj.technologies?.map((t, idx) => <span key={idx} className="badge badge-secondary" style={{ fontSize: '9px' }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-primary"><GithubIcon size={14} /></a>}
                      {proj.live_url && <a href={proj.live_url} target="_blank" rel="noreferrer" className="text-primary"><ExternalLink size={14} /></a>}
                    </div>
                    <button onClick={() => proj.id && handleDeleteProject(proj.id)} className="btn btn-secondary" style={{ padding: '4px', color: '#ef4444' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================== LEARNING REPORTS ================== */}
        {activeTab === 'reports' && report && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="text-primary" style={{ fontSize: '18px', fontWeight: 800 }}>Metrics & Growth Reports</h2>
                <p className="text-secondary" style={{ fontSize: '12px' }}>Review aggregate data detailing consistency indexes and study hour targets.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => alert('Learning Report exported as PDF!')} className="btn btn-secondary" style={{ fontSize: '12px', display: 'flex', gap: '6px' }}>
                  <Download size={14} /> Export PDF
                </button>
                <button onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8,Week,XP,Hours\n" + report.growthTrend.map((g: any) => `${g.week},${g.xp},${g.hours}`).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "learning_report.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }} className="btn btn-secondary" style={{ fontSize: '12px', display: 'flex', gap: '6px' }}>
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            {/* Sub-selectors */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {['weekly', 'monthly', 'tracks'].map((rType) => (
                <button 
                  key={rType}
                  onClick={() => setSelectedReportType(rType)}
                  className={`btn ${selectedReportType === rType ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize', fontSize: '11px', padding: '6px 12px' }}
                >
                  {rType} Report
                </button>
              ))}
            </div>

            {/* Metrics cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{report.completedLessons}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Lessons Completed</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{report.learningHours}h</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Time Spent Studying</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{report.totalXp}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Total Cumulative XP</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{report.currentStreak} Days</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Active Streak</div>
              </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
              {/* Growth Trend Bar Chart */}
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Weekly XP Accumulation Growth Trend</h3>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                  {report.growthTrend?.map((g: any, idx: number) => {
                    const maxVal = Math.max(...report.growthTrend.map((x: any) => x.xp));
                    const barHeight = maxVal > 0 ? (g.xp / maxVal) * 130 : 0;
                    
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '6px' }}>{g.xp} XP</div>
                        <div style={{ width: '28px', height: `${barHeight}px`, background: 'var(--accent-blue)', borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease' }} />
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '8px' }}>{g.week}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coding Activity Calendar */}
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Daily Coding Activity (Commits)</h3>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                  {report.codingActivity?.map((a: any, idx: number) => {
                    const maxVal = Math.max(...report.codingActivity.map((x: any) => x.count));
                    const barHeight = maxVal > 0 ? (a.count / maxVal) * 130 : 0;
                    
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '6px' }}>{a.count}</div>
                        <div style={{ width: '20px', height: `${barHeight}px`, background: 'var(--accent-green)', borderRadius: '4px 4px 0 0' }} />
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '8px' }}>{a.day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        </div>{/* /std-panel */}
      </div>{/* /std-layout */}
      </div>{/* /container */}
    </div>
  );
}
