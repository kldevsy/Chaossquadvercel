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
    setCurrentArtist(artist);
    setIsPlayerVisible(true);
    setIsPlayerMinimized(false);
    
    // Only show player, don't auto-play
    console.log(`Artist selected: ${artist.name}`);
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Prepare audio but don't play
    if (audioRef.current) {
      audioRef.current.src = artist.musicUrl || "";
      audioRef.current.volume = volume / 100;
    }
  };

  const play = () => {
    setIsPlaying(true);
    
    // Start time tracking
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

    // Try to play actual audio if available
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback to simulation if audio fails
        console.log("Audio playback failed, using simulation");
      });
    }
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
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
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
