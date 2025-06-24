import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Heart, Users, Sparkles, Play, Star, Zap, Gamepad2, Palette, MessageCircle, Crown, Headphones, Volume2, Mic, Radio } from "lucide-react";
import { useState, useEffect } from "react";

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const features = [
    {
      icon: Music,
      title: "Música Geek",
      description: "Descubra artistas únicos que criam sobre animes, games, filmes e toda cultura pop que você ama.",
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-blue-500/10",
      delay: 0.1
    },
    {
      icon: Heart,
      title: "Curta e Salve",
      description: "Curta seus artistas favoritos e mantenha uma coleção personalizada sempre à mão.",
      color: "from-pink-500 to-red-600",
      bgColor: "bg-pink-500/10",
      delay: 0.2
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Conecte-se com outros fãs e descubra novos talentos da cena musical geek.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-500/10",
      delay: 0.3
    },
    {
      icon: MessageCircle,
      title: "Chat em Tempo Real",
      description: "Converse com artistas e fãs em nossa plataforma de chat interativa.",
      color: "from-orange-500 to-yellow-600",
      bgColor: "bg-orange-500/10",
      delay: 0.4
    },
    {
      icon: Crown,
      title: "Painel Admin",
      description: "Gerencie artistas e projetos com ferramentas profissionais.",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-500/10",
      delay: 0.5
    },
    {
      icon: Palette,
      title: "22+ Temas",
      description: "Personalize sua experiência com nossa incrível variedade de temas.",
      color: "from-cyan-500 to-teal-600",
      bgColor: "bg-cyan-500/10",
      delay: 0.6
    }
  ];

  const stats = [
    { icon: Headphones, value: "1000+", label: "Artistas" },
    { icon: Volume2, value: "5000+", label: "Faixas" },
    { icon: Users, value: "10k+", label: "Usuários" },
    { icon: Star, value: "4.9", label: "Avaliação" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x / 80,
            y: mousePosition.y / 80,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ left: "10%", top: "20%" }}
        />
        <div
          className="absolute w-64 h-64 bg-gradient-to-r from-orange-400/15 to-pink-400/15 rounded-full blur-2xl"
          style={{ right: "15%", bottom: "30%" }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Music className="w-8 h-8 text-primary" />
              <motion.div
                className="absolute inset-0 border-2 border-primary/30 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chaos Squad
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
              <span className="relative z-10">Entrar</span>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 min-h-screen flex items-center">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ y, opacity }}
          >
            <div className="inline-block mb-6">
              <Badge variant="outline" className="text-lg px-6 py-2 bg-primary/10 border-primary/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Plataforma Musical Geek
              </Badge>
            </div>

            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Chaos Squad
              </span>
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              A plataforma definitiva para descobrir e curtir música geek. 
              Conecte-se com artistas que vivem a cultura pop, games, animes e muito mais.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = "/api/login"}
                  className="text-lg px-10 py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                  <Play className="mr-3 h-5 w-5" />
                  <span className="relative z-10">Entrar no Chaos Squad</span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-10 py-6 border-2 border-primary/40 bg-background/60 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                >
                  <Zap className="mr-3 h-5 w-5" />
                  Explorar Recursos
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center group cursor-pointer"
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Simplified Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => {
            const icons = [Gamepad2, Music, Star, Heart, Mic, Radio];
            const IconComponent = icons[i];
            const colors = ['text-primary/30', 'text-secondary/30', 'text-orange-400/30'];
            
            return (
              <motion.div
                key={i}
                className="absolute"
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                style={{
                  left: `${10 + (i * 15)}%`,
                  top: `${20 + (i * 10)}%`,
                }}
              >
                <IconComponent className={`w-5 h-5 ${colors[i % colors.length]}`} />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-6 px-4 py-2 bg-secondary/10 border-secondary/30">
              <Star className="w-4 h-4 mr-2" />
              Recursos Incríveis
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Por que Chaos Squad?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Uma experiência única e completa para os amantes da cultura geek e música de qualidade
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: feature.delay
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -8
                }}
                className="group cursor-pointer"
              >
                <Card className="h-full relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 bg-card/80 backdrop-blur-sm">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />
                  
                  <CardContent className="p-6 relative z-10">
                    <motion.div
                      className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-300" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold mb-4 text-center group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                  
                  {/* Simplified glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-primary/5 rounded-lg" />

                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"
          animate={{ 
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-8">
              <Sparkles className="w-20 h-20 text-primary mx-auto" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Pronto para a Aventura Musical?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Entre agora e descubra um universo de música geek, artistas incríveis e uma comunidade apaixonada esperando por você
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                size="lg" 
                onClick={() => window.location.href = "/api/login"}
                className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-white/20 transform rotate-45 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
                <Radio className="mr-4 h-6 w-6" />
                <span className="relative z-10">Começar Agora</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-primary/20 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            &copy; 2025 Chaos Squad. Feito com{" "}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-red-500"
            >
              ❤️
            </motion.span>{" "}
            para a comunidade geek.
          </motion.p>
        </div>
      </footer>
    </div>
  );
}