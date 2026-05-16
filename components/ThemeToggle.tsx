"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-(--text)/55">
        <div className="w-[18px] h-[18px]" />
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-(--text)/55 hover:bg-(--border)/60 hover:text-(--text) transition-all duration-200"
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-[18px] h-[18px] shrink-0" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="w-[18px] h-[18px] shrink-0" />
          Dark Mode
        </>
      )}
    </button>
  );
}
