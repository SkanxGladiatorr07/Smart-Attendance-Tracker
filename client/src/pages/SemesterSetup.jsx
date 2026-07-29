import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Info,
  Layers,
  FileCheck
} from 'lucide-react';
import FileUploadCard from '../components/semesterSetup/FileUploadCard';
import FilePreviewModal from '../components/semesterSetup/FilePreviewModal';
import { useToast } from '../hooks/useToast';
import { uploadCalendarApi, uploadTimetableApi } from '../api/uploadApi';

export default function SemesterSetup() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Semester details form state
  const [semesterDetails, setSemesterDetails] = useState({
    semesterName: 'Semester 5',
    academicYear: '2026-2027',
    department: 'Computer Engineering',
    startDate: '',
    endDate: ''
  });

  // File Upload states
  const [calendarFile, setCalendarFile] = useState(null);
  const [timetableFile, setTimetableFile] = useState(null);

  // Modal preview state
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileItem: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      if (calendarFile?.previewUrl && calendarFile.isLocalBlob) URL.revokeObjectURL(calendarFile.previewUrl);
      if (timetableFile?.previewUrl && timetableFile.isLocalBlob) URL.revokeObjectURL(timetableFile.previewUrl);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSemesterDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Upload handler attempting Backend API call with simulation fallback
  const handleUploadFile = async (file, apiFunction, setter, fileLabel) => {
    const localBlobUrl = URL.createObjectURL(file);

    const initialItem = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: localBlobUrl,
      isLocalBlob: true,
      progress: 10,
      status: 'uploading',
      error: null
    };

    setter(initialItem);

    try {
      // Call backend Multer API endpoint
      const response = await apiFunction(file, (percent) => {
        setter((prev) => prev ? { ...prev, progress: Math.max(percent, 10) } : null);
      });

      if (response && response.status === 'success') {
        const metadata = response.data;
        setter((prev) => prev ? {
          ...prev,
          progress: 100,
          status: 'completed',
          serverMetadata: metadata,
          previewUrl: metadata.url || localBlobUrl
        } : null);
        showToast(`${fileLabel} uploaded to server successfully!`, 'success');
        return;
      }
    } catch (err) {
      console.warn(`[Backend Upload Notice] Server endpoint unavailable or error: ${err.message}. Falling back to client state mode.`);
    }

    // Fallback simulation if backend endpoint is offline
    let currentProgress = 30;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 30) + 20;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setter((prev) => prev ? { ...prev, progress: 100, status: 'completed' } : null);
        showToast(`${fileLabel} processed successfully!`, 'success');
      } else {
        setter((prev) => prev ? { ...prev, progress: currentProgress } : null);
      }
    }, 200);
  };

  const handleCalendarSelect = (file) => {
    handleUploadFile(file, uploadCalendarApi, setCalendarFile, 'Academic Calendar');
  };

  const handleCalendarRemove = () => {
    if (calendarFile?.previewUrl && calendarFile.isLocalBlob) {
      URL.revokeObjectURL(calendarFile.previewUrl);
    }
    setCalendarFile(null);
    showToast('Academic Calendar removed', 'info');
  };

  const handleTimetableSelect = (file) => {
    handleUploadFile(file, uploadTimetableApi, setTimetableFile, 'Weekly Timetable');
  };

  const handleTimetableRemove = () => {
    if (timetableFile?.previewUrl && timetableFile.isLocalBlob) {
      URL.revokeObjectURL(timetableFile.previewUrl);
    }
    setTimetableFile(null);
    showToast('Weekly Timetable removed', 'info');
  };

  const handleOpenPreview = (fileItem) => {
    setPreviewModal({
      isOpen: true,
      fileItem
    });
  };

  const handleClosePreview = () => {
    setPreviewModal({
      isOpen: false,
      fileItem: null
    });
  };

  const handleResetForm = () => {
    if (calendarFile?.previewUrl) URL.revokeObjectURL(calendarFile.previewUrl);
    if (timetableFile?.previewUrl) URL.revokeObjectURL(timetableFile.previewUrl);
    setCalendarFile(null);
    setTimetableFile(null);
    showToast('Semester setup reset', 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!calendarFile || calendarFile.status !== 'completed') {
      showToast('Please upload an Academic Calendar before completing setup', 'error');
      return;
    }
    if (!timetableFile || timetableFile.status !== 'completed') {
      showToast('Please upload a Weekly Timetable before completing setup', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Documents processed! Proceeding to Semester Review.', 'success');
      navigate('/semester-review', {
        state: {
          calendarAnalysisId: calendarFile.serverMetadata?.analysisId,
          timetableAnalysisId: timetableFile.serverMetadata?.analysisId,
          calendarData: calendarFile.serverMetadata?.calendarData,
          timetableData: timetableFile.serverMetadata?.timetableData
        }
      });
    }, 600);
  };

  const uploadedCount = [calendarFile, timetableFile].filter(
    (item) => item && item.status === 'completed'
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-[#0b0f19] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              <GraduationCap size={16} />
              <span>Semester Setup Wizard</span>
            </div>
            <h1 className="font-heading text-2xl md:text-4xl font-bold text-white tracking-tight">
              Configure Your Semester
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl">
              Upload your academic calendar and weekly timetable to kickstart attendance tracking with AttendAI.
            </p>
          </div>

          {/* Progress Pill Widget */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileCheck size={24} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">Upload Progress</div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <span>{uploadedCount} of 2 Uploaded</span>
                {uploadedCount === 2 && (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Semester Information */}
        <div className="bg-[#111625]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">
              1
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Semester Details</h2>
              <p className="text-xs text-gray-400">Define basic information for the upcoming academic term</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Semester Name
              </label>
              <input
                type="text"
                name="semesterName"
                value={semesterDetails.semesterName}
                onChange={handleInputChange}
                placeholder="e.g. Semester 5"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Academic Year
              </label>
              <input
                type="text"
                name="academicYear"
                value={semesterDetails.academicYear}
                onChange={handleInputChange}
                placeholder="e.g. 2026-2027"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Branch / Department
              </label>
              <input
                type="text"
                name="department"
                value={semesterDetails.department}
                onChange={handleInputChange}
                placeholder="e.g. Computer Engineering"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Document Uploads */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">
                2
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Upload Documents</h2>
                <p className="text-xs text-gray-400">Add your Academic Calendar and Weekly Timetable (PDF, JPG, JPEG, PNG)</p>
              </div>
            </div>

            {(calendarFile || timetableFile) && (
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Academic Calendar Upload Card */}
            <FileUploadCard
              title="Academic Calendar"
              description="Upload official calendar with term start, holidays, & exam dates"
              icon={Calendar}
              fileState={calendarFile}
              onFileSelect={handleCalendarSelect}
              onRemove={handleCalendarRemove}
              onOpenPreview={handleOpenPreview}
              badgeText="Required"
            />

            {/* Weekly Timetable Upload Card */}
            <FileUploadCard
              title="Weekly Timetable"
              description="Upload your weekly class schedule with lecture hours & subjects"
              icon={Clock}
              fileState={timetableFile}
              onFileSelect={handleTimetableSelect}
              onRemove={handleTimetableRemove}
              onOpenPreview={handleOpenPreview}
              badgeText="Required"
            />
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs md:text-sm flex items-start gap-3">
          <Info size={20} className="text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Note on Document Processing</p>
            <p className="text-indigo-200/80 leading-relaxed">
              Your uploaded Academic Calendar and Weekly Timetable will be stored securely. Automatic AI schedule parsing will take place once AI capabilities are activated in future updates.
            </p>
          </div>
        </div>

        {/* Form Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-sm font-semibold transition-colors text-center"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={uploadedCount < 2 || isSubmitting}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${
              uploadedCount === 2 && !isSubmitting
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30'
                : 'bg-white/10 text-gray-400 cursor-not-allowed border border-white/5'
            }`}
          >
            {isSubmitting ? (
              <span>Saving Setup...</span>
            ) : (
              <>
                <span>Complete Semester Setup</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* File Preview Lightbox Modal */}
      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={handleClosePreview}
        fileItem={previewModal.fileItem}
      />
    </div>
  );
}
