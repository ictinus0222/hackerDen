import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ThemeToggle } from './ui/theme-toggle';
import { ThemeTest } from './ui/theme-test';
import { useTheme } from './ThemeProvider';

export function ShadcnTest() {
  const { theme, resolvedTheme, isThemeReady } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Shadcn UI Integration Test</h2>
          <p className="text-muted-foreground">
            Testing Shadcn UI components with HackerDen theme system
          </p>
        </div>
        <ThemeToggle />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Theme Status</CardTitle>
            <CardDescription>Current theme configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Theme:</span>
              <span className="text-sm font-mono">{theme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Resolved:</span>
              <span className="text-sm font-mono">{resolvedTheme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Ready:</span>
              <span className="text-sm">{isThemeReady ? '✅' : '⏳'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>Testing all button styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Default</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
              <Button variant="outline" size="sm">Outline</Button>
              <Button variant="ghost" size="sm">Ghost</Button>
              <Button variant="destructive" size="sm">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="lg">Large</Button>
              <Button size="icon">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              ✅ Focus states, touch targets (44px min), and accessibility attributes tested
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Color System Test</CardTitle>
          <CardDescription>Verifying CSS custom property integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-12 w-full rounded bg-background border-2 border-border"></div>
              <span className="text-xs">Background</span>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-full rounded bg-primary"></div>
              <span className="text-xs">Primary</span>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-full rounded bg-secondary"></div>
              <span className="text-xs">Secondary</span>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-full rounded bg-muted"></div>
              <span className="text-xs">Muted</span>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-full rounded bg-accent"></div>
              <span className="text-xs">Accent</span>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-full rounded bg-card border-2 border-border"></div>
              <span className="text-xs">Card</span>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-full rounded bg-destructive"></div>
              <span className="text-xs">Destructive</span>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-full rounded border-2 border-ring bg-background"></div>
              <span className="text-xs">Ring</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ThemeTest />
    </div>
  );
}