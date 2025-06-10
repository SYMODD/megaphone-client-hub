
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
      console.error('Captcha token manquant');
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
      console.error('Clé secrète reCAPTCHA non configurée');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration CAPTCHA manquante' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔒 Vérification CAPTCHA en cours...');
    
    // Vérification auprès de Google reCAPTCHA
    const verificationResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${captchaToken}`,
    });

    const verificationResult = await verificationResponse.json();
    
    console.log('🔍 Résultat vérification CAPTCHA:', {
      success: verificationResult.success,
      score: verificationResult.score,
      action: verificationResult.action
    });

    if (verificationResult.success) {
      // Pour reCAPTCHA v3, vérifier le score (optionnel)
      const minScore = 0.5;
      if (verificationResult.score && verificationResult.score < minScore) {
        console.warn(`⚠️ Score CAPTCHA trop bas: ${verificationResult.score}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Score de sécurité insuffisant',
            score: verificationResult.score 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
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
      console.error('❌ Échec vérification CAPTCHA:', verificationResult['error-codes']);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Échec de la vérification CAPTCHA',
          details: verificationResult['error-codes']
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('🚨 Erreur lors de la vérification CAPTCHA:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erreur interne lors de la vérification CAPTCHA'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
