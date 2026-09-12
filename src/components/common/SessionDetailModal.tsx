import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonSession } from '../../types';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Video, 
  Edit3, 
  Trash2, 
  RotateCcw,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  Repeat,
  Music,
  Volume2
} from 'lucide-react';
import { getAvailableSlotsForDate } from '../../utils/availability';
import { playViolinTone } from '../../utils/violinAudio';

interface SessionDetailModalProps {
  session: LessonSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const { 
    role, 
    students, 
    tutorSettings, 
    sessions,
    toggleLessonComplete, 
    toggleLessonPaid, 
    cancelLesson, 
    deleteLesson,
    cancelRecurringSeries,
    deleteRecurringSeries,
    rescheduleLesson,
    updateLesson 
  } = useApp();

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  if (!isOpen || !session) return null;

  const student = students.find(s => s.id === session.studentId);
  const isTutor = role === 'tutor';
  const canReschedule = isTutor || tutorSettings.allowStudentRescheduling;

  // Real-time slots for rescheduling
  const rescheduleSlots = newDate 
    ? getAvailableSlotsForDate(newDate, session.durationMinutes, tutorSettings, sessions)
    : [];

  const handleToggleComplete = () => {
    const isNowComplete = session.status !== 'completed';
    toggleLessonComplete(session.id, isNowComplete, feedbackNotes);
  };

  const handleTogglePaid = () => {
    toggleLessonPaid(session.id, !session.isPaid);
  };

  const handleCancelSession = () => {
    setShowCancelPrompt(true);
    setShowDeletePrompt(false);
  };

  const handleDeleteSession = () => {
    setShowDeletePrompt(true);
    setShowCancelPrompt(false);
  };

  const handleCancelSingle = () => {
    cancelLesson(session.id);
    setShowCancelPrompt(false);
    onClose();
  };

  const handleCancelEntireSeries = () => {
    if (session.recurringGroupId) {
      cancelRecurringSeries(session.recurringGroupId, session.date);
    }
    setShowCancelPrompt(false);
    onClose();
  };

  const handleDeleteSingle = () => {
    deleteLesson(session.id);
    setShowDeletePrompt(false);
    onClose();
  };

  const handleDeleteEntireSeries = () => {
    if (session.recurringGroupId) {
      deleteRecurringSeries(session.recurringGroupId);
    } else {
      deleteLesson(session.id);
    }
    setShowDeletePrompt(false);
    onClose();
  };

  const handleSaveReschedule = () => {
    if (!newDate || !newStartTime) return;
    rescheduleLesson(session.id, newDate, newStartTime);
    setIsRescheduling(false);
  };

