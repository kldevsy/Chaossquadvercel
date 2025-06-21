import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Play, Pause, Calendar, Users, Music2 } from "lucide-react";
import { Project, Artist } from "@shared/schema";
import { useTheme } from "./theme-provider";

interface ProjectCardProps {
  project: Project;
  artists: Artist[];
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export default function ProjectCard({ project, artists, isPlaying, onPlay, onPause }: ProjectCardProps) {
  const { theme } = useTheme();
  const [showVideo, setShowVideo] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to convert video URLs to embed format
  const getEmbedUrl = (url: string) => {
    if (!url) return null;

    // YouTube
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtu.be/') 
        ? url.split('youtu.be/')[1].split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
    }

    // Instagram
    if (url.includes('instagram.com/p/') || url.includes('instagram.com/reel/')) {
      return `${url}embed/`;
    }

    // TikTok
    if (url.includes('tiktok.com/')) {
      const videoId = url.split('/video/')[1]?.split('?')[0];
      return `https://www.tiktok.com/embed/v2/${videoId}`;
    }

    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&controls=0&loop=1`;
    }

    // Twitter/X
    if (url.includes('twitter.com/') || url.includes('x.com/')) {
      return url; // Twitter embeds work differently, we'll handle this separately
    }

    // Facebook
    if (url.includes('facebook.com/')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=true&muted=true`;
    }

    // Default: assume it's a direct video URL
    return url;
  };

  // Function to render video based on platform
  const renderVideoPreview = (url: string) => {
    const embedUrl = getEmbedUrl(url);
    
    if (!embedUrl) return null;

    // Special handling for Twitter/X
    if (url.includes('twitter.com/') || url.includes('x.com/')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black/80">
          <div className="text-white text-center">
            <div className="mb-2">🐦</div>
            <div className="text-xs">Clique para ver no Twitter</div>
          </div>
        </div>
      );
    }

    // Special handling for Instagram
    if (url.includes('instagram.com/')) {
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          scrolling="no"
          allowTransparency={true}
          allow="encrypted-media"
        />
      );
    }

    // Default iframe for other platforms
    return (
      <iframe
        src={embedUrl}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_desenvolvimento": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "finalizado": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "lancado": return "bg-green-500/20 text-green-500 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "em_desenvolvimento": return "Em Desenvolvimento";
      case "finalizado": return "Finalizado";
      case "lancado": return "Lançado";
      default: return status;
    }
  };

  const getThemeColor = (colorType: 'primary' | 'secondary' | 'accent') => {
    if (theme === 'dark') return 'rgb(147, 51, 234)';
    if (theme === 'green') return 'rgb(34, 197, 94)';
    if (theme === 'red') return 'rgb(239, 68, 68)';
    if (theme === 'purple') return 'rgb(168, 85, 247)';
    if (theme === 'blue') return 'rgb(59, 130, 246)';
    if (theme === 'orange') return 'rgb(249, 115, 22)';
    if (theme === 'pink') return 'rgb(236, 72, 153)';
    if (theme === 'cyan') return 'rgb(6, 182, 212)';
    if (theme === 'yellow') return 'rgb(234, 179, 8)';
    if (theme === 'indigo') return 'rgb(99, 102, 241)';
    if (theme === 'emerald') return 'rgb(16, 185, 129)';
    if (theme === 'rose') return 'rgb(244, 63, 94)';
    if (theme === 'neon') return 'rgb(0, 255, 127)';
    if (theme === 'gold') return 'rgb(255, 215, 0)';
    return 'rgb(99, 102, 241)';
  };

  const collaboratingArtists = artists.filter(artist => 
    project.collaborators.includes(artist.id.toString())
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    if (project.previewVideoUrl && hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (project.previewVideoUrl) {
        setShowVideo(true);
      }
    }, 800);
  }, [project.previewVideoUrl]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowVideo(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!project.previewVideoUrl) return;

    // For Twitter/X, open in new tab instead of embedding
    if (project.previewVideoUrl.includes('twitter.com/') || project.previewVideoUrl.includes('x.com/')) {
      window.open(project.previewVideoUrl, '_blank');
      return;
    }

    setShowVideo(!showVideo);
  }, [project.previewVideoUrl, showVideo]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card className="overflow-hidden backdrop-blur-sm bg-card/50 border-border/50 hover:border-primary/20 transition-all duration-300 cursor-pointer">
        <div className="relative" onClick={handleClick}>
          {/* Image/Video Container */}
          <div className="relative w-full h-48 overflow-hidden">
            <motion.img
              src={project.cover}
              alt={project.name}
              className="w-full h-full object-cover"
              animate={{ 
                opacity: showVideo ? 0 : 1,
                scale: showVideo ? 1.1 : 1 
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Video Preview */}
            {project.previewVideoUrl && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: showVideo ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {showVideo && renderVideoPreview(project.previewVideoUrl)}
              </motion.div>
            )}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`text-xs font-medium ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </Badge>
          </div>

          {/* Video Preview Indicator */}
          {project.previewVideoUrl && (
            <motion.div 
              className="absolute top-3 right-3"
              animate={{ scale: isHovering ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-black/60 backdrop-blur-sm rounded-full p-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* Play Button */}
          {project.previewUrl && (
            <div className="absolute bottom-3 right-3">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  isPlaying ? onPause() : onPlay();
                }}
                className="w-10 h-10 p-0 rounded-full bg-primary/90 hover:bg-primary text-white shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>
            </div>
          )}

          {/* Video Toggle Hint */}
          {project.previewVideoUrl && !showVideo && (
            <motion.div 
              className="absolute bottom-3 left-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovering ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white text-xs font-medium">
                  Clique para ver prévia
                </span>
              </div>
            </motion.div>
          )}

          {/* Video Playing Indicator */}
          {showVideo && (
            <motion.div 
              className="absolute bottom-3 left-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-red-500/90 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-medium">
                  Prévia
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {project.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {project.genres.map((genre, index) => (
                <Badge
                  key={genre}
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: `${getThemeColor('primary')}15`,
                    color: getThemeColor('primary'),
                    borderColor: `${getThemeColor('primary')}30`
                  }}
                >
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Collaborators */}
            {collaboratingArtists.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Colaboradores:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {collaboratingArtists.slice(0, 3).map((artist) => (
                    <div key={artist.id} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={artist.avatar} alt={artist.name} />
                        <AvatarFallback className="text-xs">{artist.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{artist.name}</span>
                    </div>
                  ))}
                  {collaboratingArtists.length > 3 && (
                    <div className="flex items-center justify-center bg-muted/50 rounded-full px-3 py-1">
                      <span className="text-xs text-muted-foreground">+{collaboratingArtists.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Project Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {project.releaseDate 
                    ? new Date(project.releaseDate).toLocaleDateString('pt-BR')
                    : `Criado em ${new Date(project.createdAt).toLocaleDateString('pt-BR')}`
                  }
                </span>
              </div>
              {project.previewUrl && (
                <div className="flex items-center gap-1">
                  <Music2 className="w-3 h-3" />
                  <span>Preview disponível</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}