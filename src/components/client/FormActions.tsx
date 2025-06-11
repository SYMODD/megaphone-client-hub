
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, RotateCcw, Shield, ShieldCheck } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  onReset: () => void;
  isCaptchaVerified?: boolean;
}

export const FormActions = ({ isSubmitting, onReset, isCaptchaVerified = false }: FormActionsProps) => {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            {isCaptchaVerified ? (
              <>
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Vérification de sécurité validée</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600">Vérification de sécurité requise</span>
              </>
            )}
          </div>
          
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
              disabled={isSubmitting || !isCaptchaVerified}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Enregistrement..." : "Enregistrer le client"}
            </Button>
          </div>
        </div>
        
        {!isCaptchaVerified && (
          <div className="mt-3 text-xs text-orange-600 text-center">
            Veuillez compléter la vérification CAPTCHA avant de soumettre le formulaire
          </div>
        )}
      </CardContent>
    </Card>
  );
};
