

## Native Mobile App UX Overhaul

### Issues Identified

1. **Profile completion not enforced on app restart** -- NativeAppGate checks if a creator/brand profile *exists* in the database, but doesn't check if the profile is actually *complete*. A user who started onboarding but closed the app mid-way gets sent straight to the dashboard on reopen because their partial profile row already exists.

2. **Bottom navigation not sticky** -- The bottom nav is `fixed` but the content area doesn't properly account for it, and on some views (like Messages), the full-screen layout overlaps or pushes content out of view.

3. **Messages tab takes over full screen on native** -- The Messages tab uses `fixed inset-0` positioning which covers the bottom nav entirely, making navigation impossible while in messages.

4. **Creator Profile tab not accessible on mobile** -- The Profile tab exists but on native, the edit drawer (Sheet) opens from the right side which may not work well. The profile settings (open to invitations toggle, etc.) are buried inside accordion sections.

5. **No profile completeness check** -- Creators with incomplete profiles (missing bio, missing services, etc.) can access the full dashboard without any prompt to complete their profile.

6. **Overall layout issues** -- Content padding, spacing, and scroll behavior need optimization for small screens.

---

### Plan

#### 1. Enforce Profile Completion Gate in NativeAppGate

**Problem**: User logs in, has a profile row (created during onboarding step 1), but hasn't finished onboarding. App skips to dashboard.

**Fix**: After detecting a creator profile exists, check if key fields are populated (e.g., `display_name`, `bio`, at least one category). If incomplete, show onboarding again. For brands, check `registration_completed` flag (already exists but not enforced on app restart).

**Files**: `src/components/NativeAppGate.tsx`

- In `refetchProfiles`, also fetch `bio`, `categories`, and `status` for creator profiles
- Add a new state `needsOnboardingCompletion`
- After profile fetch, if creator exists but `display_name` is empty or `status` is null/pending, route back to onboarding
- For brands, if `registration_completed === false`, route to brand onboarding

#### 2. Fix Messages Tab Layout on Native

**Problem**: Messages uses `fixed inset-0` which covers the bottom nav. Users can't navigate away.

**Fix**: Remove the `fixed inset-0` approach for native messages. Instead, use a flex layout that respects the bottom nav's space.

**Files**: `src/components/creator-dashboard/MessagesTab.tsx`

- Change native layout from `fixed inset-0` to a calculated height container: `h-[calc(100vh-theme(spacing.20)-env(safe-area-inset-top))]`
- Ensure the chat input stays visible above the bottom nav
- Same fix for `src/components/brand-dashboard/BrandMessagesTab.tsx`

#### 3. Make Bottom Nav Truly Sticky and Always Visible

**Problem**: Bottom nav can be scrolled away or hidden behind content.

**Fix**: The bottom navs already use `fixed bottom-0` which should work. The real issue is content overlap. Ensure all tab content containers have proper `pb-20` (80px) bottom padding so content doesn't hide behind the nav.

**Files**: 
- `src/pages/CreatorDashboard.tsx` -- verify `pb-20` on native
- `src/pages/NativeBrandDashboard.tsx` -- verify `pb-20` on content area
- `src/components/mobile/MobileBottomNav.tsx` -- already fixed
- `src/components/mobile/BrandBottomNav.tsx` -- already fixed

#### 4. Improve Creator Profile Access on Native

**Problem**: Profile editing (open to invitations, privacy settings, etc.) not easily accessible on mobile.

**Fix**: On native, instead of the Sheet/drawer approach, render profile settings inline within the Profile tab. Add a dedicated "Settings" section with clearly labeled toggles.

**Files**: `src/components/creator-dashboard/ProfileTab.tsx`

- Detect native platform
- On native, render the accordion settings directly instead of inside a Sheet drawer
- Make toggles (open to invitations, show pricing, allow mass messages) prominently visible at the top

#### 5. Improve Brand Dashboard Native Experience

**Problem**: Brand dashboard header is basic, navigation feels disconnected.

**Fix**: Add a proper sticky header with the brand name and a settings/account access button. Ensure all tabs render correctly within the padded content area.

**Files**: `src/pages/NativeBrandDashboard.tsx`

- Add account/settings access button in the header
- Add a notification bell icon in the header

#### 6. Sync Web and App Feature Parity

Ensure the native app tabs expose the same functionality as web:
- **Creator**: Overview, Bookings, Packages, Calendar, Opportunities, Messages, Boost, Profile -- all accessible via bottom nav (already done)
- **Brand**: Home, Messages, Bookings, Search -- plus access to Account/Settings via header icon

---

### Technical Details

**NativeAppGate profile completeness check** (most critical fix):
```typescript
// In refetchProfiles, expand the creator query:
.select('id, display_name, status, bio, categories')

// After fetching, determine if onboarding is needed:
const isCreatorProfileComplete = (profile) => {
  return profile.display_name && 
         profile.bio && 
         profile.categories?.length > 0;
};

// If profile exists but incomplete, show onboarding
if (creator && !isCreatorProfileComplete(creator)) {
  setShowOnboarding(true);
  return;
}
```

**Messages layout fix**:
```typescript
// Replace fixed inset-0 with relative layout
if (isNative) {
  return (
    <div 
      className="flex flex-col bg-background"
      style={{ 
        height: 'calc(100vh - 8rem)',  // Account for header + bottom nav
        paddingBottom: keyboardHeight > 0 ? keyboardHeight : 0 
      }}
    >
      {selectedConversation ? renderChatView() : renderConversationList()}
    </div>
  );
}
```

**Brand dashboard header with settings access**:
```tsx
<div className="sticky top-0 z-40 bg-background border-b px-4 py-3 safe-area-top flex items-center justify-between">
  <h1 className="text-lg font-bold truncate">{getTitle()}</h1>
  <div className="flex items-center gap-2">
    <button onClick={() => handleTabChange("notifications")}>
      <Bell className="h-5 w-5" />
    </button>
    <button onClick={() => handleTabChange("account")}>
      <Settings className="h-5 w-5" />
    </button>
  </div>
</div>
```

### Files to Modify
1. `src/components/NativeAppGate.tsx` -- Profile completeness enforcement
2. `src/components/creator-dashboard/MessagesTab.tsx` -- Fix native layout
3. `src/components/brand-dashboard/BrandMessagesTab.tsx` -- Fix native layout  
4. `src/pages/NativeBrandDashboard.tsx` -- Header improvements, account access
5. `src/pages/CreatorDashboard.tsx` -- Ensure proper native padding
6. `src/components/creator-dashboard/ProfileTab.tsx` -- Native-friendly profile editing

