
# Create Native App Debug System

## The Problem
I can't see errors from the APK. The Android console logs are hidden. Every fix is a guess.

## The Solution
Create a **diagnostic page** (`/debug`) that:
1. Renders IMMEDIATELY with zero network calls
2. Shows all platform detection info
3. Logs every initialization step ON SCREEN
4. Catches and displays any errors visibly
5. Works in BOTH web browser AND the APK

---

## What Will Be Created

### 1. New Debug Page (`src/pages/Debug.tsx`)

A simple page with:
- Platform info (is native? router type? user agent)
- Step-by-step initialization log displayed on screen
- Any errors shown in red boxes
- Buttons to test specific things (Supabase connection, etc.)

| Info Shown | Purpose |
|------------|---------|
| `Capacitor.isNativePlatform()` | Verify platform detection |
| Router type | Confirm HashRouter vs BrowserRouter |
| User Agent | See device info |
| Supabase URL configured | Verify env vars loaded |
| Each component mount status | See what renders |

### 2. Add Route in App.tsx

```typescript
<Route path="/debug" element={<Debug />} />
```

### 3. Debug Page Features

```text
+----------------------------------+
|  COLLABHUNTS DEBUG CONSOLE       |
+----------------------------------+
|  Platform: Native (Android)      |
|  Router: HashRouter              |
|  User Agent: Mozilla/5.0...      |
|  Supabase URL: Configured        |
+----------------------------------+
|  INITIALIZATION LOG:             |
|  [OK] App.tsx mounted            |
|  [OK] Router initialized         |
|  [OK] PageTransition rendered    |
|  [WAIT] Index.tsx loading...     |
|  [ERROR] Supabase timeout        |
+----------------------------------+
|  [Test Supabase] [Test Render]   |
+----------------------------------+
```

---

## How This Helps

1. **You install the APK**
2. **Navigate to `/#/debug`** (HashRouter uses hash)
3. **Screenshot the debug info**
4. **Share with me**
5. **I see exactly what's failing**

---

## Technical Implementation

### Debug Page Code Structure

```typescript
// NO Supabase imports - renders instantly
import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

const Debug = () => {
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${msg}`]);
  };

  useEffect(() => {
    addLog("Debug page mounted");
    addLog(`Platform: ${Capacitor.getPlatform()}`);
    addLog(`Native: ${Capacitor.isNativePlatform()}`);
    addLog(`Supabase URL: ${import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'MISSING'}`);
  }, []);

  return (
    <div style={{ 
      background: '#1a1a2e', 
      color: '#fff', 
      padding: 20,
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      <h1>Debug Console</h1>
      {logs.map((log, i) => (
        <div key={i}>{log}</div>
      ))}
      <button onClick={() => testSupabase()}>Test Supabase</button>
    </div>
  );
};
```

### Test Buttons

| Button | What It Tests |
|--------|---------------|
| Test Supabase | Tries a simple query, shows result/error |
| Test Auth | Checks session status |
| Test Render | Tries loading Index component |
| Clear Logs | Clears the log display |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Debug.tsx` | CREATE | New diagnostic page |
| `src/App.tsx` | MODIFY | Add `/debug` route |

---

## How to Use After Implementation

1. Build new APK (GitHub Actions)
2. Install on BlueStacks/device
3. Open app - even if it shows white screen
4. Type in URL bar: `/#/debug`
5. The debug page will load (it has NO dependencies)
6. Screenshot what you see
7. Share with me

This gives me **real visibility** into what's happening inside the APK.

---

## Why This Will Work

The debug page:
- Uses NO Supabase calls on initial render
- Uses NO animations or transitions
- Uses inline styles (no CSS loading issues)
- Renders pure HTML/JS immediately
- Can test things one by one with buttons

Even if the rest of the app is broken, this page will render and show us what's wrong.
