import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  observations?: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

export const generateContractHTML = (
  client: Client,
  template: string,
  customTemplates: ContractTemplate[] = []
): string => {
  const currentDate = format(new Date(), "dd MMMM yyyy", { locale: fr });
  
  // Chercher d'abord dans les modèles personnalisés
  const customTemplate = customTemplates.find(t => t.id === template);
  
  if (customTemplate) {
    // Remplacer les variables dans le template personnalisé
    let html = customTemplate.template;
    
    // Variables client
    html = html.replace(/\{\{client\.prenom\}\}/g, client.prenom);
    html = html.replace(/\{\{client\.nom\}\}/g, client.nom);
    html = html.replace(/\{\{client\.nationalite\}\}/g, client.nationalite);
    html = html.replace(/\{\{client\.numero_passeport\}\}/g, client.numero_passeport);
    html = html.replace(/\{\{client\.date_enregistrement\}\}/g, 
      format(new Date(client.date_enregistrement), "dd/MM/yyyy", { locale: fr }));
    html = html.replace(/\{\{client\.observations\}\}/g, client.observations || '');
    
    // Variables générales
    html = html.replace(/\{\{date\}\}/g, currentDate);
    html = html.replace(/\{\{entreprise\}\}/g, 'Sud Megaphone');
    
    return `
      <html>
        <head>
          <title>Contrat - ${client.prenom} ${client.nom}</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { color: #2563eb; margin-bottom: 10px; font-size: 28px; }
            .date { font-style: italic; color: #666; font-size: 14px; }
            .parties, .content { margin: 20px 0; }
            h2 { color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; font-size: 20px; margin-top: 30px; }
            .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
            .signature-block { text-align: center; width: 200px; }
            .signature-line { border-bottom: 1px solid #000; height: 50px; margin: 10px 0; }
            p { margin: 10px 0; text-align: justify; }
            @media print {
              body { margin: 20px; }
              .signatures { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }
  
  // Templates par défaut
  return getDefaultContractTemplate(template, client, currentDate);
};

const getDefaultContractTemplate = (template: string, client: Client, currentDate: string): string => {
  const templates = {
    service_agreement: `
      <div class="contract-content">
        <div class="header">
          <h1>ACCORD DE SERVICE</h1>
          <p class="date">Date : ${currentDate}</p>
        </div>
        
        <div class="parties">
          <h2>PARTIES</h2>
          <p><strong>Prestataire :</strong> Sud Megaphone</p>
          <p><strong>Client :</strong> ${client.prenom} ${client.nom}</p>
          <p><strong>Nationalité :</strong> ${client.nationalite}</p>
          <p><strong>Numéro de passeport :</strong> ${client.numero_passeport}</p>
          <p><strong>Date d'enregistrement :</strong> ${format(new Date(client.date_enregistrement), "dd/MM/yyyy", { locale: fr })}</p>
        </div>
        
        <div class="content">
          <h2>OBJET DU CONTRAT</h2>
          <p>Le présent accord définit les termes et conditions des services fournis par Sud Megaphone au client désigné ci-dessus.</p>
          
          <h2>DURÉE</h2>
          <p>Le présent contrat prend effet à compter de la date de signature et reste valable jusqu'à résiliation par l'une des parties.</p>
          
          <h2>OBLIGATIONS DES PARTIES</h2>
          <p><strong>Prestataire :</strong> S'engage à fournir les services convenus selon les standards de qualité établis.</p>
          <p><strong>Client :</strong> S'engage à respecter les conditions d'utilisation et à s'acquitter des obligations financières.</p>
          
          ${client.observations ? `<h2>OBSERVATIONS</h2><p>${client.observations}</p>` : ''}
        </div>
        
        <div class="signatures">
          <div class="signature-block">
            <p>Signature du Prestataire</p>
            <div class="signature-line"></div>
            <p>Sud Megaphone</p>
          </div>
          <div class="signature-block">
            <p>Signature du Client</p>
            <div class="signature-line"></div>
            <p>${client.prenom} ${client.nom}</p>
          </div>
        </div>
      </div>
    `,
    business_contract: `
      <div class="contract-content">
        <div class="header">
          <h1>CONTRAT COMMERCIAL</h1>
          <p class="date">Date : ${currentDate}</p>
        </div>
        
        <div class="parties">
          <h2>PARTIES CONTRACTANTES</h2>
          <p><strong>Société :</strong> Sud Megaphone</p>
          <p><strong>Partenaire commercial :</strong> ${client.prenom} ${client.nom}</p>
          <p><strong>Nationalité :</strong> ${client.nationalite}</p>
          <p><strong>Document d'identité :</strong> ${client.numero_passeport}</p>
        </div>
        
        <div class="content">
          <h2>OBJET</h2>
          <p>Le présent contrat établit les termes de la relation commerciale entre les parties pour la fourniture de services professionnels.</p>
          
          <h2>CONDITIONS COMMERCIALES</h2>
          <p>Les conditions tarifaires et modalités de paiement seront définies dans des annexes spécifiques à chaque prestation.</p>
          
          <h2>RESPONSABILITÉS</h2>
          <p>Chaque partie s'engage à respecter ses obligations contractuelles et à informer l'autre partie de tout changement susceptible d'affecter l'exécution du contrat.</p>
        </div>
        
        <div class="signatures">
          <div class="signature-block">
            <p>Pour Sud Megaphone</p>
            <div class="signature-line"></div>
          </div>
          <div class="signature-block">
            <p>Le Partenaire</p>
            <div class="signature-line"></div>
            <p>${client.prenom} ${client.nom}</p>
          </div>
        </div>
      </div>
    `,
    rental_agreement: `
      <div class="contract-content">
        <div class="header">
          <h1>CONTRAT DE LOCATION</h1>
          <p class="date">Date : ${currentDate}</p>
        </div>
        
        <div class="parties">
          <h2>BAILLEUR ET LOCATAIRE</h2>
          <p><strong>Bailleur :</strong> Sud Megaphone</p>
          <p><strong>Locataire :</strong> ${client.prenom} ${client.nom}</p>
          <p><strong>Nationalité :</strong> ${client.nationalite}</p>
          <p><strong>Pièce d'identité :</strong> ${client.numero_passeport}</p>
        </div>
        
        <div class="content">
          <h2>BIEN LOUÉ</h2>
          <p>Le bien faisant l'objet de la présente location sera précisé dans un état des lieux détaillé.</p>
          
          <h2>DURÉE DE LOCATION</h2>
          <p>La location est consentie pour une durée qui sera précisée dans les conditions particulières.</p>
          
          <h2>LOYER ET CHARGES</h2>
          <p>Le montant du loyer et des charges sera défini selon les termes convenus entre les parties.</p>
          
          <h2>OBLIGATIONS</h2>
          <p>Le locataire s'engage à occuper les lieux en bon père de famille et à respecter le règlement intérieur.</p>
        </div>
        
        <div class="signatures">
          <div class="signature-block">
            <p>Le Bailleur</p>
            <div class="signature-line"></div>
            <p>Sud Megaphone</p>
          </div>
          <div class="signature-block">
            <p>Le Locataire</p>
            <div class="signature-line"></div>
            <p>${client.prenom} ${client.nom}</p>
          </div>
        </div>
      </div>
    `,
    transport_service: `
      <div class="contract-content">
        <div class="header">
          <h1>CONTRAT DE SERVICE DE TRANSPORT</h1>
          <p class="date">Date : ${currentDate}</p>
        </div>
        
        <div class="parties">
          <h2>TRANSPORTEUR ET CLIENT</h2>
          <p><strong>Transporteur :</strong> Sud Megaphone</p>
          <p><strong>Client :</strong> ${client.prenom} ${client.nom}</p>
          <p><strong>Nationalité :</strong> ${client.nationalite}</p>
          <p><strong>Document :</strong> ${client.numero_passeport}</p>
        </div>
        
        <div class="content">
          <h2>SERVICES DE TRANSPORT</h2>
          <p>Le transporteur s'engage à fournir des services de transport selon les conditions définies dans le présent contrat.</p>
          
          <h2>RESPONSABILITÉS</h2>
          <p>Le transporteur assume la responsabilité du transport dans les conditions normales d'exploitation.</p>
          
          <h2>TARIFICATION</h2>
          <p>Les tarifs applicables seront ceux en vigueur au moment de la prestation ou selon accord particulier.</p>
        </div>
        
        <div class="signatures">
          <div class="signature-block">
            <p>Le Transporteur</p>
            <div class="signature-line"></div>
            <p>Sud Megaphone</p>
          </div>
          <div class="signature-block">
            <p>Le Client</p>
            <div class="signature-line"></div>
            <p>${client.prenom} ${client.nom}</p>
          </div>
        </div>
      </div>
    `
  };
  
  const templateContent = templates[template as keyof typeof templates] || templates.service_agreement;
  
  return `
    <html>
      <head>
        <title>Contrat - ${client.prenom} ${client.nom}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { color: #2563eb; margin-bottom: 10px; font-size: 28px; }
          .date { font-style: italic; color: #666; font-size: 14px; }
          .parties, .content { margin: 20px 0; }
          h2 { color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; font-size: 20px; margin-top: 30px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
          .signature-block { text-align: center; width: 200px; }
          .signature-line { border-bottom: 1px solid #000; height: 50px; margin: 10px 0; }
          p { margin: 10px 0; text-align: justify; }
          @media print {
            body { margin: 20px; }
            .signatures { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        ${templateContent}
      </body>
    </html>
  `;
};

export const downloadContractAsHTML = (htmlContent: string, filename: string): void => {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
