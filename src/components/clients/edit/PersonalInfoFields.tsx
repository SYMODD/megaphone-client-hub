import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NationalityCombobox } from "@/components/client/NationalityCombobox";
import { getDocumentInfo, DocumentType, validateDocumentNumber } from "@/utils/documentTypeUtils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PersonalInfoFieldsProps {
  formData: {
    prenom: string;
    nom: string;
    nationalite: string;
    numero_passeport: string;
    document_type: string;
  };
  onUpdate: (field: string, value: string) => void;
  clientId?: string; // ID du client actuel pour éviter les conflits avec lui-même
}

export const PersonalInfoFields = ({ formData, onUpdate, clientId }: PersonalInfoFieldsProps) => {
  // 🎯 Informations dynamiques selon le type de document
  const documentType = formData.document_type as DocumentType || 'cin';
  const documentInfo = getDocumentInfo(documentType);
  
  // 🔍 État de validation du numéro de document
  const [numeroError, setNumeroError] = useState<string>('');
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // 🔍 Vérification des doublons en temps réel
  const checkForDuplicate = async (value: string) => {
    if (!value || !clientId) return false;

    setCheckingDuplicate(true);
    try {
      const { data: existingClient, error } = await supabase
        .from('clients')
        .select('id, nom, prenom')
        .eq('numero_passeport', value)
        .neq('id', clientId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la vérification des doublons:', error);
        return false;
      }

      return existingClient ? existingClient : false;
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return false;
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // 🔍 Validation en temps réel du numéro de document avec débounce
  const handleNumeroChange = (value: string) => {
    onUpdate('numero_passeport', value);
    
    // Validation immédiate du format
    if (value && !validateDocumentNumber(value, documentType)) {
      setNumeroError(`Format invalide pour ${documentInfo.label}. Exemple: ${documentInfo.numberFieldPlaceholder}`);
      return;
    }

    // Nettoyer l'erreur si le format est valide
    if (!value || validateDocumentNumber(value, documentType)) {
      setNumeroError('');
    }
  };

  // 🔍 Débounce pour la vérification des doublons
  useEffect(() => {
    const checkDuplicateDebounced = async () => {
      if (!formData.numero_passeport || formData.numero_passeport.length < 4) {
        return;
      }

      if (!validateDocumentNumber(formData.numero_passeport, documentType)) {
        return; // Pas de vérification si le format est invalide
      }

      const duplicate = await checkForDuplicate(formData.numero_passeport);
      if (duplicate) {
        setNumeroError(`⚠️ Ce numéro est déjà utilisé par ${duplicate.prenom} ${duplicate.nom}`);
      }
    };

    const timeoutId = setTimeout(checkDuplicateDebounced, 800); // Attendre 800ms après la dernière saisie
    return () => clearTimeout(timeoutId);
  }, [formData.numero_passeport, documentType]);

  // 🔄 Re-valider quand le type de document change
  useEffect(() => {
    const revalidate = async () => {
      if (!formData.numero_passeport) {
        setNumeroError('');
        return;
      }

      // Validation du format
      if (!validateDocumentNumber(formData.numero_passeport, documentType)) {
        setNumeroError(`Format invalide pour ${documentInfo.label}. Exemple: ${documentInfo.numberFieldPlaceholder}`);
        return;
      }

      // Vérification des doublons
      const duplicate = await checkForDuplicate(formData.numero_passeport);
      if (duplicate) {
        setNumeroError(`⚠️ Ce numéro est déjà utilisé par ${duplicate.prenom} ${duplicate.nom}`);
        return;
      }

      setNumeroError('');
    };

    revalidate();
  }, [documentType, formData.numero_passeport, documentInfo.label, documentInfo.numberFieldPlaceholder]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom" className="text-sm">Prénom</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => onUpdate('prenom', e.target.value)}
            placeholder="Prénom"
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom" className="text-sm">Nom</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => onUpdate('nom', e.target.value)}
            placeholder="Nom"
            className="text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nationalite" className="text-sm">Nationalité</Label>
        <NationalityCombobox
          value={formData.nationalite}
          onValueChange={(value) => onUpdate('nationalite', value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="numero_passeport" className="text-sm flex items-center gap-2">
          <span>{documentInfo.icon}</span>
          {documentInfo.numberFieldLabel}
        </Label>
        <div className="relative">
          <Input
            id="numero_passeport"
            value={formData.numero_passeport}
            onChange={(e) => handleNumeroChange(e.target.value)}
            placeholder={documentInfo.numberFieldPlaceholder}
            className={`text-sm font-mono ${numeroError ? 'border-red-500 focus:border-red-500' : ''}`}
          />
          {checkingDuplicate && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        {numeroError ? (
          <p className="text-xs text-red-500 flex items-center gap-1">
            ⚠️ {numeroError}
          </p>
        ) : checkingDuplicate ? (
          <p className="text-xs text-blue-500 flex items-center gap-1">
            🔍 Vérification en cours...
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            Format attendu selon le type de document sélectionné
          </p>
        )}
      </div>
    </>
  );
};
