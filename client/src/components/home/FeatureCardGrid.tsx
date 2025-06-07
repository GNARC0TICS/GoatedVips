import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { homeFeatures } from "@/data/homeFeatures";
import { FeatureCard } from "./FeatureCard";
import { staggerContainer, staggerItem } from "@/lib/animationPresets"; // Assuming these presets are suitable

export function FeatureCardGrid() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Use data-driven grouping instead of hardcoded array slicing
  const firstGridFeatures = homeFeatures.filter(feature => feature.group === 1);
  const secondGridFeatures = homeFeatures.filter(feature => feature.group === 2);

  return (
    <>
      {/* First Grid of Features */}
      <motion.div
        variants={staggerContainer(0.1, 0.2)} // delay: 0.2 from original, stagger for items
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12 max-w-7xl mx-auto px-4"
      >
        {firstGridFeatures.map((feature) => (
          <motion.div key={feature.id} variants={staggerItem}>
            <FeatureCard feature={feature} isAuthenticated={isAuthenticated} />
          </motion.div>
        ))}
      </motion.div>

      {/* Second Grid of Features */}
      {secondGridFeatures.length > 0 && (
        <motion.div
          variants={staggerContainer(0.1, 0.3)} // delay: 0.3 from original
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-7xl mx-auto px-4"
        >
          {secondGridFeatures.map((feature) => (
            <motion.div key={feature.id} variants={staggerItem}>
              <FeatureCard feature={feature} isAuthenticated={isAuthenticated} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
} 