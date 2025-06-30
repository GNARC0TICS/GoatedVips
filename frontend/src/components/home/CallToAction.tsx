import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

export function CallToAction() {
  return (
    <div className="relative text-center py-16 sm:py-20 lg:py-32">
      <div className="relative max-w-5xl mx-auto px-4">
        {/* Title */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-8 leading-tight">
          <span className="block text-white">
            JOIN THE
          </span>
          <span className="block text-[#D7FF00]">
            GOATS TODAY!
          </span>
        </h2>

        {/* Description */}
        <div className="mb-12">
          <p className="text-lg sm:text-xl text-[#B8B9C0] max-w-3xl mx-auto leading-relaxed">
            Ready to transform your gaming experience? Join thousands of players
            earning rewards, competing in races, and building wealth through smart
            wagering. Your journey to elite status starts here.
          </p>
        </div>

        {/* Call-to-Action Button */}
        <div>
          <Button
            asChild
            size="lg"
            className="bg-[#D7FF00] text-[#14151A] hover:bg-[#B8E000] font-bold text-xl px-12 py-6 h-auto transition-colors duration-300"
          >
            <a
              href="https://www.goated.com/r/SPIN"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-6 h-6" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(CallToAction);