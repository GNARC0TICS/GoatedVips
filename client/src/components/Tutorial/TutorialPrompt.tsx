import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorial } from "./TutorialContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function TutorialPrompt() {
  const { hasSeenTutorial, setHasSeenTutorial, openTutorial } = useTutorial();
  const [isVisible, setIsVisible] = useState(!hasSeenTutorial);

  const handleSkip = () => {
    setIsVisible(false);
    setHasSeenTutorial(true);
  };

  const handleStart = () => {
    setIsVisible(false);
    openTutorial();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className="w-[400px] bg-[#1A1B21] border-[#2A2B31]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white">
                Welcome to Goated x Goombas VIPs! 🎉
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Would you like a quick tour of our platform?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[#8A8B91]">
              Learn how to maximize your rewards and discover all the features
              available to you.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Maybe Later
            </Button>
            <Button
              onClick={handleStart}
              className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90"
            >
              Start Tour
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}