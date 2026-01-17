import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TraceLens</h1>
          <p className="text-lg text-gray-600 mb-8">Runtime Truth Engine for Web Applications</p>
          
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="block w-full btn-primary text-center"
            >
              Open Dashboard
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Focus on causality over metrics</p>
              <p>Deterministic analysis of blocking paths</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
