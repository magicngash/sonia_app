import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TutorDashboard } from './components/tutor/TutorDashboard';
import { TutorCalendar } from './components/tutor/TutorCalendar';
import { StudentRoster } from './components/tutor/StudentRoster';
import { FinancialLedger } from './components/tutor/FinancialLedger';
import { AvailabilitySettings } from './components/tutor/AvailabilitySettings';
import { NotificationCenter } from './components/tutor/NotificationCenter';
import { StudentPortal } from './components/student/StudentPortal';
import { RoleSwitchModal } from './components/auth/RoleSwitchModal';
import { BookLessonModal } from './components/common/BookLessonModal';
import { SessionDetailModal } from './components/common/SessionDetailModal';
import { ViolinPracticeToolkit } from './components/common/ViolinPracticeToolkit';
import { ToastContainer } from './components/common/ToastContainer';
import { LessonSession } from './types';
import { ShieldCheck, UserCheck, ArrowRightLeft } from 'lucide-react';

const MainContent: React.FC = () => {
  const { role, currentStudent, loginAsTutor } = useApp();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState<string | undefined>(undefined);
  const [bookingStudentId, setBookingStudentId] = useState<string | undefined>(undefined);

  const [selectedSession, setSelectedSession] = useState<LessonSession | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedRosterStudentId, setSelectedRosterStudentId] = useState<string | null>(null);

  const handleOpenBookModal = (date?: string, studentId?: string) => {
    setBookingDate(date);
    setBookingStudentId(studentId);
    setIsBookModalOpen(true);
  };

  const handleOpenSessionModal = (session: LessonSession) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  const handleSelectStudentProfile = (studentId: string) => {
    setSelectedRosterStudentId(studentId);
    setCurrentTab('students');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenBookModal={() => handleOpenBookModal()}
      />

      {/* Role Banner / Context Bar */}
      {role === 'student' && currentStudent && (
        <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-800 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span>
                <strong>Restricted Student Portal Mode:</strong> Viewing personal profile for <strong>{currentStudent.name}</strong> ({currentStudent.portalCode}). Access is strictly limited to your sessions and ledger.
              </span>
            </div>
            <button
              onClick={loginAsTutor}
              className="underline text-emerald-200 hover:text-white font-semibold flex items-center ml-4 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Return to Tutor Admin
            </button>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {role === 'student' ? (
          <StudentPortal
            onOpenBookModal={handleOpenBookModal}
            onOpenSessionModal={handleOpenSessionModal}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <TutorDashboard
                onSelectTab={setCurrentTab}
                onOpenBookModal={() => handleOpenBookModal()}
                onOpenSessionModal={handleOpenSessionModal}
                onSelectStudentProfile={handleSelectStudentProfile}
              />
            )}

            {currentTab === 'calendar' && (
              <TutorCalendar
                onOpenBookModal={handleOpenBookModal}
                onOpenSessionModal={handleOpenSessionModal}
              />
            )}

            {currentTab === 'students' && (
              <StudentRoster
                selectedStudentId={selectedRosterStudentId}
                onOpenBookModal={handleOpenBookModal}
                onOpenSessionModal={handleOpenSessionModal}
                onSelectTab={setCurrentTab}
              />
            )}

            {currentTab === 'ledger' && (
              <FinancialLedger
                onOpenSessionModal={handleOpenSessionModal}
                onSelectStudentProfile={handleSelectStudentProfile}
                onOpenBookModal={() => handleOpenBookModal()}
              />
            )}

            {currentTab === 'availability' && (
              <AvailabilitySettings />
            )}

            {currentTab === 'toolkit' && (
              <ViolinPracticeToolkit initialTab="tuner" />
            )}

            {currentTab === 'notifications' && (
              <NotificationCenter />
            )}
          </>
        )}
      </main>

      {/* Role Switcher Modal */}
      <RoleSwitchModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* Booking Modal */}
      <BookLessonModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setBookingDate(undefined);
          setBookingStudentId(undefined);
        }}
        preselectedDate={bookingDate}
        preselectedStudentId={bookingStudentId}
      />

      {/* Session Details Modal */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setSelectedSession(null);
        }}
      />

      {/* Global Real-Time Action Notification Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
