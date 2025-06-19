import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "black" | "green" | "red" | "purple" | "blue" | "orange" | "pink" | "cyan" | "yellow" | "indigo" | "emerald" | "rose" | "neon" | "gold" | "custom";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: Array<{
    name: Theme;
    label: string;
    description: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  }>;
};

const availableThemes = [
  {
    name: "light" as Theme,
    label: "Claro",
    description: "Tema claro padrão",
    colors: { primary: "#3b82f6", secondary: "#8b5cf6", accent: "#06b6d4" }
  },
  {
    name: "dark" as Theme,
    label: "Escuro",
    description: "Tema escuro padrão",
    colors: { primary: "#3b82f6", secondary: "#8b5cf6", accent: "#06b6d4" }
  },
  {
    name: "black" as Theme,
    label: "Black",
    description: "Preto e branco puro",
    colors: { primary: "#ffffff", secondary: "#000000", accent: "#666666" }
  },
  {
    name: "green" as Theme,
    label: "Green",
    description: "Verde vibrante",
    colors: { primary: "#22c55e", secondary: "#16a34a", accent: "#15803d" }
  },
  {
    name: "red" as Theme,
    label: "Red",
    description: "Vermelho intenso",
    colors: { primary: "#ef4444", secondary: "#dc2626", accent: "#b91c1c" }
  },
  {
    name: "purple" as Theme,
    label: "Purple",
    description: "Roxo elegante",
    colors: { primary: "#8b5cf6", secondary: "#7c3aed", accent: "#6d28d9" }
  },
  {
    name: "blue" as Theme,
    label: "Blue",
    description: "Azul profundo",
    colors: { primary: "#3b82f6", secondary: "#2563eb", accent: "#1d4ed8" }
  },
  {
    name: "orange" as Theme,
    label: "Orange",
    description: "Laranja energético",
    colors: { primary: "#f97316", secondary: "#ea580c", accent: "#c2410c" }
  },
  {
    name: "pink" as Theme,
    label: "Pink",
    description: "Rosa moderno",
    colors: { primary: "#ec4899", secondary: "#db2777", accent: "#be185d" }
  },
  {
    name: "cyan" as Theme,
    label: "Cyan",
    description: "Ciano refrescante",
    colors: { primary: "#06b6d4", secondary: "#0891b2", accent: "#0e7490" }
  },
  {
    name: "yellow" as Theme,
    label: "Yellow",
    description: "Amarelo brilhante",
    colors: { primary: "#eab308", secondary: "#ca8a04", accent: "#a16207" }
  },
  {
    name: "indigo" as Theme,
    label: "Indigo",
    description: "Índigo místico",
    colors: { primary: "#6366f1", secondary: "#4f46e5", accent: "#4338ca" }
  },
  {
    name: "emerald" as Theme,
    label: "Emerald",
    description: "Esmeralda luxuoso",
    colors: { primary: "#10b981", secondary: "#059669", accent: "#047857" }
  },
  {
    name: "rose" as Theme,
    label: "Rose",
    description: "Rosa suave",
    colors: { primary: "#f43f5e", secondary: "#e11d48", accent: "#be123c" }
  },
  {
    name: "neon" as Theme,
    label: "Neon",
    description: "Ciano neon vibrante",
    colors: { primary: "#00ffff", secondary: "#00e6e6", accent: "#00cccc" }
  },
  {
    name: "gold" as Theme,
    label: "Gold",
    description: "Dourado elegante",
    colors: { primary: "#ffd700", secondary: "#ffcc00", accent: "#e6b800" }
  },
  {
    name: "custom" as Theme,
    label: "Custom",
    description: "Personalizável profissional",
    colors: { primary: "#3b82f6", secondary: "#1d4ed8", accent: "#1e40af" }
  }
];

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
  availableThemes: availableThemes,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "geektunes-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove todas as classes de tema
    availableThemes.forEach(t => root.classList.remove(t.name));
    
    // Limpa todos os estilos customizados antes de aplicar novo tema
    const customStyle = document.getElementById('custom-theme-style');
    if (customStyle) {
      customStyle.remove();
    }
    document.body.classList.remove('custom-theme-applied');
    
    // Remove todas as propriedades CSS customizadas para evitar interferência
    const customProps = ['--primary', '--secondary', '--accent', '--background', '--foreground', 
      '--card', '--card-foreground', '--border', '--input', '--ring', '--muted', '--muted-foreground',
      '--accent-foreground', '--destructive', '--destructive-foreground', '--popover', '--popover-foreground'];
    
    if (theme !== "custom") {
      customProps.forEach(prop => root.style.removeProperty(prop));
    }
    
    // Adiciona a classe do tema atual
    root.classList.add(theme);

    // Apply theme-specific configurations
    if (theme === "custom") {
      // Apply custom theme colors from localStorage
      const customColors = localStorage.getItem('custom-theme-colors');
      if (customColors) {
        try {
          const colors = JSON.parse(customColors);
          
          // Convert hex to HSL for CSS variables
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

          // Apply custom colors
          const isLight = parseInt(colors.background.slice(1, 3), 16) > 128;
          
          root.style.setProperty('--primary', hexToHsl(colors.primary));
          root.style.setProperty('--secondary', hexToHsl(colors.secondary));
          root.style.setProperty('--accent', hexToHsl(colors.accent));
          root.style.setProperty('--background', hexToHsl(colors.background));
          root.style.setProperty('--foreground', hexToHsl(colors.foreground));
          root.style.setProperty('--card', isLight ? '0 0% 100%' : '224 71% 4%');
          root.style.setProperty('--card-foreground', hexToHsl(colors.foreground));
          root.style.setProperty('--border', isLight ? '214 32% 91%' : '215 27% 17%');
          root.style.setProperty('--input', isLight ? '214 32% 91%' : '215 27% 17%');
          root.style.setProperty('--ring', hexToHsl(colors.primary));
          root.style.setProperty('--muted', isLight ? '210 40% 96%' : '223 47% 11%');
          root.style.setProperty('--muted-foreground', isLight ? '215 13% 45%' : '215 11% 65%');
          root.style.setProperty('--accent-foreground', isLight ? '210 40% 98%' : '210 40% 98%');
        } catch (e) {
          console.error('Error parsing custom theme colors:', e);
        }
      }
    } else {
      // Apply predefined theme colors
      const themeConfig = availableThemes.find(t => t.name === theme);
      if (themeConfig) {
        root.style.setProperty('--theme-primary', themeConfig.colors.primary);
        root.style.setProperty('--theme-secondary', themeConfig.colors.secondary);
        root.style.setProperty('--theme-accent', themeConfig.colors.accent);
      }
    }
  }, [theme]);

  const value = {
    theme,
    availableThemes,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
