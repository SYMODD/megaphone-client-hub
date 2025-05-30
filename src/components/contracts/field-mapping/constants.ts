
export const CLIENT_FIELDS = [
  { value: 'prenom', label: 'Prénom' },
  { value: 'nom', label: 'Nom' },
  { value: 'nom_complet', label: 'Nom complet' },
  { value: 'nationalite', label: 'Nationalité' },
  { value: 'numero_passeport', label: 'Numéro de passeport' },
  { value: 'date_enregistrement', label: 'Date d\'enregistrement' },
  { value: 'observations', label: 'Observations' },
  { value: 'date_aujourdhui', label: 'Date d\'aujourd\'hui' },
  { value: 'entreprise', label: 'Nom de l\'entreprise' },
  { value: 'annee_courante', label: 'Année courante' },
];

export const DEFAULT_MAPPINGS = [
  { 
    id: '1', 
    placeholder: '{{client.nom_complet}}', 
    clientField: 'nom_complet', 
    description: 'Nom complet du client',
    x: 150,
    y: 700,
    fontSize: 12
  },
  { 
    id: '2', 
    placeholder: '{{client.nationalite}}', 
    clientField: 'nationalite', 
    description: 'Nationalité du client',
    x: 150,
    y: 670,
    fontSize: 12
  },
];

export const PRESET_FIELDS = [
  { id: 'nom_complet', placeholder: '{{client.nom_complet}}', clientField: 'nom_complet', description: 'Nom complet', x: 150, y: 700, fontSize: 12 },
  { id: 'nationalite', placeholder: '{{client.nationalite}}', clientField: 'nationalite', description: 'Nationalité', x: 150, y: 670, fontSize: 12 },
  { id: 'numero_passeport', placeholder: '{{client.numero_passeport}}', clientField: 'numero_passeport', description: 'Numéro passeport', x: 150, y: 640, fontSize: 12 },
  { id: 'date_enregistrement', placeholder: '{{client.date_enregistrement}}', clientField: 'date_enregistrement', description: 'Date enregistrement', x: 150, y: 610, fontSize: 12 },
  { id: 'date_aujourdhui', placeholder: '{{client.date_aujourdhui}}', clientField: 'date_aujourdhui', description: 'Date aujourd\'hui', x: 400, y: 750, fontSize: 12 },
];
