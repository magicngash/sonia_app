import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Mail, 
  Send, 
  Clock, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { 
    tutorSettings, 
    updateTutorSettings, 
    notifications, 
    students, 
    sendNotification 
  } = useApp();

  const [savedNotice, setSavedNotice] = useState(false);
  const [selectedStudentForTest, setSelectedStudentForTest] = useState<string>(students[0]?.id || '');
  const [testSent, setTestSent] = useState(false);

  const notifConfig = tutorSettings.notifications;

  const triggerSaveNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleTimingChange = (hours: number) => {
    updateTutorSettings({
      notifications: {
        ...notifConfig,
        timingHoursBefore: hours,
      },
    });
    triggerSaveNotice();
  };

  const handleToggleChannel = (channel: 'email' | 'telegram') => {
    const current = notifConfig.channels;
    let nextChannels: ('email' | 'telegram')[] = [];

    if (current.includes(channel)) {
      // Must keep at least one
      if (current.length > 1) {
        nextChannels = current.filter(c => c !== channel);
      } else {
        nextChannels = current;
      }
    } else {
      nextChannels = [...current, channel];
    }

    updateTutorSettings({
      notifications: {
        ...notifConfig,
        channels: nextChannels,
      },
    });
    triggerSaveNotice();
  };

  const handleToggleReminders = (enabled: boolean) => {
    updateTutorSettings({
      notifications: {
        ...notifConfig,
        enableReminders: enabled,
      },
    });
    triggerSaveNotice();
  };

  const handleToggleBookingConfirmation = (enabled: boolean) => {
    updateTutorSettings({
      notifications: {
        ...notifConfig,
        autoConfirmationOnBooking: enabled,
      },
    });
    triggerSaveNotice();
  };

  const handleSendTestNotification = () => {
    const targetStudent = students.find(s => s.id === selectedStudentForTest);
    if (!targetStudent) return;

    const channel = notifConfig.channels[0] || 'email';
    const contact = channel === 'telegram' && targetStudent.telegram ? targetStudent.telegram : targetStudent.email;

    sendNotification(
      targetStudent.name,
      contact,
      channel,
      'reminder',
      `Manual Test Reminder: Tomorrow's ${targetStudent.subject} Lesson`,
      `Hi ${targetStudent.name}, this is a verification reminder test for your upcoming violin lesson. Video link and notes are prepared.`
    );

    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Notifications & Automated Reminders</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure reminder triggers, delivery channels (Email & Telegram), and dispatch rules.
          </p>
        </div>

        {savedNotice && (
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center">
            <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Rule Saved
          </div>
        )}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Notification Configuration */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Switches Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Automated Reminder Rules
            </h4>

            {/* Enable upcoming session reminders */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Pre-Session Automated Reminders
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automatically send reminders to students before their scheduled lesson time.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifConfig.enableReminders}
                onChange={(e) => handleToggleReminders(e.target.checked)}
                className="mt-1 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Instant booking confirmation */}
            <div className="flex items-start justify-between pt-3 border-t border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Instant Booking Confirmation
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Send immediate confirmation notification upon lesson creation or student self-booking.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifConfig.autoConfirmationOnBooking}
                onChange={(e) => handleToggleBookingConfirmation(e.target.checked)}
                className="mt-1 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Timing Setting */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Custom Reminder Timing</h4>
            <p className="text-xs text-slate-500 mb-3">
              Trigger notification dispatch ahead of session start time:
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[2, 12, 24, 48].map((hours) => (
                <button
                  key={hours}
                  onClick={() => handleTimingChange(hours)}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${
                    notifConfig.timingHoursBefore === hours
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {hours === 24 ? '24 Hours (1 Day)' : hours === 48 ? '48 Hours (2 Days)' : `${hours} Hours`}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Preferred Delivery Channels</h4>
            <p className="text-xs text-slate-500">
              Select one or both multi-channel communication routes:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <label 
                className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                  notifConfig.channels.includes('email')
                    ? 'border-purple-300 bg-purple-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={notifConfig.channels.includes('email')}
                  onChange={() => handleToggleChannel('email')}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-800">Email</span>
                </div>
              </label>

              <label 
                className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                  notifConfig.channels.includes('telegram')
                    ? 'border-sky-300 bg-sky-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={notifConfig.channels.includes('telegram')}
                  onChange={() => handleToggleChannel('telegram')}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-semibold text-slate-800">Telegram</span>
                </div>
              </label>
            </div>
          </div>

          {/* Test Dispatch Tool */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-blue-400" />
              Test Notification Dispatcher
            </h4>
            <p className="text-xs text-slate-300">
              Send an instant mock reminder to verify channel formatting and delivery status.
            </p>

            <div className="flex items-center space-x-2 pt-1">
              <select
                value={selectedStudentForTest}
                onChange={(e) => setSelectedStudentForTest(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.telegram || s.email})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleSendTestNotification}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                {testSent ? 'Dispatched ✓' : 'Send Test'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Live Notification Delivery Log */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Notification Delivery Log</h4>
                <p className="text-xs text-slate-500">History of dispatched confirmations & reminders</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                {notifications.length} Sent
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No notifications dispatched yet.
                </div>
              ) : (
                notifications.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          log.channel === 'telegram'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {log.channel}
                        </span>
                        <span className="font-semibold text-slate-900">{log.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.sentAt}</span>
                    </div>

                    <p className="text-slate-600 leading-relaxed">{log.message}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Recipient: {log.recipientName} ({log.recipientContact})</span>
                      <span className="text-emerald-600 font-semibold flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Delivered
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center pt-3 border-t border-slate-100 mt-4">
            Reminders are queued and dispatched via secure cloud webhook triggers.
          </p>
        </div>

      </div>

    </div>
  );
};
