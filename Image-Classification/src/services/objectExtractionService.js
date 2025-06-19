// Simple, reliable object detection service
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

class ObjectExtractionService {
  constructor() {
    this.model = null;
    this.isLoading = false;
    this.isReady = false;
    this.initPromise = null;
    this.init();
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.setupTensorFlow();
    return this.initPromise;
  }

  async setupTensorFlow() {
    try {
      console.log('🔧 Setting up TensorFlow.js...');
      
      // Simple backend setup - try WebGL, fallback to CPU
      await tf.ready();
      console.log('✅ TensorFlow.js ready, backend:', tf.getBackend());
      
      this.isReady = true;
      return true;
    } catch (error) {
      console.error('❌ TensorFlow setup failed:', error);
      throw error;
    }
  }

  async loadModel() {
    if (this.model) {
      return this.model;
    }

    if (this.isLoading) {
      // Wait for loading to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.model;
    }

    this.isLoading = true;

    try {
      if (!this.isReady) {
        await this.init();
      }

      console.log('📦 Loading COCO-SSD model...');
      
      // Load model with simple configuration
      this.model = await cocoSsd.load();
      
      console.log('✅ Model loaded successfully!');
      return this.model;

    } catch (error) {
      console.error('❌ Model loading failed:', error);
      throw new Error(`Failed to load detection model: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  async detectObjects(imageElement) {
    try {
      console.log('🔍 Starting object detection...');

      // Validate input
      if (!imageElement) {
        throw new Error('No image provided');
      }

      // Ensure image is loaded
      if (!imageElement.complete || !imageElement.naturalWidth) {
        throw new Error('Image not loaded properly');
      }

      console.log(`📐 Image: ${imageElement.naturalWidth}x${imageElement.naturalHeight}`);

      // Load model
      const model = await this.loadModel();
      if (!model) {
        throw new Error('Model not available');
      }

      // Run detection
      console.log('🤖 Running detection...');
      const predictions = await model.detect(imageElement);
      
      console.log(`🎯 Found ${predictions.length} raw predictions:`, predictions);

      // Process results
      const objects = predictions
        .map((prediction, index) => {
          if (!prediction.bbox || prediction.bbox.length !== 4) {
            console.warn('Invalid prediction:', prediction);
            return null;
          }

          const [x, y, width, height] = prediction.bbox;
          
          // Basic validation
          if (width < 10 || height < 10 || prediction.score < 0.3) {
            return null;
          }

          return {
            id: `obj_${Date.now()}_${index}`,
            class: prediction.class,
            confidence: prediction.score,
            boundingBox: {
              x: Math.round(x),
              y: Math.round(y),
              width: Math.round(width),
              height: Math.round(height)
            },
            area: Math.round(width * height)
          };
        })
        .filter(obj => obj !== null)
        .sort((a, b) => b.confidence - a.confidence);

      console.log(`✨ Processed ${objects.length} objects:`, objects);
      return objects;

    } catch (error) {
      console.error('❌ Detection failed:', error);
      throw error;
    }
  }

  async extractObject(imageElement, boundingBox) {
    try {
      console.log('✂️ Extracting object:', boundingBox);

      if (!imageElement || !boundingBox) {
        throw new Error('Invalid parameters for extraction');
      }

      // Create canvas for extraction
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Add padding
      const padding = 20;
      canvas.width = boundingBox.width + (padding * 2);
      canvas.height = boundingBox.height + (padding * 2);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate source coordinates
      const srcX = Math.max(0, boundingBox.x - padding);
      const srcY = Math.max(0, boundingBox.y - padding);
      const srcWidth = Math.min(imageElement.naturalWidth - srcX, canvas.width);
      const srcHeight = Math.min(imageElement.naturalHeight - srcY, canvas.height);

      // Draw extracted region
      ctx.drawImage(
        imageElement,
        srcX, srcY, srcWidth, srcHeight,
        0, 0, srcWidth, srcHeight
      );

      const result = canvas.toDataURL('image/png');
      console.log('✅ Extraction complete');
      return result;

    } catch (error) {
      console.error('❌ Extraction failed:', error);
      throw error;
    }
  }

  async removeObjects(imageElement, objectsToRemove) {
    try {
      console.log('🗑️ Removing objects:', objectsToRemove.length);

      if (!imageElement || !objectsToRemove || objectsToRemove.length === 0) {
        throw new Error('Invalid parameters for removal');
      }

      // Create working canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;

      // Draw original image
      ctx.drawImage(imageElement, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simple inpainting by blurring masked areas
      objectsToRemove.forEach(obj => {
        const bbox = obj.boundingBox;
        
        // Create simple mask and fill with surrounding colors
        for (let y = bbox.y; y < bbox.y + bbox.height; y++) {
          for (let x = bbox.x; x < bbox.x + bbox.width; x++) {
            if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
              const index = (y * canvas.width + x) * 4;
              
              // Sample surrounding pixels for replacement
              const samples = [];
              for (let dy = -10; dy <= 10; dy += 5) {
                for (let dx = -10; dx <= 10; dx += 5) {
                  const sx = x + dx;
                  const sy = y + dy;
                  
                  if (sx >= 0 && sx < canvas.width && sy >= 0 && sy < canvas.height) {
                    // Check if this pixel is outside the object
                    if (sx < bbox.x || sx >= bbox.x + bbox.width || 
                        sy < bbox.y || sy >= bbox.y + bbox.height) {
                      const sIndex = (sy * canvas.width + sx) * 4;
                      samples.push({
                        r: data[sIndex],
                        g: data[sIndex + 1],
                        b: data[sIndex + 2]
                      });
                    }
                  }
                }
              }
              
              if (samples.length > 0) {
                // Average the samples
                let avgR = 0, avgG = 0, avgB = 0;
                samples.forEach(sample => {
                  avgR += sample.r;
                  avgG += sample.g;
                  avgB += sample.b;
                });
                
                avgR = Math.round(avgR / samples.length);
                avgG = Math.round(avgG / samples.length);
                avgB = Math.round(avgB / samples.length);
                
                // Add some noise for texture
                const noise = (Math.random() - 0.5) * 20;
                
                data[index] = Math.max(0, Math.min(255, avgR + noise));
                data[index + 1] = Math.max(0, Math.min(255, avgG + noise));
                data[index + 2] = Math.max(0, Math.min(255, avgB + noise));
                data[index + 3] = 255; // Alpha
              }
            }
          }
        }
      });

      // Apply the modified image data
      ctx.putImageData(imageData, 0, 0);

      const result = canvas.toDataURL('image/png');
      console.log('✅ Removal complete');
      return result;

    } catch (error) {
      console.error('❌ Removal failed:', error);
      throw error;
    }
  }

  getDetectionStats(objects) {
    if (!objects || objects.length === 0) {
      return {
        totalObjects: 0,
        averageConfidence: 0,
        objectTypes: {},
        highConfidenceObjects: 0
      };
    }

    const stats = {
      totalObjects: objects.length,
      averageConfidence: 0,
      objectTypes: {},
      highConfidenceObjects: 0
    };

    let totalConfidence = 0;
    
    objects.forEach(obj => {
      totalConfidence += obj.confidence;
      
      if (obj.confidence > 0.5) {
        stats.highConfidenceObjects++;
      }
      
      stats.objectTypes[obj.class] = (stats.objectTypes[obj.class] || 0) + 1;
    });

    stats.averageConfidence = totalConfidence / objects.length;
    return stats;
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    console.log('🧹 Service disposed');
  }
}

// Create singleton instance
const objectExtractionService = new ObjectExtractionService();
export default objectExtractionService;