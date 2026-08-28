'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_TRIP_IMAGES } from '@/lib/mock-data';

export function FeaturedTripCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSelectedIndex((currentIndex) => (currentIndex + 1) % MOCK_TRIP_IMAGES.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const showPrevious = () => {
    setSelectedIndex((currentIndex) => (
      currentIndex === 0 ? MOCK_TRIP_IMAGES.length - 1 : currentIndex - 1
    ));
  };

  const showNext = () => {
    setSelectedIndex((currentIndex) => (currentIndex + 1) % MOCK_TRIP_IMAGES.length);
  };

  const selectedImage = MOCK_TRIP_IMAGES[selectedIndex];

  return (
    <div className="relative mb-5 sm:mb-8 overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-300 bg-adventure-card shadow-lg">
      <div className="relative aspect-[16/9] sm:aspect-[16/7] min-h-44 sm:min-h-52">
        <img
          src={selectedImage.image_url}
          alt={selectedImage.alt_text}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <p className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-5 sm:right-5 text-xs sm:text-sm font-medium !text-white drop-shadow-md">
          {selectedImage.alt_text}
        </p>

        <button
          type="button"
          onClick={showPrevious}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={showNext}
          aria-label="Próxima foto"
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-3 right-5 flex gap-1.5" aria-label="Selecionar foto">
        {MOCK_TRIP_IMAGES.map((image, imageIndex) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedIndex(imageIndex)}
            aria-label={`Ver foto ${imageIndex + 1}`}
            aria-current={selectedIndex === imageIndex ? 'true' : undefined}
            className={`h-1.5 rounded-full transition-all ${selectedIndex === imageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/60 hover:bg-white'}`}
          />
        ))}
      </div>
    </div>
  );
}