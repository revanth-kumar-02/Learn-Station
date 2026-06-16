/**
 * Learn Station — Full Curriculum Definition Data
 * Contains 6 tracks, 36 modules, 144 lessons, and 288 challenges.
 * 
 * Each track has exactly 6 modules.
 * Each module has exactly 4 lessons.
 * Each lesson has exactly 2 quiz challenges (multiple choice or fill blank).
 */

const tracksMeta = [
  {
    slug: 'sql',
    name: 'SQL',
    description: 'Master relational database querying, grouping, data joining, CTEs, and performance tuning from scratch.',
    icon: 'database',
    color: 'hsl(199, 89%, 48%)',
    order: 1,
    capstone: {
      title: 'SaaS Multi-Tenant Database System',
      description: 'Design and query a relational schema supporting multiple SaaS clients, order analytics, customer churn indicators, and product metrics.',
      requirements: [
        'Write SELECT statements with INNER, LEFT, and self JOINS to build a dashboard overview.',
        'Use GROUP BY, HAVING, and aggregate window functions to calculate average revenue per account.',
        'Implement Common Table Expressions (CTEs) to isolate active subscribers and flag accounts with zero orders.',
        'Write indexes on tenant and order IDs, and analyze the query execution plan for performance bottlenecks.'
      ]
    },
    modules: [
      {
        id: 'sql-m1',
        name: 'Database Foundations & SELECT',
        order: 1,
        learning_objective: 'Understand relational databases, tables, and standard SELECT syntax.',
        mini_project: {
          title: 'Customer Directory Exporter',
          description: 'Extract and format a list of active platform users for marketing campaigns.',
          requirements: [
            'Retrieve active user names and contact details.',
            'Handle null contact information gracefully.',
            'Format column aliases for cleaner CSV reporting.'
          ]
        }
      },
      {
        id: 'sql-m2',
        name: 'Filtering & Sorting Data',
        order: 2,
        learning_objective: 'Filter rows with WHERE and sort results with ORDER BY and LIMIT.',
        mini_project: {
          title: 'E-Commerce Catalog Search',
          description: 'Build backend query logic to filter and paginate high-value products.',
          requirements: [
            'Filter catalog rows by price thresholds and categories.',
            'Sort results by descending price to highlight premium options.',
            'Limit output size to support page pagination.'
          ]
        }
      },
      {
        id: 'sql-m3',
        name: 'Aggregations & Summary Reports',
        order: 3,
        learning_objective: 'Summarize dataset statistics using GROUP BY and aggregate functions.',
        mini_project: {
          title: 'Sales Dashboard Reporter',
          description: 'Compile monthly transaction summaries, average order values, and category volumes.',
          requirements: [
            'Calculate sum, averages, and transaction counts per department.',
            'Filter out low-volume departments using HAVING.',
            'Handle transaction currencies and round statistics to 2 decimal places.'
          ]
        }
      },
      {
        id: 'sql-m4',
        name: 'Relational Joins',
        order: 4,
        learning_objective: 'Combine multiple related tables using INNER, LEFT, and OUTER JOINS.',
        mini_project: {
          title: 'User Purchase Auditor',
          description: 'Perform an audit matching order totals, payment logs, and user profile data.',
          requirements: [
            'INNER JOIN users and orders to identify purchasing accounts.',
            'LEFT JOIN orders to include users with no purchase history.',
            'Handle null fields with default fallbacks.'
          ]
        }
      },
      {
        id: 'sql-m5',
        name: 'CTEs & Subqueries',
        order: 5,
        learning_objective: 'Isolate query logic using nested queries and Common Table Expressions (CTEs).',
        mini_project: {
          title: 'High-Value Customer Analyzer',
          description: 'Isolate accounts spending above the average user threshold.',
          requirements: [
            'Calculate average customer spend using a subquery.',
            'Structure modular query workflows using WITH clauses (CTEs).',
            'Compute user purchase rank comparisons.'
          ]
        }
      },
      {
        id: 'sql-m6',
        name: 'Database Constraints & Indexing',
        order: 6,
        learning_objective: 'Understand primary keys, constraints, and indexes for fast queries.',
        mini_project: {
          title: 'Database Design Schematizer',
          description: 'Generate tables with foreign key constraints and create query performance indexes.',
          requirements: [
            'Create primary, foreign key, and unique constraints.',
            'Build composite indexes on frequently searched columns.',
            'Analyze index performance improvement margins.'
          ]
        }
      }
    ]
  },
  {
    slug: 'python',
    name: 'Python',
    description: 'Learn Python programming, control structures, data collections, file pipelines, and OOP.',
    icon: 'code',
    color: 'hsl(52, 80%, 50%)',
    order: 2,
    capstone: {
      title: 'Command-Line Inventory System',
      description: 'Build a modular, object-oriented inventory system with data storage capability, custom exceptions, and transaction logging.',
      requirements: [
        'Implement a Product class containing attributes, constructors, and getters/setters.',
        'Store inventory lists in memory using dictionaries, and save to a local text file.',
        'Raise custom OutOfStockException rules when orders exceed availability.',
        'Use try-except blocks to validate input entries and log transactions to a text file.'
      ]
    },
    modules: [
      {
        id: 'py-m1',
        name: 'Python Syntax & Variables',
        order: 1,
        learning_objective: 'Master variables, data types, console logging, and user inputs.',
        mini_project: {
          title: 'SaaS Tip & Invoice Calculator',
          description: 'Build a script to parse billing parameters and divide totals among users.',
          requirements: [
            'Parse float values from user invoice inputs.',
            'Perform arithmetic operations to add tax percentages.',
            'Print formatted output values using f-strings.'
          ]
        }
      },
      {
        id: 'py-m2',
        name: 'Logic & Loops',
        order: 2,
        learning_objective: 'Implement decisions with conditional blocks and iterate using loops.',
        mini_project: {
          title: 'Password Security Verifier',
          description: 'Evaluate compliance criteria for user password inputs.',
          requirements: [
            'Verify length and character inclusion using conditional criteria.',
            'Loop prompts until password parameters are satisfied.',
            'Implement iteration boundary limits.'
          ]
        }
      },
      {
        id: 'py-m3',
        name: 'Collections & Lists',
        order: 3,
        learning_objective: 'Manage group data structures using lists, tuples, sets, and dictionaries.',
        mini_project: {
          title: 'Interactive Student Gradebook',
          description: 'Store students, subject lists, and compile class statistics.',
          requirements: [
            'Store entries in nested dictionary objects.',
            'Perform list comprehension calculations.',
            'Calculate averages and track high scores.'
          ]
        }
      },
      {
        id: 'py-m4',
        name: 'Functions & Scope',
        order: 4,
        learning_objective: 'Write modular, reusable functions and manage variable scope.',
        mini_project: {
          title: 'Unit Temperature Converter',
          description: 'Design modular functions to convert temperature metrics.',
          requirements: [
            'Implement named parameter defaults.',
            'Ensure global variables are isolated from local functions.',
            'Import helper modules to compile reports.'
          ]
        }
      },
      {
        id: 'py-m5',
        name: 'Files & Exceptions',
        order: 5,
        learning_objective: 'Read/write system files and handle execution errors safely.',
        mini_project: {
          title: 'Server Access Log Auditor',
          description: 'Read a server log file, count error statuses, and write anomalies to a CSV report.',
          requirements: [
            'Open files safely using with open context managers.',
            'Catch conversion exceptions and prevent runtime crashes.',
            'Write clean status reports to disk.'
          ]
        }
      },
      {
        id: 'py-m6',
        name: 'Object-Oriented Programming',
        order: 6,
        learning_objective: 'Build reusable class architectures, handle inheritance and polymorphism.',
        mini_project: {
          title: 'E-Commerce Product Registry',
          description: 'Design a base product class and derive specific digital and physical product classes.',
          requirements: [
            'Define constructor attributes and custom instance methods.',
            'Implement inheritance to reuse pricing logic.',
            'Override printing outputs using __str__ methods.'
          ]
        }
      }
    ]
  },
  {
    slug: 'webdev',
    name: 'Web Development',
    description: 'Build responsive websites using semantic HTML, CSS layouts, media queries, flexbox, and JS DOM manipulation.',
    icon: 'globe',
    color: 'hsl(14, 85%, 55%)',
    order: 3,
    capstone: {
      title: 'Interactive E-Commerce Interface',
      description: 'Create a responsive storefront interface featuring product sorting, a dynamic shopping cart, and mock payment submission.',
      requirements: [
        'Structure pages using HTML5 elements like nav, main, section, and article.',
        'Align items using CSS Flexbox for navigation headers and CSS Grid for product display boards.',
        'Use CSS Media Queries to adapt the columns layout from mobile to desktop sizes.',
        'Write JS scripts to handle click events, update shopping cart counts, and fetch products from a mock API.'
      ]
    },
    modules: [
      {
        id: 'web-m1',
        name: 'HTML5 Semantic Structure',
        order: 1,
        learning_objective: 'Structure content using semantic elements, lists, headers, and links.',
        mini_project: {
          title: 'Professional Resume Page',
          description: 'Build a semantic personal resume document showing skills and experience.',
          requirements: [
            'Use headers, sections, articles, and navigation links.',
            'Embed profile images and list skills.',
            'Ensure anchors use targets for safety.'
          ]
        }
      },
      {
        id: 'web-m2',
        name: 'CSS3 Core Styling',
        order: 2,
        learning_objective: 'Apply visual style declarations, color codes, border model padding, and typography.',
        mini_project: {
          title: 'Article Post Layout',
          description: 'Apply modern typography, margins, padding, and drop-shadows to a blog article layout.',
          requirements: [
            'Select elements using class and child selectors.',
            'Manage element spacing via the Box Model.',
            'Set Google Font styles.'
          ]
        }
      },
      {
        id: 'web-m3',
        name: 'Flexbox Layouts',
        order: 3,
        learning_objective: 'Arrange page layouts using flex containers, alignment, and gaps.',
        mini_project: {
          title: 'Responsive Flex Navigation Header',
          description: 'Design a top navigation bar that aligns links and adjusts on header resizes.',
          requirements: [
            'Align items horizontally and center them vertically.',
            'Use justify-content to space logos and link menus.',
            'Configure item gaps.'
          ]
        }
      },
      {
        id: 'web-m4',
        name: 'Responsive CSS Grid & Design',
        order: 4,
        learning_objective: 'Build fluid grids using CSS Grid and Media Queries.',
        mini_project: {
          title: 'Responsive Portfolio Grid',
          description: 'Build a web portfolio grid displaying project cards that adjust columns based on viewport.',
          requirements: [
            'Configure grids using grid-template-columns.',
            'Apply media queries for mobile, tablet, and desktop breakpoints.',
            'Design overlay transitions.'
          ]
        }
      },
      {
        id: 'web-m5',
        name: 'JavaScript DOM API',
        order: 5,
        learning_objective: 'Query documents and respond to event interactions.',
        mini_project: {
          title: 'Interactive To-Do list App',
          description: 'Write script handlers to add task items and toggle completed statuses.',
          requirements: [
            'Capture input entries from input fields.',
            'Create list elements dynamically.',
            'Listen to form submissions.'
          ]
        }
      },
      {
        id: 'web-m6',
        name: 'Asynchronous JavaScript & Fetch',
        order: 6,
        learning_objective: 'Query servers and display API datasets dynamically.',
        mini_project: {
          title: 'Weather Indicator Widget',
          description: 'Fetch real-time weather details and render them inside a custom dashboard.',
          requirements: [
            'Call endpoints using fetch APIs.',
            'Parse response datasets into JSON.',
            'Handle lookup errors.'
          ]
        }
      }
    ]
  },
  {
    slug: 'ai',
    name: 'AI Fundamentals',
    description: 'Explore neural networks, computer vision, natural language processing, Transformers, and LLM prompting.',
    icon: 'cpu',
    color: 'hsl(262, 83%, 58%)',
    order: 4,
    capstone: {
      title: 'Customer Intent Classifier System',
      description: 'Deconstruct a machine learning pipeline from raw dataset text embedding, through classification, to prompting refinement.',
      requirements: [
        'Define data preparation pipelines separating features from prediction labels.',
        'Implement neural network structures defining input, hidden, and output parameters.',
        'Utilize basic text processing to clean user prompts prior to intent matching.',
        'Construct prompt context schemas using context delimiters and few-shot instructions.'
      ]
    },
    modules: [
      {
        id: 'ai-m1',
        name: 'Introduction to AI & ML',
        order: 1,
        learning_objective: 'Understand AI history, machine learning types, and basic ethics.',
        mini_project: {
          title: 'Email Spam Intent Parser',
          description: 'Outline the data requirements and feature structures to train a spam model.',
          requirements: [
            'Differentiate between features and target labels.',
            'Identify training and validation data subsets.',
            'Flag indicators of label bias.'
          ]
        }
      },
      {
        id: 'ai-m2',
        name: 'Machine Learning Core',
        order: 2,
        learning_objective: 'Build models for linear regression, classifications, and decision trees.',
        mini_project: {
          title: 'Real Estate Price Predictor',
          description: 'Deconstruct data regressions to predict valuations based on square footage.',
          requirements: [
            'Define linear model coefficients.',
            'Evaluate mean squared error anomalies.',
            'Outline feature dependencies.'
          ]
        }
      },
      {
        id: 'ai-m3',
        name: 'Deep Neural Networks',
        order: 3,
        learning_objective: 'Understand layers, neurons, activation functions, and backpropagation.',
        mini_project: {
          title: 'Digit Classifier Blueprint',
          description: 'Structure neural layers to recognize handwritten digits.',
          requirements: [
            'Define hidden node network configurations.',
            'Apply Softmax activation formulas to classify outputs.',
            'Explain weights adjustments.'
          ]
        }
      },
      {
        id: 'ai-m4',
        name: 'Computer Vision Basics',
        order: 4,
        learning_objective: 'Process image structures, convolutions, and object detectors.',
        mini_project: {
          title: 'Visual Security Pipeline',
          description: 'Design filters to extract edges and shapes from surveillance frame inputs.',
          requirements: [
            'Explain spatial convolution kernels.',
            'Configure max-pooling size thresholds.',
            'Isolate object bounding borders.'
          ]
        }
      },
      {
        id: 'ai-m5',
        name: 'Natural Language Processing',
        order: 5,
        learning_objective: 'Deconstruct text embeddings, RNNs, and attention layers.',
        mini_project: {
          title: 'Brand Sentiment Aggregator',
          description: 'Structure pipelines mapping customer tweets to numerical sentiment indicators.',
          requirements: [
            'Preprocess logs removing stop words and punctuation.',
            'Map words to multi-dimensional vector points.',
            'Calculate vocabulary tokens.'
          ]
        }
      },
      {
        id: 'ai-m6',
        name: 'Transformers & Prompt Engineering',
        order: 6,
        learning_objective: 'Understand Large Language Models, attention formulas, and prompting frameworks.',
        mini_project: {
          title: 'Few-Shot Text Summarizer',
          description: 'Author LLM prompts that condense corporate text using structured guidelines.',
          requirements: [
            'Use delimiters to isolate target summaries.',
            'Embed examples showing expected formats.',
            'Configure system instructions.'
          ]
        }
      }
    ]
  },
  {
    slug: 'datascience',
    name: 'Data Science',
    description: 'Learn data analysis, NumPy statistics, Pandas tabular wrangling, plotting, and descriptive analytics.',
    icon: 'bar-chart',
    color: 'hsl(142, 71%, 45%)',
    order: 5,
    capstone: {
      title: 'Telecom Customer Churn Profiler',
      description: 'Analyze user behavior logs using Pandas, plot correlation heatmaps, clean missing fields, and build a churn prediction model.',
      requirements: [
        'Import billing, support, and usage files into unified Pandas DataFrames.',
        'Clean null entries and encode categorical boolean flags.',
        'Plot statistics identifying average support calls for churned vs. active accounts.',
        'Train a predictive classification model using Scikit-Learn to tag high-risk user profiles.'
      ]
    },
    modules: [
      {
        id: 'ds-m1',
        name: 'Data Lifecycles & NumPy',
        order: 1,
        learning_objective: 'Understand data analytics pipelines and numerical arrays.',
        mini_project: {
          title: 'Company Salary Statistics',
          description: 'Implement array operations to aggregate employee salary listings.',
          requirements: [
            'Instantiate data arrays.',
            'Calculate statistical averages, medians, and deviations.',
            'Apply vector scalar percentage increases.'
          ]
        }
      },
      {
        id: 'ds-m2',
        name: 'Pandas DataFrames',
        order: 2,
        learning_objective: 'Read structured CSV files, filter columns, and sort DataFrame contents.',
        mini_project: {
          title: 'User Activity Logger',
          description: 'Import user activity logs and isolate active metrics.',
          requirements: [
            'Load CSV columns.',
            'Inspect column types and verify row counts.',
            'Isolate high-activity rows.'
          ]
        }
      },
      {
        id: 'ds-m3',
        name: 'Data Wrangling & Cleaning',
        order: 3,
        learning_objective: 'Format type casts, clean null values, and merge database tables.',
        mini_project: {
          title: 'Inventory Data Integrator',
          description: 'Combine incomplete product stock listings with current pricing lists.',
          requirements: [
            'Clean string anomalies and replace null records.',
            'Merge tabular lists using key IDs.',
            'Re-index DataFrames.'
          ]
        }
      },
      {
        id: 'ds-m4',
        name: 'Data Visualization & Charts',
        order: 4,
        learning_objective: 'Generate scatter plots, bar charts, and customize visual axes.',
        mini_project: {
          title: 'Company Stock Chart',
          description: 'Plot daily closing prices and add moving average lines.',
          requirements: [
            'Create line plots with customized colors.',
            'Label titles, axes, and legends.',
            'Draw grid backgrounds.'
          ]
        }
      },
      {
        id: 'ds-m5',
        name: 'Exploratory Data Analysis',
        order: 5,
        learning_objective: 'Detect correlations, handle outliers, and perform feature engineering.',
        mini_project: {
          title: 'E-Commerce Churn Profiler',
          description: 'Discover transaction volume variations that correlate with customer churn.',
          requirements: [
            'Compute correlation matrices.',
            'Identify outliers using box-plots.',
            'Format feature buckets.'
          ]
        }
      },
      {
        id: 'ds-m6',
        name: 'Predictive Modeling Core',
        order: 6,
        learning_objective: 'Configure data scaling, split test subsets, and execute simple regressions.',
        mini_project: {
          title: 'Ad Conversion Estimator',
          description: 'Split sales campaign histories to train simple forecasting models.',
          requirements: [
            'Isolate features from label fields.',
            'Configure training and test splits.',
            'Evaluate prediction scores.'
          ]
        }
      }
    ]
  },
  {
    slug: 'java',
    name: 'Java',
    description: 'Learn modern Java programming, control flow loops, arrays, methods, encapsulation, inheritance, collections, and exceptions.',
    icon: 'coffee',
    color: 'hsl(346, 77%, 50%)',
    order: 6,
    capstone: {
      title: 'School Enrollment Database App',
      description: 'Build a terminal console app using Java classes, object inheritance, exception handling, and ArrayList collections to manage enrollments.',
      requirements: [
        'Design a Person base class and derive Student and Teacher subclasses.',
        'Implement an enrollment registry system storing active listings inside ArrayList structures.',
        'Write interface protocols defining enrollment rules and course completions.',
        'Handle runtime arguments and catch bounds exceptions if class registrations overflow limit values.'
      ]
    },
    modules: [
      {
        id: 'java-m1',
        name: 'Java Syntax & JVM',
        order: 1,
        learning_objective: 'Understand compilation pathways, variables, primitive types, and statements.',
        mini_project: {
          title: 'Server Temp Converter',
          description: 'Write a basic console utility to cast input temperature readings.',
          requirements: [
            'Declare variable types explicitly.',
            'Cast input metrics.',
            'Output results to the console.'
          ]
        }
      },
      {
        id: 'java-m2',
        name: 'Decisions & Loops',
        order: 2,
        learning_objective: 'Implement branching choices and repeat operations via loops.',
        mini_project: {
          title: 'Interactive ATM Simulator',
          description: 'Evaluate menu options and loop transactions until an exit is chosen.',
          requirements: [
            'Evaluate balance requirements using switch statements.',
            'Loop menus using do-while loops.',
            'Apply bounds checks.'
          ]
        }
      },
      {
        id: 'java-m3',
        name: 'Methods & Arrays',
        order: 3,
        learning_objective: 'Declare function methods, return types, parameters, and array grids.',
        mini_project: {
          title: 'Company Payroll Array',
          description: 'Iterate over salary lists to calculate total payroll expenditures.',
          requirements: [
            'Instantiate static employee arrays.',
            'Write calculation methods.',
            'Pass arguments securely.'
          ]
        }
      },
      {
        id: 'java-m4',
        name: 'OOP Foundations',
        order: 4,
        learning_objective: 'Build classes, instances, define constructors, and encapsulate properties.',
        mini_project: {
          title: 'Employee Ledger System',
          description: 'Design Employee entities, hide fields behind getters/setters, and instantiate items.',
          requirements: [
            'Declare private attributes.',
            'Create parameterized constructor blocks.',
            'Expose access via getters/setters.'
          ]
        }
      },
      {
        id: 'java-m5',
        name: 'OOP Inheritance & Interfaces',
        order: 5,
        learning_objective: 'Build class hierarchies, override methods, and configure interfaces.',
        mini_project: {
          title: 'Corporate Billing System',
          description: 'Inherit contract and full-time employee roles from a base personnel class.',
          requirements: [
            'Inherit base class constructors using super.',
            'Override salary calculations.',
            'Implement payment interfaces.'
          ]
        }
      },
      {
        id: 'java-m6',
        name: 'Java Collections & Exception Handling',
        order: 6,
        learning_objective: 'Organize data using Lists/Maps and handle runtime anomalies using try-catch.',
        mini_project: {
          title: 'Corporate Contact Directory',
          description: 'Manage employee record lists inside an ArrayList, catching search bounds errors.',
          requirements: [
            'Manage entities inside ArrayList lists.',
            'Throw exceptions for invalid search parameters.',
            'Wrap search logic in try-catch-finally.'
          ]
        }
      }
    ]
  }
];

