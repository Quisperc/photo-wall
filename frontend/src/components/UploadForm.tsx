import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { uploadPhoto } from '../api/photos';

interface UploadFormProps {
  onUploadSuccess: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await uploadPhoto(file);
      onUploadSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="glass-card p-6">
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-text/20 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-text/80">上传中...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              {isDragging ? (
                <ImageIcon className="w-8 h-8 text-primary" />
              ) : (
                <Upload className="w-8 h-8 text-primary" />
              )}
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">
              {isDragging ? '释放以上传' : '拖拽图片到这里'}
            </h3>
            <p className="text-text/60 font-body">
              或点击选择文件 (支持 JPG, PNG, GIF, WebP)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadForm;
