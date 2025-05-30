
import { useMemo } from "react";
import { RegistrationData } from "@/types/agentDataTypes";
import { baseRegistrationData } from "@/constants/agentDataConstants";

export const useRegistrationData = (totalClients: number, refreshKey: number): RegistrationData[] => {
  return useMemo(() => {
    console.log("📊 Recalcul données enregistrement - totalClients:", totalClients, "refreshKey:", refreshKey);
    
    const registrationMultiplier = Math.max(0.1, totalClients / 300);
    const data = baseRegistrationData.map(item => ({
      ...item,
      clients: Math.round(item.clients * registrationMultiplier)
    }));

    console.log("📈 Données enregistrement calculées:", data);
    return data;
  }, [totalClients, refreshKey]);
};
