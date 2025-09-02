import * as React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useThemeTest } from "@/hooks/useThemeTest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

export function ThemeTest() {
  const { theme, resolvedTheme, isThemeReady, themeConsistency } = useTheme();
  const { testResults, cycleThemes, getThemeStatus, isTestingComplete } = useThemeTest();
  const [performanceTest, setPerformanceTest] = React.useState(null);

  const handlePerformanceTest = async () => {
    const { testThemeSwitchingPerformance } = useThemeTest();
    const result = await testThemeSwitchingPerformance();
    setPerformanceTest(result);
  };

  const StatusIcon = ({ status }) => {
    if (status === true) return <CheckCircle className="h-4 w-4 text-primary" />;
    if (status === false) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Theme Integration Test</h2>
          <p className="text-muted-foreground">
            Testing Shadcn UI integration with HackerDen theme system
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon status={isThemeReady} />
              Theme Status
            </CardTitle>
            <CardDescription>Current theme configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Selected:</span>
              <span className="text-sm font-mono">{theme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Resolved:</span>
              <span className="text-sm font-mono">{resolvedTheme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Ready:</span>
              <StatusIcon status={isThemeReady} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Consistent:</span>
              <StatusIcon status={themeConsistency} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Component Tests</CardTitle>
            <CardDescription>Shadcn component integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="default" size="sm" className="w-full">
              Primary Button
            </Button>
            <Button variant="secondary" size="sm" className="w-full">
              Secondary Button
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Outline Button
            </Button>
            <Button variant="ghost" size="sm" className="w-full">
              Ghost Button
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={cycleThemes} variant="outline">
          Cycle Themes
        </Button>
        <Button 
          onClick={() => console.log(getThemeStatus())} 
          variant="ghost"
        >
          Log Theme Status
        </Button>
      </div>

      {!isThemeReady && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Applying theme...</span>
        </div>
      )}
    </div>
  );
}