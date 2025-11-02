
import * as React from "react";
import { cn } from "../../lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground outline-none ring-0 ring-offset-0 shadow-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none active:outline-none active:ring-0 active:shadow-none focus:border-input disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <option value="">{placeholder || "Select an option"}</option>;
};
SelectValue.displayName = "SelectValue";

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, ...props }, ref) => {
  return (
    <option
      ref={ref}
      className={cn("bg-popover text-popover-foreground", className)}
      {...props}
    />
  );
});
SelectItem.displayName = "SelectItem";


export { Select, SelectValue, SelectItem };
