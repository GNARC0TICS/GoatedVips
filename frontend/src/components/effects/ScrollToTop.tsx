import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Use a throttled scroll handler to improve performance
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const toggleVisibility = () => {
      const currentScrollY = window.pageYOffset;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(currentScrollY > 300);
          ticking = false;
        });
        
        ticking = true;
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Simplified non-animated version for better performance
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-8 right-8 z-50 transition-opacity duration-300 opacity-100">
      <Button
        onClick={scrollToTop}
        size="icon"
        className="rounded-full bg-[#D7FF00] hover:bg-[#D7FF00]/80 text-black shadow-md"
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          minHeight: '44px',
          minWidth: '44px'
        }}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
