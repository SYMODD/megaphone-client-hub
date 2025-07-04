// 🔐 SUPABASE PRO - Edge Function pour sécurité renforcée
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';

interface SecurityRequest {
  action: 'device_check' | 'rate_limit' | 'security_event' | 'alert_check';
  userId?: string;
  userRole?: string;
  deviceInfo?: {
    fingerprint: string;
    userAgent: string;
    ip: string;
    location?: {
      country: string;
      city: string;
      region: string;
    };
  };
  eventType?: string;
  metadata?: Record<string, any>;
}

interface DeviceFingerprint {
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  userAgent: string;
  canvas: string;
  webgl: string;
  hash: string;
}

serve(async (req) => {
  // 🌐 CORS Headers pour tous les domaines
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 🔐 Initialisation Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, userRole, deviceInfo, eventType, metadata } = await req.json() as SecurityRequest;

    switch (action) {
      case 'device_check':
        return await handleDeviceCheck(supabase, userId!, userRole!, deviceInfo!, req);
      
      case 'rate_limit':
        return await handleRateLimit(supabase, deviceInfo!.ip, userId);
      
      case 'security_event':
        return await handleSecurityEvent(supabase, userId!, userRole!, eventType!, deviceInfo!, metadata);
      
      case 'alert_check':
        return await handleAlertCheck(supabase, userId!, userRole!);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Action non supportée' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('Erreur Edge Function:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// 🔍 Détection et gestion des nouveaux appareils
async function handleDeviceCheck(supabase: any, userId: string, userRole: string, deviceInfo: any, req: Request) {
  const deviceFingerprint = deviceInfo.fingerprint;
  const now = new Date().toISOString();
  
  // 🔍 Vérifier si l'appareil existe déjà
  const { data: existingDevice, error: deviceError } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', userId)
    .eq('fingerprint', deviceFingerprint)
    .single();

  if (deviceError && deviceError.code !== 'PGRST116') {
    throw new Error(`Erreur vérification appareil: ${deviceError.message}`);
  }

  let isNewDevice = !existingDevice;
  let requiresApproval = false;
  let riskScore = 0;

  // 📊 Calcul du score de risque
  if (isNewDevice) {
    riskScore += 30;
    
    // 🌍 Vérifier la localisation
    const { data: userLocations } = await supabase
      .from('user_devices')
      .select('location')
      .eq('user_id', userId)
      .not('location', 'is', null);

    if (userLocations && userLocations.length > 0) {
      const knownCountries = userLocations.map(d => d.location?.country).filter(Boolean);
      if (deviceInfo.location?.country && !knownCountries.includes(deviceInfo.location.country)) {
        riskScore += 40; // Nouveau pays
      }
    }

    // 🔐 Vérifier les rôles privilégiés
    if (['admin', 'superviseur'].includes(userRole)) {
      riskScore += 20;
      requiresApproval = true;
    }

    // 📱 Enregistrer le nouveau appareil
    const { error: insertError } = await supabase
      .from('user_devices')
      .insert({
        user_id: userId,
        fingerprint: deviceFingerprint,
        name: generateDeviceName(deviceInfo.userAgent),
        user_agent: deviceInfo.userAgent,
        ip: deviceInfo.ip,
        location: deviceInfo.location,
        first_seen: now,
        last_seen: now,
        trusted: !requiresApproval,
        approved: !requiresApproval,
        risk_score: riskScore
      });

    if (insertError) {
      throw new Error(`Erreur enregistrement appareil: ${insertError.message}`);
    }

    // 📧 Envoyer notification par email si nécessaire
    if (requiresApproval || riskScore > 50) {
      await sendNewDeviceNotification(supabase, userId, deviceInfo, riskScore);
    }

    // 🚨 Créer un événement de sécurité
    await createSecurityEvent(supabase, {
      user_id: userId,
      event_type: 'device_new',
      device_fingerprint: deviceFingerprint,
      ip_address: deviceInfo.ip,
      user_agent: deviceInfo.userAgent,
      location: deviceInfo.location,
      risk_score: riskScore,
      blocked: requiresApproval,
      metadata: {
        device_name: generateDeviceName(deviceInfo.userAgent),
        requires_approval: requiresApproval
      }
    });

  } else {
    // 🔄 Mettre à jour l'appareil existant
    await supabase
      .from('user_devices')
      .update({
        last_seen: now,
        ip: deviceInfo.ip,
        location: deviceInfo.location || existingDevice.location
      })
      .eq('id', existingDevice.id);
  }

  return new Response(
    JSON.stringify({
      isNewDevice,
      requiresApproval,
      riskScore,
      trusted: existingDevice?.trusted ?? !requiresApproval,
      approved: existingDevice?.approved ?? !requiresApproval
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// ⚡ Rate Limiting intelligent
async function handleRateLimit(supabase: any, ip: string, userId?: string) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes

  // 📊 Compter les tentatives récentes
  const { data: attempts, error } = await supabase
    .from('login_attempts')
    .select('*')
    .eq('ip_address', ip)
    .gte('created_at', windowStart.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erreur vérification rate limit: ${error.message}`);
  }

  const attemptCount = attempts?.length || 0;
  const maxAttempts = 5;
  const isBlocked = attemptCount >= maxAttempts;

  // 🚫 Vérifier si IP est bannie
  const { data: bannedIP } = await supabase
    .from('banned_ips')
    .select('*')
    .eq('ip_address', ip)
    .eq('active', true)
    .single();

  const isBanned = !!bannedIP;

  // 📝 Enregistrer cette tentative
  await supabase
    .from('login_attempts')
    .insert({
      ip_address: ip,
      user_id: userId,
      blocked: isBlocked || isBanned,
      created_at: now.toISOString()
    });

  // 🚨 Créer une alerte si trop de tentatives
  if (attemptCount >= maxAttempts - 1) {
    await createSecurityAlert(supabase, {
      type: 'rate_limit_exceeded',
      severity: 'high',
      user_id: userId,
      message: `Limite de tentatives dépassée pour IP: ${ip}`,
      details: {
        ip_address: ip,
        attempt_count: attemptCount + 1,
        window_start: windowStart.toISOString()
      }
    });
  }

  return new Response(
    JSON.stringify({
      allowed: !isBlocked && !isBanned,
      attempts: attemptCount + 1,
      maxAttempts,
      windowStart: windowStart.toISOString(),
      windowEnd: now.toISOString(),
      blocked: isBlocked,
      banned: isBanned,
      resetAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString()
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// 🔐 Gestion des événements de sécurité
async function handleSecurityEvent(supabase: any, userId: string, userRole: string, eventType: string, deviceInfo: any, metadata?: any) {
  const riskScore = calculateRiskScore(eventType, userRole, deviceInfo);
  
  await createSecurityEvent(supabase, {
    user_id: userId,
    event_type: eventType,
    device_fingerprint: deviceInfo.fingerprint,
    ip_address: deviceInfo.ip,
    user_agent: deviceInfo.userAgent,
    location: deviceInfo.location,
    risk_score: riskScore,
    blocked: false,
    metadata: metadata || {}
  });

  return new Response(
    JSON.stringify({ success: true, riskScore }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// 🚨 Vérification des alertes
async function handleAlertCheck(supabase: any, userId: string, userRole: string) {
  const { data: alerts } = await supabase
    .from('security_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('resolved', false)
    .order('created_at', { ascending: false });

  return new Response(
    JSON.stringify({ alerts: alerts || [] }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// 🛠️ Fonctions utilitaires
function generateDeviceName(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome Browser';
  if (userAgent.includes('Firefox')) return 'Firefox Browser';
  if (userAgent.includes('Safari')) return 'Safari Browser';
  if (userAgent.includes('Edge')) return 'Edge Browser';
  if (userAgent.includes('Mobile')) return 'Mobile Device';
  return 'Unknown Device';
}

function calculateRiskScore(eventType: string, userRole: string, deviceInfo: any): number {
  let score = 0;
  
  // Score de base par type d'événement
  const eventScores = {
    'login': 5,
    'login_failed': 15,
    'mfa_setup': 10,
    'mfa_disabled': 25,
    'password_change': 20,
    'device_new': 30,
    'suspicious_activity': 40
  };
  
  score += eventScores[eventType] || 10;
  
  // Bonus pour rôles privilégiés
  if (['admin', 'superviseur'].includes(userRole)) {
    score += 15;
  }
  
  return Math.min(score, 100);
}

async function createSecurityEvent(supabase: any, eventData: any) {
  const { error } = await supabase
    .from('security_events')
    .insert({
      ...eventData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Erreur création événement sécurité:', error);
  }
}

async function createSecurityAlert(supabase: any, alertData: any) {
  const { error } = await supabase
    .from('security_alerts')
    .insert({
      ...alertData,
      id: crypto.randomUUID(),
      resolved: false,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Erreur création alerte sécurité:', error);
  }
}

async function sendNewDeviceNotification(supabase: any, userId: string, deviceInfo: any, riskScore: number) {
  // 📧 Récupérer les infos utilisateur
  const { data: user } = await supabase
    .from('profiles')
    .select('nom, prenom, email')
    .eq('id', userId)
    .single();

  if (user?.email) {
    // 📨 Envoyer notification email via Supabase Edge Functions
    await supabase.functions.invoke('send-email', {
      body: {
        to: user.email,
        subject: '🔐 Nouvelle connexion détectée',
        html: `
          <h2>Nouvelle connexion détectée</h2>
          <p>Bonjour ${user.nom} ${user.prenom},</p>
          <p>Une nouvelle connexion a été détectée sur votre compte :</p>
          <ul>
            <li><strong>Appareil:</strong> ${generateDeviceName(deviceInfo.userAgent)}</li>
            <li><strong>Localisation:</strong> ${deviceInfo.location?.city || 'Inconnue'}, ${deviceInfo.location?.country || 'Inconnue'}</li>
            <li><strong>Adresse IP:</strong> ${deviceInfo.ip}</li>
            <li><strong>Score de risque:</strong> ${riskScore}/100</li>
          </ul>
          <p>Si ce n'est pas vous, veuillez contacter l'administrateur immédiatement.</p>
        `
      }
    });
  }
} 