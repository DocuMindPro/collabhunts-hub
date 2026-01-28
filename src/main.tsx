import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Extend window for TypeScript
declare global {
  interface Window {
    REACT_MOUNTED: boolean;
    preReactLog?: (msg: string) => void;
    PRE_REACT_LOGS?: string[];
  }
}

// Log to pre-react system if available
const log = (msg: string) => {
  console.log('[App Init] ' + msg);
  if (window.preReactLog) {
    window.preReactLog(msg);
  }
};

log('main.tsx executing...');
log('Supabase URL available: ' + !!import.meta.env.VITE_SUPABASE_URL);
log('Supabase Key available: ' + !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

try {
  log('Looking for root element...');
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  log('Root element found, creating React root...');
  
  // Hide the pre-react loader
  const preLoader = document.getElementById('pre-react-loader');
  if (preLoader) {
    log('Hiding pre-react loader...');
    preLoader.style.display = 'none';
  }
  
  log('Rendering React app...');
  createRoot(rootElement).render(<App />);
  
  // Signal successful mount
  window.REACT_MOUNTED = true;
  log('React app rendered successfully!');
  
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  log('FATAL ERROR: ' + errorMessage);
  console.error('[App Init] Failed to render app:', error);
  
  // Show error in pre-react loader if it exists
  const preLoader = document.getElementById('pre-react-loader');
  const statusEl = document.getElementById('js-status');
  
  if (preLoader && statusEl) {
    preLoader.style.display = 'flex';
    statusEl.innerHTML = `
      <span style="color: #ff6b6b; font-weight: bold;">App Failed to Load</span>
      <br/>
      <span style="color: #ffa94d; font-size: 11px;">${errorMessage}</span>
      <br/>
      <button onclick="location.reload()" style="margin-top:10px;padding:8px 16px;background:#4dabf7;color:white;border:none;border-radius:4px;cursor:pointer;">
        Reload
      </button>
    `;
  } else {
    // Fallback if pre-react loader doesn't exist
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#1a1a2e;color:#fff;padding:20px;text-align:center;font-family:system-ui;">
          <h1 style="color:#ff6b6b;">App Failed to Load</h1>
          <p style="color:#a0a0a0;">${errorMessage}</p>
          <button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:#4dabf7;color:#fff;border:none;border-radius:8px;font-size:16px;">
            Reload
          </button>
        </div>
      `;
    }
  }
}
