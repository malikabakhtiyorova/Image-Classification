// Simple test for object detection
import objectExtractionService from './services/objectExtractionService';

export async function testObjectDetection() {
  console.log('🧪 Starting object detection test...');
  
  try {
    // Create a test image
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    
    // Use a simple test image URL (a sample image with objects)
    img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    console.log('✅ Test image loaded');
    
    // Test detection
    const objects = await objectExtractionService.detectObjects(img);
    console.log('🎯 Test detection result:', objects);
    
    return objects;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Export for manual testing
window.testObjectDetection = testObjectDetection;