import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

class AdvancedAIService {
  constructor() {
    this.models = {
      mobilenet: null,
      cocoSsd: null
    };
    this.isLoading = false;
    this.loadingProgress = 0;
  }

  // Enhanced model loading with progress tracking
  async loadModels(onProgress = () => {}) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.loadingProgress = 0;

    try {
      // Initialize TensorFlow with proper backend setup
      onProgress(10, 'Initializing TensorFlow...');
      
      // Wait for TensorFlow to be ready
      await tf.ready();
      
      onProgress(20, 'Loading MobileNet model...');

      // Load MobileNet with default settings for better compatibility
      this.models.mobilenet = await mobilenet.load();
      
      onProgress(60, 'Loading object detection model...');

      // Load COCO-SSD for object detection
      this.models.cocoSsd = await cocoSsd.load();
      
      onProgress(100, 'All models loaded successfully!');
      
      this.isLoading = false;
      return true;
    } catch (error) {
      this.isLoading = false;
      console.error('Error loading AI models:', error);
      throw new Error('Failed to load AI models. Please check your internet connection.');
    }
  }

  // Advanced image preprocessing for better accuracy
  preprocessImage(imageElement) {
    // For now, return the image element directly
    // The models will handle preprocessing internally
    return imageElement;
  }

  // Image enhancement for better recognition
  enhanceImage(tensor) {
    // This will be handled by the models internally
    return tensor;
  }

  // Enhanced classification with ensemble predictions
  async classifyImage(imageElement, options = {}) {
    const {
      topK = 5,
      minConfidence = 0.1,
      useEnsemble = true
    } = options;

    if (!this.models.mobilenet || !this.models.cocoSsd) {
      throw new Error('Models not loaded. Please wait for initialization to complete.');
    }

    try {
      const results = {};

      // MobileNet Classification
      const mobileNetPredictions = await this.models.mobilenet.classify(imageElement, topK);

      // Process MobileNet results
      results.classification = mobileNetPredictions
        .filter(pred => pred.probability >= minConfidence)
        .map(pred => ({
          className: this.formatClassName(pred.className),
          probability: pred.probability,
          source: 'MobileNet V2',
          category: this.categorizeClassName(pred.className)
        }));

      // Object Detection with COCO-SSD
      const objectDetections = await this.models.cocoSsd.detect(imageElement);
      
      results.objects = objectDetections
        .filter(detection => detection.score >= minConfidence)
        .map(detection => ({
          className: this.formatClassName(detection.class),
          probability: detection.score,
          boundingBox: detection.bbox,
          source: 'COCO-SSD',
          category: this.categorizeClassName(detection.class)
        }));

      // Ensemble predictions for higher confidence
      if (useEnsemble && results.objects.length > 0) {
        results.ensemble = this.createEnsemblePredictions(results.classification, results.objects);
      } else {
        results.ensemble = results.classification;
      }

      // Add confidence analysis
      results.analysis = this.analyzeResults(results);

      return results;
    } catch (error) {
      console.error('Classification error:', error);
      throw new Error('Failed to classify image. Please try again.');
    }
  }

  // Create ensemble predictions by combining multiple models
  createEnsemblePredictions(classificationResults, objectResults) {
    const combined = {};
    
    // Add classification results
    classificationResults.forEach(result => {
      const key = result.className.toLowerCase();
      if (!combined[key]) {
        combined[key] = {
          className: result.className,
          probability: 0,
          sources: [],
          category: result.category
        };
      }
      combined[key].probability += result.probability * 0.7; // Weight classification higher
      combined[key].sources.push(result.source);
    });

    // Add object detection results
    objectResults.forEach(result => {
      const key = result.className.toLowerCase();
      if (!combined[key]) {
        combined[key] = {
          className: result.className,
          probability: 0,
          sources: [],
          category: result.category
        };
      }
      combined[key].probability += result.probability * 0.8; // Weight detection high
      combined[key].sources.push(result.source);
    });

    // Convert to array and sort by confidence
    return Object.values(combined)
      .map(result => ({
        ...result,
        probability: Math.min(result.probability, 1), // Cap at 1.0
        sources: [...new Set(result.sources)], // Remove duplicates
        isEnsemble: true
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);
  }

  // Enhanced class name formatting
  formatClassName(className) {
    return className
      .split(',')[0] // Take first part if comma-separated
      .split('-').join(' ') // Replace hyphens with spaces
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capitals
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Categorize classifications for better organization
  categorizeClassName(className) {
    const categories = {
      animals: ['dog', 'cat', 'bird', 'horse', 'cow', 'sheep', 'elephant', 'bear', 'zebra', 'giraffe'],
      vehicles: ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'train', 'airplane', 'boat', 'ship'],
      food: ['pizza', 'burger', 'sandwich', 'cake', 'bread', 'fruit', 'vegetable', 'apple', 'banana'],
      objects: ['chair', 'table', 'book', 'phone', 'laptop', 'tv', 'bottle', 'cup', 'clock'],
      nature: ['tree', 'flower', 'mountain', 'beach', 'sky', 'cloud', 'grass', 'rock', 'water'],
      people: ['person', 'man', 'woman', 'child', 'face', 'hand', 'body']
    };

    const lowerClassName = className.toLowerCase();
    
    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => lowerClassName.includes(item))) {
        return category;
      }
    }
    
    return 'general';
  }

  // Analyze results for insights
  analyzeResults(results) {
    const analysis = {
      totalPredictions: results.ensemble?.length || 0,
      highConfidencePredictions: 0,
      mediumConfidencePredictions: 0,
      lowConfidencePredictions: 0,
      categories: {},
      averageConfidence: 0,
      topCategory: null
    };

    if (!results.ensemble || results.ensemble.length === 0) {
      return analysis;
    }

    let totalConfidence = 0;

    results.ensemble.forEach(prediction => {
      totalConfidence += prediction.probability;
      
      // Confidence levels
      if (prediction.probability >= 0.7) {
        analysis.highConfidencePredictions++;
      } else if (prediction.probability >= 0.4) {
        analysis.mediumConfidencePredictions++;
      } else {
        analysis.lowConfidencePredictions++;
      }

      // Category counting
      const category = prediction.category || 'general';
      analysis.categories[category] = (analysis.categories[category] || 0) + 1;
    });

    analysis.averageConfidence = totalConfidence / results.ensemble.length;
    
    // Find top category
    analysis.topCategory = Object.entries(analysis.categories)
      .reduce((a, b) => analysis.categories[a[0]] > analysis.categories[b[0]] ? a : b)?.[0] || 'general';

    return analysis;
  }

  // Get model information
  getModelInfo() {
    return {
      mobilenet: {
        loaded: !!this.models.mobilenet,
        version: 'V2',
        description: 'Image classification with 1000+ categories'
      },
      cocoSsd: {
        loaded: !!this.models.cocoSsd,
        version: 'MobileNet V2 base',
        description: 'Object detection with 80+ object types'
      },
      ensemble: {
        description: 'Combined predictions from multiple models for higher accuracy'
      }
    };
  }

  // Memory cleanup
  dispose() {
    if (this.models.mobilenet) {
      this.models.mobilenet.dispose();
      this.models.mobilenet = null;
    }
    if (this.models.cocoSsd) {
      this.models.cocoSsd.dispose();
      this.models.cocoSsd = null;
    }
  }
}

// Create and export singleton instance
const aiServiceInstance = new AdvancedAIService();
export default aiServiceInstance;