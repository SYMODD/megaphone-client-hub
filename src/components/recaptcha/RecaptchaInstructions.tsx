
import React from 'react';

export const RecaptchaInstructions: React.FC = () => {
  return (
    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
      <h4 className="font-medium text-yellow-800 mb-1">
        Comment obtenir vos clés reCAPTCHA v3 ?
      </h4>
      <ol className="text-sm text-yellow-700 space-y-1">
        <li>1. Visitez <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="underline">Google reCAPTCHA Admin</a></li>
        <li>2. Créez un nouveau site avec reCAPTCHA v3</li>
        <li>3. Ajoutez votre domaine (ex: sudmegaphone.netlify.app)</li>
        <li>4. Copiez les clés publique et secrète ici</li>
      </ol>
    </div>
  );
};
