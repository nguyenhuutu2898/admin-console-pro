import * as React from "react";
import { cn } from "../../lib/utils";

interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
  infoIcon?: boolean;
}

export const FloatingSelect: React.FC<FloatingSelectProps> = ({
  label,
  className,
  value,
  children,
  infoIcon = false,
  id,
  required,
  ...props
}) => {
  const autoId = React.useId();
  const selectId = id ?? autoId;

  // CSS dùng attribute selector để tránh vấn đề escape id có dấu `:`
  const css = `
    /* Label ontop khi focus hoặc có value */
    select[id="${selectId}"]:focus + label,
    select[id="${selectId}"]:valid + label {
      font-size: 11px;
      top: -5px;
    }
    /* Màu khi focus */
    select[id="${selectId}"]:focus + label { color: #2563eb; }

    /* Icon chỉ hiện khi label ontop (focus/has value) */
    select[id="${selectId}"]:focus + label .info-icon,
    select[id="${selectId}"]:valid + label .info-icon {
      display: inline-block;
    }

    ${required ? `
      /* Nếu required: thêm :valid để giữ ontop khi có value */
      select[id="${selectId}"]:valid + label {
        font-size: 11px;
        top: -5px;
      }
      select[id="${selectId}"]:valid + label .info-icon {
        display: inline-block;
      }
    ` : ""}
  `;

  return (
    <div className="relative mb-3">
      <select
        id={selectId}
        required={required}
        {...props}
        value={value}
        className={cn(
          "block w-full h-12 bg-transparent rounded-md", // 48px
          "border border-[#ccc] px-4 appearance-none cursor-pointer",
          "transition-all duration-300 ease-linear",
          "focus:border-blue-600",
          className
        )}
      >
        {children}
      </select>

      <label
        htmlFor={selectId}
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

      {/* Custom dropdown arrow */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <style>{css}</style>
    </div>
  );
};
