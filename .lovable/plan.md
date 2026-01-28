

# Fix Android App: JavaScript Bundle Not Loading

## Problem Identified

From your screenshot, the debug info shows:
- **Pre-React script loaded** (HTML and inline JS work)
- **"Waiting for React bundle to load..."** 
- **React never mounted** (bundle never executed)

The JavaScript bundle (`<script type="module">`) is failing silently. The WebView isn't reporting why.

## Root Cause

The `<script type="module">` tag fails to execute in Android WebView. This commonly happens because:

1. **ES module loading issues** in Android WebView
2. **MIME type problems** - WebView expects specific content types
3. **Silent JavaScript errors** that aren't being caught

## Solution: Enhanced Error Capturing

We need to add error event listeners that capture when the module script fails to load.

### Changes to `index.html`

Add these error handlers BEFORE the module script:

```javascript
// Capture module loading errors
window.addEventListener('error', function(event) {
  window.preReactLog('WINDOW ERROR: ' + event.message);
  if (event.filename) {
    window.preReactLog('  File: ' + event.filename);
  }
});

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  window.preReactLog('UNHANDLED PROMISE: ' + event.reason);
});

// Track when module script starts loading
window.preReactLog('About to load React module...');
```

Also modify the script tag to add error handling:

```html
<script type="module" src="/src/main.tsx" 
  onerror="window.preReactLog && window.preReactLog('MODULE LOAD ERROR: Script failed to load')">
</script>
```

### Updated Debug Info Function

Make the debug output automatically visible when errors occur, and add a "Test Bundle Fetch" button:

```javascript
window.testBundleFetch = function() {
  window.preReactLog('Testing if we can fetch bundle...');
  fetch('/assets/')
    .then(function(r) {
      window.preReactLog('Fetch status: ' + r.status);
      return r.text();
    })
    .then(function(text) {
      window.preReactLog('Response: ' + text.substring(0, 200));
    })
    .catch(function(e) {
      window.preReactLog('Fetch error: ' + e.message);
    });
};
```

## Complete Implementation

### File: `index.html`

Updates:
1. Add global error event listeners
2. Add onerror attribute to module script
3. Add "Test Bundle Fetch" button
4. Auto-show debug output on errors
5. Display any captured errors prominently

### Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Add error capturing, onerror handler, test fetch button |

## Expected Outcome

After rebuilding, the debug screen will show:
- **Exactly where the module loading fails**
- **Any JavaScript errors that occur**
- **Whether the bundle files are accessible**

This will tell us if the issue is:
- Bundle file not found (404)
- MIME type rejection
- JavaScript syntax error
- Module import failure

## Testing Steps

1. Rebuild APK with these changes
2. Install and open app
3. Click "Show Debug Info" immediately
4. Screenshot the logs - they will now show WHERE the failure occurs
5. Also tap "Test Bundle Fetch" to check if files are accessible

