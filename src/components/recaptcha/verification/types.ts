
export interface RecaptchaVerificationProps {
  action: string;
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export type RequirementDecision = 
  | 'BYPASS_AGENT'
  | 'BYPASS_GENERAL'
  | 'VERIFICATION_REQUISE'
  | 'ERREUR_NON_CONFIGURE';
