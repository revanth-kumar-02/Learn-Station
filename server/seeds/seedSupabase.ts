import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { tracksData as handcraftedTracks } from './curriculumData';

dns.setDefaultResultOrder('ipv4first');



dotenv.config({ path: path.join(__dirname, '..', '.env') });




if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const customFetch = async (url: string, options: any, retries = 7, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err: any) {
      if (i === retries - 1) throw err;
      const currentDelay = delay * Math.pow(2, i);
      console.warn(`⚠️ Fetch failed (${err.message || err}), retrying in ${currentDelay}ms... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (url, options) => customFetch(url as string, options)
    }
  }
);

// --- 72 PROGRAMMATIC TRACKS SPECIFICATIONS ---
const categoriesConfig = {
  programming: {
    title: 'Programming',
    tracks: [
      { slug: 'javascript', name: 'JavaScript', description: 'Master variables, loops, arrays, functions, objects, promises, and async JavaScript syntax.', icon: 'code', color: 'hsl(52, 80%, 45%)', lessons: ['Variables & Scope', 'Arrow Functions', 'Array Methods', 'Object Destructuring', 'Promises Foundations', 'Async & Await', 'Fetch API Calls', 'Event Loop & Queue', 'DOM Selectors', 'Event Listeners', 'Local Storage', 'JSON & Parsers'] },
      { slug: 'typescript', name: 'TypeScript', description: 'Learn static typing, interfaces, generics, decorators, and advanced type configurations for robust coding.', icon: 'code', color: 'hsl(217, 91%, 50%)', lessons: ['Static Typing', 'Interfaces', 'Type Aliases', 'Union Types', 'Generics Foundations', 'Any vs Unknown', 'Enums', 'Classes & Accessors', 'Decorators', 'Configuring tsconfig', 'Modules Import/Export', 'Utility Types'] },
      { slug: 'c-lang', name: 'C Programming', description: 'Learn memory management, pointers, structures, and low-level system interactions.', icon: 'code', color: 'hsl(200, 70%, 40%)', lessons: ['C Syntax & Variables', 'Pointers & Memory', 'Pointer Arithmetic', 'Structs & Unions', 'Dynamic Allocation', 'File I/O in C', 'Header Files & Macro', 'Bitwise Operators', 'C Arrays & Strings', 'Memory Leaks', 'Compilation stages', 'Standard Libraries'] },
      { slug: 'cpp', name: 'C++', description: 'Master object-oriented C++, templates, STL containers, and performance-driven development.', icon: 'code', color: 'hsl(200, 70%, 45%)', lessons: ['C++ Classes', 'References & Pointers', 'Method Overloading', 'OOP Inheritance', 'Virtual Functions', 'Templates & Generics', 'STL Vectors', 'STL Maps', 'Smart Pointers', 'RAII Pattern', 'Operator Overloading', 'Exception Handling'] },
      { slug: 'csharp', name: 'C#', description: 'Build robust enterprise applications, LINQ queries, and async-await architectures in .NET.', icon: 'code', color: 'hsl(262, 70%, 50%)', lessons: ['C# Variables & Types', 'Properties & Fields', 'LINQ Queries', 'Async & Await C#', 'Namespaces & Imports', 'Interfaces in C#', 'Delegates & Events', 'Garbage Collection', 'Attributes & Reflection', 'Exceptions Handling', 'C# File Pipelines', 'Entity Framework'] },
      { slug: 'go-lang', name: 'Go (Golang)', description: 'Learn concurrency channels, goroutines, strong typing, and web services in Go.', icon: 'code', color: 'hsl(190, 80%, 45%)', lessons: ['Go Syntax & Structs', 'Pointers in Go', 'Slices & Maps', 'Go Functions', 'Interfaces in Go', 'Goroutines', 'Channels & Select', 'Mutex & WaitGroup', 'Error Handling', 'Go Modules', 'HTTP Servers in Go', 'Testing in Go'] },
      { slug: 'rust', name: 'Rust', description: 'Master ownership, borrowing, lifetimes, memory safety, and thread concurrency.', icon: 'code', color: 'hsl(25, 70%, 40%)', lessons: ['Rust Syntax', 'Ownership Rules', 'Borrowing & Refs', 'Lifetimes', 'Pattern Matching', 'Enums & Option', 'Rust Structs', 'Traits', 'Cargo & Packages', 'Result Error handling', 'Smart Pointers Rust', 'Threads & Concurrency'] },
      { slug: 'kotlin', name: 'Kotlin', description: 'Learn Kotlin variables, null safety, coroutines, and functional extensions.', icon: 'code', color: 'hsl(280, 80%, 55%)', lessons: ['Kotlin Variables', 'Null Safety', 'Kotlin Functions', 'Classes & Properties', 'Data Classes', 'Smart Casts', 'Kotlin Coroutines', 'Extension Functions', 'Lambdas & Scope', 'Kotlin Collections', 'Sealed Classes', 'Java Interoperability'] },
      { slug: 'swift', name: 'Swift', description: 'Master iOS-driven Swift programming, optionals, protocols, and closures.', icon: 'code', color: 'hsl(14, 90%, 55%)', lessons: ['Swift Syntax', 'Optionals & Binding', 'Closures', 'Swift Structs', 'Classes & Reference', 'Protocols', 'Extensions', 'Swift Generics', 'Error Handling Swift', 'Access Controls', 'ARC Memory management', 'Swift UI basics'] },
      { slug: 'php', name: 'PHP', description: 'Master backend PHP web development, PDO database connectivity, and session security.', icon: 'code', color: 'hsl(230, 50%, 55%)', lessons: ['PHP Variables & Output', 'PHP Arrays & Loops', 'Superglobals', 'PHP Functions', 'GET & POST processing', 'Session & Cookies', 'PHP OOP Classes', 'Database PDO connections', 'Composer Packages', 'Exception Handling PHP', 'Web Forms security', 'REST APIs in PHP'] }
    ]
  },
  webdev: {
    title: 'Web Development',
    tracks: [
      { slug: 'html', name: 'HTML Fundamentals', description: 'Learn semantic structure, forms, SEO tags, and modern web accessibility practices.', icon: 'globe', color: 'hsl(14, 85%, 55%)', lessons: ['HTML Structure', 'Semantic Elements', 'Links & Images', 'HTML Lists', 'Web Forms Syntax', 'Form Validation', 'Tables & Layouts', 'Head Meta Tags', 'SEO best practices', 'Accessibility A11y', 'HTML Multimedia', 'IFrames & Scripts'] },
      { slug: 'css', name: 'Advanced CSS & Layouts', description: 'Master CSS Grid, Flexbox, transitions, custom properties, and responsive layout scaling.', icon: 'globe', color: 'hsl(217, 91%, 60%)', lessons: ['CSS Selectors', 'Box Model', 'Flexbox Alignment', 'Grid Layouts', 'CSS Positioning', 'Media Queries', 'Transitions & Anim', 'CSS Variables', 'Pseudo-elements', 'Sass & Preprocessors', 'BEM naming rules', 'Flex vs Grid'] },
      { slug: 'react', name: 'React', description: 'Master hooks, state management, virtual DOM reconciliation, and component composition.', icon: 'globe', color: 'hsl(199, 89%, 48%)', lessons: ['React JSX', 'Components & Props', 'useState Hook', 'useEffect Hook', 'Handling Events', 'Conditional Render', 'Lists & Keys', 'React Context', 'Custom Hooks', 'Forms in React', 'Routing in React', 'Performance optimization'] },
      { slug: 'nextjs', name: 'Next.js', description: 'Master App Router, Server Components, SSR, static generation, and route handlers.', icon: 'globe', color: 'hsl(0, 0%, 15%)', lessons: ['Next.js App Router', 'Server Components', 'Client Components', 'File-based Routing', 'Data Fetching SSR', 'Next.js API Routes', 'Image Optimization', 'Dynamic Routing', 'Middlewares', 'Next.js Metadata', 'SSG vs ISR', 'Deployment rules'] },
      { slug: 'angular', name: 'Angular', description: 'Learn modules, dependency injection, RxJS streams, and component bindings.', icon: 'globe', color: 'hsl(346, 77%, 50%)', lessons: ['Angular Architecture', 'Templates & Binding', 'Directives', 'Services & DI', 'RxJS Observables', 'Angular Routing', 'Reactive Forms', 'Http Client calls', 'Component Lifecycle', 'Modules vs Standalone', 'Angular CLI tools', 'Pipes & Formatters'] },
      { slug: 'vuejs', name: 'Vue.js', description: 'Master Vue Composition API, reactive references, directives, and Pinia stores.', icon: 'globe', color: 'hsl(142, 71%, 45%)', lessons: ['Vue Templates', 'Reactivity Ref', 'Computed Properties', 'Directives v-if/v-for', 'Vue Components', 'Props & Events emit', 'Composition API', 'Vue Router', 'Pinia State Store', 'Vue Lifecycle', 'Watchers in Vue', 'Scoped Styles'] },
      { slug: 'nodejs', name: 'Node.js', description: 'Master event loop, file stream pipelines, processes, and HTTP core routing.', icon: 'globe', color: 'hsl(142, 71%, 40%)', lessons: ['Node.js Event Loop', 'Module exports', 'File System fs', 'HTTP Core Module', 'Buffers & Streams', 'Path & URL Modules', 'Package.json NPM', 'Error Event handlers', 'Child Processes', 'Node Event Emitter', 'Environment Variables', 'Node Debugging'] },
      { slug: 'expressjs', name: 'Express.js', description: 'Build scalable REST APIs, middleware filters, routers, and CORS configurations.', icon: 'globe', color: 'hsl(0, 0%, 30%)', lessons: ['Express Routing', 'Request & Response', 'Middleware layers', 'REST API Design', 'JSON parsing CORS', 'Query Parameters', 'Express Routers', 'Static file serving', 'Error Handlers Middleware', 'Database integration', 'Auth Token check', 'File Uploads multer'] },
      { slug: 'tailwindcss', name: 'Tailwind CSS', description: 'Learn utility-first styling, grid spacing, components configuration, and layout cards.', icon: 'globe', color: 'hsl(190, 80%, 45%)', lessons: ['Tailwind Setup', 'Utility-First Concept', 'Spacing & Layouts', 'Flexbox & Grid classes', 'Tailwind Responsive', 'Hover & Focus states', 'Dark Mode Tailwind', 'Custom Config file', 'Typography plugin', 'Arbitrary values', 'Components styling', 'Production Purging'] }
    ]
  },
  mobile: {
    title: 'Mobile Development',
    tracks: [
      { slug: 'android-dev', name: 'Android Development', description: 'Build native applications, intent routers, views, and SQL database storage.', icon: 'mobile', color: 'hsl(142, 71%, 45%)', lessons: ['Android Project structure', 'Android Manifest file', 'Activities Lifecycle', 'Intents & Navigation', 'XML UI Layouts', 'RecyclerView tables', 'SharedPreferences storage', 'SQLite database access', 'Android Services', 'Broadcast Receivers', 'Permissions checks', 'App publishing'] },
      { slug: 'flutter', name: 'Flutter & Dart', description: 'Build cross-platform applications, widget trees, and state management in Dart.', icon: 'mobile', color: 'hsl(199, 89%, 48%)', lessons: ['Dart Syntax basics', 'Stateless Widgets', 'Stateful Widgets', 'Flutter Layout tree', 'Material Design components', 'Gesture Detectors', 'Flutter State management', 'Routing & Navigation', 'HTTP API integrations', 'Local storage SharedPrefs', 'Assets & Fonts', 'Building app binaries'] },
      { slug: 'react-native', name: 'React Native', description: 'Build native iOS and Android apps using React components and styles.', icon: 'mobile', color: 'hsl(199, 89%, 48%)', lessons: ['React Native Elements', 'Styles & Flexbox', 'ScrollView vs FlatList', 'State & Props RN', 'React Navigation', 'Native Modules bridge', 'Permissions controls', 'Local Storage AsyncStore', 'Images & Media', 'RN Forms validation', 'Debugging RN apps', 'Deploying AppStore'] },
      { slug: 'swiftui', name: 'SwiftUI', description: 'Master declarative user interfaces, state bindings, and animations for Apple platforms.', icon: 'mobile', color: 'hsl(14, 90%, 55%)', lessons: ['SwiftUI Views', 'Declarative Syntax', 'State & Binding props', 'List & Scroll views', 'SwiftUI Navigation', 'Animations & Effects', 'ObservedObjects bindings', 'Environment values', 'Custom View modifiers', 'Forms & Inputs', 'SwiftUI Drawers', 'CoreData integration'] },
      { slug: 'ios-dev', name: 'iOS Development', description: 'Build native Swift iOS layouts, AppStore compliance, and CoreData storage.', icon: 'mobile', color: 'hsl(0, 0%, 50%)', lessons: ['Xcode IDE workspace', 'Storyboard vs Code UI', 'ViewController Lifecycle', 'AutoLayout constraints', 'CocoaPods Packages', 'TableViews & Collection', 'CoreData storage', 'Keychain Credentials', 'App Store Guidelines', 'Push Notifications', 'Location Services', 'Background tasks'] }
    ]
  },
  databases: {
    title: 'Databases',
    tracks: [
      { slug: 'advanced-sql', name: 'Advanced SQL', description: 'Master window functions, transaction isolation levels, indexing algorithms, and CTEs.', icon: 'database', color: 'hsl(199, 89%, 48%)', lessons: ['Window Functions', 'Common Table Expressions', 'Subqueries Correlated', 'Index structures B-Tree', 'Transaction Isolation', 'Stored Procedures', 'Trigger functions', 'Query Plan ANALYZE', 'DB Normalization', 'Partitioning tables', 'Materialized Views', 'Optimizing JOINS'] },
      { slug: 'postgresql', name: 'PostgreSQL', description: 'Learn pgSQL procedures, indexing, JSONB column formats, and database vacuum tuning.', icon: 'database', color: 'hsl(217, 91%, 60%)', lessons: ['Postgres Datatypes', 'JSONB column indexing', 'pgSQL Stored Procedures', 'VACUUM database maintenance', 'Postgres Extensions', 'Full Text Search', 'UUID keys generation', 'Roles & Permissions', 'Logical Replication', 'Backup & Restore pg_dump', 'Postgres connection pools', 'Upsert INSERT ON CONFLICT'] },
      { slug: 'mysql', name: 'MySQL', description: 'Master query optimization, replication, constraints, and relational table indexing.', icon: 'database', color: 'hsl(199, 89%, 40%)', lessons: ['MySQL Datatypes', 'Storage Engines InnoDB', 'MySQL Index optimization', 'Foreign Key rules', 'Replication Master-Slave', 'Transactions ACID rules', 'Slow Query Logs', 'MySQL Join optimization', 'DB backup mysqldump', 'Stored Functions MySQL', 'Views & Triggers', 'MySQL Server tuning'] },
      { slug: 'mongodb', name: 'MongoDB', description: 'Learn document-oriented aggregation pipelines, indexes, and BSON structures.', icon: 'database', color: 'hsl(142, 71%, 45%)', lessons: ['NoSQL Concept BSON', 'MongoDB CRUD operations', 'Document Schemas', 'Aggregation Pipelines', 'MongoDB Indexing', 'Embedded vs Reference', 'Transactions in Mongo', 'GridFS File storage', 'Mongoose ODM basics', 'MongoDB Sharding', 'Replica Sets', 'Query performance optimization'] },
      { slug: 'redis', name: 'Redis Caching', description: 'Master key-value storage structures, cache invalidation strategies, and pub/sub pipelines.', icon: 'database', color: 'hsl(346, 77%, 50%)', lessons: ['Redis Data structures', 'String & Hash operations', 'Redis Cache keys expiry', 'Cache eviction policies', 'Redis Transactions', 'Pub/Sub pipelines', 'Redis Persistence RDB/AOF', 'Redis Cluster setup', 'Rate limiting with Redis', 'Session storage Redis', 'Sorted Sets leaderboards', 'Redis Pipelines speed'] },
      { slug: 'db-design', name: 'Database Design', description: 'Learn Entity-Relationship schemas, normalization (1NF-3NF), and referential rules.', icon: 'database', color: 'hsl(38, 92%, 50%)', lessons: ['Relational Schema ERD', 'Primary & Foreign Keys', '1st Normal Form (1NF)', '2nd Normal Form (2NF)', '3rd Normal Form (3NF)', 'Denormalization trade-offs', 'Database constraints', 'Cascade Rules delete/update', 'Many-to-Many junctions', 'UUID vs Auto-increment', 'Indexing strategy design', 'Data Migrations design'] }
    ]
  },
  datascience: {
    title: 'Data Science',
    tracks: [
      { slug: 'data-analysis', name: 'Data Analysis', description: 'Clean raw data streams, compute statistical indicators, and generate tables.', icon: 'trend-up', color: 'hsl(142, 71%, 45%)', lessons: ['Data Cleaning basics', 'Data Imputation techniques', 'Descriptive Statistics', 'Groupby Aggregations', 'Filtering records data', 'Pivot Tables generation', 'Data Merging joins', 'Time Series analysis', 'Outliers detection', 'Data normalization scaling', 'Handling missing values', 'Exporting clean reports'] },
      { slug: 'numpy', name: 'NumPy', description: 'Master multi-dimensional array vectorization, slicing, and linear algebra math.', icon: 'trend-up', color: 'hsl(217, 91%, 50%)', lessons: ['NumPy Arrays creation', 'Array indexing & slicing', 'Vectorized Operations', 'Broadcasting arrays', 'Math functions NumPy', 'Linear Algebra operations', 'Random sampling stats', 'Reshaping & Transposing', 'Filtering with boolean masks', 'Sorting NumPy arrays', 'Memory efficiency NumPy', 'Array concatenation split'] },
      { slug: 'pandas', name: 'Pandas', description: 'Master DataFrame data alignment, joins, group operations, and CSV transformations.', icon: 'trend-up', color: 'hsl(262, 83%, 58%)', lessons: ['Pandas Series & DataFrame', 'Reading CSV/Excel files', 'Indexing loc & iloc', 'Filtering DataFrames', 'Handling Null values', 'Pandas GroupBy functions', 'Merging & Joining frames', 'DataFrame concatenations', 'DateTime manipulations', 'String methods Pandas', 'Applying custom functions', 'DataFrame export options'] },
      { slug: 'data-viz', name: 'Data Visualization', description: 'Master data plotting, distribution layouts, charts, and interactive dashboards.', icon: 'trend-up', color: 'hsl(38, 92%, 50%)', lessons: ['Plotting Line charts', 'Bar charts & Histograms', 'Scatter plots correlations', 'Matplotlib customizing', 'Seaborn statistical plots', 'Heatmaps & Density charts', 'Box & Violin plots', 'Adding titles & legends', 'Subplots configurations', 'Interactive charts Plotly', 'Exporting image files', 'Colors & palettes design'] },
      { slug: 'statistics', name: 'Statistics', description: 'Master probability models, distributions, hypothesis tests, and variance analysis.', icon: 'trend-up', color: 'hsl(346, 77%, 50%)', lessons: ['Mean, Median, & Mode', 'Variance & Std Dev', 'Probability distributions', 'Z-scores & Normalization', 'Central Limit Theorem', 'Confidence Intervals', 'Hypothesis testing P-value', 'T-tests & ANOVA', 'Correlation Pearson', 'Linear Regression basics', 'Chi-Square tests', 'Bayes Theorem basics'] }
    ]
  },
  ai: {
    title: 'Artificial Intelligence',
    tracks: [
      { slug: 'prompt-eng', name: 'Prompt Engineering', description: 'Learn prompting strategies, chain-of-thought reasoning, AI workflows, and optimization techniques.', icon: 'cpu', color: 'hsl(262, 83%, 58%)', lessons: ['System Directives', 'Few-Shot prompting', 'Chain of Thought (CoT)', 'Prompt templates design', 'Output formatting JSON', 'Zero-shot learning', 'Role prompting tactics', 'Handling hallucinations', 'Prompt security injections', 'Dynamic context prompts', 'Iterative prompt tuning', 'Prompts size tokens limit'] },
      { slug: 'nlp', name: 'Natural Language Processing', description: 'Learn text processing, transformers, sentiment analysis, embeddings, and modern NLP systems.', icon: 'cpu', color: 'hsl(199, 89%, 48%)', lessons: ['NLP Tokenization', 'Stopwords & Stemming', 'TF-IDF Text Vectors', 'Word Embeddings concept', 'Recurrent Neural Nets', 'Transformers architecture', 'Attention Mechanism', 'Sentiment Analysis NLP', 'Named Entity Recog NER', 'Text Summarization models', 'Machine Translation seq2seq', 'BERT fine-tuning'] },
      { slug: 'computer-vision', name: 'Computer Vision', description: 'Master image processing, object detection, CNNs, OpenCV, and AI vision applications.', icon: 'cpu', color: 'hsl(346, 77%, 50%)', lessons: ['Image Arrays pixels', 'Color spaces RGB/HSV', 'Kernel Filters blur/edge', 'Image thresholding', 'Convolutional Nets CNN', 'Max Pooling layers', 'Image Classification model', 'Object Detection YOLO', 'Bounding boxes labels', 'Image Segmentation basic', 'Data Augmentation images', 'Transfer Learning ResNet'] },
      { slug: 'generative-ai', name: 'Generative AI', description: 'Build AI-powered applications using LLMs, prompt engineering, agents, and RAG systems.', icon: 'cpu', color: 'hsl(38, 92%, 50%)', lessons: ['Generative models concepts', 'Variational Autoencoders VAE', 'Generative Adversarial GANs', 'Transformers for text', 'Diffusion Models images', 'LLM Architectures basic', 'Decoding strategies temp', 'Tokens & Tokenizer pipelines', 'Temperature & Top-P tuning', 'Reinforcement Learning RLHF', 'AI Image prompts', 'Generative safety filters'] },
      { slug: 'llm-engineering', name: 'LLM Engineering', description: 'Master large language models engineering, quantization, fine-tuning, and model evaluation.', icon: 'cpu', color: 'hsl(262, 83%, 58%)', lessons: ['LLM API Integrations', 'Context Window limits', 'Quantization concepts', 'PEFT & LoRA tuning', 'Model evaluation metrics', 'JSON Mode configurations', 'Instruction tuning rules', 'Retrieval architectures', 'Open-source models deployment', 'Vector Embeddings gen', 'Rate Limits & Caching', 'Fine-tuning datasets prep'] },
      { slug: 'ai-agents', name: 'AI Agents', description: 'Design autonomous AI agents, state machines, tools, and multi-agent coordination frameworks.', icon: 'cpu', color: 'hsl(199, 89%, 48%)', lessons: ['Agent ReAct Framework', 'Autonomous Agent loops', 'Agent memory short/long', 'Tool Calling specifications', 'Multi-Agent coordination', 'Agent planning tasks', 'State machines for agents', 'Agent safety guardrails', 'LangChain Agent systems', 'CrewAI multi-agents', 'Agent feedback loop', 'Agent debug techniques'] },
      { slug: 'rag-systems', name: 'RAG Systems', description: 'Build production-ready Retrieval-Augmented Generation systems, text chunking, and vector database search.', icon: 'cpu', color: 'hsl(142, 71%, 45%)', lessons: ['RAG Pipeline architecture', 'Document Text Chunking', 'Embedding generation APIs', 'Vector Database retrieval', 'Similarity Search cosine', 'Metadata Filtering RAG', 'Query Rewriting methods', 'Reranking retrieval hits', 'Context assembly prompts', 'Evaluating RAG systems', 'Hybrid Search lex/vec', 'RAG database updates'] },
      { slug: 'deep-learning', name: 'Deep Learning', description: 'Master neural networks, backpropagation, CNNs, RNNs, and custom model training.', icon: 'cpu', color: 'hsl(346, 77%, 50%)', lessons: ['Perceptrons & Neural Nets', 'Weights & Bias params', 'Activation Functions ReLU', 'Forward Propagation pass', 'Loss Functions cross-ent', 'Backpropagation derivation', 'Gradient Descent optim', 'Overfitting Regularization', 'Batch Normalization', 'Dropout layers optimization', 'Vanishing Gradients issue', 'Adam optimizer tuning'] }
    ]
  },
  devops: {
    title: 'Cloud & DevOps',
    tracks: [
      { slug: 'linux', name: 'Linux Fundamentals', description: 'Master Linux file systems, shell commands, bash scripting, permissions, and cron job scheduling.', icon: 'server', color: 'hsl(0, 0%, 20%)', lessons: ['Linux File structure', 'Basic Commands ls/cd/pwd', 'File Permissions chmod', 'Processes management ps/kill', 'Pipelines & Redirections', 'Grepping file content grep', 'Bash Scripting variables', 'Bash Conditionals loops', 'Environment PATH vars', 'Package managers apt/yum', 'SSH keygen connections', 'Cron jobs scheduling'] },
      { slug: 'git-github', name: 'Git & GitHub', description: 'Learn version control, git branching workflows, merge conflicts, pull requests, and CI/CD pipelines.', icon: 'server', color: 'hsl(25, 80%, 50%)', lessons: ['Git Init & Commit', 'Branching & Checkout', 'Git Merges strategies', 'Resolve Merge Conflicts', 'Git Rebase vs Merge', 'Remote Repos push/pull', 'GitHub Pull Requests', 'Git Stash save state', 'Git Reset vs Revert', 'Git Log history commit', 'GitHub Actions basics', 'Forking workflows Git'] },
      { slug: 'docker', name: 'Docker', description: 'Learn containerization concepts, Dockerfiles, volume persistence, networks, and compose workflows.', icon: 'server', color: 'hsl(199, 89%, 48%)', lessons: ['Docker Containers concept', 'Docker Images registry', 'Dockerfile Instructions', 'Docker Volumes persist', 'Port Mapping container', 'Docker Compose files', 'Multi-stage builds file', 'Docker Network bridges', 'Environment parameters', 'Managing container logs', 'Docker Swarm basics', 'Containerizing Node apps'] },
      { slug: 'kubernetes', name: 'Kubernetes', description: 'Master container orchestration, pods, deployments, services, ingress, and rolling updates.', icon: 'server', color: 'hsl(217, 91%, 60%)', lessons: ['Kubernetes Architecture', 'Pods configuration specs', 'K8s Deployments scale', 'Kubernetes Services routing', 'ConfigMaps & Secrets', 'Ingress Controller setup', 'Persistent Volumes claims', 'Kubeclt CLI utility commands', 'Namespaces isolation', 'K8s Liveness probes', 'Rolling Updates rollback', 'Helm Charts basic'] },
      { slug: 'aws', name: 'AWS Cloud', description: 'Learn core AWS services including EC2, S3, RDS, IAM, Lambda, and high-availability setups.', icon: 'server', color: 'hsl(38, 92%, 50%)', lessons: ['AWS Account & IAM security', 'VPC Networks subnets', 'EC2 Virtual Servers', 'S3 Object Storage buckets', 'RDS Relational Databases', 'AWS Lambda serverless', 'Auto Scaling groups ELB', 'CloudWatch Logs alarms', 'AWS CLI usage terminal', 'DynamoDB NoSQL database', 'AWS API Gateway proxy', 'Route 53 Domain Routing'] },
      { slug: 'azure', name: 'Azure Cloud', description: 'Learn core Microsoft Azure services including VMs, blob storage, Azure SQL, and SRE monitoring.', icon: 'server', color: 'hsl(199, 89%, 48%)', lessons: ['Azure Portals & Directory', 'Virtual Networks VNet', 'Azure Virtual Machines VM', 'Blob Storage accounts', 'SQL Databases in Azure', 'Azure Functions serverless', 'Load Balancers setup', 'Azure Monitor alerts', 'Azure CLI command tasks', 'CosmosDB NoSQL storage', 'App Services deployment', 'Azure Devops pipeline'] },
      { slug: 'google-cloud', name: 'Google Cloud', description: 'Learn Google Cloud services including Compute Engine, GCS buckets, GKE, and serverless Cloud Run.', icon: 'server', color: 'hsl(217, 91%, 60%)', lessons: ['GCP Projects & IAM roles', 'VPC Network subnets GCP', 'Compute Engine VM setups', 'Cloud Storage buckets GCP', 'Cloud SQL database setup', 'Cloud Functions trigger', 'Google Kubernetes Engine', 'Stackdriver monitoring logs', 'gcloud CLI configuration', 'BigQuery analytics engine', 'App Engine deployments', 'Cloud Run containers deployment'] },
      { slug: 'cicd', name: 'CI/CD Pipelines', description: 'Build automated build, test, and deployment pipelines using GitHub Actions, Jenkins, or GitLab.', icon: 'server', color: 'hsl(142, 71%, 45%)', lessons: ['CI/CD Pipeline concepts', 'Build Automation files', 'Unit testing script task', 'Dockerizing pipeline steps', 'GitHub Actions workflows', 'Jenkins Pipelines basic', 'GitLab CI runner configs', 'Artifacts storage setup', 'Environment Staging deploy', 'Deployment strategies blue', 'Secret parameters in CI/CD', 'Automated Rollback scripts'] },
      { slug: 'terraform', name: 'Terraform IaC', description: 'Master Infrastructure as Code (IaC) concepts, providers, modules, state locking, and cloud resource provisioning.', icon: 'server', color: 'hsl(262, 83%, 58%)', lessons: ['IaC declarative concept', 'Terraform Providers setup', 'Terraform Variables outputs', 'Declaring Cloud Resources', 'Terraform State file lock', 'Terraform Modules reuse', 'Terraform Plan & Apply', 'State migration backends', 'Terraform Workspace config', 'Resources dependencies dependencies', 'Destroying IaC assets', 'Terraform Cloud basic'] }
    ]
  },
  security: {
    title: 'Cyber Security',
    tracks: [
      { slug: 'security-fundamentals', name: 'Security Fundamentals', description: 'Master risk assessment, threat vectors, access controls, CIA triad, and auditing fundamentals.', icon: 'shield', color: 'hsl(346, 77%, 50%)', lessons: ['CIA Triad concept', 'Threat Vectors taxonomy', 'Symmetric Encryption AES', 'Asymmetric Encryption RSA', 'Hashing functions SHA', 'Access Control models', 'Authentication protocols', 'Social Engineering scams', 'Malware categories virus', 'Firewalls & IDS concepts', 'Risk Assessment basics', 'Security Auditing steps'] },
      { slug: 'network-security', name: 'Network Security', description: 'Learn firewall configurations, TLS/SSL, network packet sniffing, VPNs, and network threat mitigation.', icon: 'shield', color: 'hsl(217, 91%, 60%)', lessons: ['TCP/IP Model security', 'Firewall rules setup', 'Intrusion Detection IDS/IPS', 'TLS/SSL Secure Sockets', 'Port Auditing nmap', 'Wireshark packet sniffing', 'VPN Tunnels IPsec/OpenVPN', 'Subnetting isolation rules', 'DNS Sec protecting lookup', 'Wireless security WPA', 'DDOS attacks mitigation', 'Network Access Control NAC'] },
      { slug: 'ethical-hacking', name: 'Ethical Hacking', description: 'Master scanning vulnerabilities, privilege escalation, social engineering tools, and pentest frameworks.', icon: 'shield', color: 'hsl(142, 71%, 40%)', lessons: ['Hacking phases overview', 'Reconnaissance active/pass', 'Vulnerability scanning scans', 'Exploiting software flaws', 'Privilege Escalation steps', 'Maintaining access backdoors', 'Evading IDS firewalls', 'Password cracking hashes', 'Social engineering toolkit', 'Wireless networks cracking', 'Mobile platform hacking', 'Reporting findings writeups'] },
      { slug: 'pentesting', name: 'Penetration Testing', description: 'Learn scoping rules, vulnerability analysis, exploitation with Metasploit, and professional report writing.', icon: 'shield', color: 'hsl(0, 0%, 30%)', lessons: ['Pentest scoping rules', 'Information Gathering nmap', 'Vulnerability Analysis tools', 'Exploitation Metasploit tool', 'Post-Exploitation steps', 'Web App pentesting basics', 'Network pentesting tasks', 'Wireless pentesting audits', 'Social Engineering test', 'Buffer Overflow exploit', 'Payload generation encoding', 'Report writing templates'] },
      { slug: 'web-security', name: 'Web Security', description: 'Understand OWASP Top 10 vulnerabilities, SQL injection, XSS, CSRF, and web application firewalls.', icon: 'shield', color: 'hsl(14, 85%, 55%)', lessons: ['OWASP Top 10 introduction', 'SQL Injection vulnerability', 'Cross-Site Scripting XSS', 'Cross-Site Request CSRF', 'Broken Auth session hijack', 'Security Misconfiguration', 'XXE Injection exploits', 'Directory Traversal files', 'API Security endpoints', 'HTTPS TLS setup config', 'Content Security Policy CSP', 'Web Application Firewall WAF'] },
      { slug: 'digital-forensics', name: 'Digital Forensics', description: 'Learn data acquisition, memory forensics, timeline logs analysis, and registry forensics.', icon: 'shield', color: 'hsl(190, 80%, 45%)', lessons: ['Forensic investigation phases', 'Data Acquisition disk dump', 'Memory forensics volatility', 'File system analysis logs', 'Timeline analysis logs', 'Event Log auditing syslogs', 'Registry forensics Windows', 'Network forensics packets', 'Email forensics headers', 'Mobile forensics databases', 'Malware analysis basic', 'Report writing forensics'] }
    ]
  },
  engineering: {
    title: 'Software Engineering',
    tracks: [
      { slug: 'data-structures', name: 'Data Structures', description: 'Master arrays, linked lists, stacks, queues, hash tables, trees, and graphs memory layouts.', icon: 'git-merge', color: 'hsl(262, 83%, 58%)', lessons: ['Array & ArrayList memory', 'Linked Lists single/double', 'Stacks LIFO structures', 'Queues FIFO structures', 'Hash Tables collisions', 'Binary Trees structure', 'Binary Search Trees BST', 'Graphs representation nodes', 'Heaps & Priority queues', 'Tries String dictionaries', 'Self-balancing trees AVL', 'Data structures choice rules'] },
      { slug: 'algorithms', name: 'Algorithms', description: 'Understand sorting, binary search, dynamic programming, and algorithm runtime complexity (Big O).', icon: 'git-merge', color: 'hsl(346, 77%, 50%)', lessons: ['Big O Notation time/space', 'Sorting Bubble/Merge/Quick', 'Binary Search algorithm', 'Recursion concepts calls', 'Dynamic Programming basic', 'Graph Traversals DFS/BFS', 'Greedy Algorithms tasks', 'Divide & Conquer tactics', 'String Search algorithms', 'Sliding Window techniques', 'Two Pointers algorithms', 'Backtracking basic setups'] },
      { slug: 'system-design', name: 'System Design', description: 'Learn system design scaling, load balancers, caching CDNs, database sharding, and message queues.', icon: 'git-merge', color: 'hsl(38, 92%, 50%)', lessons: ['Load Balancers scaling', 'Caching strategies CDN/Redis', 'Database Scaling replication', 'Horizontal vs Vertical scale', 'Message Queues RabbitMQ/Kafka', 'API Gateways routing', 'Microservices Architecture', 'Consistent Hashing ring', 'DNS load balancing setups', 'Rate Limiting designs', 'System metrics logging', 'Design: URL Shortener scale'] },
      { slug: 'design-patterns', name: 'Design Patterns', description: 'Master reusable design patterns including Singleton, Factory, Observer, and Adapter structures.', icon: 'git-merge', color: 'hsl(199, 89%, 48%)', lessons: ['Singleton Pattern class', 'Factory Pattern instances', 'Observer Pattern events', 'Builder Pattern complex', 'Strategy Pattern algorithms', 'Adapter Pattern interfaces', 'Decorator Pattern classes', 'Facade Pattern wrapper', 'Proxy Pattern access', 'Command Pattern actions', 'State Pattern behaviors', 'Template Method pattern'] },
      { slug: 'oop', name: 'Object Oriented Design', description: 'Learn Object-Oriented programming principles, SOLID design, and class-relationship design rules.', icon: 'git-merge', color: 'hsl(217, 91%, 60%)', lessons: ['OOP Encapsulation variables', 'OOP Inheritance extends', 'OOP Polymorphism overrides', 'OOP Abstraction abstract', 'SOLID: Single Responsibility', 'SOLID: Open/Closed rules', 'SOLID: Liskov Substitution', 'SOLID: Interface Segregation', 'SOLID: Dependency Inversion', 'Composition vs Inheritance', 'Design: Parking Lot classes', 'Design: Movie Ticket booking'] },
      { slug: 'software-arch', name: 'Software Architecture', description: 'Master architectural styles including Clean Architecture, microservices, CQRS, and event-driven setups.', icon: 'git-merge', color: 'hsl(142, 71%, 45%)', lessons: ['Clean Architecture layers', 'Event-Driven Architectures', 'Domain-Driven Design DDD', 'MVC architectural pattern', 'Monolith vs Microservices', 'Serverless Architectures', 'Layered Architecture style', 'CQRS data segregation', 'Service-Oriented SOA', 'Hexagonal Architecture ports', 'Scalability principles arch', 'Fault Tolerance resilience'] }
    ]
  },
  careers: {
    title: 'Career Tracks',
    tracks: [
      { slug: 'frontend-career', name: 'Frontend Developer', description: 'Build interactive user interfaces, master CSS responsiveness, React lifecycle, and web optimization.', icon: 'briefcase', color: 'hsl(199, 89%, 48%)', lessons: ['HTML Semantic Layouts', 'Responsive CSS styles', 'Modern JS ES6 features', 'React components hooks', 'State Management Redux', 'Browser layout render cycles', 'CSS Preprocessors setups', 'Frontend Build Tools vite', 'Testing Frontend vitest', 'Web Performance audit', 'SEO & meta configuration', 'Web Hosting Netlify/Vercel'] },
      { slug: 'backend-career', name: 'Backend Developer', description: 'Build fast server-side systems, REST APIs, middleware auth, and connect SQL/NoSQL databases.', icon: 'briefcase', color: 'hsl(217, 91%, 60%)', lessons: ['Server architectures basic', 'API Routes & Endpoints', 'Middleware filters auth', 'Relational SQL databases', 'NoSQL Document structures', 'Token verification jwt', 'Backend Caching Redis', 'System deployment servers', 'Web Server scaling models', 'API Documentation swagger', 'Database Migrations schema', 'Testing backend systems jest'] },
      { slug: 'fullstack-career', name: 'Full Stack Developer', description: 'Become a full stack developer by building SPA clients, API routers, and deploying cloud pipelines.', icon: 'briefcase', color: 'hsl(262, 83%, 58%)', lessons: ['SPA Client build React', 'API REST endpoint Express', 'Database links schemas', 'User Session Auth logic', 'State syncing client/server', 'Data Validations both sides', 'Fullstack file uploads', 'Deployment Vercel Render', 'Environment management env', 'CORS routing security', 'Debugging end-to-end flows', 'Application CI/CD setup'] },
      { slug: 'mobile-career', name: 'Mobile Developer', description: 'Master native and cross-platform mobile app development, state bindings, and App Store guidelines.', icon: 'briefcase', color: 'hsl(14, 85%, 55%)', lessons: ['Mobile UI Layout rules', 'State bindings UI updates', 'Local data caching sqlite', 'Device hardware access camera', 'Push Notification hooks', 'Testing mobile layouts mock', 'API link HTTP requests', 'App Store submissions iOS', 'Play Store guidelines Google', 'App performance profiling', 'Offline support patterns', 'Mobile app CI/CD pipelines'] },
      { slug: 'data-analyst', name: 'Data Analyst', description: 'Analyze data structures, clean data using Pandas, and build business intelligence dashboards.', icon: 'briefcase', color: 'hsl(142, 71%, 45%)', lessons: ['Data Extraction queries', 'Data Clean operations pandas', 'Statistical Summaries mean', 'Data Visual layouts plotting', 'Business Intelligence dashboard', 'Excel Advanced Pivot tables', 'Google Analytics tracking', 'Generating SQL reports', 'Auditing data duplicates', 'Presenting data summaries', 'Regression analysis basic', 'Report layouts design format'] },
      { slug: 'ml-engineer', name: 'Machine Learning Engineer', description: 'Build feature engineering pipelines, train models with Scikit-Learn, and deploy MLOps systems.', icon: 'briefcase', color: 'hsl(346, 77%, 50%)', lessons: ['Feature Engineering scale', 'Selecting ML Algorithms', 'Training Models Scikit-Learn', 'Evaluating Model metrics', 'Hyperparameter tuning grid', 'ML Pipeline automation', 'Model Serialization save', 'Deploying ML model Flask', 'Monitoring model predictions', 'GPU training options basic', 'Deep Learning layers setup', 'MLOps pipelines basics'] },
      { slug: 'devops-engineer', name: 'DevOps Engineer', description: 'Master infrastructure automation, Docker containers, K8s cluster configurations, and CI/CD pipelines.', icon: 'briefcase', color: 'hsl(0, 0%, 25%)', lessons: ['Linux command automation', 'Docker container files', 'Kubernetes pod clusters', 'AWS Cloud server setups', 'Terraform IaC resources', 'Git branching workflows', 'CI/CD pipeline builders', 'Logging & Monitoring ELK', 'Security configurations network', 'Load Balancing proxy servers', 'Database backups automations', 'Kubernetes scaling ingress'] },
      { slug: 'cloud-engineer', name: 'Cloud Architect', description: 'Design multi-region networks, virtual machine scales, and high-availability cloud architectures.', icon: 'briefcase', color: 'hsl(199, 89%, 48%)', lessons: ['Multi-region network subnets', 'Virtual Machine instance scale', 'Object storage buckets IAM', 'Relational database scale', 'Cloud serverless functions', 'Infrastructure IaC Terraform', 'Cloud security firewall rules', 'Billing monitors budget alarms', 'API Gateway proxy configurations', 'High Availability architectures', 'Migrating systems to cloud', 'Hybrid cloud connectivity'] },
      { slug: 'cyber-analyst', name: 'Cyber Security Analyst', description: 'Perform security audits, vulnerability scanning, threat mitigation, and compliance reporting.', icon: 'briefcase', color: 'hsl(38, 92%, 50%)', lessons: ['Security audits log checks', 'Firewall rules configuration', 'Vulnerability scanning tools', 'Incident response reports', 'Malware detection patterns', 'Network threat mitigations', 'Access privileges IAM controls', 'Encryption configuration ssl', 'Data loss prevention DLP', 'Threat intelligence feeds', 'Compliance guidelines SOC2', 'System backup restore testing'] }
    ]
  },
  business: {
    title: 'Business & Product',
    tracks: [
      { slug: 'product-management-track', name: 'Product Management', description: 'Learn product roadmaps, user stories, backlog prioritization, and A/B testing methods.', icon: 'award', color: 'hsl(14, 85%, 55%)', lessons: ['Product Roadmap timeline', 'User Personas target specs', 'Writing User Stories specs', 'Backlog Prioritization', 'Product KPI Analytics', 'Competitive Analysis', 'Product Lifecycle phases', 'A/B Testing planning', 'Product Market Fit', 'Stakeholder alignment', 'User feedback collection', 'Release launch planning'] },
      { slug: 'uiux-design', name: 'UI/UX Design', description: 'Master user research, wireframing, color theory, design systems, and Figma developer handoffs.', icon: 'award', color: 'hsl(262, 83%, 58%)', lessons: ['Design Thinking process', 'User Research methods', 'Wireframing in Figma', 'Prototyping flows', 'UI Layout grids spacing', 'Typography in UI design', 'Color theory palettes', 'Usability Testing sessions', 'Information Architecture', 'Interaction Design rules', 'Design Systems basics', 'Developer Handoff exports'] },
      { slug: 'agile-framework', name: 'Agile Methodology', description: 'Master Agile values, burndown metrics, velocity metrics, sprint planning, and Kanban workflows.', icon: 'award', color: 'hsl(199, 89%, 48%)', lessons: ['Agile Manifesto values', 'Agile vs Waterfall', 'Kanban boards workflows', 'Sprint Planning sessions', 'Daily Standup structures', 'Sprint Review audits', 'Retrospective sessions', 'User Story estimation points', 'Velocity & Burndown charts', 'Scrum Roles definition', 'Agile scaling frameworks', 'Continuous Improvement'] },
      { slug: 'scrum-framework', name: 'Scrum Foundations', description: 'Learn Scrum pillars, team roles, refinement backlogs, sprint cycles, and definitions of done.', icon: 'award', color: 'hsl(142, 71%, 45%)', lessons: ['Scrum Pillars & Values', 'Scrum Team Roles master', 'Product Backlog refinement', 'Sprint Backlog creation', 'Sprint execution rules', 'Daily Scrum meetings', 'Sprint Review presentations', 'Sprint Retrospective tasks', 'Definition of Done (DoD)', 'Increment generation rules', 'Managing Scrum Artifacts', 'Scrum Master coaching'] },
      { slug: 'business-analysis', name: 'Business Analysis', description: 'Master requirements elicitation, process swimlanes, SWOT analyses, and business specs templates.', icon: 'award', color: 'hsl(38, 92%, 50%)', lessons: ['Business Analyst role', 'Requirements Elicitation', 'Stakeholder Analysis maps', 'Process Mapping swimlanes', 'SWOT & PESTLE analysis', 'Writing Business Specs BRD', 'Functional Requirements FRD', 'Data Modeling flowcharts', 'Gap Analysis reports', 'User Acceptance Testing UAT', 'BA tools JIRA/Confluence', 'Change Management basics'] }
    ]
  }
};

const getProgrammaticLessonData = (trackSlug, lessonIdx, lessonTitle) => {
  const titleLower = lessonTitle.toLowerCase();
  let topic = 'general';
  if (titleLower.includes('var') || titleLower.includes('scope') || titleLower.includes('const') || titleLower.includes('type') || titleLower.includes('primitive') || titleLower.includes('binding') || titleLower.includes('declaration')) {
    topic = 'variables';
  } else if (titleLower.includes('func') || titleLower.includes('method') || titleLower.includes('callback') || titleLower.includes('lambda') || titleLower.includes('decorator') || titleLower.includes('arrow') || titleLower.includes('closure') || titleLower.includes('parameter')) {
    topic = 'functions';
  } else if (titleLower.includes('array') || titleLower.includes('list') || titleLower.includes('slice') || titleLower.includes('collection') || titleLower.includes('vector') || titleLower.includes('map') || titleLower.includes('set') || titleLower.includes('hash') || titleLower.includes('stack') || titleLower.includes('queue') || titleLower.includes('heap') || titleLower.includes('dictionary') || titleLower.includes('tree') || titleLower.includes('graph')) {
    topic = 'collections';
  } else if (titleLower.includes('class') || titleLower.includes('object') || titleLower.includes('struct') || titleLower.includes('oop') || titleLower.includes('interface') || titleLower.includes('constructor') || titleLower.includes('inherit') || titleLower.includes('property') || titleLower.includes('accessor') || titleLower.includes('solid') || titleLower.includes('design pattern') || titleLower.includes('encapsulation') || titleLower.includes('polymorphism') || titleLower.includes('abstraction') || titleLower.includes('protocol')) {
    topic = 'oop';
  } else if (titleLower.includes('promise') || titleLower.includes('async') || titleLower.includes('await') || titleLower.includes('fetch') || titleLower.includes('api') || titleLower.includes('http') || titleLower.includes('server') || titleLower.includes('client') || titleLower.includes('network') || titleLower.includes('route') || titleLower.includes('web') || titleLower.includes('connection') || titleLower.includes('publish') || titleLower.includes('subscribe')) {
    topic = 'async';
  } else if (titleLower.includes('error') || titleLower.includes('exception') || titleLower.includes('try') || titleLower.includes('catch') || titleLower.includes('validation') || titleLower.includes('handle') || titleLower.includes('safe') || titleLower.includes('null') || titleLower.includes('assert') || titleLower.includes('expire')) {
    topic = 'errors';
  }

  let language = 'javascript';
  if (['sql-fundamentals', 'advanced-sql', 'postgresql', 'mysql', 'db-design'].includes(trackSlug)) {
    language = 'sql';
  } else if (['c-lang', 'cpp'].includes(trackSlug)) {
    language = 'cpp';
  } else if (['docker', 'kubernetes', 'aws', 'azure', 'google-cloud', 'cicd', 'terraform', 'linux', 'git-github', 'devops-engineer', 'cloud-engineer', 'cyber-analyst', 'security-fundamentals', 'network-security', 'ethical-hacking', 'pentesting', 'web-security', 'digital-forensics'].includes(trackSlug)) {
    language = 'bash';
  } else if (['java'].includes(trackSlug)) {
    language = 'java';
  } else if (['python', 'data-analysis', 'numpy', 'pandas', 'data-viz', 'statistics', 'nlp', 'computer-vision', 'generative-ai', 'llm-engineering', 'ai-agents', 'rag-systems', 'deep-learning', 'ml-engineer', 'data-analyst'].includes(trackSlug)) {
    language = 'python';
  } else if (['typescript', 'frontend-career'].includes(trackSlug)) {
    language = 'typescript';
  } else if (['rust'].includes(trackSlug)) {
    language = 'rust';
  } else if (['go-lang'].includes(trackSlug)) {
    language = 'go';
  } else if (['csharp'].includes(trackSlug)) {
    language = 'csharp';
  } else if (['swift', 'swiftui', 'ios-dev', 'mobile-career'].includes(trackSlug)) {
    language = 'swift';
  } else if (['kotlin', 'android-dev'].includes(trackSlug)) {
    language = 'kotlin';
  } else if (['php'].includes(trackSlug)) {
    language = 'php';
  } else if (['html'].includes(trackSlug)) {
    language = 'html';
  } else if (['css', 'tailwindcss'].includes(trackSlug)) {
    language = 'css';
  } else if (['redis'].includes(trackSlug)) {
    language = 'redis';
  }

  let exampleCode = `// Core implementation for ${lessonTitle}`;
  let exampleExplanation = `Understanding ${lessonTitle} is essential for building scalable code structures.`;
  let practiceTemplate = '// Template ___';
  let practiceAnswer = 'answer';
  let practiceInstruction = 'Fill in the blank';

  if (language === 'sql') {
    exampleCode = `-- Query demonstrating ${lessonTitle}\nSELECT id, name, created_at\nFROM data_records\nWHERE status = 'active'\nORDER BY created_at DESC\nLIMIT 10;`;
    exampleExplanation = `In relational database design, ${lessonTitle} is utilized to retrieve specific columns, join tables, or perform calculations efficiently.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Select name fields under a unified alias.\n**Objective:** Select the `first_name` column aliased as `username` from the `users` table.\n**Hint:** Use the `AS` keyword to alias a column.';
      practiceTemplate = 'SELECT first_name ___ username FROM users;';
      practiceAnswer = 'AS';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Calculate overall catalog pricing statistics.\n**Objective:** Use the `AVG` function to calculate the average price of products.\n**Hint:** Wrap the column name in `AVG()`.';
      practiceTemplate = 'SELECT ___(price) FROM products;';
      practiceAnswer = 'AVG';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Group products to count items per category.\n**Objective:** Add the correct keyword to group products by their category.\n**Hint:** Use `GROUP BY`.';
      practiceTemplate = 'SELECT category, COUNT(*) FROM products ___ BY category;';
      practiceAnswer = 'GROUP';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Define unique identifiers in catalog tables.\n**Objective:** Specify a `PRIMARY KEY` constraint on the `id` column.\n**Hint:** Primary keys uniquely identify rows in a table.';
      practiceTemplate = 'CREATE TABLE items (\n  id INT ___ KEY,\n  name VARCHAR(50)\n);';
      practiceAnswer = 'PRIMARY';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Match transactions with customer contact records.\n**Objective:** Complete the `INNER JOIN` statement to link orders to users based on matching ids.\n**Hint:** Use the `ON` keyword to define the join key relation.';
      practiceTemplate = 'SELECT * FROM orders INNER JOIN users ___ orders.user_id = users.id;';
      practiceAnswer = 'ON';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Filter aggregated categories to find high-value departments.\n**Objective:** Add the correct keyword to filter grouped categories with average price above 100.\n**Hint:** Use `HAVING` to filter aggregated results.';
      practiceTemplate = 'SELECT category, AVG(price) FROM products GROUP BY category ___ AVG(price) > 100;';
      practiceAnswer = 'HAVING';
    } else {
      practiceInstruction = '**Scenario:** Retrieve all product data for a sales directory.\n**Objective:** Select all columns from the `products` table.\n**Hint:** Use the asterisk `*` wildcard.';
      practiceTemplate = 'SELECT ___ FROM products;';
      practiceAnswer = '*';
    }
  } else if (language === 'cpp') {
    exampleCode = `#include <iostream>\n\n// Demonstrating ${lessonTitle}\nvoid checkState() {\n  int status = 1;\n  std::cout << "Status: " << status << std::endl;\n}`;
    exampleExplanation = `In C and C++ programming, ${lessonTitle} forms the basis of performance optimization, resource allocation, and direct system calls.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Reference local memory addresses directly.\n**Objective:** Declare a pointer named `ptr` pointing to the integer variable `val`.\n**Hint:** Use `&` to get the address of a variable and `*` to declare a pointer.';
      practiceTemplate = 'int val = 42;\nint* ptr = ___val;';
      practiceAnswer = '&';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Declare function execution entry points.\n**Objective:** Return a 0 exit status code from the main function.\n**Hint:** Use the `return` keyword.';
      practiceTemplate = 'int main() {\n  ___ 0;\n}';
      practiceAnswer = 'return';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Initialize static buffer indexes.\n**Objective:** Initialize an integer array named `arr` containing values `10` and `20`.\n**Hint:** Use curly braces `{}` to initialize array elements.';
      practiceTemplate = 'int arr[] = ___ ;';
      practiceAnswer = '{10, 20}';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Define product data capsules.\n**Objective:** Declare a class named `Product` with a public access modifier.\n**Hint:** Access modifiers are followed by a colon.';
      practiceTemplate = 'class Product {\n___:\n  int id;\n};';
      practiceAnswer = 'public';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Create generic container types.\n**Objective:** Write the template prefix to enable generic type parameters.\n**Hint:** Use `template <typename T>`.';
      practiceTemplate = '___ <typename T>\nT getMax(T a, T b) { return a > b ? a : b; }';
      practiceAnswer = 'template';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Intercept unexpected division by zero outcomes.\n**Objective:** Complete the try-catch structure by catching any runtime exceptions.\n**Hint:** Use the `catch` keyword.';
      practiceTemplate = 'try {\n  // division\n} ___ (...) {\n  // handle\n}';
      practiceAnswer = 'catch';
    } else {
      practiceInstruction = '**Scenario:** Output diagnostic logs to console buffers.\n**Objective:** Output `"Ready"` to the standard console stream using C++.\n**Hint:** Use `std::cout` and the stream insertion operator `<<`.';
      practiceTemplate = '#include <iostream>\nint main() {\n  std::cout ___ "Ready";\n  return 0;\n}';
      practiceAnswer = '<<';
    }
  } else if (language === 'bash') {
    exampleCode = `# Shell script for ${lessonTitle}\nexport NODE_ENV="production"\necho "Bootstrapping application..."\n\nls -la | grep "config"`;
    exampleExplanation = `DevOps pipelines and automation shell files utilize ${lessonTitle} to configure systems, initialize instances, and build workflows.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Configure production environments on cloud instances.\n**Objective:** Export a variable named `ENV_VAR` set to `"production"`.\n**Hint:** Use the `export` command.';
      practiceTemplate = '___ ENV_VAR="production"';
      practiceAnswer = 'export';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Script automated server deployment workflows.\n**Objective:** Complete the bash function named `deploy`.\n**Hint:** Define bash functions using parentheses `()` followed by a body block.';
      practiceTemplate = 'deploy___ {\n  echo "Deploying..."\n}';
      practiceAnswer = '()';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Iterate over active configuration parameters.\n**Objective:** Complete the `for` loop condition to iterate over list items.\n**Hint:** Use `in` to specify items inside a range or list.';
      practiceTemplate = 'for item ___ 1 2 3; do\n  echo $item\ndone';
      practiceAnswer = 'in';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Declare schema specifications in configuration manifests.\n**Objective:** Complete the YAML manifest structure specifying the configuration version.\n**Hint:** Use `apiVersion` to declare API endpoints.';
      practiceTemplate = '___: v1\nkind: Pod';
      practiceAnswer = 'apiVersion';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Verify gateway connectivity by downloading resources.\n**Objective:** Call the curl command to download data from a test endpoint.\n**Hint:** Use `curl` to fetch URL data.';
      practiceTemplate = '___ https://api.example.com/data';
      practiceAnswer = 'curl';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Validate command execution exit statuses.\n**Objective:** Check the exit status of the last executed command.\n**Hint:** The special parameter `$?` stores the exit status code.';
      practiceTemplate = 'if [ $___ -eq 0 ]; then\n  echo "Success"\nfi';
      practiceAnswer = '?';
    } else {
      practiceInstruction = '**Scenario:** Verify status updates in local workspaces.\n**Objective:** Write the git command to check the status of your working repository.\n**Hint:** Use `git status`.';
      practiceTemplate = 'git ___';
      practiceAnswer = 'status';
    }
  } else if (language === 'python') {
    exampleCode = `# Python demonstration of ${lessonTitle}\nmax_requests = 100\nprint(f"Max limit: {max_requests}")`;
    exampleExplanation = `In Python development, ${lessonTitle} helps establish clear logic boundaries, memory limits, and structured functions.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Store active API limiter configurations.\n**Objective:** Define a variable named `max_requests` set to `150` and `is_active` set to `True`.\n**Hint:** Python variables do not require explicit type keywords.';
      practiceTemplate = 'max_requests = 150\nis_active = ___';
      practiceAnswer = 'True';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Calculate item subtotals with discounts.\n**Objective:** Define a function named `calculate_discount` accepting `price` and `pct`.\n**Hint:** Use the `def` keyword followed by the function name.';
      practiceTemplate = '___ calculate_discount(price, pct):\n  return price * (1 - pct)';
      practiceAnswer = 'def';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Manage active server configurations in lists.\n**Objective:** Append `"Dave"` to the `lobby` list.\n**Hint:** Lists support append methods.';
      practiceTemplate = 'lobby = ["Alice", "Bob"]\nlobby.___("Dave")';
      practiceAnswer = 'append';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Build catalog item models.\n**Objective:** Declare a class named `Product` in Python.\n**Hint:** Class definitions use the `class` keyword.';
      practiceTemplate = '___ Product:\n  def __init__(self, name):\n    self.name = name';
      practiceAnswer = 'class';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Make asynchronous API requests to catalog databases.\n**Objective:** Use the `await` keyword to resolve a network response.\n**Hint:** Coroutines are awaited in Python.';
      practiceTemplate = 'async def load_data():\n  response = ___ fetch_api()';
      practiceAnswer = 'await';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Validate inputs gracefully.\n**Objective:** Implement a try-except structure catching ValueError.\n**Hint:** Python uses the `except` keyword for handling errors.';
      practiceTemplate = 'try:\n  val = int("invalid")\n___ ValueError:\n  val = 0';
      practiceAnswer = 'except';
    } else {
      practiceInstruction = '**Scenario:** Print status logs to standard out.\n**Objective:** Output the message `"Ready"` to console output.\n**Hint:** Use print statements.';
      practiceTemplate = 'print("___")';
      practiceAnswer = 'Ready';
    }
  } else if (language === 'java') {
    exampleCode = `// Java demonstration of ${lessonTitle}\npublic class App {\n  public static void main(String[] args) {\n    System.out.println("Online");\n  }\n}`;
    exampleExplanation = `In Java OOP structure, ${lessonTitle} specifies class interactions, variables types, and exceptions control.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Declare explicit variable configurations.\n**Objective:** Declare a double variable named `subscriptionPrice` set to `49.99`.\n**Hint:** Double primitives require double type prefixes.';
      practiceTemplate = '___ subscriptionPrice = 49.99;';
      practiceAnswer = 'double';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Declare static methods for data calculation.\n**Objective:** Define a static method `calculateDiscount` returning a double.\n**Hint:** Specify visibility, static, and return type double.';
      practiceTemplate = 'public static ___ calculateDiscount(double price) {\n  return price * 0.9;\n}';
      practiceAnswer = 'double';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Create dynamically sizing arrays.\n**Objective:** Instantiate a new ArrayList of Strings.\n**Hint:** Use standard generic type syntax.';
      practiceTemplate = 'ArrayList<String> lobby = ___ ArrayList<String>();';
      practiceAnswer = 'new';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Implement inheritance in OOP architectures.\n**Objective:** Inherit from the parent class `Employee`.\n**Hint:** Use the extends keyword in class declarations.';
      practiceTemplate = 'public class Manager ___ Employee {\n}';
      practiceAnswer = 'extends';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Run background worker actions.\n**Objective:** Implement standard thread task loops.\n**Hint:** Create Runnable interface objects.';
      practiceTemplate = 'Thread thread = new Thread(___);';
      practiceAnswer = 'runnable';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Control unexpected exceptions.\n**Objective:** Complete try-catch block intercepting exceptions.\n**Hint:** Use catch statement blocks.';
      practiceTemplate = 'try {\n  // division\n} ___ (Exception e) {\n  // error\n}';
      practiceAnswer = 'catch';
    } else {
      practiceInstruction = '**Scenario:** Greet active user status.\n**Objective:** Print `"Ready"` to standard output console.\n**Hint:** Call System out println.';
      practiceTemplate = 'System.out.println("___");';
      practiceAnswer = 'Ready';
    }
  } else if (language === 'typescript') {
    exampleCode = `// TypeScript demonstration of ${lessonTitle}\nconst maxRequests: number = 100;\nconsole.log(\`Max: \${maxRequests}\`);`;
    exampleExplanation = `In TypeScript programming, ${lessonTitle} ensures static type safety and explicit data model declarations.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Declare type-safe limiting parameters.\n**Objective:** Declare a constant named `maxRequests` of type `number` set to `100`.\n**Hint:** Use the colon format `: number` for variable types.';
      practiceTemplate = 'const maxRequests: ___ = 100;';
      practiceAnswer = 'number';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Define strict handler return parameters.\n**Objective:** Complete the type signature of function `greet` returning a string.\n**Hint:** Declare return types following parameters with a colon.';
      practiceTemplate = 'function greet(name: string): ___ {\n  return "Hello " + name;\n}';
      practiceAnswer = 'string';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Structure list arrays with read-only scopes.\n**Objective:** Declare a readonly array of strings.\n**Hint:** Use the `readonly` keyword modifier.';
      practiceTemplate = 'const roles: ___ string[] = ["admin", "user"];';
      practiceAnswer = 'readonly';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Specify user interface schemas.\n**Objective:** Complete the User interface block definition.\n**Hint:** Use the `interface` keyword.';
      practiceTemplate = '___ User {\n  id: number;\n  name: string;\n}';
      practiceAnswer = 'interface';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Wait for type-safe database queries.\n**Objective:** Call the async fetch API using wait parameters.\n**Hint:** Functions invoking await must declare `async`.';
      practiceTemplate = 'async function loadData() {\n  const res = ___ fetch("/api");\n}';
      practiceAnswer = 'await';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Capture unverified exception signatures.\n**Objective:** Catch errors as unknown type wrappers.\n**Hint:** Exceptions in catch blocks default to or support unknown declarations.';
      practiceTemplate = 'try {\n  process();\n} catch (error: ___) {\n  console.error(error);\n}';
      practiceAnswer = 'unknown';
    } else {
      practiceInstruction = '**Scenario:** Log platform initialization events.\n**Objective:** Call log functions to output `"Ready"`.\n**Hint:** Use console.log.';
      practiceTemplate = 'console.log("___");';
      practiceAnswer = 'Ready';
    }
  } else if (language === 'rust') {
    exampleCode = `// Rust demonstration of ${lessonTitle}\nfn main() {\n  let max_requests = 100;\n  println!("Max: {}", max_requests);\n}`;
    exampleExplanation = `In Rust memory-safe structures, ${lessonTitle} defines ownership, lifetime states, and variable mutations.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Define mutable counter limits.\n**Objective:** Declare a mutable variable named `attempts` initialized to `0`.\n**Hint:** Rust variables require mut modifiers for mutation.';
      practiceTemplate = 'let ___ attempts = 0;';
      practiceAnswer = 'mut';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Declare explicit function returns.\n**Objective:** Write the arrow keyword defining a 64-bit integer return.\n**Hint:** Return arrows are defined using hyphens and greater-than operators.';
      practiceTemplate = 'fn get_sum(a: i64, b: i64) ___ i64 {\n  a + b\n}';
      practiceAnswer = '->';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Instantiate new heap allocation listings.\n**Objective:** Call the new vector method to construct an empty vec.\n**Hint:** Use standard namespace new calls.';
      practiceTemplate = 'let mut lobby: Vec<String> = ___::new();';
      practiceAnswer = 'Vec';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Bind method definitions to data structures.\n**Objective:** Implement structural block bindings for Product.\n**Hint:** Use the implementation keyword block `impl`.';
      practiceTemplate = 'struct Product {\n  id: u32\n}\n___ Product {\n  fn get_id(&self) -> u32 { self.id }\n}';
      practiceAnswer = 'impl';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Await futures outputs.\n**Objective:** Resolve asynchronous worker futures.\n**Hint:** Add `.await` to trigger resolution.';
      practiceTemplate = 'async fn load_logs() {\n  let res = fetch_logs()___;\n}';
      practiceAnswer = '.await';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Extract safe fallbacks from Result enums.\n**Objective:** Call unwrap or fallback defaults for division values.\n**Hint:** Use unwrap_or to supply a default.';
      practiceTemplate = 'let val = divide(10, 0).___(0);';
      practiceAnswer = 'unwrap_or';
    } else {
      practiceInstruction = '**Scenario:** Output diagnostic trace details.\n**Objective:** Output `"Ready"` to standard output console using macro functions.\n**Hint:** Use macro print methods with exclamation marks.';
      practiceTemplate = 'println!("___");';
      practiceAnswer = 'Ready';
    }
  } else if (language === 'go') {
    exampleCode = `// Go demonstration of ${lessonTitle}\npackage main\nimport "fmt"\nfunc main() {\n  fmt.Println("Online")\n}`;
    exampleExplanation = `In Go structural programming, ${lessonTitle} manages slices, maps, channels, and static type declarations.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Declare package constants.\n**Objective:** Declare a constant named `MaxRequests` set to `100`.\n**Hint:** Constants use the `const` keyword.';
      practiceTemplate = '___ MaxRequests = 100';
      practiceAnswer = 'const';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Return multiple outcomes from helper methods.\n**Objective:** Declare multiple returns supporting an error output.\n**Hint:** Declare function signatures using explicit return list parameters.';
      practiceTemplate = 'func loadConfig() (string, ___) {\n  return "ok", nil\n}';
      practiceAnswer = 'error';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Initialize slice data records.\n**Objective:** Initialize a string slice containing `"admin"` and `"user"`.\n**Hint:** Define types preceding initialization braces.';
      practiceTemplate = 'roles := []___{"admin", "user"}';
      practiceAnswer = 'string';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Structure data models.\n**Objective:** Define a custom Product structure.\n**Hint:** Declare structures using the `struct` keyword.';
      practiceTemplate = 'type Product ___ {\n  ID int\n}';
      practiceAnswer = 'struct';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Spawn concurrently executing goroutines.\n**Objective:** Spawn a goroutine executing the worker method.\n**Hint:** Use the goroutine initiator keyword `go`.';
      practiceTemplate = '___ worker()';
      practiceAnswer = 'go';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Validate successful service outcomes.\n**Objective:** Check if returned errors are not nil.\n**Hint:** Go errors represent comparison references.';
      practiceTemplate = 'val, err := fetchData()\nif err ___ nil {\n  return err\n}';
      practiceAnswer = '!=';
    } else {
      practiceInstruction = '**Scenario:** Print status outputs to console stdout.\n**Objective:** Output `"Ready"` using fmt print packages.\n**Hint:** Call fmt.Println.';
      practiceTemplate = 'fmt.Println("___")';
      practiceAnswer = 'Ready';
    }
  } else if (language === 'csharp') {
    exampleCode = `// C# demonstration of ${lessonTitle}\nusing System;\nclass Program {\n  static void Main() {\n    Console.WriteLine("Online");\n  }\n}`;
    exampleExplanation = `In C# .NET frameworks, ${lessonTitle} controls enterprise objects, async tasks, and LINQ selections.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Configure static class constants.\n**Objective:** Declare a constant integer named `MaxRequests` set to `100`.\n**Hint:** Constants use C# const modifier structures.';
      practiceTemplate = '___ int MaxRequests = 100;';
      practiceAnswer = 'const';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Declare string properties in class methods.\n**Objective:** Define a public method `GetName` returning a string.\n**Hint:** Return types precede method signatures.';
      practiceTemplate = 'public ___ GetName() {\n  return "user";\n}';
      practiceAnswer = 'string';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Instantiate dynamic collection objects.\n**Objective:** Instantiate a new List of strings.\n**Hint:** Invoke the `new` allocation command.';
      practiceTemplate = 'List<string> lobby = ___ List<string>();';
      practiceAnswer = 'new';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Declare class interfaces extension.\n**Objective:** Inherit from the parent class `Employee`.\n**Hint:** Class extensions in C# utilize colons `:`.';
      practiceTemplate = 'class Manager ___ Employee {\n}';
      practiceAnswer = ':';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Await asynchronous Task runs.\n**Objective:** Await completion of Task runs.\n**Hint:** Use the async await modifier.';
      practiceTemplate = 'public async Task Run() {\n  ___ Task.Delay(100);\n}';
      practiceAnswer = 'await';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Capture exception traces.\n**Objective:** Handle errors safely using catch clauses.\n**Hint:** Use the catch keyword block.';
      practiceTemplate = 'try {\n  run();\n} ___ (Exception ex) {\n  log(ex);\n}';
      practiceAnswer = 'catch';
    } else {
      practiceInstruction = '**Scenario:** Log application notifications.\n**Objective:** Output `"Ready"` to standard output streams.\n**Hint:** Use Console.WriteLine.';
      practiceTemplate = 'Console.WriteLine("___");';
      practiceAnswer = 'Ready';
    }
  } else if (language === 'swift') {
    exampleCode = `// Swift demonstration of ${lessonTitle}\nimport Foundation\nprint("Online")`;
    exampleExplanation = `In Swift structures, ${lessonTitle} controls constants, optionals, and delegation protocols.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Store constant configuration parameters.\n**Objective:** Declare a constant named `maxRequests` set to `100`.\n**Hint:** Swift constants use the `let` keyword.';
      practiceTemplate = '___ maxRequests = 100';
      practiceAnswer = 'let';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Return values from methods.\n**Objective:** Specify a string return signature.\n**Hint:** Specify returns using standard arrow operators `->`.';
      practiceTemplate = 'func greet(name: String) ___ String {\n  return "Hello " + name\n}';
      practiceAnswer = '->';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Setup array collections.\n**Objective:** Declare a type-safe array of Strings.\n**Hint:** Specify array type declarations inside brackets.';
      practiceTemplate = 'var lobby: [___] = ["Alice", "Bob"]';
      practiceAnswer = 'String';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Define behavior contracts.\n**Objective:** Declare a protocol named `Loggable`.\n**Hint:** Use the `protocol` keyword.';
      practiceTemplate = '___ Loggable {\n  func log(msg: String)\n}';
      practiceAnswer = 'protocol';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Await async functions output.\n**Objective:** Resolve asynchronous worker processes.\n**Hint:** Use the `await` keyword.';
      practiceTemplate = 'func load() async {\n  let res = ___ fetchData()\n}';
      practiceAnswer = 'await';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Trigger error propagation.\n**Objective:** Complete the signature declaring function throws.\n**Hint:** Use the `throws` keyword.';
      practiceTemplate = 'func checkLimit() ___ {\n  throw Error.failed\n}';
      practiceAnswer = 'throws';
    } else {
      practiceInstruction = '**Scenario:** Greet active user status.\n**Objective:** Print `"Ready"` to standard output console.\n**Hint:** Use print statements.';
      practiceTemplate = 'print("___")';
      practiceAnswer = 'Ready';
    }
  } else if (language === 'kotlin') {
    exampleCode = `// Kotlin demonstration of ${lessonTitle}\nfun main() {\n  println("Online")\n}`;
    exampleExplanation = `In Kotlin frameworks, ${lessonTitle} controls null safety, read-only variables, and coroutine workers.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Store read-only platform configuration inputs.\n**Objective:** Declare a read-only variable `maxRequests` set to `100`.\n**Hint:** Read-only variables use the `val` keyword.';
      practiceTemplate = '___ maxRequests = 100';
      practiceAnswer = 'val';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Declare function entry points.\n**Objective:** Complete function declarations using Kotlin keys.\n**Hint:** Use the `fun` keyword.';
      practiceTemplate = '___ greet(name: String): String {\n  return "Hello $name"\n}';
      practiceAnswer = 'fun';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Initialize immutable collections.\n**Objective:** Call list initializations declaring static lists.\n**Hint:** Use the helper function listOf.';
      practiceTemplate = 'val lobby = ___("Alice", "Bob")';
      practiceAnswer = 'listOf';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Declare interface properties.\n**Objective:** Declare an interface named `Loggable`.\n**Hint:** Interface definitions use the `interface` keyword.';
      practiceTemplate = '___ Loggable {\n  fun log(msg: String)\n}';
      practiceAnswer = 'interface';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Declare suspendable coroutines functions.\n**Objective:** Add the correct suspend keyword to the function.\n**Hint:** Use `suspend` keyword.';
      practiceTemplate = '___ fun fetch(): String {\n  return "ok"\n}';
      practiceAnswer = 'suspend';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Capture null references errors.\n**Objective:** Catch generic exceptions in try-catch statement structures.\n**Hint:** Use standard catch declarations.';
      practiceTemplate = 'try {\n  process();\n} ___ (e: Exception) {\n  log(e);\n}';
      practiceAnswer = 'catch';
    } else {
      practiceInstruction = '**Scenario:** Greet active user status.\n**Objective:** Print `"Ready"` to standard output console.\n**Hint:** Call println.';
      practiceTemplate = 'println("___")';
      practiceAnswer = 'Ready';
    }
  } else if (language === 'php') {
    exampleCode = `<?php\n// PHP demonstration of ${lessonTitle}\necho "Online";\n?>`;
    exampleExplanation = `In PHP web scripts, ${lessonTitle} controls superglobals, session stores, and database PDO interfaces.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Declare local request counters.\n**Objective:** Complete declaration of variable `maxRequests` set to `100`.\n**Hint:** PHP variables are preceded by dollar signs `$`.';
      practiceTemplate = '___maxRequests = 100;';
      practiceAnswer = '$';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Declare custom utility handlers.\n**Objective:** Complete helper function greet declarations.\n**Hint:** Use the `function` keyword.';
      practiceTemplate = '___ greet($name) {\n  return "Hello " . $name;\n}';
      practiceAnswer = 'function';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Declare list directories array configs.\n**Objective:** Initialize a PHP array with status options.\n**Hint:** Use standard array keyword.';
      practiceTemplate = '$profile = ___("status" => "active");';
      practiceAnswer = 'array';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Configure class constructors.\n**Objective:** Define double underscore markers for constructor methods.\n**Hint:** Use double underscores `__`.';
      practiceTemplate = 'class Product {\n  public function ___construct($name) {\n    $this->name = $name;\n  }\n}';
      practiceAnswer = '__';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Initialize external HTTP curl targets.\n**Objective:** Initialize request curl resource buffers.\n**Hint:** Use curl_init function.';
      practiceTemplate = '$ch = ___("http://api.example.com");';
      practiceAnswer = 'curl_init';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Catch unexpected backend failures.\n**Objective:** Catch generic Throwable errors.\n**Hint:** Use Throwable type declarations.';
      practiceTemplate = 'try {\n  process();\n} catch (___ $e) {\n  echo $e->getMessage();\n}';
      practiceAnswer = 'Throwable';
    } else {
      practiceInstruction = '**Scenario:** Output status logs directly to output buffers.\n**Objective:** Output `"Ready"` to outputs.\n**Hint:** Use echo keyword.';
      practiceTemplate = 'echo "___";';
      practiceAnswer = 'Ready';
    }
  } else if (language === 'html') {
    exampleCode = `<!-- HTML demonstration of ${lessonTitle} -->\n<div class="container">\n  <h1>${lessonTitle}</h1>\n</div>`;
    exampleExplanation = `In front-end layouts, ${lessonTitle} specifies semantic containers, form controls, and SEO accessibility tags.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Structure navigation sections.\n**Objective:** Complete navigation container tag elements.\n**Hint:** Use semantic nav tags.';
      practiceTemplate = '<___>Navigation Links</nav>';
      practiceAnswer = 'nav';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Design form action inputs.\n**Objective:** Complete the button tag submit type parameter.\n**Hint:** Use type submit.';
      practiceTemplate = '<button type="___">Submit</button>';
      practiceAnswer = 'submit';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Create list groupings.\n**Objective:** Complete list container elements.\n**Hint:** Use unordered list tag `ul`.';
      practiceTemplate = '<___>\n  <li>Item 1</li>\n</ul>';
      practiceAnswer = 'ul';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Set document metadata declarations.\n**Objective:** Declare document root elements.\n**Hint:** Root elements declare html type tags.';
      practiceTemplate = '<!DOCTYPE ___>';
      practiceAnswer = 'html';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Load external script files asynchronously.\n**Objective:** Load script files without blocking rendering processes.\n**Hint:** Use async attributes.';
      practiceTemplate = '<script ___ src="app.js"></script>';
      practiceAnswer = 'async';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Limit inputs configurations.\n**Objective:** Complete input fields minimum length limits.\n**Hint:** Use minlength attribute.';
      practiceTemplate = '<input type="text" ___="5">';
      practiceAnswer = 'minlength';
    } else {
      practiceInstruction = '**Scenario:** Insert image assets.\n**Objective:** Complete image source declarations.\n**Hint:** Use src attribute tags.';
      practiceTemplate = '<img ___="logo.png" alt="logo">';
      practiceAnswer = 'src';
    }
  } else if (language === 'css') {
    exampleCode = `/* CSS demonstration of ${lessonTitle} */\n.container {\n  display: flex;\n  justify-content: center;\n}`;
    exampleExplanation = `In web layouts styling, ${lessonTitle} configures layout properties, transitions, and hover attributes.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Setup global variable theme configurations.\n**Objective:** Define custom CSS variable theme-color prefix.\n**Hint:** Prefix CSS variables using double dashes `--`.';
      practiceTemplate = ':root {\n  ___theme-color: #3b82f6;\n}';
      practiceAnswer = '--';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Retrieve style properties dynamically.\n**Objective:** Call CSS variables getter methods.\n**Hint:** Retrieve values using var functions.';
      practiceTemplate = '.card {\n  background: ___(--theme-color, #fff);\n}';
      practiceAnswer = 'var';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Target list selectors.\n**Objective:** Style immediate children elements.\n**Hint:** Use immediate child target operators `>`.';
      practiceTemplate = '.container ___ div {\n  margin: 5px;\n}';
      practiceAnswer = '>';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Configure dynamic hover states.\n**Objective:** Complete hover selectors syntax.\n**Hint:** Separate hover selectors using colons `:`.';
      practiceTemplate = 'a___hover {\n  text-decoration: underline;\n}';
      practiceAnswer = ':';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Configure visual transitions.\n**Objective:** Animate opacity changes smoothly.\n**Hint:** Use transition style rules.';
      practiceTemplate = '.fade {\n  ___: opacity 0.3s ease;\n}';
      practiceAnswer = 'transition';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Create flexible row cards.\n**Objective:** Configure container displays as flex layouts.\n**Hint:** Use flex display options.';
      practiceTemplate = '.container {\n  display: ___;\n}';
      practiceAnswer = 'flex';
    } else {
      practiceInstruction = '**Scenario:** Set white typography.\n**Objective:** Apply white text values.\n**Hint:** Use hex white colors `#fff`.';
      practiceTemplate = '.text {\n  color: ___;\n}';
      practiceAnswer = '#fff';
    }
  } else if (language === 'redis') {
    exampleCode = `# Redis command for ${lessonTitle}\nSET user:100:status "active"\nGET user:100:status`;
    exampleExplanation = `In Redis memory cache stores, ${lessonTitle} controls key expirations, lists, hashes, and channels.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Store session states.\n**Objective:** Set a status value for customer profiles key `user:100:status` as `"active"`.\n**Hint:** Use the standard SET command.';
      practiceTemplate = '___ user:100:status "active"';
      practiceAnswer = 'SET';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Retrieve session values.\n**Objective:** Query user:100:status key entries.\n**Hint:** Use the standard GET command.';
      practiceTemplate = '___ user:100:status';
      practiceAnswer = 'GET';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Push items to queue arrays.\n**Objective:** Add order items to list queues.\n**Hint:** Use the LPUSH key command.';
      practiceTemplate = '___ pending_orders "order_99"';
      practiceAnswer = 'LPUSH';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Set object fields in hashes.\n**Objective:** Set a profile role inside a user hash.\n**Hint:** Use the HSET hash command.';
      practiceTemplate = '___ user:100 role "developer"';
      practiceAnswer = 'HSET';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Publish sync channel messages.\n**Objective:** Broadcast messages to channels.\n**Hint:** Use the PUBLISH event command.';
      practiceTemplate = '___ db_updates "sync"';
      practiceAnswer = 'PUBLISH';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Configure cache limits.\n**Objective:** Expire session keys after 60 seconds.\n**Hint:** Use the EXPIRE command.';
      practiceTemplate = '___ session:token 60';
      practiceAnswer = 'EXPIRE';
    } else {
      practiceInstruction = '**Scenario:** Verify server availability.\n**Objective:** Ping the redis database.\n**Hint:** Use the PING utility command.';
      practiceTemplate = '___';
      practiceAnswer = 'PING';
    }
  } else {
    // JavaScript / TypeScript and other languages defaults
    exampleCode = `// Core implementation for ${lessonTitle}\nconst config = {\n  active: true,\n  timeout: 5000\n};\n\nfunction processAction(item) {\n  if (!item) return null;\n  console.log("Processing:", item);\n  return item;\n}`;
    exampleExplanation = `In modern software applications, understanding ${lessonTitle} allows developers to clean, format, structure, and secure functional operations.`;
    
    if (topic === 'variables') {
      practiceInstruction = '**Scenario:** Initialize API limiting parameters on backend gateways.\n**Objective:** Declare a constant named `maxRequests` set to `100`.\n**Hint:** Use the read-only `const` keyword.';
      practiceTemplate = '___ maxRequests = 100;';
      practiceAnswer = 'const';
    } else if (topic === 'functions') {
      practiceInstruction = '**Scenario:** Streamline item handlers using functional callbacks.\n**Objective:** Define a simple arrow function `greet` that returns a welcome string.\n**Hint:** The arrow operator is `=>`.';
      practiceTemplate = 'const greet = () ___ "Welcome";';
      practiceAnswer = '=>';
    } else if (topic === 'collections') {
      practiceInstruction = '**Scenario:** Parse payload properties from user session contexts.\n**Objective:** Destructure the `email` field from the `user` object.\n**Hint:** Use curly brace syntax `const { field } = object;`.';
      practiceTemplate = 'const { ___ } = user;';
      practiceAnswer = 'email';
    } else if (topic === 'oop') {
      practiceInstruction = '**Scenario:** Initialize catalog item blueprints.\n**Objective:** Define a constructor method inside the `Product` class to receive parameters.\n**Hint:** Use the `constructor` keyword.';
      practiceTemplate = 'class Product {\n  ___(name) {\n    this.name = name;\n  }\n}';
      practiceAnswer = 'constructor';
    } else if (topic === 'async') {
      practiceInstruction = '**Scenario:** Wait for asynchronous server actions to complete.\n**Objective:** Call `await` on the async function to resolve its promise.\n**Hint:** Functions using `await` must be declared as `async`.';
      practiceTemplate = 'async function run() {\n  const res = ___ fetch("/api");\n}';
      practiceAnswer = 'await';
    } else if (topic === 'errors') {
      practiceInstruction = '**Scenario:** Handle network request failures gracefully.\n**Objective:** Complete the try-catch block structure to catch potential errors.\n**Hint:** The `catch` block captures exceptions thrown in the `try` block.';
      practiceTemplate = 'try {\n  run();\n} ___ (err) {\n  console.error(err);\n}';
      practiceAnswer = 'catch';
    } else {
      practiceInstruction = '**Scenario:** Verify execution metrics in console outputs.\n**Objective:** Print a success log message containing `"OK"` to the console.\n**Hint:** Use `console.log("...");`.';
      practiceTemplate = 'console.log("___");';
      practiceAnswer = 'OK';
    }
  }

  // Generate 5 quiz challenges
  const challenges = [
    {
      type: 'multiple-choice',
      question: `What is the primary objective of implementing "${lessonTitle}" in production software?`,
      options: [
        'To establish modularity, improve security boundaries, and optimize execution flow.',
        'To bypass compiler constraints entirely.',
        'To delete unused local cache arrays automatically.',
        'To force garbage collection sweeps on the heap memory.'
      ],
      correctIndex: 0,
      explanation: `Implementing "${lessonTitle}" ensures applications are maintainable, scalable, and run efficiently under client traffic.`
    },
    {
      type: 'fill-blank',
      question: `Complete the syntax to declare or evaluate "${lessonTitle}":`,
      template: practiceTemplate,
      answer: practiceAnswer,
      explanation: `The correct syntax keyword is "${practiceAnswer}" to initialize the expression.`
    },
    {
      type: 'multiple-choice',
      question: `Which of the following represents an engineering best practice when applying "${lessonTitle}"?`,
      options: [
        'Validating input formats, separating concerns, and logging runtime anomalies.',
        'Hardcoding credentials directly in source files.',
        'Avoiding scoping restrictions completely.',
        'Disabling exception handlers and security checks.'
      ],
      correctIndex: 0,
      explanation: `Robust applications require secure validation, clear separations of concern, and detailed error logging for "${lessonTitle}".`
    },
    {
      type: 'fill-blank',
      question: `Fill in the missing block for "${lessonTitle}" execution:`,
      template: practiceTemplate.replace(practiceAnswer, '___'),
      answer: practiceAnswer,
      explanation: `Using "${practiceAnswer}" completes the instruction syntax.`
    },
    {
      type: 'multiple-choice',
      question: `What is a potential performance risk or system vulnerability associated with "${lessonTitle}"?`,
      options: [
        'High memory overhead or deep recursive loop bottlenecks.',
        'Using static type check configurations.',
        'Writing clean, self-documenting code.',
        'Compiling files into separate folders.'
      ],
      correctIndex: 0,
      explanation: `Deep execution nesting or unbounded cache allocations can cause memory leaks and latency blocks for "${lessonTitle}".`
    }
  ];

  return {
    language,
    exampleCode,
    exampleExplanation,
    practiceInstruction,
    practiceTemplate,
    practiceAnswer,
    challenges
  };
};

