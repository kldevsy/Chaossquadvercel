import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Music, Youtube, Instagram, Calendar, Users, Heart, User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useLikes } from "@/hooks/useLikes";
import { useAuth } from "@/hooks/useAuth";
import type { Artist } from "@shared/schema";

interface ArtistCardProps {
  artist: Artist;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

const getRoleColors = (theme: string) => {
  const baseColors = {
    "cantor": { bg: "from-blue-500 to-blue-600", text: "text-white", border: "border-blue-400" },
    "compositor": { bg: "from-purple-500 to-purple-600", text: "text-white", border: "border-purple-400" },
    "beatmaker": { bg: "from-green-500 to-green-600", text: "text-white", border: "border-green-400" },
    "mixer": { bg: "from-orange-500 to-orange-600", text: "text-white", border: "border-orange-400" },
    "editor": { bg: "from-red-500 to-red-600", text: "text-white", border: "border-red-400" },
  };

  // Cores mais vivas baseadas no tema
  const themeColors = {
    red: {
      "cantor": { bg: "from-red-400 to-red-600", text: "text-white", border: "border-red-300" },
      "compositor": { bg: "from-pink-400 to-pink-600", text: "text-white", border: "border-pink-300" },
      "beatmaker": { bg: "from-rose-400 to-rose-600", text: "text-white", border: "border-rose-300" },
      "mixer": { bg: "from-orange-400 to-orange-600", text: "text-white", border: "border-orange-300" },
      "editor": { bg: "from-red-500 to-red-700", text: "text-white", border: "border-red-400" },
    },
    green: {
      "cantor": { bg: "from-emerald-400 to-emerald-600", text: "text-white", border: "border-emerald-300" },
      "compositor": { bg: "from-green-400 to-green-600", text: "text-white", border: "border-green-300" },
      "beatmaker": { bg: "from-lime-400 to-lime-600", text: "text-white", border: "border-lime-300" },
      "mixer": { bg: "from-teal-400 to-teal-600", text: "text-white", border: "border-teal-300" },
      "editor": { bg: "from-green-500 to-green-700", text: "text-white", border: "border-green-400" },
    },
    blue: {
      "cantor": { bg: "from-blue-400 to-blue-600", text: "text-white", border: "border-blue-300" },
      "compositor": { bg: "from-indigo-400 to-indigo-600", text: "text-white", border: "border-indigo-300" },
      "beatmaker": { bg: "from-sky-400 to-sky-600", text: "text-white", border: "border-sky-300" },
      "mixer": { bg: "from-cyan-400 to-cyan-600", text: "text-white", border: "border-cyan-300" },
      "editor": { bg: "from-blue-500 to-blue-700", text: "text-white", border: "border-blue-400" },
    },
    purple: {
      "cantor": { bg: "from-purple-400 to-purple-600", text: "text-white", border: "border-purple-300" },
      "compositor": { bg: "from-violet-400 to-violet-600", text: "text-white", border: "border-violet-300" },
      "beatmaker": { bg: "from-indigo-400 to-indigo-600", text: "text-white", border: "border-indigo-300" },
      "mixer": { bg: "from-fuchsia-400 to-fuchsia-600", text: "text-white", border: "border-fuchsia-300" },
      "editor": { bg: "from-purple-500 to-purple-700", text: "text-white", border: "border-purple-400" },
    },
    neon: {
      "cantor": { bg: "from-cyan-400 to-cyan-600", text: "text-black", border: "border-cyan-300" },
      "compositor": { bg: "from-lime-400 to-lime-600", text: "text-black", border: "border-lime-300" },
      "beatmaker": { bg: "from-yellow-400 to-yellow-600", text: "text-black", border: "border-yellow-300" },
      "mixer": { bg: "from-pink-400 to-pink-600", text: "text-white", border: "border-pink-300" },
      "editor": { bg: "from-cyan-500 to-cyan-700", text: "text-white", border: "border-cyan-400" },
    },
    gold: {
      "cantor": { bg: "from-yellow-400 to-yellow-600", text: "text-black", border: "border-yellow-300" },
      "compositor": { bg: "from-amber-400 to-amber-600", text: "text-black", border: "border-amber-300" },
      "beatmaker": { bg: "from-orange-400 to-orange-600", text: "text-white", border: "border-orange-300" },
      "mixer": { bg: "from-yellow-500 to-yellow-700", text: "text-black", border: "border-yellow-400" },
      "editor": { bg: "from-amber-500 to-amber-700", text: "text-white", border: "border-amber-400" },
    }
  };

  return themeColors[theme as keyof typeof themeColors] || baseColors;
};

export default function ArtistCard({ artist, isPlaying, onPlay, onPause }: ArtistCardProps) {
  const { isAuthenticated } = useAuth();
  const { isArtistLiked, toggleLike, isLiking } = useLikes();
  
  const liked = isAuthenticated && isArtistLiked(artist.id);
  const { theme } = useTheme();
  const roleColors = getRoleColors(theme);

  // Parse social links from JSON string
  const socialLinks = JSON.parse(artist.socialLinks || '{}');
  
  // Calculate join date (mock data for now - can be added to schema later)
  const joinDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const monthsInSquad = Math.ceil((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleSocialClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="group relative"
    >
      <Card className={`relative h-full transition-all duration-500 hover:shadow-xl rounded-2xl border overflow-hidden ${
        isPlaying 
          ? "border-primary/60 shadow-primary/20 shadow-lg" 
          : "border-border/30 hover:border-primary/40"
      }`}>
        
        {/* Playing indicator */}
        {isPlaying && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 z-10 w-3 h-3 bg-primary rounded-full animate-pulse"
          />
        )}

        <CardContent className="p-6">
          {/* Avatar Section */}
          <div className="relative mb-6 flex justify-center">
            <motion.div 
              className={`relative w-20 h-20 rounded-xl overflow-hidden ring-3 ring-offset-2 ring-offset-background transition-all duration-300 ${
                isPlaying ? "ring-primary" : "ring-primary/20 group-hover:ring-primary/50"
              }`}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <img 
                src={artist.avatar} 
                alt={`Avatar de ${artist.name}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Artist Info */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {artist.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground mb-3">
              {artist.description}
            </p>

            {/* Chaos Squad Info */}
            <div className="flex items-center justify-center gap-2 mb-3 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>Chaos Squad</span>
              <span>•</span>
              <Calendar className="w-3 h-3" />
              <span>{monthsInSquad} meses</span>
            </div>
            
            {/* Role Badges */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-4">
              {artist.roles.map((role, index) => {
                const colors = roleColors[role as keyof typeof roleColors];
                return (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.1 + index * 0.05
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge 
                      className={`text-xs font-medium cursor-pointer transition-all duration-300 bg-gradient-to-r ${colors?.bg} ${colors?.text} ${colors?.border} border shadow-sm hover:shadow-md`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const event = new CustomEvent('filterByRole', { detail: role });
                        window.dispatchEvent(event);
                      }}
                    >
                      <Music className="w-3 h-3 mr-1" />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-2 mb-4">
              {socialLinks.youtube && socialLinks.youtube !== '#' && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30"
                    onClick={(e) => handleSocialClick(socialLinks.youtube, e)}
                  >
                    <Youtube className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
              
              {socialLinks.instagram && socialLinks.instagram !== '#' && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full hover:bg-pink-500/20 hover:text-pink-500 hover:border-pink-500/30"
                    onClick={(e) => handleSocialClick(socialLinks.instagram, e)}
                  >
                    <Instagram className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
              
              {socialLinks.spotify && socialLinks.spotify !== '#' && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full hover:bg-green-500/20 hover:text-green-500 hover:border-green-500/30"
                    onClick={(e) => handleSocialClick(socialLinks.spotify, e)}
                  >
                    <Music className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1"
            >
              <Button
                className={`w-full rounded-full px-4 py-2 font-medium transition-all duration-300 ${
                  isPlaying 
                    ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30" 
                    : "bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-md hover:shadow-lg"
                }`}
                onClick={handlePlayPause}
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
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => window.location.href = `/artist-profile/${artist.id}`}
                variant="outline"
                className="rounded-full px-4 py-2 border-blue-400 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <User className="w-4 h-4 mr-1" />
                Perfil
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => toggleLike(artist.id)}
                disabled={isLiking}
                variant={liked ? "default" : "outline"}
                className={`rounded-full px-4 py-2 transition-all duration-300 ${
                  liked 
                    ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
                    : "border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                }`}
              >
                <motion.div
                  animate={{ 
                    scale: liked ? [1, 1.3, 1] : 1,
                    rotate: liked ? [0, -15, 15, 0] : 0
                  }}
                  transition={{ 
                    duration: liked ? 0.8 : 0.3,
                    ease: "easeInOut"
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                >
                  <Heart 
                    className={`w-4 h-4 transition-all duration-300 ${
                      liked ? 'fill-current text-white' : 'text-red-500'
                    }`} 
                  />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </CardContent>

        {/* Hover background effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        </div>
      </Card>
    </motion.div>
  );
}