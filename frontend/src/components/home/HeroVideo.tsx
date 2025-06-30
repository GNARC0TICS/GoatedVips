import { motion, useInView } from "framer-motion";
import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * HeroVideo defers rendering the <video> element until the component scrolls
 * into view. Combined with being imported via React.lazy higher up the tree,
 * this ensures no bytes are downloaded or decoded until the user is likely to
 * see the hero animation.
 */
export function HeroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isInView = useInView(containerRef, { margin: "100px" });

  const handleVideoLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleVideoError = useCallback(() => {
    console.warn('Hero video failed to load');
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px 200px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Enhanced video controls
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isInView) return;

    if (isInView && isLoaded) {
      video.play().catch(() => {
        // Autoplay failed, which is expected in some browsers
      });
    } else {
      video.pause();
    }
  }, [isInView, isLoaded]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2
      }}
      className="mb-8 sm:mb-12 relative group"
    >
      {/* Enhanced Background Glow */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-[#D7FF00]/10 via-[#00C9FF]/5 to-[#D7FF00]/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.6 }}
      />
      
      {/* Loading Skeleton */}
      {!isLoaded && isVisible && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-[#1A1B21] via-[#2A2B31] to-[#1A1B21] rounded-xl animate-pulse"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center h-64 md:h-80">
            <motion.div
              className="w-8 h-8 border-2 border-[#D7FF00] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
      
      {isVisible && (
        <motion.video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          className="relative mx-auto h-64 md:h-80 lg:h-96 w-auto object-contain rounded-xl shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(215,255,0,0.3)]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 0.8
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <source src="/images/FINAL.webm" type="video/webm" />
          <source src="/images/FINAL.mp4" type="video/mp4" />
          {/* Enhanced fallback */}
          <div className="flex items-center justify-center h-64 md:h-80 bg-[#1A1B21] rounded-xl border border-[#2A2B31]">
            <p className="text-[#8A8B91] text-center">
              Your browser does not support video playback.
              <br />
              <span className="text-sm text-[#D7FF00]">Please try a modern browser.</span>
            </p>
          </div>
        </motion.video>
      )}
      
      {/* Decorative Frame */}
      <motion.div 
        className="absolute inset-0 border border-[#D7FF00]/20 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

// Enhanced memo export for performance
export default React.memo(HeroVideo);