import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Role, 
  Student, 
  TutorSettings, 
  LessonSession, 
  NotificationLog, 
  BlockedSlot,
  AppToast,
  ToastType 
} from '../types';
import { 
  INITIAL_TUTOR_SETTINGS, 
  INITIAL_STUDENTS, 
  INITIAL_SESSIONS, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';
import { addWeeksToDate } from '../utils/availability';
import { playNotificationChime } from '../utils/audio';

interface StudentLedgerStats {
  totalSessions: number;
  completedSessions: number;
  totalBilled: number;
  totalPaid: number;
  balanceDue: number;
  sessions: LessonSession[];
}

interface OverallFinancials {
  totalRevenue: number;
  totalPendingDues: number;
  totalSessionsCompleted: number;
  upcomingCount: number;
  unpaidSessionsCount: number;
}

interface AppContextType {
  role: Role;
  currentStudentId: string | null;
  currentStudent: Student | null;
  students: Student[];
  sessions: LessonSession[];
  tutorSettings: TutorSettings;
  notifications: NotificationLog[];
  toasts: AppToast[];
  addToast: (toast: Omit<AppToast, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  notify: (type: ToastType, title: string, message?: string, duration?: number) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  
  // Auth / Role actions
  loginAsTutor: () => void;
  loginAsStudent: (studentId: string) => void;
  loginWithPortalCode: (code: string) => boolean;
  logout: () => void;

  // Session actions
  addLesson: (session: Omit<LessonSession, 'id' | 'createdAt'>) => string;
  addRecurringLessons: (
    session: Omit<LessonSession, 'id' | 'createdAt'>,
    weeksCount?: number
  ) => string[];
  cancelRecurringSeries: (recurringGroupId: string, futureOnlyFromDate?: string) => void;
  deleteRecurringSeries: (recurringGroupId: string) => void;
  updateLesson: (id: string, updates: Partial<LessonSession>) => void;
  cancelLesson: (id: string) => void;
  deleteLesson: (id: string) => void;
  rescheduleLesson: (id: string, newDate: string, newStartTime: string) => void;
  toggleLessonComplete: (id: string, isCompleted: boolean, feedback?: string) => void;
  toggleLessonPaid: (id: string, isPaid: boolean) => void;

  // Student actions
  addStudent: (studentData: Omit<Student, 'id' | 'joinedDate' | 'portalCode'>) => string;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string, removeSessions?: boolean) => void;
  markAllPaidForStudent: (studentId: string) => void;

  // Tutor settings
  updateTutorSettings: (updates: Partial<TutorSettings>) => void;
  addBlockedSlot: (slot: Omit<BlockedSlot, 'id'>) => void;
  removeBlockedSlot: (id: string) => void;

  // Notifications
  sendNotification: (
    recipientName: string,
    recipientContact: string,
    channel: 'email' | 'telegram',
    type: NotificationLog['type'],
    title: string,
    message: string,
    sessionId?: string
  ) => void;

  // Computed views
  getStudentLedger: (studentId: string) => StudentLedgerStats;
  getOverallFinancials: () => OverallFinancials;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  ROLE: 'violin_studio_role_v3',
  STUDENT_ID: 'violin_studio_student_id_v3',
  STUDENTS: 'violin_studio_students_v3',
  SESSIONS: 'violin_studio_sessions_v3',
  SETTINGS: 'violin_studio_settings_v3',
  NOTIFICATIONS: 'violin_studio_notifications_v3',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role & auth
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as Role) || 'tutor';
  });

  const [currentStudentId, setCurrentStudentId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.STUDENT_ID) || 'stu-1';
  });

  // Data states
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [sessions, setSessions] = useState<LessonSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [tutorSettings, setTutorSettings] = useState<TutorSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tutorName === 'Maestro Julian Vance' || parsed.tutorName === 'Dr. Vance') {
          parsed.tutorName = '';
        }
        return parsed;
      } catch (e) {
        return INITIAL_TUTOR_SETTINGS;
      }
    }
    return INITIAL_TUTOR_SETTINGS;
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    if (currentStudentId) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_ID, currentStudentId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.STUDENT_ID);
    }
  }, [currentStudentId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(tutorSettings));
  }, [tutorSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Current student object
  const currentStudent = useMemo(() => {
    if (!currentStudentId) return null;
    return students.find(s => s.id === currentStudentId) || null;
  }, [students, currentStudentId]);

  // Real-time Toasts & Audio Notifications
  const [toasts, setToasts] = useState<AppToast[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('tutor_app_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('tutor_app_sound_enabled', String(next));
      return next;
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (toastData: Omit<AppToast, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newToast: AppToast = {
      ...toastData,
      id,
      timestamp,
    };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    if (soundEnabled) {
      playNotificationChime(toastData.type);
    }
  };

  const notify = (type: ToastType, title: string, message?: string, duration = 4500) => {
    addToast({ type, title, message, duration });
  };

  // Auth actions
  const loginAsTutor = () => {
    setRole('tutor');
    notify('info', 'Tutor Admin Access', 'Switched to tutor administrative workspace');
  };

  const loginAsStudent = (studentId: string) => {
    setRole('student');
    setCurrentStudentId(studentId);
    const stu = students.find(s => s.id === studentId);
    notify('info', 'Student Portal Active', `Logged into student account: ${stu?.name || 'Student'}`);
  };

  const loginWithPortalCode = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    const found = students.find(s => s.portalCode.toUpperCase() === cleanCode);
    if (found) {
      setRole('student');
      setCurrentStudentId(found.id);
      notify('success', 'Portal Code Verified', `Welcome back, ${found.name}! Your private schedule and ledger are ready.`);
      return true;
    }
    notify('error', 'Invalid Access Code', `No student profile found with code "${code}". Please check and try again.`);
    return false;
  };

  const logout = () => {
    setRole('tutor');
    notify('info', 'Logged Out', 'Returned to tutor view');
  };

  // Notification sender helper
  const sendNotification = (
    recipientName: string,
    recipientContact: string,
    channel: 'email' | 'telegram',
    type: NotificationLog['type'],
    title: string,
    message: string,
    sessionId?: string
  ) => {
    const newLog: NotificationLog = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      recipientName,
      recipientContact,
      channel,
      type,
      title,
      message,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      sessionId,
      status: 'delivered',
    };
    setNotifications(prev => [newLog, ...prev]);
    // Dispatch instant on-screen notification alert
    notify(
      'info',
      `${channel.toUpperCase()} Dispatched to ${recipientName}`,
      `"${title}" • Sent to ${recipientContact}`,
      5000
    );
  };

  // Session actions
  const addLesson = (sessionData: Omit<LessonSession, 'id' | 'createdAt'>): string => {
    const newId = `sess-${Date.now()}`;
    const newSession: LessonSession = {
      ...sessionData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setSessions(prev => [newSession, ...prev]);

    const student = students.find(s => s.id === sessionData.studentId);
    notify(
      'success',
      'Lesson Scheduled',
      `${sessionData.subject} booked for ${student?.name || 'Student'} on ${sessionData.date} at ${sessionData.startTime}`
    );

    // Check if auto-confirmation should trigger
    if (tutorSettings.notifications.autoConfirmationOnBooking) {
      const student = students.find(s => s.id === sessionData.studentId);
      if (student) {
        const channel = tutorSettings.notifications.channels[0] || 'email';
        const contact = channel === 'telegram' && student.telegram ? student.telegram : student.email;
        sendNotification(
          student.name,
          contact,
          channel,
          'booking_confirmation',
          `Session Booked: ${sessionData.subject} on ${sessionData.date}`,
          `Hi ${student.name}, your ${sessionData.subject} lesson is scheduled for ${sessionData.date} at ${sessionData.startTime} (${sessionData.durationMinutes} mins). Meeting link: ${sessionData.meetingLink || 'Provided by tutor'}`,
          newId
        );
      }
    }

    return newId;
  };

  const addRecurringLessons = (
    sessionData: Omit<LessonSession, 'id' | 'createdAt'>,
    weeksCount = 12
  ): string[] => {
    const groupId = `rec-${Date.now()}`;
    const newSessionIds: string[] = [];
    const newSessionsToAdd: LessonSession[] = [];
    const createdDate = new Date().toISOString().split('T')[0];

    const [year, month, day] = sessionData.date.split('-').map(Number);
    const startDateObj = new Date(year, month - 1, day);
    const dayOfWeekName = startDateObj.toLocaleDateString('en-US', { weekday: 'long' });

    for (let i = 0; i < weeksCount; i++) {
      const occurrenceDate = addWeeksToDate(sessionData.date, i);
      const newId = `sess-${Date.now()}-${i}`;
      newSessionIds.push(newId);

      newSessionsToAdd.push({
        ...sessionData,
        id: newId,
        date: occurrenceDate,
        createdAt: createdDate,
        recurringGroupId: groupId,
        recurrenceIndex: i + 1,
        recurrenceTotal: weeksCount,
      });
    }

    setSessions(prev => [...newSessionsToAdd, ...prev]);

    const student = students.find(s => s.id === sessionData.studentId);
    const lastDate = newSessionsToAdd[newSessionsToAdd.length - 1].date;
    notify(
      'success',
      `12 Weekly Lessons Scheduled (${weeksCount} Sessions)`,
      `Regular 3-month schedule set for ${student?.name || 'Student'} every ${dayOfWeekName} at ${sessionData.startTime} through ${lastDate}`
    );

    if (tutorSettings.notifications.autoConfirmationOnBooking) {
      const student = students.find(s => s.id === sessionData.studentId);
      if (student) {
        const lastDate = newSessionsToAdd[newSessionsToAdd.length - 1].date;
        const channel = tutorSettings.notifications.channels[0] || 'email';
        const contact = channel === 'telegram' && student.telegram ? student.telegram : student.email;
        sendNotification(
          student.name,
          contact,
          channel,
          'booking_confirmation',
          `Regular Schedule Confirmed: Every ${dayOfWeekName} (${weeksCount} Lessons)`,
          `Hi ${student.name}, your regular 3-month lesson schedule is reserved for every ${dayOfWeekName} at ${sessionData.startTime} (${sessionData.durationMinutes} mins) from ${sessionData.date} through ${lastDate}. Meeting link: ${sessionData.meetingLink || 'Provided by tutor'}`,
          newSessionIds[0]
        );
      }
    }

    return newSessionIds;
  };

  const cancelRecurringSeries = (recurringGroupId: string, futureOnlyFromDate?: string) => {
    let cancelledCount = 0;
    setSessions(prev =>
      prev.map(s => {
        if (s.recurringGroupId === recurringGroupId) {
          if (!futureOnlyFromDate || s.date >= futureOnlyFromDate) {
            cancelledCount++;
            return { ...s, status: 'cancelled' };
          }
        }
        return s;
      })
    );
    notify(
      'warning',
      'Recurring Series Cancelled',
      'Remaining weekly sessions in the 3-month series were cancelled'
    );
  };

  const deleteRecurringSeries = (recurringGroupId: string) => {
    setSessions(prev => prev.filter(s => s.recurringGroupId !== recurringGroupId));
    notify(
      'warning',
      'Recurring Series Deleted',
      'All lessons in the 3-month series were permanently removed'
    );
  };

  const updateLesson = (id: string, updates: Partial<LessonSession>) => {
    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
    notify('info', 'Session Updated', 'Lesson details were successfully updated');
  };

  const cancelLesson = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'cancelled' } : s))
    );

    notify(
      'warning',
      'Lesson Cancelled',
      `${session.subject} on ${session.date} at ${session.startTime} has been cancelled`
    );

    const student = students.find(s => s.id === session.studentId);
    if (student) {
      const channel = tutorSettings.notifications.channels[0] || 'email';
      const contact = channel === 'telegram' && student.telegram ? student.telegram : student.email;
      sendNotification(
        student.name,
        contact,
        channel,
        'cancelled',
        `Cancelled: ${session.subject} on ${session.date}`,
        `Hi ${student.name}, your session on ${session.date} at ${session.startTime} has been cancelled.`,
        id
      );
    }
  };

  const deleteLesson = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    setSessions(prev => prev.filter(s => s.id !== id));
    notify(
      'warning',
      'Lesson Removed',
      `${session.subject} on ${session.date} was removed`
    );
  };

  const rescheduleLesson = (id: string, newDate: string, newStartTime: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, date: newDate, startTime: newStartTime } : s))
    );

    notify(
      'success',
      'Lesson Rescheduled',
      `Session moved to ${newDate} at ${newStartTime}`
    );

    const student = students.find(s => s.id === session.studentId);
    if (student) {
      const channel = tutorSettings.notifications.channels[0] || 'email';
      const contact = channel === 'telegram' && student.telegram ? student.telegram : student.email;
      sendNotification(
        student.name,
        contact,
        channel,
        'rescheduled',
        `Rescheduled: ${session.subject} to ${newDate}`,
        `Your lesson has been moved to ${newDate} at ${newStartTime}. Please check your portal calendar.`,
        id
      );
    }
  };

  const toggleLessonComplete = (id: string, isCompleted: boolean, feedback?: string) => {
    const session = sessions.find(s => s.id === id);
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          status: isCompleted ? 'completed' : 'scheduled',
          completedAt: isCompleted ? new Date().toISOString().split('T')[0] : undefined,
          tutorFeedback: feedback !== undefined ? feedback : s.tutorFeedback,
        };
      })
    );
    notify(
      isCompleted ? 'success' : 'info',
      isCompleted ? 'Lesson Marked as Completed' : 'Lesson Reverted to Scheduled',
      isCompleted
        ? `${session?.subject || 'Lesson'} on ${session?.date} recorded as completed in ledger`
        : 'Session reopened as scheduled'
    );
  };

  const toggleLessonPaid = (id: string, isPaid: boolean) => {
    const session = sessions.find(s => s.id === id);
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          isPaid,
          paidAt: isPaid ? new Date().toISOString().split('T')[0] : undefined,
        };
      })
    );

    notify(
      isPaid ? 'success' : 'warning',
      isPaid ? 'Payment Confirmed' : 'Marked as Unpaid',
      isPaid
        ? `Payment of ${tutorSettings.currency}${session?.amount.toFixed(2) || '0.00'} verified for ${session?.subject || 'lesson'}`
        : 'Session marked as awaiting payment'
    );

    if (isPaid && session) {
      const student = students.find(s => s.id === session.studentId);
      if (student) {
        const channel = tutorSettings.notifications.channels[0] || 'email';
        const contact = channel === 'telegram' && student.telegram ? student.telegram : student.email;
        sendNotification(
          student.name,
          contact,
          channel,
          'payment_received',
          `Payment Confirmed: ${tutorSettings.currency}${session.amount.toFixed(2)}`,
          `Payment for ${session.subject} (${session.date}) has been marked as received. Thank you!`,
          id
        );
      }
    }
  };

  // Student management
  const addStudent = (studentData: Omit<Student, 'id' | 'joinedDate' | 'portalCode'>): string => {
    const id = `stu-${Date.now()}`;
    const codePart = studentData.name.trim().split(' ')[0].toUpperCase();
    const portalCode = `STU-${codePart}-${Math.floor(100 + Math.random() * 900)}`;

    const newStudent: Student = {
      ...studentData,
      id,
      joinedDate: new Date().toISOString().split('T')[0],
      portalCode,
      active: true,
      avatar: studentData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentData.name)}`,
    };

    setStudents(prev => [...prev, newStudent]);
    notify(
      'success',
      'Student Added to Roster',
      `${studentData.name} enrolled with portal access code ${portalCode}`
    );
    return id;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
    notify('info', 'Student Profile Updated', 'Student rates and details saved');
  };

  const deleteStudent = (id: string, removeSessions: boolean = false) => {
    const stu = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    if (removeSessions) {
      setSessions(prev => prev.filter(s => s.studentId !== id));
    }
    if (currentStudentId === id) {
      const remaining = students.filter(s => s.id !== id);
      setCurrentStudentId(remaining[0]?.id || null);
    }
    notify(
      'warning', 
      'Student Removed from Roster', 
      `${stu?.name || 'Student'} and profile data were removed${removeSessions ? ' along with all session history' : ''}`
    );
  };

  const markAllPaidForStudent = (studentId: string) => {
    const stu = students.find(s => s.id === studentId);
    const today = new Date().toISOString().split('T')[0];
    setSessions(prev =>
      prev.map(s => {
        if (s.studentId === studentId && s.status === 'completed' && !s.isPaid) {
          return { ...s, isPaid: true, paidAt: today };
        }
        return s;
      })
    );
    notify('success', 'All Completed Lessons Paid', `Cleared all outstanding balance for ${stu?.name || 'student'}`);
  };

  // Settings
  const updateTutorSettings = (updates: Partial<TutorSettings>) => {
    setTutorSettings(prev => ({ ...prev, ...updates }));
    notify('success', 'Settings Saved', 'Tutor working hours, rates, and preferences updated');
  };

  const addBlockedSlot = (slot: Omit<BlockedSlot, 'id'>) => {
    const newSlot: BlockedSlot = {
      ...slot,
      id: `block-${Date.now()}`,
    };
    setTutorSettings(prev => ({
      ...prev,
      blockedSlots: [...prev.blockedSlots, newSlot],
    }));
    notify('info', 'Time Blocked on Calendar', `${slot.title} on ${slot.date} (${slot.startTime} - ${slot.endTime})`);
  };

  const removeBlockedSlot = (id: string) => {
    setTutorSettings(prev => ({
      ...prev,
      blockedSlots: prev.blockedSlots.filter(b => b.id !== id),
    }));
    notify('info', 'Blocked Slot Removed', 'Availability restored for booking');
  };

  // Student Ledger calculations
  const getStudentLedger = (studentId: string): StudentLedgerStats => {
    const studentSessions = sessions
      .filter(s => s.studentId === studentId)
      .sort((a, b) => new Date(b.date + 'T' + b.startTime).getTime() - new Date(a.date + 'T' + a.startTime).getTime());

    const completed = studentSessions.filter(s => s.status === 'completed');
    const totalBilled = completed.reduce((sum, s) => sum + s.amount, 0);
    const totalPaid = completed.filter(s => s.isPaid).reduce((sum, s) => sum + s.amount, 0);
    const balanceDue = totalBilled - totalPaid;

    return {
      totalSessions: studentSessions.length,
      completedSessions: completed.length,
      totalBilled,
      totalPaid,
      balanceDue,
      sessions: studentSessions,
    };
  };

  // Overall Financials
  const getOverallFinancials = (): OverallFinancials => {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalRevenue = completedSessions
      .filter(s => s.isPaid)
      .reduce((sum, s) => sum + s.amount, 0);
    const totalPendingDues = completedSessions
      .filter(s => !s.isPaid)
      .reduce((sum, s) => sum + s.amount, 0);
    const upcomingCount = sessions.filter(s => s.status === 'scheduled').length;
    const unpaidSessionsCount = completedSessions.filter(s => !s.isPaid).length;

    return {
      totalRevenue,
      totalPendingDues,
      totalSessionsCompleted: completedSessions.length,
      upcomingCount,
      unpaidSessionsCount,
    };
  };

  const resetAllData = () => {
    localStorage.clear();
    setRole('tutor');
    setCurrentStudentId('stu-1');
    setStudents(INITIAL_STUDENTS);
    setSessions(INITIAL_SESSIONS);
    setTutorSettings(INITIAL_TUTOR_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        currentStudentId,
        currentStudent,
        students,
        sessions,
        tutorSettings,
        notifications,
        toasts,
        addToast,
        removeToast,
        notify,
        soundEnabled,
        toggleSound,
        loginAsTutor,
        loginAsStudent,
        loginWithPortalCode,
        logout,
        addLesson,
        addRecurringLessons,
        cancelRecurringSeries,
        deleteRecurringSeries,
        updateLesson,
        cancelLesson,
        deleteLesson,
        rescheduleLesson,
        toggleLessonComplete,
        toggleLessonPaid,
        addStudent,
        updateStudent,
        deleteStudent,
        markAllPaidForStudent,
        updateTutorSettings,
        addBlockedSlot,
        removeBlockedSlot,
        sendNotification,
        getStudentLedger,
        getOverallFinancials,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
