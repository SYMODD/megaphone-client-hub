import React from "react";
import { motion, Variants } from "framer-motion";
import { Card } from "./card";

// Variants pour les cartes avec animations d'entrée
const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      duration: 0.6
    }
  },
  hover: { 
    y: -4,
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  }
};

// Variants réduites pour l'accessibilité
const reducedCardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  hover: { opacity: 1 },
  tap: { opacity: 1 }
};

// Variants pour les cartes en liste avec stagger
const cardListVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  enableAnimation?: boolean;
  enableHover?: boolean;
  clickable?: boolean;
  delay?: number;
  children: React.ReactNode;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, enableAnimation = true, enableHover = true, clickable = false, delay = 0, ...props }, ref) => {
    // Détecter si l'utilisateur préfère des animations réduites
    const prefersReducedMotion = 
      typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const variants = (prefersReducedMotion || !enableAnimation) 
      ? reducedCardVariants 
      : cardVariants;

    // Ajouter le délai personnalisé
    const customVariants = enableAnimation && !prefersReducedMotion ? {
      ...variants,
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring" as const,
          stiffness: 400,
          damping: 25,
          duration: 0.6,
          delay: delay
        }
      }
    } : variants;

    return (
      <motion.div
        ref={ref}
        variants={customVariants}
        initial="hidden"
        animate="visible"
        whileHover={enableHover && !prefersReducedMotion ? "hover" : undefined}
        whileTap={clickable && !prefersReducedMotion ? "tap" : undefined}
        style={{ display: 'inline-block', width: '100%' }}
      >
        <Card {...props}>
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

// Conteneur pour listes de cartes avec animation staggerée
interface AnimatedCardListProps {
  children: React.ReactNode;
  className?: string;
  enableAnimation?: boolean;
}

export const AnimatedCardList: React.FC<AnimatedCardListProps> = ({ 
  children, 
  className, 
  enableAnimation = true 
}) => {
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const variants = (prefersReducedMotion || !enableAnimation) 
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : cardListVariants;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Variant spécial pour les modales/dialogs
const modalCardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 10
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

interface AnimatedModalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  enableAnimation?: boolean;
  isVisible?: boolean;
  children: React.ReactNode;
}

export const AnimatedModalCard = React.forwardRef<HTMLDivElement, AnimatedModalCardProps>(
  ({ children, enableAnimation = true, isVisible = true, ...props }, ref) => {
    const prefersReducedMotion = 
      typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const variants = (prefersReducedMotion || !enableAnimation) 
      ? { hidden: { opacity: 1 }, visible: { opacity: 1 }, exit: { opacity: 1 } }
      : modalCardVariants;

    return (
      <motion.div
        ref={ref}
        variants={variants}
        initial="hidden"
        animate={isVisible ? "visible" : "exit"}
        exit="exit"
        style={{ display: 'inline-block', width: '100%' }}
      >
        <Card {...props}>
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedModalCard.displayName = "AnimatedModalCard"; 