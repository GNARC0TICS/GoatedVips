import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useRef, useMemo } from "react";

export function CallToAction() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }), []);

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative text-center py-16 sm:py-20 lg:py-32 overflow-hidden"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D7FF00]/10 via-[#00C9FF]/5 to-[#D7FF00]/10 rounded-3xl blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-tl from-[#1A1B21]/50 to-[#14151A]/80 backdrop-blur-sm" />
      
      {/* Floating Decorative Elements */}
      <motion.div 
        className="absolute top-10 left-10 opacity-20"
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1],
          x: [0, 20, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Star className="w-12 h-12 text-[#D7FF00]" />
      </motion.div>
      
      <motion.div 
        className="absolute top-20 right-16 opacity-30"
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.3, 1],
          y: [0, -15, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <Sparkles className="w-8 h-8 text-[#00C9FF]" />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-20 left-20 opacity-25"
        animate={{ 
          scale: [1, 1.4, 1],
          rotate: [0, 180, 360],
          x: [0, 15, 0]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Star className="w-6 h-6 text-[#D7FF00]" />
      </motion.div>
      
      <div className="relative max-w-5xl mx-auto px-4 z-10">
        {/* Enhanced Title */}
        <motion.h2
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-white mb-8 leading-tight relative"
        >
          <motion.span 
            className="block"
            whileInView={{ 
              backgroundPosition: ["0% 50%", "100% 50%"],
            }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            style={{
              backgroundImage: "linear-gradient(90deg, #FFFFFF, #D7FF00, #FFFFFF)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            JOIN THE
          </motion.span>
          <motion.span 
            className="block text-[#D7FF00] relative"
            whileInView={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 0px rgba(215, 255, 0, 0)",
                "0 0 20px rgba(215, 255, 0, 0.5)",
                "0 0 0px rgba(215, 255, 0, 0)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            GOATS TODAY!
            
            {/* Animated Underline */}
            <motion.div
              className="absolute -bottom-2 left-1/2 h-1 bg-gradient-to-r from-[#D7FF00] to-[#00C9FF] rounded-full"
              initial={{ width: 0, x: "-50%" }}
              whileInView={{ width: "100%", x: "-50%" }}
              transition={{ delay: 1, duration: 1, ease: "easeOut" }}
            />
          </motion.span>
        </motion.h2>

        {/* Enhanced Description */}
        <motion.div
          variants={itemVariants}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#D7FF00]/5 via-transparent to-[#00C9FF]/5 rounded-xl blur-sm" />
          <div className="relative bg-[#1A1B21]/30 backdrop-blur-sm rounded-xl border border-[#2A2B31]/30 p-6">
            <p className="text-lg sm:text-xl text-[#B8B9C0] max-w-3xl mx-auto leading-relaxed">
              Ready to transform your gaming experience? Join thousands of players
              earning rewards, competing in races, and building wealth through smart
              wagering. Your journey to elite status starts here.
            </p>
          </div>
        </motion.div>

        {/* Enhanced Call-to-Action Button */}
        <motion.div
          variants={itemVariants}
          whileHover={{ 
            scale: 1.05,
            y: -5
          }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          {/* Button Glow Effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-[#D7FF00] to-[#00C9FF] rounded-2xl blur-xl opacity-50 group-hover:opacity-75"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          
          <Button
            asChild
            size="lg"
            className="relative bg-gradient-to-r from-[#D7FF00] to-[#B8E000] text-[#14151A] hover:from-[#B8E000] hover:to-[#D7FF00] font-bold text-xl px-12 py-6 h-auto transition-all duration-500 shadow-2xl hover:shadow-[0_0_50px_rgba(215,255,0,0.6)] border-2 border-transparent hover:border-[#D7FF00]/20 rounded-2xl"
          >
            <a
              href="https://www.goated.com/r/SPIN"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 relative"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ✨
              </motion.div>
              
              <span>Get Started Now</span>
              
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </a>
          </Button>
        </motion.div>
        
        {/* Enhanced Stats or Trust Indicators */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delay: 0.8,
                staggerChildren: 0.1
              }
            }
          }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { label: "Active Players", value: "10,000+", icon: "👥" },
            { label: "Total Rewards", value: "$2M+", icon: "💰" },
            { label: "Success Rate", value: "95%", icon: "🚀" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="text-center group"
            >
              <motion.div 
                className="text-3xl mb-2"
                whileHover={{ 
                  scale: 1.2,
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 0.5 }}
              >
                {stat.icon}
              </motion.div>
              <div className="text-2xl font-bold text-white mb-1 group-hover:text-[#D7FF00] transition-colors">
                {stat.value}
              </div>
              <div className="text-sm text-[#8A8B91] group-hover:text-[#B8B9C0] transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default React.memo(CallToAction);