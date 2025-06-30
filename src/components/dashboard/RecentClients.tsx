import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, FileText, QrCode } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ClientViewDialog } from "@/components/clients/ClientViewDialog";
import { ClientEditDialog } from "@/components/clients/ClientEditDialog";
import { Client } from "@/hooks/useClientData/types";

interface RecentClientsProps {
  data: {
    recentClients: Array<{
      id: number;
      nom: string;
      prenom: string;
      nationalite: string;
      dateEnregistrement: string;
      photo?: string | null;
      pointOperation: string;
      code_barre?: string | null;
    }>;
  };
}

export const RecentClients = ({ data }: RecentClientsProps) => {
  const { recentClients } = data;
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // États pour les dialogs
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loadingFullClient, setLoadingFullClient] = useState(false);

  // Fonction pour convertir les données de recentClients vers le type Client
  const convertToClient = (recentClient: any): Client => {
    return {
      id: recentClient.id.toString(),
      name: `${recentClient.prenom} ${recentClient.nom}`,
      email: "",
      phone: recentClient.numero_telephone || "",
      nationalite: recentClient.nationalite,
      created_at: recentClient.dateEnregistrement,
      prenom: recentClient.prenom,
      nom: recentClient.nom,
      numero_telephone: recentClient.numero_telephone || "",
      numero_passeport: recentClient.numero_passeport || "",
      document_type: recentClient.document_type || "cin",
      point_operation: recentClient.pointOperation,
      categorie: recentClient.categorie || "",
      date_enregistrement: recentClient.dateEnregistrement,
      updated_at: recentClient.updated_at || recentClient.dateEnregistrement,
      photo_url: recentClient.photo,
      code_barre_image_url: recentClient.code_barre_image_url || "",
      code_barre: recentClient.code_barre || ""
    } as Client;
  };

  useEffect(() => {
    console.log("🔄 RecentClients RE-RENDER avec nouvelles données:", recentClients);
  }, [recentClients]);

  // Fonction pour récupérer le client complet depuis la base de données
  const fetchFullClient = async (clientId: number): Promise<Client | null> => {
    try {
      setLoadingFullClient(true);
      console.log('🔍 Récupération du client complet depuis la DB:', clientId);
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la récupération du client:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les détails du client.",
          variant: "destructive",
        });
        return null;
      }

      if (data) {
        // Convertir les données de la DB vers le type Client
        const fullClient: Client = {
          id: data.id.toString(),
          name: `${data.prenom} ${data.nom}`,
          email: data.email || "",
          phone: data.numero_telephone || "",
          nationalite: data.nationalite,
          created_at: data.created_at,
          prenom: data.prenom,
          nom: data.nom,
          numero_telephone: data.numero_telephone || "",
          numero_passeport: data.numero_passeport || "",
          document_type: data.document_type || "cin",
          point_operation: data.point_operation,
          categorie: data.categorie || "",
          date_enregistrement: data.date_enregistrement,
          updated_at: data.updated_at,
          photo_url: data.photo_url,
          code_barre_image_url: data.code_barre_image_url || "",
          code_barre: data.code_barre || "",
          observations: data.observations || "",
          lieu_naissance: data.lieu_naissance || "",
          date_naissance: data.date_naissance || "",
          sexe: data.sexe || "",
          adresse: data.adresse || ""
        } as Client;

        console.log('✅ Client complet récupéré:', fullClient);
        return fullClient;
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du client:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération des détails.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoadingFullClient(false);
    }
  };

  // Action handlers for client operations
  const handleViewClient = async (client: any) => {
    console.log('Voir client sur dashboard:', client);
    
    // Récupérer le client complet depuis la base de données
    const fullClient = await fetchFullClient(client.id);
    
    if (fullClient) {
      setSelectedClient(fullClient);
      setViewDialogOpen(true);
      toast({
        title: "Aperçu client",
        description: `Affichage des détails complets de ${client.prenom} ${client.nom}`,
      });
    }
  };

  const handleEditClient = async (client: any) => {
    console.log('Modifier client sur dashboard:', client);
    
    // Récupérer le client complet pour l'édition aussi
    const fullClient = await fetchFullClient(client.id);
    
    if (fullClient) {
      setSelectedClient(fullClient);
      setEditDialogOpen(true);
      toast({
        title: "Édition client",
        description: `Édition complète de ${client.prenom} ${client.nom}`,
      });
    }
  };

  const handleGenerateDocument = (client: any) => {
    console.log('Générer document:', client);
    // Pour la génération de document, on navigue toujours vers la page contrats
    navigate('/contracts', { 
      state: { 
        selectedClientId: client.id,
        clientData: client 
      } 
    });
    toast({
      title: "Navigation",
      description: `Génération de contrat pour ${client.prenom} ${client.nom}`,
    });
  };

  const handleViewAllClients = () => {
    console.log('Navigation vers Base Clients');
    navigate('/base-clients');
    toast({
      title: "Navigation",
      description: "Redirection vers la base de données complète des clients.",
    });
  };

  const handleClientUpdated = () => {
    console.log('Client mis à jour depuis le dashboard');
    toast({
      title: "Client mis à jour",
      description: "Les modifications ont été sauvegardées avec succès.",
    });
    // Fermer le dialog d'édition
    setEditDialogOpen(false);
    setSelectedClient(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Derniers clients enregistrés
          </CardTitle>
          <CardDescription>
            Les derniers clients ajoutés à la base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentClients.length > 0 ? (
              recentClients.map((client) => (
                <div key={`${client.id}-${client.pointOperation}`} className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src={client.photo || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {client.prenom[0]}{client.nom[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 truncate">
                      {client.prenom} {client.nom}
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <Badge variant="outline" className="text-xs w-fit">
                        {client.nationalite}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {client.code_barre && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <QrCode className="w-3 h-3" />
                            <span className="hidden sm:inline">Code-barres</span>
                          </Badge>
                        )}
                        <span className="text-xs text-slate-500">
                          {new Date(client.dateEnregistrement).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewClient(client)}
                      title="Voir les détails"
                      disabled={loadingFullClient}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditClient(client)}
                      title="Modifier le client"
                      disabled={loadingFullClient}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleGenerateDocument(client)}
                      title="Générer un document"
                      className="h-8 w-8 p-0"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                Aucun client enregistré pour ce point d'opération
              </div>
            )}
          </div>
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleViewAllClients}
            >
              Voir tous les clients
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs pour l'aperçu et l'édition directement sur le dashboard */}
      <ClientViewDialog
        client={selectedClient}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
      
      <ClientEditDialog
        client={selectedClient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onClientUpdated={handleClientUpdated}
      />
    </>
  );
};
