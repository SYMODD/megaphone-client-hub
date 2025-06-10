
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { captchaToken } = await req.json();
    
    if (!captchaToken) {
      console.error('❌ Token CAPTCHA manquant');
      return new Response(
        JSON.stringify({ success: false, error: 'Token CAPTCHA manquant' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
    if (!secretKey) {
      console.error('❌ Clé secrète reCAPTCHA non configurée');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration CAPTCHA manquante' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔒 Début de la vérification CAPTCHA...');
    
    // Vérification auprès de Google reCAPTCHA
    const verificationResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${captchaToken}`,
    });

    if (!verificationResponse.ok) {
      console.error('❌ Erreur HTTP lors de la vérification:', verificationResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Erreur de communication avec le service CAPTCHA' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const verificationResult = await verificationResponse.json();
    
    console.log('🔍 Résultat brut de la vérification CAPTCHA:', {
      success: verificationResult.success,
      score: verificationResult.score,
      action: verificationResult.action,
      challenge_ts: verificationResult.challenge_ts,
      hostname: verificationResult.hostname,
      'error-codes': verificationResult['error-codes']
    });

    if (verificationResult.success) {
      // Pour reCAPTCHA v3, vérifier le score si disponible
      const minScore = 0.5;
      if (verificationResult.score !== undefined) {
        if (verificationResult.score < minScore) {
          console.warn(`⚠️ Score CAPTCHA trop bas: ${verificationResult.score} < ${minScore}`);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Score de sécurité insuffisant. Veuillez réessayer.',
              score: verificationResult.score 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        console.log(`✅ Score CAPTCHA acceptable: ${verificationResult.score}`);
      }

      console.log('✅ CAPTCHA vérifié avec succès');
      return new Response(
        JSON.stringify({ 
          success: true, 
          score: verificationResult.score,
          message: 'CAPTCHA vérifié avec succès'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      const errorCodes = verificationResult['error-codes'] || [];
      console.error('❌ Échec vérification CAPTCHA. Codes d\'erreur:', errorCodes);
      
      // Messages d'erreur plus clairs selon les codes d'erreur
      let errorMessage = 'Échec de la vérification CAPTCHA';
      if (errorCodes.includes('timeout-or-duplicate')) {
        errorMessage = 'Token CAPTCHA expiré ou déjà utilisé. Veuillez réessayer.';
      } else if (errorCodes.includes('invalid-input-response')) {
        errorMessage = 'Réponse CAPTCHA invalide. Veuillez réessayer.';
      } else if (errorCodes.includes('missing-input-response')) {
        errorMessage = 'Aucune réponse CAPTCHA fournie.';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: errorCodes
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('🚨 Erreur critique lors de la vérification CAPTCHA:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erreur interne du serveur lors de la vérification CAPTCHA'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
