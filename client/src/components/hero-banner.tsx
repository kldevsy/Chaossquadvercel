import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Headphones, Music } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-purple-500/10 to-primary/10">
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-24 h-24 bg-orange-500 rounded-full"
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-purple-600 rounded-full"
            animate={{
              rotate: [0, 360],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="gradient-text">
            Música Geek
          </span>
        </motion.h1>
        
        <motion.p
          className="text-xl md:text-2xl mb-8 text-muted-foreground"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Descubra os melhores artistas da cena musical geek brasileira
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Button 
            size="lg" 
            className="px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transform transition-all duration-300 hover:scale-105"
          >
            <Play className="mr-2 h-5 w-5" />
            Explorar Artistas
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground transform transition-all duration-300"
          >
            <Headphones className="mr-2 h-5 w-5" />
            Ouça Agora
          </Button>
        </motion.div>

        {/* Floating Music Notes */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4"
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Music className="text-primary h-8 w-8" />
          </motion.div>
          
          <motion.div
            className="absolute bottom-1/4 right-1/4"
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <Music className="text-orange-500 h-6 w-6" />
          </motion.div>
          
          <motion.div
            className="absolute top-3/4 left-3/4"
            animate={{
              y: [0, -25, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <Music className="text-purple-600 h-5 w-5" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
