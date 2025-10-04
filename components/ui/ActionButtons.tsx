import React from 'react';
import { Filter, Plus } from '../Icons';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface ActionButtonProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

interface ActionButtonsProps {
  buttons: ActionButtonProps[];
  className?: string;
}

/**
 * Reusable action buttons component with consistent styling
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  buttons,
  className
}) => {
  return (
    <div className={cn("flex gap-2", className)}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          className={cn(
            "bg-green-600 hover:bg-green-700 text-white",
            button.className
          )}
          onClick={button.onClick}
          variant={button.variant || 'default'}
        >
          {button.icon && <button.icon className="h-4 w-4 mr-2" />}
          {button.label}
        </Button>
      ))}
    </div>
  );
};

/**
 * Predefined filter button component
 */
export const FilterButton: React.FC<{ onClick: () => void; className?: string }> = ({ 
  onClick, 
  className 
}) => (
  <Button
    className={cn("bg-green-600 hover:bg-green-700 text-white", className)}
    onClick={onClick}
  >
    <Filter className="h-4 w-4 mr-2" />
    LỌC DỮ LIỆU
  </Button>
);

/**
 * Predefined add button component
 */
export const AddButton: React.FC<{ 
  onClick: () => void; 
  label?: string;
  className?: string;
}> = ({ 
  onClick, 
  label = "THÊM",
  className 
}) => (
  <Button
    className={cn("bg-green-600 hover:bg-green-700 text-white", className)}
    onClick={onClick}
  >
    <Plus className="h-4 w-4 mr-2" />
    {label}
  </Button>
);
