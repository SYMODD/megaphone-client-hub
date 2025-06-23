import React from "react";
import { motion, Variants } from "framer-motion";

// Variants pour le conteneur de navigation
const navContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Variants pour les éléments de navigation individuels
const navItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -10,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  },
  hover: { 
    scale: 1.05,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  },
  tap: { 
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 30
    }
  }
};

// Variants réduites pour l'accessibilité
const reducedContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 }
};

const reducedItemVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  hover: { opacity: 1 },
  tap: { opacity: 1 }
};

interface AnimatedNavProps {
  children: React.ReactNode;
  className?: string;
  enableAnimation?: boolean;
}

export const AnimatedNavContainer: React.FC<AnimatedNavProps> = ({ 
  children, 
  className, 
  enableAnimation = true 
}) => {
  // Détecter si l'utilisateur préfère des animations réduites
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const variants = (prefersReducedMotion || !enableAnimation) 
    ? reducedContainerVariants 
    : navContainerVariants;

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

interface AnimatedNavItemProps {
  children: React.ReactNode;
  className?: string;
  enableAnimation?: boolean;
  as?: keyof JSX.IntrinsicElements;
  onClick?: () => void;
}

export const AnimatedNavItem: React.FC<AnimatedNavItemProps> = ({ 
  children, 
  className, 
  enableAnimation = true,
  as: Component = "div",
  onClick
}) => {
  // Détecter si l'utilisateur préfère des animations réduites
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const variants = (prefersReducedMotion || !enableAnimation) 
    ? reducedItemVariants 
    : navItemVariants;

  return (
    <motion.div
      variants={variants}
      whileHover="hover"
      whileTap="tap"
      className={className}
      onClick={onClick}
      style={{ display: 'inline-block' }}
    >
      {children}
    </motion.div>
  );
};

// Variant spécial pour le menu mobile avec slide
const mobileMenuVariants: Variants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const mobileMenuItemVariants: Variants = {
  closed: { 
    opacity: 0, 
    x: -20,
    scale: 0.95
  },
  open: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
};

const reducedMobileMenuVariants: Variants = {
  closed: { height: 0 },
  open: { height: "auto" }
};

interface AnimatedMobileMenuProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
  enableAnimation?: boolean;
}

export const AnimatedMobileMenu: React.FC<AnimatedMobileMenuProps> = ({ 
  children, 
  isOpen, 
  className, 
  enableAnimation = true 
}) => {
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const variants = (prefersReducedMotion || !enableAnimation) 
    ? reducedMobileMenuVariants 
    : mobileMenuVariants;

  return (
    <motion.div
      variants={variants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      className={className}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedMobileMenuItem: React.FC<AnimatedNavItemProps> = ({ 
  children, 
  className, 
  enableAnimation = true,
  onClick
}) => {
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const variants = (prefersReducedMotion || !enableAnimation) 
    ? { closed: { opacity: 1 }, open: { opacity: 1 } }
    : mobileMenuItemVariants;

  return (
    <motion.div
      variants={variants}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}; 