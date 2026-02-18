import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Copy, Trash2, Bug } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface DebugLogEntry {
  level: 'error' | 'warn' | 'info' | 'rejection';
  message: string;
  timestamp: string;
  stack?: string;
}

// ── Global error capture ─────────────────────────────────────────────────────
// This is called from main.tsx to install interceptors BEFORE React boots.
// The hook below reads from window.NATIVE_ERROR_LOG.

declare global {
  interface Window {
    NATIVE_ERROR_LOG: DebugLogEntry[];
    NATIVE_DEBUG_OPEN?: () => void;
  }
}

const STORAGE_KEY = 'native_debug_log';
const MAX_ENTRIES = 100;

function persistLog(entries: DebugLogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {}
}

function loadPersistedLog(): DebugLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

// ── Hook: useTapTrigger ───────────────────────────────────────────────────────
// Returns a ref to attach to any element. Tapping 5 times quickly opens console.

export function useTapTrigger(onTrigger: () => void) {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback(() => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);

    if (tapCount.current >= 5) {
      tapCount.current = 0;
      onTrigger();
      return;
    }

    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 2000);
  }, [onTrigger]);

  return handleTap;
}

// ── Main Debug Console Component ─────────────────────────────────────────────

interface NativeDebugConsoleProps {
  /** When true, the console is visible */
  isOpen: boolean;
  onClose: () => void;
}

