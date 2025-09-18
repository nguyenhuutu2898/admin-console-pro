import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  titleSectionClassName?: string;
  actionsClassName?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
  titleSectionClassName,
  actionsClassName,
  children,
}) => {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', className)}>
      <div className={cn('space-y-1', titleSectionClassName)}>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
        {children}
      </div>
      {actions ? (
        <div className={cn('flex flex-wrap items-center gap-2 md:justify-end', actionsClassName)}>
          {actions}
        </div>
      ) : null}
    </div>
  );
};

export default PageHeader;
