
export interface ClientFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  code_barre_image_url: string;
  scannedImage: string | null; // Photo du client (CIN, passeport, etc.) - va vers client-photos
  observations: string;
  date_enregistrement: string;
  document_type?: string;
}
