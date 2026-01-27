

# Fix YAML Syntax Error in GitHub Actions Workflow

The GitHub Actions build is failing because of a YAML syntax error on line 49. The issue is with quote handling in the shell command.

## The Problem

Line 49 currently reads:
```yaml
run: echo "apply from: 'java17-override.gradle'" >> android/build.gradle
```

YAML is having trouble parsing the mixed single and double quotes within the command.

## The Fix

Use YAML's pipe (`|`) syntax for multi-line strings, which avoids quote parsing issues:

```yaml
- name: Apply Java 17 override
  run: |
    echo "apply from: 'java17-override.gradle'" >> android/build.gradle
```

The pipe (`|`) tells YAML to treat everything that follows as a literal string, preventing any quote interpretation issues.

## Files to Modify

| File | Change |
|------|--------|
| `.github/workflows/build-android.yml` | Change line 48-49 to use pipe syntax for the `run` command |

## What Happens After the Fix

1. Push the fix to GitHub
2. GitHub Actions will automatically retry the build
3. The build should now proceed past the YAML parsing step
4. After ~5-10 minutes, your APK will be available in GitHub Releases
5. The `/download` page will show the QR code for downloading

