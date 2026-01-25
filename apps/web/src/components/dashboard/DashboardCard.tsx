import React from 'react';
import Card from '../ui/Card';
import { Heading } from '../ui/Typography';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export default function DashboardCard({ title, children, className, action }: DashboardCardProps) {
  return (
    <Card variant="elevated" className={`hover:shadow-xl transition-shadow ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <Heading level={3}>{title}</Heading>
        {action}
      </div>
      {children}
    </Card>
  );
}
