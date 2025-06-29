import { useState, useEffect } from "react";
import { PageTransition } from "@/components/effects/PageTransition";
import { motion } from "framer-motion";
import { Gift, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PRIZES = [
  { id: 1, value: "$5", probability: 0.4 },
  { id: 2, value: "$10", probability: 0.3 },
  { id: 3, value: "$25", probability: 0.2 },
  { id: 4, value: "$50", probability: 0.1 }
];

export default function WheelSpin() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const newRotation = rotation + 1800 + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      toast({
        title: "Congratulations!",
        description: "You won a reward! Check your balance.",
      });
    }, 3000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#1A1B21] text-white">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Gift className="w-16 h-16 text-[#D7FF00] mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-6">Daily Wheel Spin</h1>
            <p className="text-[#8A8B91] mb-8">Spin the wheel daily for exclusive rewards!</p>
            
            <div className="max-w-md mx-auto bg-[#2A2B31]/50 rounded-xl p-8 backdrop-blur-sm border border-[#2A2B31]">
              <motion.div
                className="relative w-64 h-64 mx-auto mb-8"
                style={{ transform: `rotate(${rotation}deg)` }}
                transition={{ duration: 3, ease: "easeOut" }}
              >
                {/* Wheel segments would go here */}
                <div className="absolute inset-0 rounded-full border-4 border-[#D7FF00]" />
              </motion.div>
              
              <Button
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90 disabled:opacity-50"
              >
                {isSpinning ? "Spinning..." : "Spin Now"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
