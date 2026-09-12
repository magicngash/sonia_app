import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, 
  Shield, 
  Calendar, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Settings,
  Lock,
  DollarSign
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { dayIndex: 1, name: 'Monday' },
  { dayIndex: 2, name: 'Tuesday' },
  { dayIndex: 3, name: 'Wednesday' },
  { dayIndex: 4, name: 'Thursday' },
  { dayIndex: 5, name: 'Friday' },
  { dayIndex: 6, name: 'Saturday' },
  { dayIndex: 0, name: 'Sunday' },
];

export const AvailabilitySettings: React.FC = () => {
  const { 
    tutorSettings, 
    updateTutorSettings, 
    addBlockedSlot, 
    removeBlockedSlot 
  } = useApp();

  const [savedNotice, setSavedNotice] = useState(false);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);

  // New block state
  const [newBlock, setNewBlock] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '15:00',
    reason: '',
  });

  const showSaveNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleDayToggle = (dayIndex: number, enabled: boolean) => {
    const current = tutorSettings.workingHours[dayIndex] || { start: '09:00', end: '18:00', enabled: false };
    updateTutorSettings({
      workingHours: {
        ...tutorSettings.workingHours,
        [dayIndex]: { ...current, enabled },
      },
    });
    showSaveNotice();
  };

  const handleTimeChange = (dayIndex: number, field: 'start' | 'end', val: string) => {
    const current = tutorSettings.workingHours[dayIndex] || { start: '09:00', end: '18:00', enabled: true };
    updateTutorSettings({
      workingHours: {
        ...tutorSettings.workingHours,
        [dayIndex]: { ...current, [field]: val },
      },
    });
    showSaveNotice();
  };

  const handleBufferChange = (minutes: number) => {
    updateTutorSettings({ bufferMinutes: minutes });
    showSaveNotice();
  };

  const handleToggleSelfBooking = (val: boolean) => {
    updateTutorSettings({ allowStudentSelfBooking: val });
    showSaveNotice();
  };

  const handleToggleRescheduling = (val: boolean) => {
    updateTutorSettings({ allowStudentRescheduling: val });
    showSaveNotice();
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlock.title.trim()) return;

    addBlockedSlot({
      title: newBlock.title.trim(),
      date: newBlock.date,
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      reason: newBlock.reason.trim(),
    });

    setShowAddBlockModal(false);
    setNewBlock({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '13:00',
      endTime: '15:00',
      reason: '',
    });
    showSaveNotice();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Availability & Booking Rules</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure working hours, session buffers, blocked personal time, and student self-booking permissions.
          </p>
        </div>

        {savedNotice && (
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center animate-in fade-in">
            <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Settings Updated Live
          </div>
        )}
      </div>

      {/* Grid: Working Hours on Left, Permissions & Buffer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recurring Working Hours */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Recurring Working Hours</h4>
              <p className="text-xs text-slate-500">Days and hours available for lesson booking</p>
            </div>
            <span className="text-[11px] text-slate-400">Weekly Schedule</span>
          </div>

          <div className="space-y-3">
            {DAYS_OF_WEEK.map(({ dayIndex, name }) => {
              const config = tutorSettings.workingHours[dayIndex] || {
                enabled: false,
                start: '09:00',
                end: '18:00',
              };

              return (
                <div
                  key={dayIndex}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    config.enabled
                      ? 'bg-white border-slate-200 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`day-toggle-${dayIndex}`}
                      checked={config.enabled}
                      onChange={(e) => handleDayToggle(dayIndex, e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <label 
                      htmlFor={`day-toggle-${dayIndex}`}
                      className="text-sm font-semibold text-slate-800 cursor-pointer w-24"
                    >
                      {name}
                    </label>
                  </div>

                  {config.enabled ? (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-500">From</span>
                      <input
                        type="time"
                        value={config.start}
                        onChange={(e) => handleTimeChange(dayIndex, 'start', e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-slate-500">to</span>
                      <input
                        type="time"
                        value={config.end}
                        onChange={(e) => handleTimeChange(dayIndex, 'end', e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Day Off / Unavailable</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Buffers, Permissions, Blocked Slots */}
        <div className="lg:col-span-5 space-y-6">

          {/* Buffer Time Selector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Buffer Time Between Lessons</h4>
            <p className="text-xs text-slate-500 mb-3">
              Automatically holds break time before and after sessions to prevent back-to-back fatigue.
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[0, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleBufferChange(mins)}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${
                    tutorSettings.bufferMinutes === mins
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mins === 0 ? 'No Buffer' : `${mins} mins`}
                </button>
              ))}
            </div>
          </div>

          {/* Student Portal Self-Service Permissions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Student Portal Access Rules
            </h4>

            {/* Self-booking toggle */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Allow Student Self-Booking
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Students can book upcoming open slots directly from their portal calendar.
                </p>
              </div>
              <input
                type="checkbox"
                checked={tutorSettings.allowStudentSelfBooking}
                onChange={(e) => handleToggleSelfBooking(e.target.checked)}
                className="mt-1 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Rescheduling toggle */}
            <div className="flex items-start justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Allow Student Rescheduling
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Permit students to move their upcoming sessions to another available slot.
                </p>
              </div>
              <input
                type="checkbox"
                checked={tutorSettings.allowStudentRescheduling}
                onChange={(e) => handleToggleRescheduling(e.target.checked)}
                className="mt-1 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Blocked Slots Manager */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Blocked Time Slots</h4>
                <p className="text-xs text-slate-500">Holidays, seminars, and personal breaks</p>
              </div>
              <button
                onClick={() => setShowAddBlockModal(true)}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                Add Block
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {tutorSettings.blockedSlots.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No blocked time slots currently scheduled.
                </p>
              ) : (
                tutorSettings.blockedSlots.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5 font-semibold text-slate-900">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{b.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {b.date} • {b.startTime} - {b.endTime}
                      </p>
                    </div>

                    <button
                      onClick={() => removeBlockedSlot(b.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete blocked slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Add Block Modal */}
      {showAddBlockModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Block Out Time Slot</h3>
            <p className="text-xs text-slate-500">
              Students and automated booking will see this time as unavailable.
            </p>

            <form onSubmit={handleAddBlock} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doctor appointment, Faculty meeting"
                  value={newBlock.title}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newBlock.date}
                  onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newBlock.startTime}
                    onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newBlock.endTime}
                    onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                    className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddBlockModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
                >
                  Save Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
