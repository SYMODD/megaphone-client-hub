import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, EyeOff, RefreshCw, Key, Crown, Info, AlertTriangle, Zap, Save } from "lucide-react";
import { useOCRSettings } from "@/hooks/useOCRSettings";
import { detectKeyType } from "@/services/ocr/keyDetection";
import { Card, CardContent } from "@/components/ui/card";

interface OCRKeyValidatorProps {
  onKeyChange?: (key: string) => void;
  initialKey?: string;
}

export const OCRKeyValidator = ({ onKeyChange, initialKey }: OCRKeyValidatorProps) => {
  const { 
    apiKey, 
    isValidating, 
    isValid, 
    keyInfo, 
    validateApiKey, 
    updateApiKey, 
    resetToDefault,
    saveApiKey,
    isSaving
  } = useOCRSettings();
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(initialKey || apiKey);

  // CORRECTION : Synchroniser avec la clé centralisée à chaque changement
  useEffect(() => {
    console.log("🔄 OCRKeyValidator - Synchronisation avec clé centralisée:", apiKey.substring(0, 8) + "...");
    setLocalKey(apiKey);
    if (onKeyChange) {
      onKeyChange(apiKey);
    }
  }, [apiKey, onKeyChange]);

  const handleKeyChange = (newKey: string) => {
    console.log("🔄 OCRKeyValidator - Changement local de clé:", newKey.substring(0, 8) + "...");
    setLocalKey(newKey);
    updateApiKey(newKey);
    if (onKeyChange) {
      onKeyChange(newKey);
    }
  };

  const handleValidate = async () => {
    await validateApiKey(localKey);
  };

  const handleReset = () => {
    console.log("🔄 OCRKeyValidator - Reset vers défaut");
    resetToDefault();
    // La synchronisation se fera via useEffect
  };

  const handleSave = async () => {
    console.log("💾 OCRKeyValidator - Sauvegarde de la clé:", localKey.substring(0, 8) + "...");
    const success = await saveApiKey(localKey);
    if (success) {
      console.log("✅ OCRKeyValidator - Clé sauvegardée avec succès");
    }
  };

  const getKeyTypeBadge = () => {
    const isPro = detectKeyType(localKey);
    if (isPro) {
      return (
        <Badge className="ml-2 bg-purple-500">
          <Zap className="w-3 h-3 mr-1" />
          Clé PRO détectée
        </Badge>
      );
    } else if (localKey !== "helloworld") {
      return (
        <Badge variant="secondary" className="ml-2">
          <Key className="w-3 h-3 mr-1" />
          Clé FREE
        </Badge>
      );
    }
    return null;
  };

  const getValidationBadge = () => {
    if (isValidating) {
      return (
        <Badge variant="secondary" className="ml-2">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Test en cours...
        </Badge>
      );
    }
    
    if (isValid === true) {
      const isPro = keyInfo?.isPro;
      return (
        <Badge className={`ml-2 ${isPro ? 'bg-purple-500' : 'bg-green-500'}`}>
          {isPro ? <Crown className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
          {isPro ? 'Clé PRO validée' : 'Clé valide'}
        </Badge>
      );
    }
    
    if (isValid === false) {
      return (
        <Badge variant="destructive" className="ml-2">
          <XCircle className="w-3 h-3 mr-1" />
          Clé invalide
        </Badge>
      );
    }
    
    return null;
  };

  const getKeyStatus = () => {
    if (isValid && keyInfo) {
      return (
        <Card className="mt-3 border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Statut de la clé API (Centralisée)</span>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">
                  {keyInfo.isPro ? 'PRO (Headers + Fallback automatique)' : 'Démo (25 req/jour)'}
                </span>
              </div>
              {keyInfo.remainingCredits && (
                <div className="flex justify-between">
                  <span>Crédits restants:</span>
                  <span className="font-medium">{keyInfo.remainingCredits}</span>
                </div>
              )}
              {keyInfo.dailyLimit && (
                <div className="flex justify-between">
                  <span>Limite quotidienne:</span>
                  <span className="font-medium">{keyInfo.dailyLimit}</span>
                </div>
              )}
              {keyInfo.isPro && (
                <div className="text-green-700 text-xs mt-2">
                  ✨ Configuration PRO unifiée : apipro1.ocr.space ↔ apipro2.ocr.space
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isValid === false) {
      return (
        <Card className="mt-3 border-l-4 border-l-red-500">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-sm text-red-800">Problème de validation</span>
            </div>
            <div className="text-xs text-red-700 space-y-1">
              <p>• Vérifiez que la clé est correcte</p>
              <p>• Assurez-vous qu'elle est active sur OCR.space</p>
              <p>• Vérifiez votre crédit disponible</p>
              {detectKeyType(localKey) && (
                <p>• Clé PRO détectée : vérifiez vos paramètres d'abonnement</p>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
      <div className="flex items-center gap-2 flex-wrap">
        <Key className="w-4 h-4 text-blue-600" />
        <Label className="font-medium">Configuration clé API OCR centralisée</Label>
        {getKeyTypeBadge()}
        {getValidationBadge()}
      </div>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type={showKey ? "text" : "password"}
              value={localKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="Entrez votre clé API OCR.space"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={isValidating || !localKey}
            className="shrink-0"
          >
            {isValidating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Tester
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="shrink-0"
          >
            Par défaut
          </Button>
        </div>

        {/* Nouveau bouton Enregistrer */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !localKey || localKey.length < 3}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Sauvegarde...' : 'Enregistrer la clé pour tous les documents'}
          </Button>
        </div>
        
        <p className="text-xs text-gray-600">
          🎯 Hook centralisé useOCRRequest() unifié pour tous les documents.
          Clé PRO : Headers + Fallback automatique apipro1 ↔ apipro2.
          Pour une clé PRO, obtenez-la sur{" "}
          <a 
            href="https://ocr.space/ocrapi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            ocr.space/ocrapi
          </a>
        </p>
        
        {getKeyStatus()}
      </div>
    </div>
  );
};
