import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Music, Play, Headphones } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface PlatformStatsProps {
  totalArtists: number;
}

export default function PlatformStats({ totalArtists }: PlatformStatsProps) {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    activeListeners: 0,
    tracksPlayed: 0,
    totalTracks: 0
  });

  useEffect(() => {
    // Simulate real-time stats
    const interval = setInterval(() => {
      setStats(prev => ({
        activeListeners: Math.max(1, prev.activeListeners + Math.floor(Math.random() * 3) - 1),
        tracksPlayed: prev.tracksPlayed + Math.floor(Math.random() * 2),
        totalTracks: Math.max(totalArtists * 5, prev.totalTracks + Math.floor(Math.random() * 1))
      }));
    }, 3000);

    // Initial values
    setStats({
      activeListeners: Math.floor(Math.random() * 50) + 20,
      tracksPlayed: Math.floor(Math.random() * 500) + 100,
      totalTracks: totalArtists * 5 + Math.floor(Math.random() * 20)
    });

    return () => clearInterval(interval);
  }, [totalArtists]);

  const getThemeColor = () => {
    switch (theme) {
      case 'red': return 'text-red-400';
      case 'green': return 'text-green-400';
      case 'blue': return 'text-blue-400';
      case 'purple': return 'text-purple-400';
      case 'neon': return 'text-cyan-400';
      case 'gold': return 'text-yellow-500';
      case 'orange': return 'text-orange-400';
      case 'pink': return 'text-pink-400';
      default: return 'text-primary';
    }
  };

  const statsData = [
    { 
      icon: Users, 
      label: "Artistas", 
      value: totalArtists,
      color: getThemeColor()
    },
    { 
      icon: Headphones, 
      label: "Online", 
      value: stats.activeListeners,
      color: "text-green-400",
      animated: true
    },
    { 
      icon: Music, 
      label: "Faixas", 
      value: stats.totalTracks,
      color: getThemeColor()
    },
    { 
      icon: Play, 
      label: "Reproduções", 
      value: stats.tracksPlayed,
      color: getThemeColor(),
      animated: true
    }
  ];

  return (
    <div className="hidden lg:flex items-center space-x-6">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="flex items-center space-x-2"
        >
          <motion.div
            animate={stat.animated ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3 
            }}
          >
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </motion.div>
          <div className="text-sm">
            <AnimatePresence mode="wait">
              <motion.span
                key={stat.value}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`font-bold ${stat.color}`}
              >
                {stat.value.toLocaleString()}
              </motion.span>
            </AnimatePresence>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}