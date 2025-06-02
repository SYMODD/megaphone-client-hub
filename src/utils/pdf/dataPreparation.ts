
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Client, ReplacementData } from './types';

export const prepareReplacementData = (client: Client): ReplacementData => {
  const currentDate = format(new Date(), "dd MMMM yyyy", { locale: fr });
  const registrationDate = client.date_enregistrement 
    ? format(new Date(client.date_enregistrement), "dd/MM/yyyy", { locale: fr })
    : '';
  
  const data = {
    'prenom': client.prenom || '',
    'nom': client.nom || '',
    'nom_complet': `${client.prenom || ''} ${client.nom || ''}`.trim(),
    'nationalite': client.nationalite || '',
    'numero_passeport': client.numero_passeport || '',
    'date_enregistrement': registrationDate,
    'observations': client.observations || '',
    'date_aujourdhui': currentDate,
    'entreprise': 'Sud Megaphone',
    'annee_courante': new Date().getFullYear().toString(),
  };
  
  console.log('📋 Données préparées pour le remplacement:', data);
  return data;
};
