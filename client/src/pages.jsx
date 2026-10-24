// Main user-facing pages. Larger account and admin workflows stay in their own files.
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, CalendarDays, Eye, EyeOff, FileQuestion, GraduationCap, Loader2, MapPin, ShieldOff, Sparkles, TrendingUp, Users, Search, SlidersHorizontal, User } from 'lucide-react';
import api, { login, signup, getEvents, getMyRegistrations, getEventById } from './services/api.js';
import { useAuth } from './AuthContext.jsx';
import { toast, Button, Input, Label, Badge, Skeleton, RegistrationButton, EventCard, EventCardSkeleton } from './components.jsx';
import { loginSchema, signupSchema, DEPARTMENTS, formatDateTime, imageUrl, isEventPast } from './utils.js';
function AccountForm({ creating }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  // The selected Zod schema checks the form before the API request is sent.
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(creating ? signupSchema : loginSchema) });
  const submit = async (data) => {
    try {
      const user = await (creating ? signup(data) : login(data));
      setUser(user);
      const from = location.state?.from?.pathname || '/';
      toast({ title: `Welcome${creating ? '' : ' back'}, ${user.name}!`, variant: 'success' });
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    }
    catch (error) {
      toast({ title: creating ? 'Sign up failed' : 'Login failed', description: error.response?.data?.message || 'Please try again.', variant: 'destructive' });
    }
  };
  return <div className="auth-form-inner">
    <Link to="/" className="auth-logo"><GraduationCap /> Utsav</Link>
    <h1>{creating ? 'Create your account' : 'Sign in to Utsav'}</h1>
    <form onSubmit={handleSubmit(submit)} className="children-gap-y-5" noValidate>
      {creating && <div className="children-gap-y-2"><Label htmlFor="signup-name">Full name</Label><Input id="signup-name" autoComplete="name" placeholder="Your full name" {...register('name')} aria-invalid={!!errors.name} />{errors.name && <p role="alert" className="font-size-xs text-color-red-600">{errors.name.message}</p>}</div>}
      <div className="children-gap-y-2"><Label htmlFor={creating ? 'signup-email' : 'login-email'}>Email</Label><Input id={creating ? 'signup-email' : 'login-email'} type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} aria-invalid={!!errors.email} />{errors.email && <p role="alert" className="font-size-xs text-color-red-600">{errors.email.message}</p>}</div>
      <div className="children-gap-y-2"><Label htmlFor={creating ? 'signup-password' : 'login-password'}>Password</Label><div className="position-relative"><Input id={creating ? 'signup-password' : 'login-password'} type={visible ? 'text' : 'password'} autoComplete={creating ? 'new-password' : 'current-password'} placeholder={creating ? 'At least 6 characters' : 'Enter your password'} className="padding-right-12" {...register('password')} aria-invalid={!!errors.password} /><button type="button" className="position-absolute offset-right-3 offset-top-3 text-color-slate-500" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <p role="alert" className="font-size-xs text-color-red-600">{errors.password.message}</p>}</div>
      {creating && <p className="font-size-xs text-color-slate-500">New accounts are for students.</p>}
      <Button className="width-full height-12" disabled={isSubmitting}>{isSubmitting ? <Loader2 size={18} className="margin-right-2 animation-spin" /> : null}{creating ? 'Create account' : 'Sign in'}<ArrowRight size={17} className="margin-left-2" /></Button>
    </form>
    <p className="margin-top-6 font-size-sm text-color-slate-500">{creating ? 'Already part of the community?' : "Don't have an account?"} <Link state={location.state} className="font-weight-semibold text-color-blue-700" to={creating ? '/login' : '/signup'}>{creating ? 'Sign in' : 'Sign up'}</Link></p>
  </div>;
}
export function AuthPage() {
  const location = useLocation();
  const creating = location.pathname === '/signup';
  const { user } = useAuth();
  if (user)
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return <div className="auth-page"><div className="auth-shell glass-panel">
    <section className="auth-form-panel"><AccountForm key={creating ? 'signup' : 'login'} creating={creating} /></section>
  </div></div>;
}

