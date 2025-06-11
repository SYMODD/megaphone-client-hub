
export interface RecaptchaStatusIndicatorProps {
  context?: 'login' | 'document_selection' | 'general';
  size?: 'sm' | 'md' | 'lg';
  showDebug?: boolean;
  showRefreshButton?: boolean;
}

export interface StatusBadgeProps {
  showDebug?: boolean;
  showRefreshButton?: boolean;
  context: string;
  userRole?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}
