import {
  Crown,
  Zap,
  Lock,
  ArrowRight,
  CircleDot,
  Coins,
  Repeat,
  Trophy,
  Gift, // Already used in PromoBanner, but good to have in map for consistency
  MessageSquare,
  Shield,
  // Add other Lucide icons as needed by feature cards
} from "lucide-react";

// Custom Home Page Icons
import { BonusCodeIcon } from "@/components/icons/home/BonusCodeIcon";
import { VipTransferIcon } from "@/components/icons/home/VipTransferIcon";
import { WagerRacesIcon } from "@/components/icons/home/WagerRacesIcon";
import { ChallengesIcon } from "@/components/icons/home/ChallengesIcon";
import { WheelSpinIcon } from "@/components/icons/home/WheelSpinIcon";
import { ProvablyFairIcon } from "@/components/icons/home/ProvablyFairIcon";
import { PromotionsIcon } from "@/components/icons/home/PromotionsIcon";
import { TelegramIcon } from "@/components/icons/home/TelegramIcon";

// React.ElementType to allow for direct rendering as a component
export const IconMap: { [key: string]: React.ElementType } = {
  // Lucide Icons
  Crown,
  Zap,
  Lock,
  ArrowRight,
  CircleDot,
  Coins,
  Repeat,
  Trophy,
  Gift,
  MessageSquare,
  Shield,

  // Custom Icons (mapped from homeFeatures.ts)
  "custom:BonusCodeIcon": BonusCodeIcon,
  "custom:VipTransferIcon": VipTransferIcon,
  "custom:WagerRacesIcon": WagerRacesIcon,
  "custom:ChallengesIcon": ChallengesIcon,
  "custom:WheelSpinIcon": WheelSpinIcon,
  "custom:ProvablyFairIcon": ProvablyFairIcon,
  "custom:PromotionsIcon": PromotionsIcon,
  "custom:TelegramIcon": TelegramIcon,

  // Custom SVGs can also be mapped here if they are componentized
  // Example: VipTransferIcon: () => <svg>...</svg>,
};

// Helper function to get an icon, can include a fallback or error handling
export const getIcon = (name?: string): React.ElementType | undefined => {
  if (!name) return undefined;
  return IconMap[name];
}; 