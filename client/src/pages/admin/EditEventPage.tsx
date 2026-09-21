import { DEPARTMENTS } from '@/lib/departments';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { eventSchema, EventFormData } from '@/schemas/event.schema';
import { getEventById, updateEvent } from '@/services/events.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUpload } from '@/components/ImageUpload';
import { toast } from '@/hooks/useToast';
import { imageUrl, utcToLocal } from '@/lib/utils';
import { useState } from 'react';

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    values: event
      ? {
          department: (event.department || 'All departments') as EventFormData['department'],
          title: event.title,
          description: event.description,
          dateTime: utcToLocal(event.dateTime),
          venue: event.venue,
          organizerName: event.organizerName,
          capacity: event.capacity?.toString() ?? '',
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (fd: FormData) => updateEvent(id!, fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['admin-events'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event updated successfully!', variant: 'success' });
      navigate('/admin');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Failed to update event',
        description: err.response?.data?.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    const fd = new FormData();
    fd.append('department', data.department || 'All departments');
    fd.append('title', data.title);
    fd.append('description', data.description);
    fd.append('dateTime', new Date(data.dateTime).toISOString());
    fd.append('venue', data.venue);
    fd.append('organizerName', data.organizerName);
    if (data.capacity) fd.append('capacity', data.capacity);
    if (imageFile) fd.append('image', imageFile);
    mutation.mutate(fd);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-gray-500">
        Event not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Event</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <FormField label="Title" error={errors.title?.message}>
          <Input {...register('title')} />
        </FormField>

        <div className="space-y-1.5">
          <Label htmlFor="department">Department</Label>
          <select id="department" className="department-select w-full" {...register('department')}>
            {DEPARTMENTS.map(department => <option key={department}>{department}</option>)}
          </select>
          {errors.department && <p className="text-xs text-red-600">{errors.department.message}</p>}
        </div>
        <FormField label="Description" error={errors.description?.message}>
          <Textarea rows={4} {...register('description')} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Date & Time" error={errors.dateTime?.message}>
            <Input type="datetime-local" {...register('dateTime')} />
          </FormField>
          <FormField label="Venue" error={errors.venue?.message}>
            <Input {...register('venue')} />
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Organizer Name" error={errors.organizerName?.message}>
            <Input {...register('organizerName')} />
          </FormField>
          <FormField
            label="Capacity (optional)"
            error={errors.capacity?.message}
            hint="Leave blank for unlimited"
          >
            <Input type="number" min="1" {...register('capacity')} />
          </FormField>
        </div>

        <div className="space-y-1.5">
          <Label>Event Image</Label>
          <ImageUpload
            onFileChange={setImageFile}
            currentImageUrl={event.imagePath ? imageUrl(event.imagePath) : undefined}
          />
          <p className="text-xs text-gray-400">
            Upload a new image to replace the current one.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {(isSubmitting || mutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
