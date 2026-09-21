import { DEPARTMENTS } from '@/lib/departments';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  CalendarDays,
  Search,
} from 'lucide-react';
import { getEvents, deleteEvent } from '@/services/events.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from '@/hooks/useToast';
import { formatDateTime, imageUrl, isEventPast } from '@/lib/utils';

export function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All departments');
  const qc = useQueryClient();

  const { data: allEvents, isLoading, isError } = useQuery({
    queryKey: ['admin-events', search],
    queryFn: () => getEvents(search),
  });

  const events = allEvents?.filter(event => department === 'All departments' || event.department === department);

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event deleted', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to delete event', variant: 'destructive' }),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Manage all college events</p>
        </div>
        <Button asChild>
          <Link to="/admin/events/create">
            <Plus className="mr-1.5 h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="filter-panel glass-panel">
        <label htmlFor="admin-department" className="mr-4 text-sm font-medium">Department</label>
        <select id="admin-department" className="department-select" value={department} onChange={e => setDepartment(e.target.value)}>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>
      {isError && <p role="alert" className="mb-6 text-red-700">Could not load events. Please reload to try again.</p>}
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Total Events</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {isLoading ? '—' : events?.length ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Upcoming</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">
            {isLoading
              ? '—'
              : events?.filter((e) => !isEventPast(e.dateTime)).length ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500">Past Events</p>
          <p className="mt-1 text-2xl font-bold text-gray-400">
            {isLoading
              ? '—'
              : events?.filter((e) => isEventPast(e.dateTime)).length ?? 0}
          </p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Event
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide sm:table-cell">
                  Date & Time
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide md:table-cell">
                  Venue
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => {
                const past = isEventPast(event.dateTime);
                return (
                  <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {event.imagePath ? (
                            <img
                              src={imageUrl(event.imagePath)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-blue-50">
                              <CalendarDays className="h-4 w-4 text-blue-300" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 text-sm line-clamp-1">
                          {event.title}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-gray-500 sm:table-cell">
                      {formatDateTime(event.dateTime)}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell truncate max-w-[160px]">
                      {event.venue}
                    </td>
                    <td className="px-4 py-3">
                      {past ? (
                        <Badge variant="secondary">Ended</Badge>
                      ) : (
                        <Badge variant="success">Upcoming</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild title="View registrations">
                          <Link to={`/admin/events/${event._id}/registrations`}>
                            <Users className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Edit event">
                          <Link to={`/admin/events/${event._id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-50 hover:text-red-600"
                              title="Delete event"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Delete Event"
                          description={`Permanently delete "${event.title}"? This will also remove all registrations.`}
                          confirmLabel="Delete"
                          confirmVariant="destructive"
                          onConfirm={() => deleteMutation.mutate(event._id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <CalendarDays className="mb-4 h-14 w-14 opacity-30" />
          <p className="text-lg font-medium">
            {search ? 'No events match your search' : 'No events yet'}
          </p>
          {!search && (
            <Button className="mt-4" asChild>
              <Link to="/admin/events/create">Create your first event</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
