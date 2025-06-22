import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Play, Pause, ChevronDown, ChevronUp, Instagram, Youtube, Music2, Heart, User } from "lucide-react";
import { Artist } from "@shared/schema";
import { useTheme } from "./theme-provider";
import { useLikes } from "@/hooks/useLikes";
import { useAuth } from "@/hooks/useAuth";

interface ExpandableArtistCardProps {
  artist: Artist;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export default function ExpandableArtistCard({ artist, isPlaying, onPlay, onPause }: ExpandableArtistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { isArtistLiked, toggleLike, isLiking } = useLikes();
  
  const liked = isAuthenticated && isArtistLiked(artist.id);

  const socialLinks = JSON.parse(artist.socialLinks);
  const joinYear = new Date().getFullYear() - Math.floor(Math.random() * 3) - 1;

  const getBadgeVariant = (index: number) => {
    const variants = ["default", "secondary", "outline", "destructive"] as const;
    return variants[index % variants.length];
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
      }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
    >
      <Card className="overflow-hidden backdrop-blur-sm bg-card/50 border-border/50 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 relative group">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar className="w-16 h-16 ring-2 ring-border group-hover:ring-primary/30 transition-all duration-300 relative">
                <AvatarImage src={artist.avatar} alt={artist.name} />
                <AvatarFallback>{artist.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
              </Avatar>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {artist.name}
                </h3>
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={isPlaying ? onPause : onPlay}
                      className="w-8 h-8 p-0 hover:bg-primary/10 transition-all duration-300 relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-primary/20 rounded-md opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                        className="relative z-10"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </motion.div>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <Button
                      size="sm"
                      variant={liked ? "default" : "ghost"}
                      onClick={() => toggleLike(artist.id)}
                      disabled={isLiking}
                      title={!isAuthenticated ? "Faça login para curtir artistas" : liked ? "Descurtir artista" : "Curtir artista"}
                      className={`w-8 h-8 p-0 transition-all duration-300 relative overflow-hidden group ${
                        liked 
                          ? "bg-red-500 hover:bg-red-600 text-white" 
                          : "hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                      }`}
                    >
                      <motion.div
                        animate={{ 
                          scale: liked ? [1, 1.4, 1] : 1,
                          rotate: liked ? [0, -20, 20, 0] : 0
                        }}
                        transition={{ 
                          duration: liked ? 1 : 0.3,
                          ease: "easeInOut"
                        }}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.7 }}
                        className="relative z-10"
                      >
                        <Heart 
                          className={`w-4 h-4 transition-all duration-300 ${
                            liked ? 'fill-current text-white' : 'text-red-500'
                          }`} 
                        />
                      </motion.div>
                    </Button>
                    
