import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';

// ================= RESUME BUILDER =================

// @desc    Get user resume details
// @route   GET /api/career/resume
export const getResume = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

    // Fetch saved resume configuration
    const { data: resume, error } = await supabase
      .from('user_resumes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    // Fetch profile containing achievements (badges), level, xp, etc.
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Fetch completed tracks
    const { data: allProgress } = await supabase
      .from('progress')
      .select('*, track:tracks(id, name, slug, color, icon)')
      .eq('user_id', userId);

    const completedTracks = (allProgress || [])
      .filter((p) => p.progress_percent >= 100)
      .map((p) => p.track);

    // Fetch certificates
    const { data: certificates } = await supabase
      .from('certificates')
      .select('*, track:tracks(id, name, slug)')
      .eq('user_id', userId);

    // Fetch showcased projects
    const { data: showcasedProjects } = await supabase
      .from('showcased_projects')
      .select('*')
      .eq('user_id', userId);

    res.json({
      resume: resume || {
        template: 'modern',
        experience: [],
        education: [],
        additional_skills: []
      },
      profile,
      completedTracks: completedTracks || [],
      certificates: certificates || [],
      projects: showcasedProjects || []
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save/Update resume details
// @route   POST /api/career/resume/save
export const saveResume = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { template, experience, education, additionalSkills } = req.body;

    const { data: existing } = await supabase
      .from('user_resumes')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabase
        .from('user_resumes')
        .update({ template, experience, education, additional_skills: additionalSkills })
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      result = await supabase
        .from('user_resumes')
        .insert({ user_id: userId, template, experience, education, additional_skills: additionalSkills })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json({ success: true, resume: result.data });
  } catch (err) {
    next(err);
  }
};

// ================= PORTFOLIO GENERATOR =================

// @desc    Get portfolio settings
// @route   GET /api/career/portfolio
export const getPortfolio = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    res.json({
      portfolio: portfolio || {
        theme: 'minimal',
        slug: `user-${userId.substring(0, 8)}`,
        custom_sections: {
          about: '',
          contact_email: '',
          linkedin_url: '',
          show_sections: ['About', 'Skills', 'Learning Progress', 'Projects', 'Certificates', 'Achievements', 'GitHub', 'Contact']
        },
        is_published: false
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save portfolio settings
// @route   POST /api/career/portfolio/save
export const savePortfolio = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { theme, slug, customSections, isPublished } = req.body;

    if (!slug) return res.status(400).json({ message: 'Slug is required.' });

    // Validate slug uniqueness (cannot be used by another user)
    const { data: duplicate } = await supabase
      .from('portfolios')
      .select('user_id')
      .eq('slug', slug)
      .neq('user_id', userId)
      .maybeSingle();

    if (duplicate) {
      return res.status(400).json({ message: 'Portfolio link/slug is already taken by another student.' });
    }

    const { data: existing } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabase
        .from('portfolios')
        .update({ theme, slug, custom_sections: customSections, is_published: isPublished })
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      result = await supabase
        .from('portfolios')
        .insert({ user_id: userId, theme, slug, custom_sections: customSections, is_published: isPublished })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json({ success: true, portfolio: result.data });
  } catch (err) {
    next(err);
  }
};

// @desc    Get public portfolio details by slug
// @route   GET /api/career/portfolio/public/:slug
export const getPublicPortfolioBySlug = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { slug } = req.params;

    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (portfolioError || !portfolio) {
      return res.status(404).json({ message: 'Portfolio not found.' });
    }

    if (!portfolio.is_published) {
      return res.status(403).json({ message: 'This portfolio is private.' });
    }

    // Fetch owner details
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', portfolio.user_id)
      .single();

    if (!profile) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Fetch tracks completed
    const { data: allProgress } = await supabase
      .from('progress')
      .select('*, track:tracks(id, name, slug, color, icon)')
      .eq('user_id', portfolio.user_id);

    const completedTracks = (allProgress || [])
      .filter((p) => p.progress_percent >= 100)
      .map((p) => p.track);

    // Fetch in-progress learning tracks for progress sections
    const learningProgress = (allProgress || [])
      .filter((p) => p.progress_percent > 0 && p.progress_percent < 100)
      .map((p) => ({
        track: p.track,
        percent: p.progress_percent
      }));

    // Fetch showcased projects
    const { data: showcasedProjects } = await supabase
      .from('showcased_projects')
      .select('*')
      .eq('user_id', portfolio.user_id);

    // Fetch certificates
    const { data: certificates } = await supabase
      .from('certificates')
      .select('*, track:tracks(name, slug)')
      .eq('user_id', portfolio.user_id);

    res.json({
      portfolio,
      profile: {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        bio: profile.bio || '',
        xp: profile.xp || 0,
        level: profile.level || 1,
        streak: profile.streak || 0,
        longestStreak: profile.longest_streak || 0,
        achievements: profile.achievements || [],
        githubConnected: profile.github_connected || false,
        githubUsername: profile.github_username || '',
        githubStats: profile.github_stats || null,
        createdAt: profile.created_at
      },
      completedTracks: completedTracks || [],
      learningProgress: learningProgress || [],
      projects: showcasedProjects || [],
      certificates: certificates || []
    });
  } catch (err) {
    next(err);
  }
};

