export type Role = 'tutor' | 'student';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  telegram?: string;
  telegramChatId?: string;
  avatar: string;
  gradeLevel: string;
  subject: string;
  hourlyRate: number;
  notes: string;
  portalCode: string;
  active: boolean;
  joinedDate: string;
  // Violin-specific attributes
  instrumentSize?: string;
  currentRepertoire?: string[];
  currentEtude?: string;
  bowingGoals?: string;
}

export interface DayAvailability {
  enabled: boolean;
  start: string; // HH:mm format e.g. "09:00"
  end: string;   // HH:mm format e.g. "18:00"
}

export interface BlockedSlot {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  reason?: string;
}

export interface NotificationSettings {
  enableReminders: boolean;
  timingHoursBefore: number; // e.g. 24
  channels: ('email' | 'telegram')[];
  autoConfirmationOnBooking: boolean;
}

export interface TutorSettings {
  tutorName: string;
  tutorTitle: string;
  email: string;
  telegram: string;
  telegramChatId?: string;
  defaultHourlyRate: number;
  currency: string;
  allowStudentSelfBooking: boolean;
  allowStudentRescheduling: boolean;
  bufferMinutes: number; // 0, 10, 15, 30
  workingHours: { [dayOfWeek: number]: DayAvailability }; // 0 = Sunday, 1 = Monday, ...
  blockedSlots: BlockedSlot[];
  notifications: NotificationSettings;
  // Violin specific
  concertPitch?: 440 | 442 | 415;
  studioName?: string;
  primaryInstrument?: string;
}

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled';

export interface LessonSession {
  id: string;
  studentId: string;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number; // 30, 45, 60, 90, 120
  status: LessonStatus;
  isPaid: boolean;
  rate: number; // hourly rate or session rate
  amount: number; // total calculated amount
  topicNotes?: string;
  tutorFeedback?: string;
  meetingLink?: string;
  bookedBy: 'tutor' | 'student';
  createdAt: string;
  completedAt?: string;
  paidAt?: string;
  recurringGroupId?: string;
  recurrenceIndex?: number;
  recurrenceTotal?: number;
  // Violin practice assignments
  repertoireFocus?: string;
  practiceAssignments?: string;
}

export type NotificationType = 
  | 'booking_confirmation'
  | 'reminder'
  | 'rescheduled'
  | 'cancelled'
  | 'payment_received'
  | 'status_update';

export interface NotificationLog {
  id: string;
  recipientName: string;
  recipientContact: string;
  channel: 'email' | 'telegram';
  type: NotificationType;
  title: string;
  message: string;
  sentAt: string;
  sessionId?: string;
  status: 'delivered' | 'pending';
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface AppToast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  timestamp: string;
  duration?: number;
}

