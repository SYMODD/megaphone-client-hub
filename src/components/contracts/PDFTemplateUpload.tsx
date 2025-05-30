
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle, X, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PDFTemplateUploadProps {
  onTemplateUploaded: (file: File, fileName: string) => void;
  onCancel?: () => void;
}

export const PDFTemplateUpload = ({ onTemplateUploaded, onCancel }: PDFTemplateUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
        title: "Fichier invalide",
        description: "Veuillez sélectionner un fichier PDF valide.",
        variant: "destructive",
      });
      return;
    }

    if (pdfFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Fichier trop volumineux",
        description: "Le fichier est trop volumineux (maximum 10MB).",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(pdfFile);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onTemplateUploaded(pdfFile, pdfFile.name);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: "Upload réussi",
        description: `Template "${pdfFile.name}" uploadé avec succès !`,
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      const errorMessage = error instanceof Error ? error.message : "Impossible d'uploader le template.";
      
      toast({
        title: "Erreur d'upload",
        description: errorMessage,
        variant: "destructive",
      });
      setUploadedFile(null);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
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
                : uploadedFile && uploadProgress === 100
                ? 'border-green-500 bg-green-50'
                : isUploading
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-3">
                <RefreshCw className="w-12 h-12 text-orange-500 mx-auto animate-spin" />
                <p className="text-sm font-medium text-orange-700">
                  Upload en cours...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {uploadProgress}% terminé
                </p>
              </div>
            ) : uploadedFile && uploadProgress === 100 ? (
              <div className="space-y-2">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <p className="text-sm font-medium text-green-700">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Upload terminé
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetUpload}
                  className="mt-2"
                >
                  Uploader un autre fichier
                </Button>
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

          {!uploadedFile && !isUploading && (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};
