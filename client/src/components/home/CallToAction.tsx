import { motion } from "framer-motion";

export function CallToAction() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }} // Assuming delay from original context, adjust if needed
      className="text-center mt-16"
    >
      <a
        href="https://www.Goated.com/r/VIPBOOST"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-[#D7FF00] text-black font-heading text-xl px-8 py-4 rounded-lg relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(215,255,0,0.5)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-[#D7FF00]/0 before:via-[#D7FF00]/30 before:to-[#D7FF00]/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:ease-in-out"
      >
        JOIN THE GOATS TODAY! 🐐
      </a>
    </motion.div>
  );
} 