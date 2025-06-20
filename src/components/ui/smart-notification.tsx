import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SmartNotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // en millisecondes, défaut 1000ms
  onDismiss: (id: string) => void;
  className?: string;
}

export const SmartNotification: React.FC<SmartNotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 1000,
  onDismiss,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss(id);
    }, 300); // Temps pour l'animation de sortie
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'info':
        return 'notification-info';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'notification-smart',
        getTypeClasses(),
        'rounded-lg p-4 shadow-xl backdrop-blur-sm border',
        isExiting ? 'fade-out' : 'notification-auto-dismiss',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1 break-words">
            {title}
          </h4>
          <p className="text-sm opacity-90 break-words leading-relaxed">
            {message}
          </p>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Fermer la notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Barre de progression */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden">
        <div 
          className="h-full bg-white/30 transition-all ease-linear animate-progress-shrink"
          style={{
            animationDuration: `${duration}ms`
          }}
        />
      </div>
    </div>
  );
};

// Hook pour gérer les notifications
export const useSmartNotifications = () => {
  const [notifications, setNotifications] = useState<SmartNotificationProps[]>([]);

  const addNotification = (notification: Omit<SmartNotificationProps, 'id' | 'onDismiss'>) => {
    const id = Date.now().toString();
    const newNotification: SmartNotificationProps = {
      ...notification,
      id,
      onDismiss: removeNotification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const showSuccess = (title: string, message: string, duration?: number) => 
    addNotification({ type: 'success', title, message, duration });

  const showError = (title: string, message: string, duration?: number) => 
    addNotification({ type: 'error', title, message, duration });

  const showWarning = (title: string, message: string, duration?: number) => 
    addNotification({ type: 'warning', title, message, duration });

  const showInfo = (title: string, message: string, duration?: number) => 
    addNotification({ type: 'info', title, message, duration });

  const clearAll = () => setNotifications([]);

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
    removeNotification
  };
};

// Conteneur pour les notifications
export const SmartNotificationContainer: React.FC<{ notifications: SmartNotificationProps[] }> = ({ 
  notifications 
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col gap-2 pt-24 lg:pt-4 px-2 lg:px-4">
        {notifications.map((notification) => (
          <SmartNotification
            key={notification.id}
            {...notification}
          />
        ))}
      </div>
    </div>
  );
}; 