import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, LessonSession } from '../../types';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Send, 
  Edit3, 
  Trash2, 
  Check, 
  DollarSign, 
  Key, 
  ExternalLink, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  X,
  Music
} from 'lucide-react';

interface StudentRosterProps {
  selectedStudentId?: string | null;
  onOpenBookModal: (date?: string, studentId?: string) => void;
  onOpenSessionModal: (session: LessonSession) => void;
  onSelectTab?: (tab: string) => void;
}

export const StudentRoster: React.FC<StudentRosterProps> = ({
  selectedStudentId: initialSelectedId,
  onOpenBookModal,
  onOpenSessionModal,
  onSelectTab,
}) => {
  const { 
    students, 
    sessions, 
    tutorSettings, 
    addStudent, 
    updateStudent, 
    deleteStudent,
    deleteLesson,
    deleteRecurringSeries,
    cancelLesson,
    loginAsStudent,
    toggleLessonComplete,
  } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    initialSelectedId || students[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFilter, setFilterFilter] = useState<'all' | 'active'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteWithSessions, setDeleteWithSessions] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<LessonSession | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [newPieceInput, setNewPieceInput] = useState('');

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    telegram: '',
    gradeLevel: 'Intermediate',
    subject: 'Violin Solo & Technique',
    instrumentSize: '4/4 Full Size',
    currentEtude: '',
    bowingGoals: '',
    initialPiece: '',
    hourlyRate: tutorSettings.defaultHourlyRate,
    notes: '',
  });

  // Selected student object
  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0] || null;
  const studentSessions = activeStudent 
    ? sessions.filter(s => s.studentId === activeStudent.id).sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)) 
    : [];

  const handleConfirmDeleteStudent = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id, deleteWithSessions);
    if (selectedStudentId === studentToDelete.id) {
      const remaining = students.filter(s => s.id !== studentToDelete.id);
      setSelectedStudentId(remaining[0]?.id || null);
    }
    setStudentToDelete(null);
    setDeleteWithSessions(false);
  };

  const handleConfirmDeleteLesson = (entireSeries: boolean = false) => {
    if (!lessonToDelete) return;
    if (entireSeries && lessonToDelete.recurringGroupId) {
      deleteRecurringSeries(lessonToDelete.recurringGroupId);
    } else {
      deleteLesson(lessonToDelete.id);
    }
    setLessonToDelete(null);
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterFilter === 'active') return s.active;
    return true;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.email.trim()) return;

    const newId = addStudent({
      name: newStudent.name.trim(),
      email: newStudent.email.trim(),
      phone: newStudent.phone.trim(),
      telegram: newStudent.telegram.trim() || undefined,
      gradeLevel: newStudent.gradeLevel.trim() || 'Intermediate',
      subject: newStudent.subject.trim() || 'Violin Solo & Technique',
      instrumentSize: newStudent.instrumentSize.trim() || '4/4 Full Size',
      currentEtude: newStudent.currentEtude.trim() || undefined,
      bowingGoals: newStudent.bowingGoals.trim() || undefined,
      currentRepertoire: newStudent.initialPiece.trim() ? [newStudent.initialPiece.trim()] : ['Kreutzer Etude No. 2'],
      hourlyRate: Number(newStudent.hourlyRate) || tutorSettings.defaultHourlyRate,
      notes: newStudent.notes.trim(),
      active: true,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    });

    setShowAddModal(false);
    setSelectedStudentId(newId);
    setNewStudent({
      name: '',
      email: '',
      phone: '',
      telegram: '',
      gradeLevel: 'Intermediate',
      subject: 'Violin Solo & Technique',
      instrumentSize: '4/4 Full Size',
      currentEtude: '',
      bowingGoals: '',
      initialPiece: '',
      hourlyRate: tutorSettings.defaultHourlyRate,
      notes: '',
    });
  };

  const copyPortalCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top action & search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, subject, or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterFilter('all')}
              className={`px-3 py-1 rounded-md capitalize transition-all ${
                filterFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              All ({students.length})
            </button>
            <button
              onClick={() => setFilterFilter('active')}
              className={`px-3 py-1 rounded-md capitalize transition-all ${
                filterFilter === 'active' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Active ({students.filter(s => s.active).length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Student
          </button>
        </div>
      </div>

      {/* Main Grid: Student List on Left, Comprehensive Profile on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Student Cards */}
        <div className="lg:col-span-4 space-y-2">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              No students found matching your search.
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isSelected = activeStudent?.id === student.id;

              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900">{student.name}</h4>
                        <p className="text-xs text-slate-500">{student.gradeLevel}</p>
                        <p className="text-xs font-medium text-blue-600 mt-0.5">{student.subject}</p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {student.instrumentSize || '4/4 Size'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStudentToDelete(student);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={`Remove ${student.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className={`block text-[10px] font-medium px-1.5 py-0.5 rounded mt-1.5 ${
                        student.active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                      }`}>
                        {student.active ? 'Enrolled' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Profile View */}
        <div className="lg:col-span-8">
          {activeStudent ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              
              {/* Profile Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={activeStudent.avatar}
                    alt={activeStudent.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-slate-900">{activeStudent.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeStudent.gradeLevel} • Enrolled {activeStudent.joinedDate}
                    </p>
                    <p className="text-sm font-semibold text-blue-600 mt-0.5">
                      Primary Subject: {activeStudent.subject}
                    </p>
                  </div>
                </div>

                {/* Quick actions for this student */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onOpenBookModal(undefined, activeStudent.id)}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 inline-flex items-center shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Book / Add Lesson
                  </button>

                  <button
                    onClick={() => loginAsStudent(activeStudent.id)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 inline-flex items-center cursor-pointer"
                    title="Switch to Student Portal as this student"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    View as Student
                  </button>

                  <button
                    onClick={() => setStudentToDelete(activeStudent)}
                    className="px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 inline-flex items-center transition-colors cursor-pointer"
                    title="Remove this student from roster"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                    Remove Student
                  </button>
                </div>
              </div>

              {/* Portal Access Code & Rate Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Portal Access Box */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600 flex items-center">
                      <Key className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      Restricted Student Portal Code
                    </span>
                    <button
                      onClick={() => copyPortalCode(activeStudent.portalCode)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                    >
                      {copiedCode ? <Check className="w-3 h-3 mr-1 text-emerald-600" /> : <Copy className="w-3 h-3 mr-1" />}
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <p className="font-mono text-sm font-bold text-slate-900 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 inline-block">
                    {activeStudent.portalCode}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Student uses this code on the login screen to access their personal ledger.
                  </p>
                </div>

                {/* Violin Specification & Level Box */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600 flex items-center">
                      <Music className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                      Instrument Size &amp; Sizing
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">{activeStudent.gradeLevel}</span>
                  </div>
                  <div className="mt-1.5">
                    <select
                      value={activeStudent.instrumentSize || '4/4 Full Size'}
                      onChange={(e) => updateStudent(activeStudent.id, { instrumentSize: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="4/4 Full Size">4/4 Full Size (Standard)</option>
                      <option value="7/8 Lady's Size">7/8 Size (Small Hands)</option>
                      <option value="3/4 Size">3/4 Size (Youth / Intermediate)</option>
                      <option value="1/2 Size">1/2 Size (Junior)</option>
                      <option value="1/4 Size">1/4 Size (Beginner)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                    <span>Tuition &amp; billing:</span>
                    {onSelectTab && (
                      <button
                        type="button"
                        onClick={() => onSelectTab('ledger')}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center cursor-pointer"
                      >
                        Managed in Finances &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information & Private Tutor Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider block">Contact Information</span>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{activeStudent.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{activeStudent.phone}</span>
                  </div>
                  {activeStudent.telegram && (
                    <div className="flex items-center space-x-2 text-sky-600">
                      <Send className="w-4 h-4 text-sky-500" />
                      <span>{activeStudent.telegram}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider block">Private Tutor Notes</span>
                  <textarea
                    rows={2}
                    value={activeStudent.notes}
                    onChange={(e) => updateStudent(activeStudent.id, { notes: e.target.value })}
                    placeholder="Private tutor notes regarding learning style, strengths, exam target..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Violin Curriculum & Repertoire Manager */}
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 flex items-center">
                      <Music className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                      Violin Curriculum &amp; Repertoire Focus
                    </span>
                    <select
                      value={activeStudent.instrumentSize || '4/4 Full Size'}
                      onChange={(e) => updateStudent(activeStudent.id, { instrumentSize: e.target.value })}
                      className="px-2 py-0.5 bg-white rounded border border-amber-300 text-[11px] font-semibold text-amber-900"
                    >
                      <option value="4/4 Full Size">4/4 Full Size</option>
                      <option value="7/8 Lady-Size">7/8 Lady-Size</option>
                      <option value="3/4 Size">3/4 Size</option>
                      <option value="1/2 Size">1/2 Size</option>
                      <option value="1/4 Size">1/4 Size</option>
                    </select>
                  </div>

                  {/* Active Repertoire Pieces */}
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                      Active Solo Repertoire / Concertos
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(activeStudent.currentRepertoire || []).map((piece, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-amber-200 text-slate-800 font-medium text-[11px]"
                        >
                          <span>{piece}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (activeStudent.currentRepertoire || []).filter((_, i) => i !== idx);
                              updateStudent(activeStudent.id, { currentRepertoire: updated });
                            }}
                            className="ml-1 text-slate-400 hover:text-rose-600 cursor-pointer font-bold"
                            title="Remove piece"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add piece (e.g. Bach Chaconne, Mendelssohn Concerto)..."
                        value={newPieceInput}
                        onChange={(e) => setNewPieceInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newPieceInput.trim()) {
                            e.preventDefault();
                            const current = activeStudent.currentRepertoire || [];
                            updateStudent(activeStudent.id, { currentRepertoire: [...current, newPieceInput.trim()] });
                            setNewPieceInput('');
                          }
                        }}
                        className="flex-1 px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newPieceInput.trim()) {
                            const current = activeStudent.currentRepertoire || [];
                            updateStudent(activeStudent.id, { currentRepertoire: [...current, newPieceInput.trim()] });
                            setNewPieceInput('');
                          }
                        }}
                        className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {/* Current Etude & Bowing Goals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                        Current Etude / Technical Study
                      </label>
                      <input
                        type="text"
                        value={activeStudent.currentEtude || ''}
                        onChange={(e) => updateStudent(activeStudent.id, { currentEtude: e.target.value })}
                        placeholder="e.g. Kreutzer No. 2, Dont Op. 35"
                        className="w-full px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                        Bowing &amp; Tone Production Goals
                      </label>
                      <input
                        type="text"
                        value={activeStudent.bowingGoals || ''}
                        onChange={(e) => updateStudent(activeStudent.id, { bowingGoals: e.target.value })}
                        placeholder="e.g. Spiccato at frog, martelé attack"
                        className="w-full px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Lesson History & Academic Progress Log */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Lesson History &amp; Academic Log</h4>
                    <p className="text-xs text-slate-500">Curriculum covered, lesson completion status, and study notes</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onOpenBookModal(undefined, activeStudent.id)}
                      className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Lesson
                    </button>
                    {onSelectTab && (
                      <button
                        onClick={() => onSelectTab('ledger')}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                        View in Finances &rarr;
                      </button>
                    )}
                  </div>
                </div>

                {/* Lesson History Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2.5">Date &amp; Time</th>
                        <th className="px-3 py-2.5">Topic &amp; Repertoire</th>
                        <th className="px-3 py-2.5">Duration</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5">Lesson Notes / Feedback</th>
                        <th className="px-3 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentSessions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                            No lessons logged for this student yet.
                          </td>
                        </tr>
                      ) : (
                        studentSessions.map((sess) => {
                          const isCompleted = sess.status === 'completed';
                          return (
                            <tr key={sess.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                                {sess.date} <span className="text-slate-400 font-normal">@{sess.startTime}</span>
                              </td>
                              <td className="px-3 py-2.5 text-slate-800 max-w-xs truncate font-medium">
                                {sess.repertoireFocus ? `${sess.repertoireFocus} • ` : ''}{sess.subject}
                              </td>
                              <td className="px-3 py-2.5 text-slate-600">{sess.durationMinutes}m</td>
                              
                              {/* Completion Toggle */}
                              <td className="px-3 py-2.5">
                                <button
                                  onClick={() => toggleLessonComplete(sess.id, !isCompleted)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                    isCompleted
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                  }`}
                                >
                                  {isCompleted ? 'Completed ✓' : 'Scheduled'}
                                </button>
                              </td>

                              <td className="px-3 py-2.5 text-slate-500 max-w-xs truncate">
                                {sess.tutorFeedback || sess.topicNotes || '—'}
                              </td>

                              <td className="px-3 py-2.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => onOpenSessionModal(sess)}
                                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                                  >
                                    Details
                                  </button>
                                  <button
                                    onClick={() => setLessonToDelete(sess)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                    title="Remove Lesson"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : null}
        </div>

      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-base">Add New Student</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@edu.org"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Study Focus / Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Violin Solo & Technique"
                    value={newStudent.subject}
                    onChange={(e) => setNewStudent({ ...newStudent, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Instrument Size
                  </label>
                  <select
                    value={newStudent.instrumentSize}
                    onChange={(e) => setNewStudent({ ...newStudent, instrumentSize: e.target.value })}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="4/4 Full Size">4/4 Full Size</option>
                    <option value="7/8 Lady-Size">7/8 Lady-Size</option>
                    <option value="3/4 Size">3/4 Size</option>
                    <option value="1/2 Size">1/2 Size</option>
                    <option value="1/4 Size">1/4 Size</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Current Piece / Repertoire
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bach Partita No. 2, Bruch Concerto"
                    value={newStudent.initialPiece}
                    onChange={(e) => setNewStudent({ ...newStudent, initialPiece: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Current Etude / Technical Study
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kreutzer No. 2, Wohlfahrt Op. 45"
                    value={newStudent.currentEtude}
                    onChange={(e) => setNewStudent({ ...newStudent, currentEtude: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Hourly Rate ({tutorSettings.currency})
                  </label>
                  <input
                    type="number"
                    value={newStudent.hourlyRate}
                    onChange={(e) => setNewStudent({ ...newStudent, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Skill Level
                  </label>
                  <select
                    value={newStudent.gradeLevel}
                    onChange={(e) => setNewStudent({ ...newStudent, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Beginner (Suzuki Book 1-3)">Beginner (Suzuki Book 1-3)</option>
                    <option value="Intermediate (Etudes & Concertinos)">Intermediate (Etudes &amp; Concertinos)</option>
                    <option value="Advanced (Standard Concertos & Bach)">Advanced (Standard Concertos &amp; Bach)</option>
                    <option value="Pre-Conservatory / Professional">Pre-Conservatory / Professional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Bowing / Technique Goals
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Spiccato at frog, martelé, intonation"
                    value={newStudent.bowingGoals}
                    onChange={(e) => setNewStudent({ ...newStudent, bowingGoals: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Telegram / Contact Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@handle"
                    value={newStudent.telegram}
                    onChange={(e) => setNewStudent({ ...newStudent, telegram: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Private Studio Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Private tutor notes regarding instrument setup, posture, practice discipline..."
                  value={newStudent.notes}
                  onChange={(e) => setNewStudent({ ...newStudent, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  Create Student Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 bg-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-200" />
                <h3 className="font-bold text-base">Remove Student from Roster</h3>
              </div>
              <button
                onClick={() => {
                  setStudentToDelete(null);
                  setDeleteWithSessions(false);
                }}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={studentToDelete.avatar}
                  alt={studentToDelete.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{studentToDelete.name}</h4>
                  <p className="text-xs text-slate-500">{studentToDelete.email}</p>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">
                    {studentToDelete.subject} • {studentToDelete.gradeLevel}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-slate-900">{studentToDelete.name}</span> from your roster? Their access code (<code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">{studentToDelete.portalCode}</code>) will be deactivated.
              </p>

              {/* Sessions checkbox option */}
              {(() => {
                const count = sessions.filter(s => s.studentId === studentToDelete.id).length;
                return (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deleteWithSessions}
                        onChange={(e) => setDeleteWithSessions(e.target.checked)}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                      />
                      <span className="text-xs text-amber-900 font-medium">
                        Also purge all {count} associated lesson session records from calendar and ledger
                      </span>
                    </label>
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setStudentToDelete(null);
                    setDeleteWithSessions(false);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Keep Student
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteStudent}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 shadow-sm cursor-pointer inline-flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Remove Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Lesson Confirmation Modal */}
      {lessonToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base">Remove Lesson</h3>
              </div>
              <button
                onClick={() => setLessonToDelete(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900 text-sm">{lessonToDelete.subject}</p>
                <p className="text-slate-600 font-medium">
                  {lessonToDelete.date} at {lessonToDelete.startTime} ({lessonToDelete.durationMinutes} mins)
                </p>
                <p className="text-slate-500">
                  Fee: {tutorSettings.currency}{lessonToDelete.amount.toFixed(2)} • Status: {lessonToDelete.status.toUpperCase()}
                </p>
                {lessonToDelete.recurringGroupId && (
                  <p className="text-blue-600 font-semibold pt-1 flex items-center">
                    Part of regular 3-month weekly schedule
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-600">
                How would you like to remove this lesson?
              </p>

              {lessonToDelete.recurringGroupId ? (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleConfirmDeleteLesson(false)}
                    className="p-3 bg-white border border-slate-200 text-slate-800 rounded-xl font-medium hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <span className="block font-bold text-xs text-slate-900">Remove This Single Lesson</span>
                    <span className="text-[11px] text-slate-500">Only remove the {lessonToDelete.date} lesson</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmDeleteLesson(true)}
                    className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl font-medium hover:bg-rose-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="block font-bold text-xs text-rose-800">Remove Entire 3-Month Series</span>
                    <span className="text-[11px] text-rose-600">Delete all 12 weekly sessions associated with this regular block</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      cancelLesson(lessonToDelete.id);
                      setLessonToDelete(null);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Mark as Cancelled
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmDeleteLesson(false)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer inline-flex items-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete Permanently
                  </button>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLessonToDelete(null)}
                  className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
