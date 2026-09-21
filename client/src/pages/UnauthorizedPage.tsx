import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <ShieldOff className="mb-4 h-16 w-16 text-red-300" />
      <h1 className="text-3xl font-bold text-gray-900">403 — Unauthorized</h1>
      <p className="mt-2 text-gray-500">
        You don't have permission to access this page.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Go to Home</Link>
      </Button>
    </div>
  );
}
