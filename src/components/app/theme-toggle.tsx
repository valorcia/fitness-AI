"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className={cn("h-9 w-24 rounded-full bg-muted", className)} aria-hidden />;
  }
  const active = theme ?? "system";
  const options = [
    { key: "light", Icon: Sun, label: "Clair" },
    { key: "dark", Icon: Moon, label: "Sombre" },
    { key: "system", Icon: Monitor, label: "Auto" },
  ] as const;
  return (
    <div
      role="radiogroup"
      aria-label="Thème"
      className={cn("inline-flex items-center gap-1 rounded-full bg-muted p-1", className)}
    >
      {options.map(({ key, Icon, label }) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={active === key}
          onClick={() => setTheme(key)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
            active === key
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground hover:text-foreground",
          )}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" /> {label}
        </button>
      ))}
      {resolvedTheme && active === "system" && (
        <span className="sr-only">Actuel : {resolvedTheme}</span>
      )}
    </div>
  );
}
