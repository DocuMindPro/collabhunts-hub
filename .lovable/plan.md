

# Fix Announcement Banner Save - Auth Session Issue

## Root Cause

The console shows `Auth state changed: INITIAL_SESSION undefined`, meaning the authentication session is not always properly established when the page loads. Combined with this, the CORS error on `auth-bridge` can intermittently prevent session initialization.

When the user clicks "Save Banner Settings", if `auth.uid()` is null (no active session), the RLS policy silently filters out the upsert -- no error is thrown, but 0 rows are affected. The current code has a check for this, but the error message is generic and doesn't help the user recover.

## Changes

### 1. `src/components/admin/AdminAnnouncementsTab.tsx`

- **Check auth session before saving**: Before attempting the upsert, verify the user has an active session. If not, show a clear error asking them to re-login.
- **Switch from `upsert` to `update`**: Since these rows already exist in the database, use `.update()` with `.eq("key", key)` instead of `upsert`. This is simpler, more predictable, and avoids the INSERT+UPDATE RLS complexity.
- **Add better error feedback**: Show specific error messages when save fails due to auth or permission issues.

```typescript
const saveBannerSettings = async () => {
  setIsSavingBanner(true);
  try {
    // Verify auth session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("You must be logged in to save settings. Please refresh and log in again.");
      return;
    }

    const updates = [
      { key: "announcement_enabled", value: bannerEnabled.toString() },
      { key: "announcement_text", value: bannerText },
      { key: "announcement_link", value: bannerLink },
      { key: "announcement_style", value: bannerStyle },
    ];

    for (const { key, value } of updates) {
      const { data, error } = await supabase
        .from("site_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Save failed - you may not have admin permissions");
      }
    }

    toast.success("Announcement banner settings saved!");
  } catch (error: any) {
    console.error("Error saving banner settings:", error);
    toast.error(error.message || "Failed to save banner settings");
  } finally {
    setIsSavingBanner(false);
  }
};
```

### Key Differences from Current Code

| Aspect | Current | Fixed |
|--------|---------|-------|
| Auth check | None | Verifies session before save |
| DB operation | `upsert` with `onConflict` | `update` with `.eq("key", key)` |
| Error message | Generic toast | Specific auth/permission messages |

## Why This Fixes It

1. **Auth check first**: Prevents silent failures when the session is expired or not initialized
2. **`update` instead of `upsert`**: Avoids the complex INSERT+UPDATE RLS interaction. Since the announcement rows already exist in the database, a direct UPDATE is simpler and only needs the UPDATE RLS policy to pass
3. **Better error handling**: Shows the actual error message so the user knows what went wrong

