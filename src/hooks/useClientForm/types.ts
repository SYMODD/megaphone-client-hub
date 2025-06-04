
export interface ClientFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  code_barre_image_url: string; // 🎯 CRUCIAL: URL de l'image du code-barres
  photo_url: string;
  scannedImage: string | null;
  observations: string;
  date_enregistrement: string;
}
