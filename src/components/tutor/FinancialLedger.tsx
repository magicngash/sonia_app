import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonSession } from '../../types';
import { 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  FileText,
  User,
  ArrowUpDown,
  Trash2,
  Plus,
  X
} from 'lucide-react';

interface FinancialLedgerProps {
  onOpenSessionModal: (session: LessonSession) => void;
  onSelectStudentProfile: (studentId: string) => void;
  onOpenBookModal?: () => void;
}

export const FinancialLedger: React.FC<FinancialLedgerProps> = ({
  onOpenSessionModal,
  onSelectStudentProfile,
  onOpenBookModal,
}) => {
  const { 
    sessions, 
    students, 
    tutorSettings, 
    toggleLessonPaid, 
    toggleLessonComplete,
    deleteLesson,
    deleteRecurringSeries,
    cancelLesson,
    getOverallFinancials,
    markAllPaidForStudent
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<LessonSession | null>(null);

  const financials = getOverallFinancials();

  // Filtered sessions
  const filteredSessions = sessions.filter(session => {
    // Only show completed or scheduled (ignore cancelled)
    if (session.status === 'cancelled') return false;

    // Student match
    if (studentFilter !== 'all' && session.studentId !== studentFilter) return false;

    // Status filter
    if (statusFilter === 'unpaid' && session.isPaid) return false;
    if (statusFilter === 'paid' && !session.isPaid) return false;

    // Search query
    const student = students.find(s => s.id === session.studentId);
    const searchTarget = `${student?.name} ${session.subject} ${session.topicNotes}`.toLowerCase();
    return searchTarget.includes(searchQuery.toLowerCase());
  }).sort((a, b) => new Date(b.date + 'T' + b.startTime).getTime() - new Date(a.date + 'T' + a.startTime).getTime());

  const handleExportCSV = () => {
    // Generate CSV string
    const headers = ['Date', 'Time', 'Student', 'Subject', 'Duration(min)', 'Rate', 'Amount', 'Status', 'Paid'];
    const rows = filteredSessions.map(s => {
      const student = students.find(st => st.id === s.studentId);
      return [
        s.date,
        s.startTime,
        `"${student?.name || 'Unknown'}"`,
        `"${s.subject}"`,
        s.durationMinutes,
        s.rate,
        s.amount,
        s.status,
        s.isPaid ? 'YES' : 'NO'
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tutor_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Collected Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {tutorSettings.currency}{financials.totalRevenue.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Paid lessons to date</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Outstanding Pending Dues</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {tutorSettings.currency}{financials.totalPendingDues.toFixed(2)}
          </p>
          <p className="text-xs text-amber-700 mt-1 font-medium">
            {financials.unpaidSessionsCount} completed sessions awaiting payment
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Gross Invoiced</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {tutorSettings.currency}{(financials.totalRevenue + financials.totalPendingDues).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Completed lesson value</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Collection Ratio</span>
            <ArrowUpDown className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {(financials.totalRevenue + financials.totalPendingDues) > 0
              ? `${Math.round((financials.totalRevenue / (financials.totalRevenue + financials.totalPendingDues)) * 100)}%`
              : '100%'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Payment recovery health</p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Student dropdown filter */}
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Students</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Status segment control & Export */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === 'unpaid' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Unpaid Dues
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === 'paid' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Paid Only
            </button>
          </div>

          {onOpenBookModal && (
            <button
              onClick={onOpenBookModal}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Lesson
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          Financial ledger successfully exported to CSV spreadsheet file!
        </div>
      )}

      {/* Main Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Date & Slot</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Subject & Focus</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Hourly Rate</th>
              <th className="px-4 py-3">Session Fee</th>
              <th className="px-4 py-3">Attendance</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  No sessions match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => {
                const student = students.find(s => s.id === session.studentId);
                const isCompleted = session.status === 'completed';

                return (
                  <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{session.date}</div>
                      <div className="text-[11px] text-slate-500">{session.startTime}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div 
                        onClick={() => student && onSelectStudentProfile(student.id)}
                        className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer flex items-center space-x-2"
                      >
                        <img
                          src={student?.avatar}
                          alt={student?.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{student?.name || 'Unknown'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{student?.portalCode}</span>
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-medium text-slate-800 truncate">{session.subject}</div>
                      {session.topicNotes && (
                        <div className="text-[11px] text-slate-500 truncate">{session.topicNotes}</div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {session.durationMinutes} mins
                    </td>

                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {tutorSettings.currency}{session.rate}/hr
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                      {tutorSettings.currency}{session.amount.toFixed(2)}
                    </td>

                    {/* Attendance / Completion Toggle */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleLessonComplete(session.id, !isCompleted)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {isCompleted ? 'Completed ✓' : 'Scheduled'}
                      </button>
                    </td>

                    {/* Payment Status Tick Box */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={session.isPaid}
                          onChange={(e) => toggleLessonPaid(session.id, e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          session.isPaid
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {session.isPaid ? 'PAID' : 'UNPAID'}
                        </span>
                      </label>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onOpenSessionModal(session)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setLessonToDelete(session)}
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
                How would you like to remove this lesson from your ledger?
              </p>

              {lessonToDelete.recurringGroupId ? (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      deleteLesson(lessonToDelete.id);
                      setLessonToDelete(null);
                    }}
                    className="p-3 bg-white border border-slate-200 text-slate-800 rounded-xl font-medium hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <span className="block font-bold text-xs text-slate-900">Remove This Single Lesson</span>
                    <span className="text-[11px] text-slate-500">Only remove the {lessonToDelete.date} session</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      deleteRecurringSeries(lessonToDelete.recurringGroupId!);
                      setLessonToDelete(null);
                    }}
                    className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl font-medium hover:bg-rose-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="block font-bold text-xs text-rose-800">Remove Entire 3-Month Series</span>
                    <span className="text-[11px] text-rose-600">Delete all 12 weekly sessions associated with this series</span>
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
                    onClick={() => {
                      deleteLesson(lessonToDelete.id);
                      setLessonToDelete(null);
                    }}
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
