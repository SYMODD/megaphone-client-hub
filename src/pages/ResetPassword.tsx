
import { useRecoveryTokenVerification } from "@/hooks/auth/useRecoveryTokenVerification";
import { LoadingState } from "@/components/auth/LoadingState";
import { ResetPasswordContainer } from "@/components/auth/ResetPasswordContainer";

const ResetPassword = () => {
  const { isValidToken, isCheckingToken, error, success } = useRecoveryTokenVerification();

  // Affichage du loading pendant la vérification
  if (isCheckingToken) {
    return <LoadingState message="Vérification du lien de récupération..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <ResetPasswordContainer 
        isValidToken={isValidToken}
        error={error}
        success={success}
      />
    </div>
  );
};

export default ResetPassword;
