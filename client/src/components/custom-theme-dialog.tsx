import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette, Save, RotateCcw } from "lucide-react";

interface CustomThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveTheme: (colors: CustomThemeColors) => void;
}

interface CustomThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

const defaultColors: CustomThemeColors = {
  primary: "#3b82f6",
  secondary: "#8b5cf6", 
  accent: "#06b6d4",
  background: "#ffffff",
  foreground: "#0f172a"
};

const colorPresets = [
  { name: "Azul Oceano", colors: { primary: "#0ea5e9", secondary: "#06b6d4", accent: "#0891b2", background: "#ffffff", foreground: "#0f172a" } },
  { name: "Rosa Vibrante", colors: { primary: "#ec4899", secondary: "#f97316", accent: "#ef4444", background: "#ffffff", foreground: "#0f172a" } },
  { name: "Verde Natureza", colors: { primary: "#10b981", secondary: "#84cc16", accent: "#22c55e", background: "#ffffff", foreground: "#0f172a" } },
  { name: "Roxo Místico", colors: { primary: "#8b5cf6", secondary: "#a855f7", accent: "#c084fc", background: "#000000", foreground: "#ffffff" } },
  { name: "Dourado Real", colors: { primary: "#f59e0b", secondary: "#eab308", accent: "#fbbf24", background: "#ffffff", foreground: "#0f172a" } },
  { name: "Ciano Neon", colors: { primary: "#06b6d4", secondary: "#14b8a6", accent: "#0891b2", background: "#000000", foreground: "#ffffff" } }
];

export default function CustomThemeDialog({ open, onOpenChange, onSaveTheme }: CustomThemeDialogProps) {
  const [colors, setColors] = useState<CustomThemeColors>(defaultColors);

  const handleColorChange = (colorKey: keyof CustomThemeColors, value: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setColors(preset.colors);
  };

  const resetToDefault = () => {
    setColors(defaultColors);
  };

  const handleSave = () => {
    onSaveTheme(colors);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-5 h-5" />
            Personalizar Tema
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Color Preview */}
          <div className="p-6 rounded-lg border-2 border-border bg-gradient-to-br from-background via-background to-secondary/5">
            <div className="text-center space-y-4">
              <div 
                className="w-16 h-16 rounded-full mx-auto shadow-lg border-4 border-white"
                style={{ backgroundColor: colors.primary }}
              />
              <div className="flex justify-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full shadow-md"
                  style={{ backgroundColor: colors.secondary }}
                />
                <div 
                  className="w-8 h-8 rounded-full shadow-md"
                  style={{ backgroundColor: colors.accent }}
                />
              </div>
              <div 
                className="p-4 rounded-lg shadow-inner"
                style={{ backgroundColor: colors.background, color: colors.foreground }}
              >
                <h3 className="font-semibold">Preview do Tema</h3>
                <p className="text-sm opacity-75">Este é um exemplo de como ficará o tema</p>
              </div>
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Temas Prontos</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {colorPresets.map((preset, index) => (
                <motion.button
                  key={preset.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => applyPreset(preset)}
                  className="p-2 sm:p-3 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 group bg-card"
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div 
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.colors.secondary }}
                    />
                    <div 
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.colors.accent }}
                    />
                  </div>
                  <span className="text-xs font-medium group-hover:text-primary transition-colors block">
                    {preset.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Cores Personalizadas</Label>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary" className="text-sm">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary"
                    type="color"
                    value={colors.primary}
                    onChange={(e) => handleColorChange("primary", e.target.value)}
                    className="w-12 sm:w-16 h-8 sm:h-10 p-1 border-2"
                  />
                  <Input
                    type="text"
                    value={colors.primary}
                    onChange={(e) => handleColorChange("primary", e.target.value)}
                    className="flex-1 text-sm"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary" className="text-sm">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary"
                    type="color"
                    value={colors.secondary}
                    onChange={(e) => handleColorChange("secondary", e.target.value)}
                    className="w-12 sm:w-16 h-8 sm:h-10 p-1 border-2"
                  />
                  <Input
                    type="text"
                    value={colors.secondary}
                    onChange={(e) => handleColorChange("secondary", e.target.value)}
                    className="flex-1 text-sm"
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent" className="text-sm">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent"
                    type="color"
                    value={colors.accent}
                    onChange={(e) => handleColorChange("accent", e.target.value)}
                    className="w-12 sm:w-16 h-8 sm:h-10 p-1 border-2"
                  />
                  <Input
                    type="text"
                    value={colors.accent}
                    onChange={(e) => handleColorChange("accent", e.target.value)}
                    className="flex-1 text-sm"
                    placeholder="#06b6d4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background" className="text-sm">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    id="background"
                    type="color"
                    value={colors.background}
                    onChange={(e) => handleColorChange("background", e.target.value)}
                    className="w-12 sm:w-16 h-8 sm:h-10 p-1 border-2"
                  />
                  <Input
                    type="text"
                    value={colors.background}
                    onChange={(e) => handleColorChange("background", e.target.value)}
                    className="flex-1 text-sm"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="foreground" className="text-sm">Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    id="foreground"
                    type="color"
                    value={colors.foreground}
                    onChange={(e) => handleColorChange("foreground", e.target.value)}
                    className="w-12 sm:w-16 h-8 sm:h-10 p-1 border-2"
                  />
                  <Input
                    type="text"
                    value={colors.foreground}
                    onChange={(e) => handleColorChange("foreground", e.target.value)}
                    className="flex-1 text-sm"
                    placeholder="#0f172a"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={resetToDefault}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar Padrão
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-primary to-secondary text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Tema
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}