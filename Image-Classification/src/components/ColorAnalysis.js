import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiLayers, FiEye, FiDownload, FiInfo, FiImage, FiEdit3, FiRotateCw } from 'react-icons/fi';
import { BiColorFill, BiAnalyse } from 'react-icons/bi';
import './ColorAnalysis.css';

const ColorAnalysis = ({ colorData, onClose, originalImage }) => {
  if (!colorData) return null;

  const {
    dominantColors,
    colorPalette,
    colorDistribution,
    colorStats,
    originalDimensions
  } = colorData;

  const [selectedSourceColor, setSelectedSourceColor] = useState(null);
  const [selectedTargetColor, setSelectedTargetColor] = useState('#ff0000');
  const [recoloredImage, setRecoloredImage] = useState(null);
  const [isRecoloring, setIsRecoloring] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const canvasRef = useRef(null);


  const copyColorToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    // Could show a toast notification here
  };

  // Function to replace colors in the image
  const replaceColor = async (sourceColor, targetColor, tolerance = 30) => {
    if (!originalImage || !sourceColor || !targetColor) return;

    setIsRecoloring(true);
    
    try {
      // Create canvas and get image data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load the original image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Parse source and target colors
        const sourceRGB = hexToRgb(sourceColor.hex);
        const targetRGB = hexToRgb(targetColor);
        
        // Replace colors
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate color distance
          const distance = Math.sqrt(
            Math.pow(r - sourceRGB.r, 2) +
            Math.pow(g - sourceRGB.g, 2) +
            Math.pow(b - sourceRGB.b, 2)
          );
          
          // If color is within tolerance, replace it
          if (distance <= tolerance) {
            // Blend based on distance for smooth transition
            const blend = 1 - (distance / tolerance);
            data[i] = r + (targetRGB.r - r) * blend;
            data[i + 1] = g + (targetRGB.g - g) * blend;
            data[i + 2] = b + (targetRGB.b - b) * blend;
          }
        }
        
        // Apply the modified image data
        ctx.putImageData(imageData, 0, 0);
        setRecoloredImage(canvas.toDataURL('image/png'));
        setIsRecoloring(false);
      };
      
      img.onerror = () => {
        console.error('Failed to load original image');
        setIsRecoloring(false);
      };
      
      img.src = originalImage.src;
      
    } catch (error) {
      console.error('Error replacing color:', error);
      setIsRecoloring(false);
    }
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Handle color selection for replacement
  const handleColorSelect = (color) => {
    setSelectedSourceColor(color);
    setShowColorPicker(true);
  };

  // Apply color replacement
  const applyColorReplacement = () => {
    if (selectedSourceColor && selectedTargetColor) {
      replaceColor(selectedSourceColor, selectedTargetColor);
      setShowColorPicker(false);
    }
  };

  // Reset to original image
  const resetImage = () => {
    setRecoloredImage(null);
    setSelectedSourceColor(null);
    setShowColorPicker(false);
  };

  // Download recolored image
  const downloadRecoloredImage = () => {
    if (recoloredImage) {
      const link = document.createElement('a');
      link.download = 'recolored-image.png';
      link.href = recoloredImage;
      link.click();
    }
  };

  return (
    <motion.div 
      className="color-analysis-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="color-analysis-container">
        <motion.div 
          className="color-analysis-header"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="header-title">
            <FiLayers className="header-icon" />
            <h2>Color Analysis & Color Replacement</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </motion.div>

        <div className="color-analysis-content">

          {/* Color Replacement Section */}
          <motion.div 
            className="color-replacement-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="section-header">
              <FiEdit3 className="section-icon" />
              <h3>Color Replacement</h3>
              <div className="replacement-controls">
                {recoloredImage && (
                  <motion.button
                    className="reset-btn"
                    onClick={resetImage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiRotateCw />
                    Reset
                  </motion.button>
                )}
                {recoloredImage && (
                  <motion.button
                    className="download-btn"
                    onClick={downloadRecoloredImage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiDownload />
                    Download
                  </motion.button>
                )}
              </div>
            </div>
            
            <div className="replacement-workspace">
              <div className="replacement-image-container">
                <img 
                  src={recoloredImage || originalImage?.src} 
                  alt="Image for recoloring" 
                  className="replacement-image"
                />
                {isRecoloring && (
                  <div className="recoloring-overlay">
                    <div className="recoloring-spinner"></div>
                    <p>Applying color changes...</p>
                  </div>
                )}
              </div>
              
              <div className="replacement-instructions">
                <p>Click on a color below to replace it with a new color:</p>
                {selectedSourceColor && (
                  <div className="color-selection-info">
                    <span>Selected: {selectedSourceColor.name}</span>
                    <div 
                      className="selected-color-preview"
                      style={{ backgroundColor: selectedSourceColor.hex }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Color Picker Modal */}
          {showColorPicker && (
            <motion.div 
              className="color-picker-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="color-picker-modal">
                <h4>Choose Replacement Color</h4>
                <div className="color-picker-content">
                  <div className="color-comparison">
                    <div className="color-sample">
                      <div 
                        className="color-preview"
                        style={{ backgroundColor: selectedSourceColor?.hex }}
                      ></div>
                      <span>Original</span>
                    </div>
                    <span className="arrow">→</span>
                    <div className="color-sample">
                      <div 
                        className="color-preview"
                        style={{ backgroundColor: selectedTargetColor }}
                      ></div>
                      <span>New</span>
                    </div>
                  </div>
                  
                  <input
                    type="color"
                    value={selectedTargetColor}
                    onChange={(e) => setSelectedTargetColor(e.target.value)}
                    className="color-input"
                  />
                  
                  <div className="color-picker-actions">
                    <button 
                      className="cancel-btn"
                      onClick={() => setShowColorPicker(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="apply-btn"
                      onClick={applyColorReplacement}
                      disabled={isRecoloring}
                    >
                      {isRecoloring ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Color Palette Section */}
          <motion.div 
            className="color-palette-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="section-header">
              <BiColorFill className="section-icon" />
              <h3>Dominant Colors</h3>
            </div>
            <div className="dominant-colors-grid">
              {dominantColors.map((color, index) => (
                <motion.div
                  key={index}
                  className={`color-card ${selectedSourceColor?.hex === color.hex ? 'selected' : ''}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => handleColorSelect(color)}
                >
                  <div 
                    className="color-swatch"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="color-info">
                    <div className="color-name">{color.name}</div>
                    <div className="color-hex">{color.hex}</div>
                    <div className="color-percentage">
                      {color.percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="color-values">
                    <div className="rgb-values">
                      RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                    </div>
                    <div className="hsl-values">
                      HSL({color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%)
                    </div>
                  </div>
                  <div className="color-actions">
                    <button 
                      className="copy-color-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyColorToClipboard(color.hex);
                      }}
                      title="Copy color code"
                    >
                      Copy
                    </button>
                    <button 
                      className="replace-color-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColorSelect(color);
                      }}
                      title="Replace this color"
                    >
                      <FiEdit3 />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Color Distribution Analysis */}
          <motion.div 
            className="color-stats-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="section-header">
              <BiAnalyse className="section-icon" />
              <h3>Color Analysis</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Color Temperature</div>
                <div className="stat-value temperature">
                  {colorDistribution.colorTemperature}
                </div>
                <div className="stat-description">
                  {colorDistribution.warmColorRatio > 0.6 ? 'Warm tones dominate' :
                   colorDistribution.coolColorRatio > 0.6 ? 'Cool tones dominate' :
                   'Balanced temperature'}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Vibrancy</div>
                <div className="stat-value vibrancy">
                  {colorDistribution.vibrancy}
                </div>
                <div className="stat-description">
                  Avg Saturation: {colorDistribution.averageSaturation.toFixed(1)}%
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Brightness</div>
                <div className="stat-value brightness">
                  {colorDistribution.brightness}
                </div>
                <div className="stat-description">
                  Avg Lightness: {colorDistribution.averageLightness.toFixed(1)}%
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Color Harmony</div>
                <div className="stat-value harmony">
                  {colorStats.colorHarmony}
                </div>
                <div className="stat-description">
                  Scheme: {colorStats.colorScheme}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Contrast Ratio</div>
                <div className="stat-value contrast">
                  {colorStats.contrastRatio.toFixed(2)}:1
                </div>
                <div className="stat-description">
                  {colorStats.contrastRatio > 4.5 ? 'High contrast' :
                   colorStats.contrastRatio > 3 ? 'Medium contrast' :
                   'Low contrast'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Color Palette Categories */}
          <motion.div 
            className="palette-categories-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="section-header">
              <FiEye className="section-icon" />
              <h3>Color Categorization</h3>
            </div>
            <div className="palette-categories">
              {Object.entries(colorPalette).map(([category, colors]) => {
                if (colors.length === 0) return null;
                return (
                  <div key={category} className="palette-category">
                    <div className="category-title">
                      {category.charAt(0).toUpperCase() + category.slice(1)} Colors
                    </div>
                    <div className="category-colors">
                      {colors.slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="mini-color-swatch"
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name} - ${color.hex}`}
                          onClick={() => copyColorToClipboard(color.hex)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Technical Info */}
          <motion.div 
            className="technical-info-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="section-header">
              <FiInfo className="section-icon" />
              <h3>Technical Information</h3>
            </div>
            <div className="technical-info">
              <div className="info-item">
                <span className="info-label">Image Dimensions:</span>
                <span className="info-value">
                  {originalDimensions.width} × {originalDimensions.height}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Colors Analyzed:</span>
                <span className="info-value">{colorStats.totalColors}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Most Dominant Color:</span>
                <span className="info-value">
                  {colorStats.mostDominant?.name} ({colorStats.mostDominant?.hex})
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ColorAnalysis;