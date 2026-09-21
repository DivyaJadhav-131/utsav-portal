import { DEPARTMENTS } from '@/lib/departments';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { eventSchema, EventFormData } from '@/schemas/event.schema';
import { createEvent } from '@/services/events.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ImageUpload';
import { toast } from '@/hooks/useToast';
import { useState } from 'react';

export function CreateEventPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({ resolver: zodResolver(eventSchema) });

  const mutation = useMutation({
    mutationFn: (fd: FormData) => createEvent(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event created successfully!', variant: 'success' });
      navigate('/admin');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Failed to create event',
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Event</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <FormField label="Title" error={errors.title?.message}>
          <Input placeholder="e.g. Annual Tech Fest 2025" {...register('title')} />
        </FormField>

        <div className="space-y-1.5">
          <Label htmlFor="department">Department</Label>
          <select id="department" className="department-select w-full" {...register('department')}>
            {DEPARTMENTS.map(department => <option key={department}>{department}</option>)}
          </select>
          {errors.department && <p className="text-xs text-red-600">{errors.department.message}</p>}
        </div>
        <FormField label="Description" error={errors.description?.message}>
          <Textarea
            placeholder="Describe the event…"
            rows={4}
            {...register('description')}
          />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Date & Time" error={errors.dateTime?.message}>
            <Input type="datetime-local" {...register('dateTime')} />
          </FormField>
          <FormField label="Venue" error={errors.venue?.message}>
            <Input placeholder="e.g. Main Auditorium" {...register('venue')} />
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Organizer Name" error={errors.organizerName?.message}>
            <Input placeholder="e.g. CSE Dept. / Coding Club" {...register('organizerName')} />
          </FormField>
          <FormField
            label="Capacity (optional)"
            error={errors.capacity?.message}
            hint="Leave blank for unlimited"
          >
            <Input
              type="number"
              min="1"
              placeholder="e.g. 200"
              {...register('capacity')}
            />
          </FormField>
        </div>

        <div className="space-y-1.5">
          <Label>Event Image (optional)</Label>
          <ImageUpload onFileChange={setImageFile} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {(isSubmitting || mutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Event
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// Small local helper to reduce repetition
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
