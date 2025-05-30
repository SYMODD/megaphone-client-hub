
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PDFTemplateUploadProps {
  onTemplateUploaded: (file: File, fileName: string) => void;
  onCancel?: () => void;
}

export const PDFTemplateUpload = ({ onTemplateUploaded, onCancel }: PDFTemplateUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFiles = async (files: File[]) => {
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
    setIsUploading(true);

    try {
      await onTemplateUploaded(pdfFile, pdfFile.name);
      toast({
        title: "Succès",
        description: "Template uploadé avec succès !",
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      toast({
        title: "Erreur d'upload",
        description: error instanceof Error ? error.message : "Impossible d'uploader le template.",
        variant: "destructive",
      });
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            <CardTitle>Upload Template PDF</CardTitle>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
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
                : uploadedFile 
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm font-medium text-blue-700">
                  Upload en cours...
                </p>
              </div>
            ) : uploadedFile ? (
              <div className="space-y-2">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
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
              disabled={isUploading}
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('pdf-upload')?.click()}
              disabled={isUploading}
            >
              Choisir un fichier
            </Button>
          </div>

          {uploadedFile && !isUploading && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">
                Template uploadé avec succès !
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
