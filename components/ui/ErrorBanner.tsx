import React from 'react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ 
  message, 
  onRetry, 
  className 
}) => {
  return (
    <div className={cn(
      'flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg',
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 text-red-500">⚠️</div>
        <span className="text-red-700 font-medium">{message}</span>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-red-700 border-red-300 hover:bg-red-100"
        >
          <span className="mr-2">🔄</span>
          Thử lại
        </Button>
      )}
    </div>
  );
};
