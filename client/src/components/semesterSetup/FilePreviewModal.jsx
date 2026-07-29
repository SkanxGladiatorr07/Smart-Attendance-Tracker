import { X, FileText, Download, Eye } from 'lucide-react';

export default function FilePreviewModal({ isOpen, onClose, fileItem }) {
  if (!isOpen || !fileItem) return null;

  const { name, size, type, previewUrl } = fileItem;
  const isImage = type?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(name);
  const isPdf = type === 'application/pdf' || /\.pdf$/i.test(name);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[#131827] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0f1422]">
          <div className="flex items-center gap-3 truncate pr-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              {isImage ? (
                <Eye className="w-5 h-5 text-indigo-400" />
              ) : (
                <FileText className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div className="truncate">
              <h3 className="text-base font-semibold text-white truncate" title={name}>
                {name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span>{formatFileSize(size)}</span>
                <span>•</span>
                <span className="uppercase text-indigo-400 font-medium">
                  {isPdf ? 'PDF Document' : 'Image'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {previewUrl && (
              <a
                href={previewUrl}
                download={name}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Download file"
              >
                <Download size={18} />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center bg-[#0b0f19]">
          {isImage && previewUrl ? (
            <div className="relative group max-h-[65vh] flex items-center justify-center">
              <img
                src={previewUrl}
                alt={name}
                className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-lg border border-white/10"
              />
            </div>
          ) : isPdf && previewUrl ? (
            <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-white/10 bg-white">
              <iframe
                src={previewUrl}
                title={name}
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-300 font-medium">Preview not available for this file format.</p>
              <p className="text-gray-500 text-xs mt-1">You can still download or re-upload the file.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#0f1422] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
