
export const CLIENT_FIELDS = [
  // Champs de base du client
  { value: 'prenom', label: 'Prénom' },
  { value: 'nom', label: 'Nom' },
  { value: 'nom_complet', label: 'Nom complet' },
  { value: 'nationalite', label: 'Nationalité' },
  { value: 'numero_document', label: 'Numéro de document (Passeport/CIN/Carte séjour)', description: 'S\'adapte automatiquement selon le document du client' },
  { value: 'numero_passeport', label: 'Numéro de passeport (spécifique)', description: 'Uniquement pour les passeports' },
  { value: 'date_enregistrement', label: 'Date d\'enregistrement' },
  { value: 'observations', label: 'Observations' },
  
  // Champs automatiques
  { value: 'date_aujourdhui', label: 'Date d\'aujourd\'hui' },
  { value: 'entreprise', label: 'Nom de l\'entreprise' },
  { value: 'annee_courante', label: 'Année courante' },
  
  // Cases à cocher pour les types de documents - SECTION SÉPARÉE
  { value: 'checkbox_cin', label: '☑️ Case à cocher - CIN', description: 'Se coche automatiquement si le client a une CIN' },
  { value: 'checkbox_passeport', label: '☑️ Case à cocher - Passeport', description: 'Se coche automatiquement si le client a un passeport (marocain ou étranger)' },
  { value: 'checkbox_titre_sejour', label: '☑️ Case à cocher - Titre de séjour', description: 'Se coche automatiquement si le client a une carte de séjour' },
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
  { 
    id: '3', 
    placeholder: '{{client.numero_document}}', 
    clientField: 'numero_document', 
    description: 'Numéro de document (adaptatif)',
    x: 150,
    y: 640,
    fontSize: 12
  },
];

export const PRESET_FIELDS = [
  // Champs de base
  { id: 'nom_complet', placeholder: '{{client.nom_complet}}', clientField: 'nom_complet', description: 'Nom complet', x: 150, y: 700, fontSize: 12 },
  { id: 'nationalite', placeholder: '{{client.nationalite}}', clientField: 'nationalite', description: 'Nationalité', x: 150, y: 670, fontSize: 12 },
  { id: 'numero_document', placeholder: '{{client.numero_document}}', clientField: 'numero_document', description: 'Numéro de document (adaptatif)', x: 150, y: 640, fontSize: 12 },
  { id: 'date_enregistrement', placeholder: '{{client.date_enregistrement}}', clientField: 'date_enregistrement', description: 'Date enregistrement', x: 150, y: 610, fontSize: 12 },
  { id: 'date_aujourdhui', placeholder: '{{client.date_aujourdhui}}', clientField: 'date_aujourdhui', description: 'Date aujourd\'hui', x: 400, y: 750, fontSize: 12 },
  
  // Champs de cases à cocher - Positionnés différemment pour être visibles
  { id: 'checkbox_cin', placeholder: '{{checkbox.cin}}', clientField: 'checkbox_cin', description: 'Case CIN (☑/☐)', x: 200, y: 580, fontSize: 14 },
  { id: 'checkbox_passeport', placeholder: '{{checkbox.passeport}}', clientField: 'checkbox_passeport', description: 'Case Passeport (☑/☐)', x: 300, y: 580, fontSize: 14 },
  { id: 'checkbox_titre_sejour', placeholder: '{{checkbox.titre_sejour}}', clientField: 'checkbox_titre_sejour', description: 'Case Titre de séjour (☑/☐)', x: 450, y: 580, fontSize: 14 },
];
