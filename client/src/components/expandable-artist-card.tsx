import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Play, Pause, ChevronDown, ChevronUp, Instagram, Youtube, Music2 } from "lucide-react";
import { Artist } from "@shared/schema";
import { useTheme } from "./theme-provider";

interface ExpandableArtistCardProps {
  artist: Artist;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export default function ExpandableArtistCard({ artist, isPlaying, onPlay, onPause }: ExpandableArtistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden backdrop-blur-sm bg-card/50 border-border/50 hover:border-primary/20 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 ring-2 ring-border">
              <AvatarImage src={artist.avatar} alt={artist.name} />
              <AvatarFallback>{artist.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {artist.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={isPlaying ? onPause : onPlay}
                    className="w-8 h-8 p-0 hover:bg-primary/10"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-8 h-8 p-0 hover:bg-primary/10"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {artist.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {artist.roles.map((role, index) => (
                  <Badge
                    key={role}
                    variant={getBadgeVariant(index)}
                    className="text-xs font-medium"
                    style={{
                      backgroundColor: `${getThemeColor('primary')}20`,
                      color: getThemeColor('primary'),
                      borderColor: `${getThemeColor('primary')}40`
                    }}
                  >
                    {role}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Desde {joinYear}</span>
                <div className="flex items-center gap-2">
                  {socialLinks.instagram && (
                    <Button size="sm" variant="ghost" className="w-6 h-6 p-0" asChild>
                      <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                  {socialLinks.youtube && (
                    <Button size="sm" variant="ghost" className="w-6 h-6 p-0" asChild>
                      <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                        <Youtube className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                  {socialLinks.spotify && (
                    <Button size="sm" variant="ghost" className="w-6 h-6 p-0" asChild>
                      <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer">
                        <Music2 className="w-3 h-3" />
                      </a>
                    </Button>
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