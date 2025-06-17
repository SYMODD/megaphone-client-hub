import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Camera, Upload } from "lucide-react";

interface ScanErrorProps {
  errorStep: 'upload' | 'compression' | 'ocr' | 'extraction' | 'validation' | null;
  errorMessage?: string;
  onRetry: () => void;
  onReset: () => void;
}

export const ScanError = ({ errorStep, errorMessage, onRetry, onReset }: ScanErrorProps) => {
  const getErrorDetails = () => {
    switch (errorStep) {
      case 'upload':
        return {
          title: "Erreur lors du téléchargement",
          description: "Impossible de télécharger l'image. Vérifiez que :",
          suggestions: [
            "Le fichier n'est pas corrompu",
            "Le format est supporté (JPG, PNG)",
            "La taille ne dépasse pas 10MB"
          ],
          icon: Upload
        };
      case 'compression':
        return {
          title: "Erreur lors de l'optimisation",
          description: "L'image n'a pas pu être optimisée. Essayez de :",
          suggestions: [
            "Utiliser une image de meilleure qualité",
            "Vérifier que l'image n'est pas trop grande",
            "Réduire la résolution de l'image"
          ],
          icon: RefreshCw
        };
      case 'ocr':
        return {
          title: "Erreur lors de l'analyse",
          description: "L'OCR n'a pas pu analyser l'image. Assurez-vous que :",
          suggestions: [
            "L'image est bien éclairée",
            "Le passeport est bien visible",
            "Il n'y a pas de reflets ou d'ombres"
          ],
          icon: Camera
        };
      case 'extraction':
        return {
          title: "Erreur lors de l'extraction",
          description: "Les données n'ont pas pu être extraites. Vérifiez que :",
          suggestions: [
            "La zone MRZ est bien visible",
            "Le texte est lisible",
            "Le passeport n'est pas endommagé"
          ],
          icon: AlertCircle
        };
      case 'validation':
        return {
          title: "Erreur lors de la validation",
          description: "Les données extraites sont invalides. Vérifiez que :",
          suggestions: [
            "Les dates sont lisibles",
            "Les numéros sont complets",
            "Les informations sont à jour"
          ],
          icon: AlertCircle
        };
      default:
        return {
          title: "Une erreur est survenue",
          description: "Une erreur inattendue s'est produite. Essayez de :",
          suggestions: [
            "Rafraîchir la page",
            "Utiliser une autre image",
            "Contacter le support si le problème persiste"
          ],
          icon: AlertCircle
        };
    }
  };

  const errorDetails = getErrorDetails();
  const Icon = errorDetails.icon;

  return (
    <Alert variant="destructive" className="mt-4">
      <Icon className="h-4 w-4" />
      <AlertTitle>{errorDetails.title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">{errorDetails.description}</p>
        <ul className="list-disc list-inside text-sm space-y-1 mb-4">
          {errorDetails.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
        {errorMessage && (
          <p className="text-sm italic mt-2">
            Détails techniques : {errorMessage}
          </p>
        )}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            Nouveau scan
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}; 