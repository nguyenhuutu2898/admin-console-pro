import React, { useState, useEffect } from 'react';
import { Search } from '../Icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  debounceMs?: number;
  label?: string;
  width?: string;
  height?: string;
  isFilter?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Tìm kiếm...",
  debounceMs = 300,
  label = "Tìm kiếm",
  width = "w-full",
  height = "h-10",
  isFilter = false,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const autoId = React.useId();
  const hasValue = localValue && localValue.length > 0;
  const shouldFloat = isFocused || hasValue;

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceMs]);

  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  // CSS dùng attribute selector để tránh vấn đề escape id có dấu `:`
  const css = `
    /* Label ontop khi focus hoặc có value */
    .search-input-${autoId}:focus + label,
    .search-input-${autoId}:not(:placeholder-shown) + label {
      font-size: 11px;
      top: -5px;
    }
    /* Màu khi focus */
    .search-input-${autoId}:focus + label { color: #2563eb; }
  `;

  return (
    <div className={`relative ${width} ${height}`}>
      <input
        id={`search-${autoId}`}
        type="text"
        placeholder=" "
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`search-input-${autoId} w-full ${height} px-3 py-2 bg-transparent border border-[#ccc] rounded-md text-sm text-gray-800 focus:border-blue-600 focus:outline-none pl-10`}
        autoComplete="off"
      />
      
      <label
        className={`absolute z-10 cursor-text pointer-events-none ${
          isFilter ? "top-[11px]" : "top-[13px]"
        } left-[10px] text-[12px] font-bold text-[#999] bg-white px-[10px] transition-all duration-300 ease-linear`}
      >
        {label}
      </label>

      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      
      <style>{css}</style>
    </div>
  );
};