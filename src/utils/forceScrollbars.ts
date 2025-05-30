
// Force scrollbars via JavaScript - approche DOM directe
export const forceScrollbars = () => {
  // Forcer les scrollbars sur tous les éléments
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach((element: Element) => {
    const htmlElement = element as HTMLElement;
    
    // Forcer les propriétés de scrollbar via style direct
    htmlElement.style.setProperty('scrollbar-width', 'auto', 'important');
    htmlElement.style.setProperty('scrollbar-color', '#b6002c #e0e0e0', 'important');
    htmlElement.style.setProperty('-webkit-scrollbar-width', '12px', 'important');
    htmlElement.style.setProperty('-webkit-scrollbar-track-color', '#e0e0e0', 'important');
    htmlElement.style.setProperty('-webkit-scrollbar-thumb-color', '#b6002c', 'important');
  });

  // Ajouter les styles webkit via une feuille de style
  const style = document.createElement('style');
  style.textContent = `
    * {
      scrollbar-width: auto !important;
      scrollbar-color: #b6002c #e0e0e0 !important;
    }
    
    *::-webkit-scrollbar {
      width: 12px !important;
      height: 12px !important;
      display: block !important;
      background: #e0e0e0 !important;
    }
    
    *::-webkit-scrollbar-thumb {
      background: #b6002c !important;
      border-radius: 6px !important;
    }
    
    *::-webkit-scrollbar-track {
      background: #e0e0e0 !important;
    }
  `;
  
  document.head.appendChild(style);
  
  console.log('🔥 SCROLLBARS FORCÉES VIA JAVASCRIPT');
};

// Observer pour forcer les scrollbars sur les nouveaux éléments
export const observeAndForceScrollbars = () => {
  const observer = new MutationObserver(() => {
    forceScrollbars();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('👀 Observer activé pour forcer les scrollbars');
};
