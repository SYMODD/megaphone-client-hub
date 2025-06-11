
import { recaptchaEventEmitter } from './RecaptchaEventEmitter';
import { forceInvalidateCache } from './RecaptchaCache';

// Export fonction pour notifier les mises à jour avec INVALIDATION FORCÉE
export const notifyRecaptchaSettingsUpdate = () => {
  console.log('📢 [NOTIFY] INVALIDATION + NOTIFICATION IMMÉDIATE');
  forceInvalidateCache();
  
  // Triple émission pour garantir la réception
  setTimeout(() => {
    console.log('📢 [NOTIFY] Émission 1/3');
    recaptchaEventEmitter.emit();
  }, 10);
  
  setTimeout(() => {
    console.log('📢 [NOTIFY] Émission 2/3');
    recaptchaEventEmitter.emit();
  }, 100);
  
  setTimeout(() => {
    console.log('📢 [NOTIFY] Émission 3/3');
    recaptchaEventEmitter.emit();
  }, 300);
};
