import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  className?: string;
}

/**
 * Component for page headers with consistent styling
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  className 
}) => {
  return (
    <div className={cn("mb-6", className)}>
      <h1 className="text-2xl font-bold text-black">
        {title}
      </h1>
    </div>
  );
};
