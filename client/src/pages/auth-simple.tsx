import { useState } from "react";
import { useAuth } from "@/hooks/useAuthFinal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Users, MessageCircle, Palette, GamepadIcon, Headphones, Loader2, Sparkles } from "lucide-react";

export default function AuthPageSimple() {
  const [, setLocation] = useLocation();
  const { user, login, register, isAuthenticated, isLoading } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
  });
  const [authLoading, setAuthLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    console.log('AuthPage: Authentication state changed:', { isAuthenticated, user: user?.username });
    if (isAuthenticated && !isLoading) {
      console.log('AuthPage: Redirecting to home');
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await login(loginData.username, loginData.password);
      console.log('Login successful, redirecting...');
      setLocation("/");
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await register(
        registerData.username,
        registerData.password,
        registerData.email,
        registerData.firstName,
        registerData.lastName
      );
      console.log('Registration successful, redirecting...');
      setLocation("/");
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if already authenticated (prevent flash)
  if (isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: Users,
      title: "Centenas de Artistas",
      description: "Descubra talentos da cultura geek",
    },
    {
      icon: Music,
      title: "Projetos Colaborativos",
      description: "Acompanhe criações musicais únicas",
    },
    {
      icon: MessageCircle,
      title: "Chat em Tempo Real",
      description: "Conecte-se com a comunidade",
    },
    {
      icon: Palette,
      title: "22+ Temas Visuais",
      description: "Personalize sua experiência",
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Left side - Features showcase */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" />
        
        {/* Floating background elements */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              GeeKTunes
            </h1>
            <p className="text-xl text-muted-foreground mt-4">
              A plataforma definitiva para descoberta musical geek
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex items-center space-x-4 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <div className="flex-shrink-0">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="text-sm font-medium">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="text-sm font-medium">
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-card/80 backdrop-blur-xl border-border/30 shadow-2xl">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center">
                    Bem-vindo de volta!
                  </CardTitle>
                  <CardDescription className="text-center">
                    Entre na sua conta para continuar explorando
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Usuário</Label>
                      <Input
                        id="login-username"
                        value={loginData.username}
                        onChange={(e) =>
                          setLoginData({ ...loginData, username: e.target.value })
                        }
                        placeholder="Digite seu usuário"
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({ ...loginData, password: e.target.value })
                        }
                        placeholder="Digite sua senha"
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-all duration-200"
                      disabled={authLoading}
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="bg-card/80 backdrop-blur-xl border-border/30 shadow-2xl">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center">
                    Junte-se à comunidade!
                  </CardTitle>
                  <CardDescription className="text-center">
                    Crie sua conta e descubra novos artistas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName">Nome</Label>
                        <Input
                          id="register-firstName"
                          value={registerData.firstName}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, firstName: e.target.value })
                          }
                          placeholder="Seu nome"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastName">Sobrenome</Label>
                        <Input
                          id="register-lastName"
                          value={registerData.lastName}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, lastName: e.target.value })
                          }
                          placeholder="Seu sobrenome"
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Usuário</Label>
                      <Input
                        id="register-username"
                        value={registerData.username}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, username: e.target.value })
                        }
                        placeholder="Escolha um usuário"
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, email: e.target.value })
                        }
                        placeholder="seu@email.com"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, password: e.target.value })
                        }
                        placeholder="Crie uma senha"
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-secondary-foreground font-medium py-2 px-4 rounded-md transition-all duration-200"
                      disabled={authLoading}
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        'Criar Conta'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Demo credentials hint */}
          <motion.div
            className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-sm text-muted-foreground text-center">
              <Sparkles className="inline w-4 h-4 mr-1" />
              Para testar: usuário <code className="bg-background px-1 rounded">demo</code> senha <code className="bg-background px-1 rounded">demo123</code>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}