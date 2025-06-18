import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "black" | "green" | "red" | "purple" | "blue" | "orange" | "pink" | "cyan" | "yellow" | "indigo" | "emerald" | "rose";

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
    
    // Adiciona a classe do tema atual
    root.classList.add(theme);

    // Define as variáveis CSS customizadas para o tema
    const themeConfig = availableThemes.find(t => t.name === theme);
    if (themeConfig) {
      root.style.setProperty('--theme-primary', themeConfig.colors.primary);
      root.style.setProperty('--theme-secondary', themeConfig.colors.secondary);
      root.style.setProperty('--theme-accent', themeConfig.colors.accent);
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
