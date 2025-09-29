import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { GEMINI_API_KEY, GEMINI_API_URL } from '../constants/config';

/**
 * Convert an image to base64 encoding
 * @param {string} uri - The local URI of the image
 * @returns {Promise<string>} - Base64 encoded image
 */
const imageToBase64 = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

/**
 * Analyze an image using Google's Gemini Pro Vision API for crop disease detection
 * @param {string} imageUri - Local URI of the image to analyze
 * @returns {Promise<Object>} - Detection results
 */
const analyzeImage = async (imageUri) => {
  try {
    // Convert image to base64
    const base64Image = await imageToBase64(imageUri);
    
    // Prepare the request payload for Gemini API
    const payload = {
      contents: [
        {
          parts: [
            {
              text: "This is an image of a plant. Please analyze it carefully and tell me if there's any disease. If there is a disease, provide the following information in JSON format: the name of the disease, a description of the disease, severity level (low, moderate, high), confidence percentage (0-100), and an array of treatment recommendations. If there's no disease, respond with a JSON that has disease set to 'No Disease Detected' with an appropriate description and 0% confidence. Format your entire response as valid JSON that can be parsed, with no additional text."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    };
    
    // Make API request to Gemini
    const response = await axios.post(
      `${GEMINI_API_URL}/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    // Extract the text response from Gemini
    const textResponse = response.data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response
    try {
      // Use a regular expression to extract the JSON part of the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        return JSON.parse(jsonStr);
      } else {
        // If no JSON is found, create a default error response
        return {
          disease: "Analysis Error",
          description: "The analysis could not be completed. Please try again with a clearer image.",
          severity: "Unknown",
          confidence: 0,
          treatments: ["Try again with a different image or from a different angle."]
        };
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return {
        disease: "Analysis Error",
        description: "The analysis could not be completed. Please try again with a clearer image.",
        severity: "Unknown",
        confidence: 0,
        treatments: ["Try again with a different image or from a different angle."]
      };
    }
    
  } catch (error) {
    console.error('Error analyzing image with Gemini API:', error);
    throw error;
  }
};

export default {
  analyzeImage,
};