import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Users, MessageCircle, Palette, GamepadIcon, Headphones, Loader2, Sparkles } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation, isAuthenticated } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const features = [
    {
      icon: Users,
      title: "Centenas de Artistas",
      description: "Descubra talentos da cultura geek",
      color: "text-blue-500"
    },
    {
      icon: GamepadIcon,
      title: "Música de Games",
      description: "Soundtracks e remixes épicos",
      color: "text-green-500"
    },
    {
      icon: Headphones,
      title: "Preview Instantâneo",
      description: "Ouça samples com um clique",
      color: "text-purple-500"
    },
    {
      icon: MessageCircle,
      title: "Chat em Tempo Real",
      description: "Conecte-se com outros fãs",
      color: "text-pink-500"
    },
    {
      icon: Palette,
      title: "25+ Temas",
      description: "Personalize sua experiência",
      color: "text-orange-500"
    },
    {
      icon: Sparkles,
      title: "Sempre Atualizado",
      description: "Novos artistas toda semana",
      color: "text-cyan-500"
    }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-3/4 left-1/2 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 text-center lg:text-left"
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto lg:mx-0 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Music className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold tracking-tight"
            >
              Bem-vindo ao <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GeeKTunes</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              A plataforma definitiva para descobrir artistas da cultura geek e gaming
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all duration-200 group"
              >
                <feature.icon className={`w-6 h-6 mb-2 ${feature.color} group-hover:scale-110 transition-transform`} />
                <h3 className="font-semibold text-sm text-foreground mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Auth Forms */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
              <CardDescription className="text-base">
                Entre ou crie uma nova conta para começar sua jornada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-card/50 backdrop-blur-sm">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Cadastrar
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="login-username" className="text-base font-medium">Usuário</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Digite seu nome de usuário"
                        className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-base font-medium">Senha</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Digite sua senha"
                        className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName" className="text-sm font-medium">Nome</Label>
                        <Input
                          id="register-firstName"
                          type="text"
                          placeholder="Seu nome"
                          className="h-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastName" className="text-sm font-medium">Sobrenome</Label>
                        <Input
                          id="register-lastName"
                          type="text"
                          placeholder="Seu sobrenome"
                          className="h-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-base font-medium">Usuário</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Escolha um nome único"
                        className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-base font-medium">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-base font-medium">Senha</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Crie uma senha forte"
                        className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        "Criar conta"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}