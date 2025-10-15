import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { updateSettingsSection } from '../store/features/settingsSlice';

interface IViewContext {
  projectView: 'grid' | 'list';
  sourceView: 'grid' | 'list';
  itemsPerPage: number;
  setProjectView: (view: 'grid' | 'list') => void;
  setSourceView: (view: 'grid' | 'list') => void;
  setItemsPerPage: (count: number) => void;
}

const ViewContext = createContext<IViewContext | undefined>(undefined);

export const ViewProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSelector((state: RootState) => state.settings);

  const projectView = settings?.application?.defaultProjectView || 'grid';
  const sourceView = settings?.application?.defaultSourceView || 'grid';
  const itemsPerPage = settings?.application?.itemsPerPage || 12;

  const setProjectView = (view: 'grid' | 'list') => {
    dispatch(
      updateSettingsSection({
        section: 'application',
        data: { defaultProjectView: view },
      })
    );
  };

  const setSourceView = (view: 'grid' | 'list') => {
    dispatch(
      updateSettingsSection({
        section: 'application',
        data: { defaultSourceView: view },
      })
    );
  };

  const setItemsPerPage = (count: number) => {
    dispatch(
      updateSettingsSection({
        section: 'application',
        data: { itemsPerPage: count },
      })
    );
  };

  const value = {
    projectView,
    sourceView,
    itemsPerPage,
    setProjectView,
    setSourceView,
    setItemsPerPage,
  };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};
