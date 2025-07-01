
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getDocumentTemplateVariables } from "@/utils/documentTypeUtils";

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
  
  // Chercher uniquement dans les modèles personnalisés
  const customTemplate = customTemplates.find(t => t.id === template);
  
  if (customTemplate) {
    // Remplacer les variables dans le template personnalisé
    let html = customTemplate.template;
    
    // 🎯 Obtenir les variables dynamiques selon le type de document
    const documentVars = getDocumentTemplateVariables(client);
    
    // Variables client standard
    html = html.replace(/\{\{client\.prenom\}\}/g, client.prenom);
    html = html.replace(/\{\{client\.nom\}\}/g, client.nom);
    html = html.replace(/\{\{client\.nationalite\}\}/g, client.nationalite);
    html = html.replace(/\{\{client\.date_enregistrement\}\}/g, 
      format(new Date(client.date_enregistrement), "dd/MM/yyyy", { locale: fr }));
    html = html.replace(/\{\{client\.observations\}\}/g, client.observations || '');
    
    // 🎯 Variables de document dynamiques (NOUVELLES)
    html = html.replace(/\{\{client\.numero_document\}\}/g, documentVars.numero_document);
    html = html.replace(/\{\{client\.numero_cin\}\}/g, documentVars.numero_cin);
    html = html.replace(/\{\{client\.numero_passeport_marocain\}\}/g, documentVars.numero_passeport_marocain);
    html = html.replace(/\{\{client\.numero_passeport_etranger\}\}/g, documentVars.numero_passeport_etranger);
    html = html.replace(/\{\{client\.numero_carte_sejour\}\}/g, documentVars.numero_carte_sejour);
    html = html.replace(/\{\{client\.type_document\}\}/g, documentVars.type_document);
    html = html.replace(/\{\{client\.document_complet\}\}/g, documentVars.document_complet);
    
    // Variables legacy pour compatibilité
    html = html.replace(/\{\{client\.numero_passeport\}\}/g, client.numero_passeport);
    
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
  
  // Si aucun modèle personnalisé n'est trouvé, retourner un message d'erreur
  return `
    <html>
      <head>
        <title>Erreur - Modèle non trouvé</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; text-align: center; }
          .error { color: #dc2626; font-size: 18px; margin-top: 50px; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>Erreur</h1>
          <p>Le modèle de contrat sélectionné n'existe pas.</p>
          <p>Veuillez créer un modèle personnalisé ou sélectionner un modèle existant.</p>
        </div>
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
