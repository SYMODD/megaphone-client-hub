
import { Image, Barcode } from "lucide-react";
import { Client } from "@/hooks/useClientData/types";

interface BarcodeImageThumbnailProps {
  imageUrl?: string | null;
  client?: Client;
  className?: string;
}

export const BarcodeImageThumbnail = ({ imageUrl, client, className = "" }: BarcodeImageThumbnailProps) => {
  // Use client.code_barre_image_url if client is provided and imageUrl is not
  const effectiveImageUrl = imageUrl || (client?.code_barre_image_url);
  
  console.log("🔍 BarcodeImageThumbnail - ANALYSE COMPLÈTE:", {
    imageUrl_reçue: effectiveImageUrl,
    type: typeof effectiveImageUrl,
    length: effectiveImageUrl?.length || 0,
    truthy: !!effectiveImageUrl,
    string_vide: effectiveImageUrl === "",
    null_check: effectiveImageUrl === null,
    undefined_check: effectiveImageUrl === undefined,
    string_null: effectiveImageUrl === "null",
    string_undefined: effectiveImageUrl === "undefined",
    trimmed: effectiveImageUrl?.trim(),
    condition_finale: effectiveImageUrl && effectiveImageUrl.trim() !== "" && effectiveImageUrl !== "null" && effectiveImageUrl !== "undefined"
  });
  
  // 🎯 CONDITION SIMPLIFIÉE ET CLAIRE
  const isValidUrl = effectiveImageUrl && 
                     typeof effectiveImageUrl === 'string' && 
                     effectiveImageUrl.trim() !== "" && 
                     effectiveImageUrl !== "null" && 
                     effectiveImageUrl !== "undefined";
  
  if (!isValidUrl) {
    console.log("❌ BarcodeImageThumbnail - URL invalide, affichage placeholder:", {
      raison: !effectiveImageUrl ? "URL null/undefined" : 
              typeof effectiveImageUrl !== 'string' ? "Type non-string" :
              effectiveImageUrl.trim() === "" ? "String vide" :
              effectiveImageUrl === "null" ? "String 'null'" : 
              effectiveImageUrl === "undefined" ? "String 'undefined'" : "Autre"
    });
    
    return (
      <div className={`w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center ${className}`}>
        <Barcode className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  console.log("✅ BarcodeImageThumbnail - URL VALIDE, affichage image:", {
    url_finale: effectiveImageUrl,
    longueur: effectiveImageUrl.length,
    preview: effectiveImageUrl.substring(0, 100) + "..."
  });

  return (
    <div className={`group relative ${className}`}>
      <img 
        src={effectiveImageUrl} 
        alt="Image code-barres"
        className="w-8 h-8 rounded border border-blue-300 object-cover cursor-pointer hover:w-16 hover:h-16 transition-all duration-200 ring-2 ring-blue-200"
        title="Image du code-barres scanné - Cliquez pour agrandir"
        onError={(e) => {
          console.error("❌ BarcodeImageThumbnail - ERREUR CHARGEMENT:", {
            url_tentée: effectiveImageUrl,
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
            errorDiv.title = `Erreur de chargement: ${effectiveImageUrl}`;
            parent.appendChild(errorDiv);
          }
        }}
        onLoad={() => {
          console.log("✅ BarcodeImageThumbnail - IMAGE CHARGÉE AVEC SUCCÈS:", {
            url: effectiveImageUrl,
            timestamp: new Date().toISOString(),
            statut: "AFFICHAGE RÉUSSI"
          });
        }}
        key={`barcode-${effectiveImageUrl}-${Date.now()}`} // Key unique pour forcer le rechargement
        onClick={() => {
          console.log("🔍 BarcodeImageThumbnail - Ouverture image:", effectiveImageUrl);
          window.open(effectiveImageUrl, '_blank');
        }}
      />
      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
        <Barcode className="w-2 h-2" />
      </div>
    </div>
  );
};
