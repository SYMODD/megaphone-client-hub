
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PDFTemplateUploadProps {
  onTemplateUploaded: (file: File, fileName: string) => void;
}

export const PDFTemplateUpload = ({ onTemplateUploaded }: PDFTemplateUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (!pdfFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF valide.",
        variant: "destructive",
      });
      return;
    }

    if (pdfFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Erreur",
        description: "Le fichier est trop volumineux (max 10MB).",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(pdfFile);
    onTemplateUploaded(pdfFile, pdfFile.name);
    
    toast({
      title: "Succès",
      description: `Template "${pdfFile.name}" uploadé avec succès.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Template PDF
        </CardTitle>
        <CardDescription>
          Uploadez votre modèle de contrat PDF pour pouvoir y insérer les données clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 text-green-500 mx-auto" />
                <p className="text-sm font-medium text-green-700">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  Glissez-déposez votre PDF ici ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-gray-500">
                  Maximum 10MB • Format PDF uniquement
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="pdf-upload" className="sr-only">Upload PDF</Label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('pdf-upload')?.click()}
            >
              Choisir un fichier
            </Button>
          </div>

          {uploadedFile && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
              <AlertCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">
                Template prêt ! Vous pouvez maintenant configurer les champs à remplir.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
