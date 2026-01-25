

# Fix NPM Dependency Conflict

## The Problem
Your build is failing because of a **version conflict** between two packages:

| Package | Current Version | Required Version |
|---------|-----------------|------------------|
| `date-fns` | 4.1.0 | 2.28.0 - 3.x |
| `react-day-picker` | 8.10.1 | Needs date-fns 2.x or 3.x |

The `date-fns` version 4.x is too new and isn't compatible with `react-day-picker` 8.10.1.

## The Solution
Downgrade `date-fns` from version 4.1.0 to version 3.6.0 (the latest 3.x version that's compatible).

## What I'll Change

### 1. Update `package.json`
Change line 56 from:
```json
"date-fns": "^4.1.0",
```
To:
```json
"date-fns": "^3.6.0",
```

## After My Change - Your Steps

Once I make this fix:

### Step 1: Delete your local project folder again
```cmd
cd C:\Users\elias\Desktop
rd /s /q collabhunts-hub
```

### Step 2: Clone fresh from GitHub
```cmd
git clone https://github.com/eliasnau/collabhunts-hub.git
cd collabhunts-hub
```

### Step 3: Run the build script
```cmd
scripts\build-android.bat
```

This time npm install should succeed because the dependency conflict will be resolved!

## Technical Details

- **Why version 3.6.0?**: It's the latest version in the 3.x series that's compatible with react-day-picker 8.x
- **Any code changes needed?**: No - the date-fns API between 3.x and 4.x is mostly the same, so your existing code will continue to work

