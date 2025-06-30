import { motion, useInView } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { homeFeatures } from "@/data/homeFeatures";
import { FeatureCard } from "./FeatureCard";
import { staggerContainer, staggerItem } from "@/lib/animation-presets";
import React, { useRef, useMemo } from "react";

export function FeatureCardGrid() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  // Memoized feature grouping for performance
  const { firstGridFeatures, secondGridFeatures } = useMemo(() => ({
    firstGridFeatures: homeFeatures.filter(feature => feature.group === 1),
    secondGridFeatures: homeFeatures.filter(feature => feature.group === 2)
  }), []);

  // Simple animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }), []);

  const cardVariants = useMemo(() => ({
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }), []);

  return (
    <div ref={containerRef} className="space-y-12 sm:space-y-16">
      {/* Enhanced First Grid of Features */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative"
      >
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#D7FF00]/5 via-transparent to-[#00C9FF]/5 rounded-3xl blur-xl" />
        
        <motion.div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
          {firstGridFeatures.map((feature, index) => (
            <motion.div 
              key={feature.id} 
              variants={cardVariants}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                rotateY: 2,
                transition: { 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 17 
                }
              }}
              style={{
                transformPerspective: 1000
              }}
              className="group relative"
            >
              {/* Card Glow on Hover */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-[#D7FF00]/10 to-[#00C9FF]/10 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500"
                whileHover={{ scale: 1.05 }}
              />
              
              <div className="relative">
                <FeatureCard feature={feature} isAuthenticated={isAuthenticated} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Enhanced Second Grid of Features */}
      {secondGridFeatures.length > 0 && (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 60 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
                duration: 0.8,
                ease: "easeOut"
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative"
        >
          {/* Enhanced Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#00C9FF]/5 via-transparent to-[#D7FF00]/5 rounded-3xl blur-xl" />
          
          <motion.div className="relative">
            {/* Enhanced Section Divider */}
            <motion.div 
              className="flex items-center justify-center mb-12"
              variants={{
                hidden: { opacity: 0, scaleX: 0 },
                visible: { 
                  opacity: 1, 
                  scaleX: 1,
                  transition: { duration: 0.8, ease: "easeOut" }
                }
              }}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-[#D7FF00]/50 to-transparent w-full max-w-md" />
              <div className="mx-4 px-4 py-2 bg-[#1A1B21]/80 backdrop-blur-sm rounded-full border border-[#2A2B31]/50">
                <span className="text-sm font-bold text-[#D7FF00] tracking-wider">PREMIUM FEATURES</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-[#D7FF00]/50 to-transparent w-full max-w-md" />
            </motion.div>
            
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
              {secondGridFeatures.map((feature, index) => (
                <motion.div 
                  key={feature.id}
                  variants={{
                    hidden: { 
                      opacity: 0, 
                      y: 60,
                      scale: 0.8,
                      filter: "blur(4px)"
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                      transition: {
                        type: "spring",
                        stiffness: 80,
                        damping: 15,
                        delay: index * 0.1
                      }
                    }
                  }}
                  whileHover={{ 
                    y: -12,
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: 5,
                    transition: { 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20 
                    }
                  }}
                  style={{
                    transformPerspective: 1000,
                    transformStyle: "preserve-3d"
                  }}
                  className="group relative"
                >
                  {/* Enhanced Card Glow */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-[#D7FF00]/15 via-[#00C9FF]/10 to-[#D7FF00]/15 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 1
                    }}
                  />
                  
                  {/* Floating particles effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    whileHover={{
                      opacity: [0, 1, 0],
                      transition: { duration: 2, repeat: Infinity }
                    }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#D7FF00] rounded-full"
                        style={{
                          left: `${20 + i * 30}%`,
                          top: `${20 + i * 20}%`
                        }}
                        animate={{
                          y: [-10, -30, -10],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </motion.div>
                  
                  <div className="relative">
                    <FeatureCard feature={feature} isAuthenticated={isAuthenticated} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default React.memo(FeatureCardGrid, (prevProps, nextProps) => {
  // Only re-render if user authentication status changes
  return prevProps === nextProps;
});