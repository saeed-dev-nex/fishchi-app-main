import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

type AlertSeverity = 'success' | 'error' | 'warning' | 'info';

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertSeverity;
}

const NotificationProvider: React.FC = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    const handleNotification = (
      event: CustomEvent,
      severity: AlertSeverity
    ) => {
      const message = event.detail?.message || event.detail || 'خطایی رخ داد';
      setNotification({
        open: true,
        message,
        severity,
      });
    };

    const handleSuccess = (event: CustomEvent) =>
      handleNotification(event, 'success');
    const handleError = (event: CustomEvent) =>
      handleNotification(event, 'error');
    const handleWarning = (event: CustomEvent) =>
      handleNotification(event, 'warning');
    const handleInfo = (event: CustomEvent) =>
      handleNotification(event, 'info');

    // Add event listeners
    window.addEventListener('success', handleSuccess as EventListener);
    window.addEventListener('error', handleError as EventListener);
    window.addEventListener('warning', handleWarning as EventListener);
    window.addEventListener('info', handleInfo as EventListener);

    return () => {
      window.removeEventListener('success', handleSuccess as EventListener);
      window.removeEventListener('error', handleError as EventListener);
      window.removeEventListener('warning', handleWarning as EventListener);
      window.removeEventListener('info', handleInfo as EventListener);
    };
  }, []);

  const handleClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.severity}
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationProvider;
