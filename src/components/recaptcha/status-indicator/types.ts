
export interface StatusIndicatorProps {
  context?: string;
  size?: 'sm' | 'md' | 'lg';
  showDebug?: boolean;
  showRefreshButton?: boolean;
}

export type StatusDecision = 
  | 'SECURITE_ACTIVE'
  | 'SECURITE_RECOMMANDEE' 
  | 'NON_APPLICABLE';

export interface StatusDisplayInfo {
  variant: 'default' | 'outline' | 'destructive';
  icon: any;
  text: string;
  bgColor: string;
  textColor: string;
}
