
import { useLogin } from "./auth/useLogin";
import { usePasswordReset } from "./auth/usePasswordReset";
import { useNewPassword } from "./auth/useNewPassword";
import { useAuthErrorHandling } from "./auth/useAuthErrorHandling";

export const useAuthOperations = () => {
  const { handleLogin, isLoading: loginLoading } = useLogin();
  const { handlePasswordReset, isLoading: resetLoading } = usePasswordReset();
  const { handleNewPassword, isLoading: passwordLoading } = useNewPassword();
  const { error, success, setError, setSuccess } = useAuthErrorHandling();

  const isLoading = loginLoading || resetLoading || passwordLoading;

  return {
    error,
    success,
    isLoading,
    setError,
    setSuccess,
    handleLogin,
    handlePasswordReset,
    handleNewPassword,
  };
};
