'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, Settings, User } from 'lucide-react';
import Breadcrumbs, { generateBreadcrumbs } from './Breadcrumbs';
import Button from '../ui/Button';
import { cn } from '../../lib/design-tokens';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full border-b bg-header/95 backdrop-blur supports-[backdrop-filter]:bg-header/60',
      className
    )}>
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Breadcrumbs */}
        <div className="flex items-center space-x-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>

          {/* User menu */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <User className="h-4 w-4" />
            <span className="sr-only">User menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
