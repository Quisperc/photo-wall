import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface LightboxProps {
  photo: { url: string; filename: string } | null;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ photo, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!photo) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 rounded-full glass hover:bg-white/10 transition-all duration-300"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        className="relative max-w-6xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <img
          src={photo.url}
          alt={photo.filename}
          className={`max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default Lightbox;
