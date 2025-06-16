
import { useState } from "react";

interface PassportData {
  nom: string;
  prenom: string;
  nationalite: string;
  numero_passeport: string;
  numero_telephone?: string;
  code_barre?: string;
}

export const usePassportMarocainConfirmation = () => {
  const [confirmedData, setConfirmedData] = useState<PassportData | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const confirmData = (data: PassportData) => {
    console.log("Confirmation des données MRZ:", data);
    setConfirmedData(data);
    setIsConfirmed(true);
  };

  const resetConfirmation = () => {
    setConfirmedData(null);
    setIsConfirmed(false);
  };

  return {
    confirmedData,
    isConfirmed,
    confirmData,
    resetConfirmation
  };
};
