
import React, { useRef, useEffect, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  baseX: number;
  baseY: number;
  angle: number;
  velocity: number;
  wobble: number;
  wobbleSpeed: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const mousePosition = useRef<{ x: number; y: number } | null>(null);
  const [carouselEffect, setCarouselEffect] = useState<{ direction: 'left' | 'right', strength: number, x: number } | null>(null);
  
  // Observe carousel transitions with improved detection
  useEffect(() => {
    // Create a custom event for carousel changes that FeatureCarousel will dispatch
    window.addEventListener('carouselChange', ((e: CustomEvent) => {
      const { direction } = e.detail;
      const centerX = window.innerWidth / 2;
      
      // Apply wind effect based on direction
      setCarouselEffect({
        direction: direction === 'next' ? 'left' : 'right',
        strength: 1.5, // Increased strength for visibility
        x: centerX
      });
      
      // Reset the effect after animation completes
      setTimeout(() => {
        setCarouselEffect(null);
      }, 1000);
    }) as EventListener);
    
    // Fallback to DOM observation method
    const observeCarousel = () => {
      const carouselElement = document.querySelector('.feature-carousel');
      
      if (!carouselElement) {
        // If not found yet, try again after a short delay
        setTimeout(observeCarousel, 500);
        return;
      }
      
      // Create a MutationObserver to watch for changes in the carousel
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' || 
             (mutation.type === 'attributes' && mutation.attributeName === 'style')) {
            
            // Detect direction based on DOM changes
            const target = mutation.target as HTMLElement;
            const isNext = target.classList.contains('next') || 
                         target.getAttribute('data-direction') === 'next';
            
            const direction = isNext ? 'left' : 'right';
            const centerX = window.innerWidth / 2;
            
            setCarouselEffect({
              direction,
              strength: 1.5, // Increased strength for visibility
              x: centerX
            });
            
            // Reset the effect after animation completes
            setTimeout(() => {
              setCarouselEffect(null);
            }, 1000);
            
            // Only trigger once per mutation batch
            break;
          }
        }
      });
      
      // Observe the entire carousel for any changes
      observer.observe(carouselElement, { 
        childList: true, 
        attributes: true, 
        attributeFilter: ['style', 'class'],
        subtree: true 
      });
      
      return () => observer.disconnect();
    };
    
    observeCarousel();
    
    return () => {
      window.removeEventListener('carouselChange', ((e: CustomEvent) => {}) as EventListener);
    };
  }, []);

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
      // Reduce particle count for a cleaner effect
      const particleCount = Math.min(Math.max(Math.floor(window.innerWidth / 20), 40), 100);
      particles.current = [];

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 0.5;
        // More varied speeds for dynamic movement
        const speedX = (Math.random() - 0.5) * 0.4;
        const speedY = (Math.random() - 0.5) * 0.4;
        // Add randomness to particle properties
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 0.3 + 0.1;
        const wobble = Math.random() * 10;
        const wobbleSpeed = Math.random() * 0.03 + 0.01;
        
        particles.current.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size,
          speedX,
          speedY,
          opacity: Math.random() * 0.3 + 0.1, // More transparent
          angle,
          velocity,
          wobble,
          wobbleSpeed
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((particle, i) => {
        // Create a softer glow effect for particles
        const glow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4 // Larger blur radius
        );
        glow.addColorStop(0, 'rgba(215, 255, 0, 0.4)');
        glow.addColorStop(0.5, 'rgba(215, 255, 0, 0.1)');
        glow.addColorStop(1, 'rgba(215, 255, 0, 0)');
        
        // Draw the glow with reduced opacity
        ctx.globalAlpha = particle.opacity * 0.2;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the particle core with reduced opacity
        ctx.globalAlpha = particle.opacity * 1.0; // Less bright
        ctx.fillStyle = '#D7FF00';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections between nearby particles
        for (let j = i + 1; j < particles.current.length; j++) {
          const otherParticle = particles.current[j];
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            // Create gradient connections for a more vibrant effect
            const gradient = ctx.createLinearGradient(
              particle.x, particle.y,
              otherParticle.x, otherParticle.y
            );
            gradient.addColorStop(0, `rgba(215, 255, 0, ${(120 - distance) / 800 * particle.opacity})`);
            gradient.addColorStop(1, `rgba(215, 255, 0, ${(120 - distance) / 800 * otherParticle.opacity})`);
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.globalAlpha = (120 - distance) / 800 * (particle.opacity + otherParticle.opacity) / 2;
            ctx.lineWidth = 0.3; 
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        }
      });
    }

    function updateParticles() {
      particles.current.forEach((particle) => {
        // Natural movement with wobble effect
        particle.angle += particle.wobbleSpeed;
        const wobbleX = Math.sin(particle.angle) * particle.wobble;
        const wobbleY = Math.cos(particle.angle) * particle.wobble;
        
        // Update particle position with natural movement
        particle.x += particle.speedX + (Math.sin(particle.angle) * 0.2);
        particle.y += particle.speedY + (Math.cos(particle.angle) * 0.1);
        
        // Add ember/spark-like floating effect
        particle.y -= Math.random() * 0.1; // Slight upward drift like embers
        
        // Mouse interaction - particles move away from cursor
        if (mousePosition.current) {
          const dx = mousePosition.current.x - particle.x;
          const dy = mousePosition.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150; // Increased influence radius
          
          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            // Enhanced repulsion effect
            particle.x -= dx * force * 0.05;
            particle.y -= dy * force * 0.05;
          } else {
            // Gradually return to natural movement when not influenced by mouse
            particle.x += (particle.baseX - particle.x) * 0.003;
            particle.y += (particle.baseY - particle.y) * 0.003;
          }
        }
        
        // Enhanced carousel wind effect
        if (carouselEffect) {
          const dx = particle.x - carouselEffect.x;
          const dy = particle.y - window.innerHeight / 2;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 600; // Increased wind effect range
          
          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance * carouselEffect.strength;
            const windDirectionX = carouselEffect.direction === 'left' ? -1 : 1;
            
            // Apply stronger wind force based on direction and distance
            particle.x += windDirectionX * force * 5; // Increased force for visibility
            
            // Add more vertical spread for dramatic wind effect
            particle.y += (Math.random() - 0.5) * force * 1.5;
            
            // Temporarily increase particle opacity for visual emphasis
            particle.opacity = Math.min(particle.opacity * 1.5, 0.6);
          }
        }

        // Wrap particles around screen edges with a slight buffer
        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;
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
  }, [carouselEffect]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-20"
      aria-hidden="true"
    />
  );
}

export default ParticleBackground;
