import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { createThemeToggle } from "@/lib/theme-integration";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className, variant = "ghost", size = "icon", ...props }) {
  const { theme, setTheme, themes, isThemeReady } = useTheme();

  const handleToggle = React.useMemo(
    () => createThemeToggle(setTheme, theme, themes),
    [setTheme, theme, themes]
  );

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Moon className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return themes.includes('system') ? 'Switch to system mode' : 'Switch to light mode';
      case 'system':
        return 'Switch to light mode';
      default:
        return 'Toggle theme';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={!isThemeReady}
      className={cn(
        "transition-all duration-200",
        !isThemeReady && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={getLabel()}
      title={getLabel()}
      {...props}
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
}

export function ThemeToggleDropdown({ className, ...props }) {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      <span className="text-sm font-medium text-muted-foreground mb-2">Theme</span>
      {themes.map((themeOption) => (
        <Button
          key={themeOption}
          variant={theme === themeOption ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme(themeOption)}
          className="justify-start gap-2 capitalize"
        >
          {themeOption === 'light' && <Sun className="h-4 w-4" />}
          {themeOption === 'dark' && <Moon className="h-4 w-4" />}
          {themeOption === 'system' && <Monitor className="h-4 w-4" />}
          {themeOption}
        </Button>
      ))}
    </div>
  );
}