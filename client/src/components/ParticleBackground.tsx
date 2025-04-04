
import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  baseX: number; // Store original position for mouse interaction
  baseY: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const mousePosition = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match window size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reset particles when resizing
      initParticles();
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      mousePosition.current = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    handleResize();

    function initParticles() {
      const particleCount = Math.min(Math.max(Math.floor(window.innerWidth / 15), 30), 100);
      particles.current = [];

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.current.push({
          x: x,
          y: y,
          baseX: x, // Store original position
          baseY: y,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((particle) => {
        // Increase base opacity to make particles brighter
        ctx.globalAlpha = particle.opacity * 1.5;
        ctx.fillStyle = '#D7FF00'; // All particles use the neon yellow color
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections between nearby particles
        particles.current.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = '#D7FF00'; // All connections are yellow
            // Increase connection opacity
            ctx.globalAlpha = (100 - distance) / 800 * particle.opacity;
            ctx.lineWidth = 0.3; // Slightly thicker lines
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
    }

    function updateParticles() {
      particles.current.forEach((particle) => {
        // Regular movement
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Mouse interaction - particles move away from cursor
        if (mousePosition.current) {
          const dx = mousePosition.current.x - particle.x;
          const dy = mousePosition.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 120; // The distance at which mouse influence starts
          
          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            // Push particles slightly away from mouse
            particle.x -= dx * force * 0.03;
            particle.y -= dy * force * 0.03;
          } else {
            // Gradually return to base position when not influenced by mouse
            particle.x += (particle.baseX - particle.x) * 0.01;
            particle.y += (particle.baseY - particle.y) * 0.01;
          }
        } else {
          // Return to base position when mouse isn't over canvas
          particle.x += (particle.baseX - particle.x) * 0.01;
          particle.y += (particle.baseY - particle.y) * 0.01;
        }

        // Wrap particles around screen edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
    }

    function animate() {
      updateParticles();
      drawParticles();
      animationFrameId.current = requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-25"
      aria-hidden="true"
    />
  );
}

export default ParticleBackground;
