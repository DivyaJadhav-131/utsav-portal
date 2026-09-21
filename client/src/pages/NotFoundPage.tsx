import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <FileQuestion className="mb-4 h-16 w-16 text-gray-300" />
      <h1 className="text-3xl font-bold text-gray-900">404 — Page Not Found</h1>
      <p className="mt-2 text-gray-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Go to Home</Link>
      </Button>
    </div>
  );
}
