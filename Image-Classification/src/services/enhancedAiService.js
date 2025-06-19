import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs-core';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

class EnhancedAIService {
  constructor() {
    this.models = {
      mobilenet: null,
      cocoSsd: null
    };
    this.isLoading = false;
    this.loadingProgress = 0;
  }

  // Enhanced model loading with proper backend initialization
  async loadModels(onProgress = () => {}) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.loadingProgress = 0;

    try {
      onProgress(10, 'Initializing TensorFlow backend...');

      // Initialize TensorFlow with proper backend
      await tf.ready();
      
      // Try to set the best available backend
      try {
        // First try WebGL for better performance
        if (tf.env().get('WEBGL_VERSION') > 0) {
          await tf.setBackend('webgl');
          onProgress(20, 'WebGL backend initialized...');
        } else {
          // Fallback to CPU if WebGL is not available
          await tf.setBackend('cpu');
          onProgress(20, 'CPU backend initialized...');
        }
      } catch (backendError) {
        console.warn('Backend initialization failed, using default:', backendError);
        onProgress(20, 'Using default backend...');
      }

      onProgress(30, 'Loading MobileNet model...');
      // Load MobileNet first (more reliable)
      this.models.mobilenet = await mobilenet.load();
      onProgress(70, 'MobileNet loaded successfully...');

      // Try to load COCO-SSD, but continue if it fails
      try {
        onProgress(80, 'Loading object detection model...');
        this.models.cocoSsd = await cocoSsd.load();
        onProgress(100, 'All models loaded successfully!');
      } catch (cocoError) {
        console.warn('COCO-SSD failed to load, continuing with MobileNet only:', cocoError);
        onProgress(100, 'MobileNet loaded successfully!');
      }
      
      this.isLoading = false;
      return true;
    } catch (error) {
      this.isLoading = false;
      console.error('Error loading AI models:', error);
      throw new Error('Failed to load AI models. Please refresh the page and try again.');
    }
  }

  // Advanced multi-scale image preprocessing for maximum accuracy
  preprocessImage(imageElement) {
    const preprocessedImages = [];
    
    // Create multiple preprocessed versions for ensemble analysis
    const variations = [
      { size: 224, filter: 'contrast(1.2) brightness(1.1) saturate(1.2)', name: 'enhanced' },
      { size: 224, filter: 'contrast(0.9) brightness(0.95) saturate(0.9)', name: 'soft' },
      { size: 299, filter: 'contrast(1.0) brightness(1.0) saturate(1.0)', name: 'large' },
      { size: 224, filter: 'contrast(1.3) brightness(1.0) saturate(1.4) hue-rotate(5deg)', name: 'vivid' }
    ];
    
    variations.forEach(variation => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = variation.size;
      canvas.height = variation.size;
      
      ctx.filter = variation.filter;
      ctx.drawImage(imageElement, 0, 0, variation.size, variation.size);
      
      preprocessedImages.push({
        canvas: canvas,
        name: variation.name,
        size: variation.size
      });
    });
    
    return preprocessedImages;
  }

  // Advanced image augmentation for better recognition
  createAugmentedVersions(imageElement) {
    const augmentations = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 224;
    canvas.height = 224;
    
    // Original
    ctx.clearRect(0, 0, 224, 224);
    ctx.drawImage(imageElement, 0, 0, 224, 224);
    augmentations.push({ canvas: canvas.cloneNode(), name: 'original' });
    
    // Rotation variations (small angles for better recognition)
    [-3, 3].forEach(angle => {
      ctx.clearRect(0, 0, 224, 224);
      ctx.save();
      ctx.translate(112, 112);
      ctx.rotate(angle * Math.PI / 180);
      ctx.translate(-112, -112);
      ctx.drawImage(imageElement, 0, 0, 224, 224);
      ctx.restore();
      augmentations.push({ canvas: canvas.cloneNode(), name: `rotated_${angle}` });
    });
    
    // Horizontal flip
    ctx.clearRect(0, 0, 224, 224);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(imageElement, -224, 0, 224, 224);
    ctx.restore();
    augmentations.push({ canvas: canvas.cloneNode(), name: 'flipped' });
    
    return augmentations;
  }

  // Analyze image quality and provide recommendations
  analyzeImageQuality(imageElement) {
    const quality = {
      resolution: imageElement.naturalWidth * imageElement.naturalHeight,
      aspectRatio: imageElement.naturalWidth / imageElement.naturalHeight,
      recommendations: []
    };

    if (quality.resolution < 100000) { // Less than 100k pixels
      quality.recommendations.push('Image resolution is low - try using a higher quality image');
    }
    
    if (quality.aspectRatio < 0.5 || quality.aspectRatio > 2) {
      quality.recommendations.push('Unusual aspect ratio detected - square or landscape images work best');
    }

    return quality;
  }

  // Enhanced classification with multiple accuracy techniques
  async classifyImage(imageElement, options = {}) {
    const {
      topK = 5,
      minConfidence = 0.05, // Lower threshold for better recall
      useEnsemble = true,
      usePreprocessing = true
    } = options;

    if (!this.models.mobilenet) {
      throw new Error('Models not loaded. Please wait for initialization to complete.');
    }

    try {
      const results = {
        classification: [],
        multiScaleResults: [],
        augmentedResults: [],
        objects: [],
        ensemble: [],
        analysis: {},
        imageQuality: this.analyzeImageQuality(imageElement)
      };

      const allPredictions = [];

      // 1. Original image classification
      const originalPredictions = await this.models.mobilenet.classify(imageElement, topK * 2);
      allPredictions.push(...originalPredictions.map(pred => ({
        className: this.formatClassName(pred.className),
        probability: pred.probability,
        source: 'MobileNet-Original',
        category: this.categorizeClassName(pred.className),
        weight: 0.8
      })));

      // 2. Multi-scale preprocessing analysis
      if (usePreprocessing) {
        const preprocessedImages = this.preprocessImage(imageElement);
        
        for (const processed of preprocessedImages) {
          try {
            const predictions = await this.models.mobilenet.classify(processed.canvas, topK);
            allPredictions.push(...predictions.map(pred => ({
              className: this.formatClassName(pred.className),
              probability: pred.probability,
              source: `MobileNet-${processed.name}`,
              category: this.categorizeClassName(pred.className),
              weight: processed.name === 'enhanced' ? 1.0 : 0.9
            })));
          } catch (error) {
            console.warn(`Failed to classify ${processed.name} version:`, error);
          }
        }

        // 3. Image augmentation analysis (rotation, flip for robustness)
        const augmentedImages = this.createAugmentedVersions(imageElement);
        
        for (const augmented of augmentedImages.slice(0, 3)) { // Limit to prevent slowdown
          try {
            const predictions = await this.models.mobilenet.classify(augmented.canvas, Math.ceil(topK / 2));
            allPredictions.push(...predictions.map(pred => ({
              className: this.formatClassName(pred.className),
              probability: pred.probability,
              source: `MobileNet-Aug-${augmented.name}`,
              category: this.categorizeClassName(pred.className),
              weight: 0.7
            })));
          } catch (error) {
            console.warn(`Failed to classify ${augmented.name} version:`, error);
          }
        }
      }

      // 4. Object detection with multiple scales
      if (this.models.cocoSsd) {
        try {
          // Original image object detection
          const objectDetections = await this.models.cocoSsd.detect(imageElement);
          allPredictions.push(...objectDetections.map(detection => ({
            className: this.formatClassName(detection.class),
            probability: detection.score,
            boundingBox: detection.bbox,
            source: 'COCO-SSD-Original',
            category: this.categorizeClassName(detection.class),
            weight: 1.2
          })));

          // Enhanced image object detection
          if (usePreprocessing) {
            const enhancedImage = this.preprocessImage(imageElement)[0]; // Use enhanced version
            try {
              const enhancedDetections = await this.models.cocoSsd.detect(enhancedImage.canvas);
              allPredictions.push(...enhancedDetections.map(detection => ({
                className: this.formatClassName(detection.class),
                probability: detection.score,
                boundingBox: detection.bbox,
                source: 'COCO-SSD-Enhanced',
                category: this.categorizeClassName(detection.class),
                weight: 1.3
              })));
            } catch (enhancedError) {
              console.warn('Enhanced object detection failed:', enhancedError);
            }
          }
        } catch (objectError) {
          console.warn('Object detection failed, using classification only:', objectError);
        }
      }

      // 5. Create ultra-advanced ensemble with semantic similarity
      results.ensemble = this.createUltraAdvancedEnsemble(allPredictions, minConfidence);
      
      // 6. Apply confidence calibration
      results.ensemble = this.calibrateConfidence(results.ensemble);

      // Add confidence analysis
      results.analysis = this.analyzeResults(results);

      return results;
    } catch (error) {
      console.error('Classification error:', error);
      throw new Error('Failed to analyze image. Please try with a different image or refresh the page.');
    }
  }

  // Ultra-advanced ensemble with semantic similarity and confidence calibration
  createUltraAdvancedEnsemble(allPredictions, minConfidence) {
    const combined = {};
    
    // Group predictions by semantic similarity
    allPredictions.forEach(result => {
      if (result.probability < minConfidence) return;
      
      const key = this.getSemanticKey(result.className);
      const weight = result.weight || 1.0;
      
      if (!combined[key]) {
        combined[key] = {
          className: result.className,
          alternativeNames: new Set([result.className]),
          weightedScore: 0,
          rawScores: [],
          sources: [],
          category: result.category,
          votes: 0,
          maxProbability: 0,
          minProbability: 1,
          variance: 0
        };
      }
      
      // Accumulate weighted scores
      const weightedProb = result.probability * weight;
      combined[key].weightedScore += weightedProb;
      combined[key].rawScores.push(result.probability);
      combined[key].sources.push(result.source);
      combined[key].votes += 1;
      combined[key].alternativeNames.add(result.className);
      combined[key].maxProbability = Math.max(combined[key].maxProbability, result.probability);
      combined[key].minProbability = Math.min(combined[key].minProbability, result.probability);
    });

    // Calculate advanced metrics and final confidence
    return Object.values(combined)
      .map(result => {
        // Calculate variance for stability assessment
        const mean = result.rawScores.reduce((a, b) => a + b, 0) / result.rawScores.length;
        result.variance = result.rawScores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / result.rawScores.length;
        
        // Advanced confidence calculation
        const baseConfidence = result.weightedScore / result.votes;
        const stabilityBonus = Math.max(0, 0.1 - result.variance); // Low variance = more stable
        const consensusBonus = Math.min(0.2, result.votes * 0.05); // More votes = higher confidence
        const rangeBonus = (result.maxProbability - result.minProbability) < 0.3 ? 0.05 : 0; // Consistent scores
        
        const finalConfidence = Math.min(1.0, baseConfidence + stabilityBonus + consensusBonus + rangeBonus);
        
        return {
          className: this.selectBestClassName([...result.alternativeNames]),
          probability: finalConfidence,
          confidence: finalConfidence,
          sources: [...new Set(result.sources)],
          category: result.category,
          votes: result.votes,
          stability: 1 - result.variance,
          consensus: result.votes,
          isEnsemble: true,
          alternativeNames: [...result.alternativeNames]
        };
      })
      .filter(result => result.confidence >= minConfidence)
      .sort((a, b) => {
        // Multi-criteria sorting: confidence, stability, consensus
        const scoreA = a.confidence + (a.stability * 0.1) + (a.consensus * 0.05);
        const scoreB = b.confidence + (b.stability * 0.1) + (b.consensus * 0.05);
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }

  // Get semantic key for grouping similar predictions
  getSemanticKey(className) {
    const normalized = className.toLowerCase().trim();
    
    // Group similar terms
    const synonyms = {
      'dog': ['dog', 'puppy', 'canine', 'hound'],
      'cat': ['cat', 'kitten', 'feline'],
      'car': ['car', 'automobile', 'vehicle', 'sedan'],
      'person': ['person', 'human', 'people', 'man', 'woman'],
      'bird': ['bird', 'avian'],
      'food': ['food', 'meal', 'dish'],
      'animal': ['animal', 'creature', 'beast']
    };
    
    for (const [key, values] of Object.entries(synonyms)) {
      if (values.some(synonym => normalized.includes(synonym))) {
        return key;
      }
    }
    
    return normalized;
  }

  // Select the best class name from alternatives
  selectBestClassName(names) {
    const nameArray = [...names];
    
    // Prefer more specific names over generic ones
    const genericTerms = ['object', 'thing', 'item', 'entity'];
    const specific = nameArray.filter(name => 
      !genericTerms.some(term => name.toLowerCase().includes(term))
    );
    
    if (specific.length > 0) {
      // Return the shortest specific name (usually more precise)
      return specific.reduce((a, b) => a.length <= b.length ? a : b);
    }
    
    return nameArray[0];
  }

  // Advanced confidence calibration
  calibrateConfidence(predictions) {
    if (predictions.length === 0) return predictions;
    
    return predictions.map((pred, index) => {
      let calibratedConfidence = pred.confidence;
      
      // Position-based calibration (top predictions are more reliable)
      const positionPenalty = index * 0.02;
      calibratedConfidence = Math.max(0.01, calibratedConfidence - positionPenalty);
      
      // Source diversity bonus
      const uniqueSources = new Set(pred.sources).size;
      const diversityBonus = Math.min(0.1, uniqueSources * 0.03);
      calibratedConfidence = Math.min(1.0, calibratedConfidence + diversityBonus);
      
      // Category consistency check
      if (pred.category && pred.category !== 'general') {
        calibratedConfidence = Math.min(1.0, calibratedConfidence + 0.02);
      }
      
      return {
        ...pred,
        probability: calibratedConfidence,
        originalConfidence: pred.confidence,
        calibrationApplied: true
      };
    });
  }

  // Simple ensemble for combining similar predictions
  createSimpleEnsemble(predictions) {
    const combined = {};
    
    predictions.forEach(result => {
      const key = result.className.toLowerCase();
      if (!combined[key]) {
        combined[key] = {
          className: result.className,
          probability: result.probability,
          sources: [result.source],
          category: result.category,
          count: 1
        };
      } else {
        // Average the probabilities
        combined[key].probability = (combined[key].probability + result.probability) / 2;
        combined[key].sources.push(result.source);
        combined[key].count += 1;
      }
    });

    return Object.values(combined)
      .map(result => ({
        ...result,
        sources: [...new Set(result.sources)],
        isEnsemble: result.count > 1
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

  // Advanced categorization with context awareness
  categorizeClassName(className) {
    const categories = {
      animals: {
        mammals: ['dog', 'cat', 'horse', 'cow', 'sheep', 'elephant', 'bear', 'zebra', 'giraffe', 'lion', 'tiger', 'wolf', 'fox', 'rabbit', 'deer', 'pig', 'goat', 'mouse', 'rat', 'hamster'],
        birds: ['bird', 'chicken', 'duck', 'eagle', 'owl', 'parrot', 'penguin', 'flamingo', 'swan', 'crow', 'sparrow'],
        aquatic: ['fish', 'shark', 'whale', 'dolphin', 'octopus', 'crab', 'lobster', 'starfish'],
        insects: ['butterfly', 'bee', 'ant', 'spider', 'beetle', 'fly', 'mosquito'],
        reptiles: ['snake', 'lizard', 'turtle', 'crocodile', 'alligator', 'iguana']
      },
      vehicles: {
        land: ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'van', 'taxi', 'scooter', 'ambulance', 'police car'],
        air: ['airplane', 'helicopter', 'jet', 'drone', 'balloon'],
        water: ['boat', 'ship', 'yacht', 'submarine', 'kayak', 'canoe'],
        rail: ['train', 'subway', 'tram']
      },
      food: {
        fruits: ['apple', 'banana', 'orange', 'strawberry', 'grape', 'pineapple', 'mango', 'watermelon', 'lemon', 'cherry'],
        vegetables: ['carrot', 'broccoli', 'potato', 'tomato', 'onion', 'pepper', 'cucumber', 'lettuce', 'spinach'],
        meals: ['pizza', 'burger', 'sandwich', 'pasta', 'rice', 'salad', 'soup', 'sushi'],
        desserts: ['cake', 'cookie', 'ice cream', 'chocolate', 'donut', 'pie'],
        beverages: ['coffee', 'tea', 'juice', 'water', 'soda', 'wine', 'beer']
      },
      technology: ['phone', 'laptop', 'computer', 'tablet', 'camera', 'tv', 'monitor', 'keyboard', 'mouse', 'headphones'],
      furniture: ['chair', 'table', 'bed', 'sofa', 'desk', 'bookshelf', 'cabinet', 'wardrobe'],
      clothing: ['shirt', 'pants', 'dress', 'jacket', 'shoes', 'hat', 'socks', 'gloves', 'tie'],
      nature: ['tree', 'flower', 'mountain', 'beach', 'sky', 'cloud', 'grass', 'rock', 'water', 'sun', 'moon', 'star', 'forest', 'river', 'lake'],
      people: ['person', 'man', 'woman', 'child', 'face', 'hand', 'body', 'baby', 'adult', 'human'],
      sports: ['ball', 'football', 'basketball', 'tennis', 'golf', 'baseball', 'soccer', 'hockey'],
      tools: ['hammer', 'screwdriver', 'wrench', 'saw', 'drill', 'knife', 'scissors']
    };

    const lowerClassName = className.toLowerCase();
    
    // First, try subcategory matching for animals, vehicles, and food
    for (const [mainCategory, subcategories] of Object.entries(categories)) {
      if (typeof subcategories === 'object' && !Array.isArray(subcategories)) {
        for (const [subCategory, items] of Object.entries(subcategories)) {
          if (items.some(item => lowerClassName.includes(item))) {
            return `${mainCategory}-${subCategory}`;
          }
        }
      } else if (Array.isArray(subcategories)) {
        if (subcategories.some(item => lowerClassName.includes(item))) {
          return mainCategory;
        }
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
        version: 'Standard',
        description: 'Image classification with 1000+ categories'
      },
      cocoSsd: {
        loaded: !!this.models.cocoSsd,
        version: 'Standard',
        description: 'Object detection with 80+ object types'
      },
      ensemble: {
        description: 'Combined predictions from multiple models for higher accuracy'
      }
    };
  }

  // Memory cleanup
  dispose() {
    try {
      if (this.models.mobilenet) {
        this.models.mobilenet.dispose();
        this.models.mobilenet = null;
      }
      if (this.models.cocoSsd) {
        this.models.cocoSsd.dispose();
        this.models.cocoSsd = null;
      }
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  }
}

// Create and export singleton instance
const enhancedAiServiceInstance = new EnhancedAIService();
export default enhancedAiServiceInstance;