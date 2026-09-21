import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { AuthPage } from '@/pages/AuthPage';
import { MyEventsPage } from '@/pages/MyEventsPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { CreateEventPage } from '@/pages/admin/CreateEventPage';
import { EditEventPage } from '@/pages/admin/EditEventPage';
import { EventRegistrationsPage } from '@/pages/admin/EventRegistrationsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="login" element={<AuthPage />} />
        <Route path="signup" element={<AuthPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />

        {/* Student Routes */}
        <Route
          path="my-events"
          element={
            <ProtectedRoute role="student">
              <MyEventsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/events/create"
          element={
            <ProtectedRoute role="admin">
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/events/:id/edit"
          element={
            <ProtectedRoute role="admin">
              <EditEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/events/:id/registrations"
          element={
            <ProtectedRoute role="admin">
              <EventRegistrationsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
