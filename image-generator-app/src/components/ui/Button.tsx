import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'bg-aigenr-primary text-aigenr-dark border-aigenr border-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 focus:ring-2 focus:ring-aigenr-orange transition-all duration-200',
  secondary: 'bg-aigenr-container text-aigenr-gray border-aigenr border-aigenr-dark hover:bg-aigenr-gray-light hover:text-aigenr-dark focus:ring-2 focus:ring-aigenr-orange shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200',
  outline: 'border-aigenr border-aigenr-dark text-aigenr-dark hover:bg-aigenr-gray-light focus:ring-2 focus:ring-aigenr-orange shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200',
  ghost: 'text-aigenr-gray hover:text-aigenr-orange hover:bg-aigenr-gray-light focus:ring-2 focus:ring-aigenr-orange transition-all duration-200',
  destructive: 'bg-red-600 text-white border-aigenr border-aigenr-dark hover:bg-red-700 focus:ring-red-500 shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm font-aigenr-medium',
  md: 'px-4 py-2 text-base font-aigenr-bold',
  lg: 'px-6 py-3 text-lg font-aigenr-bold',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-aigenr transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = buttonVariants[variant];
  const sizeClasses = buttonSizes[size];
  
  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};