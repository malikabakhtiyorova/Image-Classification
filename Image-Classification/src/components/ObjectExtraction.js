import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiScissors, FiDownload, FiEye, FiTrash2, FiRefreshCw, FiZoomIn, FiTarget, FiLayers } from 'react-icons/fi';
import { BiSelectMultiple, BiAnalyse } from 'react-icons/bi';
import objectExtractionService from '../services/objectExtractionService';
import './ObjectExtraction.css';

const ObjectExtraction = ({ originalImage, onClose }) => {
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [extractedObjects, setExtractedObjects] = useState([]);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [detectionStats, setDetectionStats] = useState(null);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Detect objects when component mounts
  useEffect(() => {
    if (originalImage) {
      detectObjects();
    }
  }, [originalImage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect objects in the image
  const detectObjects = async () => {
    console.log('🎯 detectObjects called, originalImage:', originalImage);
    
    if (!originalImage) {
      setError('No image provided for detection');
      return;
    }

    setIsDetecting(true);
    setError(null);
    setProcessingStatus('🔧 Initializing...');
    
    try {
      // Wait a moment to ensure image is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('📸 Image details:', {
        width: originalImage.width,
        height: originalImage.height,
        naturalWidth: originalImage.naturalWidth,
        naturalHeight: originalImage.naturalHeight,
        complete: originalImage.complete,
        src: originalImage.src ? 'present' : 'missing'
      });
      
      setProcessingStatus('📦 Loading AI model...');
      
      // Call detection service
      const objects = await objectExtractionService.detectObjects(originalImage);
      
      console.log('🎉 Detection result:', objects);
      
      setDetectedObjects(objects);
      setDetectionStats(objectExtractionService.getDetectionStats(objects));
      
      if (objects.length === 0) {
        setError('No objects found. Try an image with people, animals, cars, or furniture.');
      } else {
        setProcessingStatus('🎨 Drawing bounding boxes...');
        // Draw bounding boxes
        setTimeout(() => {
          drawBoundingBoxes(objects);
          setProcessingStatus('');
        }, 100);
      }
      
    } catch (error) {
      console.error('💥 Detection error:', error);
      setError(`Detection failed: ${error.message}`);
    } finally {
      setIsDetecting(false);
      setProcessingStatus('');
    }
  };

  // Draw bounding boxes on canvas overlay
  const drawBoundingBoxes = (objects) => {
    if (!canvasRef.current || !imageRef.current || !showBoundingBoxes) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Get display dimensions
    const displayWidth = img.offsetWidth;
    const displayHeight = img.offsetHeight;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Set canvas size to match displayed image
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Calculate scale factors
    const scaleX = displayWidth / naturalWidth;
    const scaleY = displayHeight / naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding boxes
    objects.forEach((obj, index) => {
      const { x, y, width, height } = obj.boundingBox;
      const isSelected = selectedObjects.some(selected => selected.id === obj.id);

      // Scale coordinates to match displayed image
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;

      // Set style based on selection
      ctx.strokeStyle = isSelected ? '#00d4ff' : '#ff6b6b';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.fillStyle = isSelected ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 107, 107, 0.2)';

      // Draw rectangle
      ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

      // Draw label
      const label = `${obj.class} (${Math.round(obj.confidence * 100)}%)`;
      const labelPadding = 4;
      const labelHeight = 20;
      const fontSize = Math.max(10, Math.min(14, displayWidth / 50));

      ctx.font = `${fontSize}px Arial`;
      const labelWidth = ctx.measureText(label).width;

      ctx.fillStyle = isSelected ? '#00d4ff' : '#ff6b6b';
      ctx.fillRect(scaledX, scaledY - labelHeight, labelWidth + labelPadding * 2, labelHeight);

      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, scaledX + labelPadding, scaledY - labelHeight / 2);
    });
  };

  // Handle object selection
  const toggleObjectSelection = (obj) => {
    setSelectedObjects(prev => {
      const isSelected = prev.some(selected => selected.id === obj.id);
      const newSelection = isSelected
        ? prev.filter(selected => selected.id !== obj.id)
        : [...prev, obj];
      
      // Redraw bounding boxes with new selection
      setTimeout(() => drawBoundingBoxes(detectedObjects), 0);
      
      return newSelection;
    });
  };

  // Extract selected objects
  const extractSelectedObjects = async () => {
    if (selectedObjects.length === 0) {
      setError('Please select objects to extract first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStatus('✂️ Extracting objects...');
    
    try {
      const extracted = [];
      
      for (let i = 0; i < selectedObjects.length; i++) {
        const obj = selectedObjects[i];
        setProcessingStatus(`✂️ Extracting ${obj.class} (${i + 1}/${selectedObjects.length})`);
        
        const extractedImageUrl = await objectExtractionService.extractObject(originalImage, obj.boundingBox);
        extracted.push({
          ...obj,
          extractedImage: extractedImageUrl
        });
      }
      
      setExtractedObjects(extracted);
      setProcessingStatus('✅ Extraction complete!');
      setTimeout(() => setProcessingStatus(''), 2000);
    } catch (error) {
      console.error('❌ Object extraction failed:', error);
      setError(`❌ Failed to extract objects: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove selected objects from image
  const removeSelectedObjects = async () => {
    if (selectedObjects.length === 0) {
      setError('Please select objects to remove first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStatus('🗑️ Removing objects...');
    
    try {
      setProcessingStatus('🎨 Intelligently filling background...');
      const processedImageUrl = await objectExtractionService.removeObjects(originalImage, selectedObjects);
      setProcessedImage(processedImageUrl);
      setProcessingStatus('✅ Objects removed successfully!');
      setTimeout(() => setProcessingStatus(''), 2000);
    } catch (error) {
      console.error('❌ Object removal failed:', error);
      setError(`❌ Failed to remove objects: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download extracted object
  const downloadExtractedObject = (extractedObj, index) => {
    const link = document.createElement('a');
    link.download = `extracted_${extractedObj.class}_${index + 1}.png`;
    link.href = extractedObj.extractedImage;
    link.click();
  };

  // Download processed image
  const downloadProcessedImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.download = 'image_with_objects_removed.png';
      link.href = processedImage;
      link.click();
    }
  };

  // Reset everything
  const resetExtraction = () => {
    setSelectedObjects([]);
    setProcessedImage(null);
    setExtractedObjects([]);
    drawBoundingBoxes(detectedObjects);
  };

  // Select all objects
  const selectAllObjects = () => {
    setSelectedObjects([...detectedObjects]);
    setTimeout(() => drawBoundingBoxes(detectedObjects), 0);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedObjects([]);
    setTimeout(() => drawBoundingBoxes(detectedObjects), 0);
  };

  // Toggle bounding box visibility
  const toggleBoundingBoxes = () => {
    setShowBoundingBoxes(prev => {
      const newValue = !prev;
      if (newValue) {
        drawBoundingBoxes(detectedObjects);
      } else {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return newValue;
    });
  };

  return (
    <motion.div 
      className="object-extraction-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="object-extraction-container">
        <motion.div 
          className="object-extraction-header"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="header-title">
            <FiScissors className="header-icon" />
            <h2>Object Extraction & Removal</h2>
          </div>
          <div className="header-controls">
            <button 
              className="toggle-boxes-btn"
              onClick={toggleBoundingBoxes}
              title={showBoundingBoxes ? 'Hide bounding boxes' : 'Show bounding boxes'}
            >
              <FiEye />
            </button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </motion.div>

        <div className="object-extraction-content">
          {/* Main Image Area */}
          <motion.div 
            className="image-workspace"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="image-container">
              <img 
                ref={imageRef}
                src={processedImage || originalImage?.src} 
                alt="Object extraction workspace" 
                className="main-image"
                onLoad={() => drawBoundingBoxes(detectedObjects)}
              />
              <canvas 
                ref={canvasRef}
                className="overlay-canvas"
                style={{ display: showBoundingBoxes ? 'block' : 'none' }}
              />
              
              {(isDetecting || isProcessing) && (
                <div className="processing-overlay">
                  <div className="processing-spinner"></div>
                  <p>{processingStatus || (isDetecting ? 'Detecting objects...' : 'Processing image...')}</p>
                </div>
              )}
              
              {error && (
                <div className="error-overlay">
                  <p className="error-message">{error}</p>
                  <button 
                    className="retry-btn"
                    onClick={() => {
                      setError(null);
                      if (detectedObjects.length === 0) {
                        detectObjects();
                      }
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Image Controls */}
            <div className="image-controls">
              <motion.button
                className="extract-btn"
                onClick={extractSelectedObjects}
                disabled={selectedObjects.length === 0 || isProcessing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiScissors />
                Extract Objects ({selectedObjects.length})
              </motion.button>
              
              <motion.button
                className="remove-btn"
                onClick={removeSelectedObjects}
                disabled={selectedObjects.length === 0 || isProcessing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiTrash2 />
                Remove Objects
              </motion.button>
              
              {processedImage && (
                <motion.button
                  className="download-btn"
                  onClick={downloadProcessedImage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiDownload />
                  Download
                </motion.button>
              )}
              
              <motion.button
                className="reset-btn"
                onClick={resetExtraction}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiRefreshCw />
                Reset
              </motion.button>
              
              <motion.button
                className="reset-btn"
                onClick={() => {
                  console.log('🔄 Manual detection trigger');
                  detectObjects();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiTarget />
                Test Detection
              </motion.button>
            </div>
          </motion.div>

          {/* Objects Panel */}
          <motion.div 
            className="objects-panel"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Detection Stats */}
            {detectionStats && (
              <div className="detection-stats">
                <h3><BiAnalyse /> Detection Results</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Objects Found:</span>
                    <span className="stat-value">{detectionStats.totalObjects}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Confidence:</span>
                    <span className="stat-value">{(detectionStats.averageConfidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Object Types:</span>
                    <span className="stat-value">{Object.keys(detectionStats.objectTypes).length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Object Selection Controls */}
            <div className="selection-controls">
              <h3><FiTarget /> Object Selection</h3>
              <div className="selection-buttons">
                <button 
                  className="select-all-btn"
                  onClick={selectAllObjects}
                  disabled={detectedObjects.length === 0}
                >
                  <BiSelectMultiple />
                  Select All
                </button>
                <button 
                  className="clear-selection-btn"
                  onClick={clearSelection}
                  disabled={selectedObjects.length === 0}
                >
                  Clear Selection
                </button>
              </div>
              <p className="selection-info">
                {selectedObjects.length} of {detectedObjects.length} objects selected
              </p>
            </div>

            {/* Detected Objects List */}
            <div className="detected-objects">
              <h3><FiLayers /> Detected Objects</h3>
              <div className="objects-list">
                {detectedObjects.map((obj, index) => {
                  const isSelected = selectedObjects.some(selected => selected.id === obj.id);
                  return (
                    <motion.div
                      key={obj.id}
                      className={`object-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleObjectSelection(obj)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="object-info">
                        <div className="object-name">{obj.class}</div>
                        <div className="object-details">
                          <span className="confidence">
                            {Math.round(obj.confidence * 100)}% confidence
                          </span>
                          <span className="dimensions">
                            {obj.boundingBox.width}×{obj.boundingBox.height}px
                          </span>
                        </div>
                      </div>
                      <div className="selection-indicator">
                        {isSelected ? '✓' : '○'}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Extracted Objects */}
            {extractedObjects.length > 0 && (
              <div className="extracted-objects">
                <h3><FiZoomIn /> Extracted Objects</h3>
                <div className="extracted-list">
                  {extractedObjects.map((obj, index) => (
                    <motion.div
                      key={obj.id}
                      className="extracted-item"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="extracted-preview">
                        <img 
                          src={obj.extractedImage} 
                          alt={`Extracted ${obj.class}`}
                          className="extracted-thumbnail"
                        />
                      </div>
                      <div className="extracted-info">
                        <div className="extracted-name">{obj.class}</div>
                        <button 
                          className="download-extracted-btn"
                          onClick={() => downloadExtractedObject(obj, index)}
                        >
                          <FiDownload />
                          Download
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ObjectExtraction;