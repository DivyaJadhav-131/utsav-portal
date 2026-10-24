// Shared application layout and reusable UI pieces.
import React, { useCallback, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Badge, Button, Input, Label, Skeleton, Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './components/UI.jsx';
import { useAuth } from './AuthContext.jsx';
import { logout, checkRegistration, registerForEvent, cancelRegistration } from './services/api.js';
import { formatDateTime, imageUrl, isEventPast, cn } from './utils.js';
import { Calendar, CalendarDays, GraduationCap, LayoutDashboard, Loader2, LogOut, MapPin, Menu, Users, UserCheck, UserMinus, X } from 'lucide-react';

export { Badge, Button, Input, Label, Skeleton };

// A small shared notification queue used by forms and the page layout.
let toastCount = 0;
let globalDispatch = null;
export const toast = (options) => {
  if (globalDispatch) globalDispatch({ id: ++toastCount, variant: 'default', ...options });
};
export function useToastState() {
  const [toasts, setToasts] = useState([]);
  const dispatch = useCallback((item) => {
    setToasts((previous) => [...previous, item]);
    setTimeout(() => setToasts((previous) => previous.filter((toastItem) => toastItem.id !== item.id)), 4000);
  }, []);
  globalDispatch = dispatch;
  const dismiss = useCallback((id) => setToasts((previous) => previous.filter((item) => item.id !== id)), []);
  return { toasts, dismiss };
}
// Hold pages behind login and check the user's role when a route requires it.
export function ProtectedRoute({ children, role }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="display-flex min-height-60vh align-items-center justify-content-center">
        <Loader2 className="height-8 width-8 animation-spin text-color-blue-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user.role !== role) return <Navigate to="/unauthorized" replace />;
  return children;
}

// Shared page frame with navigation, page content, footer, and notifications.
export function MainLayout() {
  return (
    <div className="site-shell min-height-screen display-flex flex-direction-column">
      <Navbar />
      <main className="flex-item-fill"><Outlet /></main>
      <footer className="glass-footer border-top border-color-gray-200 padding-y-6 text-align-center font-size-sm text-color-gray-400">
        © {new Date().getFullYear()} Utsav — College Event Management Portal
      </footer>
      <Toaster />
    </div>
  );
}

// Show brief messages for successful actions and errors.
export function Toaster() {
  const { toasts, dismiss } = useToastState();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant }) => (
        <Toast key={id} variant={variant} open onOpenChange={(open) => !open && dismiss(id)}>
          <div className="display-grid element-gap-1">
            <ToastTitle>{title}</ToastTitle>
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

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
    }
    catch {
      toast({ title: 'Logout failed', variant: 'destructive' });
    }
    setMenuOpen(false);
  };
  const linkClass = ({ isActive }) => cn('font-size-sm font-weight-medium animated-change-colors on-hover-text-color-blue-600', isActive ? 'text-color-blue-700 font-weight-semibold' : 'text-color-gray-600');
  return (<header className="glass-nav position-sticky offset-top-0 stack-order-40 border-color-b border-color-white-60">
    <div className="margin-x-auto display-flex height-16 max-width-7xl align-items-center justify-content-between padding-x-4 at-small-screen-padding-x-6">
      {/* Logo */}
      <Link to="/" className="display-flex align-items-center element-gap-2 text-color-blue-900 font-weight-bold font-size-lg on-hover-opacity-80 animated-change-opacity">
        <GraduationCap className="height-6 width-6 text-color-blue-700" />
        <span>Utsav</span>
      </Link>

      {/* Desktop nav */}
      <nav className="display-none at-medium-screen-display-flex align-items-center element-gap-6">
        <NavLink to="/" end className={linkClass}>
          Discover
        </NavLink>
        {user?.role === 'student' && (<NavLink to="/my-events" className={linkClass}>
          My Events
        </NavLink>)}
        {user?.role === 'admin' && (<NavLink to="/admin" className={linkClass}>
          Dashboard
        </NavLink>)}
      </nav>

      {/* Desktop auth */}
      <div className="display-none at-medium-screen-display-flex align-items-center element-gap-3">
        {user ? (<>
          <span className="font-size-sm text-color-gray-500">
            Hi, <span className="font-weight-medium text-color-gray-800">{user.name}</span>
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="margin-right-1-5 height-4 width-4" />
            Logout
          </Button>
        </>) : (<>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </>)}
      </div>

      {/* Mobile hamburger */}
      <button className="at-medium-screen-display-none padding-2 corner-radius-md text-color-gray-600 on-hover-background-gray-100" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
        {menuOpen ? <X className="height-5 width-5" /> : <Menu className="height-5 width-5" />}
      </button>
    </div>

    {/* Mobile menu */}
    {menuOpen && (<div className="at-medium-screen-display-none border-color-t border-color-gray-100 background-white padding-x-4 padding-y-3 children-gap-y-2 animation-fade-in">
      <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
        <span className="display-flex align-items-center element-gap-2">
          <Calendar className="height-4 width-4" /> Events
        </span>
      </NavLink>
      {user?.role === 'student' && (<NavLink to="/my-events" className={linkClass} onClick={() => setMenuOpen(false)}>
        My Events
      </NavLink>)}
      {user?.role === 'admin' && (<NavLink to="/admin" className={linkClass} onClick={() => setMenuOpen(false)}>
        <span className="display-flex align-items-center element-gap-2">
          <LayoutDashboard className="height-4 width-4" /> Dashboard
        </span>
      </NavLink>)}
      <div className="padding-top-2 border-color-t border-color-gray-100">
        {user ? (<Button variant="outline" size="sm" className="width-full" onClick={handleLogout}>
          <LogOut className="margin-right-1-5 height-4 width-4" />
          Logout
        </Button>) : (<div className="display-flex element-gap-2">
          <Button variant="outline" size="sm" className="flex-item-fill login-btn" asChild>
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Log in
            </Link>
          </Button>
          <Button size="sm" className="flex-item-fill" asChild>
            <Link to="/signup" onClick={() => setMenuOpen(false)}>
              Sign up
            </Link>
          </Button>
        </div>)}
      </div>
    </div>)}
  </header>);
}

