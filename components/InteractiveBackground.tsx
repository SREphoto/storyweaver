
import React, { useEffect, useRef } from 'react';

interface InteractiveBackgroundProps {
  theme: 'dark' | 'light';
}

const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Interaction State
    let mouseX = -1000;
    let mouseY = -1000;
    let isHovering = false;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isHovering = true;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
        if(e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
            isHovering = true;
        }
    };

    const handleMouseLeave = () => {
        isHovering = false;
        mouseX = -1000;
        mouseY = -1000;
    }

    // Particle Configuration
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      originalColor: string;
      glowStrength: number;
    }

    let particles: Particle[] = [];
    const particleCount = width < 768 ? 40 : 80; // Fewer particles on mobile

    // Colors
    const darkColors = [
        'rgba(99, 102, 241, ',  // Indigo
        'rgba(244, 63, 94, ',   // Rose
        'rgba(14, 165, 233, ',  // Sky
        'rgba(168, 85, 247, '   // Purple
    ];

    const lightColors = [
        'rgba(14, 165, 233, ',  // Sky
        'rgba(99, 102, 241, ',  // Indigo
        'rgba(56, 189, 248, ',  // Light Blue
        'rgba(139, 92, 246, '   // Violet
    ];

    const getColors = () => theme === 'dark' ? darkColors : lightColors;

    const initParticles = () => {
      particles = [];
      const currentColors = getColors();
      for (let i = 0; i < particleCount; i++) {
        const r = Math.random() * 100 + 50; // Large radius for soft glow
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2, // Very slow drift
          vy: (Math.random() - 0.5) * 0.2,
          radius: r,
          originalColor: currentColors[Math.floor(Math.random() * currentColors.length)],
          color: '', // Set in animate loop
          glowStrength: Math.random() * 0.5 + 0.5
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Blending mode for glow effect
      ctx.globalCompositeOperation = theme === 'dark' ? 'screen' : 'multiply';

      particles.forEach(p => {
        // Basic movement
        p.x += p.vx;
        p.y += p.vy;

        // Interactive logic (Attraction/Glow)
        let alpha = theme === 'dark' ? 0.15 : 0.08; // Base opacity
        
        if (isHovering) {
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 400;

            if (distance < maxDist) {
                // Gentle attraction
                const force = (maxDist - distance) / maxDist;
                p.x += (dx / distance) * force * 0.5; 
                p.y += (dy / distance) * force * 0.5;
                
                // Increase brightness/opacity near mouse
                alpha += force * 0.2; 
            }
        }

        // Construct color with dynamic alpha
        p.color = p.originalColor + alpha + ')';

        // Wrap around edges
        if (p.x < -p.radius * 2) p.x = width + p.radius * 2;
        if (p.x > width + p.radius * 2) p.x = -p.radius * 2;
        if (p.y < -p.radius * 2) p.y = height + p.radius * 2;
        if (p.y > height + p.radius * 2) p.y = -p.radius * 2;

        // Draw Particle
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)');
        
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseout', handleMouseLeave);
    window.addEventListener('touchend', handleMouseLeave);

    initParticles(); // Initialize
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      window.removeEventListener('touchend', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]); // Re-init on theme change

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 transition-opacity duration-1000"
      style={{ opacity: 1 }} // Start visible
    />
  );
};

export default InteractiveBackground;
