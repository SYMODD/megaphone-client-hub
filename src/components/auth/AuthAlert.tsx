
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthAlertProps {
  error: string | null;
  success: string | null;
}

export const AuthAlert = ({ error, success }: AuthAlertProps) => {
  if (!error && !success) return null;

  return (
    <Alert className={`mb-4 ${success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <AlertDescription className={success ? 'text-green-700' : 'text-red-700'}>
        {error || success}
      </AlertDescription>
    </Alert>
  );
};
