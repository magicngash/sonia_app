import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonSession, Student } from '../../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Clock, 
  CheckCircle2, 
  User, 
  Video,
  Lock,
  Repeat
} from 'lucide-react';

interface TutorCalendarProps {
  onOpenBookModal: (date?: string) => void;
  onOpenSessionModal: (session: LessonSession) => void;
}

type CalendarView = 'month' | 'week' | 'day';

export const TutorCalendar: React.FC<TutorCalendarProps> = ({
  onOpenBookModal,
  onOpenSessionModal,
}) => {
  const { 
    sessions, 
    students, 
    tutorSettings 
  } = useApp();

  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');

  // Filter sessions
  const filteredSessions = sessions.filter(s => {
    if (s.status === 'cancelled') return false;
    if (selectedStudentFilter !== 'all' && s.studentId !== selectedStudentFilter) return false;
    return true;
  });

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper date formatters
  const todayStr = new Date().toISOString().split('T')[0];

  // Colors for students
  const studentColorMap: Record<string, { bg: string; text: string; border: string }> = {
    'stu-1': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'stu-2': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'stu-3': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'stu-4': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  };

  const getStudentBadgeColor = (studentId: string) => {
    return studentColorMap[studentId] || { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' };
  };

  // --- MONTH VIEW LOGIC ---
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Leading blanks
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-500 py-2.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[500px]">
          {days.map((dateObj, idx) => {
            if (!dateObj) {
              return <div key={`empty-${idx}`} className="bg-slate-50/40 p-2 min-h-[90px]" />;
            }

            const dateStr = dateObj.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const daySessions = filteredSessions.filter(s => s.date === dateStr);
            const dayBlocked = tutorSettings.blockedSlots.filter(b => b.date === dateStr);

            return (
              <div
                key={dateStr}
                onClick={() => {
                  setCurrentDate(dateObj);
                  setView('day');
                }}
                className={`p-2 min-h-[95px] flex flex-col justify-between transition-colors hover:bg-blue-50/30 cursor-pointer ${
                  isToday ? 'bg-blue-50/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                    isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                  }`}>
                    {dateObj.getDate()}
                  </span>
                  {daySessions.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {daySessions.length} {daySessions.length === 1 ? 'lesson' : 'lessons'}
                    </span>
                  )}
                </div>

                {/* Session Pills */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayBlocked.map(b => (
                    <div
                      key={b.id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 truncate flex items-center"
                    >
                      <Lock className="w-2.5 h-2.5 mr-1 text-slate-400 flex-shrink-0" />
                      {b.title}
                    </div>
                  ))}

                  {daySessions.slice(0, 2).map(session => {
                    const student = students.find(s => s.id === session.studentId);
                    const colors = getStudentBadgeColor(session.studentId);
                    return (
                      <div
                        key={session.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSessionModal(session);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border truncate ${colors.bg} ${colors.text} ${colors.border} hover:opacity-85`}
                      >
                        <span className="font-bold">{session.startTime}</span>
                        {session.recurringGroupId && (
                          <Repeat className="w-2.5 h-2.5 inline mx-0.5 opacity-70" title="Recurring 3-Month Weekly Series" />
                        )}
                        {' '}{student?.name.split(' ')[0]}: {session.subject}
                      </div>
                    );
                  })}

                  {daySessions.length > 2 && (
                    <span className="text-[9px] text-blue-600 font-semibold block text-right">
                      +{daySessions.length - 2} more
                    </span>
                  )}
                </div>

                <div className="mt-1 flex justify-end opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBookModal(dateStr);
                    }}
                    className="text-[10px] text-blue-600 font-semibold hover:underline"
                  >
                    + Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- WEEK VIEW LOGIC ---
  const renderWeekView = () => {
    // Calculate week start (Sunday or Monday)
    const current = new Date(currentDate);
    const day = current.getDay();
    const diff = current.getDate() - day; // Adjust for Sunday
    const weekStart = new Date(current.setDate(diff));

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      weekDays.push(d);
    }

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header row with 7 days */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 divide-x divide-slate-200 text-center">
          {weekDays.map(d => {
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            return (
              <div key={dateStr} className={`py-3 px-2 ${isToday ? 'bg-blue-50/50' : ''}`}>
                <p className="text-xs font-medium text-slate-500">
                  {d.toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <p className={`text-base font-bold mt-0.5 inline-block px-2 py-0.5 rounded-full ${
                  isToday ? 'bg-blue-600 text-white' : 'text-slate-900'
                }`}>
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Columns for each day */}
        <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[500px]">
          {weekDays.map(d => {
            const dateStr = d.toISOString().split('T')[0];
            const daySessions = filteredSessions
              .filter(s => s.date === dateStr)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const dayBlocked = tutorSettings.blockedSlots.filter(b => b.date === dateStr);

            return (
              <div key={dateStr} className="p-2 space-y-2 bg-white flex flex-col justify-between">
                <div className="space-y-2">
                  {dayBlocked.map(b => (
                    <div
                      key={b.id}
                      className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs"
                    >
                      <div className="flex items-center text-[10px] font-semibold text-slate-500 uppercase">
                        <Lock className="w-3 h-3 mr-1" />
                        Blocked Slot
                      </div>
                      <p className="font-semibold text-slate-800 mt-0.5">{b.title}</p>
                      <p className="text-[10px] text-slate-500">{b.startTime} - {b.endTime}</p>
                    </div>
                  ))}

                  {daySessions.map(session => {
                    const student = students.find(s => s.id === session.studentId);
                    const colors = getStudentBadgeColor(session.studentId);
                    return (
                      <div
                        key={session.id}
                        onClick={() => onOpenSessionModal(session)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer shadow-2xs hover:shadow-sm transition-all ${colors.bg} ${colors.border}`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                          <div className="flex items-center space-x-1">
                            <span>{session.startTime}</span>
                            {session.recurringGroupId && (
                              <Repeat className="w-3 h-3 text-blue-600" title="3-Month Weekly Series" />
                            )}
                          </div>
                          <span className="text-[10px] opacity-75">{session.durationMinutes}m</span>
                        </div>
                        <p className={`font-semibold text-xs mt-1 ${colors.text}`}>
                          {student?.name}
                        </p>
                        <p className="text-[11px] text-slate-600 truncate">{session.subject}</p>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 text-[10px]">
                          <span className={session.isPaid ? 'text-emerald-700 font-medium' : 'text-amber-700 font-bold'}>
                            {session.isPaid ? 'PAID' : 'UNPAID'}
                          </span>
                          {session.status === 'completed' && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => onOpenBookModal(dateStr)}
                  className="w-full py-1.5 text-center text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold"
                >
                  + Slot
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- DAY VIEW LOGIC ---
  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay();
    const dayConfig = tutorSettings.workingHours[dayOfWeek];

    const daySessions = filteredSessions
      .filter(s => s.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const dayBlocked = tutorSettings.blockedSlots.filter(b => b.date === dateStr);

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-xs text-slate-500">
              {dayConfig?.enabled 
                ? `Standard Working Hours: ${dayConfig.start} - ${dayConfig.end}` 
                : 'Day Off / Closed in regular working schedule'}
            </p>
          </div>

          <button
            onClick={() => onOpenBookModal(dateStr)}
            className="px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
          >
            + Schedule on this Day
          </button>
        </div>

        {/* Timeline list */}
        <div className="space-y-3">
          {dayBlocked.map(b => (
            <div key={b.id} className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blocked Time Slot</span>
                  <p className="text-sm font-semibold text-slate-900">{b.title}</p>
                  <p className="text-xs text-slate-500">{b.reason || 'Personal / Tutor Unavailable'}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-medium text-slate-700">
                {b.startTime} - {b.endTime}
              </span>
            </div>
          ))}

          {daySessions.length === 0 && dayBlocked.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No lessons or blocked slots for this day. Click "+ Schedule on this Day" to add one!
            </div>
          ) : (
            daySessions.map(session => {
              const student = students.find(s => s.id === session.studentId);
              return (
                <div
                  key={session.id}
                  onClick={() => onOpenSessionModal(session)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">{session.startTime}</span>
                      <span className="text-[10px] text-blue-600">{session.durationMinutes}m</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{student?.name}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-blue-600">{session.subject}</span>
                        {session.recurringGroupId && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full inline-flex items-center">
                            <Repeat className="w-2.5 h-2.5 mr-0.5" />
                            <span>Weekly Series</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {session.topicNotes || 'General tutoring session'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          session.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {session.status.toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          session.isPaid ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800 font-bold'
                        }`}>
                          {session.isPaid ? 'PAID' : 'UNPAID'} ({tutorSettings.currency}{session.amount.toFixed(2)})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    {session.meetingLink && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold inline-flex items-center"
                      >
                        <Video className="w-3.5 h-3.5 mr-1" />
                        Classroom
                      </a>
                    )}
                    <span className="text-xs text-slate-400 font-medium">Click for details →</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      
      {/* Calendar Controls & View Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Navigation Buttons & Current Period Label */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-slate-900">
            {view === 'month' && currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            {view === 'week' && `Week of ${currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
            {view === 'day' && currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </h3>
        </div>

        {/* Right: Filters & View Switcher */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          {/* Student Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* View Segmented Control */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['month', 'week', 'day'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                  view === v
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* New Booking Button */}
          <button
            onClick={() => onOpenBookModal(currentDate.toISOString().split('T')[0])}
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Schedule
          </button>
        </div>

      </div>

      {/* Main Calendar View Body */}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}

    </div>
  );
};
