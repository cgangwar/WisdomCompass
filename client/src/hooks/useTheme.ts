import { useState, useEffect, createContext, useContext } from "react";

type Theme = "auto" | "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useThemeLogic() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isDark, setIsDark] = useState(false);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("inspire-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to light mode
      setTheme("light");
    }
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement;
    
    let shouldBeDark = false;
    
    if (theme === "dark") {
      shouldBeDark = true;
    } else if (theme === "light") {
      shouldBeDark = false;
    } else {
      // Auto theme - use system preference
      shouldBeDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    
    if (shouldBeDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    setIsDark(shouldBeDark);
    localStorage.setItem("inspire-theme", theme);
  }, [theme]);

  // Listen for system theme changes when using auto mode
  useEffect(() => {
    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        const shouldBeDark = mediaQuery.matches;
        const root = document.documentElement;
        
        if (shouldBeDark) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
        
        setIsDark(shouldBeDark);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return { theme, setTheme, isDark };
}