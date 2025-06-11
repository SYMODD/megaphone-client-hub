
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecaptchaRequest {
  token: string;
  action: string;
}

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔍 Validation reCAPTCHA - Début du traitement");

    // Vérifier la méthode HTTP
    if (req.method !== 'POST') {
      console.error("❌ Méthode HTTP non autorisée:", req.method);
      return new Response(
        JSON.stringify({ success: false, error: 'Méthode non autorisée' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parser le body de la requête
    const { token, action }: RecaptchaRequest = await req.json();
    
    console.log(`📝 Token reçu pour l'action: ${action}`);
    
    if (!token || !action) {
      console.error("❌ Token ou action manquant");
      return new Response(
        JSON.stringify({ success: false, error: 'Token et action requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialiser le client Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer la clé secrète reCAPTCHA depuis security_settings
    console.log("🔑 Récupération de la clé secrète reCAPTCHA");
    
    const { data: secretData, error: secretError } = await supabase
      .from('security_settings')
      .select('setting_value')
      .eq('setting_key', 'recaptcha_secret_key')
      .single();

    if (secretError || !secretData) {
      console.error("❌ Erreur récupération clé secrète:", secretError);
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration reCAPTCHA manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secretKey = secretData.setting_value;
    console.log("✅ Clé secrète récupérée");

    // Valider le token avec l'API Google reCAPTCHA
    console.log("🌐 Validation du token avec Google reCAPTCHA API");
    
    const recaptchaData = new FormData();
    recaptchaData.append('secret', secretKey);
    recaptchaData.append('response', token);

    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: recaptchaData,
    });

    if (!recaptchaResponse.ok) {
      console.error("❌ Erreur API Google reCAPTCHA:", recaptchaResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Erreur de validation reCAPTCHA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: RecaptchaResponse = await recaptchaResponse.json();
    
    console.log("📊 Résultat validation reCAPTCHA:", {
      success: result.success,
      score: result.score,
      action: result.action,
      expectedAction: action,
      errors: result['error-codes']
    });

    // Vérifier le résultat
    if (!result.success) {
      console.error("❌ Validation reCAPTCHA échouée:", result['error-codes']);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token reCAPTCHA invalide',
          details: result['error-codes'] 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier l'action
    if (result.action !== action) {
      console.error("❌ Action reCAPTCHA incorrecte:", { expected: action, received: result.action });
      return new Response(
        JSON.stringify({ success: false, error: 'Action reCAPTCHA incorrecte' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier le score (seuil minimum de 0.5)
    const minScore = 0.5;
    if (result.score < minScore) {
      console.warn(`⚠️ Score reCAPTCHA trop bas: ${result.score} (minimum: ${minScore})`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Score de sécurité insuffisant',
          score: result.score 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Validation reCAPTCHA réussie - Score: ${result.score}`);

    // Retourner le succès avec le score
    return new Response(
      JSON.stringify({ 
        success: true, 
        score: result.score,
        action: result.action
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ Erreur inattendue dans validate-recaptcha:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erreur interne du serveur' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
