import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  History as HistoryIcon,
  Search,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import {
  getAttendanceHistory,
  updateAttendance,
  deleteAttendance,
} from '../api/attendanceApi';
import TimelineItem from '../components/history/TimelineItem';
import EditAttendanceModal from '../components/history/EditAttendanceModal';
import DeleteAttendanceModal from '../components/history/DeleteAttendanceModal';
import Button from '../components/common/Button';
import { Card } from '../components/common/Card';
import Skeleton from '../components/common/Skeleton';
import { useToast } from '../hooks/useToast';

/**
 * Formats YYYY-MM-DD or ISO date string into human readable date string
 */
function formatDateHeader(dateStr) {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format YYYY-MM into Month Year display string (e.g., "2026-07" -> "July 2026")
 */
function formatMonthLabel(yearMonthStr) {
  if (!yearMonthStr || yearMonthStr === 'all') return 'All Months';
  const [year, month] = yearMonthStr.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function History() {
  const { showToast } = useToast();
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch history logs
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAttendanceHistory();
      setHistoryLogs(response.data || []);
    } catch (err) {
      console.error('Failed to fetch history logs:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load attendance history logs from database.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Extract available months for filter dropdown
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    historyLogs.forEach((log) => {
      if (log.lecture_date) {
        const dateStr = String(log.lecture_date);
        const yearMonth = dateStr.substring(0, 7); // "YYYY-MM"
        if (/^\d{4}-\d{2}$/.test(yearMonth)) {
          monthsSet.add(yearMonth);
        }
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [historyLogs]);

  // Filtered History Logs
  const filteredLogs = useMemo(() => {
    return historyLogs.filter((log) => {
      // 1. Search Query Filter (subject name or faculty)
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesSubject = log.subject_name?.toLowerCase().includes(query);
        const matchesFaculty = log.faculty_name?.toLowerCase().includes(query);
        if (!matchesSubject && !matchesFaculty) return false;
      }

      // 2. Month Filter
      if (selectedMonth !== 'all' && log.lecture_date) {
        const yearMonth = String(log.lecture_date).substring(0, 7);
        if (yearMonth !== selectedMonth) return false;
      }

      // 3. Status Filter
      if (statusFilter !== 'all') {
        if (log.attendance_status !== statusFilter) return false;
      }

      return true;
    });
  }, [historyLogs, searchQuery, selectedMonth, statusFilter]);

  // Group filtered logs by date
  const groupedLogs = useMemo(() => {
    const groups = {};
    filteredLogs.forEach((log) => {
      const dateKey = String(log.lecture_date).substring(0, 10);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    // Sort date keys descending
    const sortedDates = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));
    return sortedDates.map((dateKey) => ({
      date: dateKey,
      formattedDate: formatDateHeader(dateKey),
      items: groups[dateKey],
    }));
  }, [filteredLogs]);

  // Overall Statistics
  const totalCount = filteredLogs.length;
  const presentCount = filteredLogs.filter((l) => l.attendance_status === 'present').length;
  const absentCount = filteredLogs.filter((l) => l.attendance_status === 'absent').length;
  const pendingCount = filteredLogs.filter((l) => l.attendance_status === 'pending').length;
  const markedCount = presentCount + absentCount;
  const attendanceRate = markedCount > 0 ? Math.round((presentCount / markedCount) * 100) : 0;

  // Edit Handlers
  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (newStatus) => {
    if (!editingRecord) return;
    setSavingEdit(true);
    setEditError(null);

    try {
      const payload = editingRecord.id
        ? { id: editingRecord.id, attendance_status: newStatus }
        : { lecture_id: editingRecord.lecture_id, attendance_status: newStatus };

      await updateAttendance(payload);
      showToast(
        `Updated attendance status to ${newStatus} for ${editingRecord.subject_name}`,
        'success'
      );
      setEditModalOpen(false);
      fetchHistory();
    } catch (err) {
      console.error('Update error:', err);
      const msg = err.response?.data?.message || 'Failed to update attendance status.';
      setEditError(msg);
      showToast(msg, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Handlers
  const handleOpenDelete = (record) => {
    setDeletingRecord(record);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord || !deletingRecord.id) return;
    setDeleting(true);

    try {
      await deleteAttendance(deletingRecord.id);
      showToast(
        `Attendance log for '${deletingRecord.subject_name}' deleted successfully`,
        'info'
      );
      setDeleteModalOpen(false);
      setDeletingRecord(null);
      fetchHistory();
    } catch (err) {
      console.error('Delete error:', err);
      const msg = err.response?.data?.message || 'Failed to delete attendance record.';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <HistoryIcon className="text-purple-400" size={28} />
            <span>Attendance History</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Browse date-grouped attendance logs, edit past entries, and filter by subject or month.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={fetchHistory}
          isLoading={loading}
          leftIcon={<RefreshCw size={16} />}
          className="self-start sm:self-auto hover:scale-105"
        >
          Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card hover={false} className="p-3.5 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <BookOpen size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-gray-400 tracking-wider">
              Total Records
            </span>
            <div className="text-xl sm:text-2xl font-bold text-white font-heading">
              {totalCount}
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-3.5 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-gray-400 tracking-wider">
              Present
            </span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-heading">
              {presentCount}
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-3.5 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <XCircle size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-gray-400 tracking-wider">
              Absent
            </span>
            <div className="text-xl sm:text-2xl font-bold text-rose-400 font-heading">
              {absentCount}
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-3.5 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-gray-400 tracking-wider">
              Attendance Rate
            </span>
            <div className="text-xl sm:text-2xl font-bold text-white font-heading">
              {attendanceRate}%
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Controls Row: Search & Month Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by subject or faculty name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
          />
        </div>

        {/* Month Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-purple-400 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
          >
            <option value="all">All Months</option>
            {availableMonths.map((ym) => (
              <option key={ym} value={ym}>
                {formatMonthLabel(ym)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-gray-400 font-semibold flex items-center gap-1 shrink-0 mr-1">
          <Filter size={14} /> Status:
        </span>
        {[
          { key: 'all', label: `All (${totalCount})` },
          { key: 'present', label: `Present (${presentCount})` },
          { key: 'absent', label: `Absent (${absentCount})` },
          { key: 'pending', label: `Pending (${pendingCount})` },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              statusFilter === item.key
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <Card
          hover={false}
          className="p-4 border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="danger" size="sm" onClick={fetchHistory}>
            Retry
          </Button>
        </Card>
      )}

      {/* Loading Skeletons */}
      {loading && historyLogs.length === 0 && (
        <div className="space-y-6">
          {[1, 2].map((group) => (
            <div key={group} className="space-y-4">
              <Skeleton height={28} width="200px" className="rounded-lg" />
              <div className="pl-6 space-y-3">
                <Skeleton height={80} className="rounded-2xl" />
                <Skeleton height={80} className="rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Date-Grouped Timeline View */}
      {!loading && groupedLogs.length > 0 && (
        <div className="space-y-8">
          {groupedLogs.map((group) => (
            <div key={group.date} className="relative space-y-4">
              {/* Date Header Badge */}
              <div className="sticky top-0 z-20 pt-1 pb-1 backdrop-blur-md">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-bold shadow-lg">
                  <Calendar size={14} className="text-purple-400" />
                  <span>{group.formattedDate}</span>
                  <span className="ml-1 px-2 py-0.2 rounded-full bg-white/10 text-[10px] text-gray-300">
                    {group.items.length} {group.items.length === 1 ? 'lecture' : 'lectures'}
                  </span>
                </div>
              </div>

              {/* Vertical Timeline Line & Items */}
              <div className="relative border-l-2 border-white/10 ml-3 sm:ml-4 space-y-4 pt-1 pb-2">
                {group.items.map((item) => (
                  <TimelineItem
                    key={item.id || item.lecture_id}
                    record={item}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && groupedLogs.length === 0 && !error && (
        <Card
          hover={false}
          className="p-10 sm:p-14 text-center max-w-lg mx-auto border-white/10"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center mb-4">
            <Clock size={32} />
          </div>

          <h3 className="font-heading text-xl font-bold text-white mb-2">
            {searchQuery || selectedMonth !== 'all' || statusFilter !== 'all'
              ? 'No Matching Logs Found'
              : 'No Attendance Logs Recorded'}
          </h3>

          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {searchQuery || selectedMonth !== 'all' || statusFilter !== 'all'
              ? 'No attendance records matched your filter or search criteria. Try resetting your search filters.'
              : 'There are no historical attendance logs available in the database yet.'}
          </p>

          {(searchQuery || selectedMonth !== 'all' || statusFilter !== 'all') ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setSearchQuery('');
                setSelectedMonth('all');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={fetchHistory}
              leftIcon={<RefreshCw size={16} />}
            >
              Refresh History
            </Button>
          )}
        </Card>
      )}

      {/* Edit Attendance Modal */}
      <EditAttendanceModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleSaveEdit}
        record={editingRecord}
        submitting={savingEdit}
        error={editError}
      />

      {/* Delete Confirmation Modal */}
      <DeleteAttendanceModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        record={deletingRecord}
        deleting={deleting}
      />
    </div>
  );
}
