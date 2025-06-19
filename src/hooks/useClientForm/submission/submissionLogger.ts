import { ClientFormData } from "../types";

export const logFormSubmissionStart = (formData: ClientFormData) => {
  if (process.env.NODE_ENV === 'development') {
    console.log("📝 Form submission started");
  }
};

export const logUserAuthentication = (user: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log("✅ User authenticated:", user.id);
  }
};

export const logAuthError = () => {
  console.error("❌ User not authenticated");
};

export const logPayloadValidation = (dataToInsert: any, isUrlValid: boolean) => {
  if (process.env.NODE_ENV === 'development') {
    console.log("📋 Payload validated", { hasUrl: isUrlValid });
  }
};

export const logSupabaseCall = (dataToInsert: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log("🔄 Inserting client data");
  }
};

export const logSupabaseError = (error: any, dataToInsert: any) => {
  console.error("❌ Supabase insertion error:", error.message);
};

export const logInsertionSuccess = (data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log("✅ Client inserted successfully");
  }
};

export const logPostInsertionValidation = (savedClient: any, dataToInsert: any, formData: ClientFormData) => {
  if (process.env.NODE_ENV === 'development') {
    console.log("🔍 Post-insertion validation", { clientId: savedClient.id });
  }
};

export const logSuccessResult = (savedClient: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log("✅ Client created successfully:", savedClient.id);
  }
};

export const logFormReset = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log("🔄 Form reset");
  }
};

export const logGeneralError = (error: any) => {
  if (error?.code === '23505' && error?.message?.includes('clients_numero_passeport_key')) {
    console.error("❌ Duplicate passport number error");
  } else {
    console.error("❌ Submission error:", error instanceof Error ? error.message : (error?.message || String(error)));
  }
};

export const logSubmissionEnd = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log("✅ Submission completed");
  }
};
