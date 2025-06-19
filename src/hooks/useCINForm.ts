import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ClientFormData } from "@/hooks/useClientForm/types";

export const useCINForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { uploadClientPhoto } = useImageUpload();
  
  const [formData, setFormData] = useState<ClientFormData>({
    nom: "",
    prenom: "",
    nationalite: "Maroc", // Default exact match avec la liste
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    code_barre_image_url: "",
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0],
    document_type: "cin",
    photo_url: "",
    scannedImage: null
  });

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    console.log(`📝 CIN FORM - Changement de champ:`, { field, value });
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageScanned = (imageData: string) => {
    console.log("🖼️ Image CIN scannée reçue");
    setFormData(prev => ({ ...prev, scannedImage: imageData }));
  };

  // ✅ CORRECTION: Normalisation pour correspondre exactement à la liste des nationalités
  const normalizeNationality = (nationality: string): string => {
    if (!nationality) return "Maroc";
    
    const normalizedNationality = nationality.toLowerCase().trim();
    
    console.log("🔄 Normalisation nationalité CIN:", {
      entrée: nationality,
      entrée_normalisée: normalizedNationality
    });
    
    // ✅ CORRECTION: Mapping pour correspondre exactement à nationalities.ts
    if (normalizedNationality === "maroc" || 
        normalizedNationality === "marocaine" || 
        normalizedNationality === "marocain" ||
        normalizedNationality === "moroccan" ||
        normalizedNationality === "morocco") {
      console.log("✅ Nationalité reconnue comme marocaine, retour: Maroc");
      return "Maroc"; // ✅ EXACTEMENT comme dans nationalities.ts
    }
    
    // Pour les autres nationalités, capitaliser la première lettre
    const result = nationality.charAt(0).toUpperCase() + nationality.slice(1).toLowerCase();
    console.log("🔄 Autre nationalité, résultat:", result);
    return result;
  };

  const handleCINDataExtracted = (extractedData: any) => {
    console.log("📄 DÉBUT - Données CIN extraites reçues:", extractedData);
    
    // ✅ Normalisation corrigée pour correspondre à la liste des nationalités
    const normalizedNationality = normalizeNationality(extractedData.nationalite);
    
    console.log("🔄 AVANT MISE À JOUR - État actuel du formulaire:", {
      nationalite_actuelle: formData.nationalite,
      nationalite_à_appliquer: normalizedNationality
    });

    // ✅ CORRECTION: Une seule mise à jour d'état pour éviter les re-renders multiples
    const extractionInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: CIN`;
    
    const updatedFormData = {
      ...formData,
      nom: extractedData.nom || formData.nom,
      prenom: extractedData.prenom || formData.prenom,
      nationalite: normalizedNationality,
      numero_passeport: extractedData.cin || extractedData.numero_cin || formData.numero_passeport,
      code_barre: extractedData.code_barre || formData.code_barre,
      code_barre_image_url: extractedData.code_barre_image_url || formData.code_barre_image_url,
      observations: formData.observations ? `${formData.observations}\n\n${extractionInfo}` : extractionInfo
    };

    console.log("✅ MISE À JOUR UNIQUE - Nouveau state complet:", {
      nationalite_avant: formData.nationalite,
      nationalite_après: updatedFormData.nationalite,
      données_complètes: updatedFormData
    });

    // Application directe du nouvel état EN UNE SEULE FOIS
    setFormData(updatedFormData);

    console.log("✅ TERMINÉ - Données CIN appliquées au formulaire avec nationalité:", normalizedNationality);
  };

  const handleSubmit = async () => {
    // ✅ PROTECTION: Éviter les soumissions accidentelles
    if (!formData.nom && !formData.prenom && !formData.numero_passeport) {
      console.log("🛡️ PROTECTION: Soumission bloquée - formulaire vide");
      return;
    }

    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez remplir tous les champs obligatoires (nom, prénom, CIN)");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 SOUMISSION CIN MANUELLE - Début avec données complètes:", {
        nom: formData.nom,
        prenom: formData.prenom,
        cin: formData.numero_passeport,
        telephone: formData.numero_telephone,
        code_barre: formData.code_barre,
        nationalite: formData.nationalite, // ✅ Log pour vérifier
        scannedImage: formData.scannedImage ? "✅ PRÉSENTE" : "❌ ABSENTE"
      });
      
      let photoUrl = formData.photo_url;
      
      // 🔥 UPLOAD AUTOMATIQUE DE L'IMAGE SCANNÉE vers client-photos
      if (formData.scannedImage && !photoUrl) {
        console.log("📤 UPLOAD IMAGE CIN vers client-photos");
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'cin');
        
        if (!photoUrl) {
          toast.error("Erreur lors du téléchargement de l'image. Enregistrement sans photo.");
        } else {
          console.log("✅ Image CIN uploadée:", photoUrl);
        }
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

      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite, // ✅ Maintenant "Maroc" exactement
        numero_passeport: formData.numero_passeport.trim(),
        numero_telephone: formData.numero_telephone.trim() || null,
        code_barre: formData.code_barre?.trim() || null,
        code_barre_image_url: formData.code_barre_image_url || null,
        photo_url: photoUrl || null,
        observations: formData.observations?.trim() || null,
        date_enregistrement: formData.date_enregistrement,
        document_type: formData.document_type,
        agent_id: user.id,
        // 🔧 CORRECTION: Ajouter point_operation et categorie
        point_operation: pointOperation,
        categorie: categorie
      };

      console.log("💾 INSERTION CLIENT CIN COMPLÈTE - Données finales:", {
        ...clientData,
        nationalite_finale: clientData.nationalite, // ✅ Verification finale
        photo_incluse: clientData.photo_url ? "✅ INCLUSE" : "❌ MANQUANTE"
      });

      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        console.error('❌ Erreur insertion client CIN:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro CIN existe déjà dans la base de données");
        } else {
          toast.error(`Erreur lors de l'enregistrement du client: ${error.message}`);
        }
        return;
      }

      toast.success(`Client CIN ${formData.prenom} ${formData.nom} enregistré avec succès!`);
      navigate("/base-clients");
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleInputChange,
    handleImageScanned,
    handleCINDataExtracted,
    handleSubmit
  };
};
