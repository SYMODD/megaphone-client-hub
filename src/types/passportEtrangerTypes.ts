
export interface PassportEtrangerData {
  nom?: string;
  prenom?: string;
  numero_passeport?: string;
  nationalite?: string;
  date_naissance?: string;
  date_expiration?: string;
  code_barre?: string;
  numero_telephone?: string;
}

export interface PassportExtractionContext {
  lines: string[];
  passportData: PassportEtrangerData;
}
