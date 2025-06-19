class ColorAnalysisService {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.setupCanvas();
  }

  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  // Main color analysis function
  async analyzeImage(imageElement) {
    return new Promise((resolve, reject) => {
      try {
        // Set canvas size to match image
        this.canvas.width = imageElement.naturalWidth || imageElement.width;
        this.canvas.height = imageElement.naturalHeight || imageElement.height;
        
        // Draw image on canvas
        this.ctx.drawImage(imageElement, 0, 0, this.canvas.width, this.canvas.height);
        
        // Get image data
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Analyze colors
        const colorAnalysis = this.extractColorInformation(imageData);
        
        resolve({
          dominantColors: colorAnalysis.dominantColors,
          colorPalette: colorAnalysis.colorPalette,
          colorDistribution: colorAnalysis.colorDistribution,
          colorStats: colorAnalysis.colorStats,
          originalDimensions: {
            width: this.canvas.width,
            height: this.canvas.height
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Extract comprehensive color information with high accuracy
  extractColorInformation(imageData) {
    const pixels = imageData.data;
    const colorMap = new Map();
    const totalPixels = pixels.length / 4;
    
    // More precise sampling - every 2nd pixel for better accuracy
    const sampleRate = Math.max(1, Math.floor(totalPixels / 50000));
    
    for (let i = 0; i < pixels.length; i += 4 * sampleRate) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      
      if (a > 128) { // Only count non-transparent pixels
        // Use smaller grouping for more precise colors (5 instead of 10)
        const colorKey = `${Math.floor(r/5)*5},${Math.floor(g/5)*5},${Math.floor(b/5)*5}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }
    }

    // Get more dominant colors for better representation
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15); // Increase to 15 for more variety

    const dominantColors = sortedColors.map(([colorKey, count]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return {
        rgb: { r, g, b },
        hex: this.rgbToHex(r, g, b),
        hsl: this.rgbToHsl(r, g, b),
        percentage: (count / (totalPixels / sampleRate)) * 100,
        name: this.getAccurateColorName(r, g, b)
      };
    });

    // Create color palette (broader grouping)
    const colorPalette = this.createColorPalette(dominantColors);
    
    // Color distribution analysis
    const colorDistribution = this.analyzeColorDistribution(dominantColors);
    
    // Color statistics
    const colorStats = this.calculateColorStats(dominantColors);

    return {
      dominantColors,
      colorPalette,
      colorDistribution,
      colorStats
    };
  }



  // Create a simplified color palette
  createColorPalette(dominantColors) {
    const palette = {
      warm: [],
      cool: [],
      neutral: [],
      vibrant: [],
      muted: []
    };

    dominantColors.forEach(color => {
      const { r, g, b } = color.rgb;
      const { h, s, l } = color.hsl;
      
      // Categorize by temperature
      if (h >= 0 && h <= 60 || h >= 300) {
        palette.warm.push(color);
      } else if (h >= 180 && h <= 240) {
        palette.cool.push(color);
      } else {
        palette.neutral.push(color);
      }
      
      // Categorize by vibrancy
      if (s > 50 && l > 20 && l < 80) {
        palette.vibrant.push(color);
      } else {
        palette.muted.push(color);
      }
    });

    return palette;
  }

  // Analyze color distribution
  analyzeColorDistribution(dominantColors) {
    let totalSaturation = 0;
    let totalLightness = 0;
    let warmColors = 0;
    let coolColors = 0;

    dominantColors.forEach(color => {
      const { h, s, l } = color.hsl;
      totalSaturation += s;
      totalLightness += l;
      
      if (h >= 0 && h <= 60 || h >= 300) {
        warmColors++;
      } else if (h >= 180 && h <= 240) {
        coolColors++;
      }
    });

    const avgSaturation = totalSaturation / dominantColors.length;
    const avgLightness = totalLightness / dominantColors.length;

    return {
      averageSaturation: avgSaturation,
      averageLightness: avgLightness,
      warmColorRatio: warmColors / dominantColors.length,
      coolColorRatio: coolColors / dominantColors.length,
      colorTemperature: warmColors > coolColors ? 'warm' : coolColors > warmColors ? 'cool' : 'balanced',
      vibrancy: avgSaturation > 50 ? 'vibrant' : avgSaturation > 25 ? 'moderate' : 'muted',
      brightness: avgLightness > 60 ? 'bright' : avgLightness > 40 ? 'medium' : 'dark'
    };
  }

  // Calculate color statistics
  calculateColorStats(dominantColors) {
    const stats = {
      totalColors: dominantColors.length,
      mostDominant: dominantColors[0],
      colorHarmony: this.analyzeColorHarmony(dominantColors),
      contrastRatio: this.calculateContrastRatio(dominantColors),
      colorScheme: this.identifyColorScheme(dominantColors)
    };

    return stats;
  }

  // Analyze color harmony
  analyzeColorHarmony(colors) {
    if (colors.length < 2) return 'monochromatic';
    
    const hues = colors.map(c => c.hsl.h).sort((a, b) => a - b);
    const hueDifferences = [];
    
    for (let i = 1; i < hues.length; i++) {
      hueDifferences.push(hues[i] - hues[i-1]);
    }
    
    const avgDifference = hueDifferences.reduce((a, b) => a + b, 0) / hueDifferences.length;
    
    if (avgDifference < 30) return 'monochromatic';
    if (avgDifference < 60) return 'analogous';
    if (avgDifference > 120) return 'complementary';
    return 'triadic';
  }

  // Calculate contrast ratio
  calculateContrastRatio(colors) {
    if (colors.length < 2) return 1;
    
    const lightness = colors.map(c => c.hsl.l).sort((a, b) => a - b);
    const darkest = lightness[0];
    const lightest = lightness[lightness.length - 1];
    
    return (lightest + 5) / (darkest + 5);
  }

  // Identify color scheme
  identifyColorScheme(colors) {
    const hues = colors.map(c => c.hsl.h);
    const saturations = colors.map(c => c.hsl.s);
    const avgSaturation = saturations.reduce((a, b) => a + b, 0) / saturations.length;
    
    if (avgSaturation < 20) return 'monochromatic';
    if (hues.every(h => Math.abs(h - hues[0]) < 30)) return 'monochromatic';
    if (hues.some(h => Math.abs(h - hues[0]) > 150)) return 'complementary';
    return 'analogous';
  }

  // Utility functions
  rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  // Comprehensive color naming with accurate color recognition
  getAccurateColorName(r, g, b) {
    const colors = [
      // Reds
      { name: 'Crimson Red', rgb: [220, 20, 60] },
      { name: 'Fire Red', rgb: [255, 0, 0] },
      { name: 'Dark Red', rgb: [139, 0, 0] },
      { name: 'Brick Red', rgb: [178, 34, 34] },
      { name: 'Maroon', rgb: [128, 0, 0] },
      { name: 'Cherry Red', rgb: [222, 49, 99] },
      { name: 'Rose Red', rgb: [255, 102, 102] },
      
      // Pinks
      { name: 'Hot Pink', rgb: [255, 105, 180] },
      { name: 'Light Pink', rgb: [255, 182, 193] },
      { name: 'Deep Pink', rgb: [255, 20, 147] },
      { name: 'Pink', rgb: [255, 192, 203] },
      { name: 'Pale Pink', rgb: [250, 218, 221] },
      { name: 'Magenta', rgb: [255, 0, 255] },
      
      // Oranges
      { name: 'Orange', rgb: [255, 165, 0] },
      { name: 'Dark Orange', rgb: [255, 140, 0] },
      { name: 'Light Orange', rgb: [255, 218, 185] },
      { name: 'Peach', rgb: [255, 218, 185] },
      { name: 'Coral', rgb: [255, 127, 80] },
      { name: 'Tangerine', rgb: [255, 163, 67] },
      
      // Yellows
      { name: 'Yellow', rgb: [255, 255, 0] },
      { name: 'Light Yellow', rgb: [255, 255, 224] },
      { name: 'Golden Yellow', rgb: [255, 215, 0] },
      { name: 'Pale Yellow', rgb: [255, 255, 153] },
      { name: 'Lemon Yellow', rgb: [255, 247, 0] },
      { name: 'Cream', rgb: [255, 253, 208] },
      
      // Greens
      { name: 'Green', rgb: [0, 255, 0] },
      { name: 'Dark Green', rgb: [0, 100, 0] },
      { name: 'Light Green', rgb: [144, 238, 144] },
      { name: 'Forest Green', rgb: [34, 139, 34] },
      { name: 'Lime Green', rgb: [50, 205, 50] },
      { name: 'Olive Green', rgb: [128, 128, 0] },
      { name: 'Mint Green', rgb: [152, 251, 152] },
      { name: 'Sage Green', rgb: [159, 174, 134] },
      { name: 'Emerald Green', rgb: [80, 200, 120] },
      
      // Blues
      { name: 'Blue', rgb: [0, 0, 255] },
      { name: 'Light Blue', rgb: [173, 216, 230] },
      { name: 'Dark Blue', rgb: [0, 0, 139] },
      { name: 'Sky Blue', rgb: [135, 206, 235] },
      { name: 'Navy Blue', rgb: [0, 0, 128] },
      { name: 'Royal Blue', rgb: [65, 105, 225] },
      { name: 'Turquoise', rgb: [64, 224, 208] },
      { name: 'Cyan', rgb: [0, 255, 255] },
      { name: 'Teal', rgb: [0, 128, 128] },
      { name: 'Steel Blue', rgb: [70, 130, 180] },
      
      // Purples
      { name: 'Purple', rgb: [128, 0, 128] },
      { name: 'Light Purple', rgb: [221, 160, 221] },
      { name: 'Dark Purple', rgb: [75, 0, 130] },
      { name: 'Violet', rgb: [238, 130, 238] },
      { name: 'Lavender', rgb: [230, 230, 250] },
      { name: 'Indigo', rgb: [75, 0, 130] },
      { name: 'Plum', rgb: [221, 160, 221] },
      
      // Browns
      { name: 'Brown', rgb: [165, 42, 42] },
      { name: 'Light Brown', rgb: [205, 133, 63] },
      { name: 'Dark Brown', rgb: [101, 67, 33] },
      { name: 'Tan', rgb: [210, 180, 140] },
      { name: 'Beige', rgb: [245, 245, 220] },
      { name: 'Chocolate', rgb: [210, 105, 30] },
      { name: 'Coffee Brown', rgb: [111, 78, 55] },
      { name: 'Camel', rgb: [193, 154, 107] },
      
      // Grays
      { name: 'White', rgb: [255, 255, 255] },
      { name: 'Light Gray', rgb: [211, 211, 211] },
      { name: 'Gray', rgb: [128, 128, 128] },
      { name: 'Dark Gray', rgb: [105, 105, 105] },
      { name: 'Charcoal', rgb: [54, 69, 79] },
      { name: 'Silver', rgb: [192, 192, 192] },
      { name: 'Black', rgb: [0, 0, 0] },
      
      // Special colors
      { name: 'Gold', rgb: [255, 215, 0] },
      { name: 'Bronze', rgb: [205, 127, 50] },
      { name: 'Copper', rgb: [184, 115, 51] },
      { name: 'Khaki', rgb: [240, 230, 140] },
      { name: 'Ivory', rgb: [255, 255, 240] },
      { name: 'Off White', rgb: [248, 248, 255] }
    ];

    let minDistance = Infinity;
    let closestColor = 'Unknown Color';

    colors.forEach(color => {
      const distance = Math.sqrt(
        Math.pow(r - color.rgb[0], 2) +
        Math.pow(g - color.rgb[1], 2) +
        Math.pow(b - color.rgb[2], 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color.name;
      }
    });

    // If the distance is very large, describe the color more accurately
    if (minDistance > 100) {
      return this.describeColor(r, g, b);
    }

    return closestColor;
  }

  // Describe color based on HSL properties when no close match is found
  describeColor(r, g, b) {
    const hsl = this.rgbToHsl(r, g, b);
    const { h, s, l } = hsl;
    
    let description = '';
    
    // Determine lightness
    if (l > 80) description += 'Very Light ';
    else if (l > 60) description += 'Light ';
    else if (l < 20) description += 'Very Dark ';
    else if (l < 40) description += 'Dark ';
    
    // Determine saturation
    if (s < 20) description += 'Grayish ';
    else if (s > 80) description += 'Vivid ';
    else if (s > 60) description += 'Bright ';
    
    // Determine hue
    if (h >= 0 && h < 15) description += 'Red';
    else if (h >= 15 && h < 45) description += 'Orange';
    else if (h >= 45 && h < 75) description += 'Yellow';
    else if (h >= 75 && h < 150) description += 'Green';
    else if (h >= 150 && h < 210) description += 'Cyan';
    else if (h >= 210 && h < 270) description += 'Blue';
    else if (h >= 270 && h < 330) description += 'Purple';
    else description += 'Red';
    
    return description.trim();
  }

  // Cleanup
  dispose() {
    if (this.canvas) {
      this.canvas = null;
      this.ctx = null;
    }
  }
}

// Create and export singleton instance
const colorAnalysisService = new ColorAnalysisService();
export default colorAnalysisService;