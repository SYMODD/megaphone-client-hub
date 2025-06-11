
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { RecaptchaConfigStatus } from "./RecaptchaConfigStatus";
import { RecaptchaInstructions } from "./RecaptchaInstructions";
import { useRecaptchaConfigForm } from "./config-form/useRecaptchaConfigForm";
import { ConfigFormFields } from "./config-form/ConfigFormFields";
import { ConfigFormActions } from "./config-form/ConfigFormActions";

export const RecaptchaConfigForm: React.FC = () => {
  const {
    formData,
    showSecrets,
    isConfigured,
    saving,
    setShowSecrets,
    updateFormData,
    handleSave,
    handleClear
  } = useRecaptchaConfigForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Clés reCAPTCHA v3
        </CardTitle>
        <CardDescription>
          Configurez vos clés reCAPTCHA v3 pour sécuriser l'application.
          Ces clés sont utilisées pour la connexion Admin/Superviseur et la sélection de documents pour les Agents.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <RecaptchaConfigStatus isConfigured={isConfigured} />

        <ConfigFormFields
          formData={formData}
          showSecrets={showSecrets}
          onToggleSecrets={() => setShowSecrets(!showSecrets)}
          onUpdateField={updateFormData}
        />

        <ConfigFormActions
          saving={saving}
          onSave={handleSave}
          onClear={handleClear}
        />

        <RecaptchaInstructions />
      </CardContent>
    </Card>
  );
};
