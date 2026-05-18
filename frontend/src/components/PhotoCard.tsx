import React from 'react';
import { Photo } from '../api/photos';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  style?: React.CSSProperties;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, style }) => {
  return (
    <div
      className="glass-card cursor-pointer overflow-hidden group"
      onClick={onClick}
      style={style}
    >
      <div className="relative aspect-auto overflow-hidden">
        <img
          src={photo.url}
          alt={photo.filename}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
};

export default PhotoCard;
