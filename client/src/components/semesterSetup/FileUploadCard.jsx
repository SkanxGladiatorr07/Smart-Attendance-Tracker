import { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  FileType
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg'
];
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function FileUploadCard({
  title,
  description,
  icon: Icon = FileText,
  fileState,
  onFileSelect,
  onRemove,
  onOpenPreview,
  badgeText = 'Required'
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { showToast } = useToast();

  const validateFile = (file) => {
    if (!file) return false;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const isExtensionValid = ALLOWED_EXTENSIONS.includes(extension);
    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);

    if (!isExtensionValid && !isMimeValid) {
      const errMsg = `Unsupported file format ".${extension}". Only PDF, JPG, JPEG, and PNG files are allowed.`;
      showToast(errMsg, 'error');
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const errMsg = `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. (${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
      showToast(errMsg, 'error');
      return false;
    }

    return true;
  };

  const handleFile = (file) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isCompleted = fileState?.status === 'completed';
  const isUploading = fileState?.status === 'uploading';
  const isError = fileState?.status === 'error';
  const isImage = fileState?.type?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(fileState?.name || '');

  return (
    <div className="bg-[#111625]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-5 md:p-6 transition-all shadow-xl">
      {/* Card Title Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base tracking-tight">{title}</h3>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 font-medium border border-indigo-500/20">
          {badgeText}
        </span>
      </div>

      {/* Hidden inputs for desktop browser and mobile camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Conditional Rendering: File Dropzone OR File Preview Card */}
      {!fileState?.file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 md:p-8 text-center cursor-pointer transition-all duration-200 group ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
              : 'border-white/15 hover:border-indigo-500/50 hover:bg-white/[0.02]'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              isDragging ? 'bg-indigo-500 text-white' : 'bg-white/5 text-indigo-400 border border-white/10'
            }`}>
              <UploadCloud size={28} />
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                <span className="text-indigo-400 font-semibold underline underline-offset-2">Click to browse</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports PDF, JPG, JPEG, PNG (max {MAX_FILE_SIZE_MB}MB)
              </p>
            </div>

            {/* Quick Mobile Camera Trigger Action */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 transition-colors"
                title="Take photo using camera"
              >
                <Camera size={14} className="text-indigo-400" />
                <span>Mobile Camera</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Selected File Card View */
        <div className="border border-white/10 rounded-xl bg-white/[0.03] p-4 transition-all">
          <div className="flex items-start justify-between gap-3">
            {/* Thumbnail / Document Type Icon */}
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
              {isImage && fileState.previewUrl ? (
                <img
                  src={fileState.previewUrl}
                  alt={fileState.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileType className="w-6 h-6 text-indigo-400" />
              )}
            </div>

            {/* File Info & Upload Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-white truncate" title={fileState.name}>
                  {fileState.name}
                </h4>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                    <CheckCircle2 size={12} />
                    Ready
                  </span>
                )}
                {isUploading && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 shrink-0">
                    <Loader2 size={12} className="animate-spin" />
                    Uploading...
                  </span>
                )}
                {isError && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 shrink-0">
                    <AlertCircle size={12} />
                    Failed
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-0.5">
                {formatFileSize(fileState.size)} • {isImage ? 'Image' : 'PDF Document'}
              </p>

              {/* Progress Bar */}
              {(isUploading || fileState.progress < 100) && (
                <div className="mt-2.5">
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>{fileState.progress < 100 ? 'Uploading file...' : 'Processing file...'}</span>
                    <span className="font-semibold text-indigo-400">{fileState.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${fileState.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: Preview & Remove */}
            <div className="flex items-center gap-1 shrink-0">
              {fileState.previewUrl && (
                <button
                  type="button"
                  onClick={() => onOpenPreview(fileState)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Preview File"
                >
                  <Eye size={18} />
                </button>
              )}
              <button
                type="button"
                onClick={onRemove}
                className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Remove File"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Validation / General error feedback */}
          {fileState.error && (
            <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{fileState.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
