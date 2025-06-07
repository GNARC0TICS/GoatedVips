import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { fadeInUp, scaleIn, fadeIn, staggerContainer, staggerItem } from "@/lib/animationPresets"; // Added fadeIn

type AnimatedSectionProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  preset?: keyof typeof animationPresets;
  className?: string;
  delay?: number;
  duration?: number;
  scale?: number;
  yOffset?: number;
  staggerChildren?: number;
  delayChildren?: number;
  elementType?: keyof JSX.IntrinsicElements; // To allow specifying element type like 'p'
  // Added support for whileInView optimization
  whileInView?: any;
  viewport?: any;
};

const animationPresets = {
  fadeInUp,
  scaleIn,
  fadeIn, // Added fadeIn to the list of presets
  staggerContainer, // This is a function, needs special handling or direct use of variants
  staggerItem,
};

export function AnimatedSection({
  children,
  preset = "fadeInUp",
  className,
  delay,
  duration,
  scale,
  yOffset,
  staggerChildren,
  delayChildren,
  elementType: ElementType = 'div', // Default to div
  whileInView,
  viewport,
  ...rest
}: AnimatedSectionProps) {
  let selectedPresetConfig = animationPresets[preset as keyof Omit<typeof animationPresets, 'staggerContainer'>];
  let motionVariants = {};

  if (preset === 'staggerContainer') {
    // For staggerContainer, we expect it to return the full variants object structure
    // The preset itself is a function call that generates the variants.
    motionVariants = staggerContainer(staggerChildren, delayChildren);
  } else if (preset === 'staggerItem') {
    motionVariants = staggerItem.variants;
  } else if (selectedPresetConfig) {
    const customTransition = { ...selectedPresetConfig.transition };
    if (delay !== undefined) customTransition.delay = delay;
    if (duration !== undefined) customTransition.duration = duration;

    const customInitial = { ...selectedPresetConfig.initial };
    if (scale !== undefined && 'scale' in customInitial) customInitial.scale = scale;
    if (yOffset !== undefined && 'y' in customInitial) customInitial.y = yOffset;

    const customAnimate = { ...selectedPresetConfig.animate };
    if (scale !== undefined && 'scale' in customAnimate) customAnimate.scale = scale;
    if (yOffset !== undefined && 'y' in customAnimate) customAnimate.y = yOffset;
    
    motionVariants = {
      initial: customInitial,
      animate: customAnimate,
      transition: customTransition,
    };
  } else {
    // Fallback to fadeInUp if preset is somehow invalid and not stagger
    const fallbackPreset = animationPresets.fadeInUp;
    const customTransition = { ...fallbackPreset.transition };
    if (delay !== undefined) customTransition.delay = delay;
    if (duration !== undefined) customTransition.duration = duration;
    motionVariants = {
        initial: fallbackPreset.initial,
        animate: fallbackPreset.animate,
        transition: customTransition,
    };
  }
  
  const MotionElement = motion[ElementType as keyof typeof motion];

  // Determine animation trigger based on whileInView prop
  const animationProps = whileInView 
    ? {
        initial: "initial",
        whileInView: whileInView,
        viewport: viewport || { once: true },
      }
    : {
        initial: "initial",
        animate: "animate",
      };

  return (
    <MotionElement
      variants={motionVariants} // Apply the determined variants
      className={className}
      {...animationProps}
      {...rest}
    >
      {children}
    </MotionElement>
  );
} 