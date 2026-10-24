import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyRegistrations } from '@/services/api';
import { cancelRegistration } from '@/services/api';
import { CalendarDays, MapPin, Ticket, User } from 'lucide-react';
import { Badge } from '@/components/UI';
import { Skeleton } from '@/components/UI';
import { ConfirmDialog } from '@/components.jsx';
import { Button } from '@/components/UI';
import { toast } from '@/components.jsx';
import { formatDateTime, imageUrl, isEventPast } from '@/utils';
import { Link } from 'react-router-dom';
export function MyEventsPage() {
  const qc = useQueryClient();
  const { data: registrations, isLoading, isError } = useQuery({
    queryKey: ['margin-y-registrations'],
    queryFn: getMyRegistrations,
  });
  const cancelMutation = useMutation({
    mutationFn: cancelRegistration,
    onSuccess: () => {
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
  return (<div className="margin-x-auto max-width-4xl padding-x-4 padding-y-8 at-small-screen-padding-x-6">
    <h1 className="margin-bottom-6 font-size-2xl font-weight-bold text-color-gray-900">My Registrations</h1>

    {isLoading ? (<div className="children-gap-y-4">
      {[1, 2, 3].map((i) => (<div key={i} className="corner-radius-lg border-default border-color-gray-200 padding-4">
        <Skeleton className="margin-bottom-3 height-5 width-2-3" />
        <Skeleton className="height-4 width-1-2" />
        <Skeleton className="margin-top-2 height-4 width-1-3" />
      </div>))}
    </div>) : isError ? (<div className="corner-radius-lg border-default border-color-red-200 background-red-50 padding-6 text-align-center text-color-red-700">
      Failed to load registrations.
    </div>) : registrations && registrations.length > 0 ? (<div className="children-gap-y-4 animation-fade-in">
      {registrations.map(({ _id, event, registeredAt }) => {
        const past = isEventPast(event.dateTime);
        return (<div key={_id} className="display-flex flex-direction-column at-small-screen-flex-direction-row element-gap-4 corner-radius-lg border-default border-color-gray-200 background-white padding-4 box-shadow-sm">
          {/* Thumbnail */}
          <div className="height-24 width-full at-small-screen-width-32 flex-item-no-shrink overflow-hidden corner-radius-md background-gray-100">
            {event.imagePath ? (<img src={imageUrl(event.imagePath)} alt={event.title} className="height-full width-full image-fit-cover" />) : (<div className="display-flex height-full align-items-center justify-content-center background-blue-50">
              <CalendarDays className="height-8 width-8 text-color-blue-200" />
            </div>)}
          </div>

          {/* Info */}
          <div className="display-flex flex-item-fill flex-direction-column element-gap-1-5">
            <div className="display-flex flex-items-wrap align-items-start justify-content-between element-gap-2">
              <Link to={`/events/${event._id}`} className="font-size-base font-weight-semibold text-color-gray-900 on-hover-text-color-blue-700 animated-change-colors">
                {event.title}
              </Link>
              {past ? (<Badge variant="secondary">Ended</Badge>) : (<Badge variant="success">Upcoming</Badge>)}
            </div>

            <div className="display-flex flex-items-wrap element-gap-4 font-size-xs text-color-gray-500">
              <span className="display-flex align-items-center element-gap-1">
                <CalendarDays className="height-3-5 width-3-5 text-color-blue-400" />
                {formatDateTime(event.dateTime)}
              </span>
              <span className="display-flex align-items-center element-gap-1">
                <MapPin className="height-3-5 width-3-5 text-color-blue-400" />
                {event.venue}
              </span>
              <span className="display-flex align-items-center element-gap-1">
                <User className="height-3-5 width-3-5 text-color-blue-400" />
                {event.organizerName}
              </span>
            </div>

            <p className="font-size-xs text-color-gray-400">
              Registered on {formatDateTime(registeredAt)}
            </p>

            {!past && (<div className="margin-top-1">
              <ConfirmDialog trigger={<Button variant="outline" size="sm" className="border-color-red-200 text-color-red-600 on-hover-background-red-50" disabled={cancelMutation.isPending}>
                Cancel Registration
              </Button>} title="Cancel Registration" description={`Cancel your registration for "${event.title}"?`} confirmLabel="Yes, Cancel" confirmVariant="destructive" onConfirm={() => cancelMutation.mutate(event._id)} />
            </div>)}
          </div>
        </div>);
      })}
    </div>) : (<div className="display-flex flex-direction-column align-items-center justify-content-center padding-y-20 text-color-gray-400">
      <Ticket className="margin-bottom-4 height-14 width-14 opacity-30" />
      <p className="font-size-lg font-weight-medium">No registrations yet</p>
      <Link to="/" className="margin-top-3 font-size-sm text-color-blue-600 on-hover-text-underline">
        Browse events →
      </Link>
    </div>)}
  </div>);
}



