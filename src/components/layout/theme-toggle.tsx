"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration guard for next-themes
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-full p-2" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full p-2 hover:bg-surface"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
