import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { homeFeatures } from "@/data/homeFeatures";
import { FeatureCard } from "./FeatureCard";
import { staggerContainer, staggerItem } from "@/lib/animationPresets"; // Assuming these presets are suitable

export function FeatureCardGrid() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // The original Home.tsx had two distinct grids of cards.
  // We need to decide if homeFeatures.ts should distinguish these or if FeatureCardGrid handles it.
  // For now, let's assume homeFeatures contains all cards and we might need to split them or add a grouping key.
  // Based on Home.tsx, there was one grid of 6, then another grid of 3.
  // Let's split them for now, assuming the first 6 are for the first grid, and the next 3 (or more) for the second.
  // This logic should ideally be driven by the data in homeFeatures.ts (e.g., a 'group' property).

  const firstGridFeatures = homeFeatures.slice(0, 6);
  const secondGridFeatures = homeFeatures.slice(6);

  return (
    <>
      {/* First Grid of Features (originally 6 cards) */}
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

      {/* Second Grid of Features (originally 3 cards, then 2 more were added to this grid in Home.tsx) */}
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