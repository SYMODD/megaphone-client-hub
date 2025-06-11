
import React from 'react';

export const RecaptchaTestInstructions: React.FC = () => {
  return (
    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
      <h5 className="font-medium text-sm text-yellow-800 mb-1">
        Instructions de Test
      </h5>
      <ul className="text-xs text-yellow-700 space-y-1">
        <li>• Admin/Superviseur : reCAPTCHA requis pour la connexion</li>
        <li>• Agent : reCAPTCHA requis pour la sélection de document</li>
        <li>• Tous les tests doivent retourner un token valide</li>
        <li>• En cas d'échec, vérifiez les clés et la connectivité</li>
      </ul>
    </div>
  );
};
