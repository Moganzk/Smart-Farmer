const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const logger = require('./logger');

class GeminiAPI {
  static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  static async detectDisease({ imagePath, cropType }) {
    try {
      // Read image file
      const imageBytes = await fs.readFile(imagePath);

      // Convert to base64
      const base64Image = imageBytes.toString('base64');

      // Create model instance
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      // Prepare prompt
      const prompt = `Analyze this image of a ${cropType} plant and identify any diseases or pests. 
                     Please provide:
                     1. Disease name (if any)
                     2. Confidence level (0-1)
                     3. Brief description
                     4. Key symptoms visible
                     5. Severity (low/medium/high)
                     Return the analysis in JSON format.`;

      // Generate content
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }]
      });

      // Parse response
      const response = result.response;
      const jsonStr = response.text();
      return JSON.parse(jsonStr);
    } catch (error) {
      logger.error('Error in Gemini API disease detection:', error);
      throw new Error('Failed to analyze image with Gemini API');
    }
  }
}

module.exports = GeminiAPI;