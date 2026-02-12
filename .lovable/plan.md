

## Upgrade GitHub Actions Release Step to v2

A single-line change in `.github/workflows/build-android.yml` to upgrade the release action for better reliability and retry handling.

### Change

**File: `.github/workflows/build-android.yml`**

Update the release step from:
```yaml
uses: softprops/action-gh-release@v1
```
to:
```yaml
uses: softprops/action-gh-release@v2
```

This resolves the transient `ECONNREFUSED` failures seen in recent builds by leveraging v2's improved network retry logic.

