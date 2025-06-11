
import React from 'react';

export const AdminRecaptchaHeader: React.FC = () => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
        Configuration reCAPTCHA
      </h1>
      <p className="text-sm sm:text-base text-slate-600">
        Gérez les clés reCAPTCHA pour la sécurité de l'application
      </p>
    </div>
  );
};
