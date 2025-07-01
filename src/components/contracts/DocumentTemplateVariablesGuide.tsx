import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Lightbulb, Code } from "lucide-react";

export const DocumentTemplateVariablesGuide = () => {
  const basicVariables = [
    { var: "{{client.prenom}}", desc: "Prénom du client", example: "Ahmed" },
    { var: "{{client.nom}}", desc: "Nom du client", example: "Belaoui" },
    { var: "{{client.nationalite}}", desc: "Nationalité du client", example: "Maroc" },
    { var: "{{client.date_enregistrement}}", desc: "Date d'enregistrement", example: "21/02/1990" },
    { var: "{{client.observations}}", desc: "Observations du client", example: "Notes spéciales" },
    { var: "{{date}}", desc: "Date actuelle", example: "15 décembre 2024" },
    { var: "{{entreprise}}", desc: "Nom de l'entreprise", example: "Sud Megaphone" }
  ];

  const documentVariables = [
    { var: "{{client.numero_document}}", desc: "Numéro du document (universel)", example: "G901903" },
    { var: "{{client.type_document}}", desc: "Type de document (dynamique)", example: "Numéro de CIN" },
    { var: "{{client.document_complet}}", desc: "Type + numéro complet", example: "Numéro de CIN: AB123456" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Variables de Template Disponibles
        </CardTitle>
        <CardDescription>
          Guide des variables dynamiques selon le type de document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Variables de Base
          </h3>
          <div className="grid gap-3">
            {basicVariables.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                    {item.var}
                  </code>
                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.example}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Variables de Document Dynamiques
            <Badge className="bg-green-100 text-green-800">Nouveau !</Badge>
          </h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-amber-800">
              <strong>💡 Astuce :</strong> Ces variables s'adaptent automatiquement selon le type de document du client (CIN, Passeport, etc.).
            </p>
          </div>
          <div className="grid gap-3">
            {documentVariables.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-1">
                  <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                    {item.var}
                  </code>
                  <p className="text-sm text-green-700 mt-1">{item.desc}</p>
                </div>
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                  {item.example}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
