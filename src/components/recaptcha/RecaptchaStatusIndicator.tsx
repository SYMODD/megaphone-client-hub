
import React from 'react';
import { useRecaptchaStatusLogic } from "./hooks/useRecaptchaStatusLogic";
import { LoadingStatusBadge } from "./components/LoadingStatusBadge";
import { ErrorStatusBadge } from "./components/ErrorStatusBadge";
import { NotRequiredStatusBadge } from "./components/NotRequiredStatusBadge";
import { NotConfiguredStatusBadge } from "./components/NotConfiguredStatusBadge";
import { ActiveStatusBadge } from "./components/ActiveStatusBadge";
import { RecaptchaStatusIndicatorProps } from "./types/statusIndicatorTypes";

export const RecaptchaStatusIndicator: React.FC<RecaptchaStatusIndicatorProps> = ({ 
  context = 'general',
  size = 'md',
  showDebug = false,
  showRefreshButton = false
}) => {
  const {
    isConfigured,
    isLoading,
    error,
    siteKey,
    secretKey,
    profile,
    isRefreshing,
    isRequired,
    handleRefresh
  } = useRecaptchaStatusLogic(context);

  if (isLoading || isRefreshing) {
    return (
      <LoadingStatusBadge 
        showRefreshButton={showRefreshButton}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    );
  }

  if (error) {
    return (
      <ErrorStatusBadge 
        error={error}
        showRefreshButton={showRefreshButton}
        onRefresh={handleRefresh}
      />
    );
  }

  // Si reCAPTCHA n'est pas requis pour ce contexte/rôle
  if (!isRequired) {
    return (
      <NotRequiredStatusBadge 
        showDebug={showDebug}
        showRefreshButton={showRefreshButton}
        context={context}
        userRole={profile?.role}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    );
  }

  // Si reCAPTCHA est requis mais non configuré
  if (!isConfigured) {
    return (
      <NotConfiguredStatusBadge 
        showDebug={showDebug}
        showRefreshButton={showRefreshButton}
        context={context}
        userRole={profile?.role}
        siteKey={siteKey}
        secretKey={secretKey}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    );
  }

  // Si reCAPTCHA est requis et configuré
  return (
    <ActiveStatusBadge 
      showDebug={showDebug}
      showRefreshButton={showRefreshButton}
      context={context}
      userRole={profile?.role}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  );
};
