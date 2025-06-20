
import { createContext, useContext } from 'react';
import { PDFContractContextType } from './types';

export const PDFContractContext = createContext<PDFContractContextType | undefined>(undefined);

export const usePDFContract = () => {
  const context = useContext(PDFContractContext);
  if (context === undefined) {
    throw new Error('usePDFContract must be used within a PDFContractProvider');
  }
  return context;
};
