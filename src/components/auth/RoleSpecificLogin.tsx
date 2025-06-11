
import React from "react";
import { getRoleInfo } from "./role-login/roleUtils";
import { useRoleLogin } from "./role-login/hooks/useRoleLogin";
import { RoleInfoBanner } from "./role-login/components/RoleInfoBanner";
import { LoginCard } from "./role-login/components/LoginCard";
import { RoleSpecificLoginProps } from "./role-login/types";

export const RoleSpecificLogin = ({ 
  role, 
  onLogin, 
  onShowPasswordReset, 
  isLoading, 
  hidePasswordReset = false 
}: RoleSpecificLoginProps) => {
  const roleInfo = getRoleInfo(role);
  
  const {
    loginForm,
    setLoginForm,
    requiresRecaptcha,
    isConfigured,
    handleLoginWithRecaptcha,
    handleRecaptchaError,
    handleDirectLogin
  } = useRoleLogin(role, onLogin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleDirectLogin();
  };

  return (
    <div className="space-y-6">
      <RoleInfoBanner role={role} isConfigured={isConfigured} />

      <LoginCard
        role={role}
        roleInfo={roleInfo}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        isLoading={isLoading}
        requiresRecaptcha={requiresRecaptcha}
        hidePasswordReset={hidePasswordReset}
        onSubmit={handleSubmit}
        onShowPasswordReset={onShowPasswordReset}
        onLoginWithRecaptcha={handleLoginWithRecaptcha}
        onRecaptchaError={handleRecaptchaError}
      />
    </div>
  );
};