// --- 144 LESSON SPECIFICATIONS & CHANNELS ---
const lessonsSpecs = {
  // --- SQL (24 lessons) ---
  'sql': [
    { slug: 'sql-1-1', title: 'What is SQL?', exampleLanguage: 'sql', exampleCode: 'SELECT first_name, email\nFROM users;', exampleExplanation: 'Extracts name and email columns from the users table. Relational databases structure records into tables, and SQL is the declarative query tool.', practiceInstruction: 'Select all columns from the products table.', practiceTemplate: 'SELECT ___ FROM products;', practiceAnswer: '*', challenges: [
      { type: 'multiple-choice', question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Queue List', 'System Query Logic', 'Standard Queue Layout'], correctIndex: 0, explanation: 'SQL stands for Structured Query Language, the ANSI standard language for managing relational databases.' },
      { type: 'fill-blank', question: 'Complete the statement to query all fields:', template: 'SELECT ___ FROM users;', answer: '*', explanation: 'The asterisk (*) wildcard character represents all columns in SQL.' }
    ] },
    { slug: 'sql-1-2', title: 'Understanding Columns', exampleLanguage: 'sql', exampleCode: 'SELECT name, price\nFROM products;', exampleExplanation: 'Retrieves specific attributes instead of all columns. This optimizes database throughput and client payload sizes.', practiceInstruction: 'Query only the first_name column from the users table.', practiceTemplate: 'SELECT ___ FROM users;', practiceAnswer: 'first_name', challenges: [
      { type: 'multiple-choice', question: 'Why should you select specific columns instead of using * in production?', options: ['It speeds up queries and reduces network payload sizes', 'It deletes unused columns', 'It is required by SQL syntax rules', 'It prevents data corruption'], correctIndex: 0, explanation: 'Selecting only needed columns minimizes database and network overhead.' },
      { type: 'fill-blank', question: 'Query price column from products:', template: 'SELECT ___ FROM products;', answer: 'price', explanation: 'Specify the price column directly after SELECT.' }
    ] },
    { slug: 'sql-1-3', title: 'Using Aliases', exampleLanguage: 'sql', exampleCode: 'SELECT first_name AS name\nFROM users;', exampleExplanation: 'Aliases allow renaming columns in the output result grid. This helps format reports or interface keys.', practiceInstruction: 'Alias the price column as cost from products:', practiceTemplate: 'SELECT price AS ___ FROM products;', practiceAnswer: 'cost', challenges: [
      { type: 'multiple-choice', question: 'Which keyword creates column aliases?', options: ['LIKE', 'ALIAS', 'AS', 'RENAME'], correctIndex: 2, explanation: 'The AS keyword designates a temporary column alias.' },
      { type: 'fill-blank', question: 'Create alias username for first_name:', template: 'SELECT first_name ___ username FROM users;', answer: 'AS', explanation: 'Use the AS keyword to rename first_name to username.' }
    ] },
    { slug: 'sql-1-4', title: 'Literal SELECTs', exampleLanguage: 'sql', exampleCode: "SELECT 'Learn Station' AS site_name;", exampleExplanation: 'Retrieves static scalar values directly without referencing a database table, useful for testing query environments.', practiceInstruction: 'Perform a math calculation in SELECT:', practiceTemplate: 'SELECT 50 + ___ AS total;', practiceAnswer: '50', challenges: [
      { type: 'multiple-choice', question: 'Can you run a SELECT query without a FROM clause in standard SQL?', options: ['Yes, for scalar expressions or calculations', 'No, FROM is always mandatory', 'Only if the table is empty', 'Only on Postgres databases'], correctIndex: 0, explanation: 'Most relational engines allow SELECTing static values, expressions, or function results without a table.' },
      { type: 'fill-blank', question: 'Evaluate 100 as value:', template: 'SELECT ___ AS value;', answer: '100', explanation: 'SELECT 100 returns a row containing 100.' }
    ] },
    { slug: 'sql-2-1', title: 'Filtering with WHERE', exampleLanguage: 'sql', exampleCode: "SELECT * FROM users\nWHERE active = true;", exampleExplanation: 'Restricts the returned records to rows matching a condition. WHERE clauses evaluate boolean conditions per row.', practiceInstruction: 'Filter users where active is false:', practiceTemplate: 'SELECT * FROM users WHERE active = ___;', practiceAnswer: 'false', challenges: [
      { type: 'multiple-choice', question: 'What is the purpose of the WHERE clause?', options: ['To sort output rows', 'To filter records based on condition', 'To merge separate tables', 'To group identical records'], correctIndex: 1, explanation: 'The WHERE clause restricts rows based on a boolean condition.' },
      { type: 'fill-blank', question: 'Filter users by age equals 30:', template: 'SELECT * FROM users WHERE age = ___;', answer: '30', explanation: 'Compare numerical age with 30.' }
    ] },
    { slug: 'sql-2-2', title: 'Comparison Operators', exampleLanguage: 'sql', exampleCode: 'SELECT * FROM products\nWHERE price > 100;', exampleExplanation: 'Filters rows using operators like =, !=, >, <, >=, and <=. Compares numeric values directly.', practiceInstruction: 'Find products priced below 50.', practiceTemplate: 'SELECT * FROM products WHERE price ___ 50;', practiceAnswer: '<', challenges: [
      { type: 'multiple-choice', question: 'Which operator checks for inequality (not equal)?', options: ['!=', '=', '><', 'NOT'], correctIndex: 0, explanation: '!= (and sometimes <>) represents the not-equal operator.' },
      { type: 'fill-blank', question: 'Filter products with prices greater than 500:', template: 'SELECT * FROM products WHERE price ___ 500;', answer: '>', explanation: 'Use the greater than operator (>).' }
    ] },
    { slug: 'sql-2-3', title: 'Logical AND/OR', exampleLanguage: 'sql', exampleCode: "SELECT * FROM products\nWHERE price > 50\n  AND category = 'electronics';", exampleExplanation: 'Combines multiple constraints. AND requires all conditions to be true, while OR requires at least one to match.', practiceInstruction: 'Filter products in categories of electronics or books:', practiceTemplate: "SELECT * FROM products WHERE category = 'electronics' ___ category = 'books';", practiceAnswer: 'OR', challenges: [
      { type: 'multiple-choice', question: 'If condition A is True and condition B is False, what does (A AND B) evaluate to?', options: ['True', 'False', 'Null', 'Undefined'], correctIndex: 1, explanation: 'AND requires both inputs to be True to return True.' },
      { type: 'fill-blank', question: 'Match electronics with price below 100:', template: "SELECT * FROM products WHERE category = 'electronics' ___ price < 100;", answer: 'AND', explanation: 'Both conditions must be met, requiring the AND operator.' }
    ] },
    { slug: 'sql-2-4', title: 'Sorting & Limiting', exampleLanguage: 'sql', exampleCode: 'SELECT * FROM products\nORDER BY price DESC\nLIMIT 3;', exampleExplanation: 'Sorts results and restricts the size of the returned dataset. Crucial for pagination and listing top entries.', practiceInstruction: 'Sort products by price in ascending order:', practiceTemplate: 'SELECT * FROM products ORDER BY price ___;', practiceAnswer: 'ASC', challenges: [
      { type: 'multiple-choice', question: 'Which keyword sorts results from highest to lowest?', options: ['ASC', 'DESC', 'ORDER', 'LIMIT'], correctIndex: 1, explanation: 'DESC sorts columns in descending order (highest first).' },
      { type: 'fill-blank', question: 'Limit results to 5 rows:', template: 'SELECT * FROM users LIMIT ___;', answer: '5', explanation: 'Specify the limit quantity of 5.' }
    ] },
    { slug: 'sql-3-1', title: 'Aggregate COUNT', exampleLanguage: 'sql', exampleCode: 'SELECT COUNT(*)\nFROM users;', exampleExplanation: 'Returns the total number of rows. Aggregate functions compress multiple rows into a single summary scalar value.', practiceInstruction: 'Count total orders:', practiceTemplate: 'SELECT ___(*) FROM orders;', practiceAnswer: 'COUNT', challenges: [
      { type: 'multiple-choice', question: 'What does COUNT(*) do?', options: ['Counts the number of columns in a table', 'Counts the total rows matching the query', 'Sums values in all columns', 'Deletes empty records'], correctIndex: 1, explanation: 'COUNT(*) calculates the total number of records matching the criteria.' },
      { type: 'fill-blank', question: 'Count products:', template: 'SELECT ___(*) FROM products;', answer: 'COUNT', explanation: 'COUNT is the aggregator for row metrics.' }
    ] },
    { slug: 'sql-3-2', title: 'SUM & AVG', exampleLanguage: 'sql', exampleCode: 'SELECT SUM(amount) AS total_sales,\n       AVG(amount) AS avg_sale\nFROM orders;', exampleExplanation: 'SUM totals a numeric column, and AVG computes the arithmetic mean. Useful for financial statistics.', practiceInstruction: 'Calculate average price of products:', practiceTemplate: 'SELECT ___(price) FROM products;', practiceAnswer: 'AVG', challenges: [
      { type: 'multiple-choice', question: 'Which aggregate function calculates the total sum of a column?', options: ['ADD', 'AVG', 'TOTAL', 'SUM'], correctIndex: 3, explanation: 'SUM calculates the combined total of numeric values.' },
      { type: 'fill-blank', question: 'Sum the prices of products:', template: 'SELECT ___(price) FROM products;', answer: 'SUM', explanation: 'Use SUM to total numeric attributes.' }
    ] },
    { slug: 'sql-3-3', title: 'Grouping with GROUP BY', exampleLanguage: 'sql', exampleCode: 'SELECT category, COUNT(*)\nFROM products\nGROUP BY category;', exampleExplanation: 'Splits rows into buckets based on matching column values, running aggregations per distinct group.', practiceInstruction: 'Group products by category:', practiceTemplate: 'SELECT category, AVG(price) FROM products ___ BY category;', practiceAnswer: 'GROUP', challenges: [
      { type: 'multiple-choice', question: 'What is the purpose of GROUP BY?', options: ['Sorts the outputs alphabetically', 'Filters rows based on values', 'Groups rows with identical data into summary rows', 'Renames output columns'], correctIndex: 2, explanation: 'GROUP BY aggregates rows sharing a common property into single rows.' },
      { type: 'fill-blank', question: 'Complete the grouping clause:', template: 'SELECT category, SUM(price) FROM products GROUP ___ category;', answer: 'BY', explanation: 'The clause requires the BY keyword.' }
    ] },
    { slug: 'sql-3-4', title: 'Filtering with HAVING', exampleLanguage: 'sql', exampleCode: 'SELECT category, COUNT(*)\nFROM products\nGROUP BY category\nHAVING COUNT(*) > 1;', exampleExplanation: 'Filters aggregated groups. WHERE filters individual rows before grouping, HAVING filters groups after aggregation.', practiceInstruction: 'Filter groups with average prices above 100:', practiceTemplate: 'SELECT category, AVG(price) FROM products GROUP BY category ___ AVG(price) > 100;', practiceAnswer: 'HAVING', challenges: [
      { type: 'multiple-choice', question: 'How does HAVING differ from WHERE?', options: ['HAVING filters rows, WHERE filters columns', 'HAVING filters grouped aggregates, WHERE filters individual rows', 'HAVING is faster than WHERE', 'HAVING is used in inserts'], correctIndex: 1, explanation: 'WHERE filters rows before aggregates are computed; HAVING filters groups afterward.' },
      { type: 'fill-blank', question: 'Filter categories with sums above 500:', template: 'SELECT category FROM products GROUP BY category ___ SUM(price) > 500;', answer: 'HAVING', explanation: 'Use HAVING to filter aggregated metrics.' }
    ] },
    { slug: 'sql-4-1', title: 'INNER JOIN', exampleLanguage: 'sql', exampleCode: 'SELECT orders.id, users.first_name\nFROM orders\nINNER JOIN users ON orders.user_id = users.id;', exampleExplanation: 'Merges records from two tables where a matching key exists in both. Requires an ON condition linking keys.', practiceInstruction: 'INNER JOIN products table on orders:', practiceTemplate: 'SELECT * FROM orders INNER JOIN users ___ orders.user_id = users.id;', practiceAnswer: 'ON', challenges: [
      { type: 'multiple-choice', question: 'What records does an INNER JOIN return?', options: ['All rows from both tables', 'Only rows that have matching values in both tables', 'Only rows from the left table', 'Only non-matching rows'], correctIndex: 1, explanation: 'INNER JOIN returns rows only when the ON condition matches in both tables.' },
      { type: 'fill-blank', question: 'Complete join condition syntax:', template: 'SELECT * FROM orders INNER JOIN users ___ orders.user_id = users.id;', answer: 'ON', explanation: 'Use ON to specify key relations.' }
    ] },
    { slug: 'sql-4-2', title: 'LEFT JOIN', exampleLanguage: 'sql', exampleCode: 'SELECT users.first_name, orders.id\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id;', exampleExplanation: 'Returns all rows from the left table and matching rows from the right. Unmatched right rows return NULL.', practiceInstruction: 'Perform a LEFT JOIN with orders:', practiceTemplate: 'SELECT * FROM users ___ JOIN orders ON users.id = orders.user_id;', practiceAnswer: 'LEFT', challenges: [
      { type: 'multiple-choice', question: 'What does a LEFT JOIN return if there is no match in the right table?', options: ['An error', 'A default empty string', 'NULL values for right table columns', 'It deletes the left row'], correctIndex: 2, explanation: 'LEFT JOIN keeps left rows, padding missing right data with NULL.' },
      { type: 'fill-blank', question: 'LEFT JOIN on orders:', template: 'SELECT * FROM users ___ JOIN orders ON users.id = orders.user_id;', answer: 'LEFT', explanation: 'Write LEFT to include all user rows.' }
    ] },
    { slug: 'sql-4-3', title: 'RIGHT & OUTER JOIN', exampleLanguage: 'sql', exampleCode: 'SELECT orders.id, users.first_name\nFROM users\nRIGHT JOIN orders ON users.id = orders.user_id;', exampleExplanation: 'RIGHT JOIN is the reverse of LEFT JOIN, keeping all records from the right table. FULL OUTER JOIN retains all records.', practiceInstruction: 'Perform a RIGHT JOIN with orders:', practiceTemplate: 'SELECT * FROM users ___ JOIN orders ON users.id = orders.user_id;', practiceAnswer: 'RIGHT', challenges: [
      { type: 'multiple-choice', question: 'Which join returns ALL rows from both tables, including unmatched values?', options: ['INNER JOIN', 'FULL OUTER JOIN', 'LEFT JOIN', 'CROSS JOIN'], correctIndex: 1, explanation: 'FULL OUTER JOIN combines left and right joins, retaining all rows from both tables.' },
      { type: 'fill-blank', question: 'RIGHT JOIN syntax:', template: 'SELECT * FROM users ___ JOIN orders ON users.id = orders.user_id;', answer: 'RIGHT', explanation: 'Specify RIGHT to prioritize orders.' }
    ] },
    { slug: 'sql-4-4', title: 'Multiple Table JOINs', exampleLanguage: 'sql', exampleCode: 'SELECT users.first_name, products.name\nFROM orders\nINNER JOIN users ON orders.user_id = users.id\nINNER JOIN products ON orders.amount = products.price;', exampleExplanation: 'Chains multiple JOIN statements to cross-reference data across three or more relational entities.', practiceInstruction: 'Add another JOIN to the query:', practiceTemplate: 'SELECT * FROM orders INNER JOIN users ON orders.user_id = users.id ___ JOIN products ON orders.id = products.id;', practiceAnswer: 'INNER', challenges: [
      { type: 'multiple-choice', question: 'Can you chain multiple JOIN clauses in a single SELECT query?', options: ['Yes, by adding subsequent JOIN statements sequentially', 'No, only one JOIN is permitted', 'Only if using subqueries', 'Only on composite databases'], correctIndex: 0, explanation: 'You can chain as many JOIN clauses as needed to traverse relational paths.' },
      { type: 'fill-blank', question: 'Complete multi-join query:', template: 'SELECT * FROM orders INNER JOIN users ON orders.user_id = users.id ___ JOIN products ON orders.id = products.id;', answer: 'INNER', explanation: 'Use INNER JOIN to chain the product table.' }
    ] },
    { slug: 'sql-5-1', title: 'Subqueries in WHERE', exampleLanguage: 'sql', exampleCode: 'SELECT * FROM products\nWHERE price > (SELECT AVG(price) FROM products);', exampleExplanation: 'Uses a nested query inside a WHERE clause to perform dynamic filtering based on aggregate limits.', practiceInstruction: 'Find products priced below average:', practiceTemplate: 'SELECT * FROM products WHERE price < (SELECT ___(price) FROM products);', practiceAnswer: 'AVG', challenges: [
      { type: 'multiple-choice', question: 'What is a subquery?', options: ['A query that is executed after database shutdowns', 'A query nested inside another query statement', 'An alias for tables', 'A system database backup'], correctIndex: 1, explanation: 'A subquery is a nested query statement enclosed in parentheses.' },
      { type: 'fill-blank', question: 'Select average product cost:', template: 'SELECT * FROM products WHERE price > (SELECT ___(price) FROM products);', answer: 'AVG', explanation: 'The nested subquery calculates the mean price.' }
    ] },
    { slug: 'sql-5-2', title: 'Subqueries in FROM', exampleLanguage: 'sql', exampleCode: 'SELECT AVG(temp.price)\nFROM (SELECT price FROM products) AS temp;', exampleExplanation: 'Treats a subquery output as a temporary inline table. The subquery must have a defined table alias.', practiceInstruction: 'Alias a subquery in FROM:', practiceTemplate: 'SELECT * FROM (SELECT * FROM users) ___ temp;', practiceAnswer: 'AS', challenges: [
      { type: 'multiple-choice', question: 'Why must subqueries in a FROM clause be given an alias?', options: ['To format text fields', 'To allow referencing its columns like a standard table', 'It is optional', 'To index search metrics'], correctIndex: 1, explanation: 'Relational engines require an alias to identify subquery result sets as table references.' },
      { type: 'fill-blank', question: 'FROM subquery alias:', template: 'SELECT * FROM (SELECT * FROM users) ___ sub;', answer: 'AS', explanation: 'AS defines the subquery alias.' }
    ] },
    { slug: 'sql-5-3', title: 'Common Table Expressions', exampleLanguage: 'sql', exampleCode: 'WITH active_users AS (\n  SELECT * FROM users WHERE active = true\n)\nSELECT * FROM active_users;', exampleExplanation: 'CTEs (Common Table Expressions) define temporary named result sets, making queries easier to read and maintain.', practiceInstruction: 'Declare a CTE using WITH:', practiceTemplate: '___ active_users AS (SELECT * FROM users) SELECT * FROM active_users;', practiceAnswer: 'WITH', challenges: [
      { type: 'multiple-choice', question: 'Which keyword starts a Common Table Expression?', options: ['CTE', 'WITH', 'DEFINE', 'DECLARE'], correctIndex: 1, explanation: 'The WITH keyword introduces a CTE declaration.' },
      { type: 'fill-blank', question: 'Complete CTE syntax:', template: '___ temp_table AS (SELECT * FROM products) SELECT * FROM temp_table;', answer: 'WITH', explanation: 'WITH initializes the CTE block.' }
    ] },
    { slug: 'sql-5-4', title: 'Multiple CTEs', exampleLanguage: 'sql', exampleCode: 'WITH active_users AS (\n  SELECT * FROM users WHERE active = true\n),\nhigh_orders AS (\n  SELECT * FROM orders WHERE amount > 100\n)\nSELECT * FROM active_users;', exampleExplanation: 'Defines multiple CTE definitions separated by commas. This structures complex processing workflows.', practiceInstruction: 'Combine CTEs with a comma:', practiceTemplate: 'WITH t1 AS (SELECT * FROM users) ___ t2 AS (SELECT * FROM orders) SELECT * FROM t1;', practiceAnswer: ',', challenges: [
      { type: 'multiple-choice', question: 'How do you separate multiple CTE definitions in a single query?', options: ['Using semicolons', 'Using commas', 'Using AND keywords', 'Using WITH keywords repeatedly'], correctIndex: 1, explanation: 'Separate subsequent CTE tables using commas after the first WITH statement.' },
      { type: 'fill-blank', question: 'Separate CTEs:', template: 'WITH t1 AS (SELECT * FROM users) ___ t2 AS (SELECT * FROM orders) SELECT * FROM t1;', answer: ',', explanation: 'Use a comma to declare another temporary table.' }
    ] },
    { slug: 'sql-6-1', title: 'Primary Key Constraint', exampleLanguage: 'sql', exampleCode: 'CREATE TABLE customers (\n  id INT PRIMARY KEY,\n  name VARCHAR(50)\n);', exampleExplanation: 'A PRIMARY KEY uniquely identifies each row in a table. It cannot be NULL and must contain unique values.', practiceInstruction: 'Specify primary key in table creation:', practiceTemplate: 'CREATE TABLE roles (id INT PRIMARY ___);', practiceAnswer: 'KEY', challenges: [
      { type: 'multiple-choice', question: 'What properties does a Primary Key constraint enforce?', options: ['Unique values only', 'Non-null values only', 'Both unique and non-null values', 'Auto-incrementing values only'], correctIndex: 2, explanation: 'Primary keys guarantee that rows are unique and not null.' },
      { type: 'fill-blank', question: 'Complete Primary Key statement:', template: 'CREATE TABLE levels (id INT PRIMARY ___);', answer: 'KEY', explanation: 'Use KEY after PRIMARY to define the constraint.' }
    ] },
    { slug: 'sql-6-2', title: 'Foreign Key Constraint', exampleLanguage: 'sql', exampleCode: 'CREATE TABLE orders (\n  id INT PRIMARY KEY,\n  user_id INT REFERENCES users(id)\n);', exampleExplanation: 'A FOREIGN KEY references a column in another table (usually a primary key), establishing relational integrity.', practiceInstruction: 'Reference foreign tables:', practiceTemplate: 'CREATE TABLE orders (id INT, user_id INT ___ users(id));', practiceAnswer: 'REFERENCES', challenges: [
      { type: 'multiple-choice', question: 'What is the purpose of a Foreign Key constraint?', options: ['To sort index records', 'To link tables together and enforce referential integrity', 'To encrypt data fields', 'To count active records'], correctIndex: 1, explanation: 'Foreign keys link tables together and prevent invalid data relations.' },
      { type: 'fill-blank', question: 'Complete table reference:', template: 'CREATE TABLE posts (id INT, user_id INT ___ users(id));', answer: 'REFERENCES', explanation: 'REFERENCES establishes foreign key constraints.' }
    ] },
    { slug: 'sql-6-3', title: 'Creating Indexes', exampleLanguage: 'sql', exampleCode: 'CREATE INDEX idx_user_email\nON users(email);', exampleExplanation: 'Indexes speed up data retrieval queries at the cost of slightly slower write times.', practiceInstruction: 'Create index on active users:', practiceTemplate: 'CREATE ___ idx_active ON users(active);', practiceAnswer: 'INDEX', challenges: [
      { type: 'multiple-choice', question: 'What is a drawback of creating too many indexes on a table?', options: ['It corrupts tables', 'It slows down write operations (INSERT, UPDATE, DELETE)', 'It limits columns count', 'It disables primary keys'], correctIndex: 1, explanation: 'Every index must be updated during write operations, which adds write overhead.' },
      { type: 'fill-blank', question: 'Create index structure:', template: 'CREATE ___ idx_price ON products(price);', answer: 'INDEX', explanation: 'INDEX is the keyword to create search indices.' }
    ] },
    { slug: 'sql-6-4', title: 'Query execution plans', exampleLanguage: 'sql', exampleCode: 'EXPLAIN SELECT * FROM users\nWHERE email = \'alice@example.com\';', exampleExplanation: 'The EXPLAIN statement describes how the database engine plans to execute a query, showing index usage.', practiceInstruction: 'Analyze query execution path:', practiceTemplate: '___ SELECT * FROM users;', practiceAnswer: 'EXPLAIN', challenges: [
      { type: 'multiple-choice', question: 'What does the EXPLAIN keyword do?', options: ['Runs code comments', 'Prints query execution paths and costs', 'Executes queries faster', 'Deletes tables'], correctIndex: 1, explanation: 'EXPLAIN outputs details on table scans, index lookups, and query execution costs.' },
      { type: 'fill-blank', question: 'Explain execution plan:', template: '___ SELECT * FROM products;', answer: 'EXPLAIN', explanation: 'Prefix queries with EXPLAIN to view details.' }
    ] }
  ],

  // --- PYTHON (24 lessons) ---
  'python': [
    { slug: 'python-1-1', title: 'Hello Python!', exampleLanguage: 'python', exampleCode: '# First script\nprint("Hello, Python!")', exampleExplanation: 'Prints a message to the console. Python uses print() and ignores comments starting with #.', practiceInstruction: '**Scenario:** You are a Junior Software Engineer writing an onboarding script for new users.\n**Objective:** Complete the script to print a personalized welcome message: `Welcome to LearnStation, user!`\n**Expected Output:** `Welcome to LearnStation, user!`\n**Hint:** Use the standard Python `print()` function.', practiceTemplate: '# Greet the user logging in\n# Write your print statement below\n', practiceAnswer: 'print("Welcome to LearnStation, user!")', challenges: [
      { type: 'multiple-choice', question: 'Which symbol denotes single-line comments in Python?', options: ['//', '#', '/*', '--'], correctIndex: 1, explanation: 'Python uses the hash (#) symbol for comments.' },
      { type: 'fill-blank', question: 'Display World on the console:', template: '___("World")', answer: 'print', explanation: 'print() outputs values to the terminal.' }
    ] },
    { slug: 'python-1-2', title: 'Variables & Typing', exampleLanguage: 'python', exampleCode: 'name = "Learn Station"\nrating = 5\nis_active = True', exampleExplanation: 'Variables store data. Python is dynamically typed, so type declarations are not required.', practiceInstruction: '**Scenario:** You are setting up configuration variables for an API rate limiter.\n**Objective:** Define a variable named `max_requests` and assign it the integer value `150`. Then define a boolean variable named `is_active` and set it to `True`.\n**Hint:** Python variables do not need explicit types. Set `is_active` to the boolean value (capitalized `True`).', practiceTemplate: '# Define API limiter configuration parameters\n# Define max_requests and is_active below\n', practiceAnswer: 'max_requests = 150\nis_active = True', challenges: [
      { type: 'multiple-choice', question: 'What does dynamically typed mean?', options: ['Variables must be declared with their type', 'The type of a variable is checked at runtime and can change', 'Code compiled to executable files', 'Variable values cannot be changed'], correctIndex: 1, explanation: 'Dynamic typing allows variables to hold different types over time without explicit type declarations.' },
      { type: 'fill-blank', question: 'Create active flag variable set to True:', template: 'active = ___', answer: 'True', explanation: 'Use the capitalized Boolean True in Python.' }
    ] },
    { slug: 'python-1-3', title: 'Arithmetic Operations', exampleLanguage: 'python', exampleCode: 'total = 50 + 10 * 2\nprint(total)', exampleExplanation: 'Supports standard arithmetic (+, -, *, /) and follows math operator precedence rules.', practiceInstruction: '**Scenario:** You are building page pagination for an e-commerce dashboard. The server has 103 items to display and shows 10 items per page.\n**Objective:** Calculate how many items are left on the last page. Store the result in `remaining_items` using the modulus operator (`%`).\n**Expected Value:** `remaining_items = 3`\n**Hint:** Calculate `103 % 10` and assign the result to `remaining_items`.', practiceTemplate: '# Calculate the remainder of items left over\nremaining_items = ', practiceAnswer: '103 % 10', challenges: [
      { type: 'multiple-choice', question: 'Which operator performs integer division (discarding remainders)?', options: ['/', '//', '%', '**'], correctIndex: 1, explanation: '// is the floor division operator.' },
      { type: 'fill-blank', question: 'Perform exponentiation (2 to the power of 3):', template: 'result = 2 ___ 3', answer: '**', explanation: 'The double asterisk (**) is the exponentiation operator.' }
    ] },
    { slug: 'python-1-4', title: 'User Input & Casting', exampleLanguage: 'python', exampleCode: 'age_str = "25"\nage = int(age_str)\nprint(age)', exampleExplanation: 'Convert data types explicitly using int(), float(), and str() casts.', practiceInstruction: '**Scenario:** Your billing form receives all parameters as strings. You need to convert them to numeric values to calculate costs.\n**Objective:** Convert `price_str` to a float and `qty_str` to an integer, multiply them, and store the result in `total_cost`.\n**Expected Value:** `149.97`\n**Hint:** Use `float()` and `int()` to cast the inputs before multiplying.', practiceTemplate: 'price_str = "49.99"\nqty_str = "3"\n\n# Convert types and calculate the total_cost below\ntotal_cost = ', practiceAnswer: 'float(price_str) * int(qty_str)', challenges: [
      { type: 'multiple-choice', question: 'What type does the input() function return by default?', options: ['int', 'float', 'str', 'bool'], correctIndex: 2, explanation: 'The input() function always returns a string, requiring casting for math operations.' },
      { type: 'fill-blank', question: 'Convert 100 to string:', template: 'text = ___(100)', answer: 'str', explanation: 'str() converts numeric types to strings.' }
    ] },
    { slug: 'python-2-1', title: 'Conditionals (If)', exampleLanguage: 'python', exampleCode: 'score = 85\nif score >= 80:\n    print("Passed!")', exampleExplanation: 'Evaluates logical conditions. Blocks are defined using colons and indentation.', practiceInstruction: '**Scenario:** Implement an e-commerce shopping cart logic. If the user\'s cart total is $50 or more, they qualify for free shipping.\n**Objective:** Write an `if` statement checking if `cart_total` is greater than or equal to `50`. If it is, set `free_shipping` to `True`.\n**Hint:** Remember to add a colon at the end of the `if` line and indent the block.', practiceTemplate: 'cart_total = 75\nfree_shipping = False\n\n# Write your conditional check below\n', practiceAnswer: 'if cart_total >= 50:\n    free_shipping = True', challenges: [
      { type: 'multiple-choice', question: 'How are code blocks defined in Python conditionals?', options: ['Using curly braces {}', 'Using indentation and colons', 'Using end statements', 'Using parentheses ()'], correctIndex: 1, explanation: 'Python uses consistent indentation (usually 4 spaces) and colons to define statement blocks.' },
      { type: 'fill-blank', question: 'Check equality in if conditions:', template: 'if status ___ "active":\n    print("OK")', answer: '==', explanation: '== is the comparison operator for equality.' }
    ] },
    { slug: 'python-2-2', title: 'Else & Elif', exampleLanguage: 'python', exampleCode: 'score = 75\nif score >= 90:\n    grade = "A"\nelif score >= 70:\n    grade = "B"\nelse:\n    grade = "F"', exampleExplanation: 'Handles multiple logic paths using elif (else if) and else default cases.', practiceInstruction: '**Scenario:** Reward loyalty users by assigning them a VIP discount percentage based on their subscription length.\n**Objective:** Write an `if-elif-else` statement. If `months` is 12 or more, set `discount` to `0.2` (20%). If it is 6 or more (but less than 12), set `discount` to `0.1` (10%). Otherwise, set `discount` to `0.0`.\n**Hint:** Use `if`, `elif`, and `else` blocks.', practiceTemplate: 'months = 18\ndiscount = 0.0\n\n# Implement subscription discount tier checks below\n', practiceAnswer: 'if months >= 12:\n    discount = 0.2\nelif months >= 6:\n    discount = 0.1\nelse:\n    discount = 0.0', challenges: [
      { type: 'multiple-choice', question: 'What keyword represents else if in Python?', options: ['elseif', 'elif', 'else_if', 'if_else'], correctIndex: 1, explanation: 'Python uses "elif" for else-if statements.' },
      { type: 'fill-blank', question: 'Complete conditional structure:', template: 'if x > 10:\n    print("Yes")\n___ x > 5:\n    print("Maybe")', answer: 'elif', explanation: 'Use elif to check alternative cases.' }
    ] },
    { slug: 'python-2-3', title: 'While Loops', exampleLanguage: 'python', exampleCode: 'count = 0\nwhile count < 3:\n    print(count)\n    count = count + 1', exampleExplanation: 'Repeats code blocks as long as a boolean condition remains true.', practiceInstruction: '**Scenario:** Build a retry loop that attempts to connect to a database server.\n**Objective:** Write a `while` loop that continues as long as `attempts` is less than `max_attempts`. Inside the loop, increment `attempts` by 1 to represent a failed attempt.\n**Hint:** Prevent infinite loops by updating the loop counter inside the block.', practiceTemplate: 'attempts = 0\nmax_attempts = 3\n\n# Write connection retry while loop below\n', practiceAnswer: 'while attempts < max_attempts:\n    attempts += 1', challenges: [
      { type: 'multiple-choice', question: 'What happens if a while loop condition never evaluates to False?', options: ['The program compiles faster', 'An infinite loop is created', 'It raises a SyntaxError', 'It automatically exits'], correctIndex: 1, explanation: 'A loop without a terminating condition runs indefinitely, causing an infinite loop.' },
      { type: 'fill-blank', question: 'Loop keyword:', template: '___ active == True:\n    run_process()', answer: 'while', explanation: 'Use while for conditional iteration.' }
    ] },
    { slug: 'python-2-4', title: 'For Loops & Range', exampleLanguage: 'python', exampleCode: 'for i in range(3):\n    print(i)', exampleExplanation: 'Iterates over a sequence (such as lists or ranges) for a set number of times.', practiceInstruction: '**Scenario:** Generate automated alerts for 5 server nodes indexed 0 to 4.\n**Objective:** Loop 5 times using a `for` loop and the `range()` function. In each iteration, append the string `f"server-{i}"` to the `servers` list.\n**Hint:** Use `range(5)` to loop from index 0 to 4.', practiceTemplate: 'servers = []\n\n# Use a for loop to populate the servers list below\n', practiceAnswer: 'for i in range(5):\n    servers.append(f"server-{i}")', challenges: [
      { type: 'multiple-choice', question: 'What numbers are generated by range(0, 3)?', options: ['0, 1, 2, 3', '1, 2, 3', '0, 1, 2', '0, 2'], correctIndex: 2, explanation: 'range(start, stop) generates numbers up to, but not including, the stop value.' },
      { type: 'fill-blank', question: 'Complete for loop syntax:', template: 'for x ___ range(10):', answer: 'in', explanation: 'Use the "in" keyword in for loops.' }
    ] },
    { slug: 'python-3-1', title: 'Lists Basics', exampleLanguage: 'python', exampleCode: 'fruits = ["apple", "banana"]\nfruits.append("cherry")\nprint(fruits[0])', exampleExplanation: 'Lists are ordered, mutable collections of items. Indexes are 0-indexed.', practiceInstruction: '**Scenario:** Manage the queue of users inside an interactive game lobby list.\n**Objective:** Add `"Dave"` to the end of the lobby queue, and remove `"Alice"` from the lobby queue.\n**Hint:** Use the list methods `.append()` and `.remove()`.', practiceTemplate: 'lobby = ["Alice", "Bob", "Charlie"]\n\n# Add Dave and remove Alice below\n', practiceAnswer: 'lobby.append("Dave")\nlobby.remove("Alice")', challenges: [
      { type: 'multiple-choice', question: 'Which index represents the first item in a Python list?', options: ['0', '1', '-1', 'First'], correctIndex: 0, explanation: 'Python lists are 0-indexed.' },
      { type: 'fill-blank', question: 'Add item to list:', template: 'colors.___("red")', answer: 'append', explanation: 'append() adds elements to the end of a list.' }
    ] },
    { slug: 'python-3-2', title: 'List Slicing', exampleLanguage: 'python', exampleCode: 'nums = [10, 20, 30, 40]\nprint(nums[1:3])', exampleExplanation: 'Slices lists using [start:stop] notation, extracting subsets of lists.', practiceInstruction: '**Scenario:** Extract the top 3 largest transactions from a list.\n**Objective:** Assign a slice of the first 3 items of `transactions` to a new variable named `top_three`.\n**Hint:** Use slicing syntax: `list[start:stop]` where stop is exclusive.', practiceTemplate: 'transactions = [120.5, 45.0, 300.0, 15.0, 99.0]\n\n# Slice the first 3 items and assign to top_three below\ntop_three = ', practiceAnswer: 'transactions[0:3]', challenges: [
      { type: 'multiple-choice', question: 'Given list `x = [1, 2, 3, 4]`, what is `x[1:3]`?', options: ['[1, 2]', '[2, 3]', '[2, 3, 4]', '[1, 2, 3]'], correctIndex: 1, explanation: 'Slices extract from index 1 (inclusive) up to index 3 (exclusive), returning [2, 3].' },
      { type: 'fill-blank', question: 'Extract from index 0 to 3:', template: 'subset = items[___:3]', answer: '0', explanation: 'Specify 0 as the starting index.' }
    ] },
    { slug: 'python-3-3', title: 'Dictionaries Basics', exampleLanguage: 'python', exampleCode: 'user = {"name": "Alice", "age": 25}\nprint(user["name"])', exampleExplanation: 'Dictionaries store data in unordered, mutable key-value pairs.', practiceInstruction: '**Scenario:** Update a user\'s metadata profile.\n**Objective:** Update the value of the key `"status"` in the profile dictionary to `"active"`. Then, add a new key `"role"` and set its value to `"developer"`.\n**Hint:** Use square bracket dictionary syntax to modify and insert keys.', practiceTemplate: 'profile = {"username": "coder", "status": "pending"}\n\n# Update status and insert role key below\n', practiceAnswer: 'profile["status"] = "active"\nprofile["role"] = "developer"', challenges: [
      { type: 'multiple-choice', question: 'Which brackets define Python dictionary literals?', options: ['[]', '{}', '()', '<>'], correctIndex: 1, explanation: 'Curly braces {} define dictionary key-value literals.' },
      { type: 'fill-blank', question: 'Define value for dictionary key:', template: 'user = {"role": "___"}', answer: 'admin', explanation: 'Use quote keys and value declarations.' }
    ] },
    { slug: 'python-3-4', title: 'Tuples & Sets', exampleLanguage: 'python', exampleCode: 'coords = (10, 20)\nunique_ids = {1, 2, 2, 3}\nprint(unique_ids)', exampleExplanation: 'Tuples are immutable ordered lists. Sets are unordered collection containing only unique elements.', practiceInstruction: '**Scenario:** Deduplicate a list of server IP connections.\n**Objective:** Convert the list `raw_ips` to a set to remove duplicate entries, and assign the set to `unique_ips`.\n**Hint:** Use the built-in `set()` function wrapper.', practiceTemplate: 'raw_ips = ["192.168.1.1", "10.0.0.1", "192.168.1.1", "172.16.0.1"]\n\n# Convert raw_ips to set below\nunique_ips = ', practiceAnswer: 'set(raw_ips)', challenges: [
      { type: 'multiple-choice', question: 'What makes tuples different from lists in Python?', options: ['Tuples can only store numbers', 'Tuples are immutable (cannot be changed after creation)', 'Tuples are faster to index', 'Tuples do not support indexes'], correctIndex: 1, explanation: 'Tuples are immutable collections defined with parentheses ().' },
      { type: 'fill-blank', question: 'Verify uniqueness in collections:', template: 'duplicates = ___([1, 2, 2])', answer: 'set', explanation: 'set() filters out duplicate values.' }
    ] },
    { slug: 'python-4-1', title: 'Defining Functions', exampleLanguage: 'python', exampleCode: 'def greet(name):\n    return f"Hello, {name}!"\nprint(greet("Bob"))', exampleExplanation: 'Creates modular, reusable code blocks using the def keyword.', practiceInstruction: '**Scenario:** Write a subtotal discount calculator for checkout screens.\n**Objective:** Define a function named `calculate_discount` that takes two parameters: `price` and `pct`. The function should return the discounted price.\n**Hint:** Use `def` keyword to declare the function and return `price * (1 - pct)`.', practiceTemplate: '# Define calculate_discount(price, pct) function below\n', practiceAnswer: 'def calculate_discount(price, pct):\n    return price * (1 - pct)', challenges: [
      { type: 'multiple-choice', question: 'Which keyword defines custom functions in Python?', options: ['function', 'def', 'func', 'define'], correctIndex: 1, explanation: 'The def keyword introduces a function definition.' },
      { type: 'fill-blank', question: 'Complete function definition syntax:', template: '___ process_order():', answer: 'def', explanation: 'Use def to define function blocks.' }
    ] },
    { slug: 'python-4-2', title: 'Return Statement', exampleLanguage: 'python', exampleCode: 'def multiply(a, b):\n    return a * b\nresult = multiply(4, 5)', exampleExplanation: 'Sends values back to the function caller using the return keyword.', practiceInstruction: '**Scenario:** Format API responses uniformly before returning them to client devices.\n**Objective:** Complete the function `create_response` that takes `status` and `code` parameters and returns a dictionary matching the response structure.\n**Hint:** Return a dictionary literal: `{"status": status, "code": code}`.', practiceTemplate: 'def create_response(status, code):\n    # Return a dictionary below\n', practiceAnswer: '    return {"status": status, "code": code}', challenges: [
      { type: 'multiple-choice', question: 'What happens when a function execution hits a return statement?', options: ['The program terminates', 'The function immediately exits, returning the value', 'It loops back to the start', 'It raises a warning'], correctIndex: 1, explanation: 'return terminates function execution immediately and outputs the result value.' },
      { type: 'fill-blank', question: 'Complete return block:', template: 'def get_role():\n    ___ "user"', answer: 'return', explanation: 'Use return to output "user".' }
    ] },
    { slug: 'python-4-3', title: 'Default Parameters', exampleLanguage: 'python', exampleCode: 'def greet(name="Guest"):\n    print(f"Hello, {name}")\ngreet()', exampleExplanation: 'Defines fallback default values for function parameters, making arguments optional.', practiceInstruction: '**Scenario:** Allow users to choose notification channels, defaulting to email.\n**Objective:** Complete the function signature for `notify` by adding a default value of `"email"` for the parameter `channel`.\n**Hint:** In the function signature, use `channel="email"`.', practiceTemplate: 'def notify(message, channel=___):\n    print(f"[{channel}] {message}")', practiceAnswer: '"email"', challenges: [
      { type: 'multiple-choice', question: 'What value is used if a parameter has a default value, but an argument is passed?', options: ['The default value', 'The passed argument value', 'Both values merged', 'It raises a TypeError'], correctIndex: 1, explanation: 'The passed argument overrides the default parameter value.' },
      { type: 'fill-blank', question: 'Complete parameter default setting:', template: 'def process(total, tax=___):', answer: '0', explanation: 'Assign the default value (e.g. 0) in the function signature.' }
    ] },
    { slug: 'python-4-4', title: 'Variables Scope', exampleLanguage: 'python', exampleCode: 'x = 10\ndef print_val():\n    global x\n    x = 20\nprint_val()', exampleExplanation: 'Differentiates local scope variables (inside functions) from global scope variables (outside functions).', practiceInstruction: '**Scenario:** Keep track of a global event counter across local functions.\n**Objective:** Declare `event_count` as global inside the `increment_counter` function so we can modify the global variable.\n**Hint:** Use the `global` scope modifier keyword inside the function.', practiceTemplate: 'event_count = 0\n\ndef increment_counter():\n    # Declare event_count global below\n    \n    event_count += 1', practiceAnswer: 'global event_count', challenges: [
      { type: 'multiple-choice', question: 'Can local functions access global scope variables by default in Python?', options: ['Yes, they can read global variables', 'No, they can never access them', 'Only if the function is defined in a class', 'Only on runtime compiles'], correctIndex: 0, explanation: 'Functions can read global variables by default, but need the global keyword to modify them.' },
      { type: 'fill-blank', question: 'Access global variables:', template: 'def edit():\n    ___ count\n    count += 1', answer: 'global', explanation: 'Use the global keyword to modify global variables.' }
    ] },
    { slug: 'python-5-1', title: 'Reading Files', exampleLanguage: 'python', exampleCode: 'with open("data.txt", "r") as file:\n    content = file.read()\n    print(content)', exampleExplanation: 'Opens system files for reading. The with statement automatically handles file close cleanup.', practiceInstruction: '**Scenario:** Securely read a system configuration file.\n**Objective:** Open the file `config.json` in read mode (`"r"`) using a `with` statement context manager named `file`.\n**Hint:** Use `with open("config.json", "r") as file:`.', practiceTemplate: '# Open config.json safely below\n', practiceAnswer: 'with open("config.json", "r") as file:\n    content = file.read()', challenges: [
      { type: 'multiple-choice', question: 'What is a benefit of using the `with open()` statement in Python?', options: ['It runs queries faster', 'It automatically closes the file, even if exceptions occur', 'It encrypts file contents', 'It allows multi-threading'], correctIndex: 1, explanation: 'The context manager automatically closes files, preventing memory leaks.' },
      { type: 'fill-blank', question: 'Open files in read mode:', template: 'with open("logs.txt", "___") as file:', answer: 'r', explanation: '"r" stands for read mode.' }
    ] },
    { slug: 'python-5-2', title: 'Writing Files', exampleLanguage: 'python', exampleCode: 'with open("output.txt", "w") as file:\n    file.write("Hello, World!")', exampleExplanation: 'Opens and writes data to system files. "w" mode overwrites the file; "a" mode appends to it.', practiceInstruction: '**Scenario:** Write status alerts to a local server log.\n**Objective:** Open the file `server.log` in write mode (`"w"`) using a `with` statement context manager named `file`.\n**Hint:** Use `with open("server.log", "w") as file:`.', practiceTemplate: '# Open server.log safely below\n', practiceAnswer: 'with open("server.log", "w") as file:\n    file.write("OK")', challenges: [
      { type: 'multiple-choice', question: 'What happens to existing file contents when you open a file in write ("w") mode?', options: ['They are appended to', 'They are completely overwritten', 'It throws an error', 'They are archived'], correctIndex: 1, explanation: 'Write mode ("w") truncates the file, deleting any pre-existing contents.' },
      { type: 'fill-blank', question: 'Open files in append mode:', template: 'with open("logs.txt", "___") as file:', answer: 'a', explanation: '"a" stands for append mode.' }
    ] },
    { slug: 'python-5-3', title: 'Handling Exceptions', exampleLanguage: 'python', exampleCode: 'try:\n    num = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")', exampleExplanation: 'Prevents runtime crashes by catching execution errors inside try-except blocks.', practiceInstruction: '**Scenario:** Safely cast form inputs that might be corrupted or empty.\n**Objective:** Wrap the integer cast of `input_val` inside a `try-except` block. Catch `ValueError` and set `number` to a fallback value of `0`.\n**Hint:** Catch `ValueError` when casting strings that aren\'t integers.', practiceTemplate: 'input_val = "abc"\nnumber = 0\n\n# Implement try-except ValueError block below\n', practiceAnswer: 'try:\n    number = int(input_val)\nexcept ValueError:\n    number = 0', challenges: [
      { type: 'multiple-choice', question: 'Which block executes when an error occurs inside the try block?', options: ['try', 'except', 'finally', 'else'], correctIndex: 1, explanation: 'The except block catches and processes errors thrown inside the try block.' },
      { type: 'fill-blank', question: 'Catch errors syntax:', template: 'try:\n    num = int("abc")\n___ ValueError:', answer: 'except', explanation: 'Use except to handle ValueError.' }
    ] },
    { slug: 'python-5-4', title: 'Finally Block', exampleLanguage: 'python', exampleCode: 'try:\n    f = open("data.txt")\nexcept:\n    print("Error")\nfinally:\n    print("Cleanup")', exampleExplanation: 'The finally block always executes after try/except blocks, regardless of whether an exception occurred.', practiceInstruction: '**Scenario:** Guarantee that network and database streams are closed to avoid memory leaks.\n**Objective:** Implement a `finally` block after the `try` statement to guarantee that `stream.close()` is called.\n**Hint:** The `finally:` block always executes, even if errors are thrown.', practiceTemplate: 'stream = None\ntry:\n    # Simulate operations\n    pass\n# Add finally block below\n', practiceAnswer: 'finally:\n    if stream:\n        stream.close()', challenges: [
      { type: 'multiple-choice', question: 'When does a finally block execute?', options: ['Only when an exception is thrown', 'Only when no exceptions are thrown', 'Always, regardless of exceptions', 'Only if the try block fails'], correctIndex: 2, explanation: 'The finally block always runs, making it ideal for resource cleanup.' },
      { type: 'fill-blank', question: 'Add final execution block:', template: 'try:\n    run()\n___:\n    print("Always Runs")', answer: 'finally', explanation: 'The finally block runs cleanup scripts.' }
    ] },
    { slug: 'python-6-1', title: 'Classes & Objects', exampleLanguage: 'python', exampleCode: 'class User:\n    pass\n\nalice = User()\nprint(type(alice))', exampleExplanation: 'Classes act as blueprints for creating custom objects (instances) in Python.', practiceInstruction: '**Scenario:** Design a catalog item blueprint for an inventory system.\n**Objective:** Declare a class named `Product` with a simple placeholder body.\n**Hint:** Use the `class` keyword and the `pass` keyword for an empty class body.', practiceTemplate: '# Define the Product class below\n', practiceAnswer: 'class Product:\n    pass', challenges: [
      { type: 'multiple-choice', question: 'What keyword declares a class in Python?', options: ['def', 'class', 'struct', 'object'], correctIndex: 1, explanation: 'Use the class keyword to define a class blueprint.' },
      { type: 'fill-blank', question: 'Declare empty class:', template: '___ Product:\n    pass', answer: 'class', explanation: 'class is the object definition keyword.' }
    ] },
    { slug: 'python-6-2', title: 'Constructors & self', exampleLanguage: 'python', exampleCode: 'class Product:\n    def __init__(self, name):\n        self.name = name\np1 = Product("Laptop")', exampleExplanation: 'Constructors initialize object properties. The __init__ method runs automatically when instantiating classes.', practiceInstruction: '**Scenario:** Initialize profile objects with username and email attributes.\n**Objective:** Define the `__init__` constructor method for the `Customer` class. Bind the parameters `username` and `email` to instance variables.\n**Hint:** The first parameter of class constructor methods must always be `self`.', practiceTemplate: 'class Customer:\n    # Define the __init__ constructor below\n', practiceAnswer: '    def __init__(self, username, email):\n        self.username = username\n        self.email = email', challenges: [
      { type: 'multiple-choice', question: 'What does the self parameter represent in Python classes?', options: ['The class definition itself', 'The specific instance of the object being created', 'A parent class reference', 'A default argument'], correctIndex: 1, explanation: 'self references the current object instance, allowing access to its attributes and methods.' },
      { type: 'fill-blank', question: 'Initialize constructor attributes:', template: 'def __init__(___, name):', answer: 'self', explanation: 'The first parameter of class methods must be self.' }
    ] },
    { slug: 'python-6-3', title: 'Class inheritance', exampleLanguage: 'python', exampleCode: 'class Animal:\n    def speak(self):\n        print("Sound")\n\nclass Dog(Animal):\n    pass', exampleExplanation: 'Inheritance allows a child class to inherit attributes and methods from a parent class.', practiceInstruction: '**Scenario:** Inherit attributes from a parent personnel class.\n**Objective:** Define a subclass named `Manager` that inherits from the `Employee` class.\n**Hint:** Use subclassing syntax: `class Manager(Employee):`.', practiceTemplate: 'class Employee:\n    pass\n\n# Subclass Manager inheriting from Employee below\n', practiceAnswer: 'class Manager(Employee):\n    pass', challenges: [
      { type: 'multiple-choice', question: 'How is inheritance specified in Python?', options: ['Using the extends keyword', 'By passing the parent class name in parentheses in the class definition', 'Using colon mappings', 'Using the global keyword'], correctIndex: 1, explanation: 'Pass the parent class name in parentheses after the child class name.' },
      { type: 'fill-blank', question: 'Inherit product settings in Book class:', template: 'class Book(___):', answer: 'Product', explanation: 'Pass Product as argument to inherit its methods.' }
    ] },
    { slug: 'python-6-4', title: 'Polymorphism', exampleLanguage: 'python', exampleCode: 'class Cat:\n    def speak(self): return "Meow"\n\nclass Dog:\n    def speak(self): return "Woof"', exampleExplanation: 'Polymorphism allows different classes to implement methods with the same name, behaving differently depending on the object.', practiceInstruction: '**Scenario:** A savings account overrides the base interest calculation to apply bonus rates.\n**Objective:** Complete the `SavingsAccount` subclass by overriding the `calculate_interest` method to return a rate of `0.05`.\n**Hint:** Define the method signature identically to the parent method.', practiceTemplate: 'class BankAccount:\n    def calculate_interest(self):\n        return 0.01\n\nclass SavingsAccount(BankAccount):\n    # Override calculate_interest below\n', practiceAnswer: '    def calculate_interest(self):\n        return 0.05', challenges: [
      { type: 'multiple-choice', question: 'What is method overriding in polymorphism?', options: ['Naming variables identically', 'Redefining a parent class method in a child class', 'Deleting inherited methods', 'Calling functions recursively'], correctIndex: 1, explanation: 'Redefining parent methods in child classes overrides their default behavior.' },
      { type: 'fill-blank', question: 'Define identical speak interface:', template: 'def ___(self): return "Sound"', answer: 'speak', explanation: 'Implement the same method name to support polymorphism.' }
    ] }
  ],

  // --- WEB DEVELOPMENT (24 lessons) ---
  'webdev': [
    { slug: 'webdev-1-1', title: 'HTML Structure', exampleLanguage: 'html', exampleCode: '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Welcome!</h1>\n  </body>\n</html>', exampleExplanation: 'HTML files organize page content. Semantic structures start with html, head, and body tags.', practiceInstruction: 'Add the main heading tags:', practiceTemplate: '<___>Learn Station</___>', practiceAnswer: 'h1', challenges: [
      { type: 'multiple-choice', question: 'Which tag represents the root element of an HTML document?', options: ['<body>', '<head>', '<html>', '<!DOCTYPE>'], correctIndex: 2, explanation: 'The <html> tag wraps all page content, acting as the root element.' },
      { type: 'fill-blank', question: 'Complete paragraph tags:', template: '<___>Hello World</___>', answer: 'p', explanation: 'The <p> tag defines paragraph blocks.' }
    ] },
    { slug: 'webdev-1-2', title: 'Headings & Paragraphs', exampleLanguage: 'html', exampleCode: '<h1>Title</h1>\n<p>This is a paragraph.</p>', exampleExplanation: 'Organizes text flow. Headings range from h1 (most important) to h6 (least important).', practiceInstruction: 'Use h2 heading tags:', practiceTemplate: '<___>Subheading</___>', practiceAnswer: 'h2', challenges: [
      { type: 'multiple-choice', question: 'Which heading tag displays the largest text by default?', options: ['<h6>', '<h3>', '<h1>', '<h0>'], correctIndex: 2, explanation: '<h1> represents the main heading, rendering with the largest font size.' },
      { type: 'fill-blank', question: 'Create paragraph tag:', template: '<___>Content</___>', answer: 'p', explanation: '<p> is the tag for paragraph blocks.' }
    ] },
    { slug: 'webdev-1-3', title: 'Lists & Navigation', exampleLanguage: 'html', exampleCode: '<ul>\n  <li>Item 1</li>\n</ul>', exampleExplanation: 'Lists organize menu items. ul defines unordered lists, ol defines ordered lists, and li defines list items.', practiceInstruction: 'Create a list item tag:', practiceTemplate: '<___>Item</___>', practiceAnswer: 'li', challenges: [
      { type: 'multiple-choice', question: 'Which tag defines an ordered (numbered) list?', options: ['<ul>', '<ol>', '<li>', '<list>'], correctIndex: 1, explanation: '<ol> creates numbered list sequences.' },
      { type: 'fill-blank', question: 'Complete list item tag:', template: '<___>Coffee</___>', answer: 'li', explanation: '<li> defines items in lists.' }
    ] },
    { slug: 'webdev-1-4', title: 'Anchor Links & URLs', exampleLanguage: 'html', exampleCode: '<a href="https://example.com">Visit site</a>', exampleExplanation: 'Creates hyperlinks. The href attribute specifies the destination URL.', practiceInstruction: 'Add href attribute:', practiceTemplate: '<a ___="https://google.com">Google</a>', practiceAnswer: 'href', challenges: [
      { type: 'multiple-choice', question: 'Which attribute specifies the link destination URL?', options: ['src', 'href', 'link', 'url'], correctIndex: 1, explanation: 'The href (hypertext reference) attribute defines the link target.' },
      { type: 'fill-blank', question: 'Define reference link attribute:', template: '<a ___="https://github.com">Code</a>', answer: 'href', explanation: 'href designates destination URLs.' }
    ] },
    { slug: 'webdev-2-1', title: 'Selectors & Colors', exampleLanguage: 'css', exampleCode: 'h1 {\n  color: #3b82f6;\n}', exampleExplanation: 'CSS styles HTML elements. Class selectors use a dot prefix (.), ID selectors use a hash (#).', practiceInstruction: 'Change article element colors in CSS:', practiceTemplate: 'p {\n  ___: red;\n}', practiceAnswer: 'color', challenges: [
      { type: 'multiple-choice', question: 'Which CSS selector targets elements with the class name "menu"?', options: ['.menu', '#menu', 'menu', '*menu'], correctIndex: 0, explanation: 'Classes are targeted with a dot (.) prefix in CSS selectors.' },
      { type: 'fill-blank', question: 'Set text color property to blue:', template: 'h2 {\n    ___: blue;\n}', answer: 'color', explanation: 'The color property defines text colors.' }
    ] },
    { slug: 'webdev-2-2', title: 'The Box Model', exampleLanguage: 'css', exampleCode: 'div {\n  width: 200px;\n  padding: 10px;\n  border: 1px solid black;\n  margin: 20px;\n}', exampleExplanation: 'Every element is a box. The Box Model includes content, padding, border, and margin.', practiceInstruction: 'Set margin property in CSS:', practiceTemplate: 'div {\n  ___: 20px;\n}', practiceAnswer: 'margin', challenges: [
      { type: 'multiple-choice', question: 'Which Box Model property creates space outside the element border?', options: ['padding', 'margin', 'border', 'width'], correctIndex: 1, explanation: 'Margin adds spacing around elements, outside their borders.' },
      { type: 'fill-blank', question: 'Add spacing inside element border:', template: 'div {\n  ___: 10px;\n}', answer: 'padding', explanation: 'Padding adds spacing inside elements.' }
    ] },
    { slug: 'webdev-2-3', title: 'Typography CSS', exampleLanguage: 'css', exampleCode: 'p {\n  font-family: Arial, sans-serif;\n  font-size: 16px;\n  line-height: 1.5;\n}', exampleExplanation: 'Customizes text styles using font-family, font-size, font-weight, and line-height properties.', practiceInstruction: 'Set font size in CSS:', practiceTemplate: 'p {\n  font-___: 16px;\n}', practiceAnswer: 'size', challenges: [
      { type: 'multiple-choice', question: 'Which property adjusts text line height?', options: ['font-weight', 'line-height', 'text-spacing', 'line-spacing'], correctIndex: 1, explanation: 'line-height sets the spacing between text lines.' },
      { type: 'fill-blank', question: 'Change font family property:', template: 'h1 {\n  font-___: sans-serif;\n}', answer: 'family', explanation: 'font-family defines the font family.' }
    ] },
    { slug: 'webdev-2-4', title: 'CSS Variables', exampleLanguage: 'css', exampleCode: ':root {\n  --primary: #3b82f6;\n}\nh1 {\n  color: var(--primary);\n}', exampleExplanation: 'Custom properties (variables) store reusable style values, defined using a double dash (--) prefix.', practiceInstruction: 'Reference a CSS variable:', practiceTemplate: 'h2 {\n  color: ___(--primary);\n}', practiceAnswer: 'var', challenges: [
      { type: 'multiple-choice', question: 'Where are global CSS variables typically defined?', options: ['Inside index.html', 'Under the :root selector', 'Under body selectors', 'Inside style tags'], correctIndex: 1, explanation: 'Defining variables in :root makes them globally accessible throughout the stylesheet.' },
      { type: 'fill-blank', question: 'Reference CSS variable primary:', template: 'p {\n  background-color: ___(--primary);\n}', answer: 'var', explanation: 'Use the var() function to reference CSS variables.' }
    ] },
    { slug: 'webdev-3-1', title: 'Display Property', exampleLanguage: 'css', exampleCode: 'span {\n  display: block;\n}', exampleExplanation: 'Configures element display behaviors (block, inline, inline-block, or none).', practiceInstruction: 'Hide an element visually:', practiceTemplate: 'div {\n  display: ___;\n}', practiceAnswer: 'none', challenges: [
      { type: 'multiple-choice', question: 'What display value prevents elements from starting on a new line and ignores margins?', options: ['block', 'inline', 'inline-block', 'flex'], correctIndex: 1, explanation: 'Inline elements display side-by-side, ignoring vertical box margins.' },
      { type: 'fill-blank', question: 'Change block element to flex container:', template: 'div {\n  display: ___;\n}', answer: 'flex', explanation: 'display: flex turns a box into a flex container.' }
    ] },
    { slug: 'webdev-3-2', title: 'Flex Container', exampleLanguage: 'css', exampleCode: '.container {\n  display: flex;\n  flex-direction: row;\n}', exampleExplanation: 'Flexbox aligns elements in rows or columns. display: flex initializes the container.', practiceInstruction: 'Change flex direction to column:', practiceTemplate: '.container {\n  display: flex;\n  flex-___: column;\n}', practiceAnswer: 'direction', challenges: [
      { type: 'multiple-choice', question: 'What is the default direction of items inside a flex container?', options: ['column', 'row', 'grid', 'vertical'], correctIndex: 1, explanation: 'By default, flex-direction is set to row (items align horizontally).' },
      { type: 'fill-blank', question: 'Set flexbox direction:', template: '.menu {\n  display: flex;\n  flex-___: row;\n}', answer: 'direction', explanation: 'flex-direction sets the flex axis.' }
    ] },
    { slug: 'webdev-3-3', title: 'Flex Alignments', exampleLanguage: 'css', exampleCode: '.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}', exampleExplanation: 'Aligns items along main and cross axes. justify-content aligns main axis; align-items aligns cross axis.', practiceInstruction: 'Center items along the cross axis:', practiceTemplate: '.box {\n  display: flex;\n  ___-items: center;\n}', practiceAnswer: 'align', challenges: [
      { type: 'multiple-choice', question: 'Which property aligns items horizontally in a default row flexbox?', options: ['align-items', 'justify-content', 'flex-align', 'float'], correctIndex: 1, explanation: 'justify-content aligns items along the main (horizontal) axis.' },
      { type: 'fill-blank', question: 'Center items on main axis:', template: '.nav {\n  display: flex;\n  ___-content: center;\n}', answer: 'justify', explanation: 'Use justify-content to align items along the main axis.' }
    ] },
    { slug: 'webdev-3-4', title: 'Flex Item Grow & Shrink', exampleLanguage: 'css', exampleCode: '.item {\n  flex-grow: 1;\n  flex-shrink: 0;\n}', exampleExplanation: 'Configures how individual flex items grow, shrink, or set base dimensions (basis) to fill container space.', practiceInstruction: 'Allow item to grow to fill space:', practiceTemplate: '.sidebar {\n  flex-___: 1;\n}', practiceAnswer: 'grow', challenges: [
      { type: 'multiple-choice', question: 'What does flex-grow: 1 mean?', options: ['The item expands to fill remaining space', 'The item size increases by 1px', 'The item text is bolded', 'The item is always hidden'], correctIndex: 0, explanation: 'flex-grow specifies how much an item should grow relative to other items.' },
      { type: 'fill-blank', question: 'Allow item to shrink:', template: '.card {\n  flex-___: 1;\n}', answer: 'shrink', explanation: 'flex-shrink sets item shrink ratios.' }
    ] },
    { slug: 'webdev-4-1', title: 'CSS Grid Basics', exampleLanguage: 'css', exampleCode: '.grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n}', exampleExplanation: 'Grid creates two-dimensional layouts using explicit columns and rows. fr stands for fractional unit.', practiceInstruction: 'Initialize grid container:', practiceTemplate: '.wrapper {\n  display: ___;\n}', practiceAnswer: 'grid', challenges: [
      { type: 'multiple-choice', question: 'What does the fr unit stand for in CSS Grid?', options: ['Fraction of available space', 'Fixed resolution', 'Frequency rate', 'Font size ratio'], correctIndex: 0, explanation: 'fr stands for fractional unit, representing a fraction of the available grid container space.' },
      { type: 'fill-blank', question: 'Configure columns:', template: '.grid {\n  display: grid;\n  grid-___-columns: 1fr 1fr;\n}', answer: 'template', explanation: 'grid-template-columns defines the columns.' }
    ] },
    { slug: 'webdev-4-2', title: 'Grid Gaps & Spacing', exampleLanguage: 'css', exampleCode: '.grid {\n  display: grid;\n  gap: 20px;\n}', exampleExplanation: 'The gap property sets the spacing between columns and rows, avoiding individual margins.', practiceInstruction: 'Add gap spacing to grid:', practiceTemplate: '.gallery {\n  display: grid;\n  ___: 16px;\n}', practiceAnswer: 'gap', challenges: [
      { type: 'multiple-choice', question: 'What is a benefit of using gap instead of margin in layouts?', options: ['It has better browser compatibility', 'It adds spacing only between items, not on outer edges', 'It changes font styles', 'It requires absolute positions'], correctIndex: 1, explanation: 'gap adds spacing between grid/flex items without adding extra margin to outer borders.' },
      { type: 'fill-blank', question: 'Set grid gap property:', template: '.board {\n  display: grid;\n  ___: 10px;\n}', answer: 'gap', explanation: 'gap sets layout spacing.' }
    ] },
    { slug: 'webdev-4-3', title: 'Media Queries', exampleLanguage: 'css', exampleCode: '@media (max-width: 768px) {\n  .grid {\n    grid-template-columns: 1fr;\n  }\n}', exampleExplanation: 'Enables responsive designs by applying styles only when viewport widths match criteria.', practiceInstruction: 'Write media queries keyword:', practiceTemplate: '___ (max-width: 600px) {}', practiceAnswer: '@media', challenges: [
      { type: 'multiple-choice', question: 'What is the purpose of mobile-first web design?', options: ['Designing for desktops first, then scaling down', 'Designing for mobile screen sizes first, then adding columns on wider viewports', 'Preventing desktop users from visiting', 'Using Java scripts exclusively'], correctIndex: 1, explanation: 'Mobile-first design prioritizes mobile layouts, using media queries to expand columns for larger screens.' },
      { type: 'fill-blank', question: 'Write responsive media selector:', template: '___ (min-width: 1024px) {}', answer: '@media', explanation: 'Media queries start with the @media keyword.' }
    ] },
    { slug: 'webdev-4-4', title: 'Transitions & Hover', exampleLanguage: 'css', exampleCode: '.btn {\n  transition: background-color 0.3s;\n}\n.btn:hover {\n  background-color: blue;\n}', exampleExplanation: 'Smoothly animates style changes on interactions (like hover states) using the transition property.', practiceInstruction: 'Add transition property:', practiceTemplate: '.card {\n  ___: transform 0.2s;\n}', practiceAnswer: 'transition', challenges: [
      { type: 'multiple-choice', question: 'Which pseudo-class targets elements when a mouse cursors over them?', options: [':hover', ':active', ':focus', ':visited'], correctIndex: 0, explanation: 'The :hover pseudo-class styles elements on cursor hover.' },
      { type: 'fill-blank', question: 'Target hover state in CSS:', template: 'a___ {\n  color: red;\n}', answer: ':hover', explanation: ':hover is the pseudo-class suffix.' }
    ] },
    { slug: 'webdev-5-1', title: 'JS Variable Declarations', exampleLanguage: 'javascript', exampleCode: 'let name = "Bob";\nconst pi = 3.14;\nconsole.log(name);', exampleExplanation: 'Stores variables in JavaScript. Use const for constants that cannot be reassigned, and let for mutable variables.', practiceInstruction: '**Scenario:** Initialize API limiting parameters on backend gateways.\n**Objective:** Declare a constant named `maxRequests` set to `100`, and a mutable variable `currentRequests` set to `0`.\n**Hint:** Use `const` for immutable variables and `let` for mutable ones.', practiceTemplate: '// Declare maxRequests and currentRequests below\n', practiceAnswer: 'const maxRequests = 100;\nlet currentRequests = 0;', challenges: [
      { type: 'multiple-choice', question: 'Which keyword defines variables that cannot be reassigned?', options: ['let', 'var', 'const', 'static'], correctIndex: 2, explanation: 'const defines read-only constants that cannot be reassigned.' },
      { type: 'fill-blank', question: 'Declare constant variable tax_rate:', template: '___ tax_rate = 0.08;', answer: 'const', explanation: 'Use const for read-only variables.' }
    ] },
    { slug: 'webdev-5-2', title: 'JS Event Listeners', exampleLanguage: 'javascript', exampleCode: 'const btn = document.querySelector("#btn");\nbtn.addEventListener("click", () => {\n  console.log("Clicked!");\n});', exampleExplanation: 'Listens for browser interactions (like clicks or key presses) and executes callback handlers.', practiceInstruction: '**Scenario:** Trigger interactive callbacks when buttons are clicked.\n**Objective:** Add a click event listener callback to the element `btn` that prints `"Clicked"` to the console.\n**Hint:** Use `btn.addEventListener("click", ...).`', practiceTemplate: 'const btn = document.querySelector("button");\n\n// Add click event listener below\n', practiceAnswer: 'btn.addEventListener("click", () => {\n  console.log("Clicked");\n});', challenges: [
      { type: 'multiple-choice', question: 'Which DOM method registers event handler callbacks?', options: ['listen()', 'addEventListener()', 'onClick()', 'trigger()'], correctIndex: 1, explanation: 'addEventListener() registers callbacks for specified event triggers.' },
      { type: 'fill-blank', question: 'Complete addEventListener syntax:', template: 'window.addEventListener("___", () => {});', answer: 'load', explanation: 'Listen for window load events.' }
    ] },
    { slug: 'webdev-5-3', title: 'DOM Query Selectors', exampleLanguage: 'javascript', exampleCode: 'const title = document.querySelector(".title");\ntitle.textContent = "New Title";', exampleExplanation: 'Queries HTML elements from the DOM tree using CSS selector queries.', practiceInstruction: '**Scenario:** Search for interactive card items to apply layout styling.\n**Objective:** Query the DOM for the element containing the class `.card` and store it in a variable named `card`.\n**Hint:** Use the `document.querySelector` method.', practiceTemplate: '// Query for the card element below\nconst card = ', practiceAnswer: 'document.querySelector(".card");', challenges: [
      { type: 'multiple-choice', question: 'What does document.querySelector() return if no matching elements are found?', options: ['An error', 'undefined', 'null', 'An empty array'], correctIndex: 2, explanation: 'querySelector returns null if no DOM elements match the selector.' },
      { type: 'fill-blank', question: 'Complete DOM query method:', template: 'const root = document.___("#root");', answer: 'querySelector', explanation: 'Use querySelector to find elements by selector.' }
    ] },
    { slug: 'webdev-5-4', title: 'Modifying DOM Text', exampleLanguage: 'javascript', exampleCode: 'const el = document.querySelector("p");\nel.textContent = "Hello!";', exampleExplanation: 'Updates the text inside HTML elements by modifying their textContent property.', practiceInstruction: '**Scenario:** Update status elements dynamically after successful processes.\n**Objective:** Set the `textContent` property of the element variable `el` to the exact string `"Success"`.\n**Hint:** Modify the `textContent` attribute directly.', practiceTemplate: 'const el = document.querySelector("#status");\n\n// Update textContent below\n', practiceAnswer: 'el.textContent = "Success";', challenges: [
      { type: 'multiple-choice', question: 'Which property updates the raw text inside an HTML element, escaping HTML tags?', options: ['innerHTML', 'textContent', 'value', 'innerText'], correctIndex: 1, explanation: 'textContent updates element text contents safely, escaping HTML markup characters.' },
      { type: 'fill-blank', question: 'Update heading textContent:', template: 'h1.___ = "Welcome";', answer: 'textContent', explanation: 'Use textContent to set text values.' }
    ] },
    { slug: 'webdev-6-1', title: 'Creating Elements', exampleLanguage: 'javascript', exampleCode: 'const div = document.createElement("div");\ndiv.textContent = "Nested";\ndocument.body.appendChild(div);', exampleExplanation: 'Creates new HTML elements in memory using createElement(), then inserts them into the document structure using appendChild().', practiceInstruction: '**Scenario:** Build dynamic interface alerts when system states update.\n**Objective:** Create a new `div` element, set its text content to `"Success Alert"`, and append it to the document body.\n**Hint:** Use `document.createElement("div")` and `document.body.appendChild(...)`.', practiceTemplate: '// Create element and append to body below\n', practiceAnswer: 'const div = document.createElement("div");\ndiv.textContent = "Success Alert";\ndocument.body.appendChild(div);', challenges: [
      { type: 'multiple-choice', question: 'Which method adds an element as the last child of a parent element?', options: ['insert()', 'appendChild()', 'prepend()', 'create()'], correctIndex: 1, explanation: 'appendChild() inserts elements at the end of a parent element.' },
      { type: 'fill-blank', question: 'Create dynamic span elements:', template: 'const el = document.___("span");', answer: 'createElement', explanation: 'createElement generates element instances in memory.' }
    ] },
    { slug: 'webdev-6-2', title: 'Modifying CSS Classes', exampleLanguage: 'javascript', exampleCode: 'const card = document.querySelector(".card");\ncard.classList.add("active");', exampleExplanation: 'Adds, removes, or toggles CSS class names on elements using classList properties.', practiceInstruction: '**Scenario:** Style user components to show active connection status.\n**Objective:** Query for the element with the class `.card`, and add the class name `"active"` using its classList property.\n**Hint:** Use `card.classList.add("active")`.', practiceTemplate: 'const card = document.querySelector(".card");\n\n// Add active class below\n', practiceAnswer: 'card.classList.add("active");', challenges: [
      { type: 'multiple-choice', question: 'Which method toggles a class name on/off based on its presence?', options: ['classList.add()', 'classList.remove()', 'classList.toggle()', 'classList.switch()'], correctIndex: 2, explanation: 'classList.toggle() adds a class if absent, or removes it if present.' },
      { type: 'fill-blank', question: 'Remove class active from elements:', template: 'el.classList.___("active");', answer: 'remove', explanation: 'Use classList.remove() to remove classes.' }
    ] },
    { slug: 'webdev-6-3', title: 'Async JS & Promises', exampleLanguage: 'javascript', exampleCode: 'const task = new Promise(resolve => {\n  setTimeout(() => resolve("Done"), 100);\n});', exampleExplanation: 'Promises handle asynchronous operations in JavaScript, transitioning from pending to fulfilled.', practiceInstruction: '**Scenario:** Simulate async server responses resolving database tasks.\n**Objective:** Instantiate and return a `Promise` variable `task` that resolves with the value `"Completed"`.\n**Hint:** The syntax is `new Promise(resolve => resolve("Completed"))`.', practiceTemplate: '// Instantiate task promise below\nconst task = ', practiceAnswer: 'new Promise((resolve) => {\n  resolve("Completed");\n});', challenges: [
      { type: 'multiple-choice', question: 'What are the three states of a JavaScript Promise?', options: ['start, processing, finish', 'pending, fulfilled, rejected', 'try, catch, finally', 'open, active, close'], correctIndex: 1, explanation: 'Promises are either pending (running), fulfilled (success), or rejected (error).' },
      { type: 'fill-blank', question: 'Complete promise instancing:', template: 'const load = ___ Promise((res) => {});', answer: 'new', explanation: 'Use the new keyword to instantiate Promises.' }
    ] },
    { slug: 'webdev-6-4', title: 'Fetching API Data', exampleLanguage: 'javascript', exampleCode: 'fetch("https://api.example.com/data")\n  .then(res => res.json())\n  .then(data => console.log(data));', exampleExplanation: 'Retrieves external data asynchronously. fetch() returns a Promise resolving to a Response object.', practiceInstruction: '**Scenario:** Query remote endpoints for real-time dashboard data.\n**Objective:** Use the `fetch` API to query resources from `"https://api.example.com/data"` and log the result.\n**Hint:** Use `fetch("https://api.example.com/data")`.', practiceTemplate: '// Call fetch API below\n', practiceAnswer: 'fetch("https://api.example.com/data");', challenges: [
      { type: 'multiple-choice', question: 'What format does res.json() parse the response payload into?', options: ['Text string', 'JavaScript Object / Array', 'XML Document', 'Binary buffer'], correctIndex: 1, explanation: 'res.json() parses JSON text payloads into native JavaScript values.' },
      { type: 'fill-blank', question: 'Fetch API resources:', template: '___("https://api.github.com/users");', answer: 'fetch', explanation: 'fetch() calls API endpoints.' }
    ] }
  ],

  // --- AI FUNDAMENTALS (24 lessons) ---
  'ai': [
    { slug: 'ai-1-1', title: 'What is AI?', exampleLanguage: 'python', exampleCode: '# AI Concepts\nfeatures = ["price", "size"]\nlabel = "house_cost"', exampleExplanation: 'Artificial Intelligence simulates intelligent behavior. Modern AI relies on Machine Learning algorithms that learn patterns from data.', practiceInstruction: 'AI that learns from labeled examples is called ___ learning:', practiceTemplate: '___ learning', practiceAnswer: 'supervised', challenges: [
      { type: 'multiple-choice', question: 'What is the primary driver of modern AI capabilities?', options: ['Hard-coded rules', 'Machine Learning algorithms learning from data', 'Virtual machines', 'Larger hard drives'], correctIndex: 1, explanation: 'Modern AI relies on machine learning models training on datasets, rather than static hand-written rules.' },
      { type: 'fill-blank', question: 'AI training using label variables is:', template: '___ learning', answer: 'supervised', explanation: 'Supervised learning trains on labeled inputs.' }
    ] },
    { slug: 'ai-1-2', title: 'Features & Labels', exampleLanguage: 'python', exampleCode: 'data = {\n  "features": [1500, 3], # sqft, bedrooms\n  "label": 350000        # house cost\n}', exampleExplanation: 'Features are inputs (variables) used for predictions; labels are the targets we want to predict.', practiceInstruction: 'Target metrics predicted by models are called:', practiceTemplate: 'predict the ___ value', practiceAnswer: 'label', challenges: [
      { type: 'multiple-choice', question: 'In a spam classifier model, what represents the features?', options: ['The spam classification category (Spam/Not Spam)', 'The words and characteristics of the email text', 'The model accuracy score', 'The training database size'], correctIndex: 1, explanation: 'The email characteristics (words, headers) are features. The Spam tag is the label.' },
      { type: 'fill-blank', question: 'Inputs variables in datasets are:', template: '___ values', answer: 'feature', explanation: 'Features are the input variables in a dataset.' }
    ] },
    { slug: 'ai-1-3', title: 'Supervised Learning', exampleLanguage: 'python', exampleCode: '# Model Maps Features -> Labeled Outputs\ndata = [("Buy now", "Spam"), ("Hi Bob", "Inbox")]', exampleExplanation: 'Supervised learning trains models on labeled datasets containing pairs of inputs and correct outputs.', practiceInstruction: 'Supervised models map inputs to target:', practiceTemplate: 'predict the target ___', practiceAnswer: 'label', challenges: [
      { type: 'multiple-choice', question: 'Which task is an example of supervised learning?', options: ['Grouping customers by shopping traits without tags', 'Predicting house prices from tagged histories', 'Simulating physics simulations', 'Formatting text margins'], correctIndex: 1, explanation: 'Predicting values from labeled histories (regression/classification) is supervised learning.' },
      { type: 'fill-blank', question: 'Complete classification target output term:', template: 'target ___', answer: 'label', explanation: 'The target is the label.' }
    ] },
    { slug: 'ai-1-4', title: 'Unsupervised Learning', exampleLanguage: 'python', exampleCode: '# Groups inputs without labels\nclusters = [[1, 2], [5, 6]]', exampleExplanation: 'Unsupervised learning discovers hidden patterns or groupings in unlabeled datasets.', practiceInstruction: 'Grouping unlabeled data points into clusters is called:', practiceTemplate: 'data ___', practiceAnswer: 'clustering', challenges: [
      { type: 'multiple-choice', question: 'Which technique is unsupervised?', options: ['Image classification', 'Customer clustering', 'Stock price forecasting', 'Spam detection'], correctIndex: 1, explanation: 'Clustering groups unlabeled data points based on similarities, an unsupervised task.' },
      { type: 'fill-blank', question: 'Group data without labels:', template: 'data ___', answer: 'clustering', explanation: 'Clustering groups unlabeled records.' }
    ] },
    { slug: 'ai-2-1', title: 'Linear Regression', exampleLanguage: 'python', exampleCode: '# y = wx + b\nweight = 150.0\nbias = 50000.0', exampleExplanation: 'Linear Regression predicts continuous numerical outputs by fitting a straight line (y = wx + b) to data points.', practiceInstruction: 'Slope coefficient in linear equations is the:', practiceTemplate: 'y = ___ * x + b', practiceAnswer: 'weight', challenges: [
      { type: 'multiple-choice', question: 'What does Linear Regression predict?', options: ['Binary class categories', 'Continuous numeric values', 'Text segments', 'Database structures'], correctIndex: 1, explanation: 'Linear regression outputs continuous numeric values, like prices or temperatures.' },
      { type: 'fill-blank', question: 'Define equation slope value:', template: 'y = ___ * x + b', answer: 'weight', explanation: 'In ML, slope is called weight.' }
    ] },
    { slug: 'ai-2-2', title: 'Logistic Regression', exampleLanguage: 'python', exampleCode: '# Output between 0 and 1\nprobability = 0.85', exampleExplanation: 'Logistic Regression predicts probabilities of binary classification categories (0 or 1) using a Sigmoid function.', practiceInstruction: 'Classification models predict the:', practiceTemplate: 'binary ___', practiceAnswer: 'class', challenges: [
      { type: 'multiple-choice', question: 'What is the output range of the Sigmoid function in Logistic Regression?', options: ['-infinity to +infinity', '0 to 1', '-1 to 1', 'Any integer value'], correctIndex: 1, explanation: 'Sigmoid maps outputs to probabilities between 0 and 1.' },
      { type: 'fill-blank', question: 'Classify binary target values:', template: 'binary ___', answer: 'class', explanation: 'Classification assigns items to a class.' }
    ] },
    { slug: 'ai-2-3', title: 'Decision Trees', exampleLanguage: 'python', exampleCode: 'node = {"feature": "price", "threshold": 50}', exampleExplanation: 'Decision Trees split datasets into subsets based on feature criteria, creating a tree-like model of decisions.', practiceInstruction: 'Decision tree splits start at the:', practiceTemplate: '___ node', practiceAnswer: 'root', challenges: [
      { type: 'multiple-choice', question: 'What is the top-most node in a decision tree called?', options: ['Leaf node', 'Root node', 'Split node', 'Branch node'], correctIndex: 1, explanation: 'The root node is the starting point of a decision tree.' },
      { type: 'fill-blank', question: 'Complete node terminology:', template: '___ node', answer: 'root', explanation: 'The tree starts at the root node.' }
    ] },
    { slug: 'ai-2-4', title: 'Overfitting Concepts', exampleLanguage: 'python', exampleCode: '# Train acc: 99%, Test acc: 60%\nstatus = "overfitted"', exampleExplanation: 'Overfitting occurs when a model learns training data noise too well, failing to generalize to new, unseen testing data.', practiceInstruction: 'Models that generalize poorly due to over-training are:', practiceTemplate: '___ models', practiceAnswer: 'overfitted', challenges: [
      { type: 'multiple-choice', question: 'What is an indicator of an overfitted model?', options: ['High training error, high testing error', 'Low training error, high testing error', 'Low training error, low testing error', 'High training error, low testing error'], correctIndex: 1, explanation: 'An overfitted model performs well on training data but poorly on test data.' },
      { type: 'fill-blank', question: 'Complete target issue term:', template: '___ model', answer: 'overfitted', explanation: 'Overfitting models fit training data too closely.' }
    ] },
    { slug: 'ai-3-1', title: 'What is a Neuron?', exampleLanguage: 'python', exampleCode: '# sum(w * x) + bias\ninput_val = 1.0\nweight = 0.5\nbias = 0.1', exampleExplanation: 'Artificial Neurons calculate a weighted sum of inputs plus a bias, then apply an activation function.', practiceInstruction: 'Constant added to weighted sums is:', practiceTemplate: 'w * x + ___', practiceAnswer: 'bias', challenges: [
      { type: 'multiple-choice', question: 'What is the input formula for an artificial neuron before activation?', options: ['sum(weights * inputs) + bias', 'weights / inputs', 'inputs - bias', 'weights * bias'], correctIndex: 0, explanation: 'Neurons calculate the dot product of weights and inputs, then add a bias offset.' },
      { type: 'fill-blank', question: 'Define offset constant term:', template: 'w * x + ___', answer: 'bias', explanation: 'Bias shifts the activation function curve.' }
    ] },
    { slug: 'ai-3-2', title: 'Activation Functions', exampleLanguage: 'python', exampleCode: '# ReLU: max(0, x)\noutput = max(0, -5)', exampleExplanation: 'Activation functions introduce non-linearity, allowing neural networks to learn complex non-linear patterns.', practiceInstruction: 'Non-linear function returning 0 for negative values is:', practiceTemplate: '___ activation', practiceAnswer: 'relu', challenges: [
      { type: 'multiple-choice', question: 'Which activation function is defined as max(0, x)?', options: ['Sigmoid', 'Tanh', 'ReLU', 'Softmax'], correctIndex: 2, explanation: 'ReLU (Rectified Linear Unit) outputs x if positive, and 0 otherwise.' },
      { type: 'fill-blank', question: 'ReLU activation function:', template: '___ activation', answer: 'relu', explanation: 'ReLU stands for Rectified Linear Unit.' }
    ] },
    { slug: 'ai-3-3', title: 'Multi-Layer Perceptrons', exampleLanguage: 'python', exampleCode: 'network = {"layers": ["input", "hidden", "output"]}', exampleExplanation: 'MLPs link input, output, and one or more hidden layers of neurons to model non-linear boundaries.', practiceInstruction: 'Layers between inputs and outputs are:', practiceTemplate: '___ layers', practiceAnswer: 'hidden', challenges: [
      { type: 'multiple-choice', question: 'What layer type is positioned between inputs and outputs in neural networks?', options: ['Input layer', 'Hidden layer', 'Output layer', 'Outer layer'], correctIndex: 1, explanation: 'Hidden layers perform the intermediate calculations and feature representations.' },
      { type: 'fill-blank', question: 'Complete layer term:', template: '___ layer', answer: 'hidden', explanation: 'Hidden layers are not directly visible in inputs or outputs.' }
    ] },
    { slug: 'ai-3-4', title: 'Loss & Backpropagation', exampleLanguage: 'python', exampleCode: '# Adjust weights via gradient\ngradient = -0.01', exampleExplanation: 'Loss functions measure prediction error. Backpropagation uses gradients to adjust network weights to minimize loss.', practiceInstruction: 'Algorithm updating weights to minimize loss is:', practiceTemplate: 'gradient ___', practiceAnswer: 'descent', challenges: [
      { type: 'multiple-choice', question: 'What algorithm computes gradients to adjust neural network weights?', options: ['Gradient Descent', 'K-Means', 'Backpropagation', 'Linear Regression'], correctIndex: 2, explanation: 'Backpropagation uses the chain rule to calculate gradients, which Gradient Descent uses to update weights.' },
      { type: 'fill-blank', question: 'Complete optimization algorithm name:', template: 'gradient ___', answer: 'descent', explanation: 'Gradient descent minimizes the loss function.' }
    ] },
    { slug: 'ai-4-1', title: 'Image Pixel Grids', exampleLanguage: 'python', exampleCode: '# Gray image matrix\npixels = [[0, 255], [128, 64]]', exampleExplanation: 'Images are represented as grid matrices of pixels. Grayscale pixels range from 0 (black) to 255 (white).', practiceInstruction: 'Color images use channels for red, green, and:', practiceTemplate: 'RGB ___', practiceAnswer: 'channels', challenges: [
      { type: 'multiple-choice', question: 'What values represent pixels in grayscale digital images?', options: ['0 to 1', '0 to 255', 'Any real number', '-128 to 127'], correctIndex: 1, explanation: 'Grayscale digital images represent pixels with integers from 0 (black) to 255 (white).' },
      { type: 'fill-blank', question: 'RGB image layers:', template: 'RGB ___', answer: 'channels', explanation: 'RGB images have 3 color channels (Red, Green, Blue).' }
    ] },
    { slug: 'ai-4-2', title: 'Convolutions & Kernels', exampleLanguage: 'python', exampleCode: 'kernel = [[-1, 0, 1], [-1, 0, 1]]', exampleExplanation: 'Convolutions slide small matrices (kernels) across images to extract features like edges and textures.', practiceInstruction: 'Filters sliding over image matrices are:', practiceTemplate: '___ matrix', practiceAnswer: 'kernel', challenges: [
      { type: 'multiple-choice', question: 'What does a convolution layer do in image processing?', options: ['Compresses image size', 'Applies a filter matrix to extract spatial features', 'Saves images to disk', 'Flattens images into vectors'], correctIndex: 1, explanation: 'Convolutions apply kernel matrices to detect features like edges.' },
      { type: 'fill-blank', question: 'Kernel matrix filter:', template: '___ matrix', answer: 'kernel', explanation: 'The kernel is the convolution filter matrix.' }
    ] },
    { slug: 'ai-4-3', title: 'Max Pooling Layers', exampleLanguage: 'python', exampleCode: '# Max pool extraction\nvalues = [10, 20, 5, 2]\npool_max = max(values)', exampleExplanation: 'Max Pooling downsamples feature maps by taking the maximum value in a window, reducing dimensionality and parameters.', practiceInstruction: 'Pooling layers extract the:', practiceTemplate: '___ value', practiceAnswer: 'maximum', challenges: [
      { type: 'multiple-choice', question: 'What is the primary purpose of a Max Pooling layer?', options: ['To add non-linearity', 'To downsample feature maps and reduce parameters', 'To class output bounds', 'To normal weights values'], correctIndex: 1, explanation: 'Max pooling reduces image dimensions, saving computation and preventing overfitting.' },
      { type: 'fill-blank', question: 'Identify pooling type:', template: '___ pooling', answer: 'max', explanation: 'Max pooling extracts the maximum value.' }
    ] },
    { slug: 'ai-4-4', title: 'CNN Architectures', exampleLanguage: 'python', exampleCode: 'cnn = ["conv", "pool", "flatten", "dense"]', exampleExplanation: 'Convolutional Neural Networks stack convolution, pooling, and dense layers to classify images.', practiceInstruction: 'CNN stands for ___ Neural Network:', practiceTemplate: '___ neural network', practiceAnswer: 'convolutional', challenges: [
      { type: 'multiple-choice', question: 'Which network type is best suited for visual recognition tasks?', options: ['Recurrent Neural Network (RNN)', 'Convolutional Neural Network (CNN)', 'Linear Regression', 'Decision Tree'], correctIndex: 1, explanation: 'CNNs preserve spatial properties, making them highly effective for computer vision.' },
      { type: 'fill-blank', question: 'CNN name:', template: '___ neural network', answer: 'convolutional', explanation: 'CNN stands for Convolutional Neural Network.' }
    ] },
    { slug: 'ai-5-1', title: 'Text Tokenization', exampleLanguage: 'python', exampleCode: 'sentence = "Learn Station AI"\ntokens = sentence.split(" ")', exampleExplanation: 'Tokenization splits raw text strings into smaller units (tokens) like words or subwords.', practiceInstruction: 'Split text into word units:', practiceTemplate: 'text.___(" ")', practiceAnswer: 'split', challenges: [
      { type: 'multiple-choice', question: 'What is tokenization in NLP?', options: ['Converting words to vectors', 'Splitting text strings into word or subword tokens', 'Correcting grammar errors', 'Translating languages'], correctIndex: 1, explanation: 'Tokenization breaks sentences down into token units that models can process.' },
      { type: 'fill-blank', question: 'Tokenize text using split:', template: 'sentence.___(" ")', answer: 'split', explanation: 'A basic way to tokenize is to split strings by spaces.' }
    ] },
    { slug: 'ai-5-2', title: 'Word Embeddings', exampleLanguage: 'python', exampleCode: '# Word mapped to vector\nembedding = {"cat": [0.25, -0.12, 0.84]}', exampleExplanation: 'Word embeddings represent words as dense vectors in a continuous multi-dimensional space, capturing semantic meanings.', practiceInstruction: 'Embeddings represent words as:', practiceTemplate: 'word ___', practiceAnswer: 'vectors', challenges: [
      { type: 'multiple-choice', question: 'How do word embeddings represent words?', options: ['As string objects', 'As dense numerical vectors capturing semantic meanings', 'As integer index keys', 'As binary matrices'], correctIndex: 1, explanation: 'Embeddings map words to multi-dimensional vectors where semantic similarities align.' },
      { type: 'fill-blank', question: 'Complete vector term:', template: 'word ___', answer: 'vector', explanation: 'Word embeddings map words to numerical vectors.' }
    ] },
    { slug: 'ai-5-3', title: 'RNNs & LSTMs', exampleLanguage: 'python', exampleCode: 'state = "sequential_memory"', exampleExplanation: 'RNNs process sequential text datasets. LSTMs add memory gates to retain long-term dependencies in sentences.', practiceInstruction: 'RNN stands for ___ Neural Network:', practiceTemplate: '___ neural network', practiceAnswer: 'recurrent', challenges: [
      { type: 'multiple-choice', question: 'What limitation of standard RNNs do LSTMs resolve?', options: ['They speed up training', 'They resolve the vanishing gradient problem in long sequences', 'They format text parameters', 'They reduce memory usage'], correctIndex: 1, explanation: 'LSTMs use memory gates to retain long-range context, preventing vanishing gradients.' },
      { type: 'fill-blank', question: 'RNN name:', template: '___ neural network', answer: 'recurrent', explanation: 'RNN stands for Recurrent Neural Network.' }
    ] },
    { slug: 'ai-5-4', title: 'The Attention Mechanism', exampleLanguage: 'python', exampleCode: 'attention = {"query": 1, "key": 1, "value": 1}', exampleExplanation: 'Attention calculates relevance scores between word tokens, allowing models to focus on specific context in sentences.', practiceInstruction: 'Self-attention calculates relevance using query, value, and:', practiceTemplate: 'query, value, and ___', practiceAnswer: 'key', challenges: [
      { type: 'multiple-choice', question: 'What does the attention mechanism do?', options: ['Processes words one by one', 'Calculates relevance scores to focus on key contextual words', 'Reduces model weight metrics', 'Encrypts text documents'], correctIndex: 1, explanation: 'Attention computes relevance weights between words, bypassing sequence iteration.' },
      { type: 'fill-blank', question: 'Identify mechanism name:', template: '___ mechanism', answer: 'attention', explanation: 'The attention mechanism is the core of modern NLP.' }
    ] },
    { slug: 'ai-6-1', title: 'Transformer Model', exampleLanguage: 'python', exampleCode: 'model = "Transformer"', exampleExplanation: 'Transformers replace recurrence with self-attention, processing entire text sequences in parallel for faster training.', practiceInstruction: 'The core layer in Transformers is:', practiceTemplate: 'self-___ layer', practiceAnswer: 'attention', challenges: [
      { type: 'multiple-choice', question: 'What architecture is the foundation of modern Large Language Models?', options: ['Recurrent Neural Network', 'Transformer', 'Decision Tree', 'Convolutional Network'], correctIndex: 1, explanation: 'The Transformer architecture powers virtually all modern state-of-the-art LLMs.' },
      { type: 'fill-blank', question: 'Complete mechanism layer term:', template: 'self-___ layer', answer: 'attention', explanation: 'Self-attention identifies connections between words.' }
    ] },
    { slug: 'ai-6-2', title: 'What is an LLM?', exampleLanguage: 'python', exampleCode: 'llm = "Large Language Model"', exampleExplanation: 'Large Language Models are deep learning networks trained on massive text corpora to predict the next word token.', practiceInstruction: 'LLM stands for:', practiceTemplate: '___ Language Model', practiceAnswer: 'Large', challenges: [
      { type: 'multiple-choice', question: 'What objective are LLMs trained on?', options: ['Predicting the next word token in a text sequence', 'Running data calculations', 'Generating database schemas', 'Image classification'], correctIndex: 0, explanation: 'LLMs are trained to predict the next token in a sequence based on preceding context.' },
      { type: 'fill-blank', question: 'LLM acronym:', template: 'Large ___ Model', answer: 'Language', explanation: 'The L in LLM stands for Language.' }
    ] },
    { slug: 'ai-6-3', title: 'System Instructions', exampleLanguage: 'python', exampleCode: 'system_role = "helpful coding tutor"', exampleExplanation: 'System prompts establish rules, persona, and boundaries for LLM behavior before user prompts are evaluated.', practiceInstruction: 'Instruction guiding overall model behavior is:', practiceTemplate: '___ instruction', practiceAnswer: 'system', challenges: [
      { type: 'multiple-choice', question: 'What is the purpose of a system prompt?', options: ['To ask user questions', 'To define the model persona, rules, and boundaries', 'To clear the chat history', 'To speed up query processing'], correctIndex: 1, explanation: 'System instructions set the background context and rules that govern response behaviors.' },
      { type: 'fill-blank', question: 'Complete instruction term:', template: '___ instruction', answer: 'system', explanation: 'System instructions establish the agent persona.' }
    ] },
    { slug: 'ai-6-4', title: 'Few-Shot Prompting', exampleLanguage: 'python', exampleCode: 'prompt = "Input: positive -> Output: 😊\\nInput: negative -> Output: 😞"', exampleExplanation: 'Few-shot prompting provides example inputs and expected outputs to guide the LLM format accuracy.', practiceInstruction: 'Providing examples in LLM prompts is:', practiceTemplate: '___-shot prompting', practiceAnswer: 'few', challenges: [
      { type: 'multiple-choice', question: 'How does few-shot prompting improve outputs?', options: ['It trains model weights permanently', 'It provides context examples showing expected formatting rules', 'It reduces token count charges', 'It bypasses safety guards'], correctIndex: 1, explanation: 'Examples in prompts clarify complex output schemas for the model in context.' },
      { type: 'fill-blank', question: 'Specify prompting type:', template: '___-shot prompting', answer: 'few', explanation: 'Few-shot prompting uses context examples.' }
    ] }
  ],

  // --- DATA SCIENCE (24 lessons) ---
  'datascience': [
    { slug: 'datascience-1-1', title: 'DS Lifecycle', exampleLanguage: 'python', exampleCode: '# Steps: Collect -> Clean -> Analyze -> Model', exampleExplanation: 'Data Science extracts insights from data. The lifecycle spans data collection, cleaning, exploration, modeling, and deployment.', practiceInstruction: 'The first step in data lifecycle is:', practiceTemplate: 'data ___', practiceAnswer: 'collection', challenges: [
      { type: 'multiple-choice', question: 'Which stage follows data collection in the lifecycle?', options: ['Model deployment', 'Data cleaning and preparation', 'Statistical testing', 'Presenting results'], correctIndex: 1, explanation: 'Collected data is often messy, requiring cleaning before analysis.' },
      { type: 'fill-blank', question: 'Acquire raw data sets:', template: 'data ___', answer: 'collection', explanation: 'Data collection gathers target raw inputs.' }
    ] },
    { slug: 'datascience-1-2', title: 'Mean & Median', exampleLanguage: 'python', exampleCode: 'data = [10, 20, 20, 50, 100]\nmean_val = sum(data) / len(data)', exampleExplanation: 'Mean is the average value. Median is the middle value of a sorted dataset, which is more robust to outliers.', practiceInstruction: 'Arithmetic average is the:', practiceTemplate: '___ value', practiceAnswer: 'mean', challenges: [
      { type: 'multiple-choice', question: 'Which statistical metric is least affected by extreme outlier values?', options: ['Mean', 'Median', 'Sum', 'Variance'], correctIndex: 1, explanation: 'The median represents the middle value, remaining stable even with extreme outliers.' },
      { type: 'fill-blank', question: 'Calculate average value:', template: '___ value', answer: 'mean', explanation: 'The mean is the average.' }
    ] },
    { slug: 'datascience-1-3', title: 'NumPy Arrays', exampleLanguage: 'python', exampleCode: 'import numpy as np\narr = np.array([1, 2, 3])\nprint(arr * 2)', exampleExplanation: 'NumPy provides fast, vector-optimized numeric array objects. Operations are applied element-wise.', practiceInstruction: 'Import numpy library alias:', practiceTemplate: 'import numpy as ___', practiceAnswer: 'np', challenges: [
      { type: 'multiple-choice', question: 'Why are NumPy arrays preferred over standard Python lists for numeric calculations?', options: ['They use less memory and support fast vector operations', 'They can store mixed text styles', 'They are immutable', 'They are defined in HTML'], correctIndex: 0, explanation: 'NumPy arrays store homogeneous types, allowing optimized C-based vector operations.' },
      { type: 'fill-blank', question: 'Convert list to numpy array:', template: 'arr = np.___([1, 2, 3])', answer: 'array', explanation: 'np.array() instantiates NumPy arrays.' }
    ] },
    { slug: 'datascience-1-4', title: 'Array Aggregations', exampleLanguage: 'python', exampleCode: 'import numpy as np\narr = np.array([1, 2, 3])\nprint(np.sum(arr))\nprint(np.std(arr))', exampleExplanation: 'Computes statistical summaries (sum, mean, std deviation) efficiently across multi-dimensional arrays.', practiceInstruction: 'Calculate standard deviation in numpy:', practiceTemplate: 'deviation = np.___ (arr)', practiceAnswer: 'std', challenges: [
      { type: 'multiple-choice', question: 'What does standard deviation measure?', options: ['The sum of the values', 'The spread of the dataset relative to its mean', 'The middle value', 'The percentage of nulls'], correctIndex: 1, explanation: 'Standard deviation quantifies dispersion and data spread around the mean.' },
      { type: 'fill-blank', question: 'Calculate array sum:', template: 'total = np.___ (arr)', answer: 'sum', explanation: 'np.sum() calculates the total.' }
    ] },
    { slug: 'datascience-2-1', title: 'Pandas DataFrames', exampleLanguage: 'python', exampleCode: 'import pandas as pd\ndf = pd.read_csv("data.csv")\nprint(df.head())', exampleExplanation: 'Pandas DataFrames are 2D tabular data structures with labeled columns and index rows, similar to SQL tables.', practiceInstruction: 'Import pandas library alias:', practiceTemplate: 'import pandas as ___', practiceAnswer: 'pd', challenges: [
      { type: 'multiple-choice', question: 'What is a Pandas DataFrame?', options: ['A 1D array object', 'A 2D labeled tabular data structure', 'A database connection string', 'A charting library'], correctIndex: 1, explanation: 'A DataFrame represents tabular data with rows and columns.' },
      { type: 'fill-blank', question: 'Read CSV file using pandas:', template: 'df = pd.___ ("data.csv")', answer: 'read_csv', explanation: 'read_csv() loads CSV data into DataFrames.' }
    ] },
    { slug: 'datascience-2-2', title: 'Selecting Data', exampleLanguage: 'python', exampleCode: 'names = df["first_name"]\nsubset = df[["name", "age"]]', exampleExplanation: 'Selects specific columns using bracket notation. Double brackets retrieve multiple columns as a DataFrame.', practiceInstruction: 'Select the email column:', practiceTemplate: 'emails = df["___"]', practiceAnswer: 'email', challenges: [
      { type: 'multiple-choice', question: 'Which syntax retrieves the single column "age" from DataFrame `df`?', options: ['df("age")', 'df["age"]', 'df.get_column("age")', 'df{age}'], correctIndex: 1, explanation: 'Use square brackets with string column names to extract columns.' },
      { type: 'fill-blank', question: 'Select name column:', template: 'names = df["___"]', answer: 'name', explanation: 'Pass the column name as a string key.' }
    ] },
    { slug: 'datascience-2-3', title: 'Filtering Rows', exampleLanguage: 'python', exampleCode: 'active_users = df[df["active"] == True]\nprint(active_users)', exampleExplanation: 'Filters rows by passing boolean condition masks inside DataFrame bracket selections.', practiceInstruction: 'Filter rows where age is above 30:', practiceTemplate: 'filtered = df[df["age"] ___ 30]', practiceAnswer: '>', challenges: [
      { type: 'multiple-choice', question: 'How is row filtering achieved in Pandas?', options: ['By deleting rows manually', 'By passing boolean series masks inside brackets', 'By sorting columns', 'Using SQL queries directly'], correctIndex: 1, explanation: 'Boolean indexing evaluates conditions per row, returning only rows that resolve to True.' },
      { type: 'fill-blank', question: 'Filter users where active is True:', template: 'active = df[df["active"] ___ True]', answer: '==', explanation: 'Use == to check equality.' }
    ] },
    { slug: 'datascience-2-4', title: 'Wrangling head/tail', exampleLanguage: 'python', exampleCode: 'print(df.head(5))\nprint(df.tail(2))', exampleExplanation: 'Inspects DataFrame samples using head() (first N rows) and tail() (last N rows).', practiceInstruction: 'View first 10 rows:', practiceTemplate: 'df.___ (10)', practiceAnswer: 'head', challenges: [
      { type: 'multiple-choice', question: 'What does `df.head()` do by default if no arguments are passed?', options: ['Returns the last 5 rows', 'Returns the first 5 rows', 'Returns the column names', 'Returns the row count'], correctIndex: 1, explanation: 'head() retrieves the first 5 rows of a DataFrame by default.' },
      { type: 'fill-blank', question: 'View last 5 rows:', template: 'df.___()', answer: 'tail', explanation: 'tail() displays the end of the DataFrame.' }
    ] },
    { slug: 'datascience-3-1', title: 'Handling Nulls', exampleLanguage: 'python', exampleCode: 'clean_df = df.dropna()\nfilled_df = df.fillna(0)', exampleExplanation: 'Cleans missing data. dropna() deletes rows with null values; fillna() replaces nulls with default values.', practiceInstruction: 'Fill null values with 0:', practiceTemplate: 'df.___ (0)', practiceAnswer: 'fillna', challenges: [
      { type: 'multiple-choice', question: 'Which method deletes all rows containing missing (NaN) values?', options: ['fillna()', 'dropna()', 'clean()', 'remove_null()'], correctIndex: 1, explanation: 'dropna() removes any rows that have missing values.' },
      { type: 'fill-blank', question: 'Fill null values:', template: 'df.___ (0)', answer: 'fillna', explanation: 'fillna() replaces missing entries.' }
    ] },
    { slug: 'datascience-3-2', title: 'Merging Tables', exampleLanguage: 'python', exampleCode: 'merged = pd.merge(df1, df2, on="user_id")', exampleExplanation: 'Combines two DataFrames using a shared key column, similar to SQL joins.', practiceInstruction: 'Merge df1 and df2 on user_id key:', practiceTemplate: 'pd.___ (df1, df2, on="user_id")', practiceAnswer: 'merge', challenges: [
      { type: 'multiple-choice', question: 'Which Pandas function combines DataFrames based on a shared key column?', options: ['pd.concat()', 'pd.merge()', 'pd.join_columns()', 'pd.combine()'], correctIndex: 1, explanation: 'pd.merge() joins datasets using key values.' },
      { type: 'fill-blank', question: 'Combine DataFrames on key:', template: 'pd.___ (df1, df2, on="id")', answer: 'merge', explanation: 'merge performs relational joins.' }
    ] },
    { slug: 'datascience-3-3', title: 'Type Conversions', exampleLanguage: 'python', exampleCode: 'df["age"] = df["age"].astype(int)\nprint(df["age"].dtype)', exampleExplanation: 'Changes column data types explicitly using the astype() method.', practiceInstruction: 'Convert column types to float:', practiceTemplate: "df['price'] = df['price'].___ (float)", practiceAnswer: 'astype', challenges: [
      { type: 'multiple-choice', question: 'Which method converts Pandas column types?', options: ['convert()', 'astype()', 'to_type()', 'cast()'], correctIndex: 1, explanation: 'astype() is the standard method for casting Pandas column data types.' },
      { type: 'fill-blank', question: 'Cast column to int:', template: "df['age'] = df['age'].___(int)", answer: 'astype', explanation: 'astype() alters column storage types.' }
    ] },
    { slug: 'datascience-3-4', title: 'Aggregating Groups', exampleLanguage: 'python', exampleCode: 'grouped = df.groupby("category")["price"].mean()', exampleExplanation: 'Groups rows based on shared column values and calculates summary aggregates (like mean or count) per group.', practiceInstruction: 'Group DataFrame rows by category:', practiceTemplate: "df.___ ('category')['price'].sum()", practiceAnswer: 'groupby', challenges: [
      { type: 'multiple-choice', question: 'What does `df.groupby("category").mean()` calculate?', options: ['The overall mean of the DataFrame', 'The mean of columns grouped by distinct category values', 'The mean of the category column itself', 'It groups column names'], correctIndex: 1, explanation: 'It computes averages for numeric columns within each category group.' },
      { type: 'fill-blank', question: 'Complete group aggregates syntax:', template: "df.___('role')['salary'].mean()", answer: 'groupby', explanation: 'groupby creates aggregated subsets.' }
    ] },
    { slug: 'datascience-4-1', title: 'Plotting Lines', exampleLanguage: 'python', exampleCode: 'import matplotlib.pyplot as plt\nplt.plot([1, 2], [10, 20])\nplt.show()', exampleExplanation: 'Generates line plots using Matplotlib. plt.show() renders the chart window.', practiceInstruction: 'Import matplotlib plotting module:', practiceTemplate: 'import matplotlib.pyplot as ___', practiceAnswer: 'plt', challenges: [
      { type: 'multiple-choice', question: 'What Matplotlib function renders the plot output window?', options: ['plt.render()', 'plt.plot()', 'plt.show()', 'plt.display()'], correctIndex: 2, explanation: 'plt.show() displays the created figures on screen.' },
      { type: 'fill-blank', question: 'Import plotter alias:', template: 'import matplotlib.pyplot as ___', answer: 'plt', explanation: 'By convention, pyplot is imported as plt.' }
    ] },
    { slug: 'datascience-4-2', title: 'Plotting Columns', exampleLanguage: 'python', exampleCode: 'import matplotlib.pyplot as plt\nplt.bar(["A", "B"], [10, 20])', exampleExplanation: 'Creates bar charts using plt.bar() to compare categorical quantities.', practiceInstruction: 'Create a bar chart:', practiceTemplate: 'plt.___ (["A", "B"], [5, 10])', practiceAnswer: 'bar', challenges: [
      { type: 'multiple-choice', question: 'Which function creates a vertical bar chart in Matplotlib?', options: ['plt.plot()', 'plt.bar()', 'plt.hist()', 'plt.column()'], correctIndex: 1, explanation: 'plt.bar() generates vertical bar chart figures.' },
      { type: 'fill-blank', question: 'Plot bar chart metrics:', template: 'plt.___ (labels, heights)', answer: 'bar', explanation: 'Use bar to compare categorical metrics.' }
    ] },
    { slug: 'datascience-4-3', title: 'Seaborn Plotting', exampleLanguage: 'python', exampleCode: 'import seaborn as sns\nsns.scatterplot(x="age", y="price", data=df)', exampleExplanation: 'Seaborn builds complex statistical charts (like scatter plots and heatmaps) with cleaner default styles than Matplotlib.', practiceInstruction: 'Import seaborn alias:', practiceTemplate: 'import seaborn as ___', practiceAnswer: 'sns', challenges: [
      { type: 'multiple-choice', question: 'What is a primary advantage of Seaborn over raw Matplotlib?', options: ['It runs queries faster', 'It provides high-level APIs for statistical charts with built-in styling', 'It does not require python', 'It runs only on SQL databases'], correctIndex: 1, explanation: 'Seaborn wraps Matplotlib, offering simpler APIs for visual statistical comparisons.' },
      { type: 'fill-blank', question: 'Import Seaborn library:', template: 'import seaborn as ___', answer: 'sns', explanation: 'Conventionally, seaborn is imported as sns.' }
    ] },
    { slug: 'datascience-4-4', title: 'Labels & Styling', exampleLanguage: 'python', exampleCode: 'plt.plot([1, 2], [10, 20])\nplt.title("Growth")\nplt.xlabel("Time")', exampleExplanation: 'Customizes charts by adding descriptive elements like title(), xlabel(), and ylabel().', practiceInstruction: 'Add a chart title:', practiceTemplate: 'plt.___ ("Project Growth")', practiceAnswer: 'title', challenges: [
      { type: 'multiple-choice', question: 'Which function labels the horizontal x-axis of a plot?', options: ['plt.title()', 'plt.xlabel()', 'plt.ylabel()', 'plt.x_axis()'], correctIndex: 1, explanation: 'plt.xlabel() sets the horizontal axis label text.' },
      { type: 'fill-blank', question: 'Set vertical y-axis labels:', template: 'plt.___ ("Revenue ($)")', answer: 'ylabel', explanation: 'ylabel sets the vertical axis title.' }
    ] },
    { slug: 'datascience-5-1', title: 'EDA Correlation', exampleLanguage: 'python', exampleCode: 'corr_matrix = df.corr(numeric_only=True)\nprint(corr_matrix)', exampleExplanation: 'Exploratory Data Analysis (EDA) calculates correlations between numeric variables, ranging from -1 to +1.', practiceInstruction: 'Calculate correlation matrix:', practiceTemplate: 'corr = df.___()', practiceAnswer: 'corr', challenges: [
      { type: 'multiple-choice', question: 'What does a correlation score of -0.9 indicate?', options: ['No relationship', 'Strong positive relationship', 'Strong negative relationship', 'Weak positive relationship'], correctIndex: 2, explanation: 'Scores close to -1 indicate strong negative relationships, where one variable decreases as the other increases.' },
      { type: 'fill-blank', question: 'Call correlation method:', template: 'matrix = df.___()', answer: 'corr', explanation: 'corr() calculates correlation coefficients.' }
    ] },
    { slug: 'datascience-5-2', title: 'Detecting Outliers', exampleLanguage: 'python', exampleCode: '# Interquartile Range\nq1 = df["price"].quantile(0.25)\nq3 = df["price"].quantile(0.75)\niqr = q3 - q1', exampleExplanation: 'Identifies outliers using mathematical criteria like the Interquartile Range (IQR) or standard deviation boundaries.', practiceInstruction: 'Calculate the interquartile range (IQR):', practiceTemplate: 'iqr = q3 - ___', practiceAnswer: 'q1', challenges: [
      { type: 'multiple-choice', question: 'What are outlier values in data science?', options: ['Missing values', 'Extreme values that deviate significantly from the rest of the dataset', 'Labels in classification', 'Column titles'], correctIndex: 1, explanation: 'Outliers are data points that lie far away from the distribution mean.' },
      { type: 'fill-blank', question: 'Calculate IQR range:', template: 'iqr = q3 - ___', answer: 'q1', explanation: 'IQR is computed as q3 - q1.' }
    ] },
    { slug: 'datascience-5-3', title: 'Feature Engineering', exampleLanguage: 'python', exampleCode: 'df["price_per_sqft"] = df["price"] / df["sqft"]', exampleExplanation: 'Creates new feature columns from raw data attributes to improve machine learning model performance.', practiceInstruction: 'Create a calculated column:', practiceTemplate: 'df["total"] = df["price"] ___ df["tax"]', practiceAnswer: '+', challenges: [
      { type: 'multiple-choice', question: 'What is feature engineering?', options: ['Deleting noisy features', 'Creating new features from raw input data to improve predictive accuracy', 'Training model weights', 'Visualizing datasets'], correctIndex: 1, explanation: 'Feature engineering builds new inputs to help models identify training patterns.' },
      { type: 'fill-blank', question: 'Create calculated feature column:', template: 'df["total"] = df["price"] ___ df["tax"]', answer: '+', explanation: 'Perform basic math to combine features.' }
    ] },
    { slug: 'datascience-5-4', title: 'Data Binning', exampleLanguage: 'python', exampleCode: 'categories = pd.cut(df["age"], bins=[0, 18, 65, 100])', practiceInstruction: 'Bin numeric data using cut:', practiceTemplate: 'buckets = pd.___ (df["age"], bins=3)', practiceAnswer: 'cut', exampleExplanation: 'Converts continuous variables into categorical intervals (bins) using pd.cut().', challenges: [
      { type: 'multiple-choice', question: 'Which Pandas function segments continuous numeric values into interval bins?', options: ['pd.cut()', 'pd.segment()', 'pd.group_bins()', 'pd.split()'], correctIndex: 0, explanation: 'pd.cut() divides continuous values into discrete interval bins.' },
      { type: 'fill-blank', question: 'Segment values into bins:', template: 'groups = pd.___ (df["age"], bins=3)', answer: 'cut', explanation: 'pd.cut() bins numeric data.' }
    ] },
    { slug: 'datascience-6-1', title: 'Model Pipelines', exampleLanguage: 'python', exampleCode: 'from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()', exampleExplanation: 'Initializes Scikit-Learn models. ML projects use Scikit-Learn pipelines to scale features and train estimators.', practiceInstruction: 'Import linear regression model:', practiceTemplate: 'from sklearn.linear_model import ___', practiceAnswer: 'LinearRegression', challenges: [
      { type: 'multiple-choice', question: 'What Python library is the industry standard for classical machine learning algorithms?', options: ['Pandas', 'Scikit-Learn (sklearn)', 'TensorFlow', 'Matplotlib'], correctIndex: 1, explanation: 'Scikit-Learn (sklearn) is the default library for classical machine learning models.' },
      { type: 'fill-blank', question: 'Import Linear Regression:', template: 'from sklearn.linear_model import ___', answer: 'LinearRegression', explanation: 'LinearRegression is the regression class.' }
    ] },
    { slug: 'datascience-6-2', title: 'Feature Scaling', exampleLanguage: 'python', exampleCode: 'from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()', exampleExplanation: 'Normalizes feature scales. Scaling ensures that large value features do not disproportionately bias the model.', practiceInstruction: 'Import standard scaler:', practiceTemplate: 'from sklearn.preprocessing import ___', practiceAnswer: 'StandardScaler', challenges: [
      { type: 'multiple-choice', question: 'Why is feature scaling important before training distance-based models?', options: ['It compresses file sizes', 'It prevents features with large numeric ranges from dominating distance metrics', 'It deletes null rows', 'It is required by compiler languages'], correctIndex: 1, explanation: 'Feature scaling normalizes numeric ranges so all inputs contribute equally.' },
      { type: 'fill-blank', question: 'Import StandardScaler:', template: 'from sklearn.preprocessing import ___', answer: 'StandardScaler', explanation: 'StandardScaler normalizes values to mean=0 and std=1.' }
    ] },
    { slug: 'datascience-6-3', title: 'Train Test Split', exampleLanguage: 'python', exampleCode: 'from sklearn.model_selection import train_test_split\nx_train, x_test, y_train, y_test = train_test_split(x, y)', exampleExplanation: 'Splits datasets into training and testing subsets to validate model generalization performance.', practiceInstruction: 'Import train_test_split:', practiceTemplate: 'from sklearn.model_selection import ___', practiceAnswer: 'train_test_split', challenges: [
      { type: 'multiple-choice', question: 'Why do we split datasets into training and testing subsets?', options: ['To save computation time', 'To evaluate model performance on unseen data and detect overfitting', 'To double the amount of data', 'To sort input records'], correctIndex: 1, explanation: 'Testing subsets validate whether models generalize well to new data.' },
      { type: 'fill-blank', question: 'Import split helper function:', template: 'from sklearn.model_selection import ___', answer: 'train_test_split', explanation: 'train_test_split is the helper function.' }
    ] },
    { slug: 'datascience-6-4', title: 'Model Evaluation', exampleLanguage: 'python', exampleCode: 'score = model.score(x_test, y_test)\nprint(score)', exampleExplanation: 'Evaluates trained models using test data, calculating accuracy or R-squared metrics.', practiceInstruction: 'Score the trained model:', practiceTemplate: 'accuracy = model.___ (x_test, y_test)', practiceAnswer: 'score', challenges: [
      { type: 'multiple-choice', question: 'What does a model score of 0.85 in classification indicate?', options: ['85% error rate', '85% correct predictions on test data', '85% outlier count', '85% data loss'], correctIndex: 1, explanation: 'Classifier score() returns the mean prediction accuracy on test features.' },
      { type: 'fill-blank', question: 'Evaluate model score:', template: 'acc = model.___ (x_test, y_test)', answer: 'score', explanation: 'score() evaluates prediction accuracy.' }
    ] }
  ],

  // --- JAVA (24 lessons) ---
  'java': [
    { slug: 'java-1-1', title: 'Java Basics', exampleLanguage: 'java', exampleCode: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Java!");\n  }\n}', exampleExplanation: 'Java is class-based. Every application runs from a public static void main method.', practiceInstruction: '**Scenario:** Print a startup log indicating that the SaaS application server has booted up.\n**Objective:** Print the exact string `"SaaS Online"` using Java\'s standard console logging method.\n**Hint:** Use `System.out.println("...");` to output to the console.', practiceTemplate: 'public class Main {\n  public static void main(String[] args) {\n    // Print SaaS Online below\n    \n  }\n}', practiceAnswer: 'System.out.println("SaaS Online");', challenges: [
      { type: 'multiple-choice', question: 'What is the entry point method for Java applications?', options: ['init()', 'main()', 'start()', 'run()'], correctIndex: 1, explanation: 'The JVM launches programs from the public static void main(String[] args) method.' },
      { type: 'fill-blank', question: 'Print text in Java:', template: 'System.out.___("Hi");', answer: 'println', explanation: 'System.out.println() prints values followed by a newline.' }
    ] },
    { slug: 'java-1-2', title: 'Explicit Variable Types', exampleLanguage: 'java', exampleCode: 'int age = 25;\ndouble price = 19.99;\nboolean active = true;', exampleExplanation: 'Java is statically typed, meaning you must declare variable types explicitly before using them.', practiceInstruction: '**Scenario:** Define configurations for an API request limiter.\n**Objective:** Declare a variable `subscriptionPrice` of type `double` set to `49.99` and a variable `userCount` of type `int` set to `25`.\n**Hint:** Every statement in Java must end with a semicolon (`;`).', practiceTemplate: 'public class Main {\n  public static void main(String[] args) {\n    // Declare subscriptionPrice and userCount variables below\n    \n  }\n}', practiceAnswer: 'double subscriptionPrice = 49.99;\nint userCount = 25;', challenges: [
      { type: 'multiple-choice', question: 'What does statically typed mean in Java?', options: ['Variables can hold any type of data', 'Variable types are checked at compile time and cannot change', 'Code runs without compilers', 'Variable values are always static constants'], correctIndex: 1, explanation: 'Statically typed languages require defining data types at compilation, preventing type changes at runtime.' },
      { type: 'fill-blank', question: 'Declare integer age variable type:', template: '___ age = 30;', answer: 'int', explanation: 'int is the primitive type for integers.' }
    ] },
    { slug: 'java-1-3', title: 'Java Arithmetic', exampleLanguage: 'java', exampleCode: 'int total = 10 + 5 * 2;\nSystem.out.println(total);', exampleExplanation: 'Supports standard arithmetic (+, -, *, /) and follows operator precedence rules.', practiceInstruction: '**Scenario:** Distribute a batch of items evenly among users and determine the remainder.\n**Objective:** Declare an integer variable `remainingItems` and calculate the remainder of `items` divided by `users` using the modulus operator (`%`).\n**Hint:** Use `%` for modulus calculation.', practiceTemplate: 'public class Main {\n  public static void main(String[] args) {\n    int items = 103;\n    int users = 10;\n    \n    // Calculate remainingItems below\n    \n  }\n}', practiceAnswer: 'int remainingItems = items % users;', challenges: [
      { type: 'multiple-choice', question: 'What is the result of 5 / 2 using Java integer division?', options: ['2.5', '2', '3', '0'], correctIndex: 1, explanation: 'Integer division discards fractional remainders, returning 2.' },
      { type: 'fill-blank', question: 'Calculate remainder (modulo):', template: 'int rem = 10 ___ 3;', answer: '%', explanation: 'Use the % operator to calculate remainders.' }
    ] },
    { slug: 'java-1-4', title: 'Java String Class', exampleLanguage: 'java', exampleCode: 'String greeting = "Welcome";\nint len = greeting.length();', exampleExplanation: 'Strings are immutable objects in Java, providing methods like length(), concat(), and equals().', practiceInstruction: '**Scenario:** Clean user email submissions during register flows.\n**Objective:** Call the `.toLowerCase()` method on the string variable `email` and print the normalized result using `System.out.println`.\n**Hint:** Methods on objects are called using dot notation, e.g. `str.toLowerCase()`.', practiceTemplate: 'public class Main {\n  public static void main(String[] args) {\n    String email = "USER@EXAMPLE.COM";\n    \n    // Normalize email to lowercase and print it below\n    \n  }\n}', practiceAnswer: 'System.out.println(email.toLowerCase());', challenges: [
      { type: 'multiple-choice', question: 'How do you compare string equality in Java?', options: ['Using the == operator', 'Using the .equals() method', 'Using the compare() function', 'Strings are compared automatically'], correctIndex: 1, explanation: '== compares reference memory addresses. equals() compares actual character sequences.' },
      { type: 'fill-blank', question: 'Compare string equality:', template: 'if (s1.___ (s2)) {}', answer: 'equals', explanation: 'Use equals() for string comparisons.' }
    ] },
    { slug: 'java-2-1', title: 'Branching (If)', exampleLanguage: 'java', exampleCode: 'int score = 85;\nif (score >= 70) {\n  System.out.println("Pass");\n}', exampleExplanation: 'Branching logic uses if statements. Code blocks are enclosed in curly braces {}.', practiceInstruction: '**Scenario:** Apply free-shipping promotions automatically on checkout totals.\n**Objective:** Write an `if` statement that checks if `cartTotal` is greater than or equal to `50`. If so, assign the boolean variable `freeShipping` to `true`.\n**Hint:** Java boolean values are `true` and `false` (lowercase).', practiceTemplate: 'public class Main {\n  public static void main(String[] args) {\n    double cartTotal = 59.99;\n    boolean freeShipping = false;\n    \n    // Write if statement below\n    \n  }\n}', practiceAnswer: 'if (cartTotal >= 50) {\n      freeShipping = true;\n    }', challenges: [
      { type: 'multiple-choice', question: 'Which brackets define code blocks in Java?', options: ['Parentheses ()', 'Square brackets []', 'Curly braces {}', 'Angle brackets <>'], correctIndex: 2, explanation: 'Curly braces {} encapsulate statement blocks in Java.' },
      { type: 'fill-blank', question: 'Verify block execution check:', template: '___ (status == true) {}', answer: 'if', explanation: 'if is the decision structure keyword.' }
    ] },
    { slug: 'java-2-2', title: 'Switch Statements', exampleLanguage: 'java', exampleCode: 'int option = 2;\nswitch (option) {\n  case 1: System.out.println("One"); break;\n  case 2: System.out.println("Two"); break;\n}', exampleExplanation: 'Evaluates switch-case paths against a variable, exiting blocks using break statements.', practiceInstruction: '**Scenario:** Direct a subscription registration request to the correct tier.\n**Objective:** Implement a `switch` block on the integer `tier` variable. Handle `case 1` by printing `"Basic Tier"` and `case 2` by printing `"Pro Tier"`. Remember to include break statements.\n**Hint:** The syntax is `switch (variable) { case value: ... break; }`.', practiceTemplate: 'public class Main {\n  public static void main(String[] args) {\n    int tier = 2;\n    \n    // Write switch statement below\n    \n  }\n}', practiceAnswer: 'switch (tier) {\n      case 1:\n        System.out.println("Basic Tier");\n        break;\n      case 2:\n        System.out.println("Pro Tier");\n        break;\n    }', challenges: [
      { type: 'multiple-choice', question: 'What happens if you omit a break statement inside a switch-case block?', options: ['The program fails to compile', 'Execution falls through to subsequent case blocks', 'It loops infinitely', 'It automatically exits'], correctIndex: 1, explanation: 'Omitting break causes execution to fall through, executing next cases until a break is hit.' },
      { type: 'fill-blank', question: 'Complete switch-case block keyword:', template: 'switch (option) { ___ 1: break; }', answer: 'case', explanation: 'Use the case keyword to define match options.' }
    ] },
    { slug: 'java-2-3', title: 'For Loop Iteration', exampleLanguage: 'java', exampleCode: 'for (int i = 0; i < 3; i++) {\n  System.out.println(i);\n}', exampleExplanation: 'Repeats code loops a set number of times. Includes initialization, condition, and update expressions.', practiceInstruction: '**Scenario:** Generate 5 server nodes indexed 0 to 4.\n**Objective:** Write a `for` loop that iterates 5 times (from `i = 0` to `i < 5`), printing each value using `System.out.println(i)`.\n**Hint:** The loop signature should be `for (int i = 0; i < 5; i++)`.', practiceTemplate: 'public class Main {\n  public static void main(String[] args) {\n    // Write for loop below\n    \n  }\n}', practiceAnswer: 'for (int i = 0; i < 5; i++) {\n      System.out.println(i);\n    }', challenges: [
      { type: 'multiple-choice', question: 'What are the three components of a standard Java for loop signature?', options: ['start, processing, end', 'initialization, loop condition, update expression', 'variable, block, close', 'try, catch, finally'], correctIndex: 1, explanation: 'for loops take an initialization, a terminating condition, and an increment/decrement step.' },
      { type: 'fill-blank', question: 'Complete loop incremental condition:', template: 'for (int i = 0; i < 10; ___)', answer: 'i++', explanation: 'Use i++ to increment variables by 1.' }
    ] },
    { slug: 'java-2-4', title: 'While & Do-While', exampleLanguage: 'java', exampleCode: 'int count = 0;\nwhile (count < 3) {\n  count++;\n}', exampleExplanation: 'do-while loops execute the loop body once before evaluating the loop condition at the end.', practiceInstruction: '**Scenario:** Re-attempt a server database lookup query until a limit is met.\n**Objective:** Write a `while` loop that runs as long as `attempts` is less than `maxAttempts`. Inside the loop body, increment `attempts` by 1.\n**Hint:** Increment using `attempts++` to update the loop counter.', practiceTemplate: 'public class Main {\n  public static void main(String[] args) {\n    int attempts = 0;\n    int maxAttempts = 5;\n    \n    // Write while loop below\n    \n  }\n}', practiceAnswer: 'while (attempts < maxAttempts) {\n      attempts++;\n    }', challenges: [
      { type: 'multiple-choice', question: 'What is a key difference between while and do-while loops?', options: ['while loops do not require variables', 'do-while loops always run the loop body at least once', 'while loops are faster', 'do-while loops cannot run infinitely'], correctIndex: 1, explanation: 'do-while evaluates conditions after running, guaranteeing at least one execution.' },
      { type: 'fill-blank', question: 'Complete do-while loop structure:', template: 'do {} ___ (x < 5);', answer: 'while', explanation: 'do-while loops end with the while keyword and a semicolon.' }
    ] },
    { slug: 'java-3-1', title: 'Java Arrays', exampleLanguage: 'java', exampleCode: 'int[] nums = {10, 20, 30};\nSystem.out.println(nums[0]);', exampleExplanation: 'Arrays store fixed-size, homogeneous elements. Access uses 0-indexed bracket references.', practiceInstruction: '**Scenario:** Define ports to expose on a container service.\n**Objective:** Declare and initialize an integer array named `ports` containing the values `80`, `443`, and `8080`.\n**Hint:** Array initialization syntax in Java uses curly braces, e.g. `int[] arr = {1, 2, 3};`.', practiceTemplate: 'public class Main {\n  public static void main(String[] args) {\n    // Declare and initialize ports array below\n    \n  }\n}', practiceAnswer: 'int[] ports = {80, 443, 8080};', challenges: [
      { type: 'multiple-choice', question: 'What is a characteristics of standard Java arrays?', options: ['Their size is dynamic and can change', 'They can store different types of values', 'Their size is fixed upon instantiation', 'They do not support indexing'], correctIndex: 2, explanation: 'Standard Java arrays have a fixed size defined at allocation.' },
      { type: 'fill-blank', question: 'Retrieve array index size property:', template: 'int size = items.___ ;', answer: 'length', explanation: 'Use the length property (no parentheses) to get array size.' }
    ] },
    { slug: 'java-3-2', title: 'Defining Methods', exampleLanguage: 'java', exampleCode: 'public static int add(int a, int b) {\n  return a + b;\n}', exampleExplanation: 'Declares reusable class functions (methods), specifying return types and parameters.', practiceInstruction: '**Scenario:** Build a subtotal price calculator method for shopping carts.\n**Objective:** Define a public static method named `calculateDiscount` that returns a `double` and takes two parameters: `double price` and `double pct`.\n**Hint:** Write only the method signature and its body.', practiceTemplate: 'public class Main {\n  // Define calculateDiscount method below\n  \n}', practiceAnswer: 'public static double calculateDiscount(double price, double pct) {\n    return price * (1 - pct);\n  }', challenges: [
      { type: 'multiple-choice', question: 'What keyword indicates that a method does not return any values?', options: ['null', 'void', 'empty', 'static'], correctIndex: 1, explanation: 'The void keyword specifies that a method returns no value.' },
      { type: 'fill-blank', question: 'Complete void method declaration:', template: 'public static ___ printMsg() {}', answer: 'void', explanation: 'Use void for methods that print without returning values.' }
    ] },
    { slug: 'java-3-3', title: 'Return statement', exampleLanguage: 'java', exampleCode: 'public static double getPrice() {\n  return 19.99;\n}', exampleExplanation: 'Returns a calculated value to the method caller. The value must match the method return type.', practiceInstruction: '**Scenario:** Resolve the appropriate deployment string status.\n**Objective:** Complete the method `getStatus` by returning the String `"Deployment Successful"` if the boolean `success` is true, otherwise return `"Failed"`.\n**Hint:** Use standard `if-else` branching and the `return` keyword.', practiceTemplate: 'public class Main {\n  public static String getStatus(boolean success) {\n    // Return status string below\n    \n  }\n}', practiceAnswer: 'if (success) {\n      return "Deployment Successful";\n    } else {\n      return "Failed";\n    }', challenges: [
      { type: 'multiple-choice', question: 'What must align between a method declaration and its return statement?', options: ['The variable name', 'The return data type', 'The parameter count', 'The visibility modifier'], correctIndex: 1, explanation: 'The returned value must match or be castable to the defined method return type.' },
      { type: 'fill-blank', question: 'Complete return block:', template: 'public static String getName() {\n  ___ "Java";\n}', answer: 'return', explanation: 'Use return to output the String.' }
    ] },
    { slug: 'java-3-4', title: 'Method Arguments', exampleLanguage: 'java', exampleCode: 'public static void greet(String name, int age) {\n  System.out.println(name);\n}', exampleExplanation: 'Passes parameters to methods by value, allowing variables to be evaluated inside methods.', practiceInstruction: '**Scenario:** Log warnings or info tags to audit files.\n**Objective:** Define a public static void method named `logMessage` that takes two parameters: `String message` and `int level`.\n**Hint:** The method has a `void` return type, meaning it does not return a value.', practiceTemplate: 'public class Main {\n  // Define logMessage method below\n  \n}', practiceAnswer: 'public static void logMessage(String message, int level) {\n    System.out.println("[" + level + "] " + message);\n  }', challenges: [
      { type: 'multiple-choice', question: 'How are arguments passed to methods in Java?', options: ['Passed by reference', 'Passed by value', 'Passed via pointers', 'Passed dynamically'], correctIndex: 1, explanation: 'Java passes all parameters by value (copies of values or references are passed).' },
      { type: 'fill-blank', question: 'Specify argument type:', template: 'public static void log(___ value) {}', answer: 'int', explanation: 'Declare parameter types explicitly.' }
    ] },
    { slug: 'java-4-1', title: 'Classes & Objects', exampleLanguage: 'java', exampleCode: 'class Product {}\nProduct p = new Product();', exampleExplanation: 'Classes serve as object blueprints. Objects are instantiated using the new keyword.', practiceInstruction: '**Scenario:** Instantiating product items from inventory classes.\n**Objective:** Inside the main method, instantiate an object of type `Product` using the `new` keyword and assign it to a variable `p`. Also declare the empty class `Product`.\n**Hint:** Declare the `Product` class outside or inside the file structure.', practiceTemplate: '// Declare Product class below\n\n\npublic class Main {\n  public static void main(String[] args) {\n    // Instantiate Product below\n    \n  }\n}', practiceAnswer: 'class Product {}\n\npublic class Main {\n  public static void main(String[] args) {\n    Product p = new Product();\n  }\n}', challenges: [
      { type: 'multiple-choice', question: 'Which keyword instantiates classes to create new objects?', options: ['create', 'new', 'make', 'init'], correctIndex: 1, explanation: 'The new keyword allocates memory and instantiates objects.' },
      { type: 'fill-blank', question: 'Declare class User:', template: '___ User {}', answer: 'class', explanation: 'Use the class keyword to define blueprints.' }
    ] },
    { slug: 'java-4-2', title: 'Class Encapsulation', exampleLanguage: 'java', exampleCode: 'public class User {\n  private String name;\n  public String getName() { return name; }\n}', exampleExplanation: 'Encapsulation hides class variables using private modifiers, exposing access only via public getter/setter methods.', practiceInstruction: '**Scenario:** Protect account email details from arbitrary external edits.\n**Objective:** Complete the `User` class by declaring a private `String` variable `email`, and define its getter `getEmail()` and setter `setEmail(String email)` methods.\n**Hint:** Setters typically assign the parameter value to the instance variable using `this.email = email`.', practiceTemplate: 'public class User {\n  // Declare private email attribute and getter/setter methods below\n  \n}', practiceAnswer: 'private String email;\n  public String getEmail() {\n    return email;\n  }\n  public void setEmail(String email) {\n    this.email = email;\n  }', challenges: [
      { type: 'multiple-choice', question: 'What is the primary goal of encapsulation?', options: ['To speed up compilation', 'To restrict direct access to object state and protect data integrity', 'To enable class inheritance', 'To format code layouts'], correctIndex: 1, explanation: 'Hiding variables behind private modifiers prevents unauthorized direct edits.' },
      { type: 'fill-blank', question: 'Declare private variable:', template: '___ String name;', answer: 'private', explanation: 'private restricts variable access to within the class.' }
    ] },
    { slug: 'java-4-3', title: 'Parameterized Constructors', exampleLanguage: 'java', exampleCode: 'public class User {\n  private String name;\n  public User(String name) {\n    this.name = name;\n  }\n}', exampleExplanation: 'Constructors initialize object fields on creation. Parameterized constructors customize default properties.', practiceInstruction: '**Scenario:** Initialize profile data at database allocation points.\n**Objective:** Complete the `Customer` class constructor to accept parameters `String name` and `String email`, and assign them to the class fields using `this`.\n**Hint:** The constructor matches the class name and has no return type.', practiceTemplate: 'public class Customer {\n  private String name;\n  private String email;\n  \n  // Complete constructor below\n  public Customer(\n  \n  ) {\n    \n  }\n}', practiceAnswer: 'public Customer(String name, String email) {\n    this.name = name;\n    this.email = email;\n  }', challenges: [
      { type: 'multiple-choice', question: 'What name must constructors share in Java?', options: ['init', 'The class name exactly', 'constructor', 'The package name'], correctIndex: 1, explanation: 'Java constructors must match the class name exactly and have no return type.' },
      { type: 'fill-blank', question: 'Reference class instance attribute:', template: 'this.id = ___ ;', answer: 'id', explanation: 'Use this to refer to class instance variables.' }
    ] },
    { slug: 'java-4-4', title: 'Static variables', exampleLanguage: 'java', exampleCode: 'public class Counter {\n  public static int count = 0;\n}', exampleExplanation: 'Static fields belong to the class itself rather than object instances, sharing one copy among all instances.', practiceInstruction: '**Scenario:** Monitor global connection metrics across database channels.\n**Objective:** Declare a public static integer variable named `activeConnections` inside the class `ConnectionPool`.\n**Hint:** Static fields belong to the class rather than instance objects.', practiceTemplate: 'public class ConnectionPool {\n  // Declare public static int activeConnections variable below\n  \n}', practiceAnswer: 'public static int activeConnections = 0;', challenges: [
      { type: 'multiple-choice', question: 'What does the static keyword mean in Java?', options: ['Variable values cannot change', 'The member belongs to the class type itself, rather than instances', 'The member is private', 'The member is compiled dynamically'], correctIndex: 1, explanation: 'Static members are shared globally across all class instances.' },
      { type: 'fill-blank', question: 'Declare class static method:', template: 'public ___ void print() {}', answer: 'static', explanation: 'Static methods can be called without instantiating the class.' }
    ] },
    { slug: 'java-5-1', title: 'OOP Inheritance', exampleLanguage: 'java', exampleCode: 'class Employee {}\nclass Manager extends Employee {}', exampleExplanation: 'Child classes inherit members from parent classes using the extends keyword.', practiceInstruction: '**Scenario:** Derived role classes inheriting from general employee base classes.\n**Objective:** Declare the subclass `Manager` that inherits from the parent class `Employee`.\n**Hint:** Use the Java inheritance keyword `extends`.', practiceTemplate: 'class Employee {}\n\n// Declare Manager class below inheriting from Employee\n', practiceAnswer: 'class Manager extends Employee {}', challenges: [
      { type: 'multiple-choice', question: 'Which keyword establishes class inheritance in Java?', options: ['implements', 'extends', 'inherits', 'super'], correctIndex: 1, explanation: 'The extends keyword specifies that a class inherits from a parent class.' },
      { type: 'fill-blank', question: 'Inherit class behavior:', template: 'class Student ___ Person {}', answer: 'extends', explanation: 'extends designates subclass inheritance.' }
    ] },
    { slug: 'java-5-2', title: 'Calling super()', exampleLanguage: 'java', exampleCode: 'class Manager extends Employee {\n  public Manager() {\n    super();\n  }\n}', exampleExplanation: 'Invokes parent class constructors or methods from subclasses using the super keyword.', practiceInstruction: '**Scenario:** Initialize base class attributes from subclass constructors.\n**Objective:** Complete the subclass `Manager` constructor. Call the parent class constructor using `super` to initialize `name` and `salary` attributes.\n**Hint:** The call `super(name, salary);` must be the first line inside the subclass constructor.', practiceTemplate: 'class Employee {\n  protected String name;\n  protected double salary;\n  public Employee(String name, double salary) {\n    this.name = name;\n    this.salary = salary;\n  }\n}\n\nclass Manager extends Employee {\n  public Manager(String name, double salary) {\n    // Call super constructor below\n    \n  }\n}', practiceAnswer: 'super(name, salary);', challenges: [
      { type: 'multiple-choice', question: 'Where must super() be positioned in a subclass constructor?', options: ['At the end of the constructor', 'As the first statement in the constructor', 'Anywhere in the constructor', 'Outside the constructor'], correctIndex: 1, explanation: 'Java requires super() to be the very first statement in subclass constructors.' },
      { type: 'fill-blank', question: 'Invoke parent constructor:', template: 'public Manager(String name) {\n  ___(name);\n}', answer: 'super', explanation: 'Use super to pass values to parent constructors.' }
    ] },
    { slug: 'java-5-3', title: 'Method Overriding', exampleLanguage: 'java', exampleCode: 'class Animal {\n  public void speak() {}\n}\nclass Dog extends Animal {\n  @Override\n  public void speak() {}\n}', exampleExplanation: 'Redefines parent methods in subclasses. Annotate with @Override to verify signatures during compilation.', practiceInstruction: '**Scenario:** Override the default speak method for customized dog subclasses.\n**Objective:** Override the `speak()` method of the `Animal` class inside the `Dog` class. Annotate with `@Override` and print `"Woof"`.\n**Hint:** The method signature in the subclass must match the parent class signature exactly.', practiceTemplate: 'class Animal {\n  public void speak() {\n    System.out.println("Sound");\n  }\n}\n\nclass Dog extends Animal {\n  // Override speak method below\n  \n}', practiceAnswer: '@Override\n  public void speak() {\n    System.out.println("Woof");\n  }', challenges: [
      { type: 'multiple-choice', question: 'What is the purpose of method overriding in Java?', options: ['To define a method with different parameter types', 'To provide a specific implementation of an inherited parent class method in a subclass', 'To delete parent methods', 'To overload calculations'], correctIndex: 1, explanation: 'Overriding allows subclasses to adapt inherited methods to their specific behaviors.' },
      { type: 'fill-blank', question: 'Add override compiler check:', template: '___ \npublic void speak() {}', answer: '@Override', explanation: 'The @Override annotation flags method overrides.' }
    ] },
    { slug: 'java-5-4', title: 'Java Interfaces', exampleLanguage: 'java', exampleCode: 'interface Printable {\n  void print();\n}\nclass Document implements Printable {\n  public void print() {}\n}', exampleExplanation: 'Interfaces define abstract method contracts. Classes implement these contracts using the implements keyword.', practiceInstruction: '**Scenario:** Enforce logging protocols across corporate console outputs.\n**Objective:** Declare an interface named `Loggable` containing a void method `log(String message)`. Then, make class `ConsoleLogger` implement `Loggable`.\n**Hint:** Use the `interface` and `implements` keywords.', practiceTemplate: '// Declare Loggable interface below\n\n\n// Make ConsoleLogger implement Loggable below\nclass ConsoleLogger {\n  public void log(String message) {\n    System.out.println(message);\n  }\n}', practiceAnswer: 'interface Loggable {\n  void log(String message);\n}\n\nclass ConsoleLogger implements Loggable {\n  public void log(String message) {\n    System.out.println(message);\n  }\n}', challenges: [
      { type: 'multiple-choice', question: 'Which keyword links classes to interface contracts?', options: ['extends', 'implements', 'interface', 'importer'], correctIndex: 1, explanation: 'Classes use implements to fulfill interface contracts.' },
      { type: 'fill-blank', question: 'Fulfill interface contract:', template: 'class Dog ___ Barkable {}', answer: 'implements', explanation: 'implements links classes to interfaces.' }
    ] },
    { slug: 'java-6-1', title: 'Java ArrayList', exampleLanguage: 'java', exampleCode: 'import java.util.ArrayList;\nArrayList<String> list = new ArrayList<>();\nlist.add("Java");', exampleExplanation: 'ArrayList provides dynamic, resizable array lists in Java. Part of the java.util collections framework.', practiceInstruction: '**Scenario:** Manage a dynamic array of logged-in user names.\n**Objective:** Initialize an `ArrayList` storing `String` items, and add `"Alice"` and `"Bob"` using the `.add()` method.\n**Hint:** Declare with `ArrayList<String> list = new ArrayList<>();`.', practiceTemplate: 'import java.util.ArrayList;\n\npublic class Main {\n  public static void main(String[] args) {\n    // Initialize ArrayList and add elements below\n    \n  }\n}', practiceAnswer: 'ArrayList<String> list = new ArrayList<>();\n    list.add("Alice");\n    list.add("Bob");', challenges: [
      { type: 'multiple-choice', question: 'Why is ArrayList preferred over standard Java arrays in database applications?', options: ['It uses less memory', 'It provides dynamic resizing as items are added/removed', 'It can store primitives directly without wrapping', 'It is faster to compile'], correctIndex: 1, explanation: 'ArrayList grows dynamically, removing size bounds limitations.' },
      { type: 'fill-blank', question: 'Query list size:', template: 'int size = list.___();', answer: 'size', explanation: 'Use size() to get the element count of an ArrayList.' }
    ] },
    { slug: 'java-6-2', title: 'Java HashMap', exampleLanguage: 'java', exampleCode: 'import java.util.HashMap;\nHashMap<String, Integer> map = new HashMap<>();\nmap.put("Alice", 25);', exampleExplanation: 'HashMap stores data in key-value pairs, allowing fast lookups via keys.', practiceInstruction: '**Scenario:** Map session token strings to user email identities.\n**Objective:** Initialize a `HashMap` storing `String` keys and `String` values. Insert a key `"admin"` with value `"admin@example.com"`.\n**Hint:** HashMap inserts elements using the `.put(key, value)` method.', practiceTemplate: 'import java.util.HashMap;\n\npublic class Main {\n  public static void main(String[] args) {\n    // Initialize HashMap and insert entry below\n    \n  }\n}', practiceAnswer: 'HashMap<String, String> map = new HashMap<>();\n    map.put("admin", "admin@example.com");', challenges: [
      { type: 'multiple-choice', question: 'Which method adds key-value pairs to a Java HashMap?', options: ['add()', 'put()', 'set()', 'insert()'], correctIndex: 1, explanation: 'Use put(key, value) to add or update pairs in a HashMap.' },
      { type: 'fill-blank', question: 'Retrieve value by key:', template: 'int val = map.___("id");', answer: 'get', explanation: 'get(key) retrieves values from HashMaps.' }
    ] },
    { slug: 'java-6-3', title: 'Try Catch Blocks', exampleLanguage: 'java', exampleCode: 'try {\n  int x = 10 / 0;\n} catch (ArithmeticException e) {\n  System.out.println("Error");\n}', exampleExplanation: 'Try-catch blocks catch and handle runtime exceptions, preventing application crashes.', practiceInstruction: '**Scenario:** Safely perform divisions that might trigger zero errors.\n**Objective:** Wrap the division code `int result = 10 / 0;` inside a `try-catch` block that catches `ArithmeticException`.\n**Hint:** Print a warning inside the catch block to handle the exception gracefully.', practiceTemplate: 'public class Main {\n  public static void main(String[] args) {\n    // Wrap division in try-catch below\n    \n    int result = 10 / 0;\n    \n  }\n}', practiceAnswer: 'try {\n      int result = 10 / 0;\n    } catch (ArithmeticException e) {\n      System.out.println("Division by zero!");\n    }', challenges: [
      { type: 'multiple-choice', question: 'What block catches exceptions thrown in try blocks?', options: ['try', 'catch', 'finally', 'throw'], correctIndex: 1, explanation: 'The catch block intercept and handle exceptions.' },
      { type: 'fill-blank', question: 'Complete exception block syntax:', template: 'try {} ___ (Exception e) {}', answer: 'catch', explanation: 'Use catch to intercept errors.' }
    ] },
    { slug: 'java-6-4', title: 'Custom Exceptions', exampleLanguage: 'java', exampleCode: 'public class MyException extends Exception {\n  public MyException(String msg) { super(msg); }\n}', exampleExplanation: 'Creates custom exception classes by inheriting from the base Exception class.', practiceInstruction: '**Scenario:** Block transactions if account balances fall below thresholds.\n**Objective:** Declare a custom exception class named `InsufficientFundsException` that inherits from the base `Exception` class.\n**Hint:** Include a constructor that passes the message string to `super(msg)`.', practiceTemplate: '// Declare custom InsufficientFundsException below\n', practiceAnswer: 'public class InsufficientFundsException extends Exception {\n  public InsufficientFundsException(String msg) {\n    super(msg);\n  }\n}', challenges: [
      { type: 'multiple-choice', question: 'What class must custom exceptions inherit from in Java?', options: ['RuntimeException', 'Exception or its subclasses', 'Error', 'Throwable class directly only'], correctIndex: 1, explanation: 'Custom exceptions inherit from the base Exception (checked) or RuntimeException (unchecked) class.' },
      { type: 'fill-blank', question: 'Inherit base exception behavior:', template: 'public class UserNotFoundException ___ Exception {}', answer: 'extends', explanation: 'extends creates subclasses of Exception.' }
    ] }
  ]
};

