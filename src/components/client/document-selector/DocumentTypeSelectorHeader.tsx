
import { CardDescription, CardTitle } from "@/components/ui/card";

export const DocumentTypeSelectorHeader = () => {
  return (
    <div className="flex-1">
      <CardTitle className="text-lg">Choix de pièce d'identité</CardTitle>
      <CardDescription>
        Veuillez sélectionner la pièce d'identité souhaitée par le client
      </CardDescription>
    </div>
  );
};
