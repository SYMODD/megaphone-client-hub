
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, RotateCcw } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  onReset: () => void;
  isCaptchaVerified?: boolean;
}

export const FormActions = ({ isSubmitting, onReset, isCaptchaVerified }: FormActionsProps) => {
  // Si isCaptchaVerified n'est pas défini, on considère que le CAPTCHA n'est pas requis
  const captchaRequired = isCaptchaVerified !== undefined;
  const canSubmit = captchaRequired ? isCaptchaVerified : true;

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Enregistrement..." : "Enregistrer le client"}
            </Button>
          </div>
        </div>
        
        {captchaRequired && !isCaptchaVerified && (
          <div className="mt-3 text-xs text-orange-600 text-center">
            Veuillez compléter la vérification CAPTCHA avant de soumettre le formulaire
          </div>
        )}
      </CardContent>
    </Card>
  );
};
