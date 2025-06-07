import React from "react";

/**
 * HeroVideo
 * Renders the top hero section with a video background.
 * Mobile-first responsive design with optimized video sizing and fallbacks.
 * DESIGN AGENT: Replace the video source and overlay with final assets and styles as needed.
 * - Add overlays, gradients, or text as per design.
 * - Ensure responsiveness and accessibility.
 */
const HeroVideo: React.FC = () => {
  return (
    <div className="w-full flex justify-center items-center relative overflow-hidden">
      {/* Mobile-optimized video with better aspect ratio handling */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-auto object-contain transition-all duration-300"
        style={{
          aspectRatio: '16/9',
          maxHeight: '60vh'
        }}
        aria-label="GoatedVips Hero Video"
        poster="/images/hero-poster.jpg" // Fallback poster image
      >
        <source src="/images/FINAL.mp4" type="video/mp4" />
        <source src="/images/FINAL.webm" type="video/webm" />
        {/* Fallback content for browsers that don't support video */}
        <div className="flex flex-col items-center justify-center h-48 sm:h-56 md:h-64 lg:h-72 bg-[#1A1B21] rounded-xl border border-[#2A2B31]">
          <div className="text-center px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-[#D7FF00] mb-2">
              GOATED VIPS
            </h1>
            <p className="text-sm sm:text-base text-[#8A8B91]">
              Your browser doesn't support video playback
            </p>
          </div>
        </div>
      </video>
      
      {/* Optional overlay for enhanced visibility (uncomment as needed) */}
      {/* 
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      */}
      
      {/* DESIGN AGENT: Add overlay, gradients, or hero text here */}
    </div>
  );
};

export default HeroVideo; 