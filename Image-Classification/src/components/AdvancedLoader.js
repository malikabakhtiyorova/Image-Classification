import React from 'react';
import { motion } from 'framer-motion';
import { AiOutlineRobot } from 'react-icons/ai';

const AdvancedLoader = ({ progress = 0, message = 'Loading...' }) => {
  const neuralNodes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i * 360) / 8,
  }));

  return (
    <div className="advanced-loader">
      <div className="loader-content">
        {/* Neural Network Animation */}
        <div className="neural-network">
          <div className="center-node">
            <motion.div
              className="center-core"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <AiOutlineRobot />
            </motion.div>
          </div>
          
          {neuralNodes.map((node, index) => (
            <motion.div
              key={node.id}
              className="neural-node"
              style={{
                transform: `rotate(${node.angle}deg) translateY(-60px)`,
              }}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                delay: index * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Connection Lines */}
          {neuralNodes.map((node, index) => (
            <motion.div
              key={`line-${node.id}`}
              className="connection-line"
              style={{
                transform: `rotate(${node.angle}deg)`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scaleY: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                delay: index * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Progress Bars */}
        <div className="progress-container">
          <div className="progress-label">{message}</div>
          <div className="progress-main">
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="progress-text">{progress}%</div>
          </div>
          <div className="progress-bars">
            {[1, 2, 3].map((bar) => (
              <motion.div
                key={bar}
                className="progress-bar"
                animate={{
                  scaleX: progress > bar * 33 ? 1 : [0, 1, 0],
                }}
                transition={{
                  duration: progress > bar * 33 ? 0.3 : 1.5,
                  delay: progress > bar * 33 ? 0 : bar * 0.3,
                  repeat: progress > bar * 33 ? 0 : Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* Scanning Effect */}
        <motion.div
          className="scan-line"
          animate={{
            x: [-200, 200],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Loading Text with Typewriter Effect */}
        <motion.div
          className="loading-text-advanced"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.span
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Loading AI Vision System...
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedLoader;