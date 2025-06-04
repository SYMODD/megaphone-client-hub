
export const compressImage = async (file: File, maxSizeKB: number = 800): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculer la nouvelle taille en maintenant le ratio
      const maxWidth = 1200;
      const maxHeight = 1200;
      
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dessiner l'image redimensionnée
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Commencer avec une qualité élevée et réduire si nécessaire
      let quality = 0.8;
      
      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (blob) {
            const sizeKB = blob.size / 1024;
            console.log(`🔄 Compression tentée - Qualité: ${quality}, Taille: ${sizeKB.toFixed(1)} KB`);
            
            if (sizeKB <= maxSizeKB || quality <= 0.1) {
              // Créer un nouveau fichier avec le blob compressé
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              console.log(`✅ Compression terminée - Taille finale: ${sizeKB.toFixed(1)} KB`);
              resolve(compressedFile);
            } else {
              // Réduire la qualité et réessayer
              quality -= 0.1;
              tryCompress();
            }
          }
        }, 'image/jpeg', quality);
      };
      
      tryCompress();
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  return `${(kb / 1024).toFixed(1)} MB`;
};
