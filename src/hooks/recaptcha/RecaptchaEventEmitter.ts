
// Event system pour synchronisation globale IMMÉDIATE
export class RecaptchaSettingsEventEmitter {
  private listeners: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    console.log('📢 [EVENT_EMITTER] Nouvel abonné, total:', this.listeners.length);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      console.log('📢 [EVENT_EMITTER] Désabonnement, restant:', this.listeners.length);
    };
  }

  emit() {
    console.log('📢 [EVENT_EMITTER] DIFFUSION IMMÉDIATE à', this.listeners.length, 'listeners');
    this.listeners.forEach((callback, index) => {
      try {
        console.log(`📢 [EVENT_EMITTER] Notification listener ${index + 1}`);
        callback();
      } catch (error) {
        console.error(`❌ [EVENT_EMITTER] Erreur listener ${index + 1}:`, error);
      }
    });
  }
}

export const recaptchaEventEmitter = new RecaptchaSettingsEventEmitter();
