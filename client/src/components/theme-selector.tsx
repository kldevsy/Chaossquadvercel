import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = availableThemes.find(t => t.name === theme);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative overflow-hidden bg-card border-border hover:bg-accent transition-all duration-300 hover:scale-105"
        >
          <Palette className="h-4 w-4" />
          <span className="sr-only">Escolher tema</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-6 theme-selector" align="end">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Escolher Tema</h3>
            <p className="text-sm text-muted-foreground">
              Personalize a aparência da plataforma
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {availableThemes.map((themeOption, index) => (
                <motion.div
                  key={themeOption.name}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: "easeOut" 
                  }}
                >
                  <Card 
                    className={`theme-option cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      theme === themeOption.name 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'hover:ring-1 hover:ring-primary/50'
                    }`}
                    onClick={() => {
                      setTheme(themeOption.name);
                      setIsOpen(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Preview das cores */}
                        <div className="flex space-x-1 h-3 rounded-full overflow-hidden">
                          <div 
                            className="flex-1 rounded-l-full"
                            style={{ backgroundColor: themeOption.colors.primary }}
                          />
                          <div 
                            className="flex-1"
                            style={{ backgroundColor: themeOption.colors.secondary }}
                          />
                          <div 
                            className="flex-1 rounded-r-full"
                            style={{ backgroundColor: themeOption.colors.accent }}
                          />
                        </div>

                        {/* Nome e descrição */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{themeOption.label}</h4>
                            {theme === themeOption.name && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Check className="h-4 w-4 text-primary" />
                              </motion.div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {themeOption.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {currentTheme && (
            <motion.div 
              className="pt-4 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Tema atual</p>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentTheme.colors.primary }}
                  />
                  <span className="text-sm font-medium">{currentTheme.label}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}