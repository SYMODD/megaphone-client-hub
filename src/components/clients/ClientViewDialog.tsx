
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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            Détails du client
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Photo et informations principales - Responsive */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
              <AvatarImage src={client.photo_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-base sm:text-lg">
                {client.prenom[0]}{client.nom[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 break-words">
                {client.prenom} {client.nom}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Globe className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <Badge variant="outline" className="text-xs sm:text-sm">{client.nationalite}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="font-mono text-xs sm:text-sm break-all">{client.numero_passeport}</span>
              </div>
            </div>
          </div>

          {/* Informations détaillées - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                  <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" />
                  Date d'enregistrement
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm sm:text-lg font-semibold leading-tight">
                  {new Date(client.date_enregistrement).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm">Numéro client</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="font-mono text-sm sm:text-lg font-semibold text-blue-600 break-all">{clientNumber}</p>
              </CardContent>
            </Card>

            <Card className="w-full sm:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                  <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  Agent responsable
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {agentLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-20 sm:w-24"></div>
                  </div>
                ) : agentInfo ? (
                  <p className="font-semibold text-sm sm:text-base">{formatAgentName(agentInfo.nom, agentInfo.prenom)}</p>
                ) : (
                  <p className="text-slate-500 text-xs sm:text-sm">Agent non trouvé</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Observations - Responsive */}
          {client.observations && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm">Observations</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                  {client.observations}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métadonnées - Responsive */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm text-slate-400">Informations techniques</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-slate-400">
                <span>Créé le :</span>
                <span className="font-mono break-all">{new Date(client.created_at).toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-slate-400">
                <span>Modifié le :</span>
                <span className="font-mono break-all">{new Date(client.updated_at).toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-slate-400">
                <span>ID système :</span>
                <span className="font-mono break-all">{client.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
