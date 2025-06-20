// ✅ ULTRA-PERFORMANCE - Optimiseur de performance avancé
import { queryClient } from "@/lib/queryClient";

// ✅ PERFORMANCE - Interface pour les métriques de performance
interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  cacheHitRate: number;
}

// ✅ PERFORMANCE - Gestionnaire de préchargement intelligent
export class IntelligentPreloader {
  private preloadedModules = new Set<string>();
  private criticalRoutes = new Map<string, string[]>();
  private userBehaviorPattern: string[] = [];

  constructor() {
    this.initializeRouteMapping();
    this.trackUserBehavior();
  }

  private initializeRouteMapping() {
    // Mappage des routes critiques par rôle
    this.criticalRoutes.set('admin', [
      '/dashboard',
      '/base-clients',
      '/users',
      '/contracts'
    ]);
    
    this.criticalRoutes.set('superviseur', [
      '/dashboard',
      '/base-clients',
      '/contracts'
    ]);
    
    this.criticalRoutes.set('agent', [
      '/nouveau-client',
      '/scanner-cin',
      '/scanner-passeport-marocain'
    ]);
  }

  private trackUserBehavior() {
    // Tracking des patterns de navigation
    let lastRoute = window.location.pathname;
    
    window.addEventListener('popstate', () => {
      const currentRoute = window.location.pathname;
      this.userBehaviorPattern.push(currentRoute);
      
      // Maintenir seulement les 10 dernières routes
      if (this.userBehaviorPattern.length > 10) {
        this.userBehaviorPattern.shift();
      }
      
      this.predictAndPreload(lastRoute, currentRoute);
      lastRoute = currentRoute;
    });
  }

  private predictAndPreload(from: string, to: string) {
    // Prédiction basée sur les patterns de navigation
    const predictions = this.getPredictedRoutes(from, to);
    
    predictions.forEach(route => {
      this.preloadRoute(route);
    });
  }

  private getPredictedRoutes(from: string, to: string): string[] {
    const predictions: string[] = [];
    
    // Logique de prédiction basée sur les patterns courants
    if (to === '/nouveau-client') {
      predictions.push('/scanner-cin', '/scanner-passeport-marocain');
    } else if (to === '/dashboard') {
      predictions.push('/base-clients', '/users');
    } else if (to.includes('/scanner-')) {
      predictions.push('/nouveau-client');
    }
    
    return predictions;
  }

  public preloadRoute(route: string) {
    if (this.preloadedModules.has(route)) return;
    
    const routeModuleMap: Record<string, () => Promise<any>> = {
      '/dashboard': () => import('@/pages/Index'),
      '/base-clients': () => import('@/pages/BaseClients'),
      '/nouveau-client': () => import('@/pages/NewClient'),
      '/scanner-cin': () => import('@/pages/CINScanner'),
      '/scanner-passeport-marocain': () => import('@/pages/PassportMarocainScanner'),
      '/scanner-passeport-etranger': () => import('@/pages/PassportEtrangerScanner'),
      '/users': () => import('@/pages/UserManagement'),
      '/contracts': () => import('@/pages/Contracts')
    };

    const moduleLoader = routeModuleMap[route];
    if (moduleLoader) {
      // Préchargement avec gestion d'erreur silencieuse
      moduleLoader()
        .then(() => {
          this.preloadedModules.add(route);
          console.log(`🚀 Préchargement réussi pour ${route}`);
        })
        .catch(error => {
          // Gestion silencieuse des erreurs de préchargement
          console.debug(`Préchargement ignoré pour ${route}:`, error);
        });
    }
  }

  public preloadByRole(userRole: string) {
    const routes = this.criticalRoutes.get(userRole) || [];
    routes.forEach(route => {
      // Préchargement différé pour éviter de bloquer le thread principal
      setTimeout(() => {
        this.preloadRoute(route);
      }, 100);
    });
  }
}

// ✅ PERFORMANCE - Optimiseur de mémoire (simplifié)
export class MemoryOptimizer {
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startMemoryMonitoring();
  }

  private startMemoryMonitoring() {
    // Nettoyage automatique toutes les 10 minutes (moins agressif)
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 10 * 60 * 1000);
  }

  private performCleanup() {
    // Nettoyage léger des queries très anciennes uniquement
    const queries = queryClient.getQueryCache().getAll();
    const now = Date.now();
    
    queries.forEach(query => {
      const lastUpdated = query.state.dataUpdatedAt;
      const age = now - lastUpdated;
      
      // Supprimer seulement les queries très anciennes (plus de 30 minutes)
      if (age > 30 * 60 * 1000) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
    
    console.log('🧹 Nettoyage mémoire léger effectué');
  }

  public destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// ✅ PERFORMANCE - Moniteur de performance (simplifié)
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    bundleSize: 0,
    loadTime: 0,
    renderTime: 0,
    cacheHitRate: 0
  };

  public startMonitoring() {
    // Démarrage différé pour éviter d'impacter le chargement initial
    setTimeout(() => {
      this.measureLoadTime();
      this.measureRenderTime();
      this.measureCachePerformance();
    }, 2000);
  }

  private measureLoadTime() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
    }
  }

  private measureRenderTime() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    if (firstContentfulPaint) {
      this.metrics.renderTime = firstContentfulPaint.startTime;
    }
  }

  private measureCachePerformance() {
    const cache = queryClient.getQueryCache();
    const totalQueries = cache.getAll().length;
    const cachedQueries = cache.getAll().filter(query => query.state.data !== undefined).length;
    
    this.metrics.cacheHitRate = totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public reportPerformance() {
    // Logs supprimés pour interface propre
  }
}

// ✅ PERFORMANCE - Instance globale de l'optimiseur (simplifiée)
export const performanceOptimizer = {
  preloader: new IntelligentPreloader(),
  memoryOptimizer: new MemoryOptimizer(),
  performanceMonitor: new PerformanceMonitor(),

  // Initialisation non-bloquante
  initialize(userRole?: string) {
    console.log('🚀 Initialisation de l\'optimiseur de performance');
    
    // Démarrage des optimisations avec délai
    setTimeout(() => {
      this.performanceMonitor.startMonitoring();
      
      // Préchargement basé sur le rôle avec délai supplémentaire
      if (userRole) {
        setTimeout(() => {
          this.preloader.preloadByRole(userRole);
        }, 1000);
      }
      
      // Rapport de performance après 10 secondes
      setTimeout(() => {
        this.performanceMonitor.reportPerformance();
      }, 8000);
    }, 500);
  },

  // Nettoyage lors de la fermeture
  cleanup() {
    this.memoryOptimizer.destroy();
  }
};

// ✅ PERFORMANCE - Initialisation conditionnelle
if (typeof window !== 'undefined') {
  // Initialisation seulement si la page est complètement chargée
  if (document.readyState === 'complete') {
    setTimeout(() => {
      performanceOptimizer.initialize();
    }, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        performanceOptimizer.initialize();
      }, 1000);
    });
  }
  
  // Nettoyage lors de la fermeture de la page
  window.addEventListener('beforeunload', () => {
    performanceOptimizer.cleanup();
  });
} 