function moveHeroImage(event) {
  if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return;
  const image = event.currentTarget;
  const bounds = image.getBoundingClientRect();
  // Negative offsets make the photo travel opposite to the cursor.
  const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
  const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
  image.style.setProperty('--hero-x', `${-x * 18}px`);
  image.style.setProperty('--hero-y', `${-y * 18}px`);
}
function resetHeroImage(event) {
  event.currentTarget.style.removeProperty('--hero-x');
  event.currentTarget.style.removeProperty('--hero-y');
}
export function HomePage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All departments');
  const [timing, setTiming] = useState('upcoming');
  const { user } = useAuth();
  const { data: events, isLoading, isError, refetch } = useQuery({ queryKey: ['events'], queryFn: () => getEvents() });
  const registrations = useQuery({ queryKey: ['margin-y-registrations', user?._id], queryFn: getMyRegistrations, enabled: user?.role === 'student' });
  const now = Date.now();
  const upcoming = events?.filter(e => new Date(e.dateTime).getTime() >= now) || [];
  const week = upcoming.filter(e => new Date(e.dateTime).getTime() < now + 7 * 86400000);
  // Apply the three visible filters to the events returned by the API.
  const filtered = (events || []).filter(e => {
    const date = new Date(e.dateTime).getTime();
    return (department === 'All departments' || e.department === department) && `${e.title} ${e.description} ${e.venue} ${e.organizerName}`.toLowerCase().includes(search.toLowerCase()) && (timing === 'all' || (timing === 'upcoming' ? date >= now : date >= now && date < now + 7 * 86400000));
  });
  const featured = filtered.find(e => new Date(e.dateTime).getTime() >= now);
  const reset = () => { setSearch(''); setDepartment('All departments'); setTiming('upcoming'); };
  return <div className="discovery margin-x-auto max-width-7xl padding-x-4 padding-y-8 at-small-screen-padding-x-6">
    <section className="discovery-hero glass-panel"><div className="hero-copy"><span className="eyebrow">CAMPUS EVENTS, BRIGHTER TOMORROWS</span><h1>Discover events that<br />shape your campus life<span>.</span></h1><p>Big ideas. New friendships. Unforgettable moments.<br className="display-none at-small-screen-display-block" /> Find your next experience, right here on campus.</p><div className="hero-search"><Search size={20} /><input aria-label="Search events" placeholder="Search events, venues, or organizers…" value={search} onChange={e => setSearch(e.target.value)} /><a href="#events" className="search-action">Explore <ArrowRight size={16} /></a></div><div className="hero-note"><span /> Your campus. Your community. Your next adventure.</div></div><div className="hero-image" onPointerMove={moveHeroImage} onPointerLeave={resetHeroImage} onPointerCancel={resetHeroImage}><div className="campus-note"><GraduationMark /><span>A more vibrant<br /><strong>campus together</strong></span></div><span className="hero-script">Learn.<br />Connect.<br />Grow.</span></div></section>
    <section className="stats-grid" aria-label="Campus overview">{[
      { icon: CalendarDays, number: isLoading || isError ? '—' : upcoming.length, title: 'Upcoming events', note: 'Something to look forward to', color: 'blue' },
      { icon: Users, number: user?.role === 'student' ? (registrations.isSuccess ? registrations.data.length : '—') : '8', title: user?.role === 'student' ? 'My registrations' : 'Departments, one campus', note: user?.role === 'student' ? 'Your next campus experiences' : 'Discover beyond your classroom', color: 'violet' },
      { icon: TrendingUp, number: isLoading || isError ? '—' : week.length, title: 'In the next 7 days', note: 'Make a little room for discovery', color: 'teal' },
    ].map(stat => <div className="stat-card glass-panel" key={stat.title}><span className={`stat-icon ${stat.color}`}><stat.icon size={24} /></span><div><strong>{stat.number}</strong><h2>{stat.title}</h2><p>{stat.note}</p></div></div>)}</section>
    {/* <section className="filter-panel glass-panel" aria-label="Event filters"><div className="filter-heading"><span><SlidersHorizontal size={17} /> Find your community</span><button onClick={reset}>Reset filters</button></div><div className="department-filters">{DEPARTMENTS.map(d => <button key={d} aria-pressed={department === d} className={department === d ? 'selected' : ''} onClick={() => setDepartment(d)}>{d}</button>)}</div></section> */}
    {featured && !isError && <section className="featured-section"><div className="section-heading"><h2>In the spotlight</h2><span>Make this one a memory</span></div><Link to={`/events/${featured._id}`} className="featured-event" style={featured.imagePath ? { backgroundImage: `linear-gradient(90deg,rgba(16,35,88,.97),rgba(16,35,88,.4)),url("${imageUrl(featured.imagePath)}")` } : undefined}><div className="featured-copy"><span className="featured-label"><Sparkles size={14} /> FEATURED EVENT</span><h3>{featured.title}</h3><p className="text-lines-2">{featured.description}</p><div className="featured-meta"><span><CalendarDays size={15} />{formatDateTime(featured.dateTime)}</span><span><MapPin size={15} />{featured.venue}</span></div><span className="featured-cta">Explore event <ArrowRight size={17} /></span></div><div className="featured-decoration" aria-hidden="true"></div></Link></section>}
    <section id="events" className="scroll-mt-24"><div className="section-heading"><div><h2>{department === 'All departments' ? 'Explore events' : `${department} events`}</h2><p aria-live="polite">{isLoading ? 'Finding your next experience…' : isError ? 'Events are currently unavailable' : `${filtered.length} ${filtered.length === 1 ? 'experience' : 'experiences'} to discover`}</p></div><select aria-label="Filter by event date" className="department-select" value={timing} onChange={e => setTiming(e.target.value)}><option value="upcoming">Upcoming events</option><option value="week">Next 7 days</option><option value="all">All dates</option></select></div>
      {isLoading ? <div className="display-grid element-gap-6 at-small-screen-grid-columns-2 at-large-screen-grid-columns-3">{[1, 2, 3].map(i => <EventCardSkeleton key={i} />)}</div> : isError ? <div className="empty-state glass-panel"><CalendarDays /><h3>We couldn't load the events</h3><p>Please try again to see what's happening on campus.</p><button onClick={() => refetch()}>Try again <ArrowRight size={16} /></button></div> : filtered.length ? <div className="display-grid element-gap-6 at-small-screen-grid-columns-2 at-large-screen-grid-columns-3">{filtered.map(event => <EventCard key={event._id} event={event} />)}</div> : <div className="empty-state glass-panel"><Search /><h3>No events found</h3><p>Try another department, date range, or search to find your next experience.</p><button onClick={reset}>Reset filters <ArrowRight size={16} /></button></div>}</section>
    <div className="community-footer"><span>A little curiosity can lead to your next big thing.</span></div>
  </div>;
}
function GraduationMark() { return <Users size={25} />; }