  const handleSaveFeedback = () => {
    updateLesson(session.id, { tutorFeedback: feedbackNotes });
    setShowFeedbackInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="session-detail-dialog"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${
              session.status === 'completed' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : session.status === 'cancelled'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-base">{session.subject}</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  session.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : session.status === 'cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {session.status}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {session.date} at {session.startTime} ({session.durationMinutes} minutes)
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

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Student Info Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={student?.avatar}
                alt={student?.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <p className="text-xs text-slate-500 font-medium">Student</p>
                <p className="text-sm font-semibold text-slate-900">{student?.name || 'Unknown'}</p>
                <p className="text-xs text-slate-500">{student?.gradeLevel}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Contact</p>
              <p className="text-xs font-medium text-slate-700">{student?.email}</p>
              {student?.telegram && (
                <p className="text-xs text-sky-600 font-mono">{student.telegram}</p>
              )}
            </div>
          </div>

          {/* Recurring Schedule Indicator */}
          {session.recurringGroupId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-blue-950 font-semibold">
                <Repeat className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  Part of Regular 3-Month Weekly Series
                  {session.recurrenceIndex && session.recurrenceTotal && ` (Lesson ${session.recurrenceIndex} of ${session.recurrenceTotal})`}
                </span>
              </div>
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                Recurring
              </span>
            </div>
          )}

          {/* Cancel Options Prompt */}
          {showCancelPrompt && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3 animate-in fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1.5 text-rose-600" />
                  Cancel Session
                </span>
                <button
                  onClick={() => setShowCancelPrompt(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-700">
                {session.recurringGroupId
                  ? 'This lesson is part of a regular 3-month recurring schedule. How would you like to cancel?'
                  : 'Are you sure you want to cancel this lesson? The session will remain in records marked as Cancelled.'}
              </p>
              {session.recurringGroupId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCancelSingle}
                    className="p-2.5 bg-white border border-rose-300 text-rose-800 rounded-lg font-semibold hover:bg-rose-100 transition-colors text-left cursor-pointer"
                  >
                    <span className="block font-bold">Cancel This Lesson Only</span>
                    <span className="text-[10px] text-slate-500 font-normal">Keep remaining 3-month schedule</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEntireSeries}
                    className="p-2.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors text-left cursor-pointer"
                  >
                    <span className="block font-bold">Cancel All Future Lessons</span>
                    <span className="text-[10px] text-rose-100 font-normal">Cancel series from {session.date} onward</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCancelPrompt(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                  >
                    Keep Scheduled
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSingle}
                    className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 shadow-sm"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delete / Remove Options Prompt */}
          {showDeletePrompt && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-xl space-y-3 animate-in fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-900 flex items-center">
                  <Trash2 className="w-4 h-4 mr-1.5 text-red-600" />
                  Permanently Remove Lesson
                </span>
                <button
                  onClick={() => setShowDeletePrompt(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-700">
                {session.recurringGroupId
                  ? 'This lesson is part of a regular 3-month series. Would you like to remove this single lesson or delete the entire 12-week recurring series?'
                  : 'Permanently remove this lesson? This will delete it completely from your calendar and financial ledger.'}
              </p>
              {session.recurringGroupId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDeleteSingle}
                    className="p-2.5 bg-white border border-red-300 text-red-800 rounded-lg font-semibold hover:bg-red-100 transition-colors text-left cursor-pointer"
                  >
                    <span className="block font-bold">Delete This Lesson Only</span>
                    <span className="text-[10px] text-slate-500 font-normal">Remove only the {session.date} session</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteEntireSeries}
                    className="p-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-left cursor-pointer"
                  >
                    <span className="block font-bold">Delete Entire Series (12 Lessons)</span>
                    <span className="text-[10px] text-red-100 font-normal">Purge all lessons in recurring group</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDeletePrompt(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                  >
                    Nevermind
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSingle}
                    className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 shadow-sm"
                  >
                    Delete Lesson
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Meeting Link */}
          {session.meetingLink && session.status !== 'cancelled' && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-xs font-semibold text-blue-900">Virtual Classroom</span>
                  <p className="text-[11px] text-blue-700 truncate max-w-xs font-mono">
                    {session.meetingLink}
                  </p>
                </div>
              </div>
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Join Now
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          )}

          {/* Status & Details (Tutor has financial controls; student has academic focus) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Completion Box */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500 font-medium">Attendance & Status</span>
                {session.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className="text-sm font-bold text-slate-900 capitalize mb-2">
                {session.status}
              </p>

              {isTutor && session.status !== 'cancelled' && (
                <button
                  type="button"
                  id="toggle-completion-btn"
                  onClick={handleToggleComplete}
                  className={`w-full py-1.5 px-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    session.status === 'completed'
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  }`}
                >
                  {session.status === 'completed' ? 'Revert to Scheduled' : 'Mark Completed ✓'}
                </button>
              )}
            </div>

            {/* Tutor: Payment Status | Student: Academic Format */}
            {isTutor ? (
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500 font-medium">Payment Status</span>
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-baseline space-x-1.5 mb-2">
                  <span className="text-base font-bold text-slate-900">
                    {tutorSettings.currency}{session.amount.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    session.isPaid 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {session.isPaid ? 'PAID' : 'UNPAID'}
                  </span>
                </div>

                <button
                  type="button"
                  id="toggle-paid-btn"
                  onClick={handleTogglePaid}
                  className={`w-full py-1.5 px-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    session.isPaid
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  {session.isPaid ? 'Mark as Unpaid' : 'Mark as Paid ✓'}
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500 font-medium">Lesson Format</span>
                  <Music className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm font-bold text-slate-900 capitalize mb-1">
                  1-on-1 Studio Coaching
                </p>
                <p className="text-[11px] text-slate-500">
                  {session.durationMinutes} min customized violin lesson
                </p>
              </div>
            )}
          </div>

          {/* Violin Repertoire & Technical Assignments */}
          {(session.repertoireFocus || session.practiceAssignments) && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center">
                  <Music className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                  Violin Repertoire &amp; Studio Assignment:
                </span>
                <button
                  type="button"
                  onClick={() => playViolinTone('A', 440, 2.0)}
                  className="px-2 py-0.5 rounded bg-amber-200/70 hover:bg-amber-300 text-amber-900 font-semibold text-[11px] inline-flex items-center cursor-pointer transition-colors"
                  title="Play A=440 reference tone"
                >
                  <Volume2 className="w-3 h-3 mr-1" />
                  Play A=440
                </button>
              </div>

              {session.repertoireFocus && (
                <div>
                  <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block">
                    Solo Repertoire / Piece
                  </span>
                  <p className="font-medium text-slate-900">{session.repertoireFocus}</p>
                </div>
              )}

              {session.practiceAssignments && (
                <div>
                  <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block">
                    Practice Assignment &amp; Etudes
                  </span>
                  <p className="text-slate-800">{session.practiceAssignments}</p>
                </div>
              )}
            </div>
          )}

          {/* Topic & Notes */}
          {session.topicNotes && (
            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">Session Topics & Notes:</span>
              <p className="leading-relaxed">{session.topicNotes}</p>
            </div>
          )}

          {/* Tutor Feedback Section */}
          <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Tutor Notes & Study Feedback:
              </span>
              {isTutor && !showFeedbackInput && (
                <button
                  onClick={() => {
                    setFeedbackNotes(session.tutorFeedback || '');
                    setShowFeedbackInput(true);
                  }}
                  className="text-blue-600 hover:underline text-[11px] font-medium"
                >
                  {session.tutorFeedback ? 'Edit Feedback' : '+ Add Feedback'}
                </button>
              )}
            </div>

            {showFeedbackInput ? (
              <div className="space-y-2 mt-2">
                <textarea
                  rows={2}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Leave study recommendations or notes on student progress..."
                  className="w-full p-2 bg-white rounded border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowFeedbackInput(false)}
                    className="px-2.5 py-1 text-slate-600 text-xs hover:bg-slate-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFeedback}
                    className="px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
                  >
                    Save Feedback
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 italic">
                {session.tutorFeedback || 'No tutor feedback logged yet.'}
              </p>
            )}
          </div>

          {/* Reschedule Drawer (if active) */}
          {isRescheduling && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Reschedule Session
                </h4>
                <button
                  onClick={() => setIsRescheduling(false)}
                  className="text-amber-800 hover:text-amber-950 text-xs"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">
                  Choose New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    setNewStartTime('');
                  }}
                  className="w-full px-3 py-1.5 bg-white rounded border border-amber-300 text-xs"
                />
              </div>

              {newDate && (
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1 bg-white rounded border border-amber-200">
                    {rescheduleSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setNewStartTime(slot.time)}
                        className={`py-1 text-xs rounded border text-center ${
                          !slot.available
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                            : newStartTime === slot.time
                            ? 'bg-amber-600 text-white border-amber-600 font-bold'
                            : 'hover:bg-amber-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!newDate || !newStartTime}
                onClick={handleSaveReschedule}
                className="w-full py-2 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700 disabled:opacity-50"
              >
                Confirm Reschedule ({newDate} {newStartTime})
              </button>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {session.status !== 'cancelled' ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelSession}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors inline-flex items-center cursor-pointer"
                    title="Mark session as cancelled"
                  >
                    <X className="w-3.5 h-3.5 mr-1 text-rose-600" />
                    Cancel Lesson
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteSession}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors inline-flex items-center cursor-pointer"
                    title="Permanently remove lesson from database"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1 text-red-600" />
                    Remove Lesson
                  </button>

                  {canReschedule && !isRescheduling && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewDate(session.date);
                        setIsRescheduling(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Reschedule
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-rose-600 font-medium italic">Cancelled</span>
                  <button
                    type="button"
                    onClick={handleDeleteSession}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors inline-flex items-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Purge from Records
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors ml-auto cursor-pointer"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
