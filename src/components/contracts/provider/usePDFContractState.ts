
import { useState, useRef } from 'react';
import { FieldMapping } from "@/hooks/usePDFTemplates";
import { Client } from './types';

export const usePDFContractState = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showUpload, setShowUpload] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Références pour éviter les rechargements en boucle
  const isReloadingRef = useRef(false);
  const initialLoadCompleted = useRef(false);
  const lastSavedMappings = useRef<string>('');
  const lastLoadedTemplateId = useRef<string | null>(null);

  return {
    // State
    selectedTemplateId,
    fieldMappings,
    selectedClient,
    isGenerating,
    previewUrl,
    showUpload,
    hasUnsavedChanges,
    
    // Setters
    setSelectedTemplateId,
    setFieldMappings,
    setSelectedClient,
    setIsGenerating,
    setPreviewUrl,
    setShowUpload,
    setHasUnsavedChanges,
    
    // Refs
    isReloadingRef,
    initialLoadCompleted,
    lastSavedMappings,
    lastLoadedTemplateId
  };
};
