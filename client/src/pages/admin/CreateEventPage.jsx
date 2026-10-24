import { DEPARTMENTS } from '@/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { eventSchema } from '@/utils';
import { createEvent } from '@/services/api';
import { Button } from '@/components/UI';
import { Input } from '@/components/UI';
import { Textarea } from '@/components/UI';
import { Label } from '@/components/UI';
import { ImageUpload } from '@/components/ImageUpload';
import { toast } from '@/components.jsx';
import { useState } from 'react';
export function CreateEventPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [imageFile, setImageFile] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({ resolver: zodResolver(eventSchema) });
  const mutation = useMutation({
    mutationFn: (fd) => createEvent(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      toast({ title: 'Event created successfully!', variant: 'success' });
      navigate('/admin');
    },
    onError: (err) => {
      toast({
        title: 'Failed to create event',
        description: err.response?.data?.message,
        variant: 'destructive',
      });
    },
  });
  // Send text fields and the optional poster together as multipart form data.
  const onSubmit = (data) => {
    const fd = new FormData();
    fd.append('department', data.department || 'All departments');
    fd.append('title', data.title);
    fd.append('description', data.description);
    fd.append('dateTime', new Date(data.dateTime).toISOString());
    fd.append('venue', data.venue);
    fd.append('organizerName', data.organizerName);
    if (data.capacity)
      fd.append('capacity', data.capacity);
    if (imageFile)
      fd.append('image', imageFile);
    mutation.mutate(fd);
  };
  return (<div className="margin-x-auto max-width-2xl padding-x-4 padding-y-8 at-small-screen-padding-x-6">
    <Link to="/admin" className="margin-bottom-4 display-inline-flex align-items-center element-gap-1-5 font-size-sm text-color-blue-600 on-hover-text-underline">
      <ArrowLeft className="height-4 width-4" />
      Back to Dashboard
    </Link>

    <h1 className="margin-bottom-6 font-size-2xl font-weight-bold text-color-gray-900">Create New Event</h1>

    <form onSubmit={handleSubmit(onSubmit)} className="children-gap-y-5 corner-radius-lg border-default border-color-gray-200 background-white padding-6 box-shadow-sm">
      <FormField label="Title" error={errors.title?.message}>
        <Input placeholder="e.g. Annual Tech Fest 2025" {...register('title')} />
      </FormField>

      <div className="children-gap-y-1-5">
        <Label htmlFor="department">Department</Label>
        <select id="department" className="department-select width-full" {...register('department')}>
          {DEPARTMENTS.map(department => <option key={department}>{department}</option>)}
        </select>
        {errors.department && <p className="font-size-xs text-color-red-600">{errors.department.message}</p>}
      </div>
      <FormField label="Description" error={errors.description?.message}>
        <Textarea placeholder="Describe the event…" rows={4} {...register('description')} />
      </FormField>

      <div className="display-grid element-gap-5 at-small-screen-grid-columns-2">
        <FormField label="Date & Time" error={errors.dateTime?.message}>
          <Input type="datetime-local" {...register('dateTime')} />
        </FormField>
        <FormField label="Venue" error={errors.venue?.message}>
          <Input placeholder="e.g. Main Auditorium" {...register('venue')} />
        </FormField>
      </div>

      <div className="display-grid element-gap-5 at-small-screen-grid-columns-2">
        <FormField label="Organizer Name" error={errors.organizerName?.message}>
          <Input placeholder="e.g. CSE Dept. / Coding Club" {...register('organizerName')} />
        </FormField>
        <FormField label="Capacity (optional)" error={errors.capacity?.message} hint="Leave blank for unlimited">
          <Input type="number" min="1" placeholder="e.g. 200" {...register('capacity')} />
        </FormField>
      </div>

      <div className="children-gap-y-1-5">
        <Label>Event Image (optional)</Label>
        <ImageUpload onFileChange={setImageFile} />
      </div>

      <div className="display-flex element-gap-3 padding-top-2">
        <Button type="submit" disabled={isSubmitting || mutation.isPending}>
          {(isSubmitting || mutation.isPending) && (<Loader2 className="margin-right-2 height-4 width-4 animation-spin" />)}
          Create Event
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
          Cancel
        </Button>
      </div>
    </form>
  </div>);
}
// Small local helper to reduce repetition
function FormField({ label, error, hint, children, }) {
  return (<div className="children-gap-y-1-5">
    <Label>{label}</Label>
    {children}
    {hint && !error && <p className="font-size-xs text-color-gray-400">{hint}</p>}
    {error && <p className="font-size-xs text-color-red-600">{error}</p>}
  </div>);
}



