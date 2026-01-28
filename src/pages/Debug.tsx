import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const Debug = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  }, []);

  // Gather platform info on mount - NO async calls
  useEffect(() => {
    addLog("Debug page mounted", 'success');
    
    try {
      addLog(`Platform: ${Capacitor.getPlatform()}`, 'info');
      addLog(`Is Native: ${Capacitor.isNativePlatform()}`, 'info');
      addLog(`User Agent: ${navigator.userAgent.substring(0, 80)}...`, 'info');
      addLog(`Window Location: ${window.location.href}`, 'info');
      addLog(`Protocol: ${window.location.protocol}`, 'info');
      
      // Check environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      addLog(`VITE_SUPABASE_URL: ${supabaseUrl ? 'SET ✓' : 'MISSING ✗'}`, supabaseUrl ? 'success' : 'error');
      addLog(`VITE_SUPABASE_KEY: ${supabaseKey ? 'SET ✓' : 'MISSING ✗'}`, supabaseKey ? 'success' : 'error');
      
      // Check if we're in HashRouter or BrowserRouter
      const isHashRouter = window.location.hash.includes('#');
      addLog(`Router Type: ${isHashRouter ? 'HashRouter' : 'BrowserRouter'}`, 'info');
      
      // Screen info
      addLog(`Screen: ${window.innerWidth}x${window.innerHeight}`, 'info');
      addLog(`Device Pixel Ratio: ${window.devicePixelRatio}`, 'info');
      
    } catch (error) {
      addLog(`Init Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  }, [addLog]);

  const testSupabase = async () => {
    addLog("Testing Supabase connection...", 'warning');
    setTestResults(prev => ({ ...prev, supabase: 'testing...' }));
    
    try {
      // Dynamic import to avoid blocking initial render
      const { supabase } = await import("@/integrations/supabase/client");
      addLog("Supabase client imported", 'success');
      
      const startTime = Date.now();
      
      // Simple query with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 5s')), 5000)
      );
      
      const queryPromise = supabase.from('creator_profiles').select('id').limit(1);
      
      const result = await Promise.race([queryPromise, timeoutPromise]) as any;
      const duration = Date.now() - startTime;
      
      if (result.error) {
        addLog(`Supabase Error: ${result.error.message}`, 'error');
        setTestResults(prev => ({ ...prev, supabase: `Error: ${result.error.message}` }));
      } else {
        addLog(`Supabase OK - ${duration}ms - ${result.data?.length || 0} rows`, 'success');
        setTestResults(prev => ({ ...prev, supabase: `Success (${duration}ms)` }));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`Supabase Failed: ${msg}`, 'error');
      setTestResults(prev => ({ ...prev, supabase: `Failed: ${msg}` }));
    }
  };

  const testAuth = async () => {
    addLog("Testing Auth session...", 'warning');
    setTestResults(prev => ({ ...prev, auth: 'testing...' }));
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 5s')), 5000)
      );
      
      const sessionPromise = supabase.auth.getSession();
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
      
      if (result.error) {
        addLog(`Auth Error: ${result.error.message}`, 'error');
        setTestResults(prev => ({ ...prev, auth: `Error: ${result.error.message}` }));
      } else if (result.data?.session) {
        addLog(`Auth: Logged in as ${result.data.session.user.email}`, 'success');
        setTestResults(prev => ({ ...prev, auth: 'Logged in' }));
      } else {
        addLog("Auth: No session (not logged in)", 'info');
        setTestResults(prev => ({ ...prev, auth: 'No session' }));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`Auth Failed: ${msg}`, 'error');
      setTestResults(prev => ({ ...prev, auth: `Failed: ${msg}` }));
    }
  };

  const testFetch = async () => {
    addLog("Testing network fetch...", 'warning');
    setTestResults(prev => ({ ...prev, fetch: 'testing...' }));
    
    try {
      const startTime = Date.now();
      const response = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        addLog(`Fetch OK - ${duration}ms - Status ${response.status}`, 'success');
        setTestResults(prev => ({ ...prev, fetch: `Success (${duration}ms)` }));
      } else {
        addLog(`Fetch Error: Status ${response.status}`, 'error');
        setTestResults(prev => ({ ...prev, fetch: `Error: ${response.status}` }));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`Fetch Failed: ${msg}`, 'error');
      setTestResults(prev => ({ ...prev, fetch: `Failed: ${msg}` }));
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults({});
    addLog("Logs cleared", 'info');
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '#4ade80';
      case 'error': return '#f87171';
      case 'warning': return '#fbbf24';
      default: return '#94a3b8';
    }
  };

  return (
    <div style={{ 
      background: '#0f0f1a', 
      color: '#fff', 
      padding: '16px',
      minHeight: '100vh',
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '1.5'
    }}>
      {/* Header */}
      <div style={{ 
        background: '#1e1e2e', 
        padding: '12px', 
        borderRadius: '8px',
        marginBottom: '16px',
        borderLeft: '4px solid #f97316'
      }}>
        <h1 style={{ margin: 0, fontSize: '18px', color: '#f97316' }}>
          🔧 COLLABHUNTS DEBUG CONSOLE
        </h1>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '11px' }}>
          Native App Diagnostic Tool
        </p>
      </div>

      {/* Quick Status */}
      <div style={{ 
        background: '#1e1e2e', 
        padding: '12px', 
        borderRadius: '8px',
        marginBottom: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px'
      }}>
        <div>
          <span style={{ color: '#64748b' }}>Platform: </span>
          <span style={{ color: '#4ade80' }}>{Capacitor.getPlatform()}</span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Native: </span>
          <span style={{ color: Capacitor.isNativePlatform() ? '#4ade80' : '#fbbf24' }}>
            {Capacitor.isNativePlatform() ? 'Yes' : 'No'}
          </span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Supabase: </span>
          <span style={{ color: testResults.supabase?.includes('Success') ? '#4ade80' : '#64748b' }}>
            {testResults.supabase || 'Not tested'}
          </span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Auth: </span>
          <span style={{ color: testResults.auth?.includes('Logged') ? '#4ade80' : '#64748b' }}>
            {testResults.auth || 'Not tested'}
          </span>
        </div>
      </div>

      {/* Test Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={testSupabase}
          style={{
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Test Supabase
        </button>
        <button
          onClick={testAuth}
          style={{
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Test Auth
        </button>
        <button
          onClick={testFetch}
          style={{
            background: '#10b981',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Test Network
        </button>
        <button
          onClick={clearLogs}
          style={{
            background: '#64748b',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Clear Logs
        </button>
      </div>

      {/* Log Output */}
      <div style={{ 
        background: '#0a0a12', 
        padding: '12px', 
        borderRadius: '8px',
        maxHeight: '50vh',
        overflowY: 'auto',
        border: '1px solid #1e1e2e'
      }}>
        <div style={{ 
          color: '#64748b', 
          marginBottom: '8px',
          borderBottom: '1px solid #1e1e2e',
          paddingBottom: '8px'
        }}>
          INITIALIZATION LOG ({logs.length} entries)
        </div>
        {logs.map((log, i) => (
          <div 
            key={i} 
            style={{ 
              color: getLogColor(log.type),
              padding: '2px 0',
              borderLeft: `2px solid ${getLogColor(log.type)}`,
              paddingLeft: '8px',
              marginBottom: '2px'
            }}
          >
            <span style={{ color: '#475569' }}>[{log.timestamp}]</span> {log.message}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ 
        marginTop: '16px',
        padding: '12px',
        background: '#1e1e2e',
        borderRadius: '8px'
      }}>
        <a 
          href={Capacitor.isNativePlatform() ? '#/' : '/'}
          style={{ color: '#f97316', textDecoration: 'none' }}
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
};

export default Debug;