const compileAllTracks = () => {
  const generatedTracks = [];
  let trackOrder = 7; // Start order after the 6 handcrafted tracks

  for (const [catKey, catVal] of Object.entries(categoriesConfig)) {
    for (const trackSpec of catVal.tracks) {
      const trackSlug = trackSpec.slug;
      
      // Skip if track is handcrafted to prevent duplicate keys
      const isHandcrafted = ['sql', 'python', 'webdev', 'ai', 'datascience', 'java'].includes(trackSlug);
      if (isHandcrafted) continue;

      const trackName = trackSpec.name;
      const trackIcon = trackSpec.icon;
      const trackColor = trackSpec.color;

      // Define 6 Modules
      const modules = [
        {
          id: `${trackSlug}-m1`,
          name: `${trackName} Core Foundations`,
          order: 1,
          learning_objective: `Master the basic principles and syntax of ${trackName}.`,
          mini_project: {
            title: `${trackName} Console App`,
            description: `Build a small utility script integrating variables, parameters, and flow checks for ${trackName}.`,
            requirements: [
              'Implement basic input verification.',
              'Output results dynamically based on inputs.',
              'Handle null errors gracefully.'
            ]
          }
        },
        {
          id: `${trackSlug}-m2`,
          name: `${trackName} Control Flow & Basics`,
          order: 2,
          learning_objective: `Master logic flow, conditional branching, and loop iterations in ${trackName}.`,
          mini_project: {
            title: `${trackName} Control Flow Script`,
            description: `Design a script handling multi-step logic control and loop configurations in ${trackName}.`,
            requirements: [
              'Implement conditional check flows.',
              'Configure nested loop structures.',
              'Format results to the console.'
            ]
          }
        },
        {
          id: `${trackSlug}-m3`,
          name: `${trackName} Intermediate Practices`,
          order: 3,
          learning_objective: `Apply advanced functions, encapsulation, and standard modules in ${trackName}.`,
          mini_project: {
            title: `${trackName} Modular Manager`,
            description: `Design a multi-file script or component managing data structures and flow parameters in ${trackName}.`,
            requirements: [
              'Create helper functions to encapsulate code.',
              'Use standard libraries or configurations.',
              'Implement error handling limits.'
            ]
          }
        },
        {
          id: `${trackSlug}-m4`,
          name: `${trackName} Object Oriented & Data Modeling`,
          order: 4,
          learning_objective: `Master class architectures, object interfaces, and data validation structures in ${trackName}.`,
          mini_project: {
            title: `${trackName} Model Builder`,
            description: `Build a class-based data model or object configuration mapping for ${trackName}.`,
            requirements: [
              'Implement constructor class properties.',
              'Validate properties using getters or conditionals.',
              'Format output summaries cleanly.'
            ]
          }
        },
        {
          id: `${trackSlug}-m5`,
          name: `${trackName} Advanced Architecture`,
          order: 5,
          learning_objective: `Design and analyze design patterns, callbacks, or promise loops in ${trackName}.`,
          mini_project: {
            title: `${trackName} Architecture Component`,
            description: `Develop a modular software component following enterprise patterns in ${trackName}.`,
            requirements: [
              'Configure asynchronous flow loops.',
              'Create reusable events or action interfaces.',
              'Implement modular data checks.'
            ]
          }
        },
        {
          id: `${trackSlug}-m6`,
          name: `${trackName} Performance, Testing & Deployment`,
          order: 6,
          learning_objective: `Design, optimize, test, and deploy highly scalable production code for ${trackName}.`,
          mini_project: {
            title: `${trackName} Enterprise Integrator`,
            description: `Create an enterprise component simulating network links, file structures, or caching for ${trackName}.`,
            requirements: [
              'Configure async pipelines or system APIs.',
              'Optimise memory footprints.',
              'Verify code functionality under load.'
            ]
          }
        }
      ];

      const lessons = [];
      const numLessons = 60;
      for (let index = 0; index < numLessons; index++) {
        const modIdx = Math.floor(index / 10); // 10 lessons per module
        const mod = modules[modIdx] || modules[0];
        const lessonSlug = `${trackSlug}-l${index + 1}`;
        const displayOrder = (index % 10) + 1;

        const lessonTitle = index < trackSpec.lessons.length
          ? trackSpec.lessons[index]
          : `${trackSpec.name} Practice & Application Part ${index - trackSpec.lessons.length + 1}`;

        // Generate programmatic lesson content
        const lessonMeta = getProgrammaticLessonData(trackSlug, index, lessonTitle);

        const objectiveText = `### 1. Learning Objective\nIn this lesson, you will master the fundamentals of **${lessonTitle}** and learn how to apply it in ${trackName} environments.`;
        const realWorldText = `### 2. Where is this used in real life?\nThis concept is a core element in production. For example, it is used directly in software components like:\n- **API Systems**: To structure data parameters.\n- **Database Transactions**: To audit logs and profiles.\n- **Frontend Webpages**: To style layouts and align items.\n\nStudying this ensures your code remains efficient, readable, and highly maintainable under load.`;
        const explanationText = `### 3. Concept Explanation\n${lessonMeta.exampleExplanation}\n\nUnderstanding the syntax and structure prevents common errors and optimizes execution paths. Review the code example carefully to see how these declarations work in practice.`;
        const fullConceptContent = `${objectiveText}\n\n${realWorldText}\n\n${explanationText}`;

        lessons.push({
          slug: lessonSlug,
          title: lessonTitle,
          moduleId: mod.id,
          order: displayOrder,
          estimatedMinutes: 8,
          xpReward: 25,
          conceptTitle: `Mastering ${lessonTitle}`,
          conceptContent: fullConceptContent,
          conceptHighlights: [trackName, lessonTitle],
          exampleLanguage: lessonMeta.language,
          exampleCode: lessonMeta.exampleCode,
          exampleExplanation: lessonMeta.exampleExplanation,
          practiceType: 'fill-blank',
          practiceInstruction: lessonMeta.practiceInstruction,
          practiceTemplate: lessonMeta.practiceTemplate,
          practiceAnswer: lessonMeta.practiceAnswer,
          summary: `You completed learning ${lessonTitle}. Explore more lessons in this module to build complete technical mastery.`,
          challenges: lessonMeta.challenges
        });
      }

      generatedTracks.push({
        slug: trackSlug,
        name: trackName,
        description: trackSpec.description,
        icon: trackIcon,
        color: trackColor,
        order: trackOrder++,
        capstone_project: {
          title: `Enterprise ${trackName} Deployment`,
          description: `Build, test, and deploy a comprehensive system matching the industry standards for ${trackName}.`,
          requirements: [
            'Integrate all modules and variables into a single workspace.',
            'Solve performance latency or database constraints.',
            'Verify error boundaries and security limits.'
          ]
        },
        modules,
        lessons
      });
    }
  }

  // Pad handcrafted tracks to 6 modules, 10 lessons each (60 total)
  const finalHandcrafted = handcraftedTracks.map((trackData: any) => {
    const trackSlug = trackData.slug;
    const trackName = trackData.name;
    const modules = trackData.modules; // Keep all 6 modules

    const lessons = [...trackData.lessons];
    const targetCount = 60;
    const currentCount = lessons.length; // 24

    for (let i = currentCount; i < targetCount; i++) {
      const moduleIndex = Math.floor(i / 10);
      const mod = modules[moduleIndex];
      const displayOrder = (i % 10) + 1;
      const lessonTitle = `${trackName} Advanced Applications Part ${i - currentCount + 1}`;
      const lessonSlug = `${trackSlug}-l${i + 1}`;

      const lessonMeta = getProgrammaticLessonData(trackSlug, i, lessonTitle);

      const objectiveText = `### 1. Learning Objective\nIn this lesson, you will master the fundamentals of **${lessonTitle}** and learn how to apply it in ${trackName} environments.`;
      const realWorldText = `### 2. Where is this used in real life?\nThis concept is a core element in production. For example, it is used directly in software components like:\n- **API Systems**: To structure data parameters.\n- **Database Transactions**: To audit logs and profiles.\n- **Frontend Webpages**: To style layouts and align items.\n\nStudying this ensures your code remains efficient, readable, and highly maintainable under load.`;
      const explanationText = `### 3. Concept Explanation\n${lessonMeta.exampleExplanation}\n\nUnderstanding the syntax and structure prevents common errors and optimizes execution paths. Review the code example carefully to see how these declarations work in practice.`;
      const fullConceptContent = `${objectiveText}\n\n${realWorldText}\n\n${explanationText}`;

      lessons.push({
        slug: lessonSlug,
        title: lessonTitle,
        moduleId: mod.id,
        order: displayOrder,
        estimatedMinutes: 8,
        xpReward: 25,
        conceptTitle: `Mastering ${lessonTitle}`,
        conceptContent: fullConceptContent,
        conceptHighlights: [trackName, lessonTitle],
        exampleLanguage: lessonMeta.language,
        exampleCode: lessonMeta.exampleCode,
        exampleExplanation: lessonMeta.exampleExplanation,
        practiceType: 'fill-blank',
        practiceInstruction: lessonMeta.practiceInstruction,
        practiceTemplate: lessonMeta.practiceTemplate,
        practiceAnswer: lessonMeta.practiceAnswer,
        summary: `You completed learning ${lessonTitle}. Explore more lessons in this module to build complete technical mastery.`,
        challenges: lessonMeta.challenges
      });
    }

    // Rewrite all display orders and module IDs to ensure alignment to 6 modules, 10 lessons per module:
    lessons.forEach((lesson, index) => {
      const moduleIndex = Math.floor(index / 10);
      const mod = modules[moduleIndex];
      lesson.moduleId = mod.id;
      lesson.order = (index % 10) + 1;
    });

    return {
      ...trackData,
      modules,
      lessons
    };
  });

  return [...finalHandcrafted, ...generatedTracks];
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const seed = async () => {
  try {
    console.log('🗑  Clearing database tables...');
    await supabase.from('challenges').delete().gt('created_at', '1970-01-01');
    await supabase.from('lessons').delete().gt('created_at', '1970-01-01');
    await supabase.from('modules').delete().neq('id', '');
    await supabase.from('tracks').delete().gt('created_at', '1970-01-01');
    console.log('⏳ Waiting 3 seconds for database to settle...');
    await sleep(3000);

    console.log('🌱 Generating and compiling full curriculum (78 tracks)...');
    const allTracks = compileAllTracks();

    console.log(`🚀 Seeding ${allTracks.length} tracks in bulk into Supabase...`);

    // 1. Bulk Insert Tracks
    const tracksToInsert = allTracks.map(trackData => ({
      slug: trackData.slug,
      name: trackData.name,
      description: trackData.description,
      icon: trackData.icon,
      color: trackData.color,
      display_order: trackData.order,
      total_lessons: trackData.lessons.length,
      is_ai_generated: false,
      capstone_project: trackData.capstone_project || {}
    }));

    const { data: insertedTracks, error: tracksError } = await supabase
      .from('tracks')
      .insert(tracksToInsert)
      .select('id, slug');

    if (tracksError) {
      console.error('Error seeding tracks:', tracksError);
      throw tracksError;
    }

    console.log(`✓ Inserted ${insertedTracks.length} tracks.`);

    // Map trackSlug -> trackId
    const trackIdMap: Record<string, string> = {};
    insertedTracks.forEach((t: any) => {
      trackIdMap[t.slug] = t.id;
    });

    // 2. Compile and Bulk Insert Modules
    const modulesToInsert: any[] = [];
    allTracks.forEach(trackData => {
      const trackId = trackIdMap[trackData.slug];
      if (!trackId) return;

      trackData.modules.forEach((mod: any) => {
        modulesToInsert.push({
          id: mod.id,
          track_id: trackId,
          name: mod.name,
          display_order: mod.order,
          learning_objective: mod.learning_objective || '',
          mini_project: mod.mini_project || {}
        });
      });
    });

    const { error: modulesError } = await supabase
      .from('modules')
      .insert(modulesToInsert);

    if (modulesError) {
      console.error('Error seeding modules:', modulesError);
      throw modulesError;
    }

    console.log(`✓ Inserted ${modulesToInsert.length} modules.`);

    // 3. Compile Lessons
    const lessonsToInsert: any[] = [];
    allTracks.forEach(trackData => {
      const trackId = trackIdMap[trackData.slug];
      if (!trackId) return;

      trackData.lessons.forEach((lessonData: any) => {
        lessonsToInsert.push({
          slug: lessonData.slug,
          track_id: trackId,
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
          practice_answer: lessonData.practiceAnswer,
          summary: lessonData.summary || ''
        });
      });
    });

    console.log(`🚀 Inserting ${lessonsToInsert.length} lessons in chunks...`);
    const insertedLessons: any[] = [];
    const lessonChunkSize = 200;
    for (let i = 0; i < lessonsToInsert.length; i += lessonChunkSize) {
      const chunk = lessonsToInsert.slice(i, i + lessonChunkSize);
      const { data: chunkInserted, error: lessonsError } = await supabase
        .from('lessons')
        .insert(chunk)
        .select('id, slug');

      if (lessonsError) {
        console.error(`Error seeding lessons chunk starting at ${i}:`, lessonsError);
        throw lessonsError;
      }
      if (chunkInserted) {
        insertedLessons.push(...chunkInserted);
      }
      await sleep(150); // Small pause to prevent hitting server rate limits
    }

    console.log(`✓ Inserted ${insertedLessons.length} lessons.`);

    // Map lessonSlug -> lessonId
    const lessonIdMap: Record<string, string> = {};
    insertedLessons.forEach((l: any) => {
      lessonIdMap[l.slug] = l.id;
    });

    // 4. Compile and Bulk Insert Challenges
    const challengesToInsert: any[] = [];
    allTracks.forEach(trackData => {
      trackData.lessons.forEach((lessonData: any) => {
        const lessonId = lessonIdMap[lessonData.slug];
        if (!lessonId) return;

        if (lessonData.challenges && lessonData.challenges.length > 0) {
          lessonData.challenges.forEach((challengeData: any) => {
            challengesToInsert.push({
              lesson_id: lessonId,
              type: challengeData.type || 'multiple-choice',
              question: challengeData.question,
              options: challengeData.options || [],
              correct_index: challengeData.correct_index !== undefined ? challengeData.correct_index : (challengeData.correctIndex !== undefined ? challengeData.correctIndex : 0),
              template: challengeData.template || null,
              answer: challengeData.answer || null,
              explanation: challengeData.explanation || '',
              xp_reward: 10
            });
          });
        }
      });
    });

    console.log(`🚀 Inserting ${challengesToInsert.length} challenges in chunks...`);
    const challengeChunkSize = 300;
    for (let i = 0; i < challengesToInsert.length; i += challengeChunkSize) {
      const chunk = challengesToInsert.slice(i, i + challengeChunkSize);
      const { error: challengesError } = await supabase
        .from('challenges')
        .insert(chunk);

      if (challengesError) {
        console.error(`Error seeding challenges chunk starting at ${i}:`, challengesError);
        throw challengesError;
      }
      await sleep(150);
    }

    console.log(`✓ Inserted ${challengesToInsert.length} challenges.`);

    console.log(`\n🎉 Supabase Database Seeded Successfully in Bulk!`);
    console.log(`📊 Total Seeded: ${insertedTracks.length} tracks, ${modulesToInsert.length} modules, ${insertedLessons.length} lessons, ${challengesToInsert.length} challenges.`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
