import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { updateSettingsSection } from '../store/features/settingsSlice';

interface INotificationContext {
  notifications: {
    email: boolean;
    push: boolean;
    projectUpdates: boolean;
    sourceUpdates: boolean;
    systemUpdates: boolean;
  };
  setNotification: (
    type: keyof INotificationContext['notifications'],
    enabled: boolean
  ) => void;
  showNotification: (
    message: string,
    type?: 'success' | 'error' | 'warning' | 'info'
  ) => void;
}

const NotificationContext = createContext<INotificationContext | undefined>(
  undefined
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSelector((state: RootState) => state.settings);

  const notifications = settings?.general?.notifications || {
    email: true,
    push: true,
    projectUpdates: true,
    sourceUpdates: true,
    systemUpdates: true,
  };

  const setNotification = (
    type: keyof INotificationContext['notifications'],
    enabled: boolean
  ) => {
    dispatch(
      updateSettingsSection({
        section: 'general',
        data: {
          notifications: {
            ...notifications,
            [type]: enabled,
          },
        },
      })
    );
  };

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    // Only show notification if the user has enabled notifications
    if (!notifications.push) return;

    // Create custom event for notification
    const event = new CustomEvent(type, {
      detail: { message },
    });
    window.dispatchEvent(event);
  };

  const value = {
    notifications,
    setNotification,
    showNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};
