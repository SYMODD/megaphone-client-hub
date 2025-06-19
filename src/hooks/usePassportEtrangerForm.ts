import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PassportEtrangerData } from "@/types/passportEtrangerTypes";

interface FormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  date_naissance: string;
  date_expiration: string;
  date_enregistrement: string;
  observations: string;
  scannedImage: string | null;
  code_barre_image_url: string;
}

export const usePassportEtrangerForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadClientPhoto } = useImageUpload();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    date_naissance: "",
    date_expiration: "",
    date_enregistrement: new Date().toISOString().split('T')[0],
    observations: "",
    scannedImage: null,
    code_barre_image_url: ""
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageScanned = (imageData: string) => {
    setFormData(prev => ({ ...prev, scannedImage: imageData }));
  };

  const handlePassportDataExtracted = (extractedData: PassportEtrangerData, documentType: 'passeport_etranger' | 'carte_sejour') => {
    console.log("🎯 PASSEPORT ÉTRANGER - Données extraites:", extractedData);

    setFormData(prev => ({
      ...prev,
      nom: extractedData.nom || "",
      prenom: extractedData.prenom || "",
      nationalite: extractedData.nationalite || "",
      numero_passeport: extractedData.numero_passeport || "",
      date_naissance: extractedData.date_naissance || "",
      date_expiration: extractedData.date_expiration || "",
      code_barre: extractedData.code_barre || extractedData.numero_passeport || "",
      numero_telephone: extractedData.numero_telephone || "",
      observations: prev.observations || `Données extraites automatiquement via OCR le ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')} - Type de document: ${documentType}`
    }));
  };

  const handleSubmit = async () => {
    console.log("🚀 SOUMISSION PASSEPORT ÉTRANGER - Début avec données:", {
      nom: formData.nom,
      prenom: formData.prenom,
      numero_passeport: formData.numero_passeport,
      nationalite: formData.nationalite,
      scannedImage: formData.scannedImage ? "✅ PRÉSENTE" : "❌ ABSENTE",
      code_barre_image_url: formData.code_barre_image_url || "❌ ABSENTE"
    });

    if (!formData.nom || !formData.prenom || !formData.numero_passeport || !formData.nationalite) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload de l'image du passeport si présente
      let photoUrl = null;
      if (formData.scannedImage) {
        console.log("📤 UPLOAD IMAGE PASSEPORT ÉTRANGER vers client-photos");
        
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'passeport_etranger');
        console.log("✅ Image passeport étranger uploadée:", photoUrl);
      }

      // Récupérer l'utilisateur et son profil
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // 🔧 CORRECTION: Récupérer le profil pour point_operation
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("❌ Erreur récupération profil:", profileError);
        throw new Error("Impossible de récupérer le profil utilisateur");
      }

      // 🔧 CORRECTION: Appliquer la même logique que dataPreparation.ts
      const getCategorie = (pointOperation: string | undefined): string => {
        if (!pointOperation) return 'agence';
        
        if (pointOperation.startsWith('aeroport')) return 'aeroport';
        if (pointOperation.startsWith('navire')) return 'navire';
        return 'agence';
      };

      const pointOperation = profile?.point_operation || 'agence_centrale';
      const categorie = getCategorie(pointOperation);

      console.log("💾 VÉRIFICATION AVANT INSERTION - URL code-barres:", {
        code_barre_image_url_from_form: formData.code_barre_image_url,
        is_valid: formData.code_barre_image_url ? "✅ VALIDE" : "❌ MANQUANTE"
      });

      // Préparer les données finales pour l'insertion
      const finalData = {
        nom: formData.nom,
        prenom: formData.prenom,
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport,
        numero_telephone: formData.numero_telephone || null,
        code_barre: formData.code_barre || null,
        photo_url: photoUrl,
        observations: formData.observations || `Données extraites automatiquement via OCR le ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')} - Type de document: Passeport étranger`,
        date_enregistrement: formData.date_enregistrement,
        document_type: 'passeport_etranger',
        agent_id: user.id,
        code_barre_image_url: formData.code_barre_image_url || null,
        // 🔧 CORRECTION: Ajouter point_operation et categorie
        point_operation: pointOperation,
        categorie: categorie
      };

      console.log("💾 INSERTION CLIENT PASSEPORT ÉTRANGER - Données finales:", {
        ...finalData,
        photo_incluse: photoUrl ? "✅ INCLUSE" : "❌ ABSENTE",
        code_barre_image_incluse: finalData.code_barre_image_url ? "✅ INCLUSE" : "❌ ABSENTE"
      });

      // Insertion en base de données
      const { error } = await supabase
        .from('clients')
        .insert([finalData]);

      if (error) {
        console.error('❌ Erreur insertion:', error);
        throw error;
      }

      toast({
        title: "Client enregistré avec succès",
        description: `${formData.prenom} ${formData.nom} a été ajouté à la base de données.`,
      });

      navigate('/base-clients');
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le client. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleInputChange,
    handleImageScanned,
    handlePassportDataExtracted,
    handleSubmit
  };
};
