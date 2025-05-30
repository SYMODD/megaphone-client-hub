
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Trash2, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PDFTemplate } from "@/hooks/usePDFTemplates";

interface PDFTemplateSelectorProps {
  templates: PDFTemplate[];
  selectedTemplateId: string | null;
  onTemplateSelect: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onUploadNew: () => void;
}

export const PDFTemplateSelector = ({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  onDeleteTemplate,
  onUploadNew
}: PDFTemplateSelectorProps) => {
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Sélection du Template PDF
        </CardTitle>
        <CardDescription>
          Choisissez un template existant ou uploadez-en un nouveau
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={selectedTemplateId || ''} onValueChange={onTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un template PDF" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(template.uploadDate), "dd/MM/yyyy", { locale: fr })}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={onUploadNew} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau
            </Button>
          </div>

          {selectedTemplate && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">{selectedTemplate.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-blue-700">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {selectedTemplate.fileName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(selectedTemplate.uploadDate), "dd MMMM yyyy", { locale: fr })}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteTemplate(selectedTemplate.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {templates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucun template sauvegardé</p>
              <p className="text-sm">Cliquez sur "Nouveau" pour commencer</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
