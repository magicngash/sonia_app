import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Video, 
  Plus, 
  TrendingUp, 
  FileText,
  UserCheck,
  ExternalLink,
  Music,
  ArrowRight
} from 'lucide-react';
import { LessonSession } from '../../types';
import { formatTime, formatKenyaDate } from '../../utils/formatters';

interface TutorDashboardProps {
  onSelectTab: (tab: string) => void;
  onOpenBookModal: () => void;
  onOpenSessionModal: (session: LessonSession) => void;
  onSelectStudentProfile: (studentId: string) => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({
  onSelectTab,
  onOpenBookModal,
  onOpenSessionModal,
  onSelectStudentProfile,
}) => {
  const { 
    sessions, 
    students, 
    tutorSettings, 
    toggleLessonComplete, 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's sessions
  const todaysSessions = sessions
    .filter(s => s.date === todayStr && s.status !== 'cancelled')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Next 7 days sessions
  const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const thisWeekSessions = sessions.filter(s => 
    s.date >= todayStr && s.date <= nextWeekStr && s.status !== 'cancelled'
  );

  // Total repertoire pieces under study
  const totalRepertoirePieces = students.reduce((sum, s) => sum + (s.currentRepertoire?.length || 0), 0);

  // Upcoming non-today sessions
  const upcomingSessions = sessions
    .filter(s => s.date > todayStr && s.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* Welcome & Quick Action Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-300 border border-blue-400/30">
              Admin Overview
            </span>
            <span className="text-xs text-slate-400">
              {formatKenyaDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h2 className="text-2xl font-bold mt-2">
            Welcome{tutorSettings.tutorName ? `, ${tutorSettings.tutorName}` : ' to Violin Studio'}
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            You have {todaysSessions.length} {todaysSessions.length === 1 ? 'lesson' : 'lessons'} scheduled for today. Track student repertoire, technical studies, and manage studio availability.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={onOpenBookModal}
            className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Schedule Lesson
          </button>
          <button
            onClick={() => onSelectTab('calendar')}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 mr-1.5" />
            View Calendar
          </button>
        </div>
      </div>

      {/* Top Level Metric Cards (Pedagogical & Studio Operations) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Appointments */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Today's Sessions</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{todaysSessions.length}</p>
          <p className="text-xs text-slate-500 mt-1">
            {todaysSessions.filter(s => s.status === 'completed').length} completed so far
          </p>
        </div>

        {/* Active Students */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {students.filter(s => s.active).length}
          </p>
          <button 
            onClick={() => onSelectTab('students')}
            className="text-xs text-blue-600 hover:underline mt-1 font-medium inline-flex items-center"
          >
            View student roster <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {/* Upcoming This Week */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Upcoming This Week</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-2">
            {thisWeekSessions.length}
          </p>
          <button 
            onClick={() => onSelectTab('calendar')}
            className="text-xs text-purple-700 hover:underline mt-1 font-medium inline-flex items-center"
          >
            {thisWeekSessions.length} sessions booked <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {/* Studio Repertoire & Toolkit */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Repertoire &amp; Studies</span>
            <Music className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">
            {totalRepertoirePieces} pieces
          </p>
          <button 
            onClick={() => onSelectTab('toolkit')}
            className="text-xs text-amber-800 hover:underline mt-1 font-medium inline-flex items-center"
          >
            Practice toolkit <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

      </div>

      {/* Separated Finances Quick Route Banner */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-800">Finances Kept Separated:</span>
            <span className="text-slate-500 ml-1.5">
              All financial ledgers, billing history, and payment tracking are centralized in the dedicated Finances section.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelectTab('ledger')}
          className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          <span>Open Finances</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
        </button>
      </div>

      {/* Main Grid: Today's Schedule + Payment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Today's Schedule</h3>
                <span className="text-xs text-slate-500 font-normal">
                  ({todaysSessions.length} {todaysSessions.length === 1 ? 'lesson' : 'lessons'})
                </span>
              </div>
              <button
                onClick={onOpenBookModal}
                className="text-xs text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center"
              >
                + Add Session
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {todaysSessions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">No sessions scheduled today</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Take a well-deserved break or schedule a new tutoring appointment.
                  </p>
                  <button
                    onClick={onOpenBookModal}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Schedule Lesson
                  </button>
                </div>
              ) : (
                todaysSessions.map((session) => {
                  const student = students.find(s => s.id === session.studentId);
                  const isCompleted = session.status === 'completed';

                  return (
                    <div 
                      key={session.id} 
                      className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">{formatTime(session.startTime)}</span>
                          <span className="text-[9px] text-blue-600">{session.durationMinutes}m</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span 
                              onClick={() => student && onSelectStudentProfile(student.id)}
                              className="font-semibold text-sm text-slate-900 hover:text-blue-600 cursor-pointer"
                            >
                              {student?.name || 'Student'}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-medium text-slate-600">{session.subject}</span>
                          </div>
                          
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {session.topicNotes || 'General tutoring session'}
                          </p>

                          <div className="flex items-center space-x-2 mt-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {session.status.toUpperCase()}
                            </span>

                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              session.isPaid
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-800 font-bold'
                            }`}>
                              {session.isPaid ? 'PAID' : 'UNPAID'} ({tutorSettings.currency}{session.amount.toFixed(2)})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Action Controls */}
                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        {session.meetingLink && (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Open Meeting Room"
                          >
                            <Video className="w-4 h-4" />
                          </a>
                        )}

                        {/* One-tap completion toggle */}
                        <button
                          onClick={() => toggleLessonComplete(session.id, !isCompleted)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                          }`}
                        >
                          {isCompleted ? 'Completed ✓' : 'Mark Done'}
                        </button>

                        <button
                          onClick={() => onOpenSessionModal(session)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Lessons Preview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Upcoming Next Days</h3>
              </div>
              <button
                onClick={() => onSelectTab('calendar')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                View full calendar →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingSessions.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No upcoming sessions booked in advance.
                </div>
              ) : (
                upcomingSessions.map((session) => {
                  const student = students.find(s => s.id === session.studentId);
                  return (
                    <div 
                      key={session.id} 
                      onClick={() => onOpenSessionModal(session)}
                      className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-center w-12 py-1 px-2 rounded-lg bg-slate-100 text-slate-800">
                          <span className="block text-[10px] uppercase font-bold text-slate-500">
                            {new Date(session.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' })}
                          </span>
                          <span className="block text-xs font-bold">
                            {session.date.split('-').slice(1).join('/')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{student?.name}</p>
                        <p className="text-xs text-slate-500">{session.subject} • {formatTime(session.startTime)}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-700">
                          {session.durationMinutes} mins
                        </span>
                        <span className="block text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-0.5">
                          {session.status === 'scheduled' ? 'Scheduled' : session.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Studio Finances Link & Repertoire Spotlight */}
        <div className="space-y-6">

          {/* Dedicated Finances Section Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Studio Finances</h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Separated Section
              </span>
            </div>

            <div className="py-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Billing records, student tuition balances, lesson fee collections, and payment history are kept separated in the dedicated Finances section.
              </p>
            </div>

            <button 
              onClick={() => onSelectTab('ledger')}
              className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Open Finances &amp; Billing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Repertoire & Etudes Spotlight */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Active Repertoire</h3>
              </div>
              <button
                onClick={() => onSelectTab('toolkit')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Toolkit
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {students.filter(s => s.currentRepertoire && s.currentRepertoire.length > 0).slice(0, 3).map((st) => (
                <div 
                  key={st.id}
                  onClick={() => onSelectStudentProfile(st.id)}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">{st.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{st.instrumentSize || '4/4 Size'}</span>
                  </div>
                  <p className="text-xs text-amber-800 font-medium mt-1 truncate">
                    {st.currentRepertoire?.[0]?.piece || 'Solo Study'}
                  </p>
                  {st.currentEtude && (
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                      Etude: {st.currentEtude}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Roster Overview Card (Without displaying rates) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Roster Overview</h3>
              </div>
              <button
                onClick={() => onSelectTab('students')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                All Students ({students.length})
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {students.slice(0, 4).map((student) => (
                <div
                  key={student.id}
                  onClick={() => onSelectStudentProfile(student.id)}
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{student.name}</p>
                      <p className="text-[10px] text-slate-500">{student.gradeLevel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {student.instrumentSize || '4/4 Size'}
                    </span>
                    <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                      {student.portalCode}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onSelectTab('students')}
              className="w-full mt-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              Manage All Student Profiles
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
