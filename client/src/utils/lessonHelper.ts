import { Lesson } from '../types/Lesson';

export interface EnhancedLessonData {
  learningObjective: string[];
  whyMatters: string;
  realWorldScenario: string;
  visualExplanation: {
    type: 'comparison' | 'diagram' | 'table';
    title: string;
    headers?: string[];
    rows?: string[][];
    cards?: { title: string; description: string }[];
    nodes?: { id: string; label: string; connections?: string[] }[];
  };
  codeWalkthrough: {
    code: string;
    explanation: string;
    annotations: { line: number; text: string }[];
  };
  keyTakeaways: {
    bullet_points: string[];
    common_mistakes: string[];
    quick_revision: string;
  };
  flashcards: { front: string; back: string }[];
  keyTerms: { term: string; definition: string }[];
}

/**
 * Lightweight markdown-to-HTML parser for AI-generated lesson content.
 */
export function parseMarkdown(text: string | undefined | null): string {
  if (!text) return '';

  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings
    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h4 style="font-size:var(--text-base);font-weight:var(--font-semibold);margin:var(--space-4) 0 var(--space-2);color:var(--text-primary)">${inlineMarkdown(line.slice(4))}</h4>`;
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3 style="font-size:var(--text-lg);font-weight:var(--font-semibold);margin:var(--space-4) 0 var(--space-2);color:var(--text-primary)">${inlineMarkdown(line.slice(3))}</h3>`;
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2 style="font-size:var(--text-xl);font-weight:var(--font-bold);margin:var(--space-4) 0 var(--space-2);color:var(--text-primary)">${inlineMarkdown(line.slice(2))}</h2>`;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<hr style="border:none;border-top:1px solid var(--border);margin:var(--space-4) 0"/>';
      continue;
    }

    // List items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { html += '<ul style="padding-left:var(--space-5);margin:var(--space-2) 0">'; inList = true; }
      html += `<li style="margin-bottom:var(--space-1)">${inlineMarkdown(line.slice(2))}</li>`;
      continue;
    }

    // End of list on blank line
    if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<br/>';
      continue;
    }

    // Regular paragraph line
    if (inList) { html += '</ul>'; inList = false; }
    html += `<p style="margin-bottom:var(--space-3)">${inlineMarkdown(line)}</p>`;
  }

  if (inList) html += '</ul>';
  return html;
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:3px;padding:1px 5px;font-size:0.9em;font-family:var(--font-mono)">$1</code>');
}

const GLOSSARY: Record<string, string> = {
  'sql': 'Structured Query Language, the standard declarative language for communicating with relational databases.',
  'relational database': 'A database that stores data in structured tables consisting of columns and rows.',
  'query': 'A structured request sent to a database to retrieve, insert, update, or delete records.',
  'select': 'The fundamental SQL statement used to retrieve data from database tables.',
  'variable': 'A named storage location in memory that holds a data value.',
  'data type': 'A classification of data (such as integer, string, or boolean) that determines what operations can be performed on it.',
  'function': 'A reusable block of code designed to perform a specific action.',
  'oop': 'Object-Oriented Programming, a paradigm centered around objects and classes.',
  'flexbox': 'A one-dimensional CSS layout model designed for distributing space and aligning items inside containers.',
  'grid': 'A two-dimensional CSS layout system designed for aligning content into rows and columns.',
  'neural network': 'A machine learning architecture inspired by biological brain structures, containing layers of nodes.'
};

export function getEnhancedLessonData(lesson: Lesson | undefined | null): EnhancedLessonData | null {
  if (!lesson) return null;

  const highlights = lesson.concept?.highlights || lesson.concept_highlights || [];
  const keyTerms = highlights.map((term: string) => {
    const cleanTerm = term.toLowerCase().trim();
    let definition = 'Glossary definition coming soon for this specialized term.';
    for (const [key, val] of Object.entries(GLOSSARY)) {
      if (cleanTerm === key || cleanTerm.includes(key) || key.includes(cleanTerm)) {
        definition = val;
        break;
      }
    }
    return { term, definition };
  });

  // 1. Objective fallback
  const learningObjective = lesson.learning_objective
    ? (Array.isArray(lesson.learning_objective) ? lesson.learning_objective : [lesson.learning_objective])
    : [
        `Understand the core syntax and behavior of ${lesson.title || 'this topic'}.`,
        `Learn how to apply these constructs to real-world development tasks.`,
        `Debug common execution issues related to these structures.`
      ];

  // 2. Why matters & Real world fallbacks
  const whyMatters = lesson.why_matters || 'Mastering this topic is key to writing clean, optimized, and industry-grade solutions. It helps developers automate processes, reduce overhead, and organize system structures.';
  const realWorldScenario = lesson.real_world_scenario || 'Tech leaders like Google, Amazon, and Netflix build their primary service nodes using these identical structural components to maintain high throughput and low system latency.';

  // 3. Visual explanation fallback
  const visualExplanation = lesson.visual_explanation || {
    type: 'comparison',
    title: `Core Paradigms of ${lesson.title || 'this topic'}`,
    cards: [
      { title: 'Standard Flow', description: 'Sequential computation, easy to debug and read but operates synchronously.' },
      { title: 'Optimized Flow', description: 'Leverages memory buffering and caching to execute operations at scale.' }
    ]
  };

  // 4. Code walkthrough fallback
  const codeWalkthrough = lesson.code_walkthrough || {
    code: lesson.example_code || '// Core implementation sample',
    explanation: lesson.example_explanation || 'Demonstrates syntax syntax details.',
    annotations: [
      { line: 1, text: 'Initial setup and logic definition for this concept.' }
    ]
  };

  // 5. Key Takeaways fallback
  const keyTakeaways = lesson.key_takeaways || {
    bullet_points: [
      'Grasped the core concepts and primary functions.',
      'Explored working code examples and analyzed line-by-line performance.'
    ],
    common_mistakes: [
      'Scope violations and parameter mismatch errors.',
      'Missing edge-case validation checks.'
    ],
    quick_revision: 'Syntax is evaluated sequentially; always double-check bounds and logic limits.'
  };

  // 6. Flashcards fallback
  const flashcards = lesson.flashcards || [
    { front: `What is the primary purpose of ${lesson.title || 'this topic'}?`, back: 'To optimize resource allocation and ensure modularity.' },
    { front: `What is a common pitfall when using ${lesson.title || 'this topic'}?`, back: 'Ignoring boundary checks and referencing out-of-scope variables.' }
  ];

  return {
    learningObjective,
    whyMatters,
    realWorldScenario,
    visualExplanation,
    codeWalkthrough,
    keyTakeaways,
    flashcards,
    keyTerms
  };
}
