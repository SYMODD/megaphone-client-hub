
export interface ClientFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  code_barre_image_url: string; // 🎯 AJOUT CRUCIAL
  observations: string;
  date_enregistrement: string;
  document_type: string;
  photo_url: string;
  scannedImage: string | null;
}
