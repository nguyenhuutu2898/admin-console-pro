import { useState, useCallback } from 'react';

interface UseFormDataOptions<T> {
  initialData: T;
  resetOnClose?: boolean;
}

interface UseFormDataReturn<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  resetForm: () => void;
  setFormDataFromItem: (item: T) => void;
}

export const useFormData = <T extends Record<string, any>>(
  options: UseFormDataOptions<T>
): UseFormDataReturn<T> => {
  const { initialData, resetOnClose = true } = options;
  
  const [formData, setFormData] = useState<T>(initialData);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  const setFormDataFromItem = useCallback((item: T) => {
    setFormData(item);
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
    setFormDataFromItem
  };
};
