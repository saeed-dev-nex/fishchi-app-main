import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { updateSettingsSection } from '../store/features/settingsSlice';

interface IPrivacyContext {
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showProjects: boolean;
    allowSearch: boolean;
    dataSharing: {
      analytics: boolean;
      marketing: boolean;
    };
  };
  setPrivacySetting: (
    key: keyof IPrivacyContext['privacySettings'],
    value: any
  ) => void;
  setDataSharingSetting: (
    key: keyof IPrivacyContext['privacySettings']['dataSharing'],
    value: boolean
  ) => void;
}

const PrivacyContext = createContext<IPrivacyContext | undefined>(undefined);

export const PrivacyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSelector((state: RootState) => state.settings);

  const privacySettings = settings?.privacy || {
    profileVisibility: 'private',
    showEmail: false,
    showProjects: true,
    allowSearch: true,
    dataSharing: {
      analytics: true,
      marketing: false,
    },
  };

  const setPrivacySetting = (
    key: keyof IPrivacyContext['privacySettings'],
    value: any
  ) => {
    dispatch(
      updateSettingsSection({
        section: 'privacy',
        data: {
          ...privacySettings,
          [key]: value,
        },
      })
    );
  };

  const setDataSharingSetting = (
    key: keyof IPrivacyContext['privacySettings']['dataSharing'],
    value: boolean
  ) => {
    dispatch(
      updateSettingsSection({
        section: 'privacy',
        data: {
          ...privacySettings,
          dataSharing: {
            ...privacySettings.dataSharing,
            [key]: value,
          },
        },
      })
    );
  };

  const value = {
    privacySettings,
    setPrivacySetting,
    setDataSharingSetting,
  };

  return (
    <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>
  );
};

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
