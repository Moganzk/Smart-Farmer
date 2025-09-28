const path = require('path');
const fs = require('fs').promises;
const { createHash } = require('crypto');
const logger = require('./logger');

class StorageUtils {
  static UPLOAD_DIR = path.join(process.cwd(), 'uploads');

  static async uploadImage(file, subdir) {
    try {
      // Create upload directory if it doesn't exist
      const uploadPath = path.join(this.UPLOAD_DIR, subdir);
      await fs.mkdir(uploadPath, { recursive: true });

      // Generate unique filename based on content hash
      const fileHash = await this.generateFileHash(file.buffer);
      const ext = path.extname(file.originalname);
      const filename = `${fileHash}${ext}`;

      // Save file
      const filePath = path.join(uploadPath, filename);
      await fs.writeFile(filePath, file.buffer);

      // Return relative path from upload directory
      return path.join(subdir, filename);
    } catch (error) {
      logger.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  static async deleteImage(imagePath) {
    try {
      const fullPath = path.join(this.UPLOAD_DIR, imagePath);
      await fs.unlink(fullPath);
    } catch (error) {
      logger.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  static async generateFileHash(buffer) {
    const hash = createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
  }

  static async getImagePath(relativePath) {
    return path.join(this.UPLOAD_DIR, relativePath);
  }
}

module.exports = StorageUtils;