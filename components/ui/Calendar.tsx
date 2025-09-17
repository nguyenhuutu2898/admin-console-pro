import * as React from "react";
import { DayPicker } from "react-day-picker";
import type { DayPickerProps } from "react-day-picker";

import { cn } from "../../lib/utils";

export type CalendarProps = DayPickerProps;

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, classNames, showOutsideDays = true, ...props }, ref) => {
    return (
      <DayPicker
        ref={ref}
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          button_previous:
            "-translate-y-px inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent bg-transparent p-0 text-sm text-muted-foreground opacity-50 hover:opacity-100",
          button_next:
            "-translate-y-px inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent bg-transparent p-0 text-sm text-muted-foreground opacity-50 hover:opacity-100",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "w-9 text-muted-foreground font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "relative h-9 w-9 text-center text-sm focus-within:relative focus-within:z-20",
            "[&:has([aria-selected].day-range-end)]:rounded-r-md",
            "[&:has([aria-selected].day-range-start)]:rounded-l-md",
            "first:[&:has([aria-selected])]:rounded-l-md",
            "last:[&:has([aria-selected])]:rounded-r-md"
          ),
          day: cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-normal transition-colors",
            "aria-selected:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "hover:bg-accent hover:text-accent-foreground"
          ),
          day_range_end: "day-range-end",
          day_range_start: "day-range-start",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground/50",
          day_disabled: "text-muted-foreground/50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: (props) => (
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
          ),
          IconRight: (props) => (
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
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ),
        }}
        {...props}
      />
    );
  }
);
Calendar.displayName = "Calendar";

export { Calendar };
