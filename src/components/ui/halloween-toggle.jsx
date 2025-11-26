import * as React from "react";
import { Ghost } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "../ThemeProvider";
import { cn } from "../../lib/utils";

export function HalloweenToggle({ 
  className, 
  variant = "ghost", 
  size = "icon",
  showLabel = false,
  ...props 
}) {
  const { halloweenMode, setHalloweenMode, isThemeReady } = useTheme();

  const handleToggle = () => {
    setHalloweenMode(!halloweenMode);
  };

  const getLabel = () => {
    return halloweenMode 
      ? 'Disable Halloween theme' 
      : 'Enable Halloween theme';
  };

  const getAriaPressed = () => {
    return halloweenMode;
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={!isThemeReady}
      className={cn(
        "transition-all duration-[120ms]",
        "hover:scale-105 focus-visible:scale-105",
        "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100",
        !isThemeReady && "opacity-50 cursor-not-allowed",
        halloweenMode && "text-orange-500 dark:text-orange-400",
        className
      )}
      aria-label={getLabel()}
      aria-pressed={getAriaPressed()}
      role="switch"
      title={getLabel()}
      {...props}
    >
      <Ghost 
        className={cn(
          "h-4 w-4 transition-all duration-[120ms]",
          "motion-reduce:transition-none",
          halloweenMode && "fill-current"
        )} 
      />
      {showLabel && (
        <span className="ml-2 text-sm">
          {halloweenMode ? 'Halloween' : 'Normal'}
        </span>
      )}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
}
