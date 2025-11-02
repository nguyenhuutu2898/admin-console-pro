import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLDivElement>;
}>({ open: false, setOpen: () => {}, triggerRef: { current: null } });

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div ref={triggerRef} className="relative inline-block text-left">{children}</div>
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
  const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext);
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; position: 'top' | 'bottom' }>({ top: 0, left: 0, position: 'bottom' });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside, true);
      return () => document.removeEventListener("mousedown", handleClickOutside, true);
    }
  }, [open, setOpen, triggerRef]);

  useEffect(() => {
    if (open && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 224; // w-56 = 14rem = 224px
      const dropdownHeight = 200; // Estimated height
      
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      
      let top = 0;
      let left = triggerRect.right - dropdownWidth;
      let position: 'top' | 'bottom' = 'bottom';
      
      // Adjust left position if dropdown would go off screen
      if (left < 0) {
        left = triggerRect.left;
      }
      
      // If there's not enough space below, show above
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        top = triggerRect.top - dropdownHeight - 8; // 8px gap
        position = 'top';
      } else {
        top = triggerRect.bottom + 8; // 8px gap
        position = 'bottom';
      }
      
      setPosition({ top, left, position });
    }
  }, [open, triggerRef]);
  
  if (!open) return null;
  
  const dropdownContent = (
    <div
      ref={ref}
      className={cn(
        "fixed w-56 rounded-md bg-popover text-popover-foreground shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 p-1",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>
  );
  
  return createPortal(dropdownContent, document.body);
};

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext);
    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
    };
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (onClick) {
        setOpen(false);
        onClick(e);
      }
    };
    return (
        <button
            ref={ref}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none border-0 focus:outline-none focus:ring-0 focus:border-0 transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
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