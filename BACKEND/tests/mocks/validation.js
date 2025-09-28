// Mock for image validation
jest.mock('../../src/utils/validation', () => {
  return class ImageValidation {
    static validateImage(file) {
      // Mock implementation to simulate image validation based on file properties
      if (!file) {
        return {
          error: 'No file provided'
        };
      }

      // Check if this is an "oversized" test image
      if (file.originalname === 'large-image.jpg' || file.size > 5 * 1024 * 1024) {
        return {
          error: 'Image size must be less than 5MB'
        };
      }

      // Check if this is a "blurry" test image
      if (file.originalname === 'blurry-image.jpg') {
        return {
          error: 'Image appears to be too blurry'
        };
      }

      // Default for valid images
      return {
        error: null,
        imageInfo: {
          width: 1280,
          height: 720,
          format: 'jpeg',
          size: file.size || 1024 * 1024 // 1MB default
        }
      };
    }

    static calculateBlurScore() {
      // Always return good blur score in tests
      return 0.8;
    }
  };
});