import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles with dark mode colors
    const particleCount = 80;
    const particles = [];
    const colors = [
      { h: 200, s: 100, l: 60 }, // Cyan
      { h: 260, s: 80, l: 70 },  // Purple  
      { h: 330, s: 80, l: 70 },  // Pink
      { h: 120, s: 100, l: 60 }, // Green
      { h: 30, s: 100, l: 60 },  // Orange
    ];
    
    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        color: color,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    
    particlesRef.current = particles;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Update pulse for breathing effect
        particle.pulse += 0.02;
        const pulseFactor = 0.8 + Math.sin(particle.pulse) * 0.3;
        
        // Draw particle with enhanced glow effect
        const glowSize = particle.size * 4 * pulseFactor;
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize
        );
        
        const { h, s, l } = particle.color;
        gradient.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${particle.opacity * pulseFactor})`);
        gradient.addColorStop(0.3, `hsla(${h}, ${s}%, ${l}%, ${particle.opacity * 0.6})`);
        gradient.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connections
        particles.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
              const opacity = (120 - distance) / 120 * 0.15;
              const avgH = (particle.color.h + otherParticle.color.h) / 2;
              const avgS = (particle.color.s + otherParticle.color.s) / 2;
              const avgL = (particle.color.l + otherParticle.color.l) / 2;
              
              ctx.strokeStyle = `hsla(${avgH}, ${avgS}%, ${avgL}%, ${opacity})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.stroke();
              
              // Add glow to connections
              ctx.shadowColor = `hsla(${avgH}, ${avgS}%, ${avgL}%, ${opacity * 2})`;
              ctx.shadowBlur = 3;
              ctx.stroke();
              ctx.shadowBlur = 0;
            }
          }
        });
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="particle-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ParticleBackground;