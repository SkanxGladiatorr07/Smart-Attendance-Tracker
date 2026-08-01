import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Database,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  X,
} from 'lucide-react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import { exportBackupApi, importBackupApi } from '../../api/backupApi';
import { useAttendance } from '../../context/AttendanceContext';
import { useToast } from '../../hooks/useToast';

export default function BackupRestoreCard() {
  const { showToast } = useToast();
  const { refreshAll } = useAttendance();

  const fileInputRef = useRef(null);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [overwriteMode, setOverwriteMode] = useState(false);

  // Modal confirmation state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Import Result Summary
  const [importResult, setImportResult] = useState(null);

  // Handle Export Download
  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportBackupApi();
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `attendai_backup_${dateStr}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Database backup downloaded successfully!', 'success');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Failed to generate backup export file.', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Handle File Selection & Client Validation
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationErrors([]);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const data = json.data || json;

        const errors = [];
        if (!data.subjects || !Array.isArray(data.subjects)) {
          errors.push('Missing or invalid "subjects" array.');
        }
        if (!data.lectureSchedule || !Array.isArray(data.lectureSchedule)) {
          errors.push('Missing or invalid "lectureSchedule" array.');
        }
        if (!data.attendanceRecords || !Array.isArray(data.attendanceRecords)) {
          errors.push('Missing or invalid "attendanceRecords" array.');
        }

        if (errors.length > 0) {
          setValidationErrors(errors);
          setParsedData(null);
          showToast('Invalid backup file structure.', 'error');
        } else {
          setParsedData(json);
          setValidationErrors([]);
          showToast('Backup file parsed & validated successfully!', 'success');
        }
      } catch {
        setValidationErrors(['File is not valid JSON. Please select a valid AttendAI backup file.']);
        setParsedData(null);
        showToast('Invalid JSON file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Trigger Import Action
  const executeImport = async () => {
    if (!parsedData) return;

    setImporting(true);
    setConfirmModalOpen(false);
    try {
      const res = await importBackupApi(parsedData, overwriteMode);
      setImportResult(res.data);
      showToast(res.data.message || 'Backup imported successfully!', 'success');
      await refreshAll();
    } catch (err) {
      console.error('Import failed:', err);
      const msg = err.response?.data?.message || 'Failed to import backup file.';
      showToast(msg, 'error');
    } finally {
      setImporting(false);
    }
  };

  const resetImportState = () => {
    setSelectedFile(null);
    setParsedData(null);
    setValidationErrors([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card hover={false} className="p-6 space-y-6 border-indigo-500/20 bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#1e1b4b]/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Database size={14} className="text-indigo-400" />
            <span>Database Backup & Recovery</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Backup & Restore System</span>
          </h2>
          <p className="text-xs text-gray-300">
            Export complete attendance records, schedules, subjects, and calendar configs to JSON.
          </p>
        </div>

        {/* Quick Export Button */}
        <div className="self-start sm:self-auto shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={handleExport}
            isLoading={exporting}
            leftIcon={<Download size={16} />}
          >
            Export JSON Backup
          </Button>
        </div>
      </div>

      {/* Grid: Export Card & Import Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card Info */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-base">
              <FileJson size={20} />
              <span>Full Data Export</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Export subjects, semester configurations, calendar events, lecture schedule, and attendance logs into a portable JSON backup file.
            </p>
            <ul className="text-[11px] text-gray-400 space-y-1 pl-4 list-disc">
              <li>Includes complete subject color profiles and faculty info</li>
              <li>Includes all historical attendance records (Present / Absent)</li>
              <li>Portable across devices and local installations</li>
            </ul>
          </div>

          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              isLoading={exporting}
              leftIcon={<Download size={14} />}
              className="w-full justify-center"
            >
              Download Backup JSON
            </Button>
          </div>
        </div>

        {/* Import & Restore Card */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-purple-400 font-bold text-base">
            <Upload size={20} />
            <span>Restore / Merge Backup</span>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Dropzone Selector */}
          {!selectedFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-6 border-2 border-dashed border-white/20 hover:border-indigo-500/50 rounded-2xl bg-black/20 text-center space-y-2 transition-all hover:bg-black/40 group"
            >
              <Upload size={28} className="text-gray-400 group-hover:text-indigo-400 mx-auto transition-colors" />
              <div className="text-xs font-semibold text-white">
                Click to select backup JSON file
              </div>
              <p className="text-[11px] text-gray-500">Supports .json AttendAI backup files</p>
            </button>
          ) : (
            /* Selected File Summary & Options */
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <FileJson size={18} className="text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">{selectedFile.name}</span>
                </div>
                <button
                  onClick={resetImportState}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                  title="Remove File"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Client Validation Status */}
              {validationErrors.length > 0 ? (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle size={14} />
                    <span>Validation Errors:</span>
                  </div>
                  {validationErrors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              ) : parsedData ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Validated Backup File</span>
                  </div>
                  <div className="text-[10px] text-emerald-300/80">
                    Exported: {parsedData.exportedAt ? new Date(parsedData.exportedAt).toLocaleString() : 'Valid format'}
                  </div>
                </div>
              ) : null}

              {/* Import Mode Selector */}
              {parsedData && (
                <div className="space-y-2 pt-1 border-t border-white/10">
                  <label className="text-[11px] font-semibold text-gray-300 block">
                    Import Mode:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setOverwriteMode(false)}
                      className={`p-2 rounded-xl font-bold border transition-all text-center ${
                        !overwriteMode
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Merge (Skip Duplicates)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverwriteMode(true)}
                      className={`p-2 rounded-xl font-bold border transition-all text-center ${
                        overwriteMode
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Overwrite All Data
                    </button>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant={overwriteMode ? 'danger' : 'primary'}
                      size="sm"
                      onClick={() => setConfirmModalOpen(true)}
                      isLoading={importing}
                      className="w-full justify-center"
                    >
                      {overwriteMode ? 'Overwrite & Restore Database' : 'Merge & Restore Backup'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Import Result Summary Card */}
      {importResult && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <CheckCircle2 size={20} />
            <span>Import Completed Successfully</span>
          </div>
          <p className="text-xs text-emerald-200">{importResult.message}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-black/30 border border-emerald-500/20 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Subjects</span>
              <strong className="text-base text-white">{importResult.summary?.subjectsImported || 0}</strong>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-emerald-500/20 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Schedule Lecs</span>
              <strong className="text-base text-white">{importResult.summary?.lectureScheduleImported || 0}</strong>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-emerald-500/20 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Attendance Logs</span>
              <strong className="text-base text-white">{importResult.summary?.attendanceRecordsImported || 0}</strong>
            </div>
            <div className="p-3 rounded-xl bg-black/30 border border-emerald-500/20 text-center">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Duplicates Skipped</span>
              <strong className="text-base text-amber-400">{importResult.summary?.duplicatesSkipped || 0}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <Card hover={false} className="max-w-md w-full p-6 space-y-4 border-indigo-500/30 bg-[#0d121f] shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-heading font-bold text-white text-lg flex items-center gap-2">
                {overwriteMode ? (
                  <ShieldAlert size={20} className="text-rose-400" />
                ) : (
                  <Info size={20} className="text-indigo-400" />
                )}
                <span>Confirm Backup Import</span>
              </h3>
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-gray-300 leading-relaxed space-y-2">
              {overwriteMode ? (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
                  <strong>Warning:</strong> Overwrite mode will wipe all current database subjects, schedules, and attendance records before restoring this backup file.
                </div>
              ) : (
                <p>
                  Merge mode will add new subjects, schedules, and attendance records while skipping duplicates.
                </p>
              )}
              <p>Are you sure you want to proceed with the database restoration?</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={overwriteMode ? 'danger' : 'primary'}
                size="sm"
                onClick={executeImport}
                isLoading={importing}
              >
                Confirm & Restore
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
