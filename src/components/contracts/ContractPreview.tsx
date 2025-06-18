
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DOMPurify from 'dompurify';

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  observations?: string;
}

interface ContractPreviewProps {
  client: Client;
  template: string;
}

const getContractTemplate = (template: string, client: Client) => {
  const currentDate = format(new Date(), "dd MMMM yyyy", { locale: fr });
  
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
  
  return templates[template as keyof typeof templates] || templates.service_agreement;
};

export const ContractPreview = ({ client, template }: ContractPreviewProps) => {
  const contractHTML = getContractTemplate(template, client);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Contrat - ${client.prenom} ${client.nom}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .header h1 { color: #2563eb; margin-bottom: 10px; }
              .date { font-style: italic; color: #666; }
              .parties, .content { margin: 20px 0; }
              h2 { color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
              .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
              .signature-block { text-align: center; width: 200px; }
              .signature-line { border-bottom: 1px solid #000; height: 50px; margin: 10px 0; }
              p { margin: 10px 0; }
            </style>
          </head>
          <body>
            ${contractHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Prévisualisation du contrat
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="contract-preview"
          style={{
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.6',
            maxHeight: '600px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white'
          }}
        >
          <style>{`
            .contract-content .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .contract-content .header h1 { color: #2563eb; margin-bottom: 10px; font-size: 24px; }
            .contract-content .date { font-style: italic; color: #666; }
            .contract-content .parties, .contract-content .content { margin: 20px 0; }
            .contract-content h2 { color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; font-size: 18px; }
            .contract-content .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
            .contract-content .signature-block { text-align: center; width: 200px; }
            .contract-content .signature-line { border-bottom: 1px solid #000; height: 50px; margin: 10px 0; }
            .contract-content p { margin: 10px 0; }
          `}</style>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contractHTML) }} />
        </div>
      </CardContent>
    </Card>
  );
};