// --- CURRICULUM GENERATOR COMPILER ENGINE ---
const compileCurriculum = () => {
  const tracks = [];
  
  let quizData = {};
  try {
    quizData = require('./quizData');
  } catch (e) {
    // Falls back silently or with warning
  }
  
  
  for (const trackMeta of tracksMeta) {
    const trackSlug = trackMeta.slug;
    const rawLessons = lessonsSpecs[trackSlug] || [];
    
    // Ensure total lessons matches the spec size
    if (rawLessons.length !== 24) {
      console.warn(`⚠️ Warning: ${trackMeta.name} has ${rawLessons.length} lessons instead of 24!`);
    }
    
    const track = {
      slug: trackSlug,
      name: trackMeta.name,
      description: trackMeta.description,
      icon: trackMeta.icon,
      color: trackMeta.color,
      order: trackMeta.order,
      capstone_project: trackMeta.capstone,
      modules: [],
      lessons: []
    };
    
    // 1. Process Modules
    track.modules = trackMeta.modules.map(mod => ({
      id: mod.id,
      name: mod.name,
      order: mod.order,
      learning_objective: mod.learning_objective,
      mini_project: mod.mini_project
    }));
    
    // 2. Process Lessons
    rawLessons.forEach((lesson, index) => {
      // Determine module relation based on index
      // 4 lessons per module -> index 0-3 in mod 1, 4-7 in mod 2, etc.
      const moduleIndex = Math.floor(index / 4);
      const mod = trackMeta.modules[moduleIndex];
      const moduleId = mod ? mod.id : trackMeta.modules[0].id;
      const displayOrder = (index % 4) + 1;
      
      // Build concept_content with a structured outline (Objective -> Concept Explanation -> Real World Relevance)
      const objectiveText = `### 1. Learning Objective\nIn this lesson, you will master the fundamentals of **${lesson.title}** and learn how to apply it to real-world code layouts.`;
      
      const realWorldText = `### 2. Where is this used in real life?\nThis concept is a core element in production environments. For example, it is used directly in software components like:\n- **API Systems**: To structure data parameters.\n- **Database Transactions**: To audit logs and profiles.\n- **Frontend Webpages**: To style layouts and align items.\n\nStudying this ensures your code remains efficient, readable, and highly maintainable under load.`;
      
      const explanationText = `### 3. Concept Explanation\n${lesson.exampleExplanation}\n\nUnderstanding the syntax and structure prevents common errors and optimizes execution paths. Review the code example carefully to see how these declarations work in practice.`;
      
      const fullConceptContent = `${objectiveText}\n\n${realWorldText}\n\n${explanationText}`;
      
      const highlights = [trackMeta.name, lesson.title];
      
      track.lessons.push({
        slug: lesson.slug,
        title: lesson.title,
        moduleId: moduleId,
        order: displayOrder,
        estimatedMinutes: 8,
        xpReward: 25,
        conceptTitle: `Mastering ${lesson.title}`,
        conceptContent: fullConceptContent,
        conceptHighlights: highlights,
        exampleLanguage: lesson.exampleLanguage,
        exampleCode: lesson.exampleCode,
        exampleExplanation: lesson.exampleExplanation,
        practiceType: 'fill-blank',
        practiceInstruction: lesson.practiceInstruction,
        practiceTemplate: lesson.practiceTemplate,
        practiceAnswer: lesson.practiceAnswer,
        summary: `You completed learning ${lesson.title}. Explore more lessons in this module to build complete technical mastery.`,
        challenges: quizData[lesson.slug] || lesson.challenges
      });
    });
    
    tracks.push(track);
  }
  
  return tracks;
};

export const tracksData = compileCurriculum();
