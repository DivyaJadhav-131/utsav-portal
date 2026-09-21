import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEventById } from '@/services/events.service';
import { RegistrationButton } from '@/components/RegistrationButton';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime, imageUrl, isEventPast } from '@/lib/utils';
import { ArrowLeft, CalendarDays, MapPin, User, Users } from 'lucide-react';
import { useQuery as useRegCountQuery } from '@tanstack/react-query';
import api from '@/services/api';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
  });

  // Fetch registration count (public, returns just a number)
  const { data: regCount } = useRegCountQuery({
    queryKey: ['reg-count', id],
    queryFn: async () => {
      const res = await api.get<{ count: number }>(`/events/${id}/count`);
      return res.data.count;
    },
    enabled: !!id,
    // Suppress errors — this endpoint is optional
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg text-gray-500">Event not found.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to events
        </Link>
      </div>
    );
  }

  const past = isEventPast(event.dateTime);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-fade-in">
      {/* Back link */}
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        All Events
      </Link>

      {/* Image */}
      {event.imagePath ? (
        <img
          src={imageUrl(event.imagePath)}
          alt={event.title}
          className="mb-6 h-64 w-full rounded-xl object-cover sm:h-80"
        />
      ) : (
        <div className="mb-6 flex h-48 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
          <CalendarDays className="h-16 w-16 text-blue-200" />
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{event.title}</h1>
        <div className="flex gap-2 flex-wrap">
          {past ? (
            <Badge variant="secondary">Event Ended</Badge>
          ) : (
            <Badge variant="success">Upcoming</Badge>
          )}
          {event.capacity !== null && (
            <Badge variant="outline">
              <Users className="mr-1 h-3 w-3" />
              Capacity: {event.capacity}
            </Badge>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="mb-6 space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-500" />
          <span>{formatDateTime(event.dateTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span>{event.venue}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-500" />
          <span>Organized by {event.organizerName}</span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8 rounded-lg border border-gray-100 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
          About this event
        </h2>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* Registration */}
      <RegistrationButton
        eventId={event._id}
        eventDateTime={event.dateTime}
        capacity={event.capacity}
        registrationCount={regCount}
      />
    </div>
  );
}
