
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, exportToPDF } from "@/utils/exportUtils";
import { Client } from "@/hooks/useClientData/types";

export const useClientExport = (clients: Client[]) => {
  const { toast } = useToast();

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (clients.length === 0) {
      toast({
        title: "Aucune donnée à exporter",
        description: "Il n'y a aucun client dans la liste actuelle.",
        variant: "destructive",
      });
      return;
    }

    try {
      const filename = `clients_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        exportToCSV(clients, filename);
        toast({
          title: "Export CSV réussi",
          description: `${clients.length} client(s) exporté(s) en CSV.`,
        });
      } else {
        exportToPDF(clients, filename);
        toast({
          title: "Export PDF réussi", 
          description: `${clients.length} client(s) exporté(s) en PDF.`,
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'exportation des données.",
        variant: "destructive",
      });
    }
  };

  return { handleExport };
};
