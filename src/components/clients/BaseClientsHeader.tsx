
interface BaseClientsHeaderProps {
  totalCount: number;
}

export const BaseClientsHeader = ({ totalCount }: BaseClientsHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        Base Clients 
        <span className="text-sm font-normal text-slate-500 ml-2">
          (Optimisé pour gros volumes)
        </span>
      </h1>
      <p className="text-slate-600">
        Gérez et consultez tous vos clients enregistrés avec filtrage côté serveur
      </p>
    </div>
  );
};
