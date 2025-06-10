
import { Badge } from "@/components/ui/badge";

interface DocumentTypeDisplayProps {
  detectedDocumentType: 'passeport_etranger' | 'carte_sejour' | 'unknown' | null;
  detectionConfidence: number;
}

export const DocumentTypeDisplay = ({ 
  detectedDocumentType, 
  detectionConfidence 
}: DocumentTypeDisplayProps) => {
  const getDocumentTypeLabel = () => {
    switch (detectedDocumentType) {
      case 'passeport_etranger':
        return 'Passeport Étranger';
      case 'carte_sejour':
        return 'Carte de Séjour';
      case 'unknown':
        return 'Type inconnu';
      default:
        return 'En cours de détection...';
    }
  };

  const getDocumentTypeColor = () => {
    switch (detectedDocumentType) {
      case 'passeport_etranger':
        return 'bg-blue-500';
      case 'carte_sejour':
        return 'bg-green-500';
      case 'unknown':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (detectedDocumentType && detectedDocumentType !== 'unknown') {
    return (
      <Badge className={getDocumentTypeColor()}>
        {getDocumentTypeLabel()} ({Math.round(detectionConfidence)}%)
      </Badge>
    );
  }

  if (detectedDocumentType === 'unknown') {
    return (
      <Badge variant="destructive">
        Type non reconnu
      </Badge>
    );
  }

  return null;
};
