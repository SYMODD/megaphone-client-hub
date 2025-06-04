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
    
    // Mapper les données extraites vers les champs du formulaire - PLUS PERMISSIF
    const updatedData: Partial<CINFormData> = {};
    let fieldsExtracted: string[] = [];
    
    // Nom - accepter même des chaînes courtes
    if (extractedData.nom && typeof extractedData.nom === 'string' && extractedData.nom.trim().length > 0) {
      updatedData.nom = extractedData.nom.trim().toUpperCase();
      fieldsExtracted.push("nom");
      console.log("✅ Nom extrait et appliqué:", updatedData.nom);
    }
    
    // Prénom - accepter même des chaînes courtes
    if (extractedData.prenom && typeof extractedData.prenom === 'string' && extractedData.prenom.trim().length > 0) {
      updatedData.prenom = extractedData.prenom.trim().toUpperCase();
      fieldsExtracted.push("prénom");
      console.log("✅ Prénom extrait et appliqué:", updatedData.prenom);
    }
    
    // Nationalité
    if (extractedData.nationalite && typeof extractedData.nationalite === 'string' && extractedData.nationalite.trim().length > 0) {
      updatedData.nationalite = extractedData.nationalite.trim();
      fieldsExtracted.push("nationalité");
      console.log("✅ Nationalité extraite et appliquée:", updatedData.nationalite);
    }
    
    // Numéro CIN → numéro passeport
    if (extractedData.numero_cin && typeof extractedData.numero_cin === 'string' && extractedData.numero_cin.trim().length > 0) {
      updatedData.numero_passeport = extractedData.numero_cin.trim();
      fieldsExtracted.push("numéro CIN");
      console.log("✅ Numéro CIN extrait et appliqué:", updatedData.numero_passeport);
    }
    
    // Date de naissance (ajout dans les observations si disponible)
    let dateInfo = "";
    if (extractedData.date_naissance && typeof extractedData.date_naissance === 'string' && extractedData.date_naissance.trim().length > 0) {
      dateInfo = `Date de naissance: ${extractedData.date_naissance.trim()}`;
      fieldsExtracted.push("date de naissance");
      console.log("✅ Date de naissance extraite:", extractedData.date_naissance);
    }
    
    // Lieu de naissance (ajout dans les observations si disponible)
    let lieuInfo = "";
    if (extractedData.lieu_naissance && typeof extractedData.lieu_naissance === 'string' && extractedData.lieu_naissance.trim().length > 0) {
      lieuInfo = `Lieu de naissance: ${extractedData.lieu_naissance.trim()}`;
      fieldsExtracted.push("lieu de naissance");
      console.log("✅ Lieu de naissance extrait:", extractedData.lieu_naissance);
    }

    // TOUJOURS appliquer les données, même si partielles
    console.log("📝 Application des données extraites:", updatedData);
    console.log("📊 Champs extraits:", fieldsExtracted);
    
    setFormData(prev => ({ ...prev, ...updatedData }));
    
    // Créer les informations d'extraction pour les observations
    const scanInfo = `=== EXTRACTION CIN AUTOMATIQUE ===\nDate: ${new Date().toLocaleString('fr-FR')}\nType: Carte d'Identité Nationale\nChamps extraits: ${fieldsExtracted.join(', ')}`;
    
    let observationsData = scanInfo;
    if (dateInfo) observationsData += `\n${dateInfo}`;
    if (lieuInfo) observationsData += `\n${lieuInfo}`;
    
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${observationsData}` : observationsData
    }));
    
    // Message de succès - TOUJOURS affiché même avec données partielles
    if (fieldsExtracted.length > 0) {
      toast.success(`🎉 Données CIN extraites avec succès!\nChamps: ${fieldsExtracted.join(", ")}`, { 
        duration: 5000 
      });
      console.log("✅ SUCCÈS - Données CIN appliquées au formulaire");
    } else {
      toast.warning("⚠️ Données reçues mais aucun champ valide détecté", { 
        duration: 4000 
      });
      console.log("⚠️ ATTENTION - Données reçues mais non applicables:", extractedData);
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
