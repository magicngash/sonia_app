import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Bell, 
  ArrowRightLeft, 
  UserCheck, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Sparkles,
  Music
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenRoleModal: () => void;
  onOpenBookModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenRoleModal,
  onOpenBookModal,
}) => {
  const { 
    role, 
    currentStudent, 
    tutorSettings, 
    notifications, 
    soundEnabled,
    toggleSound,
    notify,
    getOverallFinancials,
    getStudentLedger 
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const overallFinancials = getOverallFinancials();
  const studentLedger = currentStudent ? getStudentLedger(currentStudent.id) : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-200 border border-amber-800/40 flex items-center justify-center shadow-sm">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">
                  Violin<span className="text-amber-700">Studio</span>
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  role === 'tutor' 
                    ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {role === 'tutor' ? (
                    <>
                      <ShieldCheck className="w-3 h-3 mr-1 inline" />
                      Studio Admin
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3 h-3 mr-1 inline" />
                      Violinist Portal
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs">
                {role === 'tutor' 
                  ? (tutorSettings.tutorName ? `${tutorSettings.tutorName} • Studio Admin` : 'Violin Studio Administration') 
                  : `${currentStudent?.name || 'Student'} • ${currentStudent?.subject || 'Violin Study'}`}
              </p>
            </div>
          </div>

          {/* Navigation Links for Tutor */}
          {role === 'tutor' && (
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
                { id: 'calendar', label: 'Calendar', icon: Calendar },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'ledger', label: 'Finances', icon: DollarSign },
                { id: 'availability', label: 'Availability', icon: Clock },
                { id: 'toolkit', label: 'Practice Toolkit', icon: Music },
                { id: 'notifications', label: 'Reminders', icon: Bell },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => setCurrentTab(item.id)}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Actions on the right */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Action: Book a lesson */}
            <button
              id="quick-book-button"
              onClick={onOpenBookModal}
              className="inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">
                {role === 'tutor' ? 'Schedule Lesson' : 'Book Session'}
              </span>
              <span className="sm:hidden">Book</span>
            </button>

            {/* Audio Feedback Chime Toggle */}
            <button
              id="sound-chime-toggle"
              onClick={toggleSound}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={soundEnabled ? 'Action sound chimes enabled (Click to mute)' : 'Action sound chimes muted (Click to enable)'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                id="notification-bell-button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications & Delivery Logs"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {notifications.length > 99 ? '99+' : notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  id="notifications-popover"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                        <span>Recent Activity & Alerts</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">Live action confirmations & automated dispatches</p>
                    </div>
                    <button
                      onClick={() => {
                        notify('info', 'Test Notification', 'Real-time alert notifications and sound chimes are functioning properly!');
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold transition-colors flex items-center cursor-pointer"
                      title="Send a sample test notification"
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-blue-600" />
                      Test Alert
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                        No notifications sent yet. Take actions like booking or rescheduling to see live alerts.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((log) => (
                        <div key={log.id} className="p-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              log.channel === 'telegram' ? 'bg-sky-50 text-sky-700' : 'bg-purple-50 text-purple-700'
                            }`}>
                              {log.channel}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">{log.sentAt}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 mt-1">{log.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{log.message}</p>
                          <p className="text-[11px] text-slate-400 mt-1">To: {log.recipientName} ({log.recipientContact})</p>
                        </div>
                      ))
                    )}
                  </div>

                  {role === 'tutor' && (
                    <div className="p-2 border-t border-slate-100 bg-slate-50/70 text-center">
                      <button
                        onClick={() => {
                          setCurrentTab('notifications');
                          setShowNotifications(false);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        Open Full Notification & Reminder Center →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Role Switcher Pill */}
            <button
              id="role-switch-button"
              onClick={onOpenRoleModal}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <span className="hidden sm:inline">Switch Role</span>
              <span className="sm:hidden">Switch</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar for Tutor */}
        {role === 'tutor' && (
          <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-100">
            {[
              { id: 'dashboard', label: 'Overview' },
              { id: 'calendar', label: 'Calendar' },
              { id: 'students', label: 'Students' },
              { id: 'ledger', label: 'Finances' },
              { id: 'toolkit', label: 'Toolkit' },
              { id: 'availability', label: 'Hours' },
              { id: 'notifications', label: 'Reminders' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                  currentTab === item.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
