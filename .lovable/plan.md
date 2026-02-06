
# Fix Message Artifacts in Conversation List

## Problem

The conversation list preview in both Brand and Creator messages tabs shows raw JSON strings like `{"type":"offer","offer_id":"4255a870-b8f9..."}` instead of a friendly preview. This happens because `last_message` content is displayed directly without checking if it's structured data (offers, inquiries, negotiations).

## Solution

Add a `getMessagePreview()` helper function to both message tabs that detects structured JSON messages and returns a human-readable preview string.

```tsx
const getMessagePreview = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "offer") {
      return `Offer: $${(parsed.price_cents / 100).toFixed(0)} - ${parsed.package_name || "Package"}`;
    }
    if (parsed.type === "inquiry") {
      return `Inquiry: $${(parsed.proposed_budget_cents / 100).toFixed(0)} - ${(parsed.package_type || "").replace(/_/g, " ")}`;
    }
    if (parsed.type === "counter_offer") {
      return `Counter offer: $${(parsed.proposed_budget_cents / 100).toFixed(0)}`;
    }
    if (parsed.type === "package_inquiry") {
      return `Package inquiry: ${parsed.package_name || "Package"}`;
    }
    return content; // Unknown JSON, show as-is
  } catch {
    return content; // Not JSON, show as regular text
  }
};
```

Then replace the raw `{conv.last_message}` with `{getMessagePreview(conv.last_message || "")}`.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/brand-dashboard/BrandMessagesTab.tsx` | Add `getMessagePreview` helper, use it on line ~490 |
| `src/components/creator-dashboard/MessagesTab.tsx` | Add same `getMessagePreview` helper, use it on line ~419 |
