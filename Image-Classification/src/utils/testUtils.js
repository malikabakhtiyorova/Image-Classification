// Test utilities for the enhanced AI service

// Sample test images for development
export const testImages = [
  {
    name: 'Dog',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
    expectedCategory: 'animals'
  },
  {
    name: 'Car',
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
    expectedCategory: 'vehicles'
  },
  {
    name: 'Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    expectedCategory: 'food'
  }
];

// Helper function to create test image element
export const createTestImageElement = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

// Test the AI service with sample images
export const testAIAccuracy = async (aiService) => {
  const results = [];
  
  for (const testImage of testImages) {
    try {
      console.log(`Testing ${testImage.name}...`);
      const img = await createTestImageElement(testImage.url);
      const prediction = await aiService.classifyImage(img, {
        topK: 3,
        minConfidence: 0.1,
        useEnsemble: true
      });
      
      results.push({
        image: testImage.name,
        expectedCategory: testImage.expectedCategory,
        predictions: prediction.ensemble,
        topPrediction: prediction.ensemble[0],
        analysis: prediction.analysis
      });
      
      console.log(`✅ ${testImage.name} classified as: ${prediction.ensemble[0]?.className} (${(prediction.ensemble[0]?.probability * 100).toFixed(1)}%)`);
    } catch (error) {
      console.error(`❌ Failed to test ${testImage.name}:`, error);
      results.push({
        image: testImage.name,
        error: error.message
      });
    }
  }
  
  return results;
};

export default { testImages, createTestImageElement, testAIAccuracy };