// ================= PROJECT SHOWCASE =================

// @desc    Get showcased projects
// @route   GET /api/career/projects
export const getShowcasedProjects = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

    const { data: projects, error } = await supabase
      .from('showcased_projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ projects: projects || [] });
  } catch (err) {
    next(err);
  }
};

// @desc    Save/Add showcased project
// @route   POST /api/career/projects/save
export const saveShowcasedProject = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { id, projectName, description, technologies, githubUrl, liveUrl, skillsUsed } = req.body;

    let result;
    if (id) {
      result = await supabase
        .from('showcased_projects')
        .update({ project_name: projectName, description, technologies, github_url: githubUrl, live_url: liveUrl, skills_used: skillsUsed })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      result = await supabase
        .from('showcased_projects')
        .insert({ user_id: userId, project_name: projectName, description, technologies, github_url: githubUrl, live_url: liveUrl, skills_used: skillsUsed })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json({ success: true, project: result.data });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete showcased project
// @route   POST /api/career/projects/delete
export const deleteShowcasedProject = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: 'Project ID is required.' });

    const { error } = await supabase
      .from('showcased_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ================= GITHUB CONNECT =================

// @desc    Connect GitHub account (Mock stats generation)
// @route   POST /api/career/github/connect
export const connectGithub = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { githubUsername } = req.body;

    if (!githubUsername) return res.status(400).json({ message: 'GitHub username is required.' });

    const stats = {
      stars: 18,
      repos: 12,
      commits: 268,
      languages: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'HTML', 'CSS'],
      contributions: [
        { date: '2026-07-10', count: 3 },
        { date: '2026-07-11', count: 0 },
        { date: '2026-07-12', count: 5 },
        { date: '2026-07-13', count: 8 },
        { date: '2026-07-14', count: 2 },
        { date: '2026-07-15', count: 6 },
        { date: '2026-07-16', count: 4 }
      ],
      repositoriesList: [
        { name: 'learn-station-client', stars: 4, language: 'TypeScript', desc: 'React 19 Frontend workspace for LearnStation platform.' },
        { name: 'learn-station-server', stars: 2, language: 'TypeScript', desc: 'Express + Supabase Node.js Backend API for LearnStation.' },
        { name: 'sandboxed-code-runner', stars: 8, language: 'Python', desc: 'Secure execution sandbox supporting multiple languages.' },
        { name: 'gamified-auth-node', stars: 1, language: 'JavaScript', desc: 'Custom auth flow integrating profile self-healing middleware.' },
        { name: 'leetcode-solutions', stars: 3, language: 'Python', desc: 'Optimized solutions for algorithmic and coding practices.' }
      ]
    };

    await supabase
      .from('profiles')
      .update({
        github_connected: true,
        github_username: githubUsername,
        github_stats: stats
      })
      .eq('id', userId);

    res.json({
      success: true,
      githubConnected: true,
      githubUsername,
      stats
    });
  } catch (err) {
    next(err);
  }
};

// ================= PLACEMENT PREPARATION =================

