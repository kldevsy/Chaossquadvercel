import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "black" | "green" | "red" | "purple" | "blue" | "orange" | "pink" | "cyan" | "yellow" | "indigo" | "emerald" | "rose" | "neon" | "gold" | "matrix" | "cosmos" | "ocean" | "fire" | "aurora" | "custom" ;

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
  },
  {
    name: "matrix" as Theme,
    label: "Matrix",
    description: "Código digital verde com chuva de matriz",
    colors: { primary: "#00ff41", secondary: "#00cc33", accent: "#008f11" }
  },
  {
    name: "cosmos" as Theme,
    label: "Cosmos",
    description: "Universo profundo com estrelas cadentes",
    colors: { primary: "#6366f1", secondary: "#8b5cf6", accent: "#ec4899" }
  },
  {
    name: "ocean" as Theme,
    label: "Ocean",
    description: "Ondas do oceano com bioluminescência",
    colors: { primary: "#06b6d4", secondary: "#0891b2", accent: "#0e7490" }
  },
  {
    name: "fire" as Theme,
    label: "Fire",
    description: "Chamas dançantes em movimento",
    colors: { primary: "#f97316", secondary: "#ea580c", accent: "#dc2626" }
  },
  {
    name: "aurora" as Theme,
    label: "Aurora",
    description: "Aurora boreal com luzes dançantes",
    colors: { primary: "#10b981", secondary: "#8b5cf6", accent: "#06b6d4" }
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
    const body = document.body;

    // Remove todas as classes de tema do root e body
    availableThemes.forEach(t => {
      root.classList.remove(t.name);
      body.classList.remove(t.name);
    });
    
    // Limpa todos os estilos customizados antes de aplicar novo tema
    const customStyle = document.getElementById('custom-theme-style');
    if (customStyle) {
      customStyle.remove();
    }
    body.classList.remove('custom-theme-applied');
    
    // Remove todas as propriedades CSS customizadas para evitar interferência
    const customProps = ['--primary', '--secondary', '--accent', '--background', '--foreground', 
      '--card', '--card-foreground', '--border', '--input', '--ring', '--muted', '--muted-foreground',
      '--accent-foreground', '--destructive', '--destructive-foreground', '--popover', '--popover-foreground'];
    
    if (theme !== "custom") {
      customProps.forEach(prop => root.style.removeProperty(prop));
    }
    
    // Adiciona a classe do tema atual no root e body
    root.classList.add(theme);
    body.classList.add(theme);
    
    // Remove existing theme animations
    document.querySelectorAll('.theme-animation').forEach(el => el.remove());
    
    // Add specific theme animations
    if (theme === 'matrix') {
      const matrixBg = document.createElement('div');
      matrixBg.className = 'matrix-bg-animation theme-animation';
      document.body.appendChild(matrixBg);
      
      const matrixCode = document.createElement('div');
      matrixCode.className = 'matrix-code-animation theme-animation';
      matrixCode.textContent = '01101001011010010110111001100110011011110010000001101101011000010111010001110010011010010111100000100000011000010110111001101001011011010110000101110100011010010110111101101110001101000110100101100111011010010111010001100001011011000010000001110010011000010110100101101110001000000110000101101110011010010110110101100001011101000110100101101111011011100010000001100011011011110110010001100101001000000110011001100001011011000110110001101001011011100110011100100000011001100111001001101111011011010010000001110100011010000110010100100000011100110110101101111001';
      document.body.appendChild(matrixCode);
    } else if (theme === 'cosmos') {
      const cosmosBg = document.createElement('div');
      cosmosBg.className = 'cosmos-bg-animation theme-animation';
      document.body.appendChild(cosmosBg);
      
      const cosmosNebula = document.createElement('div');
      cosmosNebula.className = 'cosmos-nebula-animation theme-animation';
      document.body.appendChild(cosmosNebula);
    } else if (theme === 'ocean') {
      const oceanWaves = document.createElement('div');
      oceanWaves.className = 'ocean-waves-animation theme-animation';
      document.body.appendChild(oceanWaves);
      
      const oceanRipples = document.createElement('div');
      oceanRipples.className = 'ocean-ripples-animation theme-animation';
      document.body.appendChild(oceanRipples);
    } else if (theme === 'fire') {
      const fireFlames = document.createElement('div');
      fireFlames.className = 'fire-flames-animation theme-animation';
      document.body.appendChild(fireFlames);
      
      const fireEmbers = document.createElement('div');
      fireEmbers.className = 'fire-embers-animation theme-animation';
      document.body.appendChild(fireEmbers);
    } else if (theme === 'aurora') {
      const auroraLights = document.createElement('div');
      auroraLights.className = 'aurora-lights-animation theme-animation';
      document.body.appendChild(auroraLights);
      
      const auroraShimmer = document.createElement('div');
      auroraShimmer.className = 'aurora-shimmer-animation theme-animation';
      document.body.appendChild(auroraShimmer);
    }

    // Apply theme-specific configurations
    if (theme === "custom") {
      // Apply custom theme colors from localStorage
      const customColors = localStorage.getItem('custom-theme-colors');
      if (customColors) {
        try {
          const colors = JSON.parse(customColors);
          
          // Remove any existing custom style
          const existingStyle = document.getElementById('dynamic-custom-theme');
          if (existingStyle) {
            existingStyle.remove();
          }

          // Create dynamic CSS with high specificity for custom theme
          const customStyle = document.createElement('style');
          customStyle.id = 'dynamic-custom-theme';
          customStyle.innerHTML = `
            html.custom {
              --primary: ${colors.primary.replace('#', '')} !important;
              --secondary: ${colors.secondary.replace('#', '')} !important;
              --accent: ${colors.accent.replace('#', '')} !important;
              --background: ${colors.background.replace('#', '')} !important;
              --foreground: ${colors.foreground.replace('#', '')} !important;
            }
            
            .custom * {
              --primary: ${colors.primary.replace('#', '')} !important;
              --secondary: ${colors.secondary.replace('#', '')} !important;
              --accent: ${colors.accent.replace('#', '')} !important;
            }

            .custom .bg-primary { background-color: ${colors.primary} !important; }
            .custom .text-primary { color: ${colors.primary} !important; }
            .custom .border-primary { border-color: ${colors.primary} !important; }
            .custom .bg-secondary { background-color: ${colors.secondary} !important; }
            .custom .text-secondary { color: ${colors.secondary} !important; }
            .custom .bg-accent { background-color: ${colors.accent} !important; }
            .custom .text-accent { color: ${colors.accent} !important; }
            .custom .bg-background { background-color: ${colors.background} !important; }
            .custom .text-foreground { color: ${colors.foreground} !important; }
            
            .custom .gradient-text {
              background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}) !important;
              -webkit-background-clip: text !important;
              -webkit-text-fill-color: transparent !important;
              background-clip: text !important;
            }
          `;
          
          document.head.appendChild(customStyle);
          
          // Force re-render to apply changes immediately
          setTimeout(() => {
            const forceUpdate = document.createElement('div');
            forceUpdate.style.display = 'none';
            document.body.appendChild(forceUpdate);
            document.body.removeChild(forceUpdate);
          }, 0);
        } catch (e) {
          console.error('Error parsing custom theme colors:', e);
        }
      }
    } else {
      // Remove custom theme styles for predefined themes
      const customStyle = document.getElementById('dynamic-custom-theme');
      if (customStyle) {
        customStyle.remove();
      }
      
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
