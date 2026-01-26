'use client';

import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  children: React.ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    let variantClasses = '';
    
    if (variant === 'default') {
      variantClasses = 'bg-card text-card-foreground shadow-sm';
    } else if (variant === 'elevated') {
      variantClasses = 'bg-card text-card-foreground shadow-lg hover:shadow-xl';
    } else if (variant === 'glass') {
      variantClasses = 'bg-white/10 dark:bg-black/10 backdrop-blur-md border-white/20 dark:border-white/10 shadow-xl supports-[backdrop-filter]:bg-white/10 supports-[backdrop-filter]:dark:bg-black/10 supports-[backdrop-filter]:backdrop-blur-md bg-card/95 dark:bg-card/95';
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border transition-all duration-200',
          variantClasses,
          className
        )}
        {...props}
      >
        <div className="p-6">
          {children}
        </div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
export default GlassCard;
