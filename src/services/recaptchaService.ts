
import { toast } from 'sonner';

interface RecaptchaVerificationResult {
  success: boolean;
  score?: number;
  action?: string;
  error?: string;
}

class RecaptchaService {
  private isScriptLoaded = false;
  private scriptPromise: Promise<void> | null = null;

  async loadRecaptchaScript(siteKey: string): Promise<void> {
    if (this.isScriptLoaded) {
      return Promise.resolve();
    }

    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    this.scriptPromise = new Promise((resolve, reject) => {
      try {
        // Vérifier si le script existe déjà
        const existingScript = document.querySelector('script[src*="recaptcha"]');
        if (existingScript) {
          this.isScriptLoaded = true;
          resolve();
          return;
        }

        // Créer et injecter le script reCAPTCHA de production
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log('✅ Production reCAPTCHA script loaded successfully');
          this.isScriptLoaded = true;
          resolve();
        };

        script.onerror = () => {
          console.error('❌ Failed to load production reCAPTCHA script');
          reject(new Error('Failed to load reCAPTCHA script'));
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('❌ Error loading production reCAPTCHA script:', error);
        reject(error);
      }
    });

    return this.scriptPromise;
  }

  async executeRecaptcha(siteKey: string, action: string): Promise<string> {
    try {
      console.log(`🔍 [PRODUCTION] Executing reCAPTCHA for action: ${action}`);
      
      // S'assurer que le script est chargé
      await this.loadRecaptchaScript(siteKey);

      // Attendre que grecaptcha soit disponible
      await this.waitForGrecaptcha();

      // Exécuter reCAPTCHA en production
      const token = await window.grecaptcha.execute(siteKey, { action });
      
      console.log(`✅ [PRODUCTION] reCAPTCHA token generated for action: ${action}`);
      return token;
    } catch (error) {
      console.error(`❌ [PRODUCTION] Error executing reCAPTCHA for action ${action}:`, error);
      throw new Error(`Erreur reCAPTCHA production: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  private waitForGrecaptcha(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 secondes max

      const checkGrecaptcha = () => {
        if (window.grecaptcha && window.grecaptcha.execute) {
          resolve();
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('reCAPTCHA not loaded after 5 seconds'));
          return;
        }

        setTimeout(checkGrecaptcha, 100);
      };

      checkGrecaptcha();
    });
  }

  async verifyToken(token: string, secretKey: string): Promise<RecaptchaVerificationResult> {
    try {
      console.log('🔍 [PRODUCTION] Verifying reCAPTCHA token...');
      
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token
        })
      });

      const result = await response.json();
      
      console.log('✅ [PRODUCTION] reCAPTCHA verification result:', {
        success: result.success,
        score: result.score,
        action: result.action,
        environment: 'PRODUCTION'
      });

      return {
        success: result.success,
        score: result.score,
        action: result.action,
        error: result.success ? undefined : 'Token invalide'
      };
    } catch (error) {
      console.error('❌ [PRODUCTION] Error verifying reCAPTCHA token:', error);
      return {
        success: false,
        error: 'Erreur de vérification'
      };
    }
  }

  resetRecaptcha() {
    if (window.grecaptcha && window.grecaptcha.reset) {
      window.grecaptcha.reset();
    }
  }
}

// Étendre l'interface Window pour inclure grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      reset: () => void;
    };
  }
}

export const recaptchaService = new RecaptchaService();
