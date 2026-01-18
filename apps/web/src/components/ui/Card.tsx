import React from 'react';
import { cn } from '../../lib/design-tokens';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export default function Card({ 
  title, 
  children, 
  className = '', 
  description, 
  variant = 'default' 
}: CardProps) {
  const variantClasses = {
    default: 'bg-card text-card-foreground border shadow-sm',
    elevated: 'bg-card text-card-foreground border shadow-lg',
    outlined: 'bg-card text-card-foreground border-2 shadow-none',
  };

  return (
    <div className={cn(
      'rounded-xl p-6 backdrop-blur-sm',
      variantClasses[variant],
      className
    )}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1.5">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
