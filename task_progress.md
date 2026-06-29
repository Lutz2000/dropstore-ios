# DropStore iOS - Fix Checklist

- [x] Audit all files for bugs and issues
- [ ] Fix CRITICAL: VendorDashboardScreen.js - Duplicate `const styles` causing parse error
- [ ] Fix CRITICAL: ProfileScreen.js - Vendor `navigation.navigate('MyOffers')` crash (vendor stack has 'VendorOffers')
- [ ] Fix CRITICAL: ChatListScreen.js - `alert()` used instead of `Alert.alert()` (undefined in React Native)
- [ ] Fix HIGH: VendorApplyScreen.js - Broken unicode characters in UI labels
- [ ] Fix: app.json version/buildNumber consistency
- [ ] Verify: All imports are correct across all files
- [ ] Run `npx expo start --web` to verify no bundle errors
- [ ] Run TypeScript check
- [ ] Final verification

Task progress will be updated after each fix.
