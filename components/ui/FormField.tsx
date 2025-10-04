import React from 'react';
import { Label } from './Label';
import { Input } from './Input';
import { Select } from './Select';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'select' | 'textarea' | 'number' | 'multiselect';
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: { value: string; label: string }[];
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options,
  disabled = false,
}) => {
  const renderInput = (): React.ReactNode => {
    if (type === 'select') {
      return (
        <Select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">Chọn {label.toLowerCase()}</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    }

    if (type === 'multiselect') {
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          <Select
            value=""
            onChange={(e) => {
              if (e.target.value && !selectedValues.includes(e.target.value)) {
                onChange([...selectedValues, e.target.value]);
              }
            }}
            disabled={disabled}
          >
            <option value="">Chọn {label.toLowerCase()}</option>
            {options?.filter(option => !selectedValues.includes(option.value)).map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedValues.map(selectedValue => {
                const option = options?.find(opt => opt.value === selectedValue);
                return (
                  <span
                    key={selectedValue}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    {option?.label}
                    <button
                      type="button"
                      onClick={() => onChange(selectedValues.filter(v => v !== selectedValue))}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={3}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : ''
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
      );
    }

    return (
      <Input
        type={type}
        name={name}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
      />
    );
  };

  return (
    <div className="space-y-1">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
