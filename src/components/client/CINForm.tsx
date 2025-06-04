
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { CINScanner } from "./CINScanner";

interface CINFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  scannedImage: string | null;
  photo_url: string;
  observations: string;
  date_enregistrement: string;
}

export const CINForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CINFormData>({
    nom: "",
    prenom: "",
    nationalite: "Maroc",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    scannedImage: null,
    photo_url: "",
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: keyof CINFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageScanned = (image: string, photoUrl?: string) => {
    console.log("🖼️ CIN FORM - Image scannée avec URL:", { 
      hasImage: !!image, 
      hasPhotoUrl: !!photoUrl,
      photoUrl 
    });
    
    setFormData(prev => ({
      ...prev,
      scannedImage: image,
      photo_url: photoUrl || prev.photo_url
    }));
  };

  const handleCINDataExtracted = (extractedData: any) => {
    console.log("📝 CIN FORM - Données CIN extraites:", extractedData);
    
    // Mapper les données extraites vers les champs du formulaire avec validation
    const updatedData: Partial<CINFormData> = {};
    
    if (extractedData.nom && extractedData.nom.trim()) {
      updatedData.nom = extractedData.nom.trim();
      console.log("✅ Nom extrait:", updatedData.nom);
    }
    
    if (extractedData.prenom && extractedData.prenom.trim()) {
      updatedData.prenom = extractedData.prenom.trim();
      console.log("✅ Prénom extrait:", updatedData.prenom);
    }
    
    if (extractedData.nationalite && extractedData.nationalite.trim()) {
      updatedData.nationalite = extractedData.nationalite.trim();
      console.log("✅ Nationalité extraite:", updatedData.nationalite);
    }
    
    // Utiliser numero_cin pour le champ numero_passeport
    if (extractedData.numero_cin && extractedData.numero_cin.trim()) {
      updatedData.numero_passeport = extractedData.numero_cin.trim();
      console.log("✅ Numéro CIN extrait:", updatedData.numero_passeport);
    }
    
    // Extraire le code-barres s'il est disponible
    if (extractedData.code_barre && extractedData.code_barre.trim()) {
      updatedData.code_barre = extractedData.code_barre.trim();
      console.log("✅ Code-barres extrait:", updatedData.code_barre);
    }

    // Appliquer les données extraites au formulaire
    if (Object.keys(updatedData).length > 0) {
      setFormData(prev => ({ ...prev, ...updatedData }));
      
      console.log("📝 Données appliquées au formulaire:", updatedData);
      
      // Ajouter l'information d'extraction aux observations
      const extractedFields = Object.keys(updatedData).join(', ');
      const scanInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: CIN - Champs: ${extractedFields}`;
      
      setFormData(prev => ({
        ...prev,
        observations: prev.observations ? `${prev.observations}\n\n${scanInfo}` : scanInfo
      }));
      
      toast.success(`Données CIN extraites et appliquées: ${extractedFields}`);
    } else {
      console.warn("⚠️ Aucune donnée valide extraite de la CIN");
      toast.warning("Données CIN extraites mais aucun champ valide détecté");
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    // Validation des champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez remplir tous les champs obligatoires (nom, prénom, numéro de document)");
      return;
    }

    setIsLoading(true);

    try {
      console.log("💾 CIN FORM SUBMIT - Données avec photo_url:", {
        ...formData,
        photo_url_present: formData.photo_url ? "✅ OUI" : "❌ NON",
        photo_url_value: formData.photo_url
      });
      
      // Préparer les données pour l'insertion
      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport.trim(),
        numero_telephone: formData.numero_telephone.trim(),
        code_barre: formData.code_barre.trim(),
        photo_url: formData.photo_url || null,
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        agent_id: user.id
      };

      console.log("💾 Données client à insérer avec photo_url:", clientData);

      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        console.error('Error inserting client:', error);
        if (error.code === '23505') {
          toast.error("Ce numéro de document existe déjà dans la base de données");
        } else {
          toast.error(`Erreur lors de l'enregistrement du client: ${error.message}`);
        }
        return;
      }

      console.log("✅ Client CIN enregistré avec photo_url:", clientData.photo_url);
      toast.success("Client avec CIN enregistré avec succès!");
      navigate("/");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <CINScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={handleImageScanned}
        onDataExtracted={handleCINDataExtracted}
      />

      <PersonalInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <ContactInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <RegistrationSection 
        formData={formData}
        onInputChange={handleInputChange}
      />

      <FormActions 
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </form>
  );
};
