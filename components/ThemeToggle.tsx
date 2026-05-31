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
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-(--text)/55">
        <div className="w-[18px] h-[18px]" />
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-(--text)/70 hover:bg-(--border) hover:text-(--text) transition-colors"
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-[16px] h-[16px] shrink-0" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="w-[16px] h-[16px] shrink-0" />
          Dark Mode
        </>
      )}
    </button>
  );
}
