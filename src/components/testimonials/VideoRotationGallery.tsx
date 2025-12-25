import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoItem {
  id: string;
  name: string;
  role: string;
  country_emoji: string;
  video_url: string;
  photo_url?: string;
}

interface VideoRotationGalleryProps {
  videos: VideoItem[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function VideoRotationGallery({
  videos,
  isOpen,
  onClose,
  initialIndex = 0,
}: VideoRotationGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentVideo = videos[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!autoRotate || videos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate, videos.length]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
      setAutoRotate(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setAutoRotate(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    setAutoRotate(false);
  };

  const getCardPosition = (index: number) => {
    const diff = index - currentIndex;
    const normalizedDiff = ((diff + videos.length) % videos.length);
    const adjustedDiff = normalizedDiff > videos.length / 2 ? normalizedDiff - videos.length : normalizedDiff;
    
    return {
      x: adjustedDiff * 220,
      z: -Math.abs(adjustedDiff) * 100,
      scale: 1 - Math.abs(adjustedDiff) * 0.15,
      opacity: 1 - Math.abs(adjustedDiff) * 0.3,
      rotateY: adjustedDiff * -15,
    };
  };

  if (videos.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden bg-black/95 border-none">
        <div ref={containerRef} className="relative min-h-[600px]">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white">
              <h3 className="font-semibold text-lg">
                {currentVideo?.name} {currentVideo?.country_emoji}
              </h3>
              <p className="text-sm text-white/70">{currentVideo?.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`text-white hover:bg-white/20 ${autoRotate ? 'bg-white/20' : ''}`}
              >
                Auto: {autoRotate ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* 3D Carousel */}
          <div className="flex items-center justify-center h-[400px] perspective-1000 mt-16">
            <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
              <AnimatePresence mode="popLayout">
                {videos.map((video, index) => {
                  const pos = getCardPosition(index);
                  const isCurrent = index === currentIndex;
                  
                  return (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        x: pos.x,
                        scale: pos.scale,
                        opacity: pos.opacity,
                        rotateY: pos.rotateY,
                        zIndex: isCurrent ? 10 : 5 - Math.abs(index - currentIndex),
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="absolute cursor-pointer"
                      onClick={() => {
                        if (!isCurrent) {
                          setCurrentIndex(index);
                          setAutoRotate(false);
                        }
                      }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div 
                        className={`w-64 h-48 rounded-2xl overflow-hidden shadow-2xl transition-all ${
                          isCurrent ? 'ring-4 ring-primary' : ''
                        }`}
                        style={{
                          transform: isCurrent ? `scale(${zoom}) rotate(${rotation}deg)` : undefined,
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        {isCurrent ? (
                          <video
                            ref={videoRef}
                            src={video.video_url}
                            poster={video.photo_url}
                            className="w-full h-full object-cover"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => {
                              setIsPlaying(false);
                              setAutoRotate(true);
                            }}
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            {video.photo_url ? (
                              <img
                                src={video.photo_url}
                                alt={video.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="h-12 w-12 text-white/80" />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-center text-white/80 text-sm mt-2 font-medium">
                        {video.name}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Video Indicators */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setAutoRotate(false);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRotate}
              className="text-white hover:bg-white/20"
            >
              <RotateCw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
