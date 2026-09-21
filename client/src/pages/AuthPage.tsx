import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, ArrowRight, Sparkles, Users, CalendarDays, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginSchema, signupSchema, SignupFormData } from '@/schemas/auth.schema';
import { login, signup } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/useToast';

function AccountForm({ creating }: { creating: boolean }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormData>({ resolver: zodResolver(creating ? signupSchema : loginSchema) });
  const submit = async (data: SignupFormData) => {
    try {
      const user = await (creating ? signup(data) : login(data));
      setUser(user);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      toast({ title: `Welcome${creating ? '' : ' back'}, ${user.name}!`, variant: 'success' });
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (error) {
      toast({ title: creating ? 'Sign up failed' : 'Login failed', description: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Please try again.', variant: 'destructive' });
    }
  };
  return <div className="auth-form-inner">
    <Link to="/" className="auth-logo"><GraduationCap /> Utsav</Link>
    <h1>{creating ? 'Create your account' : 'Sign in to Utsav'}</h1>
    <p className="auth-subtitle">{creating ? 'Your next great campus memory starts here.' : 'Good to see you. Your campus is waiting.'}</p>
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      {creating && <div className="space-y-2"><Label htmlFor="signup-name">Full name</Label><Input id="signup-name" autoComplete="name" placeholder="Your full name" {...register('name')} aria-invalid={!!errors.name} />{errors.name && <p role="alert" className="text-xs text-red-600">{errors.name.message}</p>}</div>}
      <div className="space-y-2"><Label htmlFor={creating ? 'signup-email' : 'login-email'}>Email</Label><Input id={creating ? 'signup-email' : 'login-email'} type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} aria-invalid={!!errors.email} />{errors.email && <p role="alert" className="text-xs text-red-600">{errors.email.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor={creating ? 'signup-password' : 'login-password'}>Password</Label><div className="relative"><Input id={creating ? 'signup-password' : 'login-password'} type={visible ? 'text' : 'password'} autoComplete={creating ? 'new-password' : 'current-password'} placeholder={creating ? 'At least 6 characters' : 'Enter your password'} className="pr-12" {...register('password')} aria-invalid={!!errors.password} /><button type="button" className="absolute right-3 top-3 text-slate-500" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <p role="alert" className="text-xs text-red-600">{errors.password.message}</p>}</div>
      {creating && <p className="text-xs leading-relaxed text-slate-500">You'll join as a <strong>Student</strong>. Admin accounts are managed separately.</p>}
      <Button className="w-full h-12" disabled={isSubmitting}>{isSubmitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : null}{creating ? 'Create account' : 'Sign in'}<ArrowRight size={17} className="ml-2" /></Button>
    </form>
    <p className="mt-6 text-sm text-slate-500">{creating ? 'Already part of the community?' : "Don't have an account?"} <Link state={location.state} className="font-semibold text-blue-700" to={creating ? '/login' : '/signup'}>{creating ? 'Sign in' : 'Sign up'}</Link></p>
  </div>;
}

export function AuthPage() {
  const location = useLocation();
  const creating = location.pathname === '/signup';
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return <div className="auth-page"><div className={`auth-shell glass-panel ${creating ? 'is-signup' : ''}`}>
    <section className="auth-form-panel"><AccountForm key={creating ? 'signup' : 'login'} creating={creating} /></section>
    <aside className="auth-story"><div className="auth-story-copy"><span className="eyebrow">ONE CAMPUS. ENDLESS POSSIBILITIES.</span><h2>{creating ? 'Find your people.\nMake your moment.' : 'Welcome back!\nYour next chapter awaits.'}</h2><p>{creating ? 'Join a more vibrant campus. Explore new ideas, build your network, and be part of something memorable.' : 'Discover inspiring events and reconnect with the people and experiences that make campus life yours.'}</p><div className="auth-benefits"><span><Sparkles size={17} /> Discover new opportunities</span><span><CalendarDays size={17} /> Learn beyond the classroom</span><span><Users size={17} /> Build your community</span></div><Link className="story-switch" to={creating ? '/login' : '/signup'} state={location.state}>{creating ? 'Already a member? Sign in' : 'New here? Join the community'} <ArrowRight size={17} /></Link></div><div className="auth-photo"><div className="photo-caption"><GraduationCap size={28} /><span>Good events.<br /><strong>Brighter futures.</strong></span></div></div></aside>
  </div><p className="auth-footnote">Learn. Connect. Grow. Together at Utsav.</p></div>;
}
