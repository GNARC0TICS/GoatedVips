import { motion } from "framer-motion";

export function HeroVideo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-8"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="mx-auto h-64 md:h-80 w-auto object-contain"
      >
        <source src="/images/FINAL.webm" type="video/webm" />
        <source src="/images/FINAL.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </motion.div>
  );
} 