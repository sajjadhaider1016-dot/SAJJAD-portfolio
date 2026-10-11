"use client";

import { type ReactNode, useEffect } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === null) {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else if (stored === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);
  return children;
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const next = isDark ? "light" : "dark";
  document.documentElement.classList.toggle("dark", next === "dark");
  document.documentElement.classList.toggle("light", next === "light");
  window.localStorage.setItem("theme", next);
}
