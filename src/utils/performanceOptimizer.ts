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
      // Préchargement avec gestion d'erreur
      moduleLoader()
        .then(() => {
          this.preloadedModules.add(route);
          console.log(`🚀 Préchargement réussi pour ${route}`);
        })
        .catch(error => {
          console.warn(`⚠️ Échec du préchargement pour ${route}:`, error);
        });
    }
  }

  public preloadByRole(userRole: string) {
    const routes = this.criticalRoutes.get(userRole) || [];
    routes.forEach(route => {
      // Préchargement différé pour éviter de bloquer le thread principal
      requestIdleCallback(() => {
        this.preloadRoute(route);
      });
    });
  }
}

// ✅ PERFORMANCE - Optimiseur de mémoire
export class MemoryOptimizer {
  private memoryThreshold = 50 * 1024 * 1024; // 50MB
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startMemoryMonitoring();
  }

  private startMemoryMonitoring() {
    // Nettoyage automatique toutes les 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000);
  }

  private performCleanup() {
    // Nettoyage des queries inactives
    queryClient.getQueryCache().clear();
    
    // Nettoyage des images en cache
    this.cleanupImageCache();
    
    // Force garbage collection si disponible
    if (window.gc) {
      window.gc();
    }
    
    console.log('🧹 Nettoyage mémoire effectué');
  }

  private cleanupImageCache() {
    // Suppression des images non utilisées du cache
    const images = document.querySelectorAll('img[data-cached="true"]');
    images.forEach(img => {
      if (!this.isElementVisible(img)) {
        img.remove();
      }
    });
  }

  private isElementVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  public destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// ✅ PERFORMANCE - Optimiseur de bundle
export class BundleOptimizer {
  private loadedChunks = new Set<string>();
  
  public async optimizeInitialLoad() {
    // Chargement prioritaire des chunks critiques
    const criticalChunks = [
      'vendor-react',
      'vendor-data',
      'vendor-utils'
    ];
    
    for (const chunk of criticalChunks) {
      await this.loadChunk(chunk);
    }
  }

  private async loadChunk(chunkName: string): Promise<void> {
    if (this.loadedChunks.has(chunkName)) return;
    
    try {
      // Simulation du chargement de chunk
      const chunkPath = `/assets/js/${chunkName}-[hash].js`;
      await this.loadScript(chunkPath);
      this.loadedChunks.add(chunkName);
    } catch (error) {
      console.warn(`Erreur lors du chargement du chunk ${chunkName}:`, error);
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// ✅ PERFORMANCE - Moniteur de performance
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    bundleSize: 0,
    loadTime: 0,
    renderTime: 0,
    cacheHitRate: 0
  };

  public startMonitoring() {
    this.measureLoadTime();
    this.measureRenderTime();
    this.measureCachePerformance();
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
    console.log('📊 Métriques de performance:', this.metrics);
    
    // Rapport de performance optimisé
    if (this.metrics.loadTime > 3000) {
      console.warn('⚠️ Temps de chargement élevé:', this.metrics.loadTime, 'ms');
    }
    
    if (this.metrics.cacheHitRate < 70) {
      console.warn('⚠️ Taux de cache faible:', this.metrics.cacheHitRate, '%');
    }
  }
}

// ✅ PERFORMANCE - Instance globale de l'optimiseur
export const performanceOptimizer = {
  preloader: new IntelligentPreloader(),
  memoryOptimizer: new MemoryOptimizer(),
  bundleOptimizer: new BundleOptimizer(),
  performanceMonitor: new PerformanceMonitor(),

  // Initialisation complète
  initialize(userRole?: string) {
    console.log('🚀 Initialisation de l\'optimiseur de performance ultra-avancé');
    
    // Démarrage des optimisations
    this.performanceMonitor.startMonitoring();
    this.bundleOptimizer.optimizeInitialLoad();
    
    // Préchargement basé sur le rôle
    if (userRole) {
      this.preloader.preloadByRole(userRole);
    }
    
    // Rapport de performance après 5 secondes
    setTimeout(() => {
      this.performanceMonitor.reportPerformance();
    }, 5000);
  },

  // Nettoyage lors de la fermeture
  cleanup() {
    this.memoryOptimizer.destroy();
  }
};

// ✅ PERFORMANCE - Auto-initialisation
if (typeof window !== 'undefined') {
  // Initialisation différée pour ne pas bloquer le chargement initial
  requestIdleCallback(() => {
    performanceOptimizer.initialize();
  });
  
  // Nettoyage lors de la fermeture de la page
  window.addEventListener('beforeunload', () => {
    performanceOptimizer.cleanup();
  });
} 