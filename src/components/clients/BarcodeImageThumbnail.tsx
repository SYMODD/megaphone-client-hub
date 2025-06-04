
import { Image, Barcode } from "lucide-react";

interface BarcodeImageThumbnailProps {
  imageUrl: string | null | undefined;
  className?: string;
}

export const BarcodeImageThumbnail = ({ imageUrl, className = "" }: BarcodeImageThumbnailProps) => {
  // 🎯 Log pour debug
  console.log("🖼️ BarcodeImageThumbnail - Rendu:", {
    imageUrl,
    url_presente: imageUrl ? "✅ OUI" : "❌ NON",
    url_valide: imageUrl && imageUrl.trim() !== "" ? "✅ VALIDE" : "❌ INVALIDE"
  });

  if (!imageUrl || imageUrl.trim() === "") {
    return (
      <div className={`w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center ${className}`}>
        <Barcode className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      <img 
        src={imageUrl} 
        alt="Image code-barres"
        className="w-8 h-8 rounded border border-blue-300 object-cover cursor-pointer hover:w-16 hover:h-16 transition-all duration-200 ring-2 ring-blue-200"
        title="Image du code-barres scanné"
        onError={(e) => {
          console.error("❌ Erreur chargement miniature code-barres:", imageUrl);
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent && !parent.querySelector('.error-placeholder')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-placeholder w-8 h-8 bg-red-100 rounded border border-red-300 flex items-center justify-center';
            errorDiv.innerHTML = '<div class="w-4 h-4 text-red-500 text-xs">❌</div>';
            errorDiv.title = 'Erreur de chargement de l\'image';
            parent.appendChild(errorDiv);
          }
        }}
        onLoad={() => {
          console.log("✅ Miniature code-barres chargée avec succès:", imageUrl);
        }}
        key={imageUrl}
      />
      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
        <Barcode className="w-2 h-2" />
      </div>
    </div>
  );
};
