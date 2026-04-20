import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, className, label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload
    setIsUploading(true);
    
    // In a real app, you'd upload to S3/Firebase/etc.
    // For this demo, we'll use URL.createObjectURL or a base64 string
    // But since this is a SPA with persistent state, let's use a FileReader to get a base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        onChange(reader.result as string);
        setIsUploading(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
          value ? "border-transparent bg-gray-50" : "border-gray-200 hover:border-black hover:bg-gray-50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />

        {value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm text-red-500 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-black animate-spin" />
            ) : (
              <>
                <div className="p-3 bg-gray-100 rounded-2xl text-gray-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Upload Image</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">JPG, PNG or GIF (max 2MB)</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
