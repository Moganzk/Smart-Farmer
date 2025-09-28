// Mock for storage
jest.mock('../../src/utils/storage', () => ({
  uploadImage: jest.fn().mockImplementation((file, folder) => {
    // Generate a unique path based on file name and folder
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const path = `/uploads/${folder}/${file.originalname.split('.')[0]}-${uniqueId}.jpg`;
    return Promise.resolve(path);
  }),
  deleteImage: jest.fn().mockResolvedValue(true)
}));