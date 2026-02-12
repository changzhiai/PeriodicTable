# deploy_ios.md

## Deploying to iOS (App Store / TestFlight)

This guide covers the process of building, syncing, and deploying the iOS version of the Periodic Table app.

### Prerequisites

- macOS (required for Xcode)
- Xcode installed (latest version recommended)
- Apple Developer Account (for App Store distribution)
- CocoaPods (`sudo gem install cocoapods`)

### 1. Build the Web Assets

First, build the React app for mobile production. This ensures the base path is set correctly (`./`) for the Capacitor web view.

```bash
npm run build:mobile
```

### 2. Sync with Capacitor

Copy the built web assets (`dist` folder) to the native iOS project wrapper.

```bash
npx cap sync ios
```

### 3. Open in Xcode

Open the native iOS project in Xcode.

```bash
npx cap open ios
```

### 4. Configure Signing & Capabilities

1. In Xcode, click on the **App** project in the left navigator.
2. Select the **App** target.
3. Go to the **Signing & Capabilities** tab.
4. Select your **Team** (Apple Developer Account).
5. Ensure the **Bundle Identifier** is unique (e.g., `com.changzhiai.periodictable`) and registered in your Apple Developer account.

### 5. Update App Icons and Splash Screen

Capacitor Assets tool can generate icons and splash screens for you.

1. Ensure you have `logo.png` (1024x1024) in your `assets` folder or root.
2. Run the asset generation command:

```bash
npx capacitor-assets generate --ios
```

### 6. Test on Simulator or Device

- **Simulator**: Select a simulator (e.g., iPhone 15 Pro) from the top bar and click the **Run** (Play) button.
- **Real Device**: Connect your iPhone via USB, select it as the destination, and click **Run**. You may need to trust your developer certificate in iOS Settings > General > VPN & Device Management.

### 7. Archive and Upload to App Store Connect

1. Select **Any iOS Device (arm64)** as the build destination.
2. Go to **Product** > **Archive**.
3. Once the archive is created, the Organizer window will open.
4. Click **Distribute App**.
5. Select **App Store Connect** and follow the prompts (Upload).
6. Once uploaded, proceed to [App Store Connect](https://appstoreconnect.apple.com/) to configure your app listing and submit for review or release to TestFlight.
