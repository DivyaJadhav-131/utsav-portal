// ── Domain Types ──────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface Event {
  _id: string;
  department?: string;
  title: string;
  description: string;
  dateTime: string; // ISO string from the server
  venue: string;
  imagePath: string | null;
  capacity: number | null;
  organizerName: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Registration as returned for students (event is populated)
export interface Registration {
  _id: string;
  event: Event;
  student: string;
  registeredAt: string;
}

// Registration as returned for admins (student is populated)
export interface AdminRegistration {
  _id: string;
  event: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  registeredAt: string;
}
