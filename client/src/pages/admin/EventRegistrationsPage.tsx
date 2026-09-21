import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEventRegistrations } from '@/services/events.service';
import { getEventById } from '@/services/events.service';
import { AdminRegistration } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, Search } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export function EventRegistrationsPage() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState('');

  const { data: event } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
  });

  const { data: registrations, isLoading, isError } = useQuery<AdminRegistration[]>({
    queryKey: ['event-registrations', id],
    queryFn: () => getEventRegistrations(id!),
    enabled: !!id,
  });

  const filtered = registrations?.filter(
    (r) =>
      r.student.name.toLowerCase().includes(search.toLowerCase()) ||
      r.student.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
        {event && (
          <p className="mt-1 text-sm text-gray-500">
            {event.title} · {formatDateTime(event.dateTime)}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            {isLoading ? '…' : `${registrations?.length ?? 0} registered`}
            {event?.capacity ? ` / ${event.capacity} capacity` : ''}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          Failed to load registrations.
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white animate-fade-in">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Email
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide sm:table-cell">
                  Registered At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((reg, i) => (
                <tr key={reg._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {reg.student.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{reg.student.email}</td>
                  <td className="hidden px-4 py-3 text-sm text-gray-400 sm:table-cell">
                    {formatDateTime(reg.registeredAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Users className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-base font-medium">
            {search ? 'No students match your search' : 'No registrations yet'}
          </p>
        </div>
      )}
    </div>
  );
}
