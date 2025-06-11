
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
    nationalite: "Maroc", // CIN est toujours marocaine
    numero_passeport: "", // Pour CIN, ce sera le numéro CIN
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
    console.log("🔄 CIN FORM - Mise à jour champ:", {
      field,
      value: field === 'code_barre_image_url' ? value.substring(0, 100) + "..." : value,
      timestamp: new Date().toISOString()
    });
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageScanned = (imageData: string) => {
    console.log("🖼️ Image CIN scannée reçue");
    setFormData(prev => ({ ...prev, scannedImage: imageData }));
  };

  const handleCINDataExtracted = (extractedData: any) => {
    console.log("📄 CIN FORM - Données CIN extraites:", extractedData);
    
    // Normaliser la nationalité
    let nationalite = "Maroc";
    if (extractedData.nationalite) {
      const nat = extractedData.nationalite.toLowerCase();
      if (nat.includes("maroc") || nat.includes("morocco") || nat === "mar") {
        nationalite = "Maroc";
      } else {
        nationalite = extractedData.nationalite;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      nom: extractedData.nom || prev.nom,
      prenom: extractedData.prenom || prev.prenom,
      nationalite: nationalite,
      numero_passeport: extractedData.numero_cin || extractedData.numero_passeport || prev.numero_passeport,
      // Ne pas écraser les données du code-barres si elles existent déjà
      ...(extractedData.code_barre && { code_barre: extractedData.code_barre }),
      ...(extractedData.numero_telephone && { numero_telephone: extractedData.numero_telephone }),
      ...(extractedData.code_barre_image_url && { code_barre_image_url: extractedData.code_barre_image_url })
    }));

    const extractionInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: CIN`;
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${extractionInfo}` : extractionInfo
    }));

    toast.success("✅ Données CIN extraites et appliquées au formulaire !");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez remplir tous les champs obligatoires (nom, prénom, numéro CIN)");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 SOUMISSION CIN - Début avec données:", {
        nom: formData.nom,
        prenom: formData.prenom,
        numero_passeport: formData.numero_passeport,
        code_barre_image_url: formData.code_barre_image_url ? "✅ PRÉSENTE" : "❌ ABSENTE",
        scannedImage: formData.scannedImage ? "✅ PRÉSENTE" : "❌ ABSENTE"
      });
      
      let photoUrl = formData.photo_url;
      
      // Upload automatique de l'image scannée vers client-photos
      if (formData.scannedImage && !photoUrl) {
        console.log("📤 UPLOAD IMAGE CIN vers client-photos");
        photoUrl = await uploadClientPhoto(formData.scannedImage, 'cin');
        
        if (!photoUrl) {
          toast.error("Erreur lors du téléchargement de l'image. Enregistrement sans photo.");
        } else {
          console.log("✅ Image CIN uploadée:", photoUrl);
        }
      }

      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport.trim(),
        numero_telephone: formData.numero_telephone.trim() || null,
        code_barre: formData.code_barre?.trim() || null,
        code_barre_image_url: formData.code_barre_image_url || null,
        photo_url: photoUrl || null,
        observations: formData.observations?.trim() || null,
        date_enregistrement: formData.date_enregistrement,
        document_type: formData.document_type,
        agent_id: user.id
      };

      console.log("💾 INSERTION CLIENT CIN - Données finales:", {
        ...clientData,
        photo_incluse: clientData.photo_url ? "✅ INCLUSE" : "❌ MANQUANTE",
        code_barre_image_incluse: clientData.code_barre_image_url ? "✅ INCLUSE" : "❌ MANQUANTE"
      });

      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        console.error('❌ Erreur insertion client CIN:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de CIN existe déjà dans la base de données");
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
