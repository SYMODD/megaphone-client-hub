
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, FileImage, FileSpreadsheet } from "lucide-react";
import jsPDF from 'jspdf';

interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  date_enregistrement: string;
  photo_url?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  agent_id: string;
}

interface ClientDocumentDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientDocumentDialog = ({ client, open, onOpenChange }: ClientDocumentDialogProps) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const generateClientCard = async () => {
    if (!client) return;

    try {
      setGenerating(true);
      console.log('Génération de la fiche client pour:', client);

      const doc = new jsPDF();
      
      // En-tête
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('FICHE CLIENT', 105, 30, { align: 'center' });
      
      // Ligne de séparation
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
      
      // Informations client
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      
      let y = 60;
      const lineHeight = 10;
      
      doc.setFont(undefined, 'bold');
      doc.text('INFORMATIONS PERSONNELLES', 20, y);
      y += lineHeight + 5;
      
      doc.setFont(undefined, 'normal');
      doc.text(`Nom complet: ${client.prenom} ${client.nom}`, 20, y);
      y += lineHeight;
      
      doc.text(`Nationalité: ${client.nationalite}`, 20, y);
      y += lineHeight;
      
      doc.text(`Numéro de passeport: ${client.numero_passeport}`, 20, y);
      y += lineHeight;
      
      doc.text(`Date d'enregistrement: ${new Date(client.date_enregistrement).toLocaleDateString('fr-FR')}`, 20, y);
      y += lineHeight + 10;
      
      // Observations
      if (client.observations) {
        doc.setFont(undefined, 'bold');
        doc.text('OBSERVATIONS', 20, y);
        y += lineHeight;
        
        doc.setFont(undefined, 'normal');
        const splitObservations = doc.splitTextToSize(client.observations, 170);
        doc.text(splitObservations, 20, y);
        y += splitObservations.length * lineHeight + 10;
      }
      
      // Informations système
      doc.setFont(undefined, 'bold');
      doc.text('INFORMATIONS SYSTÈME', 20, y);
      y += lineHeight;
      
      doc.setFont(undefined, 'normal');
      doc.text(`ID Client: ${client.id}`, 20, y);
      y += lineHeight;
      
      doc.text(`Créé le: ${new Date(client.created_at).toLocaleString('fr-FR')}`, 20, y);
      y += lineHeight;
      
      doc.text(`Modifié le: ${new Date(client.updated_at).toLocaleString('fr-FR')}`, 20, y);
      
      // Pied de page
      doc.setFontSize(8);
      doc.text('Document généré automatiquement', 105, 280, { align: 'center' });
      doc.text(new Date().toLocaleString('fr-FR'), 105, 285, { align: 'center' });
      
      // Sauvegarde
      doc.save(`fiche-client-${client.nom}-${client.prenom}.pdf`);
      
      toast({
        title: "Document généré",
        description: `La fiche client de ${client.prenom} ${client.nom} a été téléchargée.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le document. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateSummaryCSV = () => {
    if (!client) return;

    try {
      const csvData = [
        ['Prénom', 'Nom', 'Nationalité', 'Passeport', 'Date enregistrement', 'ID'],
        [client.prenom, client.nom, client.nationalite, client.numero_passeport, client.date_enregistrement, client.id]
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `client-${client.nom}-${client.prenom}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast({
        title: "Export CSV",
        description: `Données de ${client.prenom} ${client.nom} exportées en CSV.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter en CSV. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Générer un document
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Choisissez le type de document à générer pour <strong>{client.prenom} {client.nom}</strong>
          </p>

          <div className="space-y-3">
            <Card className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={generateClientCard}>
              <CardContent className="p-4 flex items-center gap-3">
                <FileImage className="w-8 h-8 text-red-500" />
                <div>
                  <h4 className="font-medium">Fiche client PDF</h4>
                  <p className="text-sm text-slate-500">Document complet avec toutes les informations</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={generateSummaryCSV}>
              <CardContent className="p-4 flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-green-500" />
                <div>
                  <h4 className="font-medium">Export CSV</h4>
                  <p className="text-sm text-slate-500">Données tabulaires pour tableur</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generating}
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