                    {/* Likes Counter */}
                    {(artist.likesCount ?? 0) > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                      >
                        <motion.span
                          key={artist.likesCount ?? 0}
                          initial={{ scale: 1.5 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {(artist.likesCount ?? 0) > 99 ? '99+' : (artist.likesCount ?? 0)}
                        </motion.span>
                      </motion.div>
                    )}
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.location.href = "/profile"}
                      className="w-8 h-8 p-0 hover:bg-blue-500/10 transition-all duration-300 relative overflow-hidden group"
                    >
                        <motion.div
                          className="absolute inset-0 bg-blue-500/20 rounded-md opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div className="relative z-10">
                          <User className="w-4 h-4 text-blue-500" />
                        </motion.div>
                      </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="w-8 h-8 p-0 hover:bg-primary/10 transition-all duration-300 relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-primary/20 rounded-md opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {artist.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {artist.roles.map((role, index) => (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, scale: 0.8, x: -15, rotate: -5 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      x: 0, 
                      rotate: 0,
                      boxShadow: `0 0 0px ${getThemeColor('primary')}00`
                    }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.12,
                      type: "spring",
                      stiffness: 350,
                      damping: 25
                    }}
                    whileHover={{ 
                      scale: 1.15,
                      y: -4,
                      rotate: 2,
                      boxShadow: `0 12px 30px ${getThemeColor('primary')}40`,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.9, rotate: -1 }}
                    onClick={() => {
                      // Trigger role filter
                      window.dispatchEvent(new CustomEvent('filterByRole', { detail: role }));
                    }}
                    className="cursor-pointer"
                  >
                    <Badge
                      variant={getBadgeVariant(index)}
                      className="text-xs font-medium relative overflow-hidden transition-all duration-500 hover:shadow-xl border-2"
                      style={{
                        backgroundColor: `${getThemeColor('primary')}20`,
                        color: getThemeColor('primary'),
                        borderColor: `${getThemeColor('primary')}40`
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r opacity-0"
                        style={{
                          background: `linear-gradient(45deg, ${getThemeColor('primary')}30, ${getThemeColor('primary')}70)`
                        }}
                        whileHover={{ 
                          opacity: 0.4,
                          transition: { duration: 0.3 }
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 opacity-0"
                        style={{
                          background: `radial-gradient(circle at center, ${getThemeColor('primary')}40 0%, transparent 60%)`
                        }}
                        animate={{
                          opacity: [0, 0.7, 0],
                          scale: [0.8, 1.4, 0.8],
                          rotate: [0, 10, 0]
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.4
                        }}
                      />
                      <motion.div
                        className="absolute top-0 left-0 w-full h-full opacity-0"
                        style={{
                          background: `linear-gradient(45deg, transparent, ${getThemeColor('primary')}50, transparent)`
                        }}
                        animate={{
                          x: ['-120%', '120%'],
                          y: ['-120%', '120%'],
                          opacity: [0, 0.9, 0]
                        }}
                        transition={{
                          duration: 2.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 opacity-0"
                        style={{
                          background: `conic-gradient(from ${index * 45}deg, ${getThemeColor('primary')}30, transparent, ${getThemeColor('primary')}30)`
                        }}
                        animate={{
                          rotate: [0, 360],
                          opacity: [0, 0.4, 0]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear",
                          delay: index * 0.6
                        }}
                      />
                      <span className="relative z-10 font-semibold">{role}</span>
                    </Badge>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Desde {joinYear}</span>
                <div className="flex items-center gap-1">
                  {socialLinks.instagram && (
                    <motion.div
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Button size="sm" variant="ghost" className="w-6 h-6 p-0 relative overflow-hidden group hover:bg-pink-500/20" asChild>
                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100"
                            transition={{ duration: 0.3 }}
                          />
                          <Instagram className="w-3 h-3 relative z-10 text-pink-500" />
                        </a>
                      </Button>
                    </motion.div>
                  )}
                  {socialLinks.youtube && (
                    <motion.div
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Button size="sm" variant="ghost" className="w-6 h-6 p-0 relative overflow-hidden group hover:bg-red-500/20" asChild>
                        <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                          <motion.div
                            className="absolute inset-0 bg-red-500/30 opacity-0 group-hover:opacity-100"
                            transition={{ duration: 0.3 }}
                          />
                          <Youtube className="w-3 h-3 relative z-10 text-red-500" />
                        </a>
                      </Button>
                    </motion.div>
                  )}
                  {socialLinks.spotify && (
                    <motion.div
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Button size="sm" variant="ghost" className="w-6 h-6 p-0 relative overflow-hidden group hover:bg-green-500/20" asChild>
                        <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer">
                          <motion.div
                            className="absolute inset-0 bg-green-500/30 opacity-0 group-hover:opacity-100"
                            transition={{ duration: 0.3 }}
                          />
                          <Music2 className="w-3 h-3 relative z-10 text-green-500" />
                        </a>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-border/50"
              >
                {artist.musicalStyles && artist.musicalStyles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Music2 className="w-4 h-4" />
                      Estilo Musical:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {artist.musicalStyles.map((style, index) => (
                        <Badge
                          key={style}
                          variant="outline"
                          className="text-xs"
                          style={{
                            backgroundColor: `${getThemeColor('secondary')}15`,
                            color: getThemeColor('secondary'),
                            borderColor: `${getThemeColor('secondary')}30`
                          }}
                        >
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {artist.artistTypes && artist.artistTypes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Badge className="w-4 h-4 p-0" />
                      Tipo:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {artist.artistTypes.map((type, index) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: `${getThemeColor('accent')}15`,
                            color: getThemeColor('accent'),
                            borderColor: `${getThemeColor('accent')}30`
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}