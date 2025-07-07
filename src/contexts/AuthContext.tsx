import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { performanceOptimizer } from "@/utils/performanceOptimizer";
import { logSecurityEvent, detectNewDevice, triggerSecurityAlert } from "@/utils/securityLogger";

type Profile = {
  id: string;
  nom: string;
  prenom: string;
  role: "agent" | "superviseur" | "admin";
  point_operation: string;
  statut: "actif" | "inactif";
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
  needsMFAValidation: boolean;
  completeMFAValidation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsMFAValidation, setNeedsMFAValidation] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        return;
      }

      console.log("Profile fetched:", data);
      setProfile(data);
      
      // ✅ PERFORMANCE - Initialiser l'optimiseur avec le rôle utilisateur (avec délai)
      if (data?.role) {
        setTimeout(() => {
          try {
            performanceOptimizer.initialize(data.role);
          } catch (error) {
            console.debug('Performance optimizer initialization skipped:', error);
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && mounted) {
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          if (mounted) {
            fetchProfile(session.user.id);
          }
        }, 0);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata: any) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    console.log("=== AuthContext signIn ===");
    console.log("Normalized email:", normalizedEmail);
    
    // Première vérification : l'utilisateur existe-t-il dans auth.users ?
    console.log("Attempting Supabase auth sign in...");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    console.log("Supabase auth response:", { 
      hasData: !!data, 
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      userId: data?.user?.id,
      errorCode: error?.code,
      errorMessage: error?.message
    });

    if (error) {
      console.error("Supabase auth error:", error);
      
      // Note: On ne peut pas enregistrer les échecs de connexion anonymes car user_id est requis
      
      return { data, error };
    }

    // Si l'authentification réussit, vérifier le statut dans profiles
    if (data.user) {
      console.log("Auth successful, checking user status in profiles...");
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("statut, nom, prenom, role")
        .eq("id", data.user.id)
        .single();

      console.log("Profile check result:", { 
        profileData, 
        profileError: profileError?.code 
      });

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error checking user status:", profileError);
        return { data, error: profileError };
      }

      if (profileData && profileData.statut === "inactif") {
        console.log("User account is inactive");
        // Sign out the user and return error
        await supabase.auth.signOut();
        return { 
          data: null, 
          error: { 
            message: "Votre compte est inactif. Veuillez contacter l'administrateur.",
            code: "account_inactive"
          } 
        };
      }
      
      console.log("User is active, login successful");
      
      // 🔐 INTÉGRATION SYSTÈME DE SÉCURITÉ
      try {
        // Vérifier si c'est un rôle autorisé pour la sécurité
        const isSecurityUser = profileData?.role === 'admin' || profileData?.role === 'superviseur';
        
        console.log("🔐 DIAGNOSTIC - Utilisateur connecté:", {
          userId: data.user.id,
          email: normalizedEmail,
          role: profileData?.role,
          isSecurityUser,
          nom: profileData?.nom,
          prenom: profileData?.prenom
        });
        
        if (isSecurityUser) {
          console.log("🔐 Utilisateur sécurisé détecté, activation monitoring...");
          
          // Détecter si c'est un nouvel appareil
          console.log("🔍 LANCEMENT détection nouvel appareil...");
          const isNewDevice = await detectNewDevice(data.user.id);
          console.log("🎯 RÉSULTAT détection nouvel appareil:", isNewDevice ? "🚨 NOUVEL APPAREIL" : "✅ APPAREIL CONNU");
          
          if (isNewDevice) {
            console.log("🚨 NOUVEL APPAREIL DÉTECTÉ - VALIDATION MFA REQUISE !");
            
            // Déclencher une alerte de sécurité
            await triggerSecurityAlert(data.user.id, 'new_device', {
              user_info: {
                nom: profileData.nom,
                prenom: profileData.prenom,
                role: profileData.role
              },
              connection_info: {
                email: normalizedEmail,
                timestamp: new Date().toISOString()
              }
            });
            
            // Enregistrer la tentative de connexion avec appareil non autorisé
            await logSecurityEvent(data.user.id, 'device_detected', {
              action: 'new_device_mfa_required',
              device_info: {
                email: normalizedEmail,
                is_new_device: isNewDevice,
                user_role: profileData.role,
                validation_required: true
              }
            });
            
            // 🔒 FORCER LA VALIDATION MFA
            console.log("🔐 DÉFINITION needsMFAValidation = true");
            setNeedsMFAValidation(true);
            
            // ✅ CORRECTION CRITIQUE : Attendre que l'état soit défini
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log("🔐 État MFA défini, connexion en attente de validation");
            
          } else {
            // Appareil connu - connexion normale
            console.log("✅ Appareil connu - Connexion normale autorisée");
            await logSecurityEvent(data.user.id, 'login', {
              action: 'successful_login',
              device_info: {
                email: normalizedEmail,
                is_new_device: isNewDevice,
                user_role: profileData.role
              }
            });
          }
        } else {
          console.log("❌ Utilisateur NON sécurisé (rôle:", profileData?.role, ") - Pas de monitoring");
        }
      } catch (securityError) {
        console.error("❌ ERREUR système de sécurité:", securityError);
        console.warn("⚠️ Erreur système de sécurité (connexion autorisée):", securityError);
        // On continue même si le système de sécurité échoue
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const completeMFAValidation = () => {
    setNeedsMFAValidation(false);
  };

  const value = {
    user,
    session,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
    needsMFAValidation,
    completeMFAValidation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
