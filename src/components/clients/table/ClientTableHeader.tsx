
export const ClientTableHeader = () => {
  return (
    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
      <tr>
        <th className="px-3 py-3 hidden sm:table-cell">Date</th>
        <th className="px-3 py-3">Client</th>
        <th className="px-3 py-3 hidden md:table-cell">Nationalité</th>
        <th className="px-3 py-3 hidden lg:table-cell">Document</th>
        <th className="px-3 py-3 hidden xl:table-cell">Point/Catégorie</th>
        <th className="px-3 py-3 hidden 2xl:table-cell">Code barre</th>
        <th className="px-3 py-3 text-right">Actions</th>
      </tr>
    </thead>
  );
};
