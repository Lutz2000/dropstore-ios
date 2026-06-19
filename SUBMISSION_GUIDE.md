# DropStore iOS — App Store Submission Guide

## What Was Fixed

### Critical Bugs Fixed
1. **ChatListScreen.js** — Broken JSX syntax (`{verified && ...}` expressions inside JSX without a wrapper) — would crash on parse.
2. **ProfileScreen.js** — `user.profile_picture.startsWith(...)` without null check — crash when no picture set.
3. **ProfileScreen.js / VendorDashboardScreen.js** — `navigation.replace('Landing')` after logout crashes in vendor/buyer stacks where `Landing` doesn't exist. AppNavigator already reacts to auth state change.
4. **DeliveriesScreen.js** — Used `MaterialCommunityIcons` without importing it — crash.
5. **WishlistScreen.js** — Used `MaterialCommunityIcons` without importing it — crash.
6. **HomeScreen.js** — `navigation.navigate('Products', ...)` references a non-existent screen — crash.
7. **ProductDetailScreen.js** — `navigation.navigate('Landing')` in authenticated context where Landing is not in the stack — crash.
8. **All screens** — `navigation.replace('Login')` on 401 removed; `client.js` interceptor already handles token cleanup and logout reactively.
9. **LandingScreen.js** — `StatusBar backgroundColor` is Android-only; removed to prevent iOS warnings.

### iOS-Readiness Fixes (app.json)
- Added `NSPhotoLibraryUsageDescription` — required for photo picker
- Added `NSCameraUsageDescription` — required for camera access
- Added `NSMicrophoneUsageDescription`
- Added `ITSAppUsesNonExemptEncryption: false` — required or App Store will reject
- Added `expo-image-picker` plugin with permission strings
- Set `buildNumber: "1"` (required for iOS)
- Fixed bundle ID from `com.dropstore` → `com.dropstore.app` (Apple requires reverse-domain format)

### eas.json
- Added iOS `submit` profile with placeholder fields for App Store Connect
- Added `resourceClass: "m-medium"` for production iOS builds (Apple Silicon)

---

## Prerequisites

Before building, you need:
1. **Apple Developer Account** — $99/year at https://developer.apple.com
2. **EAS CLI** — `npm install -g eas-cli`
3. **Logged in** — `eas login` (use your Expo account)

---

## Step 1 — Configure App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **+** → **New App**
3. Fill in: Name = "DropStore", Bundle ID = `com.dropstore.app`, SKU = `dropstore`
4. Copy your **App ID** (numeric, shown in the URL) and **Team ID** (from https://developer.apple.com/account)
5. Update `eas.json` submit section:
   ```json
   "appleId": "your@email.com",
   "ascAppId": "1234567890",
   "appleTeamId": "ABCDE12345"
   ```

---

## Step 2 — Build for iOS

```bash
cd /path/to/mobile
npm install
eas build --platform ios --profile production
```

EAS will:
- Ask to create/link provisioning profiles and signing certificates (say **yes**)
- Build on Expo's cloud Mac servers (~15–25 min)
- Output a `.ipa` download link

---

## Step 3 — TestFlight (Recommended before App Review)

```bash
eas submit --platform ios --profile production
```

Then in App Store Connect → TestFlight → add your Apple ID as internal tester.

---

## Step 4 — Submit for App Review

In App Store Connect:
1. Fill in **App Information**: category = Shopping, age rating = 4+
2. Add **Screenshots** (required sizes: 6.5" iPhone and 5.5" iPhone)
3. Fill in **Privacy Policy URL** — required (can host at `dropstore.click/privacy`)
4. Set **Pricing** (Free)
5. Click **Submit for Review**

Review typically takes 1–3 days.

---

## App Store Metadata Suggestions

- **Category**: Shopping
- **Subtitle**: Uganda's Multi-Vendor Marketplace
- **Description**: Shop from verified vendors across Uganda. Browse thousands of products, make offers, chat with vendors, and get delivery to your door.
- **Keywords**: shopping, uganda, marketplace, vendors, delivery, e-commerce
- **Support URL**: https://dropstore.click
- **Privacy Policy URL**: https://dropstore.click/privacy

