import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyRegistrations } from '@/services/registrations.service';
import { cancelRegistration } from '@/services/registrations.service';
import { CalendarDays, MapPin, Ticket, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/useToast';
import { formatDateTime, imageUrl, isEventPast } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function MyEventsPage() {
  const qc = useQueryClient();

  const { data: registrations, isLoading, isError } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: getMyRegistrations,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelRegistration,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-registrations'] });
      toast({ title: 'Registration cancelled', variant: 'success' });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Cancellation failed',
        description: err.response?.data?.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Registrations</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-4">
              <Skeleton className="mb-3 h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-2 h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Failed to load registrations.
        </div>
      ) : registrations && registrations.length > 0 ? (
        <div className="space-y-4 animate-fade-in">
          {registrations.map(({ _id, event, registeredAt }) => {
            const past = isEventPast(event.dateTime);
            return (
              <div
                key={_id}
                className="flex flex-col sm:flex-row gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                {/* Thumbnail */}
                <div className="h-24 w-full sm:w-32 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {event.imagePath ? (
                    <img
                      src={imageUrl(event.imagePath)}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-blue-50">
                      <CalendarDays className="h-8 w-8 text-blue-200" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link
                      to={`/events/${event._id}`}
                      className="text-base font-semibold text-gray-900 hover:text-blue-700 transition-colors"
                    >
                      {event.title}
                    </Link>
                    {past ? (
                      <Badge variant="secondary">Ended</Badge>
                    ) : (
                      <Badge variant="success">Upcoming</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 text-blue-400" />
                      {formatDateTime(event.dateTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-400" />
                      {event.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-blue-400" />
                      {event.organizerName}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    Registered on {formatDateTime(registeredAt)}
                  </p>

                  {!past && (
                    <div className="mt-1">
                      <ConfirmDialog
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            disabled={cancelMutation.isPending}
                          >
                            Cancel Registration
                          </Button>
                        }
                        title="Cancel Registration"
                        description={`Cancel your registration for "${event.title}"?`}
                        confirmLabel="Yes, Cancel"
                        confirmVariant="destructive"
                        onConfirm={() => cancelMutation.mutate(event._id)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Ticket className="mb-4 h-14 w-14 opacity-30" />
          <p className="text-lg font-medium">No registrations yet</p>
          <Link to="/" className="mt-3 text-sm text-blue-600 hover:underline">
            Browse events →
          </Link>
        </div>
      )}
    </div>
  );
}
