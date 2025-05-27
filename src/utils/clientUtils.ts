
// Utilitaires pour la gestion des clients

export const generateClientNumber = (clientId: string): string => {
  // Prendre les 8 premiers caractères de l'UUID et les formater
  const shortId = clientId.replace(/-/g, '').substring(0, 8).toUpperCase();
  return `CLIENT-${shortId}`;
};

export const formatAgentName = (nom: string, prenom: string): string => {
  return `${prenom} ${nom}`;
};
