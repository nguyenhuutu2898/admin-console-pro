import * as React from "react";

import { cn } from "../../lib/utils";
import { DatePicker, DatePickerProps } from "./DatePicker";

export interface DateRangeValue {
  start: string | null;
  end: string | null;
}

export interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  showTime?: boolean;
  disabled?: boolean;
  startDateLabel?: string;
  startHourLabel?: string;
  startMinuteLabel?: string;
  endDateLabel?: string;
  endHourLabel?: string;
  endMinuteLabel?: string;
  startPickerProps?: Omit<DatePickerProps, "value" | "defaultValue" | "onChange" | "showTime" | "disabled" | "dateLabel" | "hourLabel" | "minuteLabel">;
  endPickerProps?: Omit<DatePickerProps, "value" | "defaultValue" | "onChange" | "showTime" | "disabled" | "dateLabel" | "hourLabel" | "minuteLabel">;
}

function mergeRange(current: DateRangeValue | undefined, fallback: DateRangeValue | undefined) {
  return {
    start: current?.start ?? fallback?.start ?? null,
    end: current?.end ?? fallback?.end ?? null,
  };
}

const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      showTime = false,
      disabled = false,
      className,
      startDateLabel = "Start date",
      startHourLabel = "Start hour",
      startMinuteLabel = "Start minute",
      endDateLabel = "End date",
      endHourLabel = "End hour",
      endMinuteLabel = "End minute",
      startPickerProps,
      endPickerProps,
      ...rest
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<DateRangeValue>(() => mergeRange(value, defaultValue));

    React.useEffect(() => {
      if (isControlled) {
        setInternalValue(mergeRange(value, defaultValue));
      } else if (defaultValue) {
        setInternalValue((prev) => mergeRange(prev, defaultValue));
      }
    }, [isControlled, value, defaultValue]);

    const range = isControlled ? mergeRange(value, defaultValue) : internalValue;

    const updateRange = (next: DateRangeValue) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    };

    const handleStartChange = (startValue: string | null) => {
      updateRange({ start: startValue, end: range.end });
    };

    const handleEndChange = (endValue: string | null) => {
      updateRange({ start: range.start, end: endValue });
    };
    const { className: startClassName, ...startRest } = startPickerProps ?? {};
    const { className: endClassName, ...endRest } = endPickerProps ?? {};

    return (
      <div ref={ref} className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6", className)} {...rest}>
        <DatePicker
          {...startRest}
          className={cn("flex-1", startClassName)}
          value={range.start}
          showTime={showTime}
          onChange={handleStartChange}
          disabled={disabled}
          dateLabel={startDateLabel}
          hourLabel={startHourLabel}
          minuteLabel={startMinuteLabel}
        />
        <DatePicker
          {...endRest}
          className={cn("flex-1", endClassName)}
          value={range.end}
          showTime={showTime}
          onChange={handleEndChange}
          disabled={disabled}
          dateLabel={endDateLabel}
          hourLabel={endHourLabel}
          minuteLabel={endMinuteLabel}
        />
      </div>
    );
  },
);
DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker };
