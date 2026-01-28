
# Fix Android White Screen - Pre-React Debug Layer

## Root Cause Analysis

The app shows a **pure white screen** with nothing visible - not even the error boundary or debug button. This means:

1. JavaScript is either not loading OR
2. JavaScript crashes immediately before React can mount
3. Our React-based error handling never runs

The debug button is part of the React component tree. If React doesn't start, the button never renders.

---

## Solution: Add Debug Layer BEFORE React

We need to add diagnostic tools **in the HTML itself** that work even when JavaScript completely fails.

### Strategy

```text
HTML loads
   |
   v
[LOADING INDICATOR VISIBLE] <-- Shows immediately (pure HTML/CSS)
   |
   v
JavaScript loads?
   |
   +-- NO --> Loading indicator stays visible forever
   |          (user sees "Loading..." instead of white)
   |
   +-- YES --> React starts?
               |
               +-- NO --> main.tsx catch block shows error
               |
               +-- YES --> React hides loading indicator
                           App renders normally
```

---

## Implementation Plan

### 1. Modify `index.html` - Add Pre-React Fallback UI

Add a loading indicator that's visible by default and only hidden when React successfully mounts:

```html
<div id="root">
  <!-- Visible BEFORE React loads - pure HTML/CSS, no JS needed -->
  <div id="pre-react-loader" style="
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #1a1a2e;
    color: white;
    font-family: system-ui, sans-serif;
  ">
    <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
    <div style="font-size: 18px;">Loading CollabHunts...</div>
    <div id="js-status" style="margin-top: 20px; color: #666; font-size: 12px;">
      JavaScript not loaded yet
    </div>
  </div>
</div>
```

### 2. Add Inline Script for Early Debugging

Add a script tag BEFORE the React bundle that logs status:

```html
<script>
  // Runs BEFORE React - helps debug loading issues
  console.log('[PRE-REACT] HTML loaded');
  document.getElementById('js-status').textContent = 'JavaScript starting...';
  
  // Track if React ever renders
  window.REACT_MOUNTED = false;
  setTimeout(function() {
    if (!window.REACT_MOUNTED) {
      document.getElementById('js-status').innerHTML = 
        '<span style="color: #ff6b6b;">React failed to mount after 10s</span>' +
        '<br/><button onclick="location.reload()" style="margin-top:10px;padding:8px 16px;">Reload</button>';
    }
  }, 10000);
</script>
```

### 3. Modify `main.tsx` to Signal Successful Mount

When React successfully mounts, set the flag and hide the loader:

```typescript
// In main.tsx, after successful render
window.REACT_MOUNTED = true;
const preLoader = document.getElementById('pre-react-loader');
if (preLoader) preLoader.style.display = 'none';
```

### 4. Add Debug Info Screen to Pre-React Loader

Include a button to show environment diagnostics without React:

```html
<button onclick="showDebugInfo()" style="margin-top: 20px; padding: 10px 20px;">
  Show Debug Info
</button>

<script>
function showDebugInfo() {
  var info = [
    'User Agent: ' + navigator.userAgent,
    'Protocol: ' + location.protocol,
    'URL: ' + location.href,
    'Screen: ' + screen.width + 'x' + screen.height,
    'Timestamp: ' + new Date().toISOString()
  ].join('\n');
  
  document.getElementById('debug-output').textContent = info;
}
</script>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Add pre-React loader div, inline debug script, debug button |
| `src/main.tsx` | Set `window.REACT_MOUNTED = true` after successful render, hide loader |

---

## What User Will See Now

### If JavaScript Never Loads:
```
+---------------------------+
|         ⏳                |
|  Loading CollabHunts...   |
|                           |
|  [JavaScript not loaded]  |
|                           |
|  [Show Debug Info]        |
+---------------------------+
```

### If JavaScript Loads But React Crashes:
```
+---------------------------+
|   App Failed to Load      |
|   [Error message]         |
|                           |
|   [Reload Button]         |
+---------------------------+
```

### If Everything Works:
Normal app renders, loader disappears.

---

## Why This Will Work

| Current Problem | Solution |
|-----------------|----------|
| White screen shows nothing | Pre-React HTML shows "Loading..." |
| No debug info accessible | "Show Debug Info" button works without React |
| Can't tell if JS loaded | Status text updates as JS runs |
| 10+ second wait wondering | Clear timeout message after 10s |

---

## Testing After Implementation

1. Build new APK
2. Install on BlueStacks
3. You should see "Loading CollabHunts..." with a loading icon
4. If it stays on that screen, tap "Show Debug Info" and screenshot
5. This tells us if JS is loading but React is crashing, or if JS never loads at all

This approach gives us visibility **before React** - the one place our current debugging can't reach.
