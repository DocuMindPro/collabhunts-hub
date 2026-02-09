

## Make "Send Agreement" Button More Prominent

### What Changes

In `src/components/brand-dashboard/BrandMessagesTab.tsx` (around line 671-679), the current "Send Agreement" button is a small icon-only button. It will be changed to:

- Show the full text **"Send Agreement"** next to the icon
- Use `size="sm"` instead of `size="icon"` so the text is visible
- Use a slightly more prominent style (primary variant or outline with primary text) so it stands out as a key action
- Keep it in the same input bar location but make it clearly labeled

### Technical Detail

Replace the current button:
```tsx
<Button variant="outline" size="icon" ...>
  <ScrollText className="h-4 w-4" />
</Button>
```

With:
```tsx
<Button variant="outline" size="sm" className="shrink-0 gap-1.5 font-medium" ...>
  <ScrollText className="h-4 w-4" />
  Send Agreement
</Button>
```

Only one file edited: `src/components/brand-dashboard/BrandMessagesTab.tsx`.
