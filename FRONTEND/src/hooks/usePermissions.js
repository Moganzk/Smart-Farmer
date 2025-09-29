import { useState, useEffect } from 'react';
import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

/**
 * Hook for managing app permissions
 * @returns {Object} Object containing permission states and request functions
 */
const usePermissions = () => {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [galleryPermission, setGalleryPermission] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(null);

  // Request camera permission
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === 'granted');
    return status === 'granted';
  };

  // Request gallery permission
  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setGalleryPermission(status === 'granted');
    return status === 'granted';
  };

  // Request location permission
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
    return status === 'granted';
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationPermission(status === 'granted');
    return status === 'granted';
  };

  // Check all permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === 'granted');

      const galleryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      setGalleryPermission(galleryStatus.status === 'granted');

      const locationStatus = await Location.getForegroundPermissionsAsync();
      setLocationPermission(locationStatus.status === 'granted');

      const notificationStatus = await Notifications.getPermissionsAsync();
      setNotificationPermission(notificationStatus.status === 'granted');
    };

    checkPermissions();
  }, []);

  return {
    permissions: {
      camera: cameraPermission,
      gallery: galleryPermission,
      location: locationPermission,
      notification: notificationPermission,
    },
    requestPermissions: {
      camera: requestCameraPermission,
      gallery: requestGalleryPermission,
      location: requestLocationPermission,
      notification: requestNotificationPermission,
    },
  };
};

export default usePermissions;