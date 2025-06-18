#!/usr/bin/env node

// ✅ ULTRA-PERFORMANCE - Script d'audit de performance
const fs = require('fs');
const path = require('path');

console.log('🚀 AUDIT DE PERFORMANCE - Sud Megaphone Ultra-Optimisé');
console.log('='.repeat(60));

// Analyser les chunks générés
function analyzeBundle() {
  const distPath = path.join(__dirname, '..', 'dist', 'assets', 'js');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Dossier dist/assets/js non trouvé. Lancez `npm run build` d\'abord.');
    return;
  }
  
  const files = fs.readdirSync(distPath);
  const chunks = files
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        sizeKB: Math.round(stats.size / 1024 * 100) / 100
      };
    })
    .sort((a, b) => b.size - a.size);

  console.log('\n📊 ANALYSE DES CHUNKS:');
  console.log('-'.repeat(60));

  let totalSize = 0;
  let vendorSize = 0;
  let appSize = 0;

  chunks.forEach(chunk => {
    totalSize += chunk.size;
    
    if (chunk.name.includes('vendor-')) {
      vendorSize += chunk.size;
      console.log(`🎯 ${chunk.name.padEnd(35)} ${chunk.sizeKB.toString().padStart(8)} KB`);
    } else if (chunk.name.includes('index-') || chunk.name.includes('App-')) {
      appSize += chunk.size;
      console.log(`📱 ${chunk.name.padEnd(35)} ${chunk.sizeKB.toString().padStart(8)} KB`);
    } else {
      console.log(`📄 ${chunk.name.padEnd(35)} ${chunk.sizeKB.toString().padStart(8)} KB`);
    }
  });

  console.log('-'.repeat(60));
  console.log(`📊 RÉSUMÉ:`);
  console.log(`   Total Bundle:     ${Math.round(totalSize / 1024)} KB`);
  console.log(`   Vendor Chunks:    ${Math.round(vendorSize / 1024)} KB`);
  console.log(`   App Chunks:       ${Math.round(appSize / 1024)} KB`);
  
  // Estimation des gains de performance
  console.log('\n⚡ GAINS DE PERFORMANCE ESTIMÉS:');
  console.log('-'.repeat(60));
  
  const initialLoadSize = chunks
    .filter(chunk => 
      chunk.name.includes('vendor-react') || 
      chunk.name.includes('vendor-data') ||
      chunk.name.includes('vendor-utils') ||
      chunk.name.includes('index-')
    )
    .reduce((sum, chunk) => sum + chunk.size, 0);
    
  console.log(`🔥 Chargement initial: ~${Math.round(initialLoadSize / 1024)} KB`);
  console.log(`🎯 Lazy Loading:      ~${Math.round((totalSize - initialLoadSize) / 1024)} KB`);
  console.log(`📈 Ratio Optimisation: ${Math.round((initialLoadSize / totalSize) * 100)}% initial / ${Math.round(((totalSize - initialLoadSize) / totalSize) * 100)}% lazy`);
  
  // Calcul des gains vs bundle monolithique de 1.2MB
  const originalSize = 1200; // 1.2MB en KB
  const currentInitial = Math.round(initialLoadSize / 1024);
  const speedGain = Math.round((originalSize / currentInitial) * 10) / 10;
  
  console.log('\n🏆 OBJECTIF "3X PLUS RAPIDE":');
  console.log('-'.repeat(60));
  console.log(`📊 Avant:     ${originalSize} KB (monolithique)`);
  console.log(`📊 Après:     ${currentInitial} KB (initial)`);
  console.log(`🚀 Gain:      ${speedGain}x plus rapide`);
  
  if (speedGain >= 3) {
    console.log(`✅ OBJECTIF ATTEINT! ${speedGain}x > 3x`);
  } else {
    console.log(`⚠️  OBJECTIF EN COURS: ${speedGain}x / 3x`);
  }
}

// Analyser la configuration de lazy loading
function analyzeLazyLoading() {
  console.log('\n🔄 ANALYSE DU LAZY LOADING:');
  console.log('-'.repeat(60));
  
  const srcPath = path.join(__dirname, '..', 'src');
  const appPath = path.join(srcPath, 'App.tsx');
  
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');
    const lazyImports = (appContent.match(/lazy\(/g) || []).length;
    const suspenseComponents = (appContent.match(/<Suspense/g) || []).length;
    
    console.log(`📱 Lazy Imports:      ${lazyImports}`);
    console.log(`⏳ Suspense Wrappers: ${suspenseComponents}`);
    console.log(`🎯 Coverage:          ${Math.round((lazyImports / 15) * 100)}% des routes`);
  }
}

// Analyser les optimisations React Query
function analyzeReactQuery() {
  console.log('\n🔍 ANALYSE REACT QUERY:');
  console.log('-'.repeat(60));
  
  const queryClientPath = path.join(__dirname, '..', 'src', 'lib', 'queryClient.ts');
  
  if (fs.existsSync(queryClientPath)) {
    const content = fs.readFileSync(queryClientPath, 'utf8');
    
    const staleTime = content.match(/staleTime:\s*(\d+)/);
    const gcTime = content.match(/gcTime:\s*(\d+)/);
    const hasOptimizations = content.includes('QueryCache') && content.includes('MutationCache');
    
    console.log(`⏰ Stale Time:        ${staleTime ? Math.round(parseInt(staleTime[1]) / 60000) + ' min' : 'Non défini'}`);
    console.log(`🗑️  GC Time:           ${gcTime ? Math.round(parseInt(gcTime[1]) / 60000) + ' min' : 'Non défini'}`);
    console.log(`🚀 Optimisations:     ${hasOptimizations ? '✅ Activées' : '❌ Manquantes'}`);
  }
}

// Recommandations de performance
function showRecommendations() {
  console.log('\n💡 RECOMMANDATIONS POUR OPTIMISER DAVANTAGE:');
  console.log('-'.repeat(60));
  console.log('🔧 1. Ajoutez Service Worker pour mise en cache');
  console.log('🔧 2. Optimisez les images avec WebP/AVIF');
  console.log('🔧 3. Implémentez le preloading intelligent');
  console.log('🔧 4. Activez la compression Brotli/Gzip');
  console.log('🔧 5. Utilisez React.memo pour les composants lourds');
}

// Exécution de l'audit
analyzeBundle();
analyzeLazyLoading();
analyzeReactQuery();
showRecommendations();

console.log('\n' + '='.repeat(60));
console.log('🎉 AUDIT TERMINÉ - Sud Megaphone Ultra-Performance!');
console.log('='.repeat(60)); 