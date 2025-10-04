import * as React from "react";
import { cn } from "../../lib/utils";
import { CustomDropdown } from "./CustomDropdown";

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FloatingSelectProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  infoIcon?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  height?: string;
  isFilter?: boolean;
}

export const FloatingSelect: React.FC<FloatingSelectProps> = ({
  label,
  options,
  value,
  onChange,
  infoIcon = false,
  required = false,
  disabled = false,
  className,
  height = 'h-12',
  isFilter = false,
}) => {
  const autoId = React.useId();
  const [isFocused, setIsFocused] = React.useState(false);
  const hasValue = value && value.length > 0;
  const shouldFloat = isFocused || hasValue;

  // CSS dùng attribute selector để tránh vấn đề escape id có dấu `:`
  const css = `
    /* Label ontop khi focus hoặc có value */
    .custom-dropdown-${autoId}:focus-within + label,
    .custom-dropdown-${autoId}.has-value + label {
      font-size: 11px;
      top: -5px;
    }
    /* Màu khi focus */
    .custom-dropdown-${autoId}:focus-within + label { color: #2563eb; }
    
    /* Màu và background khi disabled */
    .custom-dropdown-${autoId}.disabled + label { 
      color: #d1d5db; 
      background-color: #e5e7eb;
    }
    .custom-dropdown-${autoId}.disabled.has-value + label { 
      color: #d1d5db; 
      background-color: #e5e7eb;
    }

    /* Icon chỉ hiện khi label ontop (focus/has value) */
    .custom-dropdown-${autoId}:focus-within + label .info-icon,
    .custom-dropdown-${autoId}.has-value + label .info-icon {
      display: inline-block;
    }
  `;

  return (
    <div className={`relative ${height} ${className}`}>
      <div 
        className={cn(
          "custom-dropdown-" + autoId,
          hasValue && "has-value",
          disabled && "disabled"
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <CustomDropdown
          options={options}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${height}`}
          height={height}
        />
      </div>

      <label
        className={cn(
          "absolute z-10 cursor-text pointer-events-none",
          `${
            isFilter ? "top-[11px]" : "top-[13px]"
          } left-[10px] text-[12px] font-bold`,
          "text-[#999] bg-white px-[10px]",
          "transition-all duration-300 ease-linear"
        )}
      >
        {label}
        {infoIcon && (
          <span className="info-icon ml-1 text-[10px] text-blue-600 align-middle hidden">
            ⓘ
          </span>
        )}
      </label>

      <style>{css}</style>
    </div>
  );
};