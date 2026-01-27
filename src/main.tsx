import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug logging for native builds - helps identify environment variable issues
console.log('[App Init] Starting application...');
console.log('[App Init] Supabase URL available:', !!import.meta.env.VITE_SUPABASE_URL);
console.log('[App Init] Supabase Key available:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  createRoot(rootElement).render(<App />);
  console.log('[App Init] App rendered successfully');
} catch (error) {
  console.error('[App Init] Failed to render app:', error);
  // Show a basic error message if rendering fails
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#1a1a2e;color:#fff;padding:20px;text-align:center;font-family:system-ui;">
        <h1 style="color:#ff6b6b;">App Failed to Load</h1>
        <p style="color:#a0a0a0;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:#4dabf7;color:#fff;border:none;border-radius:8px;font-size:16px;">
          Reload
        </button>
      </div>
    `;
  }
}
