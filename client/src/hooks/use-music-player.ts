import { useState, useRef, useEffect } from "react";
import type { Artist } from "@shared/schema";

export function useMusicPlayer() {
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(225); // 3:45 default
  const [volume, setVolume] = useState(70);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element when needed
    if (currentArtist && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
      
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          setDuration(Math.floor(audioRef.current.duration) || 225);
        }
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      });
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentArtist]);

  const playArtist = (artist: Artist) => {
    // Reset state first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setCurrentArtist(artist);
    setIsPlayerVisible(true);
    setIsPlayerMinimized(false);
    setCurrentTime(0);
    
    console.log(`Playing: ${artist.name}`);
    
    // Initialize audio element if needed
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
      
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          setDuration(Math.floor(audioRef.current.duration) || 225);
        }
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      });

      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current && !audioRef.current.paused && !audioRef.current.seeking) {
          const newTime = Math.floor(audioRef.current.currentTime);
          setCurrentTime(prevTime => {
            // Only update if time actually changed to avoid unnecessary re-renders
            return prevTime !== newTime ? newTime : prevTime;
          });
        }
      });
    }
    
    // Set up audio source and play
    if (audioRef.current) {
      audioRef.current.src = artist.musicUrl || "";
      audioRef.current.volume = volume / 100;
      audioRef.current.currentTime = 0;
    }
    
    // Start playing
    setTimeout(() => {
      play();
    }, 100);
  };

  const play = () => {
    setIsPlaying(true);
    
    // Try to play actual audio first
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().then(() => {
        // Audio is playing, timeupdate will handle time tracking
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }).catch(() => {
        // Fallback to simulation if audio fails
        console.log("Audio playback failed, using simulation");
        startSimulationTimer();
      });
    } else {
      // No audio source, use simulation
      startSimulationTimer();
    }
  };

  const startSimulationTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) {
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const pause = () => {
    setIsPlaying(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seek = (time: number) => {
    const safeTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(safeTime);
    if (audioRef.current) {
      audioRef.current.currentTime = safeTime;
    }
  };

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const next = () => {
    // Implement next track logic
    console.log("Next track");
  };

  const previous = () => {
    // Implement previous track logic
    console.log("Previous track");
  };

  const closePlayer = () => {
    pause();
    setIsPlayerVisible(false);
    setCurrentArtist(null);
    setCurrentTime(0);
    setIsPlayerMinimized(false);
  };

  const toggleMinimize = () => {
    setIsPlayerMinimized(!isPlayerMinimized);
  };

  return {
    currentArtist,
    isPlaying,
    currentTime,
    duration,
    volume,
    isPlayerVisible,
    isPlayerMinimized,
    playArtist,
    togglePlayPause,
    seek,
    changeVolume,
    next,
    previous,
    closePlayer,
    toggleMinimize,
  };
}
