
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { performanceOptimizer } from "@/utils/performanceOptimizer";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
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
      
      // ✅ PERFORMANCE - Initialiser l'optimiseur avec le rôle utilisateur
      if (data?.role) {
        requestIdleCallback(() => {
          performanceOptimizer.initialize(data.role);
        });
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
    }

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
