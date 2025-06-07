import React from "react";
import FeatureCard from "./FeatureCard";
import { homeFeatures } from "@/data/homeFeatures";
import { useAuth } from "@/hooks/use-auth";

/**
 * FeatureCardGrid
 * Maps over homeFeatures config and renders a grid of FeatureCard components.
 * Mobile-first responsive grid with optimized spacing and breakpoints.
 * DESIGN AGENT: Style the grid layout, spacing, and responsiveness as per final design.
 * - Adjust columns, gaps, and breakpoints as needed.
 */
const FeatureCardGrid: React.FC = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  return (
    <section className="w-full">
      {/* Section header for better structure */}
      <div className="text-center mb-8 sm:mb-10 lg:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white mb-3 sm:mb-4">
          EXPLORE OUR 
          <span className="text-[#D7FF00] ml-2">FEATURES</span>
        </h2>
        <p className="text-sm sm:text-base text-[#8A8B91] max-w-2xl mx-auto px-4">
          Discover the tools and opportunities that make GoatedVips the ultimate gaming community
        </p>
      </div>
      
      {/* Mobile-first responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-7xl mx-auto">
        {homeFeatures.map((feature, index) => (
          <div 
            key={feature.title}
            className="w-full"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <FeatureCard
              {...feature}
              isAuthenticated={isAuthenticated}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureCardGrid; 