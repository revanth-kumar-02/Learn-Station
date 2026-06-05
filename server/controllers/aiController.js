const { supabase } = require('../config/db');

// Helper to slugify track name
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

// Seeding/Mock blueprint content when Gemini key is not present or fails
const getMockBlueprint = (skill, level, goal) => {
  const normalizedSkill = skill.toLowerCase().trim();

  // We provide a rich, detailed blueprint for Docker
  if (normalizedSkill.includes('docker')) {
    return {
      track: {
        name: `AI: Docker (${level})`,
        description: `Custom blueprint designed for ${goal}. Master Docker container virtualization, volume persistence, and multi-container orchestration.`,
        color: 'hsl(200, 95%, 45%)',
        icon: 'database',
        capstone_project: {
          title: 'Docker Compose Multi-Container Deployment',
          description: 'Deploy a multi-container stack with a Node.js web server and a PostgreSQL database using volumes for persistent data storage.',
          requirements: [
            'Create a multi-stage Dockerfile for a production Node.js application.',
            'Write a docker-compose.yml file detailing services, networks, and persistent volumes.',
            'Ensure the web application connects to the DB and handles reconnection retries.',
            'Configure environment variables securely using external Compose env files.'
          ]
        }
      },
      modules: [
        {
          id: 'docker-basics',
          name: 'Docker Fundamentals & Containers',
          display_order: 1,
          learning_objective: 'Learn how to run, inspect, and manage containers and understand the basic virtualization concepts.',
          mini_project: {
            title: 'Static Website Containerizer',
            description: 'Package and serve a custom static web portal using an NGINX container.',
            requirements: [
              'Create an HTML/CSS landing page.',
              'Write a Dockerfile using the nginx:alpine base image.',
              'Build the image and run it locally, forwarding port 8080 to 80.'
            ]
          }
        },
        {
          id: 'docker-advanced',
          name: 'Custom Images & Data Volumes',
          display_order: 2,
          learning_objective: 'Write optimal Dockerfiles, understand layered architecture, and handle database persistence via volumes.',
          mini_project: {
            title: 'SQLite App Data Persister',
            description: 'Run a simple task scheduler container that persists sqlite database data to the host machine.',
            requirements: [
              'Build a Python or Node app writing data logs to a db.sqlite file.',
              'Configure a Docker Named Volume mapping the database folder.',
              'Confirm container restarts retain task entries.'
            ]
          }
        }
      ],
      lessons: [
        {
          slug: 'docker-1',
          title: 'Introduction to Containers',
          module_id: 'docker-basics',
          display_order: 1,
          estimated_minutes: 8,
          xp_reward: 25,
          concept_title: 'What are Containers?',
          concept_content: "A container is a standard unit of software that packages up code and all its dependencies so the application runs quickly and reliably from one computing environment to another.\n\nUnlike virtual machines (VMs) which require a full guest operating system and a hypervisor, containers share the host operating system kernel. This makes them extremely lightweight, fast to boot (seconds instead of minutes), and efficient in terms of CPU and memory usage.",
          concept_highlights: ['container', 'dependencies', 'virtual machines', 'host operating system kernel'],
          example_language: 'bash',
          example_code: 'docker run -d -p 8080:80 nginx',
          example_explanation: 'This pulls the NGINX web server image, runs it in the background/detached mode (-d), and maps port 8080 on the host to port 80 inside the container.',
          practice_type: 'fill-blank',
          practice_instruction: 'Complete the CLI command to list all active running containers:',
          practice_template: 'docker ___',
          practice_answer: 'ps',
          summary: 'Containers package application code with dependencies, sharing the host OS kernel for speed and portability. You run them using the docker run command.',
          challenges: [
            {
              type: 'multiple-choice',
              question: 'How do containers differ from virtual machines?',
              options: [
                'Containers require a separate hypervisor and guest OS.',
                'Containers share the host operating system kernel and are more lightweight.',
                'Containers run slower than virtual machines.',
                'Containers do not support networking.'
              ],
              correct_index: 1,
              explanation: 'By sharing the host OS kernel instead of virtualizing hardware, containers boot instantly and use minimal overhead compared to VMs.'
            },
            {
              type: 'fill-blank',
              question: 'Complete the command to run a container in background/detached mode:',
              template: 'docker run ___ -p 3000:3000 node-app',
              answer: '-d',
              explanation: 'The -d flag runs the container in detached mode, allowing your terminal to remain interactive.'
            }
          ]
        },
        {
          slug: 'docker-2',
          title: 'Creating Images with Dockerfiles',
          module_id: 'docker-basics',
          display_order: 2,
          estimated_minutes: 10,
          xp_reward: 25,
          concept_title: 'Understanding Dockerfiles & Images',
          concept_content: "An image is a read-only blueprint that contains the operating system, runtimes, and code required to run a container. You build images using a text configuration file called a Dockerfile.\n\nEvery instruction in a Dockerfile creates a read-only layer in the image. Layer caching speeds up successive builds. Key instructions include FROM (base image), COPY (adding files), RUN (running build commands), and CMD (defining default launch executable).",
          concept_highlights: ['image', 'Dockerfile', 'layer caching', 'FROM', 'CMD'],
          example_language: 'dockerfile',
          example_code: 'FROM node:18-alpine\nWORKDIR /app\nCOPY package.json .\nRUN npm install\nCOPY . .\nCMD ["node", "server.js"]',
          example_explanation: 'This Dockerfile starts from a Node runtime, copies dependencies first (to leverage cache), installs modules, copies the rest of the source code, and sets server.js as the entry point.',
          practice_type: 'fill-blank',
          practice_instruction: 'Complete the Dockerfile instruction to set the base image to python:3.10-slim:',
          practice_template: '___ python:3.10-slim',
          practice_answer: 'FROM',
          summary: 'Dockerfiles contain sequential step instructions (FROM, WORKDIR, COPY, RUN, CMD) that compile read-only layered images. Container runtimes are instances of these images.',
          challenges: [
            {
              type: 'multiple-choice',
              question: 'Which instruction defines the default command to execute when the container starts?',
              options: ['RUN', 'ENTRYPOINT', 'CMD', 'EXPOSE'],
              correct_index: 2,
              explanation: 'CMD specifies the default executable and arguments that run when the container is launched, whereas RUN is executed during the image building phase.'
            },
            {
              type: 'fill-blank',
              question: 'What command compiles a Dockerfile into an image named "my-app"?',
              template: 'docker build ___ my-app .',
              answer: '-t',
              explanation: 'The -t flag stands for "tag", allowing you to name/label the output image.'
            }
          ]
        },
        {
          slug: 'docker-3',
          title: 'Docker Data Persistence & Volumes',
          module_id: 'docker-advanced',
          display_order: 3,
          estimated_minutes: 10,
          xp_reward: 25,
          concept_title: 'Containers are Ephemeral',
          concept_content: "By default, any data created inside a container is lost when the container is deleted. To persist database files, uploads, and logs, Docker uses Volumes.\n\nVolumes map a directory on the host operating system to a directory inside the container. Named volumes are managed by Docker on the host disk, while Bind Mounts map a specific user-defined path directly.",
          concept_highlights: ['Ephemeral', 'Volumes', 'Named volumes', 'Bind Mounts'],
          example_language: 'bash',
          example_code: 'docker run -d -v db-data:/data/db mongo',
          example_explanation: "This runs a MongoDB container and mounts a named volume 'db-data' to '/data/db', keeping your database records intact even if the mongo container is destroyed.",
          practice_type: 'fill-blank',
          practice_instruction: 'Complete the run command flag to mount a volume:',
          practice_template: 'docker run -d ___ my-vol:/app/data node-app',
          practice_answer: '-v',
          summary: 'Containers are stateless by default. Use the -v flag to mount volumes for database files and long-term storage data persistence.',
          challenges: [
            {
              type: 'multiple-choice',
              question: 'Where is data stored when using a Docker Named Volume?',
              options: [
                'On the container ephemeral filesystem layer.',
                'In a directory managed by Docker on the host system filesystem.',
                'Inside the remote registry.',
                'It is stored temporarily in RAM.'
              ],
              correct_index: 1,
              explanation: 'Named volumes reside in a protected, Docker-managed section of the host host filesystem (like /var/lib/docker/volumes on Linux).'
            },
            {
              type: 'fill-blank',
              question: 'Mounting a specific host folder path directly to a container is called a ___ mount:',
              template: 'bind ___',
              answer: 'mount',
              explanation: 'Bind mounts map any host directory path directly into the container filesystem.'
            }
          ]
        }
      ]
    };
  }

  // Fallback default blueprint (Python programming blueprint)
  return {
    track: {
      name: `AI: ${skill} (${level})`,
      description: `Custom blueprint designed for ${goal}. Master the fundamentals, core syntax, structures, and practical application files of ${skill}.`,
      color: 'hsl(262, 83%, 58%)',
      icon: 'code',
      capstone_project: {
        title: `Build a ${skill} Capstone Console Application`,
        description: `Create a fully operational, modular application implementing core design principles, state handling, and file read/write files in ${skill}.`,
        requirements: [
          'Deconstruct requirements into modular components.',
          'Implement persistence using files or light structures.',
          'Verify error boundaries and input validation logs.',
          'Structure code using recommended directory conventions.'
        ]
      }
    },
    modules: [
      {
        id: 'module-1',
        name: 'Foundations & Basic Syntax',
        display_order: 1,
        learning_objective: 'Understand compilation/runtime concepts, print utilities, variables, and primitive types.',
        mini_project: {
          title: 'Interactive CLI Greetings Profile',
          description: 'Build a script welcoming users and evaluating numeric inputs.',
          requirements: [
            'Prompt user for text profile info.',
            'Compute age differences or rates.',
            'Format console output values.'
          ]
        }
      }
    ],
    lessons: [
      {
        slug: `${slugify(skill)}-1`,
        title: `Introduction to ${skill}`,
        module_id: 'module-1',
        display_order: 1,
        estimated_minutes: 8,
        xp_reward: 25,
        concept_title: `Understanding ${skill}`,
        concept_content: `${skill} is a powerful technical capability widely implemented across the software engineering ecosystem. Mastering the foundations of this skill builds deep analytical capabilities.\n\nWe start by understanding how ${skill} processes expressions, stores values in memory, and translates inputs into logical actions.`,
        concept_highlights: [skill, 'foundations', 'processing expressions'],
        example_language: 'javascript',
        example_code: `// Initializing ${skill}\nconsole.log("Welcome to ${skill}!");`,
        example_explanation: 'This code outputs a startup string to the terminal console.',
        practice_type: 'fill-blank',
        practice_instruction: 'Print a message to the console:',
        practice_template: 'console.___("Hello");',
        practice_answer: 'log',
        summary: `You started learning ${skill}, focusing on fundamental syntax rules and writing console scripts.`,
        challenges: [
          {
            type: 'multiple-choice',
            question: `What is the primary benefit of mastering ${skill}?`,
            options: [
              'It automates all programming instantly.',
              'It provides structured problem-solving paradigms for this toolset.',
              'It makes server runtimes obsolete.',
              'It requires no study.'
            ],
            correct_index: 1,
            explanation: `Structured paradigms in ${skill} enable clean, modular, and maintainable project architectures.`
          },
          {
            type: 'fill-blank',
            question: 'Printers and loggers display output to the ___:',
            template: '___ console',
            answer: 'terminal',
            explanation: 'The terminal console is the default output sink for CLI script logging.'
          }
        ]
      }
    ]
  };
};

