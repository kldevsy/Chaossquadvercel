import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Mic, PenTool, Drum, Sliders, Film, MessageCircle } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "todos", label: "Todos", fullLabel: "Todos os Artistas", icon: Music, color: "bg-gradient-to-r from-blue-500 to-purple-600" },
  { id: "cantor", label: "Cantores", fullLabel: "Cantores", icon: Mic, color: "bg-gradient-to-r from-pink-500 to-rose-600" },
  { id: "compositor", label: "Compositores", fullLabel: "Compositores", icon: PenTool, color: "bg-gradient-to-r from-orange-500 to-yellow-600" },
  { id: "beatmaker", label: "Beatmakers", fullLabel: "Beatmakers", icon: Drum, color: "bg-gradient-to-r from-purple-500 to-indigo-600" },
  { id: "mixer", label: "Mixers", fullLabel: "Mixers", icon: Sliders, color: "bg-gradient-to-r from-green-500 to-teal-600" },
  { id: "editor", label: "Editores", fullLabel: "Editores", icon: Film, color: "bg-gradient-to-r from-red-500 to-pink-600" },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <section className="py-12 border-b border-border/50 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-2 gradient-text">Explorar por Categoria</h2>
          <p className="text-muted-foreground">Encontre artistas por especialidade</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4">
          {tabs.map((tab, index) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className="relative"
              >
                <Button
                  variant="outline"
                  onClick={() => onTabChange(tab.id)}
                  className={`filter-tab px-6 py-4 text-sm font-medium rounded-2xl border-2 transition-all duration-500 group relative overflow-hidden ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/25 scale-105"
                      : "bg-card/80 backdrop-blur-sm hover:bg-card border-border/50 hover:border-primary/30 hover:shadow-lg"
                  }`}
                >
                  {/* Gradiente de fundo animado */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${tab.color} ${isActive ? 'opacity-100' : ''}`} />
                  
                  {/* Conteúdo do botão */}
                  <div className="relative flex items-center space-x-3">
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? "bg-white/20" 
                        : "bg-primary/10 group-hover:bg-primary/20"
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{tab.label}</div>
                      <div className="text-xs opacity-80 hidden sm:block">{tab.fullLabel}</div>
                    </div>
                  </div>

                  {/* Indicador ativo */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </div>
                </Button>

                {/* Badge com indicador ativo */}
                {isActive && (
                  <motion.div
                    className="absolute -top-2 -right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge className="bg-primary text-primary-foreground px-2 py-1 text-xs rounded-full shadow-lg">
                      ✨
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Linha decorativa */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
