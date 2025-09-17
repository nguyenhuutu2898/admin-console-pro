import * as React from "react";
import { format } from "date-fns";
import type { DateRange, Matcher } from "react-day-picker";

import { cn } from "../../lib/utils";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
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

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  disabled,
  minDate,
  maxDate,
  placeholder = "Select a date range",
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
    if (!value?.from && !value?.to) {
      return placeholder;
    }

    if (value?.from && value?.to) {
      try {
        return `${format(value.from, formatString)} – ${format(
          value.to,
          formatString
        )}`;
      } catch (error) {
        return placeholder;
      }
    }

    if (value?.from) {
      try {
        return `${format(value.from, formatString)} – …`;
      } catch (error) {
        return placeholder;
      }
    }

    if (value?.to) {
      try {
        return `… – ${format(value.to, formatString)}`;
      } catch (error) {
        return placeholder;
      }
    }

    return placeholder;
  }, [value, placeholder, formatString]);

  const handleSelect = React.useCallback(
    (range?: DateRange) => {
      onChange(range);
      if (range?.from && range?.to) {
        const isSameDay = range.from.getTime() === range.to.getTime();
        if (!isSameDay) {
          setOpen(false);
        }
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
            "w-[280px] justify-start text-left font-normal",
            (!value?.from || !value?.to) && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={value}
          defaultMonth={value?.from ?? minDate ?? new Date()}
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
