
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CaptchaComponent } from "@/components/security/CaptchaComponent";
import { CheckCircle, XCircle, Play } from "lucide-react";

export const CaptchaValidationTest = () => {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const handleCaptchaVerify = async (token: string) => {
    console.log('🔐 Test de vérification CAPTCHA avec token:', token?.substring(0, 20) + '...');
    setTestResult({ success: true, message: `Token reçu avec succès: ${token.substring(0, 30)}...` });
  };

  const handleCaptchaExpire = () => {
    console.log('⏰ CAPTCHA expiré pendant le test');
    setTestResult({ success: false, message: "CAPTCHA expiré pendant le test" });
  };

  const startTest = () => {
    setIsTestRunning(true);
    setTestResult(null);
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <Play className="w-5 h-5" />
          Test de validation CAPTCHA
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-green-700">
            Utilisez ce test pour vérifier que le CAPTCHA fonctionne correctement avec les clés configurées.
          </p>

          {!isTestRunning && (
            <Button onClick={startTest} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Démarrer le test CAPTCHA
            </Button>
          )}

          {isTestRunning && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-white">
                <h4 className="font-medium mb-3">Test du widget CAPTCHA:</h4>
                <CaptchaComponent
                  onVerify={handleCaptchaVerify}
                  onExpire={handleCaptchaExpire}
                  theme="light"
                  size="normal"
                />
              </div>

              {testResult && (
                <Alert className={testResult.success ? "border-green-200 bg-green-100" : "border-red-200 bg-red-100"}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                      <strong>{testResult.success ? "Succès:" : "Erreur:"}</strong> {testResult.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <Button 
                variant="outline" 
                onClick={() => setIsTestRunning(false)}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Terminer le test
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
