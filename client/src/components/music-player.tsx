import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  X 
} from "lucide-react";
import type { Artist } from "@shared/schema";

interface MusicPlayerProps {
  isVisible: boolean;
  currentArtist: Artist | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
}

export default function MusicPlayer({
  isVisible,
  currentArtist,
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onClose,
}: MusicPlayerProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isVisible && currentArtist && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="glassmorphism border-t border-border m-0 rounded-none">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                {/* Current Track Info */}
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={currentArtist.avatar} 
                      alt={`Avatar de ${currentArtist.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      Música Geek
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {currentArtist.name}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPrevious}
                    className="hover:bg-secondary"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="icon"
                    onClick={onPlayPause}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-12 h-12"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNext}
                    className="hover:bg-secondary"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress & Volume */}
                <div className="flex items-center space-x-4 flex-1 justify-end">
                  <span className="text-sm text-muted-foreground">
                    {formatTime(currentTime)}
                  </span>
                  
                  <div className="w-32">
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={1}
                      onValueChange={(value) => onSeek(value[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <span className="text-sm text-muted-foreground">
                    {formatTime(duration)}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-secondary"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-20">
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      onValueChange={(value) => onVolumeChange(value[0])}
                      className="w-full"
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="hover:bg-secondary"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
