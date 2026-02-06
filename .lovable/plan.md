

# Fix: Brand Signup Button Disabled Despite All Fields Filled

## Root Cause

The "Create Brand Account" button has this disabled condition:

```
disabled={isLoading || !phoneVerified || !termsAccepted}
```

It always requires `phoneVerified === true`, ignoring the `requirePhone` setting. When phone verification is disabled for testing, the button should not require phone verification.

## Fix in `src/pages/BrandSignup.tsx`

### 1. Button disabled condition (line ~387)

Change:
```tsx
disabled={isLoading || !phoneVerified || !termsAccepted}
```
To:
```tsx
disabled={isLoading || (requirePhone && !phoneVerified) || !termsAccepted}
```

### 2. Submit handler guard (line ~157)

Already correct -- it checks `requirePhone && !phoneVerified`. No change needed.

### 3. Helper text below button (line ~393)

Change:
```tsx
{(!phoneVerified || !termsAccepted) && (
  <p>
    {!phoneVerified ? "Phone verification required" : "Please accept Terms of Service"}
  </p>
)}
```
To:
```tsx
{((requirePhone && !phoneVerified) || !termsAccepted) && (
  <p>
    {requirePhone && !phoneVerified ? "Phone verification required" : !termsAccepted ? "Please accept Terms of Service" : ""}
  </p>
)}
```

## Result

When phone verification is disabled (testing mode), the button enables as soon as all fields are filled and terms are accepted. When phone verification is enabled (production), behavior stays the same.