// @desc    Get placement preparation materials
// @route   GET /api/career/placement-prep
export const getPlacementPrep = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const companies = [
      {
        name: 'TCS (Tata Consultancy Services)',
        roadmap: ['Aptitude Basics', 'C/Python Programming', 'TCS NQT Mock Tests', 'Technical & HR Blueprints'],
        challengesCount: 15,
        questionsCount: 45,
        questions: [
          { q: 'What is the difference between structure and union in C?', a: 'A structure allocates separate memory for all its members, whereas a union allocates a single shared memory block sized to its largest member, allowing only one member to be stored at any given time.' },
          { q: 'Explain Call by Value and Call by Reference.', a: 'Call by Value passes a copy of the actual variable argument, meaning changes inside the function do not affect the original. Call by Reference passes the address of the variable, so changes inside the function modify the original variable.' }
        ],
        codingChallenges: [
          { title: 'Reverse a Linked List', difficulty: 'Medium', desc: 'Reverse a singly linked list in-place and return the new head.', solution: 'Node* reverseList(Node* head) {\n  Node* prev = NULL;\n  Node* curr = head;\n  while(curr) {\n    Node* next = curr->next;\n    curr->next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}' }
        ]
      },
      {
        name: 'Infosys',
        roadmap: ['Logical Reasoning', 'SQL Intermediate Queries', 'Coding Assessments', 'Infosys SP/DSE Preparation'],
        challengesCount: 12,
        questionsCount: 30,
        questions: [
          { q: 'What is DBMS and what are its advantages?', a: 'A Database Management System (DBMS) is software used to store, retrieve, and manage data. Advantages include reduced data redundancy, sharing of data, data consistency, and data security.' },
          { q: 'Explain standard Joins in SQL.', a: 'INNER JOIN returns matching rows. LEFT JOIN returns all left rows plus matching right rows. RIGHT JOIN returns all right rows plus matching left rows. FULL JOIN returns rows when there is a match in either table.' }
        ],
        codingChallenges: [
          { title: 'Find Duplicate in Array', difficulty: 'Easy', desc: 'Given an array of integers, find the duplicate number without using extra memory.', solution: 'int findDuplicate(vector<int>& nums) {\n  int slow = nums[0];\n  int fast = nums[0];\n  do {\n    slow = nums[slow];\n    fast = nums[nums[fast]];\n  } while (slow != fast);\n  fast = nums[0];\n  while (slow != fast) {\n    slow = nums[slow];\n    fast = nums[fast];\n  }\n  return slow;\n}' }
        ]
      },
      {
        name: 'Accenture',
        roadmap: ['Cognitive Assessment', 'Pseudocode Debugging', 'Communication Review', 'Accenture Technical Interview'],
        challengesCount: 10,
        questionsCount: 25,
        questions: [
          { q: 'What is OOPS? Explain key pillars.', a: 'Object-Oriented Programming (OOP) is a paradigm based on "objects". Key pillars are Encapsulation (data hiding), Inheritance (reusing code), Polymorphism (multiple forms), and Abstraction (hiding implementation details).' },
          { q: 'What is a destructor in C++?', a: 'A destructor is a member function called automatically when an object goes out of scope or is deleted. It has the same name as the class prefixed with a tilde (~) and does not accept parameters or return a value.' }
        ],
        codingChallenges: [
          { title: 'Check Prime Number', difficulty: 'Easy', desc: 'Check if a given number is prime or not in O(sqrt(N)) time complexity.', solution: 'bool isPrime(int n) {\n  if (n <= 1) return false;\n  for (int i = 2; i * i <= n; i++) {\n    if (n % i == 0) return false;\n  }\n  return true;\n}' }
        ]
      },
      {
        name: 'Cognizant',
        roadmap: ['Quantitative Aptitude', 'Automata Fix debugging', 'Java OOP Foundations', 'Cognizant GenC Elevate Test'],
        challengesCount: 14,
        questionsCount: 35,
        questions: [
          { q: 'What is Method Overloading vs Method Overriding?', a: 'Overloading occurs when two or more methods in the same class have the same name but different parameters (compile-time polymorphism). Overriding occurs when a subclass provides a specific implementation of a method already declared in its superclass (run-time polymorphism).' },
          { q: 'What is the purpose of the final keyword in Java?', a: 'In Java, final restricts modifications: a final variable cannot be reassigned, a final method cannot be overridden, and a final class cannot be inherited.' }
        ],
        codingChallenges: [
          { title: 'Anagram Check', difficulty: 'Easy', desc: 'Determine if two strings are anagrams of each other.', solution: 'bool isAnagram(string s, string t) {\n  if (s.length() != t.length()) return false;\n  int count[26] = {0};\n  for (int i = 0; i < s.length(); i++) {\n    count[s[i] - \'a\']++;\n    count[t[i] - \'a\']--;\n  }\n  for (int i = 0; i < 26; i++) {\n    if (count[i] != 0) return false;\n  }\n  return true;\n}' }
        ]
      },
      {
        name: 'Capgemini',
        roadmap: ['PseudoCode Test', 'Game-based Aptitude', 'Behavioral Profiling', 'Capgemini L&D Roadmap'],
        challengesCount: 9,
        questionsCount: 22,
        questions: [
          { q: 'What is a pointer in C/C++?', a: 'A pointer is a variable that stores the memory address of another variable. Pointers allow dynamic memory allocation and direct manipulation of variables in memory.' },
          { q: 'Explain virtual functions.', a: 'A virtual function is a member function in a base class that you expect to redefine in derived classes, allowing runtime dynamic dispatch of method calls.' }
        ],
        codingChallenges: [
          { title: 'Fibonacci Series', difficulty: 'Easy', desc: 'Compute the N-th Fibonacci number efficiently.', solution: 'int fib(int n) {\n  if (n <= 1) return n;\n  int a = 0, b = 1, c;\n  for (int i = 2; i <= n; i++) {\n    c = a + b;\n    a = b;\n    b = c;\n  }\n  return b;\n}' }
        ]
      },
      {
        name: 'Wipro',
        roadmap: ['Wipro Elite NLTH Test', 'Java/Python Programming', 'Technical HR Interview', 'System Design Basics'],
        challengesCount: 8,
        questionsCount: 20,
        questions: [
          { q: 'What is an Abstract Class vs Interface?', a: 'An abstract class can contain instance variables, concrete methods, and constructor definitions. An interface (before Java 8) could only have static final constants and abstract methods. A class can implement multiple interfaces, but extend only one abstract class.' },
          { q: 'What is Garbage Collection in Java?', a: 'Garbage Collection is an automatic process by which Java programs perform memory management by reclaiming memory occupied by objects that are no longer reachable or used in the application.' }
        ],
        codingChallenges: [
          { title: 'Palindrome String', difficulty: 'Easy', desc: 'Determine if a given string is a palindrome, ignoring non-alphanumeric characters.', solution: 'bool isPalindrome(string s) {\n  int l = 0, r = s.length() - 1;\n  while (l < r) {\n    if (!isalnum(s[l])) l++;\n    else if (!isalnum(s[r])) r--;\n    else if (tolower(s[l++]) != tolower(s[r--])) return false;\n  }\n  return true;\n}' }
        ]
      }
    ];

    res.json({ companies });
  } catch (err) {
    next(err);
  }
};

