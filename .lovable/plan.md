

## Fix: YAML Indentation Error in Export IPA Step

### What happened
The workflow file has a YAML syntax error on line 118. The plist XML content inside the heredoc starts at column 0 (no indentation), which breaks the YAML `run: |` block parser. YAML requires all lines within a multiline scalar block to maintain consistent indentation.

### Root Cause
When writing the heredoc, the XML content was placed at the start of each line (column 0) to produce valid XML output. However, this breaks YAML parsing because the `run: |` block expects all content to be indented under it.

### Fix
Indent the entire heredoc content (XML lines and the closing `PLISTEOF` marker) to align with the rest of the `run:` block (10 spaces). The heredoc itself does not care about indentation — `cat` will write the content as-is, and any leading spaces are acceptable in XML/plist files.

### Changes to `.github/workflows/build-ios.yml`

Indent lines 118-141 so that:
- All XML lines inside the heredoc have 10 spaces of indentation (matching the `cat` command)
- The closing `PLISTEOF` marker also has 10 spaces of indentation

### Technical Detail
In YAML `|` blocks, indentation is stripped based on the first content line. So as long as all content lines share the same base indentation, the YAML parser is happy. The heredoc delimiter (`PLISTEOF`) just needs to match exactly when `cat` reads it — leading spaces before `PLISTEOF` would normally cause issues with unquoted heredocs, but since we use `<< 'PLISTEOF'` (quoted), the closing delimiter must match exactly including any whitespace.

To avoid the delimiter matching issue, the safest approach is to write the plist content using `echo` or `printf` commands instead of a heredoc, or use `cat` with a redirect and multiple echo statements. Alternatively, we can keep the heredoc but ensure the closing marker is at column 0 while indenting the `cat` command differently.

**Revised approach**: Use `cat` with the heredoc where only the opening command is indented, the content and closing tag are at column 0, but wrap them in a way YAML accepts. The cleanest solution is to use a **block scalar with a strip indicator** and write the file using `printf` instead:

```yaml
      - name: Export IPA
        env:
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: |
          cat > $RUNNER_TEMP/ExportOptions.plist << 'PLISTEOF'
          <?xml version="1.0" encoding="UTF-8"?>
          <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
          <plist version="1.0">
          <dict>
            <key>method</key>
            <string>app-store-connect</string>
            <key>teamID</key>
            <string>TEAM_PLACEHOLDER</string>
            <key>signingStyle</key>
            <string>manual</string>
            <key>signingCertificate</key>
            <string>Apple Distribution</string>
            <key>provisioningProfiles</key>
            <dict>
              <key>app.lovable.f0d3858ae7f2489288d232504acaef78</key>
              <string>PP_PLACEHOLDER</string>
            </dict>
            <key>uploadSymbols</key>
            <true/>
            <key>destination</key>
            <string>upload</string>
          </dict>
          </plist>
          PLISTEOF

          # Replace placeholders with actual values
          sed -i "s|TEAM_PLACEHOLDER|$APPLE_TEAM_ID|g" $RUNNER_TEMP/ExportOptions.plist
          sed -i "s|PP_PLACEHOLDER|$PP_NAME|g" $RUNNER_TEMP/ExportOptions.plist

          xcodebuild -exportArchive \
            -archivePath $RUNNER_TEMP/App.xcarchive \
            -exportOptionsPlist $RUNNER_TEMP/ExportOptions.plist \
            -exportPath $RUNNER_TEMP/export
```

All heredoc lines (including the XML and the closing `PLISTEOF`) are indented with 10 spaces to satisfy YAML. The leading whitespace in the plist file is harmless — XML parsers ignore it. The `PLISTEOF` closing tag must also be indented to exactly match.

### No new secrets or dependencies needed
This is purely an indentation/formatting fix.

