import React from "react";
import { motion, MotionProps, Variants } from "framer-motion";
import { Button, ButtonProps } from "./button";

// Variants d'animation avec fallback pour prefers-reduced-motion
const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  loading: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

// Variants réduites pour l'accessibilité
const reducedVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1 },
  tap: { scale: 1 },
  loading: { scale: 1 }
};

interface AnimatedButtonProps extends ButtonProps {
  motionProps?: MotionProps;
  enableAnimation?: boolean;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, motionProps, enableAnimation = true, disabled, ...props }, ref) => {
    // Détecter si l'utilisateur préfère des animations réduites
    const prefersReducedMotion = 
      typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Choisir les bonnes variants selon les préférences d'accessibilité
    const variants = (prefersReducedMotion || !enableAnimation) ? reducedVariants : buttonVariants;
    
    // Déterminer l'état d'animation
    const getAnimateState = () => {
      if (disabled && typeof children === 'string' && children.includes('...')) {
        return 'loading';
      }
      return 'initial';
    };

    return (
      <motion.div
        variants={variants}
        initial="initial"
        whileHover={disabled ? undefined : "hover"}
        whileTap={disabled ? undefined : "tap"}
        animate={getAnimateState()}
        style={{ display: 'inline-block', width: '100%' }}
        {...motionProps}
      >
        <Button
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton"; 