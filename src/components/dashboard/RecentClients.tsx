
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

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
    }>;
  };
}

export const RecentClients = ({ data }: RecentClientsProps) => {
  const { recentClients } = data;
  const { toast } = useToast();

  useEffect(() => {
    console.log("🔄 RecentClients RE-RENDER avec nouvelles données:", recentClients);
  }, [recentClients]);

  // Action handlers for client operations
  const handleViewClient = (client: any) => {
    console.log('Voir client:', client);
    toast({
      title: "Voir le client",
      description: `Affichage des détails pour ${client.prenom} ${client.nom}`,
    });
  };

  const handleEditClient = (client: any) => {
    console.log('Modifier client:', client);
    toast({
      title: "Modifier le client",
      description: `Édition du client ${client.prenom} ${client.nom}`,
    });
  };

  const handleGenerateDocument = (client: any) => {
    console.log('Générer document:', client);
    toast({
      title: "Générer un document",
      description: `Génération d'un document pour ${client.prenom} ${client.nom}`,
    });
  };

  return (
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
              <div key={`${client.id}-${client.pointOperation}`} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={client.photo || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {client.prenom[0]}{client.nom[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {client.prenom} {client.nom}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {client.nationalite}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(client.dateEnregistrement).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewClient(client)}
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditClient(client)}
                    title="Modifier le client"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleGenerateDocument(client)}
                    title="Générer un document"
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
          <Button variant="outline" className="w-full">
            Voir tous les clients
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
