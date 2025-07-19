import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    confirmVariant: 'primary' as const,
  },
  danger: {
    icon: XCircle,
    iconColor: 'text-red-500',
    confirmVariant: 'destructive' as const,
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    confirmVariant: 'primary' as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    confirmVariant: 'primary' as const,
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmLoading = false,
}) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-dark-300 mb-6">
            {message}
          </p>
          
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={confirmLoading}
            >
              {cancelText}
            </Button>
            
            <Button
              variant={config.confirmVariant}
              onClick={onConfirm}
              loading={confirmLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};