export function EventCard({ event }) {
  const past = isEventPast(event.dateTime);
  return (<Link to={`/events/${event._id}`} className="event-card hover-parent display-flex flex-direction-column corner-radius-lg border-default border-color-gray-200 background-white box-shadow-sm on-hover-box-shadow-md on-hover-translate-y-negative-0-5 animated-change-all transition-duration-200 overflow-hidden">
    {/* Image */}
    <div className="position-relative height-44 width-full overflow-hidden background-gray-100">
      {event.imagePath ? (<img src={imageUrl(event.imagePath)} alt={event.title} className="height-full width-full image-fit-cover when-parent-hover-scale-105 animated-change-transform transition-duration-300" />) : (<div className="display-flex height-full align-items-center justify-content-center background-gradient-to-br gradient-from-blue-50 gradient-to-blue-100">
        <CalendarDays className="height-12 width-12 text-color-blue-300" />
      </div>)}
      {past && (<div className="position-absolute position-inset-all-0 background-black-40 display-flex align-items-center justify-content-center">
        <span className="corner-radius-full background-gray-800-80 padding-x-3 padding-y-1 font-size-xs font-weight-semibold text-color-white">
          Event Ended
        </span>
      </div>)}
    </div>

    {/* Content */}
    <div className="display-flex flex-item-fill flex-direction-column element-gap-2 padding-4">
      <span className="department-badge">{event.department || 'All departments'}</span>
      <h3 className="font-weight-semibold text-color-gray-900 text-lines-2 line-height-snug when-parent-hover-text-color-blue-700 animated-change-colors">
        {event.title}
      </h3>

      <div className="margin-top-auto children-gap-y-1-5 font-size-xs text-color-gray-500">
        <div className="display-flex align-items-center element-gap-1-5">
          <CalendarDays className="height-3-5 width-3-5 flex-item-no-shrink text-color-blue-500" />
          <span>{formatDateTime(event.dateTime)}</span>
        </div>
        <div className="display-flex align-items-center element-gap-1-5">
          <MapPin className="height-3-5 width-3-5 flex-item-no-shrink text-color-blue-500" />
          <span className="text-truncate">{event.venue}</span>
        </div>
      </div>

      {event.capacity !== null && (<div className="display-flex align-items-center element-gap-1-5 margin-top-1">
        <Users className="height-3-5 width-3-5 text-color-gray-400" />
        <Badge variant="secondary" className="font-size-xs">
          Capacity: {event.capacity}
        </Badge>
      </div>)}
    </div>
  </Link>);
}