// ================= LEARNING REPORTS =================

// @desc    Get metrics / weekly reports
// @route   GET /api/career/learning-reports
export const getLearningReports = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.id;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: progressRows } = await supabase
      .from('progress')
      .select('*, track:tracks(name, slug, category)')
      .eq('user_id', userId);

    const { data: certificates } = await supabase
      .from('certificates')
      .select('*, track:tracks(name, slug)')
      .eq('user_id', userId);

    const completedLessons = (progressRows || []).filter(p => p.status === 'completed').length;
    const activeLessons = (progressRows || []).length;
    const completedTracks = (progressRows || []).filter(p => p.progress_percent >= 100).length;

    // Categorized progress breakdown
    const categories: Record<string, number> = {};
    (progressRows || []).forEach(p => {
      const cat = p.track?.category || 'general';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    res.json({
      report: {
        completedLessons,
        activeLessons,
        completedTracks,
        totalXp: profile?.xp || 0,
        currentStreak: profile?.streak || 0,
        learningHours: Math.round((profile?.learning_time || 0) / 60) || 12,
        categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
        certificates: certificates || [],
        growthTrend: [
          { week: 'Week 1', xp: 250, hours: 2 },
          { week: 'Week 2', xp: 600, hours: 5 },
          { week: 'Week 3', xp: 1200, hours: 9 },
          { week: 'Week 4', xp: profile?.xp || 1400, hours: Math.round((profile?.learning_time || 0) / 60) || 12 }
        ],
        codingActivity: [
          { day: 'Mon', count: 4 },
          { day: 'Tue', count: 7 },
          { day: 'Wed', count: 12 },
          { day: 'Thu', count: 2 },
          { day: 'Fri', count: 8 },
          { day: 'Sat', count: 15 },
          { day: 'Sun', count: 5 }
        ],
        recommendations: [
          'Maintain a 30-minute daily learning window to secure your streak.',
          'Complete the final capstone project of your active track to receive a shareable certificate.',
          'Take a Practice Mock Challenge under Placement Prep to verify your aptitude.'
        ]
      }
    });
  } catch (err) {
    next(err);
  }
};
