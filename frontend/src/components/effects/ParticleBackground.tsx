import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const lastTime = useRef<number>(0);
  const fps = useRef<number>(60);
  const frameCount = useRef<number>(0);
  const isVisible = useRef<boolean>(true);
  const prefersReducedMotion = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
      if (e.matches) {
        // Pause animation for reduced motion
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      } else {
        // Resume animation
        if (!animationFrameId.current && isVisible.current) {
          animate();
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleMotionChange);

    // Page visibility API for performance
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
      if (document.hidden) {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      } else if (!prefersReducedMotion.current) {
        animate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set canvas size to match window size
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reset particles when resizing
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    function initParticles() {
      if (!canvas) return;
      
      // Reduce particle count on mobile devices for better performance
      const isMobile = window.innerWidth < 768;
      const baseCount = isMobile ? 20 : Math.floor(window.innerWidth / 20);
      const particleCount = Math.min(Math.max(baseCount, 15), isMobile ? 40 : 80);
      
      particles.current = [];

      for (let i = 0; i < particleCount; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.3),
          speedY: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.3),
          opacity: Math.random() * 0.4 + 0.1,
          color: Math.random() > 0.8 ? '#D7FF00' : '#ffffff',
        });
      }
    }

    function drawParticles() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles first
      particles.current.forEach((particle) => {
        if (!ctx) return;
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections with optimized algorithm - only check forward to avoid duplicates
      // Only draw connections every few frames to reduce computational load
      if (frameCount.current % 2 === 0 && ctx) {
        const maxDistance = 100;
        const maxDistanceSquared = maxDistance * maxDistance;
        
        for (let i = 0; i < particles.current.length; i++) {
          const particle = particles.current[i];
          
          // Only check particles after this one to avoid duplicate connections
          for (let j = i + 1; j < particles.current.length; j++) {
            const otherParticle = particles.current[j];
            
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared < maxDistanceSquared) {
              const distance = Math.sqrt(distanceSquared);
              ctx.beginPath();
              ctx.strokeStyle = particle.color === '#D7FF00' ? '#D7FF00' : '#ffffff';
              ctx.globalAlpha = (maxDistance - distance) / 1000 * particle.opacity;
              ctx.lineWidth = 0.15;
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.stroke();
            }
          }
        }
      }
    }

    function updateParticles() {
      if (!canvas) return;
      
      particles.current.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap particles around screen edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
    }

    function animate(currentTime?: number) {
      if (!isVisible.current || prefersReducedMotion.current) return;
      
      // Throttle to ~30 FPS for better performance
      if (currentTime && currentTime - lastTime.current < 33) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }
      
      lastTime.current = currentTime || 0;
      frameCount.current++;
      
      updateParticles();
      drawParticles();
      animationFrameId.current = requestAnimationFrame(animate);
    }

    initParticles();
    if (!prefersReducedMotion.current) {
      animate();
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-10"
      aria-hidden="true"
      style={{
        // Optimize rendering performance
        willChange: prefersReducedMotion.current ? 'auto' : 'transform',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
      }}
    />
  );
}

export default ParticleBackground;
