

## Fix: Input Loses Focus After Each Keystroke in Messages

### Root Cause

`ConversationList` and `ChatView` are defined as **inner function components** inside the parent component. Every keystroke triggers `setNewMessage`, which re-renders the parent. React sees these inner components as new component types on each render, so it **unmounts and remounts** them -- destroying the input's focus.

### Fix

Convert `ConversationList` and `ChatView` from inner component declarations to **inline JSX**. Instead of:

```tsx
const ChatView = () => { return <div>...</div> };
// used as: <ChatView />
```

Change to directly rendering the JSX:

```tsx
{/* inline the JSX directly */}
{selectedConversation ? (
  <div>...chat view JSX...</div>
) : (
  <div>...conversation list JSX...</div>
)}
```

This prevents React from treating them as new component types on every render, so the input keeps its focus.

### Files Modified

1. **`src/components/creator-dashboard/MessagesTab.tsx`** -- Inline `ConversationList` and `ChatView` JSX directly into the render output instead of declaring them as inner functions.

2. **`src/components/brand-dashboard/BrandMessagesTab.tsx`** -- Same fix applied here since it has the identical pattern.

### No new dependencies or database changes needed.

