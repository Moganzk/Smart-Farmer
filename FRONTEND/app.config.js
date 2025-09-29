// Read environment variables from .env file
const fs = require('fs');
const path = require('path');

let envVars = {};
try {
  // Try to read .env file from the root directory
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
  }
  
  // Also try local .env file
  const localEnvPath = path.join(__dirname, '.env');
  if (fs.existsSync(localEnvPath)) {
    const envContent = fs.readFileSync(localEnvPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
  }
} catch (error) {
  console.warn('Could not load .env file:', error.message);
}

export default {
  expo: {
    name: "Smart Farmer",
    slug: "smart-farmer",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.svg",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/icon.svg",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.smartfarmer.app",
      buildNumber: "1.0.0",
      infoPlist: {
        NSCameraUsageDescription: "This app needs access to camera to take photos of crops for disease detection.",
        NSPhotoLibraryUsageDescription: "This app needs access to photo library to select images for disease detection."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.svg",
        backgroundColor: "#FFFFFF"
      },
      package: "com.smartfarmer.app",
      versionCode: 1,
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_NETWORK_STATE",
        "INTERNET"
      ]
    },
    web: {
      favicon: "./assets/favicon.png",
      name: "Smart Farmer",
      shortName: "SmartFarmer"
    },
    plugins: [
      "expo-camera",
      "expo-media-library",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Smart Farmer to access your photos for crop disease detection.",
          cameraPermission: "Allow Smart Farmer to take photos of your crops for disease detection."
        }
      ]
    ],
    extra: {
      GEMINI_API_KEY: envVars.GEMINI_API_KEY || process.env.GEMINI_API_KEY,
      GROQ_API_KEY: envVars.GROQ_API_KEY || process.env.GROQ_API_KEY,
      AFRICA_TALKING_KEY: envVars.AFRICA_TALKING_KEY || process.env.AFRICA_TALKING_KEY,
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};