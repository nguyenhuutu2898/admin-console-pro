import * as React from "react";

import { cn } from "../../lib/utils";
import { formatPartsToLocalISOString, parseLocalDateTime } from "../../lib/datetime";
import { Input } from "./Input";

const HOURS = Array.from({ length: 24 }, (_, index) => index.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, index) => index.toString().padStart(2, "0"));

export interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  showTime?: boolean;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  dateLabel?: string;
  hourLabel?: string;
  minuteLabel?: string;
  dateInputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">;
  hourSelectProps?: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">;
  minuteSelectProps?: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">;
}

function getInitialState(value?: string | null, fallback?: string | null) {
  const parsed = parseLocalDateTime(value ?? fallback ?? undefined);

  if (!parsed) {
    return {
      date: "",
      hour: "00",
      minute: "00",
    };
  }

  return {
    date: parsed.date,
    hour: parsed.hour ?? "00",
    minute: parsed.minute ?? "00",
  };
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      defaultValue = null,
      onChange,
      showTime = false,
      minDate,
      maxDate,
      disabled = false,
      className,
      dateLabel = "Date",
      hourLabel = "Hours",
      minuteLabel = "Minutes",
      dateInputProps,
      hourSelectProps,
      minuteSelectProps,
      ...rest
    },
    ref,
  ) => {
    const [state, setState] = React.useState(() => getInitialState(value, defaultValue));

    const { className: hourSelectClassName, ...hourSelectRest } = hourSelectProps ?? {};
    const { className: minuteSelectClassName, ...minuteSelectRest } = minuteSelectProps ?? {};

    React.useEffect(() => {
      if (value === undefined) {
        return;
      }

      setState(getInitialState(value, defaultValue));
    }, [value, defaultValue]);

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextDate = event.target.value;
      setState((prev) => ({ ...prev, date: nextDate }));

      if (!nextDate) {
        onChange?.(null);
        return;
      }

      if (!showTime) {
        onChange?.(nextDate);
        return;
      }

      const next = formatPartsToLocalISOString(nextDate, state.hour, state.minute);
      if (next) {
        onChange?.(next);
      }
    };

    const handleHourChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextHour = event.target.value;
      setState((prev) => ({ ...prev, hour: nextHour }));

      if (!state.date) {
        return;
      }

      const next = formatPartsToLocalISOString(state.date, nextHour, state.minute);
      if (next) {
        onChange?.(next);
      }
    };

    const handleMinuteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextMinute = event.target.value;
      setState((prev) => ({ ...prev, minute: nextMinute }));

      if (!state.date) {
        return;
      }

      const next = formatPartsToLocalISOString(state.date, state.hour, nextMinute);
      if (next) {
        onChange?.(next);
      }
    };

    return (
      <div ref={ref} className={cn("flex gap-3 items-start", className)} {...rest}>
        <Input
          type="date"
          value={state.date}
          onChange={handleDateChange}
          aria-label={dateLabel}
          min={minDate}
          max={maxDate}
          disabled={disabled}
          {...dateInputProps}
        />
        {showTime ? (
          <div className="flex gap-2" aria-label="Time selection">
            <select
              value={state.hour}
              onChange={handleHourChange}
              aria-label={hourLabel}
              disabled={disabled || !state.date}
              className={cn(
                "h-28 w-16 min-w-14 rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-y-auto",
                hourSelectClassName,
              )}
              {...hourSelectRest}
            >
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
            <select
              value={state.minute}
              onChange={handleMinuteChange}
              aria-label={minuteLabel}
              disabled={disabled || !state.date}
              className={cn(
                "h-28 w-16 min-w-14 rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-y-auto",
                minuteSelectClassName,
              )}
              {...minuteSelectRest}
            >
              {MINUTES.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    );
  },
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
