import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface SuiteGalleryProps {
  images: string[];
  suiteName: string;
}

export const SuiteGallery: React.FC<SuiteGalleryProps> = ({
  images,
  suiteName,
}) => {
  const [isCarouselView, setIsCarouselView] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openCarousel = (index: number) => {
    setCurrentImageIndex(index);
    setIsCarouselView(true);
  };

  const closeCarousel = () => {
    setIsCarouselView(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCarousel();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    }
  };

  if (isCarouselView) {
    return (
      <div
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="relative w-full h-full flex items-center justify-center p-4">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeCarousel}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Previous button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/20 z-10"
            onClick={prevImage}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          {/* Current image */}
          <div className="relative max-w-4xl max-h-full">
            <img
              src={images[currentImageIndex]}
              alt={`${suiteName} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Next button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white/20 z-10"
            onClick={nextImage}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Thumbnail navigation */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                  index === currentImageIndex
                    ? 'border-white'
                    : 'border-transparent opacity-70'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Gallery</h3>

      {/* Gallery Layout - Main image on left, thumbnails on right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:h-72 p-2">
        {/* Main large image */}
        <div
          className="col-span-2 cursor-pointer group overflow-hidden rounded-lg hidden md:block"
          onClick={() => openCarousel(0)}
        >
          <img
            src={images[0]}
            alt={`${suiteName} - Main image`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-2 gap-2">
          {images.slice(1, 5).map((image, index) => (
            <div
              key={index + 1}
              className="relative cursor-pointer group overflow-hidden rounded-lg aspect-square"
              onClick={() => openCarousel(index + 1)}
            >
              <img
                src={image}
                alt={`${suiteName} - Image ${index + 2}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />

              {/* Show all photos overlay on last thumbnail */}
              {index === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                  <svg
                    className="w-6 h-6 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-medium">Show all photos</span>
                  <span className="text-xs">({images.length})</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
