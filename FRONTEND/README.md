# Smart Farmer Frontend

The frontend application for Smart Farmer - an application designed to help farmers detect crop diseases, access expert advisory content, and connect with other farmers.

## Features

- **Disease Detection**: Take photos of crops to detect diseases using AI
- **Advisory Content**: Access expert advice on farming practices
- **Community Groups**: Connect with other farmers to share knowledge
- **Offline Mode**: Access core features even without internet connection
- **Multi-language Support**: Available in English and Swahili
- **Dark/Light Theme**: Customize app appearance

## Tech Stack

- **React Native with Expo**: Cross-platform mobile development
- **SQLite**: Local database for offline functionality
- **Context API**: State management across the app
- **JWT Authentication**: Secure user authentication
- **i18next**: Internationalization for multiple languages
- **React Navigation**: App navigation structure with drawer, stack, and tabs

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/smart-farmer.git
cd FRONTEND
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Use the Expo Go app on your device or an emulator to test the application.

### Testing on Web Browser

You can also run the app in a web browser for easier debugging and testing. 

⚠️ **IMPORTANT: The Smart Farmer app uses many native mobile features and may have limited functionality in web mode.**

For the best web experience, follow these steps:

1. First time setup (install web dependencies if you haven't already):
```bash
npx expo install react-native-web@~0.18.10 react-dom@18.2.0 @expo/webpack-config@^18.0.1
```

2. Run the web version:
```bash
# In PowerShell:
cd "C:\Users\eacha\OneDrive\Desktop\SMART FARMER\FRONTEND"
npx expo start --web
```

This will open a simplified version of the app in your browser at http://localhost:19006.

### Multi-Platform Development

For simultaneous development on multiple platforms, we've created custom scripts:

```bash
# Start with tunnel mode for device connectivity 
# (for testing on physical devices when direct network connection fails)
npx expo start --tunnel

# Start with both web and tunnel support
npx expo start --web --tunnel
```

**Web Limitations:**
- Camera and image processing features are limited
- Some UI components may render differently
- Native modules (SQLite, file system) aren't fully supported
- Assets may need to be placed in web-compatible locations

See the [WEB.md](./WEB.md) file for detailed information about web development.

Benefits of web testing:
- Faster refresh and development cycle
- Browser developer tools for debugging
- No need to worry about device connectivity issues
- Easily test responsive design by resizing the browser window

Note: Some native features may not work in the web version, and there may be some UI differences.

## ADB (Android Debug Bridge) Tutorial

ADB is a versatile command-line tool that lets you communicate with and control an Android device connected to your computer. This is essential for testing and debugging the Smart Farmer application.

### Installing ADB

1. Create a directory for Android SDK tools:
```bash
mkdir %USERPROFILE%\android-sdk-tools
```

2. Download the latest Android SDK Platform Tools:
```powershell
# Using PowerShell
Invoke-WebRequest -Uri "https://dl.google.com/android/repository/platform-tools-latest-windows.zip" -OutFile "$env:USERPROFILE\platform-tools.zip"
```

3. Extract the ZIP file:
```powershell
Expand-Archive -Path "$env:USERPROFILE\platform-tools.zip" -DestinationPath "$env:USERPROFILE\android-sdk-tools"
```

4. Add ADB to your PATH (temporary, for current session):
```powershell
$env:Path += ";$env:USERPROFILE\android-sdk-tools\platform-tools"
```

5. Add ADB to your PATH (permanent):
```powershell
[System.Environment]::SetEnvironmentVariable("Path", $env:Path, "User")
```

6. Set up ANDROID_HOME environment variable:
```powershell
# Create Android SDK directory if it doesn't exist
if (-not (Test-Path "$env:USERPROFILE\AppData\Local\Android\Sdk")) { 
    New-Item -ItemType Directory -Path "$env:USERPROFILE\AppData\Local\Android\Sdk" -Force 
}

# Create platform-tools directory
New-Item -ItemType Directory -Path "$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools" -Force

# Copy ADB files to standard Android SDK location
Copy-Item -Path "$env:USERPROFILE\android-sdk-tools\platform-tools\*" -Destination "$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools\" -Recurse -Force

# Set ANDROID_HOME environment variable (temporary)
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"

# Set ANDROID_HOME environment variable (permanent)
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:USERPROFILE\AppData\Local\Android\Sdk", "User")

# Update PATH with ANDROID_HOME
$env:Path += ";$env:ANDROID_HOME\platform-tools"
[System.Environment]::SetEnvironmentVariable("Path", $env:Path, "User")
```

7. Verify installation:
```bash
adb version
echo "ANDROID_HOME: $env:ANDROID_HOME"
```

### Essential ADB Commands for Smart Farmer Development

#### Device Connection
- **List connected devices**: `adb devices`
- **Get device model**: `adb shell getprop ro.product.model`
- **Get Android version**: `adb shell getprop ro.build.version.release`

#### App Installation and Management
- **Install Smart Farmer APK**: `adb install path\to\smart-farmer.apk`
- **Start Smart Farmer app**: 
  ```
  # Replace with actual package name
  adb shell am start -n com.smartfarmer.app/.MainActivity
  ```
- **Force stop the app**: `adb shell am force-stop com.smartfarmer.app`
- **Clear app data**: `adb shell pm clear com.smartfarmer.app`

#### Debugging
- **View app logs**: `adb logcat | findstr "SmartFarmer"`
- **Take a screenshot**: 
  ```
  adb shell screencap -p /sdcard/screenshot.png
  adb pull /sdcard/screenshot.png .
  ```
- **Record screen**: 
  ```
  adb shell screenrecord /sdcard/demo.mp4
  # Press Ctrl+C to stop recording
  adb pull /sdcard/demo.mp4 .
  ```

#### File Transfer
- **Copy file to device**: `adb push local_file.txt /sdcard/`
- **Copy file from device**: `adb pull /sdcard/remote_file.txt .`

#### Performance Monitoring
- **Check battery stats**: `adb shell dumpsys battery`
- **Check memory usage**: `adb shell dumpsys meminfo com.smartfarmer.app`
- **Check CPU usage**: `adb shell dumpsys cpuinfo`

#### Network
- **Enable/disable WiFi**: 
  ```
  adb shell svc wifi enable
  adb shell svc wifi disable
  ```
- **Check network stats**: `adb shell dumpsys netstats`

### Common Issues and Solutions

1. **Device unauthorized**:
   - Ensure USB debugging is enabled on the device
   - Check for and accept the RSA fingerprint prompt on the device

2. **ADB device not detected**:
   - Try different USB cables or ports
   - Reinstall USB drivers for your device
   - Restart ADB server: `adb kill-server` followed by `adb start-server`

3. **App crashes during testing**:
   - Check logs: `adb logcat *:E`
   - Analyze stack trace to identify the issue

4. **Socket timeout errors (java.net.SocketTimeoutException)**:
   - This typically happens when the Android device cannot reach the development machine
   - Solutions:
     1. Use tunnel mode: `npx expo start --tunnel` (requires internet access but avoids firewall issues)
     2. Set up explicit IP addresses:
        ```powershell
        $env:EXPO_DEVTOOLS_LISTEN_ADDRESS="0.0.0.0"
        $env:REACT_NATIVE_PACKAGER_HOSTNAME="YOUR_COMPUTER_IP_ADDRESS"
        npx expo start --lan
        ```
     3. Check firewall settings to ensure ports 19000-19002 are open
     4. Connect via USB if network connectivity is problematic

### Specific Use Cases for Smart Farmer App

1. **Testing Disease Detection Feature**:
   - Upload test images: `adb push test_images/ /sdcard/DCIM/`
   - Monitor image processing: `adb logcat | findstr "DiseaseDetection"`

2. **Testing Offline Mode**:
   - Toggle airplane mode: `adb shell cmd connectivity airplane-mode [enable|disable]`
   - Check offline database: `adb shell "run-as com.smartfarmer.app ls /data/data/com.smartfarmer.app/databases/"`

3. **Performance Testing**:
   - Check memory during image processing: `adb shell dumpsys meminfo com.smartfarmer.app | findstr "TOTAL"`
   - Monitor network usage during sync: `adb shell dumpsys netstats detail | findstr "com.smartfarmer"`

## Project Structure

```
/FRONTEND
  /src
    /assets         # Images, fonts, and other static assets
    /components     # Reusable UI components
      /common       # Shared UI components (Button, Card, etc.)
      /navigation   # Navigation-related components
      /screens      # Screen-specific components
    /constants      # App constants and configuration
    /contexts       # Context providers for state management
    /db             # Database setup and migration scripts
    /localization   # Translation files and i18n setup
    /navigation     # Navigation configuration
    /screens        # Application screens
      /auth         # Authentication screens
      /home         # Home screen
      /diseases     # Disease detection screens
      /advisory     # Advisory content screens
      /groups       # Community group screens
      /settings     # App settings screens
    /services       # API services
    /utils          # Utility functions
  App.js            # Application entry point
```

## Contributing

Please read the project's CONTRIBUTING.md for details on the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
