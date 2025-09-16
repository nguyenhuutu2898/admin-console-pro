import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ open: false, setOpen: () => {} });

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

// FIX: Added 'asChild' prop support for better composition.
const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const { setOpen } = React.useContext(DropdownMenuContext);

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement;
    return React.cloneElement(child, {
      ...child.props,
      onClick: (e: React.MouseEvent) => {
        setOpen(o => !o);
        child.props.onClick?.(e);
      },
    });
  }

  return <div onClick={() => setOpen(o => !o)}>{children}</div>;
};

// FIX: Added 'align' prop to fix type error.
const DropdownMenuContent = ({ children, className, align }: { children: React.ReactNode, className?: string, align?: 'start' | 'center' | 'end' }) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);
  
  if (!open) return null;
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-popover text-popover-foreground shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 p-1",
        className
      )}
    >
        {children}
    </div>
  );
};

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext);
    return (
        <button
            ref={ref}
            onClick={(e) => {
                props.onClick?.(e);
                setOpen(false);
            }}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
                className
            )}
            {...props}
        />
    );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = () => (
    <div className='-mx-1 my-1 h-px bg-muted' />
);

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };