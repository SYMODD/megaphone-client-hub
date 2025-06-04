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
    console.log("📝 CIN FORM - Données CIN extraites reçues:", extractedData);
    
    if (!extractedData) {
      console.warn("⚠️ Aucune donnée extraite reçue");
      return;
    }
    
    // Mapper les données extraites vers les champs du formulaire - TRÈS PERMISSIF
    const updatedData: Partial<CINFormData> = {};
    let fieldsExtracted: string[] = [];
    
    // Application IMMÉDIATE même avec des données partielles
    console.log("📝 Application IMMÉDIATE des données:", extractedData);
    
    // Nom - accepter n'importe quelle chaîne
    if (extractedData.nom) {
      updatedData.nom = String(extractedData.nom).trim().toUpperCase();
      fieldsExtracted.push("nom");
      console.log("✅ Nom extrait et appliqué:", updatedData.nom);
    }
    
    // Prénom - accepter n'importe quelle chaîne
    if (extractedData.prenom) {
      updatedData.prenom = String(extractedData.prenom).trim().toUpperCase();
      fieldsExtracted.push("prénom");
      console.log("✅ Prénom extrait et appliqué:", updatedData.prenom);
    }
    
    // Nationalité
    if (extractedData.nationalite) {
      updatedData.nationalite = String(extractedData.nationalite).trim();
      fieldsExtracted.push("nationalité");
      console.log("✅ Nationalité extraite et appliquée:", updatedData.nationalite);
    }
    
    // Numéro CIN → numéro passeport
    if (extractedData.numero_cin) {
      updatedData.numero_passeport = String(extractedData.numero_cin).trim();
      fieldsExtracted.push("numéro CIN");
      console.log("✅ Numéro CIN extrait et appliqué:", updatedData.numero_passeport);
    }

    // TOUJOURS appliquer les données
    console.log("📝 Application forcée des données extraites:", updatedData);
    
    setFormData(prev => ({ ...prev, ...updatedData }));
    
    // Créer les informations d'extraction pour les observations
    let observationsData = `=== EXTRACTION CIN AUTOMATIQUE ===\nDate: ${new Date().toLocaleString('fr-FR')}\nType: Carte d'Identité Nationale`;
    
    if (fieldsExtracted.length > 0) {
      observationsData += `\nChamps extraits: ${fieldsExtracted.join(', ')}`;
    }
    
    // Date de naissance (ajout dans les observations si disponible)
    if (extractedData.date_naissance) {
      observationsData += `\nDate de naissance: ${extractedData.date_naissance}`;
      fieldsExtracted.push("date de naissance");
    }
    
    // Lieu de naissance (ajout dans les observations si disponible)
    if (extractedData.lieu_naissance) {
      observationsData += `\nLieu de naissance: ${extractedData.lieu_naissance}`;
      fieldsExtracted.push("lieu de naissance");
    }
    
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${observationsData}` : observationsData
    }));
    
    // Message de succès - TOUJOURS affiché
    toast.success(`🎉 Données CIN appliquées au formulaire!${fieldsExtracted.length > 0 ? `\nChamps: ${fieldsExtracted.join(", ")}` : ''}`, { 
      duration: 5000 
    });
    console.log("✅ SUCCÈS - Données CIN appliquées au formulaire");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

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
