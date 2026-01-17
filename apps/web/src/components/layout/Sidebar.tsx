'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Traces', href: '/traces', icon: '🔍' },
  { name: 'Security', href: '/security', icon: '🛡️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold">TraceLens</h1>
        <p className="text-gray-400 text-sm mt-1">Runtime Truth Engine</p>
      </div>
      
      <nav className="mt-8">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
