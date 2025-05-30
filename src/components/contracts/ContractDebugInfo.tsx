
interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  icon?: string;
}

interface ContractDebugInfoProps {
  customTemplates: ContractTemplate[];
}

export const ContractDebugInfo = ({ customTemplates }: ContractDebugInfoProps) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
      <strong>Debug:</strong> {customTemplates.length} modèle(s) chargé(s)
      {customTemplates.length > 0 && (
        <ul className="mt-1 list-disc list-inside">
          {customTemplates.map(t => (
            <li key={t.id}>{t.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
