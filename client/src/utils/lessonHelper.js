/**
 * lessonHelper.js
 * 
 * Enriches lesson data with structured educational components:
 * - Learning Objectives
 * - Real World Scenarios (Why it matters, Industry usage, Realistic Example)
 * - Key Terms Glossary definitions
 * - Summary & Key Takeaways points
 */

/**
 * Lightweight markdown-to-HTML parser for AI-generated lesson content.
 * Handles: ### headings, **bold**, `inline code`, - list items, --- hr
 * Safe to pass into dangerouslySetInnerHTML — no external scripts.
 */
export function parseMarkdown(text) {
  if (!text) return '';

  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

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

/**
 * Converts inline markdown tokens: **bold**, `code`
 */
function inlineMarkdown(text) {
  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:3px;padding:1px 5px;font-size:0.9em;font-family:var(--font-mono)">$1</code>');
}

// Global glossary of terms used across SQL, Python, Web Dev, AI, Data Science, and Java tracks
const GLOSSARY = {
  // SQL Terms
  'sql': 'Structured Query Language, the standard declarative language for communicating with relational database management systems.',
  'relational database': 'A database that stores data in structured tables consisting of columns and rows, representing real-world entities and relationships.',
  'query': 'A structured request sent to a database to retrieve, insert, update, or delete records.',
  'select': 'The fundamental SQL statement used to retrieve data from one or more database tables.',
  'columns': 'Individual data fields in a table, representing specific attributes of the records (e.g., email, created_at).',
  'alias': 'A temporary name assigned to a table or column in a query (using the AS keyword) to make the output headers more readable.',
  'where': 'A database clause used to filter rows based on specified logical conditions before executing aggregations or ordering.',
  'comparison operators': 'Symbols (like =, !=, >, <) used to evaluate boolean conditions on field values.',
  'logical operators': 'Keywords (like AND, OR, NOT) used to combine multiple filtering constraints in a WHERE clause.',
  'order by': 'A clause used to sort query result rows in ascending (ASC) or descending (DESC) sequence based on one or more columns.',
  'limit': 'A clause used to restrict the maximum number of rows returned by a query, essential for pagination.',
  'count': 'An aggregate function that returns the total number of records matching the query criteria.',
  'sum': 'An aggregate function that calculates the combined total of numeric values in a column.',
  'avg': 'An aggregate function that computes the arithmetic mean value of a numeric column.',
  'group by': 'A clause that clusters rows sharing identical values in specified columns into summary rows.',
  'having': 'A filtering clause applied to aggregated groups (used with GROUP BY), in contrast to WHERE which filters individual rows.',
  'inner join': 'A relational join that merges records from two tables where a matching key exists in both.',
  'left join': 'A join that retrieves all records from the left table and matching records from the right table, filling missing right fields with NULL.',
  'right join': 'A join that retrieves all records from the right table and matching records from the left table.',
  'subquery': 'A nested query statement enclosed in parentheses inside an outer query, used for multi-step filtering or calculation.',
  'cte': 'Common Table Expression. A temporary named result set defined using a WITH clause, simplifying complex query readability.',
  'index': 'A database structure that accelerates data retrieval queries on a table at the cost of slower writes and additional disk space.',

  // Python Terms
  'variable': 'A named storage location in memory that holds a data value, which can be modified during program execution.',
  'data type': 'A classification of data (such as integer, float, string, or boolean) that determines what operations can be performed on it.',
  'string': 'A sequence of characters used to represent text, enclosed in single or double quotes.',
  'boolean': 'A primitive data type having two possible values: True or False.',
  'conditional': 'Statements (like if, elif, else) that perform different computations depending on whether a boolean condition is met.',
  'loop': 'A control flow structure that repeats a block of code while a condition is True (while) or for a set sequence (for).',
  'list': 'A mutable, ordered collection of items in Python, defined using square brackets.',
  'dictionary': 'A mutable collection of key-value pairs, allowing extremely fast data lookups by key.',
  'function': 'A reusable block of organized code designed to perform a specific action, defined using the def keyword.',
  'scope': 'The region of a program where a variable is accessible (e.g., local scope inside a function vs. global scope).',
  'exception': 'An error detected during program execution that disrupts the normal flow, handled using try-except blocks.',
  'oop': 'Object-Oriented Programming. A paradigm centered around objects and classes containing data attributes and methods.',
  'class': 'A blueprint or template for creating objects, defining their initial state attributes and behavior methods.',
  'object': 'An instance of a class, possessing attributes (state) and methods (behavior).',
  'inheritance': 'A mechanism where a child class acquires the attributes and methods of a parent class, promoting code reuse.',

  // Web Dev Terms
  'semantic elements': 'HTML tags (like <header>, <main>, <article>) that describe their content meaning to browsers, search engines, and assistive devices.',
  'html5': 'The latest standard version of HyperText Markup Language, the structural standard for building web documents.',
  'css3': 'Cascading Style Sheets version 3, used to design page presentation, typography, colors, layouts, and animations.',
  'box model': 'The CSS structural system consisting of content, padding, border, and margin, defining how element sizes are calculated.',
  'flexbox': 'A one-dimensional CSS layout model designed for distributing space and aligning items inside containers.',
  'grid': 'A two-dimensional CSS layout system designed for aligning content into rows and columns.',
  'media query': 'A CSS technique used to apply styling declarations conditionally based on device width, height, or resolution.',
  'dom': 'Document Object Model. An API that represents HTML pages as a tree structure, allowing JavaScript to modify styles and nodes.',
  'event listener': 'A JavaScript method that waits for a user action (like click or submit) and runs handler code in response.',
  'async': 'Asynchronous operations that execute independently of the main program flow, preventing UI lockups during network calls.',
  'fetch': 'A browser API used to make HTTP network requests to servers to retrieve or submit API datasets.',
  'promise': 'A JavaScript object representing the eventual completion or failure of an asynchronous operations.',

  // AI Terms
  'machine learning': 'A subset of AI focused on training systems to learn patterns and make predictions from datasets without explicit coding rules.',
  'neural network': 'A machine learning architecture inspired by biological brain structures, containing layers of interconnected nodes (neurons).',
  'activation function': 'A mathematical formula in a node (like ReLU or Softmax) that decides if a neuron should fire, introducing non-linearity.',
  'supervised learning': 'Training a model on a labeled dataset, where the desired output target labels are already known.',
  'nlp': 'Natural Language Processing. A domain of AI that enables computers to understand, interpret, and generate human language.',
  'computer vision': 'A field of AI enabling systems to extract meaningful patterns from visual inputs like digital images and video frames.',
  'transformer': 'A deep learning architecture relying on self-attention mechanisms, forming the foundation of modern Large Language Models.',
  'llm': 'Large Language Model. A neural network trained on vast text corpora to predict tokens and generate highly fluent text.',
  'prompt engineering': 'The practice of structuring textual prompts to guide Large Language Models to produce desired responses.',

  // Data Science Terms
  'numpy': 'A core Python library for numerical computation, offering high-performance multi-dimensional array operations.',
  'pandas': 'A data analysis library providing DataFrames, which are tabular data structures with rows and labeled columns.',
  'dataframe': 'A two-dimensional, size-mutable tabular data structure with labeled axes (rows and columns) in Pandas.',
  'data cleaning': 'The process of identifying and correcting errors, missing values, duplicates, and formatted anomalies in datasets.',
  'correlation': 'A statistical metric measuring the degree to which two variables fluctuate together.',
  'eda': 'Exploratory Data Analysis. Analyzing datasets to summarize their main characteristics, often using visual charts.',

  // Java Terms
  'jvm': 'Java Virtual Machine. The engine that executes Java bytecode, enabling write-once-run-anywhere cross-platform execution.',
  'compiler': 'A system utility that translates source code into machine code or intermediate bytecode (like javac translating .java to .class).',
  'arraylist': 'A resizable, array-backed list implementation in Java, allowing dynamic element additions and removals.',
  'hashmap': 'A key-value dictionary structure in Java, enabling constant-time operations for lookups, insertions, and removals.',
  'interface': 'A Java reference type that defines a contract of abstract method signatures that implementing classes must fulfill.'
};

/**
 * Fallback generator when specific templates are not defined
 */
function generateFallbackEnhancement(lesson) {
  const title = lesson.title || 'Topic';

  return {
    learningObjective: [
      `Understand the core syntax and behavior of ${title}.`,
      `Learn how to apply ${title} constructs to real-world development tasks.`,
      `Debug common execution issues related to ${title} structures.`
    ],
    realWorldScenario: {
      whyItMatters: `Mastering ${title} is key to writing clean, optimized, and industry-grade solutions. It helps developers automate processes, reduce overhead, and organize system structures.`,
      industryUsage: `Tech leaders like Google, Amazon, and Netflix build their primary service nodes using these identical structural components to maintain high throughput and low system latency.`,
      realisticExample: `When building a scalable digital platform, devs use ${title} to streamline data flow and ensure that inputs are handled safely and efficiently.`
    },
    summaryPoints: [
      `Grasped the core concepts and primary functions of ${title}.`,
      `Explored working code examples and analyzed line-by-line performance.`,
      `Completed interactive code challenges to reinforce learning objectives.`
    ]
  };
}

/**
 * Main function to enrich lesson data on the client side
 */
export function getEnhancedLessonData(lesson) {
  if (!lesson) return null;

  const slug = lesson.slug || '';
  const highlights = lesson.concept?.highlights || [];
  
  // 1. Resolve Key Terms definitions
  const keyTerms = highlights.map(term => {
    const cleanTerm = term.toLowerCase().trim();
    // Find matching definition in glossary
    let definition = 'Glossary definition coming soon for this specialized term.';
    
    // Exact or partial match check
    for (const [key, val] of Object.entries(GLOSSARY)) {
      if (cleanTerm === key || cleanTerm.includes(key) || key.includes(cleanTerm)) {
        definition = val;
        break;
      }
    }
    return { term, definition };
  });

  // 2. Specific lesson data overrides
  let objective = null;
  let scenario = null;
  let summary = null;

  // Track SQL Overrides
  if (slug.startsWith('sql-')) {
    if (slug === 'sql-1-1') {
      objective = [
        'Understand the core differences between flat files and relational databases.',
        'Write basic SELECT statements to query a table.',
        'Understand how declarative language execution differs from procedural programming.'
      ];
      scenario = {
        whyItMatters: 'Relational databases store almost all online SaaS data. Instead of loading full Excel files into memory to query users, SQL lets you ask the database server to retrieve exactly what you need in milliseconds.',
        industryUsage: 'Every time you open Instagram or Spotify, backend code runs SQL SELECT statements in the background to fetch your feed posts, user profile details, or playlist tracks.',
        realisticExample: 'A customer directory exporter queries user contact details: SELECT first_name, email FROM users; this fetches only names and emails, preventing massive network overhead.'
      };
    } else if (slug.includes('sql-1-2')) {
      objective = [
        'Understand column projections and dataset mapping.',
        'Target specific columns rather than using the wildcard asterisk.',
        'Optimize memory usage and data payloads on database servers.'
      ];
      scenario = {
        whyItMatters: 'Using SELECT * pulls every single column from a table, which is a major database bottleneck. Specifying columns reduces server CPU, RAM, and network bandwidth.',
        industryUsage: 'Stripe handles millions of payments daily. When loading your payments table, Stripe queries only transaction ID, amount, and status columns, avoiding heavy metadata blocks.',
        realisticExample: 'Querying catalog items: SELECT name, price FROM products; retrieves product names and prices without loading large description strings or image blobs.'
      };
    } else if (slug.includes('sql-2-1') || slug.includes('sql-2-2')) {
      objective = [
        'Filter rows in datasets using WHERE clauses.',
        'Evaluate conditions using comparison operators.',
        'Understand how databases evaluate conditions row-by-row.'
      ];
      scenario = {
        whyItMatters: 'A database can hold hundreds of millions of records. Without row filtering, your applications would crash trying to load full tables.',
        industryUsage: 'Amazon filters active inventory. When you search for products under $50, SQL queries use WHERE price <= 50 to return only relevant products.',
        realisticExample: 'Isolating inactive accounts: SELECT * FROM users WHERE active = false; lists only deactivated accounts for archiving.'
      };
    } else if (slug.includes('join')) {
      objective = [
        'Understand table normalization and primary/foreign keys.',
        'Combine data across multiple tables using INNER and LEFT JOINS.',
        'Handle null records in joined tables gracefully.'
      ];
      scenario = {
        whyItMatters: 'Databases normalize tables to avoid repeating data (e.g. keeping users and orders separate). JOINS let you combine these tables dynamically when compiling reports.',
        industryUsage: 'Uber joins riders table, drivers table, and trips table to render your ride history summary receipts.',
        realisticExample: 'SELECT orders.id, users.first_name FROM orders INNER JOIN users ON orders.user_id = users.id; maps transaction rows to user names.'
      };
    }
  }

  // Track Python Overrides
  if (slug.startsWith('py-') || slug.startsWith('python-')) {
    if (slug.includes('1-1') || slug.includes('syntax')) {
      objective = [
        'Declare variables and assign values of various primitive data types.',
        'Perform console outputs and gather console inputs.',
        'Understand Python dynamically-typed variable assignment rules.'
      ];
      scenario = {
        whyItMatters: 'Variables act as memory placeholders. Without variables, programs could not store user responses, calculations, or session variables.',
        industryUsage: 'SaaS invoice engines store billing items in float variables and invoice rates in integers to calculate user costs.',
        realisticExample: 'A split-bill calculator takes total cost, applies tax variables, and divides it among people.'
      };
    } else if (slug.includes('loop') || slug.includes('logic')) {
      objective = [
        'Write branching conditional statements using if, elif, and else.',
        'Construct definite (for) and indefinite (while) loop structures.',
        'Implement safety boundaries to prevent infinite iteration lockups.'
      ];
      scenario = {
        whyItMatters: 'Decision logic and loops automate repetitive tasks. Computers excel at checking millions of data entries sequentially in fractions of a second.',
        industryUsage: 'Security firewalls run check-loops on IP access logs, locking out users who make more than 5 failed login attempts.',
        realisticExample: 'Prompting users for a password: while len(pwd) < 8: print("Too short") keeps repeating until input conditions are met.'
      };
    } else if (slug.includes('oop') || slug.includes('class')) {
      objective = [
        'Construct class blueprints defining constructor attributes and methods.',
        'Instantiate object items and maintain private data capsules.',
        'Implement inheritance to leverage code reuse across parent-child structures.'
      ];
      scenario = {
        whyItMatters: 'OOP groups code variables and functions into modular, self-contained objects, making codebases easier to maintain as they scale.',
        industryUsage: 'E-commerce registries define a base Product class, inheriting characteristics into DigitalProduct (downloads) and PhysicalProduct (shipping weight).',
        realisticExample: 'Creating an employee class: class Developer(Employee): which inherits salary structures and overrides specialized methods.'
      };
    }
  }

  // Web Dev Overrides
  if (slug.startsWith('web-') || slug.startsWith('webdev-')) {
    if (slug.includes('1-1') || slug.includes('semantic')) {
      objective = [
        'Structure pages using HTML5 elements like nav, main, section, and article.',
        'Improve SEO rankings and screen-reader accessibility.',
        'Maintain a clean document outlines outline tree.'
      ];
      scenario = {
        whyItMatters: 'Generic <div> layouts look identical to search indexing bots. Semantic elements tell crawlers exactly where headers, footers, and articles are.',
        industryUsage: 'Google, Wikipedia, and news blogs rely on semantic structure to index search snippets and render mobile-friendly reading layouts.',
        realisticExample: 'Building a personal resume: wrap contact information in <header>, columns in <section>, and career achievements in <article>.'
      };
    } else if (slug.includes('flexbox') || slug.includes('layout')) {
      objective = [
        'Align UI container items horizontally and vertically.',
        'Distribute flex grid items using justify-content and align-items.',
        'Manage layout spacing using gap properties instead of static margins.'
      ];
      scenario = {
        whyItMatters: 'Modern device screens range from small watches to 4K monitors. Flexbox aligns UI cards fluidly without needing absolute pixel positions.',
        industryUsage: 'SaaS navigation bars and card grids rearrange layout items automatically when a user resizes their desktop browser.',
        realisticExample: 'A navigation header containing a logo and profile link: display: flex; justify-content: space-between; separates them to edges.'
      };
    } else if (slug.includes('fetch') || slug.includes('async')) {
      objective = [
        'Execute non-blocking HTTP requests to servers using Fetch APIs.',
        'Parse response data objects into JSON payloads.',
        'Handle connection errors and render loading states.'
      ];
      scenario = {
        whyItMatters: 'Loading full pages for every minor update is slow. Async fetch requests retrieve datasets in the background, keeping the user interface fast and interactive.',
        industryUsage: 'Weather widgets, live stock charts, and Twitter feeds refresh statistics in real-time without forcing a full page reload.',
        realisticExample: 'Calling an API: fetch("/api/weather").then(res => res.json()) to load temperature statistics dynamically.'
      };
    }
  }

  // AI Overrides
  if (slug.startsWith('ai-')) {
    if (slug.includes('1-1')) {
      objective = [
        'Explain the core differences between traditional programming and machine learning.',
        'Classify ML datasets into features and prediction labels.',
        'Detect bias risks in training datasets.'
      ];
      scenario = {
        whyItMatters: 'Instead of hand-crafting thousands of complex rules, machine learning trains computers to analyze historical data and construct their own rules.',
        industryUsage: 'Spam filters learn to identify suspicious emails by analyzing millions of user spam flags, adapting to new phishing phrases dynamically.',
        realisticExample: 'Email sorting: map sender, links, and keywords as "features" to predict the "target label" (spam or not-spam).'
      };
    } else if (slug.includes('transformer') || slug.includes('prompt')) {
      objective = [
        'Understand self-attention mechanisms in deep learning structures.',
        'Formulate structured context prompts using few-shot instructions.',
        'Design delimiters to prevent instruction injection bugs.'
      ];
      scenario = {
        whyItMatters: 'Prompting is the main API interface to LLMs. Structuring prompt inputs controls model randomness and forces deterministic structured JSON outputs.',
        industryUsage: 'Enterprise AI assistants isolate user inputs inside strict XML/Markdown delimiters, preventing malicious instructions from escaping system constraints.',
        realisticExample: 'Few-shot prompting: feed the model 3 examples of sentiment analysis inputs/outputs before asking it to classify a new tweet.'
      };
    }
  }

  // Data Science Overrides
  if (slug.startsWith('ds-')) {
    if (slug.includes('pandas') || slug.includes('dataframe')) {
      objective = [
        'Import comma-separated files into active Pandas DataFrames.',
        'Filter DataFrame columns and sort row statistics.',
        'Calculate dataset dimensions and identify missing records.'
      ];
      scenario = {
        whyItMatters: 'Data science begins with structured datasets. Pandas loads, indexes, and queries CSV logs with blazing speed using optimized C extensions.',
        industryUsage: 'Data analysts at Spotify load user listens history to search for correlations, calculate play counts, and build recommendations.',
        realisticExample: 'Loading user logs: df = pd.read_csv("users.csv") and isolating active accounts using filters.'
      };
    }
  }

  // Fallback generation if fields are empty
  const fallback = generateFallbackEnhancement(lesson);
  
  return {
    learningObjective: objective || fallback.learningObjective,
    realWorldScenario: scenario || fallback.realWorldScenario,
    summaryPoints: summary || (lesson.summary ? lesson.summary.split('\n').filter(Boolean) : fallback.summaryPoints),
    keyTerms
  };
}
