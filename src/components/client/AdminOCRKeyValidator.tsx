
import { useAuth } from "@/contexts/AuthContext";
import { OCRKeyValidator } from "./OCRKeyValidator";

interface AdminOCRKeyValidatorProps {
  onKeyChange?: (key: string) => void;
  initialKey?: string;
}

export const AdminOCRKeyValidator = ({ onKeyChange, initialKey }: AdminOCRKeyValidatorProps) => {
  const { profile, user } = useAuth();
  
  // Vérifier si l'utilisateur actuel est admin
  const isAdmin = profile?.role === "admin" || user?.email === "essbane.salim@gmail.com";
  
  // Si l'utilisateur n'est pas admin, ne pas afficher le composant
  if (!isAdmin) {
    return null;
  }

  return (
    <OCRKeyValidator
      onKeyChange={onKeyChange}
      initialKey={initialKey}
    />
  );
};
