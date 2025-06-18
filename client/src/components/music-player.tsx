import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Heart,
  Repeat,
  Shuffle,
  X,
  ChevronUp,
  Music
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
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 z-40"
        >
          <Card className="backdrop-blur-3xl bg-gradient-to-r from-card/95 via-card/90 to-card/95 border-border/50 shadow-2xl shadow-primary/10 overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5" />
            
            <CardContent className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Music className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Tocando Agora</h4>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Artist Info */}
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-primary/30 shadow-lg"
                    animate={isPlaying ? { 
                      boxShadow: ["0 0 20px rgba(59, 130, 246, 0.3)", "0 0 30px rgba(59, 130, 246, 0.5)", "0 0 20px rgba(59, 130, 246, 0.3)"] 
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <img
                      src={currentArtist.avatar}
                      alt={`Avatar de ${currentArtist.name}`}
                      className="w-full h-full object-cover"
                    />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    )}
                  </motion.div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg truncate">{currentArtist.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentArtist.roles.slice(0, 2).map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      Música Geek Profissional
                    </p>
                  </div>
                </div>

                {/* Central Controls */}
                <div className="flex flex-col items-center space-y-4">
                  {/* Transport Controls */}
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-accent h-10 w-10"
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onPrevious}
                      className="rounded-full h-11 w-11 border-primary/30 hover:border-primary hover:bg-primary/10"
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={onPlayPause}
                        className="rounded-full w-14 h-14 bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-lg"
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6 ml-0.5" />
                        )}
                      </Button>
                    </motion.div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onNext}
                      className="rounded-full h-11 w-11 border-primary/30 hover:border-primary hover:bg-primary/10"
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-accent h-10 w-10"
                    >
                      <Repeat className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md space-y-2">
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={1}
                      onValueChange={(value) => onSeek(value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center justify-end space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-red-500/20 hover:text-red-500"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  
                  {/* Volume Control */}
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8"
                    >
                      {volume === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="w-24">
                      <Slider
                        value={[volume]}
                        max={100}
                        step={1}
                        onValueChange={(value) => onVolumeChange(value[0])}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualizer Effect */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-50">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentTime / duration) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
