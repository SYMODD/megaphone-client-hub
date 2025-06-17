
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
  profileLoading: boolean;
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
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("🔍 [AUTH] Fetching profile for user", userId);
      setProfileLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

        console.log("data=========0", data)

      if (error) {
        if (error.code === "PGRST116") {
          console.log("⚠️ [AUTH] Profile not found for user:", userId);
          setProfile(null);
        } else {
          console.error("❌ [AUTH] Error fetching profile:", error);
          setProfile(null);
        }
        return;
      }

      console.log("✅ [AUTH] Profile fetched successfully:", {
        userId: data.id,
        role: data.role,
        nom: data.nom,
        prenom: data.prenom,
        statut: data.statut
      });
      
      setProfile(data);
    } catch (error) {
      console.error("❌ [AUTH] Exception fetching profile:", error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("🚀 [AUTH] AuthProvider initializing...");

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("🔄 [AUTH] Auth state changed:", {
          event,
          userId: session?.user?.id,
          hasSession: !!session,
          timestamp: new Date().toISOString()
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && mounted) {
          // Fetch profile immediately when user is authenticated
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log("🔍 [AUTH] Checking for existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // if (error) {
        //   console.error("❌ [AUTH] Error getting session:", error);
        // }
        
        // if (!mounted) return;
        
        // console.log("📋 [AUTH] Initial session check:", {
        //   hasSession: !!session,
        //   userId: session?.user?.id,
        //   timestamp: new Date().toISOString()
        // });
        
        // setSession(session);
        // setUser(session?.user ?? null);
        
        // if (session?.user) {
        //   await fetchProfile(session.user.id);
        // } else {
        //   setProfileLoading(false);
        // }
        
        // setLoading(false);
      } catch (error) {
        console.error("❌ [AUTH] Exception during auth initialization:", error);
        if (mounted) {
          setLoading(false);
          setProfileLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log("🔄 [AUTH] AuthProvider cleanup");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata: any) => {
    console.log("📝 [AUTH] Sign up attempt for:", email);
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (error) {
      console.error("❌ [AUTH] Sign up error:", error);
    } else {
      console.log("✅ [AUTH] Sign up successful for:", email);
    }
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    console.log("🔐 [AUTH] Sign in attempt for:", normalizedEmail);
    
    // Première vérification : l'utilisateur existe-t-il dans auth.users ?
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    console.log("🔐 [AUTH] Supabase auth response:", { 
      hasData: !!data, 
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      userId: data?.user?.id,
      errorCode: error?.code,
      errorMessage: error?.message
    });

    if (error) {
      console.error("❌ [AUTH] Sign in error:", error);
      return { data, error };
    }

    // Si l'authentification réussit, vérifier le statut dans profiles
    if (data.user) {
      console.log("✅ [AUTH] Auth successful, checking user status in profiles...");
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("statut, nom, prenom, role")
        .eq("id", data.user.id)
        .single();

      console.log("📋 [AUTH] Profile check result:", { 
        profileData, 
        profileError: profileError?.code 
      });

      if (profileError && profileError.code !== "PGRST116") {
        console.error("❌ [AUTH] Error checking user status:", profileError);
        return { data, error: profileError };
      }

      if (profileData && profileData.statut === "inactif") {
        console.log("⚠️ [AUTH] User account is inactive");
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
      
      console.log("✅ [AUTH] User is active, login successful");
    }

    return { data, error };
  };

  const signOut = async () => {
    console.log("🚪 [AUTH] Sign out initiated");
    setProfile(null);
    setProfileLoading(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("❌ [AUTH] Sign out error:", error);
      throw error;
    }
    console.log("✅ [AUTH] Sign out successful");
  };

  const value = {
    user,
    session,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
    profileLoading,
  };

  console.log("🎯 [AUTH] Current auth state:", {
    hasUser: !!user,
    hasProfile: !!profile,
    userRole: profile?.role,
    loading,
    profileLoading,
    timestamp: new Date().toISOString()
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
