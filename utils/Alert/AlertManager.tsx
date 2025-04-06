import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MinimalistAlert from './MinimalistAlert';

// Define the type for the context value
interface AlertContextType {
  showAlert: (options: AlertOptions) => { close: () => void; };
  removeAlert: (id: string) => void;
}

// Initialize the context with a default value
const AlertContext = createContext<AlertContextType | null>(null);

// Generate a unique ID for each alert
const generateId = () => `alert_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// Define the type for alert options
interface AlertOptions {
  type?: string;
  title?: string;
  message: string;
  duration?: number;
  autoClose?: boolean;
  id?: string;
}

// Define the type for the global show alert function
type ShowAlertFunction = (options: AlertOptions) => { close: () => void };

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertOptions[]>([]);
  const alertsRef = useRef<AlertOptions[]>([]);
  
  // Keep a synchronized ref to avoid closure issues in timeouts
  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  const showAlert = (options: AlertOptions) => {
    // Default options
    const alertOptions: AlertOptions = {
      type: 'INFO',
      title: '',
      duration: 5000,
      autoClose: true,
      ...options,
      id: generateId(),
    };

    setAlerts(currentAlerts => [...currentAlerts, alertOptions]);
    
    // Return a method to programmatically close this alert
    return {
      close: () => removeAlert(alertOptions.id!)
    };
  };

  const removeAlert = (id: string) => {
    setAlerts(currentAlerts => currentAlerts.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert, removeAlert }}>
      {children}
      <View style={styles.alertContainer} pointerEvents="box-none">
        {alerts.map(alert => (
          <MinimalistAlert
            key={alert.id}
            type={alert.type}
            title={alert.title}
            message={alert.message}
            autoClose={alert.autoClose}
            duration={alert.duration}
            onClose={() => removeAlert(alert.id!)}
          />
        ))}
      </View>
    </AlertContext.Provider>
  );
};

// Update the useAlert hook
export const useAlert = (): { showAlert: (options: AlertOptions) => void } => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Export a standalone function to show alerts (for non-component code)
let globalShowAlert: ShowAlertFunction | null = null;

export const registerAlertFunction = (showAlertFn: ShowAlertFunction) => {
  globalShowAlert = showAlertFn;
};

export function showAlert(options: AlertOptions) {
  if (!globalShowAlert) {
    console.warn('AlertProvider is not mounted yet. Make sure it wraps your app.');
    return { close: () => {} };
  }
  return globalShowAlert(options);
}

const styles = StyleSheet.create({
  alertContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
});