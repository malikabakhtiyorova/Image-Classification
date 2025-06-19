import React from 'react';
import { motion } from 'framer-motion';

const GeometricShapes = () => {
  const shapes = [
    { id: 1, type: 'triangle', size: 120, x: '10%', y: '20%' },
    { id: 2, type: 'circle', size: 80, x: '85%', y: '15%' },
    { id: 3, type: 'square', size: 60, x: '15%', y: '75%' },
    { id: 4, type: 'hexagon', size: 100, x: '80%', y: '70%' },
    { id: 5, type: 'diamond', size: 70, x: '50%', y: '10%' },
    { id: 6, type: 'octagon', size: 90, x: '5%', y: '50%' },
  ];

  const getShapeElement = (shape) => {
    const baseStyle = {
      position: 'absolute',
      left: shape.x,
      top: shape.y,
      width: shape.size,
      height: shape.size,
      opacity: 0.1,
      pointerEvents: 'none',
    };

    switch (shape.type) {
      case 'triangle':
        return (
          <div
            style={{
              ...baseStyle,
              width: 0,
              height: 0,
              borderLeft: `${shape.size / 2}px solid transparent`,
              borderRight: `${shape.size / 2}px solid transparent`,
              borderBottom: `${shape.size}px solid currentColor`,
            }}
          />
        );
      case 'circle':
        return (
          <div
            style={{
              ...baseStyle,
              borderRadius: '50%',
              background: 'currentColor',
            }}
          />
        );
      case 'square':
        return (
          <div
            style={{
              ...baseStyle,
              background: 'currentColor',
            }}
          />
        );
      case 'hexagon':
        return (
          <div
            style={{
              ...baseStyle,
              background: 'currentColor',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
          />
        );
      case 'diamond':
        return (
          <div
            style={{
              ...baseStyle,
              background: 'currentColor',
              transform: 'rotate(45deg)',
            }}
          />
        );
      case 'octagon':
        return (
          <div
            style={{
              ...baseStyle,
              background: 'currentColor',
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="geometric-shapes">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="shape-container"
          style={{ color: '#ffffff' }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 15 + shape.id * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {getShapeElement(shape)}
        </motion.div>
      ))}
    </div>
  );
};

export default GeometricShapes;