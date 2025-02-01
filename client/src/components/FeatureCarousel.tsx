
import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  PanInfo,
} from "framer-motion";
import { useLocation } from "wouter";

const announcements = [
  { text: "WAGER RACES", link: "/wager-races" },
  { text: "BONUS CODES", link: "/bonus-codes" },
  { text: "AFFILIATE REWARDS", link: "/vip-program" },
  { text: "TELEGRAM GROUP", link: "/telegram" },
  { text: "AIRDROP NEWS", link: "/goated-token" },
  { text: "PROVABLY FAIR", link: "/provably-fair" },
  { text: "LIVE LEADERBOARDS", link: "#leaderboard" },
  { text: "LIVE SUPPORT", link: "/help" },
  { text: "PROMOTIONS", link: "/bonus-codes" },
  { text: "WEEKLY LIVE STREAM", link: "/telegram" },
  { text: "CHALLENGES & GIVEAWAYS", link: "/wager-races" },
  { text: "BECOME AN AFFILIATE", link: "/vip-program" },
  { text: "DAILY CODE DROPS", link: "/bonus-codes" },
  { text: "JOIN THE GOATS TODAY!", link: "/auth" },
  { text: "1700+ ACTIVE MEMBERS", link: "/telegram" },
  { text: "$2231+ GIVEN TO OUR PLAYERS", link: "/wager-races" },
  { text: "MULTIPLIER HUNTS", link: "/telegram" },
  { text: "STRATEGIES AND DISCUSSION", link: "/telegram" },
  { text: "NEWSLETTER SUBSCRIPTION", link: "/notification-preferences" },
  { text: "PROMO CODES", link: "/bonus-codes" },
  { text: "TERMS AND CONDITIONS", link: "/help" },
  { text: "GOATED x GOOMBAS VIPS", link: "/vip-program" },
];

export const FeatureCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [, setLocation] = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const wrap = (index: number) => {
    if (index < 0) return announcements.length - 1;
    if (index >= announcements.length) return 0;
    return index;
  };

  const nextSlide = () => {
    if (!isDragging) {
      setDirection('next');
      setCurrentIndex((prev) => wrap(prev + 1));
    }
  };

  const prevSlide = () => {
    if (!isDragging) {
      setDirection('prev');
      setCurrentIndex((prev) => wrap(prev - 1));
    }
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setIsDragging(false);
    const threshold = 100; // Increased threshold for better detection
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    const progress = Math.abs(offset) / window.innerWidth;

    // Force transition when progress is significant or velocity is high
    if (progress > 0.15 || Math.abs(velocity) > 500) {
      if (offset > 0) {
        prevSlide();
        // Skip one more if velocity is very high
        if (Math.abs(velocity) > 1000) {
          setTimeout(prevSlide, 50);
        }
      } else {
        nextSlide();
        // Skip one more if velocity is very high
        if (Math.abs(velocity) > 1000) {
          setTimeout(nextSlide, 50);
        }
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        nextSlide();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isDragging]);

  const handleClick = (link: string) => {
    if (!isDragging) {
      if (link.startsWith("#")) {
        const element = document.querySelector(link);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        setLocation(link);
      }
    }
  };

  const variants = {
    enter: (direction: 'next' | 'prev') => ({
      x: direction === 'next' ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: 'next' | 'prev') => ({
      zIndex: 0,
      x: direction === 'next' ? -1000 : 1000,
      opacity: 0
    })
  };

  return (
    <div ref={containerRef} className="relative h-24 overflow-hidden mb-8 group touch-none">
      <div className="flex justify-center items-center h-full relative">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            dragMomentum={true}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            style={{ x: dragX }}
            className="absolute w-full flex justify-center items-center touch-pan-y"
          >
            <button
              onClick={() => handleClick(announcements[currentIndex].link)}
              className="text-3xl md:text-4xl font-heading font-extrabold bg-gradient-to-r from-[#D7FF00] via-[#D7FF00]/80 to-[#D7FF00]/60 bg-clip-text text-transparent hover:from-[#D7FF00]/80 hover:to-[#D7FF00]/40 transition-all pointer-events-auto px-4"
            >
              {announcements[currentIndex].text}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
