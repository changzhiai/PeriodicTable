# Mobile Deployment (iOS/Android)

To build the application for mobile devices (iOS/Android via Capacitor), use the following command:

```bash
npm run build:mobile
```

This ensures the correct base path (`./`) is used for local file access within the app wrapper. Once built, sync the changes to the native projects:

```bash
npx cap sync
```

Then open the native project:

```bash
npx cap open ios
# or
npx cap open android
```
