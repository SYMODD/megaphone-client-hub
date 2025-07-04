// 🔐 Système de sécurité simple et efficace pour admin/superviseur
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SecurityStats {
  totalLogins: number;
  failedAttempts: number;
  lastLogin: string | null;
  deviceCount: number;
  securityScore: number;
  mfaEnabled: boolean;
}

interface SecurityEvent {
  id: string;
  event_type: 'login' | 'failed_login' | 'device_detected';
  timestamp: string;
  details: any;
}

export const useSecuritySystem = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<SecurityStats>({
    totalLogins: 0,
    failedAttempts: 0,
    lastLogin: null,
    deviceCount: 0,
    securityScore: 65,
    mfaEnabled: false
  });
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🛡️ RÈGLE : Sécurité SEULEMENT pour admin/superviseur
  const isSecurityUser = profile?.role === 'admin' || profile?.role === 'superviseur';
  
  // 📊 Charger les statistiques de sécurité
  const loadSecurityStats = async () => {
    if (!isSecurityUser || !user?.id) {
      console.log('👤 Accès sécurité refusé - rôle:', profile?.role);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    console.log('🔐 Chargement stats sécurité pour:', user.id);
    
    try {
      // 1️⃣ Vérifier l'existence des tables
      let mfaEnabled = false;
      let eventsData: any[] = [];
      
      // Tentative de récupération du statut MFA
      try {
        const { data: mfaData, error: mfaError } = await supabase
          .from('user_mfa_status')
          .select('enabled')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (mfaError) {
          console.warn('⚠️ Table user_mfa_status introuvable ou erreur policy:', mfaError.message);
        } else {
          mfaEnabled = mfaData?.enabled || false;
          console.log('✅ Statut MFA récupéré:', mfaEnabled);
        }
      } catch (error) {
        console.warn('⚠️ Erreur récupération MFA:', error);
      }
      
      // Tentative de récupération des événements de sécurité
      try {
        const { data: securityData, error: securityError } = await supabase
          .from('security_events')
          .select('id, event_type, created_at, metadata')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (securityError) {
          console.warn('⚠️ Table security_events introuvable ou erreur policy:', securityError.message);
        } else {
          eventsData = securityData || [];
          console.log('✅ Événements sécurité récupérés:', eventsData.length);
        }
      } catch (error) {
        console.warn('⚠️ Erreur récupération événements:', error);
      }
      
      // 2️⃣ Calculer les statistiques à partir des données disponibles
      const loginEvents = eventsData.filter(e => e.event_type === 'login');
      const failedEvents = eventsData.filter(e => e.event_type === 'failed_login');
      
      // Calculer le score de sécurité
      let securityScore = 65; // Score de base
      if (failedEvents.length > 0) {
        securityScore -= Math.min(failedEvents.length * 10, 30);
      }
      if (mfaEnabled) {
        securityScore += 20;
      }
      
      // 3️⃣ Mettre à jour les stats
      setStats({
        totalLogins: loginEvents.length,
        failedAttempts: failedEvents.length,
        lastLogin: loginEvents[0]?.created_at || null,
        deviceCount: 1, // Simulé pour l'instant
        securityScore: Math.max(0, Math.min(100, securityScore)),
        mfaEnabled
      });
      
      // Transformer les événements pour l'interface
      setEvents(eventsData.map(e => ({
        id: e.id,
        event_type: e.event_type,
        timestamp: e.created_at,
        details: e.metadata || {}
      })));
      
      console.log('✅ Stats sécurité chargées avec succès');
      
    } catch (error) {
      console.error('❌ Erreur générale chargement stats sécurité:', error);
      // En cas d'erreur, garder les valeurs par défaut
    } finally {
      setLoading(false);
    }
  };
  
  // 🔐 Enregistrer un événement de sécurité
  const logSecurityEvent = async (eventType: 'login' | 'failed_login' | 'device_detected', details: any = {}) => {
    if (!isSecurityUser || !user?.id) return;
    
    try {
      console.log('📝 Enregistrement événement sécurité:', eventType);
      
      const { error } = await supabase
        .from('security_events')
        .insert([{
          user_id: user.id,
          event_type: eventType,
          ip_address: '127.0.0.1', // IP simulée
          user_agent: navigator.userAgent,
          metadata: {
            ...details,
            timestamp: new Date().toISOString()
          }
        }]);
      
      if (error) {
        console.warn('⚠️ Erreur enregistrement événement (table inexistante ?):', error.message);
      } else {
        console.log('✅ Événement sécurité enregistré');
        // Recharger les stats
        await loadSecurityStats();
      }
    } catch (error) {
      console.warn('⚠️ Erreur enregistrement événement sécurité:', error);
    }
  };

  // 🔐 Activer le MFA
  const enableMFA = async () => {
    if (!isSecurityUser || !user?.id) return false;
    
    try {
      console.log('🔐 Activation MFA pour utilisateur:', user.id);
      
      // Utiliser upsert pour gérer l'insertion ou la mise à jour
      const { error } = await supabase
        .from('user_mfa_status')
        .upsert({
          user_id: user.id,
          enabled: true,
          enrolled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('❌ Erreur activation MFA (table inexistante ou policy ?):', error.message);
        return false;
      }
      
      console.log('✅ MFA activé avec succès');
      
      // Enregistrer l'événement
      await logSecurityEvent('login', { action: 'mfa_enabled' });
      
      // Recharger les stats
      await loadSecurityStats();
      
      return true;
    } catch (error) {
      console.error('❌ Erreur activation MFA:', error);
      return false;
    }
  };

  // 🔐 Désactiver le MFA
  const disableMFA = async () => {
    if (!isSecurityUser || !user?.id) return false;
    
    try {
      console.log('🔐 Désactivation MFA pour utilisateur:', user.id);
      
      const { error } = await supabase
        .from('user_mfa_status')
        .upsert({
          user_id: user.id,
          enabled: false,
          enrolled_at: null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('❌ Erreur désactivation MFA:', error.message);
        return false;
      }
      
      console.log('✅ MFA désactivé avec succès');
      
      // Enregistrer l'événement
      await logSecurityEvent('login', { action: 'mfa_disabled' });
      
      // Recharger les stats
      await loadSecurityStats();
      
      return true;
    } catch (error) {
      console.error('❌ Erreur désactivation MFA:', error);
      return false;
    }
  };
  
  // 🚀 Initialisation
  useEffect(() => {
    if (isSecurityUser && user?.id) {
      loadSecurityStats();
    } else {
      setLoading(false);
    }
  }, [isSecurityUser, user?.id]);
  
  return {
    stats,
    events,
    loading,
    isSecurityUser,
    logSecurityEvent,
    enableMFA,
    disableMFA,
    refreshStats: loadSecurityStats
  };
}; 