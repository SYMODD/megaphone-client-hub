// 🔐 Utilitaire d'enregistrement des événements de sécurité
import { supabase } from "@/integrations/supabase/client";

interface SecurityEventData {
  action?: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: any;
}

// 🔒 Enregistrer un événement de sécurité
export const logSecurityEvent = async (
  userId: string, 
  eventType: 'login' | 'failed_login' | 'device_detected' | 'mfa_enabled' | 'mfa_disabled',
  details: SecurityEventData = {}
) => {
  try {
    console.log('🔐 Enregistrement événement sécurité:', eventType, 'pour utilisateur:', userId);
    
    // Collecter des informations sur l'appareil/connexion
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...details.device_info
    };
    
    const { error } = await supabase
      .from('security_events')
      .insert([{
        user_id: userId,
        event_type: eventType,
        ip_address: details.ip_address || '127.0.0.1', // IP par défaut
        user_agent: details.user_agent || navigator.userAgent,
        metadata: {
          action: details.action || eventType,
          device_info: deviceInfo,
          timestamp: new Date().toISOString()
        }
      }]);
    
    if (error) {
      console.warn('⚠️ Erreur enregistrement événement sécurité:', error.message);
    } else {
      console.log('✅ Événement sécurité enregistré avec succès');
    }
  } catch (error) {
    console.warn('⚠️ Erreur lors de l\'enregistrement de sécurité:', error);
  }
};

// 🕵️ Détecter si c'est un nouvel appareil (simplifié)
export const detectNewDevice = async (userId: string): Promise<boolean> => {
  try {
    const currentFingerprint = generateDeviceFingerprint();
    
    // Vérifier les dernières connexions pour cet utilisateur
    const { data: recentEvents, error } = await supabase
      .from('security_events')
      .select('metadata')
      .eq('user_id', userId)
      .eq('event_type', 'login')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.warn('⚠️ Erreur vérification historique appareils:', error);
      return false; // En cas d'erreur, on ne bloque pas
    }
    
    // Chercher si un fingerprint similaire existe
    const deviceExists = recentEvents?.some(event => {
      const deviceInfo = event.metadata?.device_info;
      if (!deviceInfo) return false;
      
      // Comparaison simple basée sur userAgent et screenSize
      return deviceInfo.userAgent === currentFingerprint.userAgent &&
             deviceInfo.screenSize === currentFingerprint.screenSize &&
             deviceInfo.platform === currentFingerprint.platform;
    });
    
    return !deviceExists;
  } catch (error) {
    console.warn('⚠️ Erreur détection nouvel appareil:', error);
    return false;
  }
};

// 🖥️ Générer un fingerprint de l'appareil
const generateDeviceFingerprint = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenSize: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: screen.colorDepth,
    cookieEnabled: navigator.cookieEnabled
  };
};

// 🚨 Déclencher une alerte de sécurité
export const triggerSecurityAlert = async (userId: string, alertType: string, details: any = {}) => {
  try {
    console.log('🚨 Alerte sécurité:', alertType, 'pour utilisateur:', userId);
    
    await logSecurityEvent(userId, 'device_detected', {
      action: `security_alert_${alertType}`,
      device_info: {
        alert_type: alertType,
        details,
        triggered_at: new Date().toISOString()
      }
    });
    
    // TODO: Ici on pourrait ajouter d'autres actions comme :
    // - Envoyer un email de notification
    // - Forcer une vérification MFA
    // - Bloquer temporairement le compte
    
  } catch (error) {
    console.warn('⚠️ Erreur déclenchement alerte sécurité:', error);
  }
}; 