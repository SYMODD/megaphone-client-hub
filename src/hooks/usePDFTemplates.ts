
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PDFTemplate {
  id: string;
  name: string;
  fileName: string;
  uploadDate: string;
  file: File;
}

interface FieldMapping {
  id: string;
  placeholder: string;
  clientField: string;
  description?: string;
  x?: number;
  y?: number;
  fontSize?: number;
}

const STORAGE_KEY = 'pdfTemplates';
const MAPPINGS_KEY = 'pdfTemplateMappings';

export const usePDFTemplates = () => {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [templateMappings, setTemplateMappings] = useState<Record<string, FieldMapping[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadMappings();
  }, []);

  const loadTemplates = async () => {
    try {
      const savedTemplates = localStorage.getItem(STORAGE_KEY);
      if (savedTemplates) {
        const parsedTemplates = JSON.parse(savedTemplates);
        console.log('Templates chargés:', parsedTemplates);
        
        // Convertir les templates sauvegardés en objets avec des fichiers File
        const templatesWithFiles = await Promise.all(
          parsedTemplates.map(async (template: any) => ({
            ...template,
            file: typeof template.file === 'string' 
              ? base64ToFile(template.file, template.fileName)
              : template.file
          }))
        );
        
        setTemplates(templatesWithFiles);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
    }
  };

  const loadMappings = () => {
    try {
      const savedMappings = localStorage.getItem(MAPPINGS_KEY);
      if (savedMappings) {
        const parsedMappings = JSON.parse(savedMappings);
        console.log('Mappings chargés:', parsedMappings);
        setTemplateMappings(parsedMappings);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mappings:', error);
    }
  };

  const saveTemplate = async (file: File, fileName: string): Promise<string> => {
    try {
      const newTemplate: PDFTemplate = {
        id: Date.now().toString(),
        name: fileName.replace('.pdf', ''),
        fileName: fileName,
        uploadDate: new Date().toISOString(),
        file: file
      };

      // Convertir le fichier en base64 pour le stockage
      const base64 = await fileToBase64(file);
      
      // Sauvegarder avec le fichier en base64 pour le localStorage
      const templateForStorage = {
        ...newTemplate,
        file: base64
      };

      const updatedTemplates = [...templates, newTemplate];
      
      // Convertir tous les templates existants en base64 pour le stockage
      const templatesForStorage = await Promise.all(
        templates.map(async (t) => ({
          ...t,
          file: t.file instanceof File ? await fileToBase64(t.file) : t.file
        }))
      );
      templatesForStorage.push(templateForStorage);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(templatesForStorage));
      setTemplates(updatedTemplates);

      toast({
        title: "Template sauvegardé",
        description: `Le template "${fileName}" a été sauvegardé avec succès.`,
      });

      return newTemplate.id;
    } catch (error) {
      console.error('Erreur sauvegarde template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    
    // Convertir tous les templates en base64 pour le stockage
    const templatesForStorage = await Promise.all(
      updatedTemplates.map(async (t) => ({
        ...t,
        file: t.file instanceof File ? await fileToBase64(t.file) : t.file
      }))
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templatesForStorage));
    setTemplates(updatedTemplates);

    // Supprimer aussi les mappings associés
    const updatedMappings = { ...templateMappings };
    delete updatedMappings[templateId];
    localStorage.setItem(MAPPINGS_KEY, JSON.stringify(updatedMappings));
    setTemplateMappings(updatedMappings);

    toast({
      title: "Template supprimé",
      description: "Le template a été supprimé avec succès.",
    });
  };

  const saveMappings = (templateId: string, mappings: FieldMapping[]) => {
    const updatedMappings = {
      ...templateMappings,
      [templateId]: mappings
    };
    
    localStorage.setItem(MAPPINGS_KEY, JSON.stringify(updatedMappings));
    setTemplateMappings(updatedMappings);
  };

  const getTemplate = async (templateId: string): Promise<File | null> => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return null;

      if (template.file instanceof File) {
        return template.file;
      }

      // Si c'est une chaîne base64, la convertir en fichier
      if (typeof template.file === 'string') {
        return base64ToFile(template.file, template.fileName);
      }

      return null;
    } catch (error) {
      console.error('Erreur récupération template:', error);
      return null;
    }
  };

  return {
    templates,
    templateMappings,
    saveTemplate,
    deleteTemplate,
    saveMappings,
    getTemplate,
    loadTemplates
  };
};

// Utilitaires de conversion
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const base64ToFile = (base64: string, fileName: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
};
