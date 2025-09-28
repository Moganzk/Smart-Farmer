// src/services/ai/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const fs = require('fs');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);

/**
 * Get content from image file
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Buffer>} - Image buffer
 */
async function getImageData(imagePath) {
  return fs.readFileSync(imagePath);
}

/**
 * Analyze crop disease using Gemini Pro Vision
 * @param {string} imagePath - Path to crop image
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} - Analysis result
 */
async function analyzeCropDisease(imagePath, options = {}) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    // Read image file
    const imageData = await getImageData(imagePath);
    
    // Encode image to base64
    const mimeType = options.mimeType || 'image/jpeg';
    const imageBase64 = imageData.toString('base64');
    
    // Prepare the image part for the prompt
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    };
    
    // Prepare text prompt
    const cropType = options.cropType || 'unknown';
    const textPrompt = `
      Analyze this crop image and provide a detailed diagnosis. 
      Crop type: ${cropType}
      
      Format the response as a JSON object with the following structure:
      {
        "disease_detected": true/false,
        "disease_name": "Disease name (empty string if none)",
        "confidence": 0-100 (confidence percentage),
        "symptoms": ["list", "of", "visible", "symptoms"],
        "description": "Brief description of the disease",
        "treatment": ["list", "of", "treatment", "recommendations"],
        "prevention": ["list", "of", "prevention", "measures"]
      }
    `;
    
    // Create prompt parts
    const promptParts = [
      { text: textPrompt },
      imagePart
    ];
    
    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: promptParts }],
    });
    
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    let jsonResponse;
    try {
      // Extract JSON from response (handle potential text before/after JSON)
      const jsonMatch = text.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      logger.error('Failed to parse Gemini response as JSON:', parseError);
      throw new Error('Invalid response format from AI model');
    }
    
    return {
      success: true,
      data: jsonResponse,
      model: 'gemini-pro-vision',
      raw_response: text
    };
  } catch (error) {
    logger.error('Gemini Vision API error:', error);
    return {
      success: false,
      error: error.message,
      model: 'gemini-pro-vision'
    };
  }
}

/**
 * Generate treatment recommendations using Gemini Pro
 * @param {string} diseaseName - Name of the detected disease
 * @param {string} cropType - Type of crop
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Treatment recommendations
 */
async function getTreatmentRecommendations(diseaseName, cropType, options = {}) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Provide detailed treatment and prevention recommendations for "${diseaseName}" affecting ${cropType} crops.
      Consider organic and conventional methods appropriate for small-scale farmers.
      
      Format the response as a JSON object with the following structure:
      {
        "disease_name": "${diseaseName}",
        "crop_type": "${cropType}",
        "immediate_actions": ["list", "of", "immediate", "actions"],
        "treatments": {
          "organic": ["list", "of", "organic", "treatments"],
          "conventional": ["list", "of", "conventional", "treatments"]
        },
        "prevention": ["list", "of", "prevention", "measures"],
        "resources": ["list", "of", "helpful", "resources"]
      }
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    let jsonResponse;
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      logger.error('Failed to parse Gemini response as JSON:', parseError);
      throw new Error('Invalid response format from AI model');
    }
    
    return {
      success: true,
      data: jsonResponse,
      model: 'gemini-pro',
      raw_response: text
    };
  } catch (error) {
    logger.error('Gemini API error:', error);
    return {
      success: false,
      error: error.message,
      model: 'gemini-pro'
    };
  }
}

module.exports = {
  analyzeCropDisease,
  getTreatmentRecommendations
};
