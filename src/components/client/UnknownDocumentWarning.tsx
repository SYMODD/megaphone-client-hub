
interface UnknownDocumentWarningProps {
  show: boolean;
}

export const UnknownDocumentWarning = ({ show }: UnknownDocumentWarningProps) => {
  if (!show) return null;

  return (
    <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800">
        ⚠️ Type de document non reconnu. Assurez-vous que l'image est claire et que le document est un passeport étranger ou une carte de séjour.
      </p>
    </div>
  );
};
