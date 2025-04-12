import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { footerClasses } from "@/lib/style-constants";

type FooterProps = {};

export function Footer({}: FooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (footerRef.current) {
      observer.observe(footerRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return (
    <footer ref={footerRef} className={footerClasses.wrapper}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#D7FF00]/20 to-transparent pointer-events-none" />
      <div className={footerClasses.container}>
        <div className={footerClasses.grid}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h4 className={footerClasses.heading}>
                Ready to get Goated?
              </h4>
              <a
                href="https://www.goated.com/r/VIPBOOST"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform duration-300 hover:scale-110"
              >
                <img
                  src="/images/Goated Logo - Black.png"
                  alt="Goated"
                  className="h-8 w-auto entrance-zoom wiggle-animation"
                />
              </a>
            </div>
            <p className="text-[#14151A] mb-6">
              Sign up now and enjoy additional rewards from our side. Start
              your journey to becoming a casino legend!
            </p>
            <Button
              onClick={() =>
                window.open("https://www.goated.com/r/EARLYACCESS", "_blank")
              }
              className="bg-[#14151A] text-white hover:bg-[#14151A]/90 transition-colors"
            >
              Sign Up Now
            </Button>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h4 className={footerClasses.heading}>
                Stay Updated
              </h4>
              <a
                href="https://t.me/+iFlHl5V9VcszZTVh"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform duration-300 hover:scale-110"
              >
                <img
                  src="/images/Goated logo with text.png"
                  alt="Goated"
                  className="h-[4.5rem] w-auto object-contain"
                />
              </a>
            </div>
            <p className="text-[#14151A] mb-6">
              Subscribe to our newsletter for exclusive offers and updates!
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-[#14151A]/20 focus:outline-none focus:border-[#14151A] transition-colors duration-300"
              />
              <Button className="bg-[#14151A] text-white hover:bg-[#14151A]/90">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className={footerClasses.bottomBar}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 px-4">
              <a
                href="https://www.goated.com/r/VIPBOOST"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform duration-300 hover:scale-105"
              >
                <img
                  src="/images/Goated logo with text.png"
                  alt="Goated"
                  className="h-10 md:h-12 w-auto object-contain max-w-[200px]"
                />
              </a>
              <a
                href="https://t.me/+iFlHl5V9VcszZTVh"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform duration-300 hover:scale-105"
              >
                <img
                  src="/images/Goated logo with text1.png"
                  alt="Goated Partner"
                  className="h-10 md:h-12 w-auto object-contain max-w-[200px]"
                />
              </a>
            </div>
          </div>
          <p className="mb-2">
            © 2024 GoatedVips.gg. All rights reserved.
          </p>
          <p className="mb-2">
            Disclaimer: This website is an independent platform and is not affiliated with, endorsed by, or officially connected to Goated.com.
          </p>
          <p>Gamble responsibly. 18+ only. BeGambleAware.org</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
