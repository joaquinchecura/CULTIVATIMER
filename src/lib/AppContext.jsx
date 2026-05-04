import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "es");
  const [theme, setTheme] = useState(() => localStorage.getItem("app_theme") || "dark");

  // Apply theme
  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  // Persist language
  useEffect(() => {
    localStorage.setItem("app_lang", lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] ?? translations["es"][key] ?? key;

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}