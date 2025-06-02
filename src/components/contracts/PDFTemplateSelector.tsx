
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Trash2, Calendar, Plus, Edit2, Save, X, Info, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PDFTemplate } from "@/hooks/usePDFTemplates";
import { useAuth } from "@/contexts/AuthContext";

interface PDFTemplateSelectorProps {
  templates: PDFTemplate[];
  selectedTemplateId: string | null;
  onTemplateSelect: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onRenameTemplate: (templateId: string, newName: string) => void;
  onUploadNew: () => void;
  onForceReload?: () => void;
}

export const PDFTemplateSelector = ({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  onDeleteTemplate,
  onRenameTemplate,
  onUploadNew,
  onForceReload
}: PDFTemplateSelectorProps) => {
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [isReloading, setIsReloading] = useState(false);
  const { profile } = useAuth();
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Vérifier si l'utilisateur est admin
  const isAdmin = profile?.role === 'admin';

  const handleStartEdit = (template: PDFTemplate) => {
    setEditingTemplateId(template.id);
    setEditingName(template.name);
  };

  const handleSaveEdit = () => {
    if (editingTemplateId && editingName.trim()) {
      onRenameTemplate(editingTemplateId, editingName.trim());
      setEditingTemplateId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplateId(null);
    setEditingName('');
  };

  const handleForceReload = async () => {
    if (!onForceReload) return;
    
    setIsReloading(true);
    console.log('🔄 Rechargement forcé des templates...');
    
    try {
      await onForceReload();
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gestion des Templates PDF
          </div>
          {onForceReload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceReload}
              disabled={isReloading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
              {isReloading ? 'Rechargement...' : 'Actualiser'}
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          {isAdmin 
            ? "Gérez vos templates : sélectionnez, renommez ou uploadez-en de nouveaux"
            : "Sélectionnez un template parmi ceux disponibles"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profile?.role === 'agent' && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Information pour les agents</p>
                <p>Vous voyez les templates créés par les administrateurs et pouvez les utiliser pour générer des contrats.</p>
                <p className="text-xs mt-1">Si vous voyez des templates qui ne devraient plus être là, cliquez sur "Actualiser".</p>
              </div>
            </div>
          )}

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
            {isAdmin && (
              <Button onClick={onUploadNew} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Template
              </Button>
            )}
          </div>

          {selectedTemplate && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  {editingTemplateId === selectedTemplate.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="font-medium"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <Button size="sm" onClick={handleSaveEdit} variant="outline">
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={handleCancelEdit} variant="ghost">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-blue-900">{selectedTemplate.name}</h4>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(selectedTemplate)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
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
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTemplate(selectedTemplate.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {templates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucun template accessible</p>
              {profile?.role === 'agent' ? (
                <p className="text-sm">Les templates des administrateurs apparaîtront automatiquement ici une fois créés</p>
              ) : (
                <p className="text-sm">Cliquez sur "Nouveau Template" pour commencer</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
