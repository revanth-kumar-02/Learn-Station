const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');
const { tracksData: handcraftedTracks } = require('./curriculumData');

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

// Programmatic Lesson content generator
const getProgrammaticLessonData = (trackSlug, lessonIdx, lessonTitle) => {
  let language = 'javascript';
  let exampleCode = '// Sample code';
  let exampleExplanation = 'Sample explanation';
  let practiceTemplate = '// Template ___';
  let practiceAnswer = 'answer';
  let practiceInstruction = 'Fill in the blank';
  
  if (['javascript', 'typescript', 'frontend-career', 'fullstack-career', 'react', 'nextjs', 'angular', 'vuejs', 'nodejs', 'expressjs'].includes(trackSlug)) {
    language = 'javascript';
    exampleCode = `// Core implementation for ${lessonTitle}\nconst config = {\n  active: true,\n  timeout: 5000\n};\n\nfunction processAction(item) {\n  if (!item) return null;\n  console.log("Processing:", item);\n  return item;\n}`;
    exampleExplanation = `In JavaScript/TypeScript applications, modular functions help isolate scopes and control asynchronous flow execution for ${lessonTitle}.`;
    practiceTemplate = 'const isCompleted = ___ ;';
    practiceAnswer = 'true';
    practiceInstruction = 'Set the boolean constant isCompleted to true:';
  } else if (['c-lang', 'cpp'].includes(trackSlug)) {
    language = 'cpp';
    exampleCode = `#include <iostream>\nusing namespace std;\n\n// Core logic for ${lessonTitle}\nvoid checkState() {\n  int status = 1;\n  cout << "Status: " << status << endl;\n}`;
    exampleExplanation = `In C/C++, variables are statically typed, and pointers store the memory address of the structures for ${lessonTitle}.`;
    practiceTemplate = 'int main() {\n  ___ 0;\n}';
    practiceAnswer = 'return';
    practiceInstruction = 'Return a 0 exit status code from the main execution loop:';
  } else if (['docker', 'kubernetes', 'aws', 'azure', 'google-cloud', 'cicd', 'terraform', 'linux', 'git-github'].includes(trackSlug)) {
    language = 'bash';
    exampleCode = `# Configuration script for ${lessonTitle}\nexport NODE_ENV="production"\necho "Initialising environment..."\n\n# Command pipeline\nls -la | grep "config"`;
    exampleExplanation = `DevOps pipelines and shell files configure parameters, expose container ports, and script infrastructure deployment for ${lessonTitle}.`;
    practiceTemplate = 'export ENV_VAR="___"';
    practiceAnswer = 'production';
    practiceInstruction = 'Set the environment variable ENV_VAR to "production":';
  } else if (['sql-fundamentals', 'advanced-sql', 'postgresql', 'mysql', 'db-design'].includes(trackSlug)) {
    language = 'sql';
    exampleCode = `-- Database query for ${lessonTitle}\nSELECT id, name, created_at\nFROM data_records\nWHERE status = 'active'\nORDER BY created_at DESC\nLIMIT 10;`;
    exampleExplanation = `SQL queries select columns, filter rows using WHERE conditions, and sort records by index definitions for ${lessonTitle}.`;
    practiceTemplate = 'SELECT * FROM users ___ id = 1;';
    practiceAnswer = 'WHERE';
    practiceInstruction = 'Add a filtering condition keyword:';
  } else {
    language = 'javascript';
    exampleCode = `// Structural representation for ${lessonTitle}\nclass DataModel {\n  constructor(name) {\n    this.name = name;\n    this.timestamp = Date.now();\n  }\n}`;
    exampleExplanation = `In standard software development patterns, class models and objects represent domain entities and encapsulate state attributes for ${lessonTitle}.`;
    practiceTemplate = 'class Item {\n  ___(id) {}\n}';
    practiceAnswer = 'constructor';
    practiceInstruction = 'Declare a class constructor for initialization:';
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

      // Define 3 Modules
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
          name: `${trackName} Intermediate Practices`,
          order: 2,
          learning_objective: `Apply advanced structures, functions, and modules for ${trackName}.`,
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
          id: `${trackSlug}-m3`,
          name: `${trackName} Architecture & Projects`,
          order: 3,
          learning_objective: `Design and deploy highly scalable components for ${trackName}.`,
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
      trackSpec.lessons.forEach((lessonTitle, index) => {
        const modIdx = Math.floor(index / 4); // 4 lessons per module
        const mod = modules[modIdx] || modules[0];
        const lessonSlug = `${trackSlug}-l${index + 1}`;
        const displayOrder = (index % 4) + 1;

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
      });

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

  return [...handcraftedTracks, ...generatedTracks];
};

const seed = async () => {
  try {
    console.log('🗑  Clearing database tables...');
    await supabase.from('challenges').delete().gt('created_at', '1970-01-01');
    await supabase.from('lessons').delete().gt('created_at', '1970-01-01');
    await supabase.from('modules').delete().neq('id', '');
    await supabase.from('tracks').delete().gt('created_at', '1970-01-01');

    console.log('🌱 Generating and compiling full curriculum (78 tracks)...');
    const allTracks = compileAllTracks();

    let totalTracks = 0;
    let totalModules = 0;
    let totalLessons = 0;
    let totalChallenges = 0;

    console.log(`🚀 Seeding ${allTracks.length} tracks into Supabase...`);

    // Bulk Seed in parallel groups or sequentially with loops to prevent memory bloat
    for (const trackData of allTracks) {
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
          total_lessons: trackData.lessons.length,
          is_ai_generated: false,
          capstone_project: trackData.capstone_project || {}
        })
        .select()
        .single();

      if (trackError) {
        console.error(`Error seeding track ${trackData.name}:`, trackError);
        throw trackError;
      }

      // 2. Insert Modules
      const modulesToInsert = trackData.modules.map(mod => ({
        id: mod.id,
        track_id: track.id,
        name: mod.name,
        display_order: mod.order,
        learning_objective: mod.learning_objective || '',
        mini_project: mod.mini_project || {}
      }));

      const { error: modulesError } = await supabase
        .from('modules')
        .insert(modulesToInsert);

      if (modulesError) {
        console.error(`Error seeding modules for track ${trackData.name}:`, modulesError);
        throw modulesError;
      }
      totalModules += modulesToInsert.length;

      // 3. Insert Lessons (in bulk per track)
      const lessonsToInsert = trackData.lessons.map(lessonData => ({
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
        practice_answer: lessonData.practiceAnswer,
        summary: lessonData.summary || ''
      }));

      const { data: insertedLessons, error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessonsToInsert)
        .select('id, slug');

      if (lessonsError) {
        console.error(`Error seeding lessons for track ${trackData.name}:`, lessonsError);
        throw lessonsError;
      }
      totalLessons += lessonsToInsert.length;

      // Create a map of lessonSlug -> lessonId
      const lessonIdMap = {};
      insertedLessons.forEach(l => {
        lessonIdMap[l.slug] = l.id;
      });

      // 4. Insert Challenges in bulk per track
      const challengesToInsert = [];
      trackData.lessons.forEach(lessonData => {
        const lessonId = lessonIdMap[lessonData.slug];
        if (lessonData.challenges && lessonData.challenges.length > 0) {
          lessonData.challenges.forEach(challengeData => {
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

      if (challengesToInsert.length > 0) {
        const { error: challengesError } = await supabase
          .from('challenges')
          .insert(challengesToInsert);

        if (challengesError) {
          console.error(`Error seeding challenges for track ${trackData.name}:`, challengesError);
          throw challengesError;
        }
        totalChallenges += challengesToInsert.length;
      }

      totalTracks++;
    }

    console.log(`\n🎉 Supabase Database Seeded Successfully!`);
    console.log(`📊 Total Seeded: ${totalTracks} tracks, ${totalModules} modules, ${totalLessons} lessons, ${totalChallenges} challenges.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
