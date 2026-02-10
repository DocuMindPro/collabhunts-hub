

## Block AI Crawlers and Add Anti-Scraping Terms

### 1. Update `robots.txt` to Block AI Crawlers

Replace the current file with rules that explicitly block known AI crawlers while keeping search engines and social media bots allowed.

**AI bots to block:**
- GPTBot, ChatGPT-User (OpenAI)
- CCBot (Common Crawl, used for AI training)
- ClaudeBot, anthropic-ai (Anthropic)
- Google-Extended (Google AI training, separate from Googlebot search)
- Bytespider (ByteDance AI)
- Perplexity bots
- Cohere-ai, FacebookBot (Meta AI training)

**File:** `public/robots.txt`

### 2. Add `noai` Meta Tags to HTML Head

Add two meta tags to `index.html` that signal to compliant crawlers not to use content for AI training:

```html
<meta name="robots" content="noai, noimageai" />
```

**File:** `index.html`

### 3. Add Section 12.5 to Terms of Service -- "Automated Scraping & AI Prohibition"

Insert a new clause into the existing "Prohibited Activities" section (Section 12) of `src/pages/TermsOfService.tsx`. This adds legal teeth to the technical protections. Content will cover:

- Prohibition of automated scraping, crawling, or data extraction
- Prohibition of using platform content to train AI/ML models
- Prohibition of reproducing platform features, layouts, or functionality via AI tools
- Statement that violations may result in legal action and account termination

This will be added as additional bullet points to the existing Section 12 list, plus a highlighted legal warning box below it.

**File:** `src/pages/TermsOfService.tsx` -- modify Section 12 (lines 216-234)

### Files to Modify

| File | Change |
|------|--------|
| `public/robots.txt` | Replace with AI-crawler-blocking rules |
| `index.html` | Add `noai, noimageai` meta tag in head |
| `src/pages/TermsOfService.tsx` | Add AI scraping prohibition to Section 12 |

### No new files, no new dependencies, no database changes.

