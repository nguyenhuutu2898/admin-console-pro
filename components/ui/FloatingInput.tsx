import * as React from "react";
import { cn } from "../../lib/utils";

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  infoIcon?: boolean;
  isFilter?: boolean;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  infoIcon = false,
  className,
  id,
  required,
  isFilter = false,
  ...props
}) => {
  const autoId = React.useId();
  const inputId = id ?? autoId;

  // CSS dùng attribute selector để tránh vấn đề escape id có dấu `:`
  const css = `
    /* Label ontop khi focus hoặc có text */
    input[id="${inputId}"]:focus + label,
    input[id="${inputId}"]:not(:placeholder-shown) + label {
      font-size: 11px;
      top: -5px;
    }
    /* Màu khi focus */
    input[id="${inputId}"]:focus + label { color: #2563eb; }

    /* Icon chỉ hiện khi label ontop (focus/has text) */
    input[id="${inputId}"]:focus + label .info-icon,
    input[id="${inputId}"]:not(:placeholder-shown) + label .info-icon {
      display: inline-block;
    }

    ${
      required
        ? `
      /* Nếu required: thêm :valid để giữ ontop khi có value */
      input[id="${inputId}"]:valid + label {
        font-size: 11px;
        top: -5px;
      }
      input[id="${inputId}"]:valid + label .info-icon {
        display: inline-block;
      }
    `
        : ""
    }
  `;

  return (
    <div className="relative mb-3">
      <input
        id={inputId}
        placeholder=" "
        required={required}
        autoComplete="off"
        {...props}
        className={cn(
          "block w-full h-12 bg-transparent rounded-md", // 48px
          "border border-[#ccc] px-4",
          "transition-all duration-300 ease-linear",
          "focus:border-blue-600",
          className
        )}
      />

      <label
        htmlFor={inputId}
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
          // KHÔNG dùng inline style nữa
          <span className="info-icon ml-1 text-[10px] text-blue-600 align-middle hidden">
            ⓘ
          </span>
        )}
      </label>

      <style>{css}</style>
    </div>
  );
};
