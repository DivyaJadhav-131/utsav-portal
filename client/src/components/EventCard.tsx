import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { Event } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, imageUrl, isEventPast } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const past = isEventPast(event.dateTime);

  return (
    <Link
      to={`/events/${event._id}`}
      className="event-card group flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        {event.imagePath ? (
          <img
            src={imageUrl(event.imagePath)}
            alt={event.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <CalendarDays className="h-12 w-12 text-blue-300" />
          </div>
        )}
        {past && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="rounded-full bg-gray-800/80 px-3 py-1 text-xs font-semibold text-white">
              Event Ended
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="department-badge">{event.department || 'All departments'}</span>
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
          {event.title}
        </h3>

        <div className="mt-auto space-y-1.5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            <span>{formatDateTime(event.dateTime)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {event.capacity !== null && (
          <div className="flex items-center gap-1.5 mt-1">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            <Badge variant="secondary" className="text-xs">
              Capacity: {event.capacity}
            </Badge>
          </div>
        )}
      </div>
    </Link>
  );
}
