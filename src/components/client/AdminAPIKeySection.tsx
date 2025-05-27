
import { useAuth } from "@/contexts/AuthContext";
import { PassportAPIKeyInput } from "./PassportAPIKeyInput";

interface AdminAPIKeySectionProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  showApiKey: boolean;
  onToggleApiKey: () => void;
}

export const AdminAPIKeySection = ({ 
  apiKey, 
  onApiKeyChange, 
  showApiKey, 
  onToggleApiKey 
}: AdminAPIKeySectionProps) => {
  const { profile, user } = useAuth();
  
  // Check if current user is admin - same logic as in UserManagement
  const isAdmin = profile?.role === "admin" || user?.email === "essbane.salim@gmail.com";
  
  if (!isAdmin) {
    return null;
  }

  return (
    <PassportAPIKeyInput
      apiKey={apiKey}
      onApiKeyChange={onApiKeyChange}
      showApiKey={showApiKey}
      onToggleApiKey={onToggleApiKey}
    />
  );
};
