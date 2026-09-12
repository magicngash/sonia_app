import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonSession } from '../../types';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Video, 
  Plus, 
  ExternalLink, 
  Download, 
  RotateCcw, 
  BookOpen, 
  UserCheck, 
  Send, 
  Mail, 
  FileText,
  CreditCard,
  Repeat,
  Music,
  Sparkles
} from 'lucide-react';
import { ViolinPracticeToolkit } from '../common/ViolinPracticeToolkit';

interface StudentPortalProps {
  onOpenBookModal: (date?: string) => void;
  onOpenSessionModal: (session: LessonSession) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  onOpenBookModal,
  onOpenSessionModal,
}) => {
  const { 
    currentStudent, 
    sessions, 
    tutorSettings, 
    getStudentLedger,
    notify
  } = useApp();

  const [activeTab, setActiveTab] = useState<'schedule' | 'ledger' | 'feedback' | 'toolkit'>('schedule');
  const [statementDownloaded, setStatementDownloaded] = useState(false);

  if (!currentStudent) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">No Student Profile Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select or log into a student profile.</p>
      </div>
    );
  }

  const ledger = getStudentLedger(currentStudent.id);
  const todayStr = new Date().toISOString().split('T')[0];

  // Student's upcoming sessions (scheduled)
  const upcomingSessions = sessions
    .filter(s => s.studentId === currentStudent.id && s.status === 'scheduled' && s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  // Next immediate session
  const nextSession = upcomingSessions[0] || null;

  // Completed sessions for ledger
  const completedSessions = ledger.sessions.filter(s => s.status === 'completed');

  const handleDownloadStatement = () => {
    const lines = [
      `=====================================================`,
      `STUDENT STATEMENT - ${currentStudent.name.toUpperCase()}`,
      `Portal Code: ${currentStudent.portalCode}`,
      `Studio: ${tutorSettings.tutorName || 'Violin Studio Administration'} (${tutorSettings.email})`,
      `Date Generated: ${new Date().toLocaleDateString()}`,
      `=====================================================`,
      `Total Completed Sessions: ${ledger.completedSessions}`,
      `Total Billed: ${tutorSettings.currency}${ledger.totalBilled.toFixed(2)}`,
      `Total Paid: ${tutorSettings.currency}${ledger.totalPaid.toFixed(2)}`,
      `CURRENT OUTSTANDING BALANCE: ${tutorSettings.currency}${ledger.balanceDue.toFixed(2)}`,
      `-----------------------------------------------------`,
      `SESSION BREAKDOWN:`,
      ...completedSessions.map(s => 
        `${s.date} ${s.startTime} | ${s.subject} (${s.durationMinutes}m) | ${tutorSettings.currency}${s.amount.toFixed(2)} | Status: ${s.isPaid ? 'PAID' : 'UNPAID'}`
      ),
      `=====================================================`,
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `statement_${currentStudent.portalCode}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatementDownloaded(true);
    notify(
      'success',
      'Personal Statement Exported',
      `Ledger statement for ${currentStudent.name} (${currentStudent.portalCode}) downloaded successfully`
    );
    setTimeout(() => setStatementDownloaded(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Student Welcome & Identity Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={currentStudent.avatar}
            alt={currentStudent.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Student Portal
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {currentStudent.portalCode}
              </span>
            </div>
            <h2 className="text-2xl font-bold mt-1.5">{currentStudent.name}</h2>
            <p className="text-xs text-slate-300">
              {currentStudent.gradeLevel} • {currentStudent.subject}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {tutorSettings.allowStudentSelfBooking ? (
            <button
              onClick={() => onOpenBookModal()}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Book New Lesson
            </button>
          ) : (
            <div className="px-3 py-2 bg-white/10 rounded-xl text-xs text-slate-300 border border-white/10 text-center">
              Self-booking managed by tutor
            </div>
          )}

          <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Studio Program</span>
            <span className="font-semibold text-slate-200">{tutorSettings.tutorName || 'Violin Studio'}</span>
          </div>
        </div>
      </div>

      {/* Top Level Pedagogical Metric Cards for Student */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Next Scheduled Lesson */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Next Lesson</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          {nextSession ? (
            <div className="mt-2">
              <p className="text-lg font-bold text-slate-900">{nextSession.subject}</p>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">
                {nextSession.date === todayStr ? 'Today' : nextSession.date} at {nextSession.startTime}
              </p>
              {nextSession.meetingLink && (
                <a
                  href={nextSession.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-xs font-semibold text-blue-600 hover:underline"
                >
                  <Video className="w-3.5 h-3.5 mr-1" />
                  Join Meeting Room
                </a>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm font-semibold text-slate-700">No upcoming sessions</p>
              <p className="text-xs text-slate-400 mt-0.5">Book a slot to schedule your next lesson.</p>
            </div>
          )}
        </div>

        {/* Completed Lessons */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Completed Lessons</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{ledger.completedSessions}</p>
          <p className="text-xs text-slate-500 mt-1">
            Total of {completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0)} minutes learned
          </p>
        </div>

        {/* Current Technique & Studies Focus */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Current Study Focus</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-base font-bold text-slate-900 mt-2 truncate">
            {currentStudent.currentEtude || 'Technical Studies'}
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {currentStudent.bowingGoals || 'Scales, arpeggios & posture'}
          </p>
        </div>

      </div>

      {/* Violin Studio Profile & Repertoire Card */}
      <div className="bg-white rounded-2xl border border-amber-900/15 shadow-xs p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-950">Violin Curriculum &amp; Active Repertoire</h3>
              <p className="text-xs text-slate-500">Current solo literature, etude studies, and bowing technique focus</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Instrument: {currentStudent.instrumentSize || '4/4 Full Size Violin'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Active Repertoire */}
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
              Active Solo Repertoire
            </span>
            {currentStudent.currentRepertoire && currentStudent.currentRepertoire.length > 0 ? (
              <ul className="space-y-1">
                {currentStudent.currentRepertoire.map((piece, idx) => (
                  <li key={idx} className="text-xs font-medium text-slate-800 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block flex-shrink-0" />
                    <span>{piece}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">No solo piece assigned yet</p>
            )}
          </div>

          {/* Current Etude */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Etude &amp; Technical Study
            </span>
            <p className="text-xs font-semibold text-slate-900">
              {currentStudent.currentEtude || 'Kreutzer 42 Studies or Wohlfahrt Op. 45'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Standard weekly etude for left hand facility and shifting.
            </p>
          </div>

          {/* Bowing Goals */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
              Bowing &amp; Tone Goals
            </span>
            <p className="text-xs font-medium text-slate-900">
              {currentStudent.bowingGoals || 'Sustained sound projection and supple wrist motion.'}
            </p>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Schedule &amp; Calendar
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Finances &amp; Statements
          {ledger.balanceDue > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              Due
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Lesson History &amp; Maestro Notes
        </button>
        <button
          onClick={() => setActiveTab('toolkit')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center ${
            activeTab === 'toolkit'
              ? 'border-amber-600 text-amber-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Music className="w-4 h-4 mr-1.5 text-amber-600" />
          Violin Practice Toolkit
          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
            Tuner &amp; Drone
          </span>
        </button>
      </div>

      {/* Tab 1: My Schedule */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upcoming Violin Lessons</h3>
                <p className="text-xs text-slate-500">Your scheduled violin lessons and studio coaching sessions</p>
              </div>

              {tutorSettings.allowStudentSelfBooking && (
                <button
                  onClick={() => onOpenBookModal()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  + Self-Book Slot
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {upcomingSessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  You have no upcoming sessions booked right now.
                  {tutorSettings.allowStudentSelfBooking && (
                    <div className="mt-3">
                      <button
                        onClick={() => onOpenBookModal()}
                        className="px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                      >
                        Book Your Next Lesson
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold">{session.startTime}</span>
                        <span className="text-[9px] text-blue-600">{session.durationMinutes}m</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">{session.subject}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-600">{session.date}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {session.topicNotes || 'General tutoring lesson'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            SCHEDULED
                          </span>
                          {session.recurringGroupId && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center">
                              <Repeat className="w-2.5 h-2.5 mr-1" />
                              <span>3-Month Regular Series {session.recurrenceIndex && session.recurrenceTotal && `(${session.recurrenceIndex}/${session.recurrenceTotal})`}</span>
                            </span>
                          )}
                          {session.repertoireFocus && (
                            <span className="text-[11px] font-medium text-slate-600">
                              Focus: {session.repertoireFocus}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 inline-flex items-center"
                        >
                          <Video className="w-3.5 h-3.5 mr-1" />
                          Join Call
                        </a>
                      )}

                      <button
                        onClick={() => onOpenSessionModal(session)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Manage / Reschedule
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Personal Ledger & Payment Records */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          
          {/* Statement Action & Financial Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal Lesson Ledger</h3>
              <p className="text-xs text-slate-500">
                Direct view of completed sessions, payment status (paid/unpaid), and current outstanding balance.
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <button
                onClick={handleDownloadStatement}
                className="inline-flex items-center px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                {statementDownloaded ? 'Downloaded ✓' : 'Download Statement'}
              </button>
            </div>
          </div>

          {/* Balance Notice Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            ledger.balanceDue > 0 
              ? 'bg-amber-50 border-amber-200 text-amber-900' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center space-x-3">
              {ledger.balanceDue > 0 ? (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-bold">
                  {ledger.balanceDue > 0
                    ? `Outstanding Balance Due: ${tutorSettings.currency}${ledger.balanceDue.toFixed(2)}`
                    : 'All Completed Sessions Are Paid'}
                </p>
                <p className="text-xs opacity-90">
                  {ledger.balanceDue > 0
                    ? 'Please settle pending dues via the payment methods below or contact your tutor.'
                    : 'Thank you for keeping your tutoring ledger current.'}
                </p>
              </div>
            </div>

            {ledger.balanceDue > 0 && (
              <div className="text-xs font-mono bg-white/70 px-3 py-1.5 rounded-lg border border-amber-300">
                Tutor Payment Contact: {tutorSettings.email}
              </div>
            )}
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Topic / Subject</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No sessions recorded in your ledger yet.
                    </td>
                  </tr>
                ) : (
                  ledger.sessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {sess.date} <span className="text-slate-400 font-normal">@{sess.startTime}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                        <div className="flex items-center space-x-1.5">
                          <span>{sess.topicNotes || sess.subject}</span>
                          {sess.recurringGroupId && (
                            <Repeat className="w-3 h-3 text-blue-600 flex-shrink-0" title="Regular 3-month series" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{sess.durationMinutes} mins</td>
                      <td className="px-4 py-3 text-slate-600">
                        {tutorSettings.currency}{sess.rate}/hr
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {tutorSettings.currency}{sess.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sess.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sess.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sess.isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {sess.isPaid ? 'PAID ✓' : 'UNPAID'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Instructions Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center">
              <CreditCard className="w-4 h-4 mr-1.5 text-blue-600" />
              Payment Instructions & Settlement Methods
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-semibold block text-slate-900 mb-1">Direct Bank Wire / Zelle:</span>
                <p>Account: {tutorSettings.tutorName || 'Violin Studio Tuition'}</p>
                <p>Email: {tutorSettings.email}</p>
                <p className="text-[11px] text-slate-400 mt-1">Reference: {currentStudent.portalCode}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-semibold block text-slate-900 mb-1">Telegram Support / Inquiries:</span>
                <p>Handle: {tutorSettings.telegram}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Once payment is sent, it will be marked as paid in your studio statement.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Lesson History & Tutor Feedback */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-base font-bold text-slate-900 mb-1">Study Notes &amp; Lesson Recommendations</h3>
            <p className="text-xs text-slate-500 mb-4">
              Review personal feedback and practice guidance left following completed lessons.
            </p>

            <div className="space-y-4">
              {completedSessions.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No completed sessions with feedback yet.
                </p>
              ) : (
                completedSessions.map((sess) => (
                  <div key={sess.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{sess.subject}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-600 font-medium">{sess.date}</span>
                      </div>
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        Completed
                      </span>
                    </div>

                    {sess.topicNotes && (
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Covered:</span> {sess.topicNotes}
                      </p>
                    )}

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                      <span className="font-semibold text-blue-900 block mb-1">Tutor Feedback:</span>
                      <p className="text-slate-700 italic">
                        {sess.tutorFeedback || 'Session completed successfully. Keep practicing practice sets.'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Violin Practice Toolkit (Tuner, Drone, Metronome) */}
      {activeTab === 'toolkit' && (
        <div className="space-y-4">
          <ViolinPracticeToolkit initialTab="tuner" />
        </div>
      )}

    </div>
  );
};
