
export const getActionBadgeProps = (action: string) => {
  switch (action) {
    case 'INSERT':
      return { className: "bg-green-100 text-green-700 border-green-200", label: "Création" };
    case 'UPDATE':
      return { className: "bg-blue-100 text-blue-700 border-blue-200", label: "Modification" };
    case 'DELETE':
      return { className: "bg-red-100 text-red-700 border-red-200", label: "Suppression" };
    default:
      return { variant: "outline" as const, label: action };
  }
};

export const getSettingDisplayName = (settingKey: string) => {
  switch (settingKey) {
    case 'recaptcha_public_key':
      return 'Clé publique reCAPTCHA';
    case 'recaptcha_secret_key':
      return 'Clé secrète reCAPTCHA';
    default:
      return settingKey;
  }
};
