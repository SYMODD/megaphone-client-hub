
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
  date_enregistrement: string;
  observations?: string;
}

export const exportToCSV = (clients: Client[], filename: string = 'clients') => {
  // Créer les en-têtes
  const headers = [
    'Nom',
    'Prénom', 
    'Nationalité',
    'Numéro de passeport',
    'Date d\'enregistrement',
    'Observations'
  ];

  // Créer les données
  const csvData = clients.map(client => [
    client.nom,
    client.prenom,
    client.nationalite,
    client.numero_passeport,
    format(new Date(client.date_enregistrement), 'dd/MM/yyyy', { locale: fr }),
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
  const doc = new jsPDF();
  
  // Titre
  doc.setFontSize(20);
  doc.text('Liste des Clients', 14, 22);
  
  // Date de génération
  doc.setFontSize(12);
  doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 14, 32);
  
  // Statistiques
  doc.text(`Total: ${clients.length} client(s)`, 14, 42);

  // Préparer les données pour le tableau
  const tableData = clients.map(client => [
    client.prenom + ' ' + client.nom,
    client.nationalite,
    client.numero_passeport,
    format(new Date(client.date_enregistrement), 'dd/MM/yyyy', { locale: fr }),
    client.observations || '-'
  ]);

  // Créer le tableau
  autoTable(doc, {
    head: [['Nom complet', 'Nationalité', 'N° Passeport', 'Date enreg.', 'Observations']],
    body: tableData,
    startY: 50,
    styles: { 
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: { 
      fillColor: [41, 128, 185],
      textColor: 255
    },
    alternateRowStyles: { 
      fillColor: [245, 245, 245] 
    },
    margin: { top: 50 }
  });

  // Sauvegarder le PDF
  doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
