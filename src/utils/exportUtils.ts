
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone?: string;
  date_enregistrement: string;
  observations?: string;
  document_type?: string;
  point_operation?: string;
  categorie?: string;
  code_barre?: string;
  agent_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const exportToCSV = (clients: Client[], filename: string = 'clients') => {
  // Créer les en-têtes avec toutes les informations
  const headers = [
    'ID',
    'Nom',
    'Prénom', 
    'Nationalité',
    'Type de document',
    'Numéro de passeport',
    'Numéro de téléphone',
    'Point d\'opération',
    'Catégorie',
    'Code barre',
    'Date d\'enregistrement',
    'Date de création',
    'Dernière modification',
    'Agent ID',
    'Observations'
  ];

  // Créer les données avec toutes les informations
  const csvData = clients.map(client => [
    client.id,
    client.nom,
    client.prenom,
    client.nationalite,
    getDocumentTypeLabel(client.document_type),
    client.numero_passeport,
    client.numero_telephone || '',
    client.point_operation || '',
    client.categorie || '',
    client.code_barre || '',
    format(new Date(client.date_enregistrement), 'dd/MM/yyyy', { locale: fr }),
    client.created_at ? format(new Date(client.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }) : '',
    client.updated_at ? format(new Date(client.updated_at), 'dd/MM/yyyy HH:mm', { locale: fr }) : '',
    client.agent_id || '',
    client.observations || ''
  ]);

  // Combiner les en-têtes et les données
  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  // Créer et télécharger le fichier
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (clients: Client[], filename: string = 'clients') => {
  const doc = new jsPDF('landscape'); // Format paysage pour plus de colonnes
  
  // Titre
  doc.setFontSize(20);
  doc.text('Liste Complète des Clients', 14, 22);
  
  // Date de génération
  doc.setFontSize(12);
  doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 14, 32);
  
  // Statistiques
  doc.text(`Total: ${clients.length} client(s)`, 14, 42);

  // Préparer les données pour le tableau avec toutes les informations
  const tableData = clients.map(client => [
    client.prenom + ' ' + client.nom,
    client.nationalite,
    getDocumentTypeLabel(client.document_type),
    client.numero_passeport,
    client.numero_telephone || '-',
    client.point_operation || '-',
    client.categorie || '-',
    format(new Date(client.date_enregistrement), 'dd/MM/yyyy', { locale: fr }),
    client.observations || '-'
  ]);

  // Créer le tableau avec plus de colonnes
  autoTable(doc, {
    head: [['Nom complet', 'Nationalité', 'Type doc.', 'N° Passeport', 'Téléphone', 'Point opération', 'Catégorie', 'Date enreg.', 'Observations']],
    body: tableData,
    startY: 50,
    styles: { 
      fontSize: 7,
      cellPadding: 1
    },
    headStyles: { 
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 8
    },
    alternateRowStyles: { 
      fillColor: [245, 245, 245] 
    },
    margin: { top: 50, left: 10, right: 10 },
    columnStyles: {
      0: { cellWidth: 35 }, // Nom complet
      1: { cellWidth: 25 }, // Nationalité
      2: { cellWidth: 20 }, // Type doc
      3: { cellWidth: 25 }, // Passeport
      4: { cellWidth: 25 }, // Téléphone
      5: { cellWidth: 25 }, // Point
      6: { cellWidth: 20 }, // Catégorie
      7: { cellWidth: 20 }, // Date
      8: { cellWidth: 30 }  // Observations
    }
  });

  // Sauvegarder le PDF
  doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

// Fonction helper pour les types de documents
const getDocumentTypeLabel = (documentType: string | undefined): string => {
  switch (documentType) {
    case 'cin':
      return 'CIN';
    case 'passport_marocain':
      return 'Passeport Marocain';
    case 'passport_etranger':
      return 'Passeport Étranger';
    case 'carte_sejour':
      return 'Carte de Séjour';
    default:
      return 'Document';
  }
};
