

## Revamp Agreement Flow: Guided, Smart, and Professional

### Current Problems
- Generic placeholder text like "Creator" and "Brand" instead of actual names
- Raw text editor feels intimidating and unprofessional
- No guided questions -- users must write everything from scratch
- AI "Improve" button is an afterthought, not integrated into the flow

### New Flow: Guided Wizard with Smart Defaults

**Replace the current 3-tab layout (Content / Deliverables / Details) with a guided step-by-step wizard that collects answers first, then generates the agreement.**

#### Step 1: Template Selection (keep as-is)
Same template cards (Unbox & Review, Social Boost, etc.)

#### Step 2: Quick Questions (NEW)
After selecting a template, show a friendly questionnaire with pre-filled defaults based on the template. Questions vary by template but include:

- **Brand Name** (auto-filled from `brand_profiles.company_name`)
- **Creator Name** (auto-filled from `creator_profiles.display_name`)
- **What product/service is this for?** (text input)
- **Proposed Budget** (USD input)
- **Event/Delivery Date** (date picker)
- **Start Time & Duration** (for event templates)
- **Content Platforms** (checkboxes: Instagram, TikTok, YouTube, etc.)
- **Usage Rights** (select: Creator channels only / Brand can repost / Full commercial rights)
- **Revision Rounds** (select: 1 / 2 / 3)
- **Special Instructions** (optional textarea)

Each question has a label and helper text. Fields auto-populate based on template type (e.g., event templates show time/duration, content templates show platforms).

#### Step 3: Review & Edit (REPLACES old Content tab)
- AI automatically generates the full agreement text using the answers from Step 2 (calls `draft-agreement` edge function with all the collected data)
- The generated agreement shows with actual brand and creator names inserted
- Agreement displays in a styled preview (not raw monospace text)
- An "Edit" toggle lets users switch to raw editing mode if they want to tweak
- Deliverables section shown inline (editable, add/remove)
- Summary card at the bottom with all key terms

#### Step 4: Send (confirmation)

### Technical Changes

**1. `src/components/agreements/SendAgreementDialog.tsx`** -- Major rewrite:
- Add `brandName` and `creatorName` props
- New state for wizard step: `'template' | 'questions' | 'review'`
- New state fields: `productDescription`, `platforms` (string[]), `usageRights`, `revisionRounds`, `specialInstructions`
- Questions step renders a clean form with grouped inputs
- On "Generate Agreement" button click, call the edge function with ALL collected data to produce a polished agreement
- Review step shows the generated text in a styled preview with markdown-like formatting
- Toggle between preview and edit mode
- Deliverables inline-editable in review step

**2. `src/components/brand-dashboard/BrandMessagesTab.tsx`** -- Pass names to dialog:
- Fetch `company_name` alongside brand profile ID (line ~257-261)
- Pass `brandName={brandCompanyName}` and `creatorName={selectedConvo.creator_profiles.display_name}` to `SendAgreementDialog`

**3. `src/config/agreement-templates.ts`** -- Update templates:
- Change template `suggestedContent` to use `{{brandName}}` and `{{creatorName}}` placeholders instead of generic "Creator" and "Brand"
- Add a `questions` config per template defining which fields to show (e.g., event templates show date/time, content templates show platforms)

**4. `supabase/functions/draft-agreement/index.ts`** -- Enhanced AI prompt:
- Accept new fields: `brandName`, `creatorName`, `productDescription`, `platforms`, `usageRights`, `revisionRounds`, `specialInstructions`
- Update the system prompt to use all these fields to generate a professional, personalized agreement
- Replace placeholders with actual names in the output

### What This Achieves
- Brand and creator names appear automatically throughout the agreement
- Users answer simple questions instead of writing legal text
- AI generates the full agreement from their answers (not just "improves" existing text)
- Preview mode makes it feel like a real document
- Still fully editable for power users who want to customize
- Professional output that feels world-class
