
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CaptchaComponent } from "@/components/security/CaptchaComponent";
import { CheckCircle, XCircle, Play, Shield } from "lucide-react";

export const CaptchaValidationTest = () => {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; score?: number } | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const handleCaptchaVerify = async (token: string, score?: number) => {
    console.log('🔐 Test de vérification CAPTCHA v3 avec token:', token?.substring(0, 20) + '...');
    console.log('📊 Score reçu:', score);
    
    const scoreInfo = score !== undefined ? ` (Score: ${score.toFixed(1)}/1.0)` : '';
    setTestResult({ 
      success: true, 
      message: `Token reçu avec succès: ${token.substring(0, 30)}...${scoreInfo}`,
      score 
    });
  };

  const handleCaptchaExpire = () => {
    console.log('⏰ CAPTCHA v3 expiré pendant le test');
    setTestResult({ success: false, message: "CAPTCHA expiré pendant le test" });
  };

  const startTest = () => {
    setIsTestRunning(true);
    setTestResult(null);
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return "text-gray-600";
    if (score >= 0.7) return "text-green-600";
    if (score >= 0.3) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Test de validation CAPTCHA v3
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-green-700">
            Utilisez ce test pour vérifier que le CAPTCHA v3 fonctionne correctement avec les clés configurées.
            Contrairement à v2, reCAPTCHA v3 fonctionne de manière invisible et retourne un score de confiance.
          </p>

          {!isTestRunning && (
            <Button onClick={startTest} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Démarrer le test CAPTCHA v3
            </Button>
          )}

          {isTestRunning && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-white">
                <h4 className="font-medium mb-3">Test du widget CAPTCHA v3:</h4>
                <CaptchaComponent
                  onVerify={handleCaptchaVerify}
                  onExpire={handleCaptchaExpire}
                  action="admin_test"
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
                      <div className="space-y-1">
                        <div>
                          <strong>{testResult.success ? "Succès:" : "Erreur:"}</strong> {testResult.message}
                        </div>
                        {testResult.score !== undefined && (
                          <div className={`text-sm ${getScoreColor(testResult.score)}`}>
                            <strong>Analyse du score:</strong>
                            {testResult.score >= 0.7 && " Excellent - Très probablement humain"}
                            {testResult.score >= 0.3 && testResult.score < 0.7 && " Modéré - Vérification supplémentaire recommandée"}
                            {testResult.score < 0.3 && " Faible - Probablement un robot"}
                          </div>
                        )}
                      </div>
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
