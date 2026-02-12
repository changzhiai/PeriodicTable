# deploy_android.md

## Deploying to Android (Play Store / APK)

This guide covers the process of building, syncing, and deploying the Android version of the Periodic Table app.

### Prerequisites

- Android Studio (required, includes Android SDK)
- Java 11 or 17 (recommended for Gradle build tools)
- Android SDK Platform-Tools

### 1. Build the Web Assets

First, build the React app for mobile production. This ensures the base path is set correctly (`./`) for the Capacitor web view.

```bash
npm run build:mobile
```

### 2. Sync with Capacitor

Copy the built web assets (`dist` folder) to the native Android project wrapper.

```bash
npx cap sync android
```

### 3. Open in Android Studio

Open the native Android project in Android Studio.

```bash
npx cap open android
```

### 4. Configure Signing

1. In Android Studio, go to **Build** > **Generate Signed Bundle / APK...** (or Configure keystores).
2. Choose **Android App Bundle** (AAB) for Play Store uploads, or **APK** for direct distribution.
3. Follow the wizard to create a new keystore or select an existing one. **Keep your keystore file and alias/password safe!** If you lose it, you cannot update your app on the Play Store.

### 5. Update App Icons and Splash Screen

Capacitor Assets tool can generate icons and splash screens.

1. Ensure you have `logo.png` (1024x1024) in your `assets` folder or root.
2. Run the asset generation command:

```bash
npx capacitor-assets generate --android
```

### 6. Test on Emulator or Device

- **Emulator**: Select a pixel device from the dropdown and click the **Run** (Play) button.
- **Real Device**: Connect your Android phone via USB, ensure USB Debugging is ON (Developer Options), select it as the destination, and click **Run**.

### 7. Build for Release

Before building the release bundle/APK, make sure your Gradle files have the correct `versionCode` and `versionName`.

1. Go to **Build** > **Generate Signed Bundle / APK...**.
2. Select **Android App Bundle**.
3. Point to your keystore.
4. Select the release variant (usually `release`).
5. Click **Create** or **Finish**.
6. Once built, verify the correct AAB file (`app-release.aab`) in `android/app/release/`.
7. Upload this `.aab` file to [Google Play Console](https://play.google.com/console/) to create a new release (Production, Open Testing, or Internal Testing).
