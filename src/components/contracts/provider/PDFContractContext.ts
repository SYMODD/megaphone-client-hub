
import { createContext, useContext } from 'react';
import { PDFContractContextType } from './types';

export const PDFContractContext = createContext<PDFContractContextType | undefined>(undefined);

export const usePDFContract = () => {
  const context = useContext(PDFContractContext);
  console.log('🔍 usePDFContract hook called, context available:', !!context);
  if (context === undefined) {
    console.error('❌ usePDFContract called outside of PDFContractProvider');
    throw new Error('usePDFContract must be used within a PDFContractProvider');
  }
  return context;
};
