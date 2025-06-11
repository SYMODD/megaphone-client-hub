
import { CardDescription, CardTitle } from "@/components/ui/card";
import { RecaptchaStatusIndicator } from "@/components/recaptcha/RecaptchaStatusIndicator";

export const DocumentTypeSelectorHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <CardTitle className="text-lg">Choix de pièce d'identité</CardTitle>
        <CardDescription>
          Veuillez sélectionner la pièce d'identité souhaitée par le client
        </CardDescription>
      </div>
      <RecaptchaStatusIndicator context="document_selection" />
    </div>
  );
};
