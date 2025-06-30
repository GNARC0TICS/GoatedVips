import { useInView } from "framer-motion";
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
    <div ref={containerRef} className="mb-8 sm:mb-12">
      {!isLoaded && isVisible && (
        <div className="flex items-center justify-center h-64 md:h-80 bg-[#1A1B21]">
          <div className="w-8 h-8 border-2 border-[#D7FF00] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {isVisible && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          className="mx-auto h-64 md:h-80 lg:h-96 w-auto object-contain"
          style={{ opacity: isLoaded ? 1 : 0 }}
        >
          <source src="/images/FINAL.webm" type="video/webm" />
          <source src="/images/FINAL.mp4" type="video/mp4" />
          <div className="flex items-center justify-center h-64 md:h-80 bg-[#1A1B21]">
            <p className="text-[#8A8B91] text-center">
              Your browser does not support video playback.
            </p>
          </div>
        </video>
      )}
    </div>
  );
}

// Enhanced memo export for performance
export default React.memo(HeroVideo);