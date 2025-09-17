import * as React from "react";
import { format } from "date-fns";
import type { Matcher } from "react-day-picker";

import { cn } from "../../lib/utils";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: Matcher | Matcher[];
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  triggerLabel: string;
  calendarLabel: string;
  formatString?: string;
}

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const toArray = (matcher?: Matcher | Matcher[]) => {
  if (!matcher) {
    return [] as Matcher[];
  }

  return Array.isArray(matcher) ? matcher : [matcher];
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  disabled,
  minDate,
  maxDate,
  placeholder = "Select a date",
  triggerLabel,
  calendarLabel,
  formatString = "PPP",
}) => {
  const [open, setOpen] = React.useState(false);

  const disabledDays = React.useMemo(() => {
    const matchers = [...toArray(disabled)];
    if (minDate) {
      matchers.push({ before: minDate });
    }
    if (maxDate) {
      matchers.push({ after: maxDate });
    }
    return matchers;
  }, [disabled, minDate, maxDate]);

  const displayValue = React.useMemo(() => {
    if (!value) return placeholder;
    try {
      return format(value, formatString);
    } catch (error) {
      return placeholder;
    }
  }, [value, placeholder, formatString]);

  const handleSelect = React.useCallback(
    (date?: Date) => {
      onChange(date);
      if (date) {
        setOpen(false);
      }
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={triggerLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "w-[260px] justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value ?? minDate ?? new Date()}
          onSelect={handleSelect}
          disabled={disabledDays}
          initialFocus
          aria-label={calendarLabel}
          fromDate={minDate}
          toDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  );
};
