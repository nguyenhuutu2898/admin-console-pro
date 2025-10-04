import React from 'react';
import { Dialog, DialogContent } from './Dialog';
import { Button } from './Button';
import { Trash2, X, Check } from '../Icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
  width?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ĐỒNG Ý',
  cancelText = 'KHÔNG',
  variant = 'default',
  isLoading = false,
  width = 'max-w-md',
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${width} p-6`}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
              {title}
            </h3>
            
            {/* Message */}
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>
            
            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-medium"
              >
                <X className="w-4 h-4 mr-2" />
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                <Check className="w-4 h-4 mr-2" />
                {isLoading ? 'Đang xử lý...' : confirmText}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
