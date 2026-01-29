

# Admin Verification Toggle Controls

## Overview
Add two toggle switches in the Admin Dashboard's Testing tab that allow admins to enable/disable phone verification and email verification requirements. This is useful for testing the signup flow without the friction of actual verification.

## Current State
- **Phone verification** is currently **required** in both `CreatorSignup.tsx` and `BrandSignup.tsx`
  - Users must complete OTP verification before proceeding
  - The submit buttons are disabled until `phoneVerified === true`
- **Email verification** uses backend's auto-confirm setting (no direct frontend toggle)
- The `site_settings` table already exists with a key-value structure for storing settings

## Solution Approach

### 1. Database Changes
Add two new rows to `site_settings` table:

| Key | Value | Category | Description |
|-----|-------|----------|-------------|
| `require_phone_verification` | `true` | `testing` | Whether phone verification is required during signup |
| `require_email_verification` | `true` | `testing` | Whether email verification is required during signup |

### 2. Admin UI Changes
**File: `src/components/admin/AdminTestingTab.tsx`**

Add a new "Verification Settings" card with two toggles:
- **Phone Verification Required** (Switch)
  - When ON: Phone OTP verification required during signup
  - When OFF: Phone field still visible but verification can be skipped
- **Email Verification Required** (Switch)
  - When ON: Users must verify email to access dashboard
  - When OFF: Users can access dashboard immediately after signup

Include a warning badge indicating these are **testing settings** that should be enabled in production.

### 3. Signup Flow Changes
**Files: `src/pages/CreatorSignup.tsx`, `src/pages/BrandSignup.tsx`**

- Fetch the `require_phone_verification` setting on mount
- If disabled: Allow proceeding without phone verification
- Update button disabled logic to respect the setting
- Show indicator text when verification is bypassed

### 4. Create Custom Hook
**File: `src/hooks/useVerificationSettings.ts`**

```typescript
// Returns verification requirements from site_settings
export const useVerificationSettings = () => {
  const [settings, setSettings] = useState({
    requirePhone: true,
    requireEmail: true,
    loading: true
  });
  
  // Fetch from site_settings table
  // Keys: require_phone_verification, require_email_verification
  
  return settings;
};
```

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `src/hooks/useVerificationSettings.ts` | Create | New hook to fetch verification settings |
| `src/components/admin/AdminTestingTab.tsx` | Modify | Add verification toggles card with Switch components |
| `src/pages/CreatorSignup.tsx` | Modify | Use hook, make phone verification conditional |
| `src/pages/BrandSignup.tsx` | Modify | Use hook, make phone verification conditional |

## UI Design

The new card in AdminTestingTab will look like:

```text
┌─────────────────────────────────────────────────────────┐
│  🔐 Verification Settings                               │
│  Control verification requirements for testing          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Phone Verification Required    ────────────── [ON/OFF] │
│  Users must verify phone via OTP during signup          │
│                                                         │
│  Email Verification Required    ────────────── [ON/OFF] │
│  Users must verify email before accessing dashboard     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⚠️ Warning: Disabling verification is for       │   │
│  │ testing only. Enable in production!             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Technical Details

### Database Migration
Insert default settings (both enabled by default):
```sql
INSERT INTO site_settings (key, value, category, description)
VALUES 
  ('require_phone_verification', 'true', 'testing', 'Require phone OTP verification during signup'),
  ('require_email_verification', 'true', 'testing', 'Require email verification before dashboard access')
ON CONFLICT (key) DO NOTHING;
```

### Hook Implementation
```typescript
// src/hooks/useVerificationSettings.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVerificationSettings = () => {
  const [settings, setSettings] = useState({
    requirePhone: true,
    requireEmail: true,
    loading: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["require_phone_verification", "require_email_verification"]);

      if (data) {
        const phoneRequired = data.find(s => s.key === "require_phone_verification")?.value !== "false";
        const emailRequired = data.find(s => s.key === "require_email_verification")?.value !== "false";
        setSettings({
          requirePhone: phoneRequired,
          requireEmail: emailRequired,
          loading: false
        });
      } else {
        setSettings(s => ({ ...s, loading: false }));
      }
    };

    fetchSettings();
  }, []);

  return settings;
};
```

### Signup Conditional Logic
```typescript
// In CreatorSignup.tsx handleStep1:
if (requirePhone && !phoneVerified) {
  toast({
    title: "Phone Verification Required",
    description: "Please verify your phone number",
    variant: "destructive"
  });
  return;
}
// If !requirePhone, proceed regardless of phoneVerified state
```

## Summary
This implementation adds admin controls to toggle phone and email verification on/off for testing purposes while:
- Keeping defaults secure (both enabled)
- Showing clear warnings about production use
- Not affecting the verification UI itself (just whether it's enforced)
- Using the existing `site_settings` infrastructure

