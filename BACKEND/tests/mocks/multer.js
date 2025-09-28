// Mock for multer file upload
jest.mock('multer', () => {
  return () => ({
    single: () => (req, res, next) => {
      // Create a buffer for test images (minimal JPEG header)
      const validImageBuffer = Buffer.from([0xFF, 0xD8, 0xFF]); 

      // Define image based on request header
      const testImageName = req.headers['x-test-image'] || 'test-image.jpg';
      
      // Create the appropriate test image
      if (testImageName === 'large-image.jpg') {
        req.file = {
          buffer: validImageBuffer,
          originalname: 'large-image.jpg',
          mimetype: 'image/jpeg',
          size: 6 * 1024 * 1024 // 6MB (over limit)
        };
      } else if (testImageName === 'blurry-image.jpg') {
        req.file = {
          buffer: validImageBuffer,
          originalname: 'blurry-image.jpg',
          mimetype: 'image/jpeg',
          size: 1024 * 1024 // 1MB
        };
      } else {
        // Default test image
        req.file = {
          buffer: validImageBuffer,
          originalname: 'test-image.jpg',
          mimetype: 'image/jpeg',
          size: 1024 * 1024 // 1MB
        };
      }
      
      next();
    }
  });
});