import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Heart, Share2, Music, Star, Users, Calendar, MapPin, Award, Headphones } from "lucide-react";
import type { Artist } from "@shared/schema";

interface EnhancedArtistCardProps {
  artist: Artist;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

const roleColors: Record<string, string> = {
  "cantor": "bg-gradient-to-r from-blue-500/20 to-blue-600/30 text-blue-300 border-blue-400/30",
  "compositor": "bg-gradient-to-r from-purple-500/20 to-purple-600/30 text-purple-300 border-purple-400/30",
  "beatmaker": "bg-gradient-to-r from-green-500/20 to-green-600/30 text-green-300 border-green-400/30",
  "mixer": "bg-gradient-to-r from-orange-500/20 to-orange-600/30 text-orange-300 border-orange-400/30",
  "editor": "bg-gradient-to-r from-red-500/20 to-red-600/30 text-red-300 border-red-400/30",
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case "cantor": return <Music className="w-3 h-3" />;
    case "compositor": return <Award className="w-3 h-3" />;
    case "beatmaker": return <Headphones className="w-3 h-3" />;
    case "mixer": return <Users className="w-3 h-3" />;
    case "editor": return <Star className="w-3 h-3" />;
    default: return <Music className="w-3 h-3" />;
  }
};

export default function EnhancedArtistCard({ artist, isPlaying, onPlay, onPause }: EnhancedArtistCardProps) {
  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const mockStats = {
    rating: 4.8,
    followers: Math.floor(Math.random() * 50000) + 5000,
    tracks: Math.floor(Math.random() * 100) + 10,
    experience: Math.floor(Math.random() * 8) + 2,
    location: "Brasil"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.9, rotateX: -15 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        rotateX: 0,
        transition: {
          duration: 0.7,
          ease: "easeOut",
          delay: Math.random() * 0.4
        }
      }}
      exit={{ 
        opacity: 0, 
        y: -40, 
        scale: 0.9,
        rotateX: 15,
        transition: { duration: 0.5 }
      }}
      whileHover={{ 
        y: -20, 
        scale: 1.05,
        rotateX: 5,
        rotateY: 2,
        transition: { 
          duration: 0.5,
          ease: "easeOut"
        }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      className="group relative cursor-pointer"
      style={{ perspective: 1200 }}
      onClick={handlePlayPause}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        animate={isPlaying ? { opacity: 0.6 } : { opacity: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 rounded-3xl blur-xl" />
      </motion.div>

      <Card className={`relative h-full transition-all duration-700 hover:shadow-2xl backdrop-blur-sm border-2 rounded-3xl overflow-hidden ${
        isPlaying 
          ? "border-primary/60 shadow-primary/30 shadow-2xl bg-card/90" 
          : "border-border/30 hover:border-primary/40 bg-card/80 hover:bg-card/90"
      }`}>
        {/* Status indicator */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="absolute top-4 right-4 z-20 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
            >
              <div className="music-wave">
                <div className="bar bg-white"></div>
                <div className="bar bg-white"></div>
                <div className="bar bg-white"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-0 relative">
          {/* Hero Section with Avatar */}
          <div className="relative h-48 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-6">
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
            
            <div className="relative flex items-center space-x-4 h-full">
              <motion.div 
                className={`relative w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-offset-2 ring-offset-card transition-all duration-500 shadow-xl ${
                  isPlaying ? "ring-primary" : "ring-primary/30 group-hover:ring-primary/60"
                }`}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -3, 3, 0],
                  transition: { duration: 0.6 }
                }}
              >
                <img 
                  src={artist.avatar} 
                  alt={`Avatar de ${artist.name}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Play overlay */}
                <motion.div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-black" />
                    ) : (
                      <Play className="w-4 h-4 text-black ml-0.5" />
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Artist Info */}
              <div className="flex-1 space-y-2">
                <motion.h3 
                  className="text-xl font-bold text-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {artist.name}
                </motion.h3>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{mockStats.location}</span>
                  <span>•</span>
                  <Calendar className="w-3 h-3" />
                  <span>{mockStats.experience} anos</span>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{mockStats.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.floor(mockStats.followers / 100)} avaliações)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            {/* Role Badges */}
            <div className="flex flex-wrap gap-2">
              {artist.roles.map((role, index) => (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.3 + index * 0.1,
                    ease: "easeOut" 
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge 
                    className={`text-xs cursor-pointer transition-all duration-300 hover:shadow-lg border ${roleColors[role] || "bg-secondary text-secondary-foreground"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const event = new CustomEvent('filterByRole', { detail: role });
                      window.dispatchEvent(event);
                    }}
                  >
                    <span className="mr-1">{getRoleIcon(role)}</span>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                </motion.div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 text-center py-3 border-t border-border/50">
              <div className="space-y-1">
                <div className="text-lg font-bold text-foreground">{mockStats.followers.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center">
                  <Users className="w-3 h-3 mr-1" />
                  Seguidores
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-foreground">{mockStats.tracks}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center">
                  <Music className="w-3 h-3 mr-1" />
                  Faixas
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-foreground">{mockStats.experience}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center">
                  <Award className="w-3 h-3 mr-1" />
                  Anos
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex space-x-2">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-8 h-8 hover:bg-red-500/20 hover:text-red-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-8 h-8 hover:bg-blue-500/20 hover:text-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="rounded-full px-6 bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause();
                  }}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2 ml-0.5" />
                      Tocar
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Animated border on hover */}
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-transparent"
            animate={isPlaying ? 
              { 
                borderColor: 'var(--primary)',
                boxShadow: '0 0 30px rgba(var(--primary-rgb), 0.3)'
              } : 
              { 
                borderColor: 'transparent',
                boxShadow: '0 0 0px rgba(var(--primary-rgb), 0)'
              }
            }
            transition={{ duration: 0.5 }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}