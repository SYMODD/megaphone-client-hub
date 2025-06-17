import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { detectKeyType } from "@/services/ocr/keyDetection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_OCR_API_KEY = "helloworld";
const STORAGE_KEY = "ocr_api_key_global";

interface KeyInfo {
  isPro: boolean;
  remainingCredits?: string;
  dailyLimit?: string;
}

export const useOCRSettings = () => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  
  // Initialiser avec la clé sauvegardée ou la clé par défaut
  const getStoredKey = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_OCR_API_KEY;
    } catch {
      return DEFAULT_OCR_API_KEY;
    }
  };

  const [apiKey, setApiKey] = useState<string>(getStoredKey());
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null);

  // Charger la clé depuis la base de données à la connexion
  useEffect(() => {
    const loadKeyFromDatabase = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('ocr_global_settings')
          .select('api_key')
          .single();

        if (error) {
          console.error("Erreur lors du chargement de la clé OCR:", error);
          return;
        }

        if (data?.api_key) {
          console.log("✅ Clé OCR globale chargée depuis la base de données");
          setApiKey(data.api_key);
          localStorage.setItem(STORAGE_KEY, data.api_key);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la clé OCR:", error);
      }
    };

    loadKeyFromDatabase();
  }, [user]);

  // CORRECTION : Ajouter un listener pour les changements localStorage depuis d'autres onglets/composants
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        console.log("🔄 useOCRSettings - Détection changement localStorage:", e.newValue.substring(0, 8) + "...");
        setApiKey(e.newValue);
      }
    };

    // Ajouter un listener custom pour les changements dans le même onglet
    const handleCustomStorageEvent = (e: CustomEvent) => {
      if (e.detail.key === STORAGE_KEY) {
        console.log("🔄 useOCRSettings - Détection changement localStorage custom:", e.detail.newValue.substring(0, 8) + "...");
        setApiKey(e.detail.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageEvent as EventListener);
    };
  }, []);

  const createTestImageBlob = (): Promise<File> => {
    return new Promise((resolve) => {
      // Créer une image de test simple à la volée
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 100);
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText('TEST OCR', 50, 50);
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], 'test-image.png', { type: 'image/png' }));
        }
      }, 'image/png');
    });
  };

  const validateApiKey = useCallback(async (keyToValidate: string) => {
    if (!keyToValidate || keyToValidate.length < 3) {
      setIsValid(false);
      setKeyInfo(null);
      return false;
    }

    setIsValidating(true);
    setIsValid(null);
    setKeyInfo(null);

    try {
      console.log("🔍 Validation de la clé API OCR:", keyToValidate.substring(0, 8) + "...");
      
      const isPro = detectKeyType(keyToValidate);
      const endpoint = isPro ? "https://apipro1.ocr.space/parse/image" : "https://api.ocr.space/parse/image";
      
      // Créer une image de test simple
      const testImage = await createTestImageBlob();
      
      // CORRECTION CRITIQUE : Encoder l'image en base64 avec le bon format
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          console.log("🖼️ Image de test encodée:", {
            prefix: result.substring(0, 30) + "...",
            isValidFormat: result.startsWith('data:image/')
          });
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(testImage);
      });
      
      const formData = new FormData();
      formData.append('base64Image', base64Image); // CORRECTION : Utiliser base64Image
      formData.append('language', isPro ? 'fre' : 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': keyToValidate
        },
        body: formData
      });

      if (!response.ok) {
        console.error("❌ Validation échouée - HTTP", response.status);
        const errorText = await response.text();
        if (errorText.includes("Not a valid base64 image")) {
          console.error("🚨 Erreur format base64:", errorText);
        }
        setIsValid(false);
        setKeyInfo(null);
        return false;
      }

      const result = await response.json();
      
      if (result.IsErroredOnProcessing || result.OCRExitCode !== 1) {
        console.error("❌ Validation échouée - Erreur OCR:", result.ErrorMessage);
        setIsValid(false);
        setKeyInfo(null);
        return false;
      }

      // Analyser les informations de la clé
      const info: KeyInfo = {
        isPro: isPro,
      };

      // Extraire les crédits restants si disponibles dans la réponse
      if (result.ParsedResults && result.ParsedResults[0]) {
        if (isPro) {
          info.remainingCredits = "Illimité (PRO)";
        } else {
          info.dailyLimit = "25 requêtes/jour";
        }
      }

      console.log("✅ Clé API validée avec succès:", {
        type: isPro ? 'PRO' : 'FREE',
        info: info
      });

      setIsValid(true);
      setKeyInfo(info);
      return true;

    } catch (error) {
      console.error("❌ Erreur lors de la validation:", error);
      setIsValid(false);
      setKeyInfo(null);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const updateApiKey = useCallback((newKey: string) => {
    console.log("🔄 Mise à jour clé API OCR:", newKey.substring(0, 8) + "...");
    setApiKey(newKey);
    setIsValid(null);
    setKeyInfo(null);
  }, []);

  const saveApiKey = useCallback(async (keyToSave: string) => {
    if (!keyToSave || keyToSave.length < 3) {
      toast.error("❌ Clé API invalide");
      return false;
    }

    // Vérifier si l'utilisateur est admin
    if (!isAdmin) {
      toast.error("❌ Seuls les administrateurs peuvent modifier la clé API");
      return false;
    }

    setIsSaving(true);
    console.log("💾 Sauvegarde de la clé API OCR globale:", keyToSave.substring(0, 8) + "...");

    try {
      // Sauvegarder dans localStorage
      localStorage.setItem(STORAGE_KEY, keyToSave);
      
      // Sauvegarder dans la base de données
      const { error } = await supabase
        .from('ocr_global_settings')
        .upsert({
          api_key: keyToSave,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        });

      if (error) {
        console.error("Erreur lors de la sauvegarde en base de données:", error);
        toast.error("❌ Erreur lors de la sauvegarde de la clé API");
        return false;
      }
      
      // Dispatch un événement custom pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: { key: STORAGE_KEY, newValue: keyToSave }
      }));
      
      // Mettre à jour l'état local
      setApiKey(keyToSave);
      
      // Afficher un message de succès
      const isPro = detectKeyType(keyToSave);
      toast.success(`✅ Clé ${isPro ? 'PRO' : 'FREE'} sauvegardée avec succès pour tous les utilisateurs`);
      
      console.log("✅ Clé API globale sauvegardée avec succès");
      return true;
      
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error);
      toast.error("❌ Erreur lors de la sauvegarde de la clé API");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, isAdmin]);

  const resetToDefault = useCallback(() => {
    console.log("🔄 Reset vers clé par défaut");
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Dispatch l'événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: { key: STORAGE_KEY, newValue: DEFAULT_OCR_API_KEY }
      }));
    } catch (error) {
      console.warn("Impossible de supprimer la clé du localStorage:", error);
    }
    setApiKey(DEFAULT_OCR_API_KEY);
    setIsValid(null);
    setKeyInfo(null);
  }, []);

  return {
    apiKey,
    isValidating,
    isSaving,
    isValid,
    keyInfo,
    validateApiKey,
    updateApiKey,
    saveApiKey,
    resetToDefault,
    isAdmin
  };
};
