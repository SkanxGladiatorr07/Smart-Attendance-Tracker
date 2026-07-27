import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, BookOpen, UserCheck, Layers, RefreshCw, AlertCircle } from 'lucide-react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../api/subjectApi';
import SubjectCard from '../components/SubjectCard';
import SubjectModal from '../components/SubjectModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete Confirm Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch subjects from backend
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSubjects();
      setSubjects(response.data || []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError(err.response?.data?.message || 'Failed to load subjects from backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Open modal for creation
  const handleOpenCreateModal = () => {
    setEditingSubject(null);
    setModalError(null);
    setModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (subject) => {
    setEditingSubject(subject);
    setModalError(null);
    setModalOpen(true);
  };

  // Submit handler for create/update
  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    setModalError(null);

    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, formData);
      } else {
        await createSubject(formData);
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      console.error('Form submission error:', err);
      setModalError(err.response?.data?.message || 'Failed to save subject. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete confirmation
  const handleOpenDeleteModal = (id, name) => {
    setSubjectToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  // Confirm Delete handler
  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    setDeleting(true);

    try {
      await deleteSubject(subjectToDelete.id);
      setDeleteModalOpen(false);
      setSubjectToDelete(null);
      fetchSubjects();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete subject.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter subjects based on search query
  const filteredSubjects = subjects.filter((s) => {
    const query = searchQuery.toLowerCase();
    const matchesName = s.subject_name?.toLowerCase().includes(query);
    const matchesFaculty = s.faculty_name?.toLowerCase().includes(query);
    return matchesName || matchesFaculty;
  });

  const facultyAssignedCount = subjects.filter((s) => s.faculty_name && s.faculty_name.trim() !== '').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Stats Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="text-indigo-400" size={28} />
            <span>Subject Management</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Organize academic subjects, assign faculty members, and set custom visual color identifiers.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenCreateModal}
          className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Total Subjects</span>
            <div className="text-2xl font-bold text-white font-heading">{subjects.length}</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <span className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Faculty Assigned</span>
            <div className="text-2xl font-bold text-white font-heading">{facultyAssignedCount}</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen size={22} />
          </div>
          <div>
            <span className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Filtered Results</span>
            <div className="text-2xl font-bold text-white font-heading">{filteredSubjects.length}</div>
          </div>
        </div>
      </div>

      {/* Search Bar & Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search subjects by name or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>

        <button
          onClick={fetchSubjects}
          disabled={loading}
          className="self-end sm:self-auto p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all flex items-center gap-2 text-sm font-semibold"
          title="Refresh Subjects"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="sm:hidden md:inline">Refresh</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="glass-card p-4 rounded-2xl border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchSubjects}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && subjects.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-2/3" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
              <div className="h-10 bg-white/5 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Subjects Grid */}
      {!loading && filteredSubjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSubjects.length === 0 && !error && (
        <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="font-heading text-xl font-bold text-white mb-2">
            {searchQuery ? 'No Matching Subjects' : 'No Subjects Added Yet'}
          </h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {searchQuery
              ? `No subjects match your query "${searchQuery}". Try searching for another keyword.`
              : 'Get started by creating your first academic subject and assigning faculty details.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 transition-all"
            >
              <Plus size={18} />
              <span>Create First Subject</span>
            </button>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <SubjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingSubject={editingSubject}
        submitting={submitting}
        error={modalError}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        subjectName={subjectToDelete?.name || ''}
        deleting={deleting}
      />
    </div>
  );
}
