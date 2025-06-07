import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animationPresets";

/**
 * AnimatedSection
 * Wraps children in a motion.div with standard fade/slide animation.
 * DESIGN AGENT: Adjust animation presets in animationPresets.ts as needed.
 * - Use for section transitions and entrance effects.
 */
const AnimatedSection: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <motion.div {...fadeInUp}>
      {children}
    </motion.div>
  );
};

export default AnimatedSection; 