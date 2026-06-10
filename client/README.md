# LearnStation - Frontend Client 🌐

This is the frontend React client for the LearnStation platform. It is built using **React 19**, **TypeScript**, and **Vite** with **Vanilla CSS** and **Framer Motion**.

For detailed setup guidelines, features description, and full codebase architecture, please refer to the **[Root README.md](../README.md)**.

## 🚀 Development Setup

1. Make sure you have installed client dependencies:
   ```bash
   npm install
   ```

2. Configure your environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:5000/api
   ```

3. Launch the local dev server:
   ```bash
   npm run dev
   ```

4. Build the production application bundle:
   ```bash
   npm run build
   ```

5. Run type checks:
   ```bash
   npx tsc --noEmit
   ```
