
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, User, Globe, FileText, UserCheck } from "lucide-react";
import { useAgentInfo } from "@/hooks/useAgentInfo";
import { generateClientNumber, formatAgentName } from "@/utils/clientUtils";

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

interface ClientViewDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientViewDialog = ({ client, open, onOpenChange }: ClientViewDialogProps) => {
  const { agentInfo, loading: agentLoading } = useAgentInfo(client?.agent_id || null);

  if (!client) return null;

  const clientNumber = generateClientNumber(client.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Détails du client
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Photo et informations principales */}
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={client.photo_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                {client.prenom[0]}{client.nom[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <h3 className="text-2xl font-bold text-slate-800">
                {client.prenom} {client.nom}
              </h3>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <Badge variant="outline">{client.nationalite}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="font-mono text-sm">{client.numero_passeport}</span>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Date d'enregistrement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {new Date(client.date_enregistrement).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Numéro client</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-lg font-semibold text-blue-600">{clientNumber}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Agent responsable
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agentLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </div>
                ) : agentInfo ? (
                  <p className="font-semibold">{formatAgentName(agentInfo.nom, agentInfo.prenom)}</p>
                ) : (
                  <p className="text-slate-500 text-sm">Agent non trouvé</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Observations */}
          {client.observations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Observations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600 whitespace-pre-line">
                  {client.observations}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métadonnées - Section repliée */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-400">Informations techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Créé le :</span>
                <span>{new Date(client.created_at).toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Modifié le :</span>
                <span>{new Date(client.updated_at).toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>ID système :</span>
                <span className="font-mono">{client.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
