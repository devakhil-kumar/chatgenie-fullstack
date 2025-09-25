# ChatGenie Mobile App Setup Instructions

## Required Packages Installation

You need to install the following packages for the ChatGenie mobile app to work properly:

### Critical Missing Packages (Install These First)
```bash
# AsyncStorage for Redux persist
npm install @react-native-async-storage/async-storage

# Bottom Tab Navigator
npm install @react-navigation/bottom-tabs

# Icons (new per-family approach)
npm install @react-native-vector-icons/ionicons

# HTTP Client
npm install axios

# Socket.io for real-time chat
npm install socket.io-client
```

### Additional Navigation Packages (if using gestures)
```bash
npm install react-native-gesture-handler react-native-reanimated
```

### Socket.io for Real-time Chat
```bash
npm install socket.io-client
```

### HTTP Client
```bash
npm install axios
```

### Additional Utilities (Optional but recommended)
```bash
npm install react-native-image-picker react-native-permissions
npm install react-native-keyboard-aware-scroll-view
npm install react-native-fast-image
```

## Platform Setup

### iOS Setup
1. Install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

2. The vector icons are already configured in Info.plist with the Ionicons font.

### Android Setup
1. The vector icons are configured via autolinking (no manual setup required)
2. Clean and rebuild if you encounter icon issues:
```bash
npx react-native clean
npx react-native run-android
```

### Vector Icons Setup (New per-family approach)
The app now uses the new `@react-native-vector-icons/ionicons` approach:
- ✅ No need for manual font copying
- ✅ Autolinking handles everything
- ✅ iOS Info.plist already configured
- ✅ Android fonts directory created

### SafeAreaView Migration
- ✅ All screens now use `react-native-safe-area-context`
- ✅ App.jsx wrapped with `<SafeAreaProvider>`
- ✅ No deprecated React Native SafeAreaView imports

## File Structure Created

```
src/
├── components/
│   ├── common/
│   ├── layout/
│   ├── chat/
│   ├── auth/
│   ├── profile/
│   ├── payments/
│   ├── referral/
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── LoadingSpinner.jsx
│       ├── Avatar.jsx
│       └── Card.jsx
├── screens/
│   ├── auth/
│   │   ├── WelcomeScreen.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── OTPScreen.jsx
│   │   ├── RegisterScreen.jsx
│   │   └── ForgotPasswordScreen.jsx
│   ├── chat/
│   │   └── ChatListScreen.jsx
│   ├── profile/
│   ├── payments/
│   ├── referral/
│   └── dashboard/
├── navigation/
│   ├── AppNavigator.jsx
│   ├── AuthNavigator.jsx
│   └── MainNavigator.jsx
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── chatService.js
│   ├── userService.js
│   └── socketService.js
├── store/
│   ├── index.js
│   └── slices/
│       ├── authSlice.js
│       ├── chatSlice.js
│       ├── userSlice.js
│       └── uiSlice.js
├── hooks/
├── utils/
├── constants/
│   └── index.js
├── types/
├── styles/
└── assets/
    ├── images/
    └── icons/
```

## Features Implemented

### ✅ Redux Toolkit Setup
- Complete store configuration with persistence
- Auth, Chat, User, and UI slices
- Async thunks for API calls

### ✅ Navigation System
- Stack navigation for auth flow
- Tab navigation for main app
- Nested navigators for different sections

### ✅ API Service Layer
- Axios configuration with interceptors
- Token refresh handling
- Service modules for different features

### ✅ Reusable UI Components
- Button with multiple variants
- Input with validation and icons
- Avatar with online status
- Loading spinner
- Card component

### ✅ Authentication Screens
- Welcome screen
- Login with OTP
- OTP verification
- Registration form
- Forgot password

### ✅ Chat Foundation
- Chat list screen
- Real-time socket service
- Message handling structure

## Next Steps (Packages you'll need to install based on usage)

1. **For AI Features:**
   ```bash
   npm install react-native-elements
   ```

2. **For Image/Media Handling:**
   ```bash
   npm install react-native-image-crop-picker
   npm install react-native-document-picker
   ```

3. **For Payments:**
   ```bash
   npm install @stripe/stripe-react-native
   ```

4. **For Push Notifications:**
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/messaging
   ```

5. **For Contact Integration:**
   ```bash
   npm install react-native-contacts
   ```

## Important Notes

1. **Logo Asset**: Add your logo image to `src/assets/images/logo.png`
2. **API URL**: Update the BASE_URL in `src/services/api.js` to match your backend
3. **Socket URL**: Update socket connection URL in `src/services/socketService.js`
4. **Bundle ID**: Make sure to update bundle IDs in iOS and Android configs

## Ready to Use

The structure is now ready for:
- Authentication flow
- Chat functionality
- Real-time messaging
- AI integration
- Payment processing
- Referral system

All screens and services are properly connected with Redux for state management.