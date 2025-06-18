import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Heart } from "lucide-react";
import { SiSpotify, SiSoundcloud, SiInstagram, SiYoutube } from "react-icons/si";
import type { Artist } from "@shared/schema";

interface ArtistCardProps {
  artist: Artist;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

const roleColors: Record<string, string> = {
  cantor: "bg-gradient-to-r from-primary to-primary/80 text-white",
  compositor: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
  beatmaker: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
  mixer: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
  editor: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
};

const socialIcons: Record<string, any> = {
  spotify: SiSpotify,
  soundcloud: SiSoundcloud,
  instagram: SiInstagram,
  youtube: SiYoutube,
};

export default function ArtistCard({ artist, isPlaying, onPlay, onPause }: ArtistCardProps) {
  const socialLinks = JSON.parse(artist.socialLinks);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <motion.div
      className="group cursor-pointer"
      whileHover={{ scale: 1.03, y: -12 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={handlePlayPause}
    >
      <Card className={`modern-card h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 ${
        isPlaying ? "playing-glow border-primary/50" : "border-border/30"
      }`}>
        <CardContent className="p-8">
          {/* Avatar */}
          <div className="relative mb-6 flex justify-center">
            <div className={`w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-offset-4 ring-offset-background transition-all duration-300 shadow-lg ${
              isPlaying ? "ring-primary shadow-primary/30" : "ring-primary/30 group-hover:ring-primary/60"
            }`}>
              <img 
                src={artist.avatar} 
                alt={`Avatar de ${artist.name}`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            
            {/* Music Status Indicator */}
            {isPlaying && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 music-wave">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            )}
            
            {/* Play Overlay */}
            <div className="absolute inset-0 rounded-3xl bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-primary ml-0.5" />
                ) : (
                  <Play className="h-6 w-6 text-primary ml-1" />
                )}
              </div>
            </div>
          </div>

          {/* Artist Info */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold mb-2 text-foreground">{artist.name}</h3>
            
            {/* Role Badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {artist.roles.map((role) => (
                <Badge 
                  key={role} 
                  className={`text-xs ${roleColors[role] || "bg-secondary text-secondary-foreground"}`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4">
              {artist.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={handlePlayPause}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Tocar
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="hover:bg-red-500 hover:text-white transition-colors"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-4">
            {Object.entries(socialLinks).map(([platform, url]) => {
              const IconComponent = socialIcons[platform];
              if (!IconComponent) return null;
              
              return (
                <a
                  key={platform}
                  href={url as string}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  onClick={(e) => e.stopPropagation()}
                  title={platform}
                >
                  <IconComponent className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
