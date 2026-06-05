const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const tracksData = [
  {
    slug: 'sql',
    name: 'SQL',
    description: 'Master database querying from basics to advanced joins and subqueries.',
    icon: 'database',
    color: 'hsl(199, 89%, 48%)',
    order: 1,
    modules: [{ id: 'sql-basics', name: 'SQL Basics', order: 1 }],
    lessons: [
      {
        slug: 'sql-1',
        title: 'What is SQL?',
        moduleId: 'sql-basics',
        order: 1,
        estimatedMinutes: 8,
        xpReward: 25,
        conceptTitle: 'Introduction to SQL',
        conceptContent: "SQL (Structured Query Language) is the standard language for communicating with relational databases. Whether you're building a web app, analyzing data, or managing business records — SQL is the tool that lets you talk to your data.\n\nRelational databases store data in tables — structured collections of rows and columns, similar to spreadsheets. Each table represents an entity (like users, orders, or products), and SQL lets you create, read, update, and delete data within these tables.\n\nSQL is used by virtually every major tech company and is one of the most valuable technical skills you can learn. It's declarative — you describe what data you want, and the database figures out how to get it.",
        conceptHighlights: ['SQL', 'relational databases', 'tables', 'declarative'],
        exampleLanguage: 'sql',
        exampleCode: 'SELECT first_name, email\nFROM users\nWHERE active = true\nORDER BY first_name;',
        exampleExplanation: 'This query retrieves the first name and email of all active users, sorted alphabetically by first name.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Write a query to select all columns from the "products" table:',
        practiceTemplate: 'SELECT ___ FROM products;',
        practiceAnswer: '*',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What does SQL stand for?',
            options: ['Structured Query Language', 'Simple Question Language', 'System Query Logic', 'Standard Query Layout'],
            correctIndex: 0,
            explanation: 'SQL stands for Structured Query Language — the standard language for managing and querying relational databases.'
          },
          {
            type: 'fill-blank',
            question: 'Complete the SQL command to retrieve all columns from a table:',
            template: '___ * FROM users;',
            answer: 'SELECT',
            explanation: 'The SELECT statement is used to retrieve data from a database table.'
          }
        ]
      },
      {
        slug: 'sql-2',
        title: 'Filtering with WHERE',
        moduleId: 'sql-basics',
        order: 2,
        estimatedMinutes: 10,
        xpReward: 25,
        conceptTitle: 'The WHERE Clause',
        conceptContent: 'The WHERE clause is your data filter. Instead of retrieving every row from a table, WHERE lets you specify conditions that rows must meet to be included in the results.\n\nYou can use comparison operators like = (equals), != (not equals), > (greater than), < (less than), >= and <=. You can also combine conditions using AND, OR, and NOT to create complex filters.\n\nThe WHERE clause is one of the most frequently used parts of SQL. Mastering it means you can precisely target exactly the data you need.',
        conceptHighlights: ['WHERE', 'comparison operators', 'AND', 'OR', 'NOT'],
        exampleLanguage: 'sql',
        exampleCode: "SELECT name, price\nFROM products\nWHERE price > 50\n  AND category = 'electronics'\nORDER BY price DESC;",
        exampleExplanation: 'This query finds all electronics priced above $50, sorted from most to least expensive.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Write a condition to find products in the "books" category:',
        practiceTemplate: "SELECT * FROM products WHERE category = '___';",
        practiceAnswer: 'books',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'Which clause is used to filter rows in SQL?',
            options: ['ORDER BY', 'WHERE', 'GROUP BY', 'SELECT'],
            correctIndex: 1,
            explanation: 'The WHERE clause filters rows based on a condition, returning only rows that match.'
          },
          {
            type: 'fill-blank',
            question: 'Complete the query to find users older than 25:',
            template: 'SELECT * FROM users WHERE age ___ 25;',
            answer: '>',
            explanation: 'The > operator is used for "greater than" comparisons in SQL WHERE clauses.'
          }
        ]
      },
      {
        slug: 'sql-3',
        title: 'Sorting & Limiting Results',
        moduleId: 'sql-basics',
        order: 3,
        estimatedMinutes: 9,
        xpReward: 25,
        conceptTitle: 'ORDER BY and LIMIT',
        conceptContent: 'Once you can filter data, the next step is organizing it. ORDER BY sorts your results by one or more columns, either ascending (ASC, the default) or descending (DESC).\n\nLIMIT restricts how many rows are returned — essential for pagination, finding "top N" results, or simply previewing data. Combined with ORDER BY, LIMIT becomes incredibly powerful.\n\nYou can sort by multiple columns too: ORDER BY country ASC, name ASC would sort first by country, then by name within each country.',
        conceptHighlights: ['ORDER BY', 'LIMIT', 'ASC', 'DESC', 'pagination'],
        exampleLanguage: 'sql',
        exampleCode: 'SELECT name, score\nFROM students\nORDER BY score DESC\nLIMIT 5;',
        exampleExplanation: 'This query finds the top 5 students by score — sorted highest first, then limited to 5 results.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Get only the first 10 rows from the orders table:',
        practiceTemplate: 'SELECT * FROM orders ___ 10;',
        practiceAnswer: 'LIMIT',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What does ORDER BY do?',
            options: ['Groups rows together', 'Sorts the result set', 'Filters rows', 'Limits the number of rows'],
            correctIndex: 1,
            explanation: 'ORDER BY sorts the result set by one or more columns, either ascending (ASC) or descending (DESC).'
          },
          {
            type: 'fill-blank',
            question: 'Sort results by price from highest to lowest:',
            template: 'SELECT * FROM products ORDER BY price ___;',
            answer: 'DESC',
            explanation: 'DESC sorts results in descending order (highest to lowest).'
          }
        ]
      }
    ]
  },
  {
    slug: 'python',
    name: 'Python',
    description: 'Learn Python programming from variables and data types to functions and beyond.',
    icon: 'code',
    color: 'hsl(52, 80%, 50%)',
    order: 2,
    modules: [{ id: 'py-basics', name: 'Python Basics', order: 1 }],
    lessons: [
      {
        slug: 'python-1',
        title: 'Hello, Python!',
        moduleId: 'py-basics',
        order: 1,
        estimatedMinutes: 8,
        xpReward: 25,
        conceptTitle: 'Getting Started with Python',
        conceptContent: "Python is one of the most popular and beginner-friendly programming languages in the world. It's used for web development, data science, artificial intelligence, automation, and much more.\n\nPython reads almost like English, making it an ideal first language. Its clean syntax uses indentation instead of curly braces, which forces readable code from day one.\n\nLet's start with the basics: printing output, using comments, and understanding how Python runs code from top to bottom.",
        conceptHighlights: ['Python', 'indentation', 'print', 'comments'],
        exampleLanguage: 'python',
        exampleCode: '# This is a comment\nprint("Hello, World!")\n\n# Variables\nname = "Learn Station"\nprint(f"Learning with {name}")',
        exampleExplanation: 'Python uses print() to display output. Comments start with #. Variables are created by simply assigning a value — no type declaration needed.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Create a variable called "age" and set it to 25:',
        practiceTemplate: '___ = 25',
        practiceAnswer: 'age',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'Which symbol is used for comments in Python?',
            options: ['// comment', '# comment', '/* comment */', '-- comment'],
            correctIndex: 1,
            explanation: 'Python uses the # symbol for single-line comments.'
          },
          {
            type: 'fill-blank',
            question: 'Print "Hello" to the console:',
            template: '___("Hello")',
            answer: 'print',
            explanation: 'The print() function outputs text to the console in Python.'
          }
        ]
      },
      {
        slug: 'python-2',
        title: 'Variables & Data Types',
        moduleId: 'py-basics',
        order: 2,
        estimatedMinutes: 10,
        xpReward: 25,
        conceptTitle: 'Variables and Data Types',
        conceptContent: 'Variables are containers that store data values. In Python, you create a variable simply by assigning it a value — no need to declare types.\n\nPython has several built-in data types: int (whole numbers), float (decimal numbers), str (text strings), bool (True/False). Python is dynamically typed, meaning a variable can change its type.',
        conceptHighlights: ['variables', 'int', 'float', 'str', 'bool', 'dynamically typed'],
        exampleLanguage: 'python',
        exampleCode: 'age = 25          # int\nprice = 9.99      # float\nname = "Alice"    # str\nis_active = True  # bool',
        exampleExplanation: 'Python automatically detects the type based on the assigned value.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Convert the string "42" to an integer:',
        practiceTemplate: 'number = ___("42")',
        practiceAnswer: 'int',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What data type is the value 3.14?',
            options: ['int', 'str', 'float', 'bool'],
            correctIndex: 2,
            explanation: 'Numbers with decimal points are floats in Python.'
          },
          {
            type: 'fill-blank',
            question: 'Check the type of a variable x:',
            template: '___(x)',
            answer: 'type',
            explanation: 'The type() function returns the data type of a value in Python.'
          }
        ]
      },
      {
        slug: 'python-3',
        title: 'Conditionals',
        moduleId: 'py-basics',
        order: 3,
        estimatedMinutes: 10,
        xpReward: 25,
        conceptTitle: 'If, Elif, and Else',
        conceptContent: 'Conditionals let your program make decisions. The if statement checks a condition and runs a block of code only when the condition is True. Python uses indentation to define blocks.',
        conceptHighlights: ['if', 'elif', 'else', 'indentation'],
        exampleLanguage: 'python',
        exampleCode: 'score = 85\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelse:\n    grade = "F"',
        exampleExplanation: 'This checks the score against multiple thresholds.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Complete the fallback case:',
        practiceTemplate: 'if x > 0:\n    print("positive")\n___:\n    print("not positive")',
        practiceAnswer: 'else',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What keyword starts an if block in Python?',
            options: ['if', 'when', 'check', 'test'],
            correctIndex: 0,
            explanation: 'Python uses the "if" keyword for conditional statements.'
          },
          {
            type: 'fill-blank',
            question: 'Write the else-if keyword in Python:',
            template: 'if x > 10:\n    print("big")\n___ x > 5:\n    print("medium")',
            answer: 'elif',
            explanation: 'Python uses "elif" (short for else if) for additional conditions.'
          }
        ]
      }
    ]
  },
  {
    slug: 'webdev',
    name: 'Web Development',
    description: 'Build modern websites with HTML, CSS, and JavaScript from the ground up.',
    icon: 'globe',
    color: 'hsl(14, 85%, 55%)',
    order: 3,
    modules: [{ id: 'web-basics', name: 'HTML & CSS Basics', order: 1 }],
    lessons: [
      {
        slug: 'webdev-1',
        title: 'Introduction to HTML',
        moduleId: 'web-basics',
        order: 1,
        estimatedMinutes: 8,
        xpReward: 25,
        conceptTitle: 'What is HTML?',
        conceptContent: 'HTML (HyperText Markup Language) is the foundation of every website. It defines the structure and content of web pages using a system of tags and elements.',
        conceptHighlights: ['HTML', 'tags', 'elements', 'structure'],
        exampleLanguage: 'html',
        exampleCode: '<!DOCTYPE html>\n<html>\n<body>\n    <h1>Welcome!</h1>\n    <p>This is a paragraph.</p>\n</body>\n</html>',
        exampleExplanation: 'This shows a complete HTML page with a heading and paragraph.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Create a main heading:',
        practiceTemplate: '<___>Learn Station</___>',
        practiceAnswer: 'h1',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What does HTML stand for?',
            options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Layout', 'Home Tool Markup Language'],
            correctIndex: 0,
            explanation: 'HTML stands for HyperText Markup Language.'
          },
          {
            type: 'fill-blank',
            question: 'Create a paragraph element:',
            template: '<___>Hello World</___>',
            answer: 'p',
            explanation: 'The <p> tag defines a paragraph in HTML.'
          }
        ]
      },
      {
        slug: 'webdev-2',
        title: 'Styling with CSS',
        moduleId: 'web-basics',
        order: 2,
        estimatedMinutes: 10,
        xpReward: 25,
        conceptTitle: 'Introduction to CSS',
        conceptContent: 'CSS (Cascading Style Sheets) controls the visual appearance of HTML elements. While HTML defines structure, CSS defines how that structure looks.',
        conceptHighlights: ['CSS', 'selectors', 'declarations', 'cascade'],
        exampleLanguage: 'css',
        exampleCode: 'h1 {\n    color: #2563eb;\n    font-size: 2rem;\n}',
        exampleExplanation: 'This targets h1 elements and changes their color and size.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Set the font size to 16 pixels:',
        practiceTemplate: 'p {\n    font-size: ___;\n}',
        practiceAnswer: '16px',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'Which CSS property changes text color?',
            options: ['font-color', 'text-color', 'color', 'foreground'],
            correctIndex: 2,
            explanation: 'The CSS "color" property sets the text color.'
          },
          {
            type: 'fill-blank',
            question: 'Set the background to blue:',
            template: 'body {\n    ___: blue;\n}',
            answer: 'background-color',
            explanation: 'The background-color property sets the background color.'
          }
        ]
      },
      {
        slug: 'webdev-3',
        title: 'CSS Layout & Flexbox',
        moduleId: 'web-basics',
        order: 3,
        estimatedMinutes: 12,
        xpReward: 25,
        conceptTitle: 'Layout with Flexbox',
        conceptContent: 'CSS Flexbox is a layout model that makes it easy to align and distribute space among items in a container.',
        conceptHighlights: ['Flexbox', 'justify-content', 'align-items', 'gap'],
        exampleLanguage: 'css',
        exampleCode: '.nav {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}',
        exampleExplanation: 'This creates a flex row container spreading items between boundaries.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Center items vertically in a flex container:',
        practiceTemplate: '.container {\n    display: flex;\n    ___: center;\n}',
        practiceAnswer: 'align-items',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'Which CSS property creates space INSIDE an element?',
            options: ['margin', 'padding', 'gap', 'border'],
            correctIndex: 1,
            explanation: 'Padding creates space inside an element. Margin creates space outside.'
          },
          {
            type: 'fill-blank',
            question: 'Make elements display side by side using flexbox:',
            template: '.container {\n    display: ___;\n}',
            answer: 'flex',
            explanation: 'display: flex turns a container into a flex container.'
          }
        ]
      }
    ]
  },
  {
    slug: 'ai',
    name: 'AI Fundamentals',
    description: 'Understand the core concepts of artificial intelligence and machine learning.',
    icon: 'cpu',
    color: 'hsl(262, 83%, 58%)',
    order: 4,
    modules: [{ id: 'ai-basics', name: 'AI Core Concepts', order: 1 }],
    lessons: [
      {
        slug: 'ai-1',
        title: 'What is AI?',
        moduleId: 'ai-basics',
        order: 1,
        estimatedMinutes: 8,
        xpReward: 25,
        conceptTitle: 'Introduction to Artificial Intelligence',
        conceptContent: 'Artificial Intelligence (AI) is the field of computer science focused on creating systems that can perform tasks that normally require human intelligence. Modern AI is largely powered by Machine Learning (ML).',
        conceptHighlights: ['AI', 'Machine Learning', 'supervised', 'unsupervised'],
        exampleLanguage: 'python',
        exampleCode: '# Conceptual ML\ndata = [{"email": "Buy now!", "spam": True},\n        {"email": "Meeting at 3", "spam": False}]',
        exampleExplanation: 'ML models learn from labeled patterns in dataset rows.',
        practiceType: 'fill-blank',
        practiceInstruction: 'AI that learns through trial and reward is called ___ learning:',
        practiceTemplate: '___ learning',
        practiceAnswer: 'reinforcement',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What is the main goal of machine learning?',
            options: ['To replace humans', 'To learn patterns from data', 'To write code automatically', 'To create robots'],
            correctIndex: 1,
            explanation: 'Machine learning focuses on algorithms that learn patterns from data.'
          },
          {
            type: 'fill-blank',
            question: 'AI that learns from labeled examples is called ___ learning:',
            template: '___ learning',
            answer: 'supervised',
            explanation: 'Supervised learning uses labeled training data.'
          }
        ]
      },
      {
        slug: 'ai-2',
        title: 'Neural Networks',
        moduleId: 'ai-basics',
        order: 2,
        estimatedMinutes: 12,
        xpReward: 25,
        conceptTitle: 'Understanding Neural Networks',
        conceptContent: 'Neural networks are the backbone of modern AI. Inspired by the human brain, they consist of layers of interconnected nodes (neurons) that process information.',
        conceptHighlights: ['neural networks', 'layers', 'neurons', 'deep learning'],
        exampleLanguage: 'python',
        exampleCode: '# Network nodes structure\nnetwork = {\n    "input": 784,\n    "hidden": [128, 64],\n    "output": 10\n}',
        exampleExplanation: 'Input, hidden layers, and output layers work together to classify data.',
        practiceType: 'fill-blank',
        practiceInstruction: 'The output layer uses an ___ function to produce results:',
        practiceTemplate: '___ function',
        practiceAnswer: 'activation',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What is a neural network inspired by?',
            options: ['Computer circuits', 'The human brain', 'Internet networks', 'Social networks'],
            correctIndex: 1,
            explanation: 'Neural networks are inspired by biological neurons in the human brain.'
          },
          {
            type: 'fill-blank',
            question: 'Deep learning uses neural networks with many ___:',
            template: 'many ___',
            answer: 'layers',
            explanation: 'Deep learning refers to neural networks with many hidden layers.'
          }
        ]
      },
      {
        slug: 'ai-3',
        title: 'Large Language Models',
        moduleId: 'ai-basics',
        order: 3,
        estimatedMinutes: 10,
        xpReward: 25,
        conceptTitle: 'The Age of LLMs',
        conceptContent: 'Large Language Models (LLMs) are AI models trained on massive text databases. They are built on the Transformer architecture using an attention mechanism.',
        conceptHighlights: ['LLMs', 'Transformer', 'attention', 'pre-trained'],
        exampleLanguage: 'python',
        exampleCode: '# LLM chat prompt example\nprompt = "Explain recursion simply."',
        exampleExplanation: 'Prompting queries the model to predict next-word tokens.',
        practiceType: 'fill-blank',
        practiceInstruction: 'The key mechanism in Transformers is called ___:',
        practiceTemplate: 'The key mechanism is ___',
        practiceAnswer: 'attention',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What is an LLM?',
            options: ['Large Logic Module', 'Large Language Model', 'Linear Learning Machine', 'Low Latency Model'],
            correctIndex: 1,
            explanation: 'LLM stands for Large Language Model.'
          },
          {
            type: 'fill-blank',
            question: 'GPT stands for Generative Pre-trained ___:',
            template: 'Generative Pre-trained ___',
            answer: 'Transformer',
            explanation: 'GPT stands for Generative Pre-trained Transformer.'
          }
        ]
      }
    ]
  },
  {
    slug: 'datascience',
    name: 'Data Science',
    description: 'Analyze data, find patterns, and make data-driven decisions with Python.',
    icon: 'bar-chart',
    color: 'hsl(142, 71%, 45%)',
    order: 5,
    modules: [{ id: 'ds-basics', name: 'Data Science Foundations', order: 1 }],
    lessons: [
      {
        slug: 'ds-1',
        title: 'What is Data Science?',
        moduleId: 'ds-basics',
        order: 1,
        estimatedMinutes: 8,
        xpReward: 25,
        conceptTitle: 'Introduction to Data Science',
        conceptContent: 'Data Science is the field of extracting knowledge and insights from data using statistics, programming, and visualization.',
        conceptHighlights: ['Data Science', 'Pandas', 'NumPy', 'workflow'],
        exampleLanguage: 'python',
        exampleCode: 'import pandas as pd\ndf = pd.read_csv("sales.csv")\nprint(df.head())',
        exampleExplanation: 'Pandas lets you read CSV data tables into tabular DataFrames.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Show the first 5 rows of a DataFrame:',
        practiceTemplate: 'df.___()',
        practiceAnswer: 'head',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What Python library is most commonly used for data manipulation?',
            options: ['NumPy', 'Pandas', 'Matplotlib', 'TensorFlow'],
            correctIndex: 1,
            explanation: 'Pandas is the primary library for data manipulation and analysis.'
          },
          {
            type: 'fill-blank',
            question: 'Import the pandas library:',
            template: 'import ___ as pd',
            answer: 'pandas',
            explanation: 'Conventionally, pandas is imported as "pd".'
          }
        ]
      },
      {
        slug: 'ds-2',
        title: 'Working with DataFrames',
        moduleId: 'ds-basics',
        order: 2,
        estimatedMinutes: 12,
        xpReward: 25,
        conceptTitle: 'Pandas DataFrames',
        conceptContent: 'A DataFrame is a two-dimensional labeled table. You can select columns, filter rows, group records, and compute aggregates.',
        conceptHighlights: ['DataFrame', 'filter', 'groupby', 'aggregate'],
        exampleLanguage: 'python',
        exampleCode: 'by_country = df.groupby("country")["age"].mean()',
        exampleExplanation: 'This groups users by country and calculates their average age.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Group data by the "category" column:',
        practiceTemplate: 'df.___("category").count()',
        practiceAnswer: 'groupby',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What does df.describe() return?',
            options: ['Column names', 'Data types', 'Summary statistics', 'Missing values count'],
            correctIndex: 2,
            explanation: 'describe() returns count, mean, min, max, and std deviation.'
          },
          {
            type: 'fill-blank',
            question: 'Select a single column from a DataFrame:',
            template: 'df["___"]',
            answer: 'column_name',
            explanation: 'Columns are accessed as string keys inside square brackets.'
          }
        ]
      },
      {
        slug: 'ds-3',
        title: 'Data Visualization',
        moduleId: 'ds-basics',
        order: 3,
        estimatedMinutes: 10,
        xpReward: 25,
        conceptTitle: 'Visualizing Data',
        conceptContent: 'Data visualization converts numbers into charts. Matplotlib and Seaborn are standard Python charting libraries.',
        conceptHighlights: ['Matplotlib', 'Seaborn', 'scatter plots', 'bar charts'],
        exampleLanguage: 'python',
        exampleCode: 'import matplotlib.pyplot as plt\nplt.bar(["A", "B"], [10, 20])\nplt.show()',
        exampleExplanation: 'This creates and displays a basic bar chart.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Create a line chart:',
        practiceTemplate: 'plt.___(x, y)',
        practiceAnswer: 'plot',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'Which library is used for creating charts in Python?',
            options: ['Pandas', 'NumPy', 'Matplotlib', 'Requests'],
            correctIndex: 2,
            explanation: 'Matplotlib is the foundational visualization library.'
          },
          {
            type: 'fill-blank',
            question: 'Display a plot in a notebook:',
            template: 'plt.___()',
            answer: 'show',
            explanation: 'plt.show() renders and prints the chart window.'
          }
        ]
      }
    ]
  },
  {
    slug: 'java',
    name: 'Java',
    description: 'Learn enterprise-grade programming with Java — from basics to object-oriented design.',
    icon: 'coffee',
    color: 'hsl(346, 77%, 50%)',
    order: 6,
    modules: [{ id: 'java-basics', name: 'Java Basics', order: 1 }],
    lessons: [
      {
        slug: 'java-1',
        title: 'Hello, Java!',
        moduleId: 'java-basics',
        order: 1,
        estimatedMinutes: 10,
        xpReward: 25,
        conceptTitle: 'Getting Started with Java',
        conceptContent: 'Java is a statically typed, object-oriented language. You must declare variable types and compile your code before running it.',
        conceptHighlights: ['Java', 'statically typed', 'object-oriented', 'main method'],
        exampleLanguage: 'java',
        exampleCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
        exampleExplanation: 'Every Java program runs from a main method inside a class.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Declare an integer variable:',
        practiceTemplate: '___ age = 25;',
        practiceAnswer: 'int',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What is Java known for?',
            options: ['Speed of development', 'Platform independence', 'Simple syntax', 'No compilation needed'],
            correctIndex: 1,
            explanation: 'Java runs inside a JVM, allowing platform independence.'
          },
          {
            type: 'fill-blank',
            question: 'Print text in Java:',
            template: 'System.out.___("Hello");',
            answer: 'println',
            explanation: 'System.out.println() prints a line of text to the console.'
          }
        ]
      },
      {
        slug: 'java-2',
        title: 'Classes & Objects',
        moduleId: 'java-basics',
        order: 2,
        estimatedMinutes: 12,
        xpReward: 25,
        conceptTitle: 'Object-Oriented Programming',
        conceptContent: 'Java is fundamentally OOP. A class is a blueprint, and you create object instances using the new keyword.',
        conceptHighlights: ['class', 'object', 'encapsulation', 'inheritance'],
        exampleLanguage: 'java',
        exampleCode: 'Dog buddy = new Dog("Buddy", 3);',
        exampleExplanation: 'This creates a Dog object instance by calling its constructor.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Create a new Dog object:',
        practiceTemplate: 'Dog buddy = ___ Dog("Buddy", 3);',
        practiceAnswer: 'new',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'Which keyword creates a new object in Java?',
            options: ['create', 'new', 'make', 'init'],
            correctIndex: 1,
            explanation: 'The new keyword instantiates classes.'
          },
          {
            type: 'fill-blank',
            question: 'Define a class in Java:',
            template: 'public ___ Dog {\n    String name;\n}',
            answer: 'class',
            explanation: 'The class keyword defines a blueprint.'
          }
        ]
      },
      {
        slug: 'java-3',
        title: 'Loops & Iteration',
        moduleId: 'java-basics',
        order: 3,
        estimatedMinutes: 10,
        xpReward: 25,
        conceptTitle: 'Loops in Java',
        conceptContent: 'Loops repeat code. Java supports for, while, and do-while loops, as well as enhanced for-each loops.',
        conceptHighlights: ['for', 'while', 'do-while', 'iteration'],
        exampleLanguage: 'java',
        exampleCode: 'for (int i = 0; i < 5; i++) {\n    System.out.println(i);\n}',
        exampleExplanation: 'This loop prints 0 to 4 sequentially.',
        practiceType: 'fill-blank',
        practiceInstruction: 'Write a for loop that runs 5 times:',
        practiceTemplate: 'for (int i = 0; i < ___; i++) {}',
        practiceAnswer: '5',
        challenges: [
          {
            type: 'multiple-choice',
            question: 'What does a for loop do?',
            options: ['Defines a class', 'Repeats code a set number of times', 'Handles errors', 'Imports libraries'],
            correctIndex: 1,
            explanation: 'A for loop iterates a set number of times.'
          },
          {
            type: 'fill-blank',
            question: 'Write a standard loop initialization in Java:',
            template: 'for (___ i = 0; i < 5; i++)',
            answer: 'int',
            explanation: 'Loops are controlled using a counter variable, typically an int.'
          }
        ]
      }
    ]
  }
];

