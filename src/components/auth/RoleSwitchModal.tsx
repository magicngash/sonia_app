import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  Check, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface RoleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({ isOpen, onClose }) => {
  const { 
    role, 
    currentStudentId, 
    students, 
    tutorSettings, 
    loginAsTutor, 
    loginAsStudent, 
    loginWithPortalCode,
    resetAllData 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'quick' | 'portal_code'>('quick');
  const [inputCode, setInputCode] = useState('');
  const [codeError, setCodeError] = useState('');

  if (!isOpen) return null;

  const handleTutorSelect = () => {
    loginAsTutor();
    onClose();
  };

  const handleStudentSelect = (studentId: string) => {
    loginAsStudent(studentId);
    onClose();
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    if (!inputCode.trim()) {
      setCodeError('Please enter a student portal code.');
      return;
    }

    const success = loginWithPortalCode(inputCode);
    if (success) {
      setInputCode('');
      onClose();
    } else {
      setCodeError('Invalid student portal code. Check student profile in tutor roster or try STU-ALEX-901.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="role-switch-dialog"
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-white/10">
              <KeyRound className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Portal Access & Role Login</h3>
              <p className="text-xs text-slate-300">Switch role or authenticate as a student</p>
            </div>
          </div>
          <button
            id="close-role-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <button
            onClick={() => { setActiveTab('quick'); setCodeError(''); }}
            className={`pb-3 text-sm font-medium border-b-2 mr-6 transition-colors ${
              activeTab === 'quick'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Quick Profile Switch
          </button>
          <button
            onClick={() => { setActiveTab('portal_code'); setCodeError(''); }}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'portal_code'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Student Passcode Login
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'quick' ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Admin & Management
                </span>
                <button
                  id="select-tutor-role"
                  onClick={handleTutorSelect}
                  className={`mt-2 w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    role === 'tutor'
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {tutorSettings.tutorName}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Full Admin
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Manage all schedules, students, settings & finances
                      </p>
                    </div>
                  </div>
                  {role === 'tutor' && <Check className="w-5 h-5 text-blue-600" />}
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Student Portal (Restricted Access)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Each sees only their personal ledger
                  </span>
                </div>

                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {students.map((stu) => {
                    const isSelected = role === 'student' && currentStudentId === stu.id;
                    return (
                      <button
                        key={stu.id}
                        id={`select-student-${stu.id}`}
                        onClick={() => handleStudentSelect(stu.id)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={stu.avatar}
                            alt={stu.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-slate-900 text-sm">{stu.name}</span>
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {stu.portalCode}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{stu.subject}</p>
                          </div>
                        </div>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-600 mb-3">
                Students enter their unique portal access code to access their restricted schedule and personal ledger.
              </p>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Student Portal Code
                  </label>
                  <input
                    type="text"
                    id="student-code-input"
                    placeholder="e.g. STU-ALEX-901"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value);
                      setCodeError('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {codeError && (
                  <div className="flex items-center text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg">
                    <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>{codeError}</span>
                  </div>
                )}

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800 mb-1">Quick Demo Codes:</p>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                    {students.slice(0, 4).map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setInputCode(s.portalCode)}
                        className="text-left px-2 py-1 rounded bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors truncate"
                      >
                        {s.portalCode} ({s.name.split(' ')[0]})
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  id="submit-portal-code"
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                >
                  Access Student Portal
                </button>
              </form>
            </div>
          )}

          {/* Reset Demo Data Action */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Need a clean slate?</span>
            <button
              onClick={() => {
                if (window.confirm('Reset all demo lessons, students, and settings to original state?')) {
                  resetAllData();
                  onClose();
                }
              }}
              className="inline-flex items-center text-slate-500 hover:text-rose-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Demo Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
