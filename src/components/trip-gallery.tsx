'use client';

import { useState, useEffect, useCallback } from 'react';
import { TripImage } from '@/types';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';

interface TripGalleryProps {
  images: TripImage[];
}

export function TripGallery({ images }: TripGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const mainImage = images[selectedIndex];

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isLightboxOpen, handleNext, handlePrevious]);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Container */}
      <div 
        className="relative aspect-video md:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-adventure-card group cursor-pointer"
        onClick={() => setIsLightboxOpen(true)}
      >
        <img
          src={mainImage.image_url}
          alt={mainImage.alt_text || 'Imagem da viagem'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
          <Expand className="w-5 h-5" />
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative flex-shrink-0 w-24 h-24 md:w-32 md:h-24 rounded-xl overflow-hidden snap-start transition-all duration-200 ${
                selectedIndex === idx 
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#f7f3e9] opacity-100'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              <img
                src={img.image_url}
                alt={img.alt_text || `Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute top-6 left-6 text-white/70 font-medium tracking-widest text-sm z-50">
            {selectedIndex + 1} / {images.length}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
            className="absolute left-4 md:left-8 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="relative w-full h-full max-w-6xl max-h-screen flex items-center justify-center" onClick={() => setIsLightboxOpen(false)}>
            <img
              src={mainImage.image_url}
              alt={mainImage.alt_text || 'Imagem da viagem'}
              className="max-w-full max-h-full object-contain cursor-default select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 md:right-8 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
            aria-label="Próximo"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
}
