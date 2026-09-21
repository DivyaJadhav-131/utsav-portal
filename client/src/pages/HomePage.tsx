import { useState, type PointerEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, TrendingUp, Search, ArrowRight, MapPin, SlidersHorizontal, Sparkles } from 'lucide-react';
import { getEvents } from '@/services/events.service';
import { getMyRegistrations } from '@/services/registrations.service';
import { useAuth } from '@/contexts/AuthContext';
import { EventCard } from '@/components/EventCard';
import { EventCardSkeleton } from '@/components/EventCardSkeleton';
import { DEPARTMENTS } from '@/lib/departments';
import { formatDateTime, imageUrl } from '@/lib/utils';

function moveHeroImage(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const image = event.currentTarget;
  const bounds = image.getBoundingClientRect();
  // Negative offsets make the photo travel opposite to the cursor.
  const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
  const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
  image.style.setProperty('--hero-x', `${-x * 18}px`);
  image.style.setProperty('--hero-y', `${-y * 18}px`);
}

function resetHeroImage(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.removeProperty('--hero-x');
  event.currentTarget.style.removeProperty('--hero-y');
}

export function HomePage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All departments');
  const [timing, setTiming] = useState('upcoming');
  const { user } = useAuth();
  const { data: events, isLoading, isError, refetch } = useQuery({ queryKey: ['events'], queryFn: () => getEvents() });
  const registrations = useQuery({ queryKey: ['my-registrations', user?._id], queryFn: getMyRegistrations, enabled: user?.role === 'student' });
  const now = Date.now();
  const upcoming = events?.filter(e => new Date(e.dateTime).getTime() >= now) || [];
  const week = upcoming.filter(e => new Date(e.dateTime).getTime() < now + 7 * 86400000);
  const filtered = (events || []).filter(e => {
    const date = new Date(e.dateTime).getTime();
    return (department === 'All departments' || e.department === department) && `${e.title} ${e.description} ${e.venue} ${e.organizerName}`.toLowerCase().includes(search.toLowerCase()) && (timing === 'all' || (timing === 'upcoming' ? date >= now : date >= now && date < now + 7 * 86400000));
  });
  const featured = filtered.find(e => new Date(e.dateTime).getTime() >= now);
  const reset = () => { setSearch(''); setDepartment('All departments'); setTiming('upcoming'); };
  return <div className="discovery mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <section className="discovery-hero glass-panel"><div className="hero-copy"><span className="eyebrow">CAMPUS EVENTS, BRIGHTER TOMORROWS</span><h1>Discover events that<br />shape your campus life<span>.</span></h1><p>Big ideas. New friendships. Unforgettable moments.<br className="hidden sm:block" /> Find your next experience, right here on campus.</p><div className="hero-search"><Search size={20} /><input aria-label="Search events" placeholder="Search events, venues, or organizers…" value={search} onChange={e => setSearch(e.target.value)} /><a href="#events" className="search-action">Explore <ArrowRight size={16} /></a></div><div className="hero-note"><span /> Your campus. Your community. Your next adventure.</div></div><div className="hero-image" onPointerMove={moveHeroImage} onPointerLeave={resetHeroImage} onPointerCancel={resetHeroImage}><div className="campus-note"><GraduationMark /><span>A more vibrant<br /><strong>campus together</strong></span></div><span className="hero-script">Learn.<br />Connect.<br />Grow.</span></div></section>
    <section className="stats-grid" aria-label="Campus overview">{[
      { icon: CalendarDays, number: isLoading || isError ? '—' : upcoming.length, title: 'Upcoming events', note: 'Something to look forward to', color: 'blue' },
      { icon: Users, number: user?.role === 'student' ? (registrations.isSuccess ? registrations.data.length : '—') : '8', title: user?.role === 'student' ? 'My registrations' : 'Departments, one campus', note: user?.role === 'student' ? 'Your next campus experiences' : 'Discover beyond your classroom', color: 'violet' },
      { icon: TrendingUp, number: isLoading || isError ? '—' : week.length, title: 'In the next 7 days', note: 'Make a little room for discovery', color: 'teal' },
    ].map(stat => <div className="stat-card glass-panel" key={stat.title}><span className={`stat-icon ${stat.color}`}><stat.icon size={24} /></span><div><strong>{stat.number}</strong><h2>{stat.title}</h2><p>{stat.note}</p></div></div>)}</section>
    <section className="filter-panel glass-panel" aria-label="Event filters"><div className="filter-heading"><span><SlidersHorizontal size={17} /> Find your community</span><button onClick={reset}>Reset filters</button></div><div className="department-filters">{DEPARTMENTS.map(d => <button key={d} aria-pressed={department === d} className={department === d ? 'selected' : ''} onClick={() => setDepartment(d)}>{d}</button>)}</div></section>
    {featured && !isError && <section className="featured-section"><div className="section-heading"><h2>In the spotlight</h2><span>Make this one a memory</span></div><Link to={`/events/${featured._id}`} className="featured-event" style={featured.imagePath ? { backgroundImage: `linear-gradient(90deg,rgba(16,35,88,.97),rgba(16,35,88,.4)),url("${imageUrl(featured.imagePath)}")` } : undefined}><div className="featured-copy"><span className="featured-label"><Sparkles size={14} /> FEATURED EVENT</span><h3>{featured.title}</h3><p className="line-clamp-2">{featured.description}</p><div className="featured-meta"><span><CalendarDays size={15} />{formatDateTime(featured.dateTime)}</span><span><MapPin size={15} />{featured.venue}</span></div><span className="featured-cta">Explore event <ArrowRight size={17} /></span></div><div className="featured-decoration" aria-hidden="true"><Sparkles size={96} /></div></Link></section>}
    <section id="events" className="scroll-mt-24"><div className="section-heading"><div><h2>{department === 'All departments' ? 'Explore events' : `${department} events`}</h2><p aria-live="polite">{isLoading ? 'Finding your next experience…' : isError ? 'Events are currently unavailable' : `${filtered.length} ${filtered.length === 1 ? 'experience' : 'experiences'} to discover`}</p></div><select aria-label="Filter by event date" className="department-select" value={timing} onChange={e => setTiming(e.target.value)}><option value="upcoming">Upcoming events</option><option value="week">Next 7 days</option><option value="all">All dates</option></select></div>
    {isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <EventCardSkeleton key={i} />)}</div> : isError ? <div className="empty-state glass-panel"><CalendarDays /><h3>We couldn't load the events</h3><p>Please try again to see what's happening on campus.</p><button onClick={() => refetch()}>Try again <ArrowRight size={16} /></button></div> : filtered.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(event => <EventCard key={event._id} event={event} />)}</div> : <div className="empty-state glass-panel"><Search /><h3>No events found</h3><p>Try another department, date range, or search to find your next experience.</p><button onClick={reset}>Reset filters <ArrowRight size={16} /></button></div>}</section>
    <div className="community-footer"><Sparkles size={18} /><span>A little curiosity can lead to your next big thing.</span></div>
  </div>;
}
function GraduationMark() { return <Users size={25} />; }
