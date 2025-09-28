// src/services/ai/groq.js
const axios = require('axios');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const fs = require('fs');

/**
 * Convert image to base64
 * @param {string} imagePath - Path to image file
 * @returns {Promise<string>} - Base64 encoded image
 */
async function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    logger.error('Error converting image to base64:', error);
    throw error;
  }
}

/**
 * Analyze crop disease using Groq's LLaVA model
 * @param {string} imagePath - Path to crop image
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} - Analysis result
 */
async function analyzeCropDisease(imagePath, options = {}) {
  try {
    const apiKey = config.ai.groqApiKey;
    const baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    // Convert image to base64
    const imageBase64 = await imageToBase64(imagePath);
    
    // Prepare the request payload
    const cropType = options.cropType || 'unknown';
    const payload = {
      model: "llava-llama3-groq-8b-v1",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this crop image and provide a detailed diagnosis. 
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
                    }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1024,
      temperature: 0.2
    };
    
    // Make the API request
    const response = await axios.post(baseUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    // Process the response
    const text = response.data.choices[0].message.content;
    
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
      logger.error('Failed to parse Groq response as JSON:', parseError);
      throw new Error('Invalid response format from AI model');
    }
    
    return {
      success: true,
      data: jsonResponse,
      model: 'llava-llama3-groq-8b-v1',
      raw_response: text
    };
  } catch (error) {
    logger.error('Groq API error:', error);
    return {
      success: false,
      error: error.message,
      model: 'llava-llama3-groq-8b-v1'
    };
  }
}

/**
 * Generate treatment recommendations using Groq's Mixtral model
 * @param {string} diseaseName - Name of the detected disease
 * @param {string} cropType - Type of crop
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Treatment recommendations
 */
async function getTreatmentRecommendations(diseaseName, cropType, options = {}) {
  try {
    const apiKey = config.ai.groqApiKey;
    const baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    // Prepare the request payload
    const payload = {
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: `Provide detailed treatment and prevention recommendations for "${diseaseName}" affecting ${cropType} crops.
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
                   }`
        }
      ],
      max_tokens: 1024,
      temperature: 0.2
    };
    
    // Make the API request
    const response = await axios.post(baseUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    // Process the response
    const text = response.data.choices[0].message.content;
    
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
      logger.error('Failed to parse Groq response as JSON:', parseError);
      throw new Error('Invalid response format from AI model');
    }
    
    return {
      success: true,
      data: jsonResponse,
      model: 'mixtral-8x7b-32768',
      raw_response: text
    };
  } catch (error) {
    logger.error('Groq API error:', error);
    return {
      success: false,
      error: error.message,
      model: 'mixtral-8x7b-32768'
    };
  }
}

module.exports = {
  analyzeCropDisease,
  getTreatmentRecommendations
};
