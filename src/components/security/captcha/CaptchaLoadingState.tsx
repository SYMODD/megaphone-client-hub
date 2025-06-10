
interface CaptchaLoadingStateProps {
  message: string;
  className?: string;
}

export const CaptchaLoadingState = ({ message, className = "" }: CaptchaLoadingStateProps) => {
  return (
    <div className={`flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 font-medium">{message}</span>
      </div>
    </div>
  );
};