export function NativeDebugConsole({ isOpen, onClose }: NativeDebugConsoleProps) {
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'active' | 'expired'>('checking');
  const [copied, setCopied] = useState(false);

  const refreshLogs = useCallback(() => {
    // Merge window log + persisted log, deduplicate by timestamp+message
    const windowLogs: DebugLogEntry[] = window.NATIVE_ERROR_LOG || [];
    const persisted = loadPersistedLog();
    const combined = [...persisted, ...windowLogs];
    const seen = new Set<string>();
    const unique = combined.filter(e => {
      const key = `${e.timestamp}|${e.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setLogs(unique.slice(-MAX_ENTRIES));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    refreshLogs();

    // Check session
    supabase.auth.getSession().then(({ data }) => {
      setSessionStatus(data.session ? 'active' : 'expired');
    }).catch(() => setSessionStatus('expired'));
  }, [isOpen, refreshLogs]);

  const handleCopyAll = useCallback(async () => {
    const deviceInfo = [
      `Device: ${navigator.userAgent}`,
      `Screen: ${window.innerWidth}x${window.innerHeight}`,
      `Time: ${new Date().toISOString()}`,
      `Session: ${sessionStatus}`,
      `URL: ${window.location.href}`,
      '',
      '=== LOGS ===',
      ...logs.map(l =>
        `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}${l.stack ? '\n  Stack: ' + l.stack : ''}`
      ),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(deviceInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for Android WebView
      const el = document.createElement('textarea');
      el.value = deviceInfo;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [logs, sessionStatus]);

  const handleClear = useCallback(() => {
    window.NATIVE_ERROR_LOG = [];
    localStorage.removeItem(STORAGE_KEY);
    setLogs([]);
  }, []);

  if (!isOpen) return null;

  const levelColor: Record<string, string> = {
    error: '#ff6b6b',
    rejection: '#ff9f43',
    warn: '#ffd43b',
    info: '#74c0fc',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace',
      }}
    >
      {/* Header */}
      <div style={{ backgroundColor: '#1a1a2e', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bug size={18} color="#f97316" />
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Debug Console</span>
          <span style={{ color: '#888', fontSize: 11 }}>v{logs.length} entries</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleClear} style={{ color: '#ff6b6b', background: 'none', border: '1px solid #ff6b6b', borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>
            <Trash2 size={12} style={{ display: 'inline', marginRight: 4 }} />
            Clear
          </button>
          <button onClick={handleCopyAll} style={{ color: copied ? '#51cf66' : '#74c0fc', background: 'none', border: `1px solid ${copied ? '#51cf66' : '#74c0fc'}`, borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>
            <Copy size={12} style={{ display: 'inline', marginRight: 4 }} />
            {copied ? 'Copied!' : 'Copy All'}
          </button>
          <button onClick={onClose} style={{ color: '#aaa', background: 'none', border: '1px solid #555', borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Device info */}
      <div style={{ backgroundColor: '#111', padding: '8px 16px', borderBottom: '1px solid #222', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ color: '#888', fontSize: 11 }}>Screen: {window.innerWidth}×{window.innerHeight}</span>
        <span style={{ color: '#888', fontSize: 11 }}>Time: {new Date().toLocaleTimeString()}</span>
        <span style={{
          color: sessionStatus === 'active' ? '#51cf66' : sessionStatus === 'expired' ? '#ff6b6b' : '#ffd43b',
          fontSize: 11,
          fontWeight: 'bold',
        }}>
          Session: {sessionStatus === 'active' ? '✓ Active' : sessionStatus === 'expired' ? '✗ Expired' : '⟳ Checking...'}
        </span>
      </div>

      {/* User agent (truncated) */}
      <div style={{ backgroundColor: '#111', padding: '4px 16px', borderBottom: '1px solid #222' }}>
        <span style={{ color: '#555', fontSize: 10, wordBreak: 'break-all' }}>{navigator.userAgent}</span>
      </div>

      {/* Logs */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#555', textAlign: 'center', paddingTop: 40, fontSize: 13 }}>
            No logs captured yet.{'\n'}Errors and warnings will appear here.
          </div>
        ) : (
          [...logs].reverse().map((log, i) => (
            <div key={i} style={{ padding: '6px 16px', borderBottom: '1px solid #111', backgroundColor: i % 2 === 0 ? '#0d0d15' : '#0a0a0f' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: levelColor[log.level] || '#888', fontSize: 10, minWidth: 60, fontWeight: 'bold', textTransform: 'uppercase', flexShrink: 0 }}>
                  [{log.level}]
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#e0e0e0', fontSize: 11, wordBreak: 'break-word', lineHeight: 1.4 }}>{log.message}</div>
                  {log.stack && (
                    <div style={{ color: '#555', fontSize: 10, marginTop: 2, wordBreak: 'break-word' }}>{log.stack.slice(0, 200)}</div>
                  )}
                  <div style={{ color: '#444', fontSize: 10, marginTop: 2 }}>{log.timestamp}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: '#1a1a2e', padding: '8px 16px', borderTop: '1px solid #333', textAlign: 'center' }}>
        <span style={{ color: '#555', fontSize: 10 }}>
          Tap the Collab Hunts logo 5× on any screen to open this console
        </span>
      </div>
    </div>
  );
}

// ── Provider: wraps the whole app, installs console globally ─────────────────

export function NativeDebugProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Expose global open trigger so tap-based triggers (5x logo tap) can also open it
    window.NATIVE_DEBUG_OPEN = () => setIsOpen(true);
  }, []);

  // FloatingDebugButton is defined here so it has DIRECT access to setIsOpen
  // without going through the window.NATIVE_DEBUG_OPEN bridge (which can be stale
  // if the provider remounts, as happened when we had two providers).
  const FloatingDebugButton = () => {
    // Only show on native platforms (Capacitor.isNativePlatform())
    // Use dynamic import-like check to avoid importing Capacitor here
    const isNative = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
    if (!isNative) return null;

    return (
      <button
        onPointerDown={(e) => { e.stopPropagation(); setIsOpen(true); }}
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 112px)',
          right: 16,
          zIndex: 99998,
          backgroundColor: '#f97316',
          border: 'none',
          borderRadius: 28,
          // Minimum 44×44pt tap target per Apple HIG
          minWidth: 80,
          minHeight: 44,
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          cursor: 'pointer',
          opacity: 0.9,
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 18 }}>🐛</span>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Debug</span>
      </button>
    );
  };

  return (
    <>
      {children}
      <FloatingDebugButton />
      <NativeDebugConsole isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}


// ── Install global error/rejection interceptors ───────────────────────────────
// Call this ONCE from main.tsx before React renders.

export function installNativeErrorInterceptors() {
  if (typeof window === 'undefined') return;

  // Initialize log store
  if (!window.NATIVE_ERROR_LOG) {
    window.NATIVE_ERROR_LOG = [];
  }

  const addEntry = (entry: DebugLogEntry) => {
    if (!window.NATIVE_ERROR_LOG) window.NATIVE_ERROR_LOG = [];
    window.NATIVE_ERROR_LOG.push(entry);
    if (window.NATIVE_ERROR_LOG.length > MAX_ENTRIES) {
      window.NATIVE_ERROR_LOG = window.NATIVE_ERROR_LOG.slice(-MAX_ENTRIES);
    }
    // Persist to localStorage
    persistLog(window.NATIVE_ERROR_LOG);
  };

  // Intercept console.error
  const origError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    origError(...args);
    const message = args.map(a => {
      if (typeof a === 'string') return a;
      if (a instanceof Error) return `${a.message}`;
      try { return JSON.stringify(a); } catch { return String(a); }
    }).join(' ');
    const stack = args.find(a => a instanceof Error) ? (args.find(a => a instanceof Error) as Error).stack : undefined;
    addEntry({ level: 'error', message, timestamp: new Date().toISOString(), stack });
  };

  // Intercept console.warn
  const origWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    origWarn(...args);
    const message = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
    addEntry({ level: 'warn', message, timestamp: new Date().toISOString() });
  };

  // Global unhandled errors
  window.addEventListener('error', (event) => {
    addEntry({
      level: 'error',
      message: `Unhandled error: ${event.message} (${event.filename}:${event.lineno})`,
      timestamp: new Date().toISOString(),
      stack: event.error?.stack,
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error
      ? `Unhandled rejection: ${reason.message}`
      : `Unhandled rejection: ${JSON.stringify(reason)}`;
    addEntry({
      level: 'rejection',
      message,
      timestamp: new Date().toISOString(),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    // Don't prevent default — let it also show in console
  });
}

export default NativeDebugConsole;
