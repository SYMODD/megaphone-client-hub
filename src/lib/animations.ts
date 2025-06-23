// Configuration globale des animations
export const ANIMATION_CONFIG = {
  // Durées en secondes
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    entrance: 0.6
  },
  
  // Springs pour les animations
  spring: {
    gentle: { stiffness: 300, damping: 25 },
    bouncy: { stiffness: 500, damping: 30 },
    snappy: { stiffness: 600, damping: 35 }
  },
  
  // Delays pour les animations staggerées
  stagger: {
    items: 0.1,
    cards: 0.15,
    buttons: 0.05
  },
  
  // Easing curves
  easing: {
    ease: "easeInOut",
    easeOut: "easeOut",
    easeIn: "easeIn"
  }
} as const;

// Hook pour détecter les préférences d'animations réduites
export const useReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Hook pour obtenir les variants en fonction des préférences utilisateur
export const useAnimationVariants = (enableAnimation: boolean = true) => {
  const prefersReducedMotion = useReducedMotion();
  
  return {
    shouldAnimate: enableAnimation && !prefersReducedMotion,
    prefersReducedMotion,
    duration: prefersReducedMotion ? 0 : ANIMATION_CONFIG.duration.normal
  };
};

// Variants communs pour différents types d'éléments
export const commonVariants = {
  // Fade in basique
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: ANIMATION_CONFIG.duration.normal }
    }
  },
  
  // Slide up avec fade
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: ANIMATION_CONFIG.duration.entrance,
        ...ANIMATION_CONFIG.spring.gentle
      }
    }
  },
  
  // Scale avec fade
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: ANIMATION_CONFIG.duration.entrance,
        ...ANIMATION_CONFIG.spring.bouncy
      }
    }
  },
  
  // Hover effects
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ...ANIMATION_CONFIG.spring.snappy
    }
  },
  
  // Tap effects
  tap: {
    scale: 0.98,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ...ANIMATION_CONFIG.spring.snappy
    }
  }
};

// Helper pour créer des variants réduits
export const createReducedVariants = (variants: any) => {
  const reduced: any = {};
  
  Object.keys(variants).forEach(key => {
    reduced[key] = { opacity: 1 };
  });
  
  return reduced;
};

// Type pour les variants d'animation
export type AnimationVariants = typeof commonVariants;

// Export par défaut de la configuration
export default ANIMATION_CONFIG; 