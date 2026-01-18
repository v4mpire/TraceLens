import React from 'react';
import { cn } from '../../lib/design-tokens';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    error: 'bg-error text-error-foreground',
    info: 'bg-info text-info-foreground',
    outline: 'border border-input bg-background text-foreground',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
}

// Status indicator variant for system status
export function StatusBadge({ 
  status, 
  children, 
  className 
}: { 
  status: 'online' | 'offline' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
}) {
  const statusVariants = {
    online: 'success',
    offline: 'default',
    warning: 'warning',
    error: 'error',
  } as const;

  return (
    <Badge variant={statusVariants[status]} className={className || ''}>
      <span className={cn(
        'mr-1.5 h-2 w-2 rounded-full',
        status === 'online' && 'bg-green-400',
        status === 'offline' && 'bg-gray-400',
        status === 'warning' && 'bg-yellow-400',
        status === 'error' && 'bg-red-400'
      )} />
      {children}
    </Badge>
  );
}
