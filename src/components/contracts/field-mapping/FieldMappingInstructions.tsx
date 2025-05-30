
import React from 'react';

export const FieldMappingInstructions = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2">Instructions :</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Définissez les coordonnées X et Y pour chaque champ (0,0 = coin inférieur gauche)</li>
        <li>• Les valeurs X et Y sont en points PDF (72 points = 1 pouce)</li>
        <li>• Utilisez la prévisualisation pour ajuster les positions</li>
        <li>• Les configurations sont sauvegardées automatiquement pour chaque template</li>
      </ul>
    </div>
  );
};
