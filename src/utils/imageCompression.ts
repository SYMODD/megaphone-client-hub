
interface CompressionOptions {
  maxSizeKB?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface ImageInfo {
  width: number;
  height: number;
  size: number;
  type: string;
  name: string;
}

export const getImageInfo = async (file: File): Promise<ImageInfo> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
        name: file.name
      });
    };

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const compressImage = async (
  file: File, 
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxSizeKB = 1000,
    quality = 0.8,
    maxWidth = 1200,
    maxHeight = 1200
  } = options;

  console.log("📦 COMPRESSION - Début avec options:", {
    maxSizeKB,
    quality,
    maxWidth,
    maxHeight,
    tailleOriginale: file.size
  });

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions en gardant le ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
        console.log("📐 Redimensionnement:", `${img.width}x${img.height} → ${Math.round(width)}x${Math.round(height)}`);
      }

      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image redimensionnée
      ctx?.drawImage(img, 0, 0, width, height);

      // Fonction pour essayer différents niveaux de qualité
      const tryCompress = (currentQuality: number): void => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Échec création blob'));
              return;
            }

            console.log(`📊 Test qualité ${currentQuality}: ${blob.size} bytes`);

            // Si la taille est acceptable ou si on a atteint la qualité minimale
            if (blob.size <= maxSizeKB * 1024 || currentQuality <= 0.3) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              console.log("✅ COMPRESSION TERMINÉE:", {
                tailleOriginale: file.size,
                tailleCompressée: compressedFile.size,
                reductionPourcentage: Math.round((1 - compressedFile.size / file.size) * 100),
                qualitéFinale: currentQuality
              });

              resolve(compressedFile);
            } else {
              // Essayer avec une qualité plus faible
              tryCompress(Math.max(0.3, currentQuality - 0.1));
            }
          },
          'image/jpeg',
          currentQuality
        );
      };

      // Commencer la compression
      tryCompress(quality);
    };

    img.onerror = () => {
      reject(new Error('Erreur chargement image pour compression'));
    };

    // Charger l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
