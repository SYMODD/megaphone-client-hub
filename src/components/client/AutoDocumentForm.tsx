import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { RegistrationSection } from "./RegistrationSection";
import { FormActions } from "./FormActions";
import { AutoDocumentScanner } from "./AutoDocumentScanner";
import { uploadClientPhoto } from "@/utils/storageUtils";
import { useClientMutation } from "@/hooks/useClientForm/useClientMutation";

interface AutoDocumentFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  scannedImage: string | null;
  observations: string;
  date_enregistrement: string;
  document_type: 'passeport_etranger' | 'carte_sejour' | null;
}

export const AutoDocumentForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mutation = useClientMutation();
  
  const [formData, setFormData] = useState<AutoDocumentFormData>({
    nom: "",
    prenom: "",
    nationalite: "",
    numero_passeport: "",
    numero_telephone: "",
    code_barre: "",
    scannedImage: null,
    observations: "",
    date_enregistrement: new Date().toISOString().split('T')[0],
    document_type: null
  });

  const handleInputChange = (field: keyof AutoDocumentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentDataExtracted = (extractedData: any, documentType: 'passeport_etranger' | 'carte_sejour') => {
    console.log("Données extraites:", extractedData, "Type:", documentType);
    
    setFormData(prev => ({
      ...prev,
      nom: extractedData.nom || prev.nom,
      prenom: extractedData.prenom || prev.prenom,
      nationalite: extractedData.nationalite || prev.nationalite,
      numero_passeport: extractedData.numero_passeport || extractedData.numero_carte || prev.numero_passeport,
      code_barre: extractedData.code_barre || prev.code_barre,
      document_type: documentType
    }));

    const documentLabel = documentType === 'passeport_etranger' ? 'Passeport Étranger' : 'Carte de Séjour';
    const scanInfo = `Données extraites automatiquement via OCR le ${new Date().toLocaleString('fr-FR')} - Type de document: ${documentLabel}`;
    setFormData(prev => ({
      ...prev,
      observations: prev.observations ? `${prev.observations}\n\n${scanInfo}` : scanInfo
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un client");
      return;
    }

    if (!formData.document_type) {
      toast.error("Veuillez d'abord scanner un document pour déterminer son type");
      return;
    }

    // Validation des champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.numero_passeport) {
      toast.error("Veuillez remplir tous les champs obligatoires (nom, prénom, numéro de document)");
      return;
    }

    try {
      console.log("Données du formulaire à enregistrer:", formData);
      
      let photoUrl = null;
      
      if (formData.scannedImage) {
        const folderName = formData.document_type === 'passeport_etranger' ? 'passeport-etranger' : 'carte-sejour';
        photoUrl = await uploadClientPhoto(formData.scannedImage, folderName);
        if (!photoUrl) {
          toast.error("Erreur lors du téléchargement de l'image. Enregistrement sans photo.");
        }
      }

      // Préparer les données pour l'insertion
      const clientData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        nationalite: formData.nationalite,
        numero_passeport: formData.numero_passeport.trim(),
        numero_telephone: formData.numero_telephone.trim(),
        code_barre: formData.code_barre.trim(),
        photo_url: photoUrl,
        observations: formData.observations,
        date_enregistrement: formData.date_enregistrement,
        document_type: formData.document_type,
        agent_id: user.id,
        code_barre_image_url: formData.code_barre || "",
        scannedImage: formData.scannedImage
      };

      await mutation.mutateAsync(clientData);
      
      const documentLabel = formData.document_type === 'passeport_etranger' ? 'passeport étranger' : 'carte de séjour';
      toast.success(`Client avec ${documentLabel} enregistré avec succès!`);
      navigate("/");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Une erreur inattendue s'est produite");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
      <AutoDocumentScanner 
        scannedImage={formData.scannedImage}
        onImageScanned={(image) => handleInputChange("scannedImage", image)}
        onDataExtracted={handleDocumentDataExtracted}
      />

      {formData.document_type && (
        <>
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
            isLoading={mutation.isPending}
          />
        </>
      )}
    </form>
  );
};
