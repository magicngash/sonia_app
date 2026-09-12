import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  getAvailableSlotsForDate, 
  checkRecurringDatesAvailability, 
  RecurringDateCheck 
} from '../../utils/availability';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  BookOpen, 
  DollarSign, 
  Link as LinkIcon, 
  Check, 
  AlertTriangle, 
  FileText,
  Repeat,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

interface BookLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDate?: string;
  preselectedStudentId?: string;
}

export const BookLessonModal: React.FC<BookLessonModalProps> = ({
  isOpen,
  onClose,
  preselectedDate,
  preselectedStudentId,
}) => {
  const { 
    role, 
    currentStudent, 
    students, 
    sessions, 
    tutorSettings, 
    addLesson,
    addRecurringLessons 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [studentId, setStudentId] = useState<string>(() => {
    if (role === 'student' && currentStudent) return currentStudent.id;
    if (preselectedStudentId) return preselectedStudentId;
    return students[0]?.id || '';
  });

  const [date, setDate] = useState<string>(preselectedDate || todayStr);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [startTime, setStartTime] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [repertoireFocus, setRepertoireFocus] = useState<string>('');
  const [practiceAssignments, setPracticeAssignments] = useState<string>('');
  const [rate, setRate] = useState<number>(tutorSettings.defaultHourlyRate);
  const [meetingLink, setMeetingLink] = useState<string>('https://meet.google.com/violin-studio');
  const [topicNotes, setTopicNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Recurring booking state - defaults to TRUE (3 months / 12 weeks of regular lessons)
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [recurrenceWeeks, setRecurrenceWeeks] = useState<number>(12); // 12 weeks = 3 months
  const [showDatesList, setShowDatesList] = useState<boolean>(false);

  // Selected student object
  const selectedStudent = students.find(s => s.id === studentId);

  // Derive day of week name for the selected date
  const dayOfWeekName = useMemo(() => {
    if (!date) return '';
    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  }, [date]);

  // Sync defaults when student or modal opens
  useEffect(() => {
    if (role === 'student' && currentStudent) {
      setStudentId(currentStudent.id);
      setSubject(currentStudent.subject);
      setRate(currentStudent.hourlyRate);
      if (currentStudent.currentRepertoire && currentStudent.currentRepertoire.length > 0) {
        setRepertoireFocus(currentStudent.currentRepertoire[0]);
      }
    } else if (selectedStudent) {
      setSubject(selectedStudent.subject);
      setRate(selectedStudent.hourlyRate);
      if (selectedStudent.currentRepertoire && selectedStudent.currentRepertoire.length > 0) {
        setRepertoireFocus(selectedStudent.currentRepertoire[0]);
      }
    }
  }, [studentId, role, currentStudent, selectedStudent, isOpen]);

  useEffect(() => {
    if (preselectedDate) {
      setDate(preselectedDate);
    }
  }, [preselectedDate]);

  // Compute available slots for the initial date
  const availableSlots = useMemo(() => {
    if (!date) return [];
    return getAvailableSlotsForDate(date, durationMinutes, tutorSettings, sessions);
  }, [date, durationMinutes, tutorSettings, sessions]);

  // Reset selected slot if invalid
  useEffect(() => {
    if (availableSlots.length > 0 && !startTime) {
      const firstOpen = availableSlots.find(s => s.available);
      if (firstOpen) {
        setStartTime(firstOpen.time);
      }
    }
  }, [availableSlots, startTime]);

  // Check recurring availability across the 3-month (12-week) span
  const recurringCheck = useMemo(() => {
    if (!isRecurring || !date || !startTime) return null;
    return checkRecurringDatesAvailability(
      date,
      startTime,
      durationMinutes,
      recurrenceWeeks,
      tutorSettings,
      sessions
    );
  }, [isRecurring, date, startTime, durationMinutes, recurrenceWeeks, tutorSettings, sessions]);

  if (!isOpen) return null;

  // Calculate session cost
  const sessionAmount = (rate * durationMinutes) / 60;
  const totalPackageAmount = sessionAmount * (isRecurring ? recurrenceWeeks : 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentId) {
      setErrorMsg('Please choose a student.');
      return;
    }
    if (!date) {
      setErrorMsg('Please select a starting date.');
      return;
    }
    if (!startTime) {
      setErrorMsg('Please pick an available time slot.');
      return;
    }

    const baseSession = {
      studentId,
      subject: subject || 'Violin Study',
      repertoireFocus: repertoireFocus.trim(),
      practiceAssignments: practiceAssignments.trim(),
      date,
      startTime,
      durationMinutes,
      status: 'scheduled' as const,
      isPaid: false,
      rate,
      amount: sessionAmount,
      topicNotes: topicNotes.trim(),
      meetingLink: meetingLink.trim(),
      bookedBy: role === 'student' ? ('student' as const) : ('tutor' as const),
    };

    if (isRecurring) {
      // Books the same day every week for 3 months (12 weeks)
      addRecurringLessons(baseSession, recurrenceWeeks);
    } else {
      addLesson(baseSession);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="book-lesson-dialog"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {role === 'student' ? 'Book Tutoring Lessons' : 'Schedule Regular Lessons'}
              </h3>
              <p className="text-xs text-slate-300">
                Regular weekly schedule with 3-month recurrence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student selection */}
          {role === 'tutor' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Student
              </label>
              <div className="relative">
                <select
                  id="lesson-student-select"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.subject}) - {tutorSettings.currency}{s.hourlyRate}/hr
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={currentStudent?.avatar}
                  alt={currentStudent?.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Student</p>
                  <p className="text-sm font-semibold text-slate-900">{currentStudent?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Rate</span>
                <p className="text-sm font-bold text-slate-900">
                  {tutorSettings.currency}{currentStudent?.hourlyRate}/hr
                </p>
              </div>
            </div>
          )}

          {/* Recurrence Mode Selector: 3-Month Regular Schedule vs Single Session */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Repeat className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Regular Lesson Scheduling
                </span>
              </div>
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                Regular Tutoring
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsRecurring(true)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isRecurring
                    ? 'bg-white border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-500'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Repeat Weekly</span>
                  {isRecurring && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Book for 3 Months (every {dayOfWeekName || 'week'})
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsRecurring(false)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  !isRecurring
                    ? 'bg-white border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-500'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Single Session</span>
                  {!isRecurring && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  One-time trial or ad-hoc lesson
                </p>
              </button>
            </div>

            {/* If Recurring is selected: duration dropdown */}
            {isRecurring && (
              <div className="flex items-center justify-between pt-2 border-t border-blue-200/70 text-xs">
                <span className="text-blue-900 font-medium">Recurrence Horizon:</span>
                <select
                  value={recurrenceWeeks}
                  onChange={(e) => setRecurrenceWeeks(Number(e.target.value))}
                  className="px-2.5 py-1 bg-white border border-blue-300 rounded-md text-xs font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={12}>3 Months (12 Weekly Lessons)</option>
                  <option value={4}>1 Month (4 Weekly Lessons)</option>
                  <option value={8}>2 Months (8 Weekly Lessons)</option>
                  <option value={24}>6 Months (24 Weekly Lessons)</option>
                </select>
              </div>
            )}
          </div>

          {/* Subject & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Lesson Subject / Focus
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Solo Repertoire & Concertos"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Number(e.target.value));
                  setStartTime('');
                }}
                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 Minutes (Beginner / Technique)</option>
                <option value={45}>45 Minutes (Intermediate)</option>
                <option value={60}>60 Minutes (Standard Lesson)</option>
                <option value={90}>90 Minutes (Advanced Conservatory)</option>
                <option value={120}>120 Minutes (Masterclass)</option>
              </select>
            </div>
          </div>

          {/* Violin Repertoire & Practice Assignment Fields */}
          <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-amber-950 uppercase tracking-wider mb-1">
                Repertoire / Concerto / Sonata Piece
              </label>
              <input
                type="text"
                value={repertoireFocus}
                onChange={(e) => setRepertoireFocus(e.target.value)}
                placeholder="e.g. Bruch Violin Concerto 1st Mvt, Bach Partita No. 2 Chaconne"
                className="w-full px-3 py-2 bg-white rounded-lg border border-amber-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-950 uppercase tracking-wider mb-1">
                Practice Assignments &amp; Etudes
              </label>
              <input
                type="text"
                value={practiceAssignments}
                onChange={(e) => setPracticeAssignments(e.target.value)}
                placeholder="e.g. Kreutzer Etude #2 (spiccato at 104 BPM), Flesch G major 3-octave scale"
                className="w-full px-3 py-2 bg-white rounded-lg border border-amber-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Date Picker (First Lesson Date) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {isRecurring ? 'First Lesson Date (Repeats this day)' : 'Lesson Date'}
              </label>
              {dayOfWeekName && (
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Every {dayOfWeekName}
                </span>
              )}
            </div>
            <input
              type="date"
              id="lesson-date-input"
              value={date}
              min={todayStr}
              onChange={(e) => {
                setDate(e.target.value);
                setStartTime('');
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Real-Time Availability Slot Picker */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Available Start Time
              </label>
              <span className="text-[11px] text-slate-500">
                {tutorSettings.bufferMinutes}m buffer between sessions
              </span>
            </div>

            {availableSlots.length === 0 ? (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                No studio lesson hours are open on this date. Please pick another date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-lg">
                {availableSlots.map((slot) => {
                  const isSelected = startTime === slot.time;
                  return (
                    <button
                      type="button"
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setStartTime(slot.time)}
                      title={slot.conflictReason || 'Slot available'}
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                        !slot.available
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3-Month Recurring Schedule Preview Box */}
          {isRecurring && startTime && recurringCheck && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">
                    {recurringCheck.availableCount} of {recurrenceWeeks} weekly {dayOfWeekName} slots open
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDatesList(!showDatesList)}
                  className="text-xs text-blue-600 hover:underline flex items-center font-medium"
                >
                  {showDatesList ? 'Hide Dates' : 'View All 12 Dates'}
                  {showDatesList ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Reserving every <strong className="text-slate-900">{dayOfWeekName} at {startTime}</strong> for the next {Math.round(recurrenceWeeks / 4)} months (from {recurringCheck.dates[0]?.formattedDate} to {recurringCheck.dates[recurringCheck.dates.length - 1]?.formattedDate}).
              </p>

              {/* Expandable list of all 12 dates */}
              {showDatesList && (
                <div className="mt-2 max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                  {recurringCheck.dates.map((d) => (
                    <div 
                      key={d.date} 
                      className="px-3 py-1.5 flex items-center justify-between text-[11px]"
                    >
                      <span className="font-semibold text-slate-800">
                        Lesson #{d.weekIndex}: {d.formattedDate}
                      </span>
                      {d.available ? (
                        <span className="text-emerald-700 font-medium">✓ Slot Open</span>
                      ) : (
                        <span className="text-amber-700 font-medium" title={d.conflictReason}>
                          ⚠ {d.conflictReason || 'Conflict'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rate & Meeting Link (Tutor view customizable) */}
          {role === 'tutor' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Rate ({tutorSettings.currency}/hr)
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Meeting Link
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : null}

          {/* Notes / Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {role === 'student' ? 'Questions or Focus Topics' : 'Session Notes & Curriculum Focus'}
            </label>
            <textarea
              rows={2}
              value={topicNotes}
              onChange={(e) => setTopicNotes(e.target.value)}
              placeholder="e.g. Focus on bow distribution, martelé attack at frog, intonation in high positions..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Booking Summary Banner */}
          {role === 'tutor' ? (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
              <div className="text-xs text-blue-900">
                <span className="font-semibold">
                  {isRecurring ? `Recurring Total (${recurrenceWeeks} Weekly Lessons):` : 'Session Fee:'}
                </span>
                <p className="text-[11px] text-blue-700">
                  {isRecurring 
                    ? `${recurrenceWeeks} × ${tutorSettings.currency}${sessionAmount.toFixed(2)} per lesson`
                    : `${durationMinutes} mins @ ${tutorSettings.currency}${rate}/hr`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-blue-900">
                  {tutorSettings.currency}{totalPackageAmount.toFixed(2)}
                </span>
                {isRecurring && (
                  <span className="block text-[10px] text-blue-600">
                    ({tutorSettings.currency}{sessionAmount.toFixed(2)} / week)
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs">
              <div className="text-blue-950">
                <span className="font-semibold block">
                  {isRecurring ? `Recurring Studio Series (${recurrenceWeeks} Weeks)` : 'Single Lesson Reservation'}
                </span>
                <p className="text-[11px] text-blue-700">
                  {durationMinutes} min lesson slot{startTime ? ` at ${startTime}` : ''} • Recorded on your Finances tab
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-800 text-[11px] font-bold">
                {isRecurring ? '12 Weeks' : '1 Session'}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-booking-btn"
              disabled={!startTime}
              className="w-2/3 py-2.5 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer inline-flex items-center justify-center space-x-1.5"
            >
              {isRecurring && <Repeat className="w-4 h-4 mr-1" />}
              <span>
                {isRecurring
                  ? `Book 3 Months (${recurrenceWeeks} ${dayOfWeekName || 'Weekly'} Lessons)`
                  : role === 'student' ? 'Confirm Booking' : 'Schedule Session'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
