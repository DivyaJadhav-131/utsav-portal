import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserCheck, UserMinus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  checkRegistration,
  registerForEvent,
  cancelRegistration,
} from '@/services/registrations.service';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from '@/hooks/useToast';
import { isEventPast } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface RegistrationButtonProps {
  eventId: string;
  eventDateTime: string;
  capacity: number | null;
  registrationCount?: number;
}

export function RegistrationButton({
  eventId,
  eventDateTime,
  capacity,
  registrationCount = 0,
}: RegistrationButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const past = isEventPast(eventDateTime);
  const isFull = capacity !== null && registrationCount >= capacity;

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['registration-status', eventId],
    queryFn: () => checkRegistration(eventId),
    enabled: !!user && user.role === 'student',
  });

  const registered = statusData?.registered ?? false;

  const registerMutation = useMutation({
    mutationFn: () => registerForEvent(eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registration-status', eventId] });
      qc.invalidateQueries({ queryKey: ['my-registrations'] });
      toast({ title: 'Registered successfully!', variant: 'success' });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Registration failed',
        description: err.response?.data?.message,
        variant: 'destructive',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelRegistration(eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registration-status', eventId] });
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

  if (!user) {
    return (
      <Button onClick={() => navigate('/login')} className="w-full sm:w-auto">
        Log in to Register
      </Button>
    );
  }

  if (user.role === 'admin') return null;

  if (statusLoading) {
    return (
      <Button disabled className="w-full sm:w-auto">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading…
      </Button>
    );
  }

  if (past) {
    return (
      <Button disabled variant="secondary" className="w-full sm:w-auto">
        Registration Closed
      </Button>
    );
  }

  if (registered) {
    return (
      <ConfirmDialog
        trigger={
          <Button
            variant="outline"
            className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50"
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserMinus className="mr-2 h-4 w-4" />
            )}
            Cancel Registration
          </Button>
        }
        title="Cancel Registration"
        description="Are you sure you want to cancel your registration for this event?"
        confirmLabel="Yes, Cancel"
        confirmVariant="destructive"
        onConfirm={() => cancelMutation.mutate()}
      />
    );
  }

  return (
    <Button
      onClick={() => registerMutation.mutate()}
      disabled={registerMutation.isPending || isFull}
      className="w-full sm:w-auto"
    >
      {registerMutation.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UserCheck className="mr-2 h-4 w-4" />
      )}
      {isFull ? 'Event Full' : 'Register Now'}
    </Button>
  );
}
