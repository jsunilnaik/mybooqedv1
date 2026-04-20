import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentUploadBoxProps {
  label: string;
  required?: boolean;
  accept?: string;
  hint?: string;
  value?: string;
  onChange: (value: string, fileName: string) => void;
  onRemove?: () => void;
}

export default function DocumentUploadBox({
  label,
  required = false,
  accept = 'image/*,.pdf',
  hint = 'PDF, JPG, PNG — Max 5MB',
  value,
  onChange,
  onRemove,
}: DocumentUploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError('');
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Only PDF, JPG, PNG files are allowed');
      return;
    }

    setIsUploading(true);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setTimeout(() => {
        setIsUploading(false);
        onChange(result, file.name);
        setTimeout(() => setIsVerified(true), 500);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setFileName('');
    setIsVerified(false);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    onRemove?.();
  };

  const isImage = value && value.startsWith('data:image');
  const isPDF = value && value.startsWith('data:application/pdf');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-black">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {!value ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-black bg-gray-50 scale-[1.01]'
              : 'border-gray-200 hover:border-gray-400 hover:bg-[#F7F9FA]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          {isUploading ? (
            <div className="space-y-3">
              <div className="w-10 h-10 mx-auto border-2 border-black/20 border-t-black rounded-full animate-spin" />
              <p className="text-sm font-medium text-black">Uploading {fileName}...</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-black h-full rounded-full animate-[upload_1.5s_ease-in-out_forwards]" style={{ width: '70%' }} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-black">Click to upload or drag & drop</p>
                <p className="text-xs text-[#71717A] mt-0.5">{hint}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          {isImage && (
            <div className="relative aspect-video bg-gray-100">
              <img src={value} alt="Document preview" className="w-full h-full object-contain" />
            </div>
          )}
          {isPDF && (
            <div className="p-6 flex items-center gap-4 bg-red-50">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">{fileName || 'Document.pdf'}</p>
                <p className="text-xs text-[#71717A]">PDF Document</p>
              </div>
            </div>
          )}
          {!isImage && !isPDF && (
            <div className="p-6 flex items-center gap-4 bg-[#F7F9FA]">
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Image className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">{fileName || 'Document'}</p>
                <p className="text-xs text-[#71717A]">Document uploaded</p>
              </div>
            </div>
          )}
          <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isVerified ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-green-600">Verified</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 border-2 border-[#71717A]/30 border-t-[#71717A] rounded-full animate-spin" />
                  <span className="text-xs text-[#71717A]">Verifying...</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
