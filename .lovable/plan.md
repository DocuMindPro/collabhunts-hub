

# Remove Live PK Battle & Rethink Custom Experience in Creator Package Selection

## Summary

Based on the analysis, we need to:
1. **Remove "Live PK Battle"** from the Add Package dropdown - this is a platform-managed event, not something creators self-add
2. **Keep "Custom Experience"** but improve how it works for creators

---

## Reasoning

### Live PK Battle Should Be Removed
- Per project memory: "Live PK Battle" requires consultation with CollabHunts team
- It's a ticketed event managed by the platform with multiple creators
- Creators participate when invited, they don't self-list availability
- The current UI (showing it in dropdown) is misleading

### Custom Experience Should Stay (With Better UX)
- Makes sense for creators: "I'm open to custom/tailored work"
- Signals flexibility to brands who want something unique
- However, it needs a better description in the dialog to clarify what it means

---

## Changes Required

### File: `src/components/creator-dashboard/ServiceEditDialog.tsx`

#### Change 1: Update available packages filter (line 84)
```tsx
// Before
const mainPackages = ['unbox_review', 'social_boost', 'meet_greet', 'competition', 'custom'];

// After  
const mainPackages = ['unbox_review', 'social_boost', 'meet_greet', 'custom'];
```

#### Change 2: Remove PK Battle from icon and name maps (lines 42-56)
Remove the `competition` entries from `PACKAGE_ICONS` and `PACKAGE_NAMES` since creators won't be adding this package.

#### Change 3: Remove PK Battle-specific logic (lines 68, 124, 132, 248, 272-283, 300, 320)
Clean up the `isPKBattle` variable and all conditional logic that references it since this package type will no longer be available.

#### Change 4: Improve Custom Experience explanation
Update the notice shown for Custom Experience (line 279) to be more helpful:

```tsx
{isCustom && (
  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
    <p className="font-medium mb-1">🎨 How Custom Experience Works</p>
    <p className="text-muted-foreground">
      By enabling this, you're telling brands you're open to unique collaborations 
      beyond standard packages. Brands will message you to discuss ideas, and you'll 
      negotiate terms together.
    </p>
  </div>
)}
```

---

## Result

| Package | Before | After |
|---------|--------|-------|
| Unbox & Review | Available | Available |
| Social Boost | Available | Available |
| Meet & Greet | Available | Available |
| Live PK Battle | Available | **Removed** |
| Custom Experience | Available | Available (improved description) |

---

## Technical Details

### Lines to Modify in `ServiceEditDialog.tsx`:
- **Line 46**: Remove `competition: <Swords className="h-5 w-5" />`
- **Line 54**: Remove `competition: "Live PK Battle"`
- **Line 68**: Remove `const isPKBattle = serviceType === "competition";`
- **Line 84**: Remove `'competition'` from `mainPackages` array
- **Lines 124, 132**: Remove `!isPKBattle &&` conditions (only check `!isCustom`)
- **Lines 248**: Update condition to just `!isCustom`
- **Lines 272-283**: Simplify to only show Custom Experience notice
- **Line 300**: Remove `!isPKBattle` condition
- **Line 320**: Remove PK Battle-specific label text

### Import cleanup:
- Remove `Swords` from lucide-react imports (line 15)

