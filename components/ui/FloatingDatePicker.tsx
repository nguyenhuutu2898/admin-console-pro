import * as React from "react";
import { cn } from "../../lib/utils";
import { CustomDatePicker } from "./CustomDatePicker";

interface FloatingDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  infoIcon?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

export const FloatingDatePicker: React.FC<FloatingDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Chọn ngày...",
  infoIcon = false,
  required = false,
  disabled = false,
  className,
  min,
  max,
}) => {
  const autoId = React.useId();
  const [isFocused, setIsFocused] = React.useState(false);
  const hasValue = value && value.length > 0;
  const shouldFloat = isFocused || hasValue;

  // CSS dùng attribute selector để tránh vấn đề escape id có dấu `:`
  const css = `
    /* Label ontop khi focus hoặc có value */
    .custom-datepicker-${autoId}:focus-within + label,
    .custom-datepicker-${autoId}.has-value + label {
      font-size: 11px;
      top: -5px;
    }
    /* Màu khi focus */
    .custom-datepicker-${autoId}:focus-within + label { color: #2563eb; }

    /* Icon chỉ hiện khi label ontop (focus/has value) */
    .custom-datepicker-${autoId}:focus-within + label .info-icon,
    .custom-datepicker-${autoId}.has-value + label .info-icon {
      display: inline-block;
    }
  `;

  return (
    <div className="relative mb-3">
      <div 
        className={cn(
          "custom-datepicker-" + autoId,
          hasValue && "has-value"
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <CustomDatePicker
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full"
          min={min}
          max={max}
        />
      </div>

      <label
        className={cn(
          "absolute z-10 cursor-text pointer-events-none",
          "top-[13px] left-[10px] text-[12px] font-bold",
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
