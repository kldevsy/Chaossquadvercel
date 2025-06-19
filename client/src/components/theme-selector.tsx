import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check, Settings } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import CustomThemeDialog from "@/components/custom-theme-dialog";

export function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);

  const currentTheme = availableThemes.find(t => t.name === theme);

  const handleCustomTheme = () => {
    setIsOpen(false);
    setCustomDialogOpen(true);
  };

  const handleSaveCustomTheme = (colors: any) => {
    // Apply custom theme colors to CSS variables
    const root = document.documentElement;
    
    // Convert hex to HSL for proper CSS variable format
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Remove existing custom styles
    const existingCustomStyle = document.getElementById('custom-theme-style');
    if (existingCustomStyle) {
      existingCustomStyle.remove();
    }

    // Create targeted custom theme CSS that excludes menus
    const customStyle = document.createElement('style');
    customStyle.id = 'custom-theme-style';
    
    const isLight = parseInt(colors.background.slice(1, 3), 16) > 128;
    
    customStyle.textContent = `
      /* Apply custom theme only to main content areas, exclude popover menus */
      body:not([data-theme-menu-open]) {
        --primary: ${hexToHsl(colors.primary)};
        --secondary: ${hexToHsl(colors.secondary)};
        --accent: ${hexToHsl(colors.accent)};
        --background: ${hexToHsl(colors.background)};
        --foreground: ${hexToHsl(colors.foreground)};
        --card: ${isLight ? '0 0% 100%' : '224 71% 4%'};
        --card-foreground: ${hexToHsl(colors.foreground)};
        --border: ${isLight ? '214 32% 91%' : '215 27% 17%'};
        --input: ${isLight ? '214 32% 91%' : '215 27% 17%'};
        --ring: ${hexToHsl(colors.primary)};
        --muted: ${isLight ? '210 40% 96%' : '223 47% 11%'};
        --muted-foreground: ${isLight ? '215 13% 45%' : '215 11% 65%'};
        --accent-foreground: ${isLight ? '210 40% 98%' : '210 40% 98%'};
      }
      
      /* Exclude theme selector popover and custom theme dialog from custom colors */
      [data-radix-popper-content-wrapper],
      [role="dialog"],
      .theme-selector,
      [data-state="open"] {
        --primary: 200 100% 60% !important;
        --secondary: 270 95% 75% !important;
        --accent: 210 40% 98% !important;
        --background: 0 0% 100% !important;
        --foreground: 222 84% 4.9% !important;
        --card: 0 0% 100% !important;
        --border: 214 32% 91% !important;
        --popover: 0 0% 100% !important;
        --popover-foreground: 222 84% 4.9% !important;
      }
    `;
    
    document.head.appendChild(customStyle);
    
    setTheme('custom');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            size="icon"
            className="relative overflow-hidden bg-card border-border hover:bg-accent transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <motion.div
              animate={{ 
                rotate: isOpen ? 180 : 0,
                scale: isOpen ? 1.1 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <Palette className="h-4 w-4" />
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-0"
              animate={{ opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="sr-only">Escolher tema</span>
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-6 theme-selector shadow-2xl border-2" align="end">
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center">
            <motion.h3 
              className="text-lg font-semibold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              🎨 Escolher Tema
            </motion.h3>
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Personalize a aparência da sua experiência musical
            </motion.p>
            
            {/* Current Theme Display */}
            <motion.div
              className="mt-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <p className="text-xs font-medium text-muted-foreground mb-1">Tema Atual</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="flex space-x-1">
                  <div 
                    className="w-3 h-3 rounded-full border border-primary/30"
                    style={{ backgroundColor: currentTheme?.colors.primary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-secondary/30"
                    style={{ backgroundColor: currentTheme?.colors.secondary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-accent/30"
                    style={{ backgroundColor: currentTheme?.colors.accent }}
                  />
                </div>
                <span className="text-sm font-semibold">{currentTheme?.label}</span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-background scrollbar-thumb-primary/20">
            <AnimatePresence>
              {availableThemes.map((themeOption, index) => (
                <motion.div
                  key={themeOption.name}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.03,
                    ease: "easeOut" 
                  }}
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.08, 
                      y: -4,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card 
                      className={`theme-option cursor-pointer transition-all duration-300 hover:shadow-xl backdrop-blur-sm ${
                        theme === themeOption.name 
                          ? 'ring-2 ring-primary shadow-xl scale-105 bg-primary/5' 
                          : 'hover:ring-1 hover:ring-primary/50 hover:bg-accent/30'
                      }`}
                      onClick={() => {
                        if (themeOption.name === 'custom') {
                          handleCustomTheme();
                        } else {
                          setTheme(themeOption.name);
                          setTimeout(() => setIsOpen(false), 200);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Preview das cores melhorado */}
                          <motion.div 
                            className="flex space-x-1 h-5 rounded-lg overflow-hidden shadow-md border border-white/20"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <motion.div 
                              className="flex-1 rounded-l-lg"
                              style={{ backgroundColor: themeOption.colors.primary }}
                              whileHover={{ filter: "brightness(1.1)" }}
                            />
                            <motion.div 
                              className="flex-1"
                              style={{ backgroundColor: themeOption.colors.secondary }}
                              whileHover={{ filter: "brightness(1.1)" }}
                            />
                            <motion.div 
                              className="flex-1 rounded-r-lg"
                              style={{ backgroundColor: themeOption.colors.accent }}
                              whileHover={{ filter: "brightness(1.1)" }}
                            />
                          </motion.div>

                          {/* Nome e check */}
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm truncate">{themeOption.label}</h4>
                            <AnimatePresence>
                              {theme === themeOption.name && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                  exit={{ scale: 0, rotate: 180, opacity: 0 }}
                                  transition={{ duration: 0.4, type: "spring", bounce: 0.5 }}
                                >
                                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {themeOption.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </PopoverContent>
      
      <CustomThemeDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        onSaveTheme={handleSaveCustomTheme}
      />
    </Popover>
  );
}