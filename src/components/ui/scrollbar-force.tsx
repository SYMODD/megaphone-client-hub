
import { useEffect } from 'react';

export const ScrollbarForce = () => {
  useEffect(() => {
    // Fonction pour forcer les scrollbars
    const forceScrollbars = () => {
      const style = document.createElement('style');
      style.id = 'force-scrollbars-js';
      style.innerHTML = `
        /* Force scrollbars avec JavaScript - priorité maximale */
        html, html *, body, body *, div, div *, 
        [class], [class] *, [data-radix-scroll-area-viewport],
        .overflow-auto, .overflow-y-auto, .overflow-x-auto,
        .overflow-scroll, .scrollbar-none, .scrollbar-thin {
          scrollbar-width: auto !important;
          scrollbar-color: #b6002c #e0e0e0 !important;
        }
        
        html::-webkit-scrollbar, html *::-webkit-scrollbar,
        body::-webkit-scrollbar, body *::-webkit-scrollbar,
        div::-webkit-scrollbar, div *::-webkit-scrollbar,
        [class]::-webkit-scrollbar, [class] *::-webkit-scrollbar,
        [data-radix-scroll-area-viewport]::-webkit-scrollbar,
        .overflow-auto::-webkit-scrollbar, .overflow-y-auto::-webkit-scrollbar,
        .overflow-x-auto::-webkit-scrollbar, .overflow-scroll::-webkit-scrollbar,
        .scrollbar-none::-webkit-scrollbar, .scrollbar-thin::-webkit-scrollbar,
        *::-webkit-scrollbar {
          width: 12px !important;
          height: 12px !important;
          background: #e0e0e0 !important;
          display: block !important;
          -webkit-appearance: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        html::-webkit-scrollbar-thumb, html *::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-thumb, body *::-webkit-scrollbar-thumb,
        div::-webkit-scrollbar-thumb, div *::-webkit-scrollbar-thumb,
        [class]::-webkit-scrollbar-thumb, [class] *::-webkit-scrollbar-thumb,
        [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb,
        .overflow-auto::-webkit-scrollbar-thumb, .overflow-y-auto::-webkit-scrollbar-thumb,
        .overflow-x-auto::-webkit-scrollbar-thumb, .overflow-scroll::-webkit-scrollbar-thumb,
        .scrollbar-none::-webkit-scrollbar-thumb, .scrollbar-thin::-webkit-scrollbar-thumb,
        *::-webkit-scrollbar-thumb {
          background: #b6002c !important;
          border-radius: 6px !important;
          -webkit-appearance: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        html::-webkit-scrollbar-track, html *::-webkit-scrollbar-track,
        body::-webkit-scrollbar-track, body *::-webkit-scrollbar-track,
        div::-webkit-scrollbar-track, div *::-webkit-scrollbar-track,
        [class]::-webkit-scrollbar-track, [class] *::-webkit-scrollbar-track,
        [data-radix-scroll-area-viewport]::-webkit-scrollbar-track,
        .overflow-auto::-webkit-scrollbar-track, .overflow-y-auto::-webkit-scrollbar-track,
        .overflow-x-auto::-webkit-scrollbar-track, .overflow-scroll::-webkit-scrollbar-track,
        .scrollbar-none::-webkit-scrollbar-track, .scrollbar-thin::-webkit-scrollbar-track,
        *::-webkit-scrollbar-track {
          background: #e0e0e0 !important;
          -webkit-appearance: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `;
      
      // Supprimer l'ancien style s'il existe
      const oldStyle = document.getElementById('force-scrollbars-js');
      if (oldStyle) {
        oldStyle.remove();
      }
      
      // Ajouter le nouveau style en fin de head pour priorité maximale
      document.head.appendChild(style);
      
      console.log('🎯 Scrollbars forcées via JavaScript');
    };

    // Appliquer immédiatement
    forceScrollbars();
    
    // Réappliquer après un délai pour être sûr
    const timeout1 = setTimeout(forceScrollbars, 100);
    const timeout2 = setTimeout(forceScrollbars, 500);
    const timeout3 = setTimeout(forceScrollbars, 1000);
    
    // Observer les changements DOM pour réappliquer si nécessaire
    const observer = new MutationObserver(() => {
      forceScrollbars();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    
    // Nettoyer
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      observer.disconnect();
    };
  }, []);

  return null;
};