export function EventCardSkeleton() {
  return (<div className="display-flex flex-direction-column corner-radius-lg border-default border-color-gray-200 background-white box-shadow-sm overflow-hidden">
    <Skeleton className="height-44 width-full corner-radius-none" />
    <div className="display-flex flex-direction-column element-gap-3 padding-4">
      <Skeleton className="height-5 width-3-4" />
      <Skeleton className="height-4 width-1-2" />
      <Skeleton className="height-4 width-2-3" />
      <Skeleton className="height-4 width-1-3 margin-top-1" />
    </div>
  </div>);
}

export function RegistrationButton({ eventId, eventDateTime, capacity, registrationCount = 0, }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const past = isEventPast(eventDateTime);
  const isFull = capacity !== null && registrationCount >= capacity;
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['registration-status', eventId],
    queryFn: () => checkRegistration(eventId),
    enabled: !!user && user.role === 'student',
  });
  const registered = statusData?.registered ?? false;
  const registerMutation = useMutation({
    mutationFn: () => registerForEvent(eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registration-status', eventId] });
      qc.invalidateQueries({ queryKey: ['margin-y-registrations'] });
      toast({ title: 'Registered successfully!', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Registration failed',
        description: err.response?.data?.message,
        variant: 'destructive',
      });
    },
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelRegistration(eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registration-status', eventId] });
      qc.invalidateQueries({ queryKey: ['margin-y-registrations'] });
      toast({ title: 'Registration cancelled', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Cancellation failed',
        description: err.response?.data?.message,
        variant: 'destructive',
      });
    },
  });
  if (!user) {
    return (<Button onClick={() => navigate('/login')} className="width-full at-small-screen-width-auto">
      Log in to Register
    </Button>);
  }
  if (user.role === 'admin')
    return null;
  if (statusLoading) {
    return (<Button disabled className="width-full at-small-screen-width-auto">
      <Loader2 className="margin-right-2 height-4 width-4 animation-spin" />
      Loading…
    </Button>);
  }
  if (past) {
    return (<Button disabled variant="secondary" className="width-full at-small-screen-width-auto">
      Registration Closed
    </Button>);
  }
  if (registered) {
    return (<ConfirmDialog trigger={<Button variant="outline" className="width-full at-small-screen-width-auto border-color-red-300 text-color-red-600 on-hover-background-red-50" disabled={cancelMutation.isPending}>
      {cancelMutation.isPending ? (<Loader2 className="margin-right-2 height-4 width-4 animation-spin" />) : (<UserMinus className="margin-right-2 height-4 width-4" />)}
      Cancel Registration
    </Button>} title="Cancel Registration" description="Are you sure you want to cancel your registration for this event?" confirmLabel="Yes, Cancel" confirmVariant="destructive" onConfirm={() => cancelMutation.mutate()} />);
  }
  return (<Button onClick={() => registerMutation.mutate()} disabled={registerMutation.isPending || isFull} className="width-full at-small-screen-width-auto">
    {registerMutation.isPending ? (<Loader2 className="margin-right-2 height-4 width-4 animation-spin" />) : (<UserCheck className="margin-right-2 height-4 width-4" />)}
    {isFull ? 'Event Full' : 'Register Now'}
  </Button>);
}

export function ConfirmDialog({ trigger, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', confirmVariant = 'default', onConfirm, }) {
  return (<AlertDialog>
    <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className={confirmVariant === 'destructive'
          ? 'background-red-600 text-color-white on-hover-background-red-700'
          : undefined}>
          {confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>);
}




