// Mock for GeminiAPI
jest.mock('../../src/utils/ai', () => ({
  GeminiAPI: {
    detectDisease: jest.fn().mockImplementation(({ cropType }) => {
      // Return different results based on crop type for more realistic testing
      return Promise.resolve({
        diseaseName: cropType === 'maize' ? 'leaf rust' : 'leaf spot',
        confidence: 0.92,
        severity: 'medium',
        description: `A common fungal disease affecting ${cropType} crops`,
        symptoms: [
          'Yellow to orange pustules on leaves',
          'Circular to oval lesions',
          'Premature leaf death in severe cases'
        ],
        recommendations: [
          'Apply appropriate fungicide',
          'Ensure proper spacing between plants',
          'Consider resistant varieties for future planting'
        ]
      });
    })
  }
}));