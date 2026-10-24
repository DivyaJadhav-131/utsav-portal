import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEventRegistrations } from '@/services/api';
import { getEventById } from '@/services/api';
import { Skeleton } from '@/components/UI';
import { Input } from '@/components/UI';
import { ArrowLeft, Users, Search } from 'lucide-react';
import { formatDateTime } from '@/utils';
export function EventRegistrationsPage() {
  const { id } = useParams();
  const [search, setSearch] = useState('');
  const { data: event } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  });
  const { data: registrations, isLoading, isError } = useQuery({
    queryKey: ['event-registrations', id],
    queryFn: () => getEventRegistrations(id),
    enabled: !!id,
  });
  const filtered = registrations?.filter((r) => r.student.name.toLowerCase().includes(search.toLowerCase()) ||
    r.student.email.toLowerCase().includes(search.toLowerCase()));
  return (<div className="margin-x-auto max-width-4xl padding-x-4 padding-y-8 at-small-screen-padding-x-6">
    <Link to="/admin" className="margin-bottom-4 display-inline-flex align-items-center element-gap-1-5 font-size-sm text-color-blue-600 on-hover-text-underline">
      <ArrowLeft className="height-4 width-4" />
      Back to Dashboard
    </Link>

    <div className="margin-bottom-6">
      <h1 className="font-size-2xl font-weight-bold text-color-gray-900">Registrations</h1>
      {event && (<p className="margin-top-1 font-size-sm text-color-gray-500">
        {event.title} · {formatDateTime(event.dateTime)}
      </p>)}
    </div>

    {/* Stats */}
    <div className="margin-bottom-4 display-flex align-items-center element-gap-3">
      <div className="display-flex align-items-center element-gap-2 corner-radius-lg border-default border-color-gray-200 background-white padding-x-4 padding-y-2">
        <Users className="height-4 width-4 text-color-blue-500" />
        <span className="font-size-sm font-weight-medium text-color-gray-700">
          {isLoading ? '…' : `${registrations?.length ?? 0} registered`}
          {event?.capacity ? ` / ${event.capacity} capacity` : ''}
        </span>
      </div>
    </div>

    {/* Search */}
    <div className="position-relative margin-bottom-5 max-width-sm">
      <Search className="interaction-pointer-events-none position-absolute offset-left-3 offset-top-1-2 height-4 width-4 translate-y-negative-1-2 text-color-gray-400" />
      <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="padding-left-9" />
    </div>

    {isLoading ? (<div className="children-gap-y-3">
      {[1, 2, 3].map((i) => (<Skeleton key={i} className="height-14 width-full corner-radius-lg" />))}
    </div>) : isError ? (<div className="corner-radius-lg border-default border-color-red-200 background-red-50 padding-6 text-align-center text-color-red-700">
      Failed to load registrations.
    </div>) : filtered && filtered.length > 0 ? (<div className="overflow-x-auto corner-radius-lg border-default border-color-gray-200 background-white animation-fade-in">
      <table className="min-width-full divide-y divide-gray-200">
        <thead className="background-gray-50">
          <tr>
            <th className="padding-x-4 padding-y-3 text-align-left font-size-xs font-weight-semibold text-color-gray-500 text-uppercase letter-spacing-wide">
              #
            </th>
            <th className="padding-x-4 padding-y-3 text-align-left font-size-xs font-weight-semibold text-color-gray-500 text-uppercase letter-spacing-wide">
              Name
            </th>
            <th className="padding-x-4 padding-y-3 text-align-left font-size-xs font-weight-semibold text-color-gray-500 text-uppercase letter-spacing-wide">
              Email
            </th>
            <th className="display-none padding-x-4 padding-y-3 text-align-left font-size-xs font-weight-semibold text-color-gray-500 text-uppercase letter-spacing-wide at-small-screen-display-table-cell">
              Registered At
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtered.map((reg, i) => (<tr key={reg._id} className="on-hover-background-gray-50">
            <td className="padding-x-4 padding-y-3 font-size-sm text-color-gray-400">{i + 1}</td>
            <td className="padding-x-4 padding-y-3 font-size-sm font-weight-medium text-color-gray-900">
              {reg.student.name}
            </td>
            <td className="padding-x-4 padding-y-3 font-size-sm text-color-gray-500">{reg.student.email}</td>
            <td className="display-none padding-x-4 padding-y-3 font-size-sm text-color-gray-400 at-small-screen-display-table-cell">
              {formatDateTime(reg.registeredAt)}
            </td>
          </tr>))}
        </tbody>
      </table>
    </div>) : (<div className="display-flex flex-direction-column align-items-center justify-content-center padding-y-16 text-color-gray-400">
      <Users className="margin-bottom-3 height-12 width-12 opacity-30" />
      <p className="font-size-base font-weight-medium">
        {search ? 'No students match your search' : 'No registrations yet'}
      </p>
    </div>)}
  </div>);
}



