
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Trash2, Calendar, Plus, Edit2, Save, X, Info, Share2, Users } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PDFTemplate } from "@/hooks/usePDFTemplates";
import { useAuth } from "@/contexts/AuthContext";
import { SharedTemplateOperations } from "@/services/pdf/sharedTemplateOperations";
import { useToast } from "@/hooks/use-toast";

interface PDFTemplateSelectorProps {
  templates: PDFTemplate[];
  selectedTemplateId: string | null;
  onTemplateSelect: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onRenameTemplate: (templateId: string, newName: string) => void;
  onUploadNew: () => void;
}

export const PDFTemplateSelector = ({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  onDeleteTemplate,
  onRenameTemplate,
  onUploadNew
}: PDFTemplateSelectorProps) => {
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [sharingTemplateId, setSharingTemplateId] = useState<string | null>(null);
  const [shareRole, setShareRole] = useState<string>('');
  const { profile } = useAuth();
  const { toast } = useToast();
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

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

  const handleShareTemplate = async () => {
    if (!sharingTemplateId) return;

    try {
      await SharedTemplateOperations.shareTemplate(
        sharingTemplateId, 
        shareRole === 'all' ? null : shareRole
      );
      
      toast({
        title: "Template partagé",
        description: `Le template a été partagé avec ${shareRole === 'all' ? 'tous les utilisateurs' : `les ${shareRole}s`}.`,
      });
      
      setSharingTemplateId(null);
      setShareRole('');
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      toast({
        title: "Erreur de partage",
        description: error instanceof Error ? error.message : "Impossible de partager le template.",
        variant: "destructive",
      });
    }
  };

  const handleUnshareTemplate = async (templateId: string) => {
    try {
      await SharedTemplateOperations.unshareTemplate(templateId);
      
      toast({
        title: "Partage supprimé",
        description: "Le template n'est plus partagé.",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du partage:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer le partage.",
        variant: "destructive",
      });
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Gestion des Templates PDF
        </CardTitle>
        <CardDescription>
          Gérez vos templates : sélectionnez, renommez ou uploadez-en de nouveaux
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profile?.role === 'agent' && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Information pour les agents</p>
                <p>Vous voyez vos templates personnels et ceux partagés par les administrateurs.</p>
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
            <Button onClick={onUploadNew} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Template
            </Button>
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(selectedTemplate)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSharingTemplateId(selectedTemplate.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Share2 className="w-3 h-3" />
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteTemplate(selectedTemplate.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Dialog de partage */}
              {sharingTemplateId === selectedTemplate.id && (
                <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Partager ce template
                  </h5>
                  <div className="flex items-center gap-2">
                    <Select value={shareRole} onValueChange={setShareRole}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Choisir qui peut accéder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agents seulement</SelectItem>
                        <SelectItem value="superviseur">Superviseurs seulement</SelectItem>
                        <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={handleShareTemplate}
                      disabled={!shareRole}
                    >
                      Partager
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setSharingTemplateId(null)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {templates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucun template accessible</p>
              {profile?.role === 'agent' ? (
                <p className="text-sm">Uploadez votre premier template ou demandez l'accès à des templates partagés</p>
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