// @desc    Generate AI learning path
// @route   POST /api/ai/generate
const generatePath = async (req, res, next) => {
  try {
    const { skill, level, goal } = req.body;

    if (!skill || !level || !goal) {
      return res.status(400).json({ message: 'Skill, Level, and Goal parameters are required.' });
    }

    let blueprint = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`🤖 Requesting Gemini API blueprint for: ${skill}...`);
        
        const systemInstruction = 
          "You are a professional educational curriculum designer. You output high-quality technical blueprint learning paths in strict JSON format. " +
          "Do not include any conversational text, markdown formatting blocks (like ```json), or wrapping objects outside the requested JSON schema.";

        const prompt = `
Create a comprehensive technical course blueprint for learning the skill: "${skill}".
Difficulty Level: "${level}"
Learning Goal: "${goal}"

You must strictly output a single JSON object. The JSON object must contain EXACTLY the following structure and keys:
{
  "track": {
    "name": "Course Title (e.g. AI: Docker Basics)",
    "description": "Course subtitle detail",
    "color": "Vibrant HSL string, e.g. hsl(210, 90%, 50%)",
    "icon": "One word name of an SVG icon, e.g. database, code, globe, cpu, bar-chart, coffee",
    "capstone_project": {
      "title": "Comprehensive Capstone Project Title",
      "description": "Detailed capstone project scope",
      "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"]
    }
  },
  "modules": [
    {
      "id": "module-unique-id-string (e.g. intro-docker)",
      "name": "Module Title",
      "display_order": 1,
      "learning_objective": "What will students learn in this module?",
      "mini_project": {
        "title": "Module Mini-Project Title",
        "description": "Mini-project description",
        "requirements": ["Req 1", "Req 2"]
      }
    }
  ],
  "lessons": [
    {
      "slug": "unique-lesson-slug (e.g. docker-intro-1)",
      "title": "Lesson Title",
      "module_id": "Must match the module id above",
      "display_order": 1,
      "estimated_minutes": 10,
      "xp_reward": 25,
      "concept_title": "Concept Section Title",
      "concept_content": "Detailed educational text covering concepts and explanations. 2-3 paragraphs.",
      "concept_highlights": ["keyword1", "keyword2"],
      "example_language": "bash, python, javascript, html, css, dockerfile, or java",
      "example_code": "Code example snippet",
      "example_explanation": "Line-by-line explanation of the code snippet",
      "practice_type": "fill-blank",
      "practice_instruction": "Task prompt for fill-in-the-blank practice",
      "practice_template": "Code line with ___ blank, e.g. SELECT ___ FROM table",
      "practice_answer": "Value of the blank",
      "summary": "1-2 sentence lesson wrap-up summary",
      "challenges": [
        {
          "type": "multiple-choice",
          "question": "Quiz question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_index": 0,
          "explanation": "Why this answer is correct"
        },
        {
          "type": "fill-blank",
          "question": "Quiz fill-in-the-blank question",
          "template": "Code template with ___",
          "answer": "Answer value",
          "explanation": "Why this fill-in value is correct"
        }
      ]
    }
  ]
}

Enforce:
1. Generate EXACTLY 2 modules.
2. Generate EXACTLY 2 lessons per module (Total 4 lessons).
3. Generate EXACTLY 2 challenges per lesson.
4. Ensure the capstone project is comprehensive.
5. Content should be highly professional and detailed.
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
              generationConfig: {
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API returned status ${response.status}`);
        }

        const data = await response.json();
        const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        blueprint = JSON.parse(rawJsonText);
        console.log('✅ Gemini API returned valid blueprint JSON.');
      } catch (geminiError) {
        console.error('⚠️ Gemini generation failed or returned invalid JSON, falling back to mock:', geminiError.message);
        blueprint = getMockBlueprint(skill, level, goal);
      }
    } else {
      console.log('ℹ️ No GEMINI_API_KEY found. Using local mock generator...');
      blueprint = getMockBlueprint(skill, level, goal);
    }

    if (!blueprint || !blueprint.track || !blueprint.modules || !blueprint.lessons) {
      return res.status(500).json({ message: 'Failed to generate a valid course blueprint.' });
    }

    console.log('💾 Storing AI learning blueprint in Supabase database...');

    // 1. Insert Track
    const trackSlug = `${slugify(blueprint.track.name)}-${Date.now().toString().slice(-4)}`;
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .insert({
        slug: trackSlug,
        name: blueprint.track.name,
        description: blueprint.track.description,
        icon: blueprint.track.icon || 'code',
        color: blueprint.track.color || 'hsl(217, 91%, 60%)',
        display_order: 100, // Custom tracks listed at the bottom
        total_lessons: blueprint.lessons.length,
        is_ai_generated: true,
        user_id: req.user.id,
        capstone_project: blueprint.track.capstone_project || {},
      })
      .select()
      .single();

    if (trackError) throw trackError;

    // 2. Insert Modules
    const moduleMap = {}; // Maps prompt module IDs to database module primary keys
    for (const mod of blueprint.modules) {
      const dbModuleId = `${track.id}-${mod.id}`;
      const { error: modError } = await supabase
        .from('modules')
        .insert({
          id: dbModuleId,
          track_id: track.id,
          name: mod.name,
          display_order: mod.display_order,
          learning_objective: mod.learning_objective || '',
          mini_project: mod.mini_project || {},
        });

      if (modError) throw modError;
      moduleMap[mod.id] = dbModuleId;
    }

    // 3. Insert Lessons & Challenges
    for (const lessonData of blueprint.lessons) {
      const dbModuleId = moduleMap[lessonData.module_id] || `${track.id}-${lessonData.module_id}`;
      
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          slug: `${lessonData.slug}-${Date.now().toString().slice(-4)}`, // ensure unique slug
          track_id: track.id,
          module_id: dbModuleId,
          title: lessonData.title,
          display_order: lessonData.display_order,
          estimated_minutes: lessonData.estimated_minutes || 5,
          xp_reward: lessonData.xp_reward || 25,
          concept_title: lessonData.concept_title || lessonData.title,
          concept_content: lessonData.concept_content || '',
          concept_highlights: lessonData.concept_highlights || [],
          example_language: lessonData.example_language || 'javascript',
          example_code: lessonData.example_code || '',
          example_explanation: lessonData.example_explanation || '',
          practice_type: lessonData.practice_type || 'fill-blank',
          practice_instruction: lessonData.practice_instruction || '',
          practice_template: lessonData.practice_template || '',
          practice_answer: lessonData.practice_answer || '',
          summary: lessonData.summary || '',
        })
        .select()
        .single();

      if (lessonError) throw lessonError;

      // Insert challenges associated with this lesson
      if (lessonData.challenges && lessonData.challenges.length > 0) {
        for (const challengeData of lessonData.challenges) {
          const { error: challengeError } = await supabase
            .from('challenges')
            .insert({
              lesson_id: lesson.id,
              type: challengeData.type || 'multiple-choice',
              question: challengeData.question || '',
              options: challengeData.options || [],
              correct_index: challengeData.correct_index,
              template: challengeData.template,
              answer: challengeData.answer,
              explanation: challengeData.explanation || '',
              xp_reward: 10,
            });

          if (challengeError) throw challengeError;
        }
      }
    }

    console.log('✅ AI Learning Blueprint stored successfully.');

    res.status(201).json({
      message: 'Learning blueprint generated and initialized.',
      trackSlug,
    });
  } catch (error) {
    console.error('❌ AI Generation Controller error:', error.message);
    next(error);
  }
};

module.exports = { generatePath };
