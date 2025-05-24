
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentClients = [
  {
    id: 1,
    nom: "Dubois",
    prenom: "Marie",
    nationalite: "France",
    dateEnregistrement: "2024-01-15",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b332c8a5?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    nom: "Benali",
    prenom: "Ahmed",
    nationalite: "Algérie",
    dateEnregistrement: "2024-01-14",
    photo: null,
  },
  {
    id: 3,
    nom: "Diallo",
    prenom: "Fatou",
    nationalite: "Sénégal",
    dateEnregistrement: "2024-01-13",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 4,
    nom: "El Mansouri",
    prenom: "Youssef",
    nationalite: "Maroc",
    dateEnregistrement: "2024-01-12",
    photo: null,
  },
  {
    id: 5,
    nom: "Trabelsi",
    prenom: "Leila",
    nationalite: "Tunisie",
    dateEnregistrement: "2024-01-11",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];

export const RecentClients = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          Derniers clients enregistrés
        </CardTitle>
        <CardDescription>
          Les 5 derniers clients ajoutés à la base
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentClients.map((client) => (
            <div key={client.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
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
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
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
