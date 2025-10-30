# Smart Farmer Web Guide

To run the Smart Farmer application in web mode, follow these instructions:

## Web Development Mode

The Smart Farmer application is primarily designed for mobile platforms with features like disease detection using the camera, offline access via SQLite, and more. However, for development and testing purposes, we've created a simplified web version.

## Running the Web Version

1. **Use the web script:**
   ```bash
   npm run web
   ```
   This will:
   - Switch to a web-compatible version of the app
   - Start Expo with web support
   - Open a browser window with the web version running

2. **Development with tunnel mode:**
   ```bash
   npm run dev
   ```
   This enables both web support and tunnel mode for testing across multiple devices.

## Switching Back to Mobile Development

To return to full mobile development mode:

```bash
npm run native
```

This will restore the original App.js with all mobile features.

## Web Limitations

The web version has several limitations:

1. **Missing Native Features**: Camera, filesystem access, and some device-specific features are not available
2. **Limited UI Components**: Some React Native components don't work the same on web
3. **Navigation Differences**: Some navigation patterns might behave differently
4. **Asset Loading**: Some assets may need web-specific versions

## Troubleshooting Web Mode

If you encounter issues with the web version:

1. **Missing Dependencies**: Ensure you have installed all web dependencies:
   ```bash
   npx expo install react-native-web@~0.18.10 react-dom@18.2.0 @expo/webpack-config@^18.0.1
   ```

2. **React Navigation Issues**: Install any missing navigation packages:
   ```bash
   npm install @react-navigation/native-stack
   ```

3. **Asset Errors**: Create placeholder assets in the correct directories or modify code to handle missing assets

4. **Reanimated Compatibility**: Some animations may not work properly in web mode