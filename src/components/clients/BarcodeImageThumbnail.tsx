
import { Image, Barcode } from "lucide-react";

interface BarcodeImageThumbnailProps {
  imageUrl: string | null | undefined;
  className?: string;
}

export const BarcodeImageThumbnail = ({ imageUrl, className = "" }: BarcodeImageThumbnailProps) => {
  console.log("🔍 BarcodeImageThumbnail - ANALYSE COMPLÈTE:", {
    imageUrl_reçue: imageUrl,
    type: typeof imageUrl,
    length: imageUrl?.length || 0,
    truthy: !!imageUrl,
    string_vide: imageUrl === "",
    null_check: imageUrl === null,
    undefined_check: imageUrl === undefined,
    string_null: imageUrl === "null",
    string_undefined: imageUrl === "undefined",
    trimmed: imageUrl?.trim(),
    condition_finale: imageUrl && imageUrl.trim() !== "" && imageUrl !== "null" && imageUrl !== "undefined"
  });
  
  // 🎯 CONDITION SIMPLIFIÉE ET CLAIRE
  const isValidUrl = imageUrl && 
                     typeof imageUrl === 'string' && 
                     imageUrl.trim() !== "" && 
                     imageUrl !== "null" && 
                     imageUrl !== "undefined";
  
  if (!isValidUrl) {
    console.log("❌ BarcodeImageThumbnail - URL invalide, affichage placeholder:", {
      raison: !imageUrl ? "URL null/undefined" : 
              typeof imageUrl !== 'string' ? "Type non-string" :
              imageUrl.trim() === "" ? "String vide" :
              imageUrl === "null" ? "String 'null'" : 
              imageUrl === "undefined" ? "String 'undefined'" : "Autre"
    });
    
    return (
      <div className={`w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center ${className}`}>
        <Barcode className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  console.log("✅ BarcodeImageThumbnail - URL VALIDE, affichage image:", {
    url_finale: imageUrl,
    longueur: imageUrl.length,
    preview: imageUrl.substring(0, 100) + "..."
  });

  return (
    <div className={`group relative ${className}`}>
      <img 
        src={imageUrl} 
        alt="Image code-barres"
        className="w-8 h-8 rounded border border-blue-300 object-cover cursor-pointer hover:w-16 hover:h-16 transition-all duration-200 ring-2 ring-blue-200"
        title="Image du code-barres scanné - Cliquez pour agrandir"
        onError={(e) => {
          console.error("❌ BarcodeImageThumbnail - ERREUR CHARGEMENT:", {
            url_tentée: imageUrl,
            error_event: e,
            target_src: e.currentTarget.src,
            timestamp: new Date().toISOString()
          });
          
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent && !parent.querySelector('.error-placeholder')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-placeholder w-8 h-8 bg-red-100 rounded border border-red-300 flex items-center justify-center';
            errorDiv.innerHTML = '<div class="w-4 h-4 text-red-500 text-xs">❌</div>';
            errorDiv.title = `Erreur de chargement: ${imageUrl}`;
            parent.appendChild(errorDiv);
          }
        }}
        onLoad={() => {
          console.log("✅ BarcodeImageThumbnail - IMAGE CHARGÉE AVEC SUCCÈS:", {
            url: imageUrl,
            timestamp: new Date().toISOString(),
            statut: "AFFICHAGE RÉUSSI"
          });
        }}
        key={`barcode-${imageUrl}-${Date.now()}`} // Key unique pour forcer le rechargement
        onClick={() => {
          console.log("🔍 BarcodeImageThumbnail - Ouverture image:", imageUrl);
          window.open(imageUrl, '_blank');
        }}
      />
      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
        <Barcode className="w-2 h-2" />
      </div>
    </div>
  );
};
