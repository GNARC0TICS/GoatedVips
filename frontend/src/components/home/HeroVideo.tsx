import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * HeroVideo defers rendering the <video> element until the component scrolls
 * into view. Combined with being imported via React.lazy higher up the tree,
 * this ensures no bytes are downloaded or decoded until the user is likely to
 * see the hero animation.
 */
export function HeroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-8"
    >
      {isVisible && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="mx-auto h-64 md:h-80 w-auto object-contain"
        >
          <source src="/images/FINAL.webm" type="video/webm" />
          <source src="/images/FINAL.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </motion.div>
  );
}

// Provide default export to support React.lazy
export default HeroVideo;