# DropStore iOS App

A React Native / Expo app for the DropStore marketplace — ported and optimised for iOS.

---

## What changed from the Android version

| Area | Android original | iOS version |
|------|-----------------|-------------|
| `app.json` | Android permissions, `edgeToEdgeEnabled`, no iOS entitlements | Full iOS `infoPlist` (camera, photos, location, FaceID), `usesNonExemptEncryption: false`, Associated Domains |
| `eas.json` | APK / AAB only profiles | Added `simulator` profile, `m-medium` resource class, App Store Connect submit config |
| `babel.config.js` | Missing Reanimated plugin | Added `react-native-reanimated/plugin` (required for iOS) |
| `StatusBar` | Used `backgroundColor` (Android-only) | Wrapped with `Platform.OS === 'android'` guard |
| `KeyboardAvoidingView` | `height` behavior | Already used `Platform.OS === 'ios' ? 'padding' : 'height'` ✓ |
| Line endings | Windows CRLF | Unix LF |

---

## Prerequisites

- **macOS** with Xcode 15+ (for local builds) — or use EAS cloud builds from any OS
- **Node.js** 18+
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI**: `npm install -g eas-cli`
- An **Apple Developer account** ($99/year) to sign and distribute

---

## Quick start (Expo Go — no Apple account needed)

```bash
npm install
npx expo start
# Press 'i' to open iOS Simulator, or scan QR with Expo Go on your iPhone
```

---

## Build for TestFlight / App Store

### 1. Log in to EAS

```bash
eas login
```

### 2. Configure your Apple credentials

Edit `eas.json` → `submit.production.ios`:

```json
{
  "appleId": "your-apple-id@example.com",
  "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
  "appleTeamId": "YOUR_APPLE_TEAM_ID"
}
```

Find your **Team ID** at [developer.apple.com](https://developer.apple.com) → Membership.  
Find your **App ID** in [App Store Connect](https://appstoreconnect.apple.com) after creating the app listing.

### 3. Build for simulator (free, no Apple account)

```bash
npm run build:ios:simulator
```

### 4. Build for TestFlight (requires Apple Developer account)

```bash
npm run build:ios
```

EAS handles provisioning profiles and signing certificates automatically.

### 5. Submit to App Store

```bash
npm run submit:ios
```

---

## App Store checklist

Before submitting, make sure you have:

- [ ] App icon (1024×1024 PNG, no alpha) — place at `assets/icon.png`
- [ ] Splash screen image — `assets/splash-icon.png`
- [ ] Screenshots for 6.7" iPhone, 6.1" iPhone, and 12.9" iPad (if tablet support enabled)
- [ ] Privacy policy URL (required — DropStore collects user data)
- [ ] Age rating set in App Store Connect (likely 4+ or 12+)
- [ ] `usesNonExemptEncryption: false` already set in `app.json` ✓
- [ ] All `NSXxxUsageDescription` strings are filled in `app.json` ✓

---

## Project structure

```
dropstore-ios/
├── App.js                        # Root: chat FAB, WhatsApp FAB, AuthProvider
├── index.js                      # Expo entry point
├── app.json                      # Expo / iOS / Android config
├── eas.json                      # EAS Build & Submit profiles
├── babel.config.js               # Reanimated plugin included
├── package.json
├── assets/                       # App icons, splash, images
├── logo/                         # DropStore logo files
└── src/
    ├── api/
    │   ├── client.js             # Axios instance, token interceptors
    │   └── cache.js              # In-memory API cache
    ├── constants/
    │   └── theme.js              # COLORS, FONTS, SIZES
    ├── context/
    │   └── AuthContext.js        # Auth state, login/register/logout
    ├── hooks/
    │   └── useApiData.js         # Generic data-fetching hook
    ├── navigation/
    │   └── AppNavigator.js       # Stack + Tab navigators (buyer / vendor)
    └── screens/
        ├── HomeScreen.js
        ├── ProductDetailScreen.js
        ├── CartScreen.js
        ├── WishlistScreen.js
        ├── DeliveriesScreen.js
        ├── ChatListScreen.js
        ├── ChatScreen.js
        ├── BuyerOffersScreen.js
        ├── OfferChatScreen.js
        ├── ProfileScreen.js
        ├── LoginScreen.js
        ├── RegisterScreen.js
        ├── LandingScreen.js
        ├── SplashScreen.js
        ├── AboutScreen.js
        ├── PoliciesScreen.js
        ├── SystemUnderReviewScreen.js
        └── vendor/
            ├── VendorDashboardScreen.js
            ├── VendorProductsScreen.js
            ├── VendorApplyScreen.js
            ├── VendorSubscriptionScreen.js
            ├── VendorOffersScreen.js
            ├── VendorNotificationsScreen.js
            ├── VendorPremiumPackagesScreen.js
            └── VendorPremiumDashboardScreen.js
```

---

## API configuration

The API URL is set in `app.json` → `extra.apiUrl`:

```json
"extra": {
  "apiUrl": "https://dropstore.click/public/api"
}
```

For local development, `src/api/client.js` falls back to a hardcoded LAN IP. Update `DEV_URL` in that file for your local backend.

---

## Troubleshooting

**"Metro bundler can't find module"** → Run `npm install` then `npx expo start --clear`

**"Reanimated: Animated node with tag X does not exist"** → Make sure `react-native-reanimated/plugin` is in `babel.config.js` (already done ✓) and restart Metro with `--clear`

**Image picker crash on iOS** → All `NSPhotoLibraryUsageDescription` / `NSCameraUsageDescription` keys are in `app.json` ✓. Rebuild after any `app.json` change.

**Build fails with "Missing push notification entitlement"** → Not needed for this app. If EAS adds it automatically, remove it in App Store Connect under the app's capabilities.
