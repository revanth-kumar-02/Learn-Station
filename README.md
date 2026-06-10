# LearnStation 🎓🚀

An interactive, gamified, and AI-powered learning platform designed to help software engineers master technologies through hands-on practice, structured curriculums, and detailed progress tracking.

LearnStation combines expert-curated learning tracks with dynamic, AI-generated blueprints to offer an engaging, pixel-perfect, and premium learning experience.

---

## 🌟 Key Features

### 1. Interactive Learning Workspace
* **Step-by-Step Curriculum**: Lessons are structured into **Concept**, **Example**, **Practice**, and **Challenge** steps.
* **Live Sandboxed Playgrounds**: Write and run SQL, Python, JavaScript, Bash, Dockerfile, and Java code directly in the browser with instant outputs.
* **Gating Assessments**: Verify mastery with interactive quiz checkpoints before unlocking subsequent units.

### 2. Gamified Progression & Identity
* **365-Day Activity Heatmap**: A GitHub-style calendar visualizing study patterns, XP gains, completed lessons, and study minutes with responsive, coordinates-based hover tooltips.
* **Badge Showcase**: 48 unique collectible achievement badges grouped across 9 categories (e.g., Learning Milestones, Streak Milestones, Rarity tiers like Standard, Rare, and Legendary).
* **Level & Streak Tracking**: Maintain daily learning streaks, gain level-ups, and accumulate XP rewards.

### 3. AI Learning Blueprints
* **On-Demand Roadmap Generation**: Generate a custom, structured curriculum instantly for *any* technical topic (e.g., Docker, Kubernetes, Flutter, Cyber Security) tailored to your skill level (Beginner, Intermediate, Advanced) and goal (Job Prep, Interview Prep, Academic, Skill Dev).
* **AI Mentor**: A contextual floating drawer assistant available in every lesson to explain concepts using fresh analogies, provide real-world examples, or generate custom mock practice questions.

### 4. Curriculum Scale & Categories
* **84 Pre-Defined Tracks**: Over 1,080 lessons, 5,400 quiz questions, and 350+ projects spanning Programming, Web Dev, Databases, DevOps, Data Science, AI, and Career stacks.
* **Career Alignment Paths**: Interactive roadmaps mapping specific track combinations to industry roles (e.g. Frontend Developer, Backend Developer, AI Architect, DevOps Engineer).

---

## 🛠️ Technology Stack

### Frontend (Client)
* **Core**: React 19, TypeScript, Vite
* **Styling**: Vanilla CSS (custom design system, glassmorphism, responsive grids, transitions)
* **Animation**: Framer Motion
* **Icons**: Lucide React

### Backend (Server)
* **Runtime**: Node.js, Express, TypeScript (executed via `tsx` watch runner)
* **Auth & Security**: Supabase Auth integration, JSON Web Token (JWT), bcryptjs
* **Database**: PostgreSQL (Supabase)
* **AI Integration**: Google Generative AI (Gemini) API

---

## 📂 Project Structure

```
LearnStation/
├── client/                     # React + Vite + TS Frontend
│   ├── src/
│   │   ├── components/         # Reusable layouts and UI components
│   │   ├── context/            # Auth and Path Selection contexts
│   │   ├── css/                # Custom CSS design system
│   │   ├── hooks/              # Custom React hooks (animations, reveals)
│   │   ├── pages/              # Application pages (Workspace, Profile, Discover)
│   │   ├── services/           # Type-safe API service modules
│   │   ├── types/              # Shared TypeScript model declarations
│   │   └── main.tsx            # Frontend entry point
│   ├── tsconfig.json           # Client TS options
│   └── vite.config.ts          # Vite build config
│
├── server/                     # Node.js + Express + TS Backend
│   ├── config/                 # Database configuration
│   ├── controllers/            # Route controllers (Auth, AI, Tracks)
│   ├── middleware/             # Express middlewares (error handling, auth fallback)
│   ├── routes/                 # API endpoints definition
│   ├── seeds/                  # Curriculum postgres seeder scripts
│   ├── utils/                  # Progress metrics and XP validators
│   ├── tsconfig.json           # Server TS options
│   └── server.ts               # Server entry point
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **Supabase Account** (with database credentials)
* **Gemini API Key** (for AI Mentor and Blueprint generation)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/revanth-kumar-02/Learn-Station.git
   cd Learn-Station
   ```

2. **Configure Backend (`server/`)**:
   Create a `server/.env` file with the following variables:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_jwt_signing_secret
   ```
   Install dependencies:
   ```bash
   cd server
   npm install
   ```

3. **Seed the Database**:
   Populate the database with all 84 tracks and curriculums:
   ```bash
   npm run seed
   ```

4. **Configure Frontend (`client/`)**:
   Create a `client/.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:5000/api
   ```
   Install dependencies:
   ```bash
   cd ../client
   npm install
   ```

### Running Locally

1. **Start the Express Server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Vite Frontend**:
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` (or the URL displayed in your Vite CLI).

---

## 🔒 Security & Self-Healing Database Middleware
The server includes an **On-the-Fly Profile Fallback** middleware. If a user successfully registers/logs in via Supabase but their public profile record is missing or deleted, the server automatically initializes a default profile with progress and statistics on the first request, removing dependencies on raw DB triggers.
