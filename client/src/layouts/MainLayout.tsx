import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/Toaster';

export function MainLayout() {
  return (
    <div className="site-shell min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="glass-footer border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Utsav — College Event Management Portal
      </footer>
      <Toaster />
    </div>
  );
}
