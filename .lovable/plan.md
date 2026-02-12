

## Clean Up Native Login Screen Branding

Remove the redundant "CollabHunts" text heading and the "Creators & Brands" tagline from the sign-in screen, keeping only the logo (which already represents the app identity).

### Change

**File: `src/pages/NativeLogin.tsx`**

On the sign-in view (lines 461-462), remove these two lines:
```
<h1 className="text-2xl font-bold text-foreground mb-1">CollabHunts</h1>
<p className="text-muted-foreground mb-8">Creators & Brands</p>
```

And adjust the logo's bottom margin from `mb-8` to `mb-10` (line 458-460) so spacing still looks good without the text.

### Technical Details

- **File modified**: `src/pages/NativeLogin.tsx`
- Lines 458-462 updated: remove the `h1` and `p` elements, adjust `NativeAppLogo` wrapper margin
- No other screens affected -- the role-select and signup views don't have this duplicate text