const seed = async () => {
  try {
    console.log('🗑  Clearing database tables...');
    // We clear challenges, lessons, modules, and tracks.
    // Using simple filters to bypass Supabase bulk delete constraints
    await supabase.from('challenges').delete().gt('created_at', '1970-01-01');
    await supabase.from('lessons').delete().gt('created_at', '1970-01-01');
    await supabase.from('modules').delete().neq('id', '');
    await supabase.from('tracks').delete().gt('created_at', '1970-01-01');

    console.log('🌱 Seeding tracks, modules, lessons, and challenges into Supabase...\n');

    for (const trackData of tracksData) {
      console.log(`🚀 Seeding Track: ${trackData.name}...`);
      
      // 1. Insert Track
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .insert({
          slug: trackData.slug,
          name: trackData.name,
          description: trackData.description,
          icon: trackData.icon,
          color: trackData.color,
          display_order: trackData.order,
          total_lessons: trackData.lessons.length
        })
        .select()
        .single();

      if (trackError) throw trackError;

      // 2. Insert Modules
      for (const mod of trackData.modules) {
        const { error: modError } = await supabase
          .from('modules')
          .insert({
            id: mod.id,
            track_id: track.id,
            name: mod.name,
            display_order: mod.order
          });
        
        if (modError) throw modError;
      }

      // 3. Insert Lessons
      for (const lessonData of trackData.lessons) {
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            slug: lessonData.slug,
            track_id: track.id,
            module_id: lessonData.moduleId,
            title: lessonData.title,
            display_order: lessonData.order,
            estimated_minutes: lessonData.estimatedMinutes,
            xp_reward: lessonData.xpReward,
            concept_title: lessonData.conceptTitle,
            concept_content: lessonData.conceptContent,
            concept_highlights: lessonData.conceptHighlights,
            example_language: lessonData.exampleLanguage,
            example_code: lessonData.exampleCode,
            example_explanation: lessonData.exampleExplanation,
            practice_type: lessonData.practiceType,
            practice_instruction: lessonData.practiceInstruction,
            practice_template: lessonData.practiceTemplate,
            practice_answer: lessonData.practiceAnswer
          })
          .select()
          .single();

        if (lessonError) throw lessonError;

        // 4. Insert Challenges
        for (const challengeData of lessonData.challenges) {
          const { error: challengeError } = await supabase
            .from('challenges')
            .insert({
              lesson_id: lesson.id,
              type: challengeData.type,
              question: challengeData.question,
              options: challengeData.options || [],
              correct_index: challengeData.correctIndex,
              template: challengeData.template,
              answer: challengeData.answer,
              explanation: challengeData.explanation,
              xp_reward: 10
            });

          if (challengeError) throw challengeError;
        }
      }

      console.log(`✅ ${trackData.name} seeded successfully.`);
    }

    console.log('\n🎉 Supabase Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
