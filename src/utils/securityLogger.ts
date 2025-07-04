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

// 🕵️ Détecter si c'est un nouvel appareil (CORRIGÉ)
export const detectNewDevice = async (userId: string): Promise<boolean> => {
  try {
    console.log('🔍 DÉBUT détection nouvel appareil pour:', userId);
    
    const currentFingerprint = generateDeviceFingerprint();
    console.log('🖥️ Fingerprint actuel:', currentFingerprint);
    
    // ✅ CORRECTION: Chercher TOUS les événements, pas seulement 'login'
    const { data: recentEvents, error } = await supabase
      .from('security_events')
      .select('metadata, event_type, created_at')
      .eq('user_id', userId)
      .in('event_type', ['login', 'device_detected']) // Chercher login ET device_detected
      .order('created_at', { ascending: false })
      .limit(20); // Plus d'événements pour être sûr
    
    console.log('📊 Événements trouvés:', recentEvents?.length || 0);
    
    if (error) {
      console.warn('⚠️ Erreur vérification historique appareils:', error);
      // ✅ CORRECTION: En cas d'erreur, considérer comme nouvel appareil
      console.log('❌ Erreur DB → Traiter comme NOUVEL APPAREIL par sécurité');
      return true;
    }
    
    if (!recentEvents || recentEvents.length === 0) {
      // ✅ CORRECTION: Aucun événement trouvé = premier appareil = nouvel appareil
      console.log('🆕 Aucun événement trouvé → PREMIER APPAREIL = NOUVEL APPAREIL');
      return true;
    }
    
    // Chercher si un fingerprint similaire existe
    let deviceFound = false;
    
    for (const event of recentEvents) {
      const deviceInfo = event.metadata?.device_info;
      if (!deviceInfo) continue;
      
      console.log('🔍 Comparaison avec événement:', {
        type: event.event_type,
        date: event.created_at,
        stored_userAgent: deviceInfo.userAgent?.substring(0, 50) + '...',
        stored_screenSize: deviceInfo.screenSize,
        stored_platform: deviceInfo.platform,
        current_userAgent: currentFingerprint.userAgent?.substring(0, 50) + '...',
        current_screenSize: currentFingerprint.screenSize,
        current_platform: currentFingerprint.platform
      });
      
      // Comparaison stricte
      if (deviceInfo.userAgent === currentFingerprint.userAgent &&
          deviceInfo.screenSize === currentFingerprint.screenSize &&
          deviceInfo.platform === currentFingerprint.platform) {
        console.log('✅ APPAREIL CONNU trouvé dans événement:', event.event_type);
        deviceFound = true;
        break;
      }
    }
    
    const isNewDevice = !deviceFound;
    console.log('🎯 RÉSULTAT détection:', isNewDevice ? '🚨 NOUVEL APPAREIL' : '✅ APPAREIL CONNU');
    
    return isNewDevice;
    
  } catch (error) {
    console.error('❌ Erreur détection nouvel appareil:', error);
    // ✅ CORRECTION: En cas d'erreur, traiter comme nouvel appareil par sécurité
    console.log('❌ Exception → Traiter comme NOUVEL APPAREIL par sécurité');
    return true;
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