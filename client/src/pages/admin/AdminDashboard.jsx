import { DEPARTMENTS } from '@/utils';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users, CalendarDays, Search, } from 'lucide-react';
import { getEvents, deleteEvent } from '@/services/api';
import { Button } from '@/components/UI';
import { Input } from '@/components/UI';
import { Badge } from '@/components/UI';
import { Skeleton } from '@/components/UI';
import { ConfirmDialog } from '@/components.jsx';
import { toast } from '@/components.jsx';
import { formatDateTime, imageUrl, isEventPast } from '@/utils';
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
  return (<div className="margin-x-auto max-width-7xl padding-x-4 padding-y-8 at-small-screen-padding-x-6">
    {/* Header */}
    <div className="margin-bottom-6 display-flex flex-direction-column element-gap-3 at-small-screen-flex-direction-row at-small-screen-align-items-center at-small-screen-justify-content-between">
      <div>
        <h1 className="font-size-2xl font-weight-bold text-color-gray-900">Admin Dashboard</h1>
        <p className="font-size-sm text-color-gray-500">Manage all college events</p>
      </div>
      <Button asChild>
        <Link to="/admin/events/create">
          <Plus className="margin-right-1-5 height-4 width-4" />
          New Event
        </Link>
      </Button>
    </div>

    {/* Search */}
    <div className="position-relative margin-bottom-6 max-width-sm">
      <Search className="interaction-pointer-events-none position-absolute offset-left-3 offset-top-1-2 height-4 width-4 translate-y-negative-1-2 text-color-gray-400" />
      <Input placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)} className="padding-left-9" />
    </div>

    <div className="filter-panel glass-panel">
      <label htmlFor="admin-department" className="margin-right-4 font-size-sm font-weight-medium">Department</label>
      <select id="admin-department" className="department-select" value={department} onChange={e => setDepartment(e.target.value)}>
        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
      </select>
    </div>
    {isError && <p role="alert" className="margin-bottom-6 text-color-red-700">Could not load events. Please reload to try again.</p>}
    {/* Stats */}
    <div className="margin-bottom-6 display-grid grid-columns-2 element-gap-4 at-small-screen-grid-columns-3">
      <div className="corner-radius-lg border-default border-color-gray-200 background-white padding-4">
        <p className="font-size-xs text-color-gray-500">Total Events</p>
        <p className="margin-top-1 font-size-2xl font-weight-bold text-color-gray-900">
          {isLoading ? '—' : events?.length ?? 0}
        </p>
      </div>
      <div className="corner-radius-lg border-default border-color-gray-200 background-white padding-4">
        <p className="font-size-xs text-color-gray-500">Upcoming</p>
        <p className="margin-top-1 font-size-2xl font-weight-bold text-color-blue-700">
          {isLoading
            ? '—'
            : events?.filter((e) => !isEventPast(e.dateTime)).length ?? 0}
        </p>
      </div>
      <div className="corner-radius-lg border-default border-color-gray-200 background-white padding-4 grid-column-span-2 at-small-screen-grid-column-span-1">
        <p className="font-size-xs text-color-gray-500">Past Events</p>
        <p className="margin-top-1 font-size-2xl font-weight-bold text-color-gray-400">
          {isLoading
            ? '—'
            : events?.filter((e) => isEventPast(e.dateTime)).length ?? 0}
        </p>
      </div>
    </div>

    {/* Table */}
    {isLoading ? (<div className="children-gap-y-3">
      {[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="height-16 width-full corner-radius-lg" />))}
    </div>) : events && events.length > 0 ? (<div className="overflow-x-auto corner-radius-lg border-default border-color-gray-200 background-white">
      <table className="min-width-full divide-y divide-gray-200">
        <thead className="background-gray-50">
          <tr>
            <th className="padding-x-4 padding-y-3 text-align-left font-size-xs font-weight-semibold text-color-gray-500 text-uppercase letter-spacing-wide">
              Event
            </th>
            <th className="display-none padding-x-4 padding-y-3 text-align-left font-size-xs font-weight-semibold text-color-gray-500 text-uppercase letter-spacing-wide at-small-screen-display-table-cell">
              Date & Time
            </th>
            <th className="display-none padding-x-4 padding-y-3 text-align-left font-size-xs font-weight-semibold text-color-gray-500 text-uppercase letter-spacing-wide at-medium-screen-display-table-cell">
              Venue
            </th>
            <th className="padding-x-4 padding-y-3 text-align-left font-size-xs font-weight-semibold text-color-gray-500 text-uppercase letter-spacing-wide">
              Status
            </th>
            <th className="padding-x-4 padding-y-3 text-align-right font-size-xs font-weight-semibold text-color-gray-500 text-uppercase letter-spacing-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((event) => {
            const past = isEventPast(event.dateTime);
            return (<tr key={event._id} className="on-hover-background-gray-50 animated-change-colors">
              <td className="padding-x-4 padding-y-3">
                <div className="display-flex align-items-center element-gap-3">
                  <div className="height-9 width-9 flex-item-no-shrink overflow-hidden corner-radius-md background-gray-100">
                    {event.imagePath ? (<img src={imageUrl(event.imagePath)} alt="" className="height-full width-full image-fit-cover" />) : (<div className="display-flex height-full align-items-center justify-content-center background-blue-50">
                      <CalendarDays className="height-4 width-4 text-color-blue-300" />
                    </div>)}
                  </div>
                  <span className="font-weight-medium text-color-gray-900 font-size-sm text-lines-1">
                    {event.title}
                  </span>
                </div>
              </td>
              <td className="display-none padding-x-4 padding-y-3 font-size-sm text-color-gray-500 at-small-screen-display-table-cell">
                {formatDateTime(event.dateTime)}
              </td>
              <td className="display-none padding-x-4 padding-y-3 font-size-sm text-color-gray-500 at-medium-screen-display-table-cell text-truncate max-width-160px">
                {event.venue}
              </td>
              <td className="padding-x-4 padding-y-3">
                {past ? (<Badge variant="secondary">Ended</Badge>) : (<Badge variant="success">Upcoming</Badge>)}
              </td>
              <td className="padding-x-4 padding-y-3">
                <div className="display-flex align-items-center justify-content-end element-gap-1">
                  <Button variant="ghost" size="icon" asChild title="View registrations">
                    <Link to={`/admin/events/${event._id}/registrations`}>
                      <Users className="height-4 width-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild title="Edit event">
                    <Link to={`/admin/events/${event._id}/edit`}>
                      <Pencil className="height-4 width-4" />
                    </Link>
                  </Button>
                  <ConfirmDialog trigger={<Button variant="ghost" size="icon" className="text-color-red-500 on-hover-background-red-50 on-hover-text-color-red-600" title="Delete event" disabled={deleteMutation.isPending}>
                    <Trash2 className="height-4 width-4" />
                  </Button>} title="Delete Event" description={`Permanently delete "${event.title}"? This will also remove all registrations.`} confirmLabel="Delete" confirmVariant="destructive" onConfirm={() => deleteMutation.mutate(event._id)} />
                </div>
              </td>
            </tr>);
          })}
        </tbody>
      </table>
    </div>) : (<div className="display-flex flex-direction-column align-items-center justify-content-center padding-y-20 text-color-gray-400">
      <CalendarDays className="margin-bottom-4 height-14 width-14 opacity-30" />
      <p className="font-size-lg font-weight-medium">
        {search ? 'No events match your search' : 'No events yet'}
      </p>
      {!search && (<Button className="margin-top-4" asChild>
        <Link to="/admin/events/create">Create your first event</Link>
      </Button>)}
    </div>)}
  </div>);
}



