

## iOS Build via GitHub Actions + TestFlight (No Mac Required)

### Overview
We'll create a GitHub Actions workflow that builds your iOS app on Apple's cloud infrastructure and uploads it to TestFlight. You'll install it on your iPhone using the free TestFlight app.

### Before I Can Create the Workflow — You Need to Do These Steps First

Since you don't have a Mac, you'll generate the signing certificate using OpenSSL (works on Windows, Linux, or even in a browser-based terminal).

#### Step 1: Generate a Certificate Signing Request (CSR) — No Mac Needed

Open any terminal (Command Prompt, PowerShell, or Linux terminal) and run:

```text
openssl req -nodes -newkey rsa:2048 -keyout ios_distribution.key -out CertificateSigningRequest.certSigningRequest -subj "/emailAddress=YOUR_EMAIL/CN=YOUR_NAME/C=US"
```

Replace `YOUR_EMAIL` and `YOUR_NAME` with your details. This creates two files:
- `ios_distribution.key` (your private key — keep this safe!)
- `CertificateSigningRequest.certSigningRequest` (upload this to Apple)

#### Step 2: Create Distribution Certificate in Apple Developer Portal

1. Go to **Certificates, IDs and Profiles** (from your screenshot)
2. Click **Certificates** in the left sidebar, then the **+** button
3. Select **Apple Distribution** and click Continue
4. Upload the `CertificateSigningRequest.certSigningRequest` file you just created
5. Download the resulting `.cer` file (e.g., `distribution.cer`)

#### Step 3: Convert Certificate to .p12

Back in your terminal, run:

```text
openssl x509 -in distribution.cer -inform DER -out distribution.pem -outform PEM
openssl pkcs12 -export -out ios_distribution.p12 -inkey ios_distribution.key -in distribution.pem -password pass:YOUR_PASSWORD
```

Replace `YOUR_PASSWORD` with a password you'll remember.

#### Step 4: Register Your App ID

1. Go to **Identifiers** in the left sidebar, click **+**
2. Select **App IDs** then **App**
3. Description: `Collab Hunts`
4. Bundle ID (Explicit): `app.lovable.f0d3858ae7f2489288d232504acaef78`
5. Enable **Push Notifications** under Capabilities
6. Click Continue then Register

#### Step 5: Create a Provisioning Profile

1. Go to **Profiles** in the left sidebar, click **+**
2. Select **App Store Connect** (under Distribution)
3. Select your App ID (`Collab Hunts`)
4. Select your Distribution Certificate
5. Name it `CollabHunts AppStore`
6. Download the `.mobileprovision` file

#### Step 6: Create an App in App Store Connect

1. Go to **App Store Connect** (from your screenshot, top left)
2. Click **Apps** then the **+** button, select **New App**
3. Platform: **iOS**
4. Name: `Collab Hunts`
5. Bundle ID: select the one you registered
6. SKU: `collabhunts`
7. Click **Create**

#### Step 7: Generate an App-Specific Password

1. Go to https://appleid.apple.com
2. Sign in, go to **App-Specific Passwords**
3. Generate one named `GitHub Actions`
4. Save the password

#### Step 8: Add Secrets to GitHub

Go to your GitHub repo, then **Settings** then **Secrets and variables** then **Actions**, and add these secrets:

| Secret Name | Value |
|---|---|
| `IOS_CERTIFICATE_BASE64` | Run `base64 -i ios_distribution.p12` and paste the output |
| `IOS_CERTIFICATE_PASSWORD` | The password you set in Step 3 |
| `IOS_PROVISION_PROFILE_BASE64` | Run `base64 -i CollabHunts_AppStore.mobileprovision` and paste the output |
| `APPLE_TEAM_ID` | Found in Apple Developer account under Membership (10-character ID) |
| `APPSTORE_CONNECT_USERNAME` | Your Apple ID email |
| `APPSTORE_CONNECT_PASSWORD` | The app-specific password from Step 7 |

### What I Will Build

**New file: `.github/workflows/build-ios.yml`**

A GitHub Actions workflow using `runs-on: macos-latest` that:

1. Checks out the code
2. Sets up Node.js 22
3. Installs dependencies
4. Creates the `.env` file with backend credentials
5. Builds the web app (`npm run build`)
6. Adds the iOS platform (`npx cap add ios`)
7. Generates native icons and splash screens from `public/app-icon.png`
8. Forces the app name to "Collab Hunts" in the iOS `Info.plist`
9. Syncs Capacitor (`npx cap sync ios`)
10. Imports the signing certificate and provisioning profile from GitHub Secrets
11. Builds the `.ipa` using `xcodebuild`
12. Uploads the `.ipa` to TestFlight using `xcrun altool`

### How You'll Test on Your iPhone

1. Download the **TestFlight** app from the App Store on your iPhone
2. Once the GitHub Actions build completes and uploads, you'll get an email from Apple
3. Open TestFlight on your iPhone and tap **Install** next to Collab Hunts
4. The app will install and work just like a native app

### Files Modified
- **New**: `.github/workflows/build-ios.yml` — iOS build and TestFlight upload workflow

### Next Steps After Approval
Once you confirm you've completed Steps 1-8 above and the GitHub Secrets are in place, I'll create the workflow file. Then the next push to `main` will trigger both Android APK and iOS TestFlight builds automatically.

