
import { DocumentType } from "@/types/documentTypes";

export interface ClientFormData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone: string;
  code_barre: string;
  code_barre_image_url: string;
  scannedImage: string | null;
  // 🆕 NOUVEAU : URL de la photo client uploadée automatiquement
  photo_url: string;
  observations: string;
  date_enregistrement: string;
  document_type?: DocumentType;
}