export function EventDetailPage() {
  const { id } = useParams();
  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  });
  // Fetch registration count (public, returns just a number)
  const { data: regCount } = useQuery({
    queryKey: ['reg-count', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}/count`);
      return res.data.count;
    },
    enabled: !!id,
    // Suppress errors — this endpoint is optional
  });
  if (isLoading) {
    return (<div className="margin-x-auto max-width-3xl padding-x-4 padding-y-8 at-small-screen-padding-x-6 children-gap-y-4">
      <Skeleton className="height-8 width-1-3" />
      <Skeleton className="height-64 width-full corner-radius-xl" />
      <Skeleton className="height-5 width-2-3" />
      <Skeleton className="height-5 width-1-2" />
      <Skeleton className="height-20 width-full" />
    </div>);
  }
  if (isError || !event) {
    return (<div className="margin-x-auto max-width-3xl padding-x-4 padding-y-16 text-align-center">
      <p className="font-size-lg text-color-gray-500">Event not found.</p>
      <Link to="/" className="margin-top-4 display-inline-block text-color-blue-600 on-hover-text-underline">
        ← Back to events
      </Link>
    </div>);
  }
  const past = isEventPast(event.dateTime);
  return (<div className="margin-x-auto max-width-3xl padding-x-4 padding-y-8 at-small-screen-padding-x-6 animation-fade-in">
    {/* Back link */}
    <Link to="/" className="margin-bottom-4 display-inline-flex align-items-center element-gap-1-5 font-size-sm text-color-blue-600 on-hover-text-underline">
      <ArrowLeft className="height-4 width-4" />
      All Events
    </Link>

    {/* Image */}
    {event.imagePath ? (<img src={imageUrl(event.imagePath)} alt={event.title} className="margin-bottom-6 height-64 width-full corner-radius-xl image-fit-cover at-small-screen-height-80" />) : (<div className="margin-bottom-6 display-flex height-48 align-items-center justify-content-center corner-radius-xl background-gradient-to-br gradient-from-blue-50 gradient-to-blue-100">
      <CalendarDays className="height-16 width-16 text-color-blue-200" />
    </div>)}

    {/* Header */}
    <div className="margin-bottom-4 display-flex flex-items-wrap align-items-start justify-content-between element-gap-3">
      <h1 className="font-size-2xl font-weight-bold text-color-gray-900 at-small-screen-font-size-3xl">{event.title}</h1>
      <div className="display-flex element-gap-2 flex-items-wrap">
        {past ? (<Badge variant="secondary">Event Ended</Badge>) : (<Badge variant="success">Upcoming</Badge>)}
        {event.capacity !== null && (<Badge variant="outline">
          <Users className="margin-right-1 height-3 width-3" />
          Capacity: {event.capacity}
        </Badge>)}
      </div>
    </div>

    {/* Meta */}
    <div className="margin-bottom-6 children-gap-y-2 font-size-sm text-color-gray-600">
      <div className="display-flex align-items-center element-gap-2">
        <CalendarDays className="height-4 width-4 text-color-blue-500" />
        <span>{formatDateTime(event.dateTime)}</span>
      </div>
      <div className="display-flex align-items-center element-gap-2">
        <MapPin className="height-4 width-4 text-color-blue-500" />
        <span>{event.venue}</span>
      </div>
      <div className="display-flex align-items-center element-gap-2">
        <User className="height-4 width-4 text-color-blue-500" />
        <span>Organized by {event.organizerName}</span>
      </div>
    </div>

    {/* Description */}
    <div className="margin-bottom-8 corner-radius-lg border-default border-color-gray-100 background-white padding-5">
      <h2 className="margin-bottom-2 font-size-sm font-weight-semibold text-color-gray-500 text-uppercase letter-spacing-wide">
        About this event
      </h2>
      <p className="text-color-gray-700 white-space-pre-line line-height-relaxed">
        {event.description}
      </p>
    </div>

    {/* Registration */}
    <RegistrationButton eventId={event._id} eventDateTime={event.dateTime} capacity={event.capacity} registrationCount={regCount} />
  </div>);
}

// These short fallback pages share one file because they have the same layout.
export function NotFoundPage() {
  return (
    <div className="display-flex min-height-70vh flex-direction-column align-items-center justify-content-center padding-x-4 text-align-center">
      <FileQuestion className="margin-bottom-4 height-16 width-16 text-color-gray-300" />
      <h1 className="font-size-3xl font-weight-bold text-color-gray-900">404 — Page Not Found</h1>
      <p className="margin-top-2 text-color-gray-500">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild className="margin-top-6"><Link to="/">Go to Home</Link></Button>
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="display-flex min-height-70vh flex-direction-column align-items-center justify-content-center padding-x-4 text-align-center">
      <ShieldOff className="margin-bottom-4 height-16 width-16 text-color-red-300" />
      <h1 className="font-size-3xl font-weight-bold text-color-gray-900">403 — Unauthorized</h1>
      <p className="margin-top-2 text-color-gray-500">You don't have permission to access this page.</p>
      <Button asChild className="margin-top-6"><Link to="/">Go to Home</Link></Button>
    </div>
  );
}





