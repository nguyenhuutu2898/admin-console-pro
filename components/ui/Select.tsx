
import * as React from "react";

import { cn } from "../../lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  containerClassName?: string;
};

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, containerClassName, children, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <select
          className={cn(
            "w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm font-medium text-foreground shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 inline-flex -translate-y-1/2 text-muted-foreground">
          <ChevronDownIcon className="h-4 w-4" />
        </span>
      </div>
    );
  }
);
Select.displayName = "Select";

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return (
    <option value="" disabled>
      {placeholder || "Select an option"}
    </option>
  );
};
SelectValue.displayName = "SelectValue";

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, ...props }, ref) => {
  return (
    <option
      ref={ref}
      className={cn(
        "cursor-pointer bg-background py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectValue, SelectItem };
