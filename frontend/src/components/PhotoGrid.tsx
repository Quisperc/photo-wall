import React, { useState, useEffect, useRef } from 'react';
import { Photo } from '../api/photos';
import PhotoCard from './PhotoCard';
import Lightbox from './Lightbox';

interface PhotoGridProps {
  photos: Photo[];
  isLoading: boolean;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, isLoading }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current && !isLoading) {
      const cards = gridRef.current.querySelectorAll('.photo-card-wrapper');
      cards.forEach((card, index) => {
        (card as HTMLElement).style.animationDelay = `${index * 100}ms`;
      });
    }
  }, [photos, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text/60 font-body">加载中...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-24 h-24 mb-6 rounded-full bg-surface flex items-center justify-center">
          <svg className="w-12 h-12 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-heading font-semibold mb-2">暂无照片</h3>
        <p className="text-text/60 font-body max-w-md">
          上传你的第一张照片或通过URL添加，开始创建你的照片墙吧
        </p>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        {photos.map((photo) => (
          <div key={photo.id} className="photo-card-wrapper fade-in opacity-0">
            <PhotoCard
              photo={photo}
              onClick={() => setSelectedPhoto(photo)}
            />
          </div>
        ))}
      </div>

      <Lightbox
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  );
};

export default PhotoGrid;
