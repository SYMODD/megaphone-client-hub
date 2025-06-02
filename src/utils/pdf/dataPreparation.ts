
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Client, ReplacementData, FieldMapping } from './types';

export const prepareReplacementData = (client: Client, fieldMappings: FieldMapping[] = []): ReplacementData => {
  const currentDate = format(new Date(), "dd MMMM yyyy", { locale: fr });
  const registrationDate = client.date_enregistrement 
    ? format(new Date(client.date_enregistrement), "dd/MM/yyyy", { locale: fr })
    : '';
  
  // Déterminer le numéro de document selon le type de document du client
  // En priorité : numero_passeport, puis autres champs de document
  const numeroDocument = client.numero_passeport || '';
  
  // Extraire le type de document depuis les observations
  let documentType = (client as any).document_type || '';
  
  // Si pas de document_type direct, essayer d'extraire depuis les observations
  if (!documentType && client.observations) {
    const observations = client.observations.toLowerCase();
    if (observations.includes('type de document: cin')) {
      documentType = 'cin';
    } else if (observations.includes('type de document: passeport')) {
      documentType = 'passeport_marocain'; // Par défaut passeport marocain
    } else if (observations.includes('type de document: carte')) {
      documentType = 'carte_sejour';
    }
  }
  
  const data = {
    'prenom': client.prenom || '',
    'nom': client.nom || '',
    'nom_complet': `${client.prenom || ''} ${client.nom || ''}`.trim(),
    'nationalite': client.nationalite || '',
    'numero_passeport': client.numero_passeport || '',
    'numero_document': numeroDocument, // Champ générique qui s'adapte
    'date_enregistrement': registrationDate,
    'observations': client.observations || '',
    'date_aujourdhui': currentDate,
    'entreprise': 'Sud Megaphone',
    'annee_courante': new Date().getFullYear().toString(),
    'document_type': documentType, // Type de document pour les checkboxes
  };

  // Ajouter les valeurs par défaut des champs personnalisés
  fieldMappings.forEach(mapping => {
    if (mapping.defaultValue && mapping.clientField) {
      // Si le champ n'a pas de valeur du client ou si la valeur par défaut existe, utiliser la valeur par défaut
      if (!data[mapping.clientField] || mapping.defaultValue.trim() !== '') {
        data[mapping.clientField] = mapping.defaultValue;
      }
    }
  });
  
  console.log('📋 Données préparées pour le remplacement:', data);
  console.log('🔍 Type de document détecté:', documentType);
  return data;
};
