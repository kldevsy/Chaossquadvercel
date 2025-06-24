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
          className="absolute w-96 h-96 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x / 50,
            y: mousePosition.y / 50,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ left: "10%", top: "20%" }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-full blur-2xl"
          animate={{
            x: -mousePosition.x / 30,
            y: -mousePosition.y / 30,
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
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
            <motion.div
              className="inline-block mb-6"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 40px rgba(139, 92, 246, 0.4)",
                  "0 0 20px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Badge variant="outline" className="text-lg px-6 py-2 bg-primary/10 border-primary/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Plataforma Musical Geek
              </Badge>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span 
                className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-300% animate-pulse"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                Chaos Squad
              </motion.span>
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
                  <motion.div
                    className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3 group-hover:bg-primary/20 transition-colors duration-300"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <stat.icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements - Enhanced */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => {
            const icons = [Gamepad2, Music, Star, Heart, Mic, Radio];
            const IconComponent = icons[i % icons.length];
            const colors = ['text-primary/40', 'text-secondary/40', 'text-orange-400/40', 'text-pink-400/40', 'text-green-400/40', 'text-purple-400/40'];
            
            return (
              <motion.div
                key={i}
                className="absolute"
                animate={{
                  y: [0, -40 - (i * 5), 0],
                  x: [0, 30 - (i * 3), 0],
                  rotate: [0, 360],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 6 + (i * 0.5),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
                style={{
                  left: `${5 + (i * 8)}%`,
                  top: `${15 + (i * 7)}%`,
                }}
              >
                <IconComponent className={`w-${4 + (i % 3)} h-${4 + (i % 3)} ${colors[i % colors.length]}`} />
              </motion.div>
            );
          })}
          
          {/* Additional particle effects */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full opacity-30"
              animate={{
                y: [0, -100, -200, -100, 0],
                x: [0, 50, -30, 20, 0],
                scale: [0, 1, 0.5, 1, 0],
                opacity: [0, 0.6, 0.8, 0.4, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 1,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
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
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8, 
                  delay: feature.delay,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.08, 
                  y: -15,
                  rotateY: 5,
                  boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.4)"
                }}
                className="group cursor-pointer perspective-1000"
              >
                <Card className="h-full relative overflow-hidden border-2 hover:border-primary/60 transition-all duration-500 bg-card/90 backdrop-blur-md shimmer hover-lift">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />
                  
                  {/* Animated border */}
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: `linear-gradient(45deg, ${feature.color.includes('blue') ? '#3b82f6' : feature.color.includes('pink') ? '#ec4899' : feature.color.includes('green') ? '#10b981' : feature.color.includes('orange') ? '#f97316' : feature.color.includes('purple') ? '#8b5cf6' : '#06b6d4'}, transparent, ${feature.color.includes('blue') ? '#8b5cf6' : feature.color.includes('pink') ? '#ef4444' : feature.color.includes('green') ? '#059669' : feature.color.includes('orange') ? '#ea580c' : feature.color.includes('purple') ? '#7c3aed' : '#0891b2'})`,
                      padding: '2px',
                    }}
                  />
                  
                  <CardContent className="p-8 relative z-10 bg-card/95 rounded-lg m-[2px]">
                    <motion.div
                      className={`w-20 h-20 ${feature.bgColor} rounded-3xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden group-hover:shadow-lg`}
                      whileHover={{ 
                        scale: 1.2,
                        rotate: 360,
                        backgroundColor: feature.color.includes('blue') ? 'rgba(59, 130, 246, 0.2)' : feature.color.includes('pink') ? 'rgba(236, 72, 153, 0.2)' : feature.color.includes('green') ? 'rgba(16, 185, 129, 0.2)' : feature.color.includes('orange') ? 'rgba(249, 115, 22, 0.2)' : feature.color.includes('purple') ? 'rgba(139, 92, 246, 0.2)' : 'rgba(6, 182, 212, 0.2)'
                      }}
                      transition={{ duration: 0.6, type: "spring" }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                      />
                      <feature.icon className="w-10 h-10 text-primary group-hover:text-white transition-colors duration-300 relative z-10" />
                      
                      {/* Orbiting particles */}
                      <motion.div
                        className="absolute w-2 h-2 bg-primary rounded-full"
                        animate={{
                          rotate: [0, 360],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        style={{
                          transformOrigin: "25px 25px",
                          top: "calc(50% - 1px)",
                          left: "calc(50% - 1px)"
                        }}
                      />
                    </motion.div>
                    
                    <motion.h3 
                      className="text-xl font-bold mb-4 text-center group-hover:text-primary transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      {feature.title}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-muted-foreground text-center leading-relaxed"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {feature.description}
                    </motion.p>
                  </CardContent>
                  
                  {/* Dynamic glow effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${feature.color.includes('blue') ? 'rgba(59, 130, 246, 0.15)' : feature.color.includes('pink') ? 'rgba(236, 72, 153, 0.15)' : feature.color.includes('green') ? 'rgba(16, 185, 129, 0.15)' : feature.color.includes('orange') ? 'rgba(249, 115, 22, 0.15)' : feature.color.includes('purple') ? 'rgba(139, 92, 246, 0.15)' : 'rgba(6, 182, 212, 0.15)'} 0%, transparent 70%)`
                    }}
                  />
                  
                  {/* Sparkle effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {[...Array(3)].map((_, sparkleIndex) => (
                      <motion.div
                        key={sparkleIndex}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: sparkleIndex * 0.5,
                        }}
                        style={{
                          left: `${20 + sparkleIndex * 25}%`,
                          top: `${15 + sparkleIndex * 20}%`,
                        }}
                      />
                    ))}
                  </div>
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
            <motion.div
              className="inline-block mb-8"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-20 h-20 text-primary mx-auto" />
            </motion.div>
            
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