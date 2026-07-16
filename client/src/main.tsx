import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize Theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark-theme');
} else {
  // Default to light (since we set :root variables to light theme)
  document.documentElement.classList.remove('dark-theme');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA offline features
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('📶 [PWA] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.error('❌ [PWA] Service Worker registration failed:', err);
      });
  });
}
