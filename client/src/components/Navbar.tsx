import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { GraduationCap, LogOut, Menu, X, LayoutDashboard, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      toast({ title: 'Logged out successfully', variant: 'success' });
      navigate('/');
    } catch {
      toast({ title: 'Logout failed', variant: 'destructive' });
    }
    setMenuOpen(false);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors hover:text-blue-600',
      isActive ? 'text-blue-700 font-semibold' : 'text-gray-600'
    );

  return (
    <header className="glass-nav sticky top-0 z-40 border-b border-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-blue-900 font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <GraduationCap className="h-6 w-6 text-blue-700" />
          <span>Utsav</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={linkClass}>
            Discover
          </NavLink>
          {user?.role === 'student' && (
            <NavLink to="/my-events" className={linkClass}>
              My Events
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={linkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-500">
                Hi, <span className="font-medium text-gray-800">{user.name}</span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2 animate-fade-in">
          <NavLink
            to="/"
            end
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Events
            </span>
          </NavLink>
          {user?.role === 'student' && (
            <NavLink
              to="/my-events"
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              My Events
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </span>
            </NavLink>
          )}
          <div className="pt-2 border-t border-gray-100">
            {user ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link to="/signup" onClick={() => setMenuOpen(false)}>
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
