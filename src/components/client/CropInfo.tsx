
export const CropInfo = () => {
  return (
    <>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Rogner l'image du passeport</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ajustez le cadre pour inclure uniquement la zone MRZ (lignes de texte en bas du passeport)
        </p>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Conseil :</strong> La zone MRZ se trouve généralement en bas du passeport et contient 2-3 lignes de caractères. 
          Assurez-vous que le cadre inclut uniquement cette zone pour une meilleure reconnaissance OCR.
        </p>
      </div>
    </>
  );
};
