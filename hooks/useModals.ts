import { useState, useCallback } from 'react';

interface UseModalsOptions {
  initialStates?: Record<string, boolean>;
}

interface UseModalsReturn {
  isOpen: (modalName: string) => boolean;
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  toggleModal: (modalName: string) => void;
  closeAllModals: () => void;
}

export const useModals = (options: UseModalsOptions = {}): UseModalsReturn => {
  const { initialStates = {} } = options;
  
  const [modals, setModals] = useState<Record<string, boolean>>(initialStates);

  const isOpen = useCallback((modalName: string): boolean => {
    return modals[modalName] || false;
  }, [modals]);

  const openModal = useCallback((modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);

  const toggleModal = useCallback((modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({});
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals
  };
};
