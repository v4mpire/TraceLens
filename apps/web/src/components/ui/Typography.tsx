import React from 'react';
import { cn } from '../../lib/design-tokens';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

interface HeadingProps extends TypographyProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

interface TextProps extends TypographyProps {
  variant?: 'body' | 'small' | 'muted' | 'lead';
  as?: 'p' | 'span' | 'div';
}

export function Heading({ children, level = 1, className }: HeadingProps) {
  const baseClasses = 'font-semibold tracking-tight';
  
  const levelClasses = {
    1: 'text-4xl lg:text-5xl',
    2: 'text-3xl lg:text-4xl',
    3: 'text-2xl lg:text-3xl',
    4: 'text-xl lg:text-2xl',
    5: 'text-lg lg:text-xl',
    6: 'text-base lg:text-lg',
  };

  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  return React.createElement(
    Component,
    {
      className: cn(baseClasses, levelClasses[level], className),
    },
    children
  );
}

export function Text({ children, variant = 'body', as = 'p', className }: TextProps) {
  const variantClasses = {
    body: 'text-base leading-relaxed',
    small: 'text-sm',
    muted: 'text-sm text-muted-foreground',
    lead: 'text-lg leading-relaxed text-muted-foreground',
  };

  return React.createElement(
    as,
    {
      className: cn(variantClasses[variant], className),
    },
    children
  );
}

export function Code({ children, className }: TypographyProps) {
  return (
    <code className={cn(
      'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium',
      className
    )}>
      {children}
    </code>
  );
}

export function Label({ children, className }: TypographyProps) {
  return (
    <label className={cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}>
      {children}
    </label>
  );
}
