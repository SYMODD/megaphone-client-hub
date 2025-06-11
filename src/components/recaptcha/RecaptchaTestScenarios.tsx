
import React from 'react';
import { Settings, User, Users, FileText } from "lucide-react";
import { TestScenario } from "@/hooks/useRecaptchaTestRunner";

export const testScenarios: TestScenario[] = [
  { 
    role: 'admin', 
    action: 'admin_login', 
    label: 'Connexion Admin', 
    icon: Settings 
  },
  { 
    role: 'superviseur', 
    action: 'supervisor_login', 
    label: 'Connexion Superviseur', 
    icon: Users 
  },
  { 
    role: 'agent', 
    action: 'agent_document_selection', 
    label: 'Sélection Document Agent', 
    icon: FileText 
  },
];
