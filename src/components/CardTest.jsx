import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, EnhancedCard, InteractiveCard, StatsCard } from './ui/card.jsx';

const CardTest = () => {
  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8">Shadcn Card Component System Test</h1>
        
        {/* Basic Card */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Basic Shadcn Card</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>This is a default Shadcn card with standard styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Content goes here with proper spacing and typography.
                </p>
              </CardContent>
              <CardFooter>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                  Action
                </button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Card with enhanced shadow and hover effects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This card has elevated styling with better shadows.
                </p>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Outlined Card</CardTitle>
                <CardDescription>Card with prominent border styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This card uses outlined variant with border emphasis.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enhanced Cards (Legacy card-enhanced replacement) */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Enhanced Cards (Legacy Replacement)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <EnhancedCard>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-dark-primary">Enhanced Card</h3>
                <p className="text-dark-tertiary">
                  This replaces the old card-enhanced class with proper Shadcn structure
                  while maintaining the same visual appearance.
                </p>
                <div className="flex items-center space-x-2 text-sm text-dark-secondary">
                  <span>Status: Active</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard hover>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-dark-primary">Enhanced with Hover</h3>
                <p className="text-dark-tertiary">
                  This card includes hover effects for better interactivity.
                </p>
                <div className="text-xs text-dark-muted">Hover to see the effect</div>
              </div>
            </EnhancedCard>
          </div>
        </section>

        {/* Interactive Cards */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Interactive Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InteractiveCard onClick={() => alert('Card clicked!')}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-primary">Clickable Card</h3>
                  <p className="text-dark-tertiary">Click me to see the interaction</p>
                </div>
              </div>
            </InteractiveCard>

            <InteractiveCard>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-dark-primary">Hover Card</h3>
                  <p className="text-dark-tertiary">Hover for interactive effects</p>
                </div>
              </div>
            </InteractiveCard>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Stats Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-tertiary">Total Tasks</p>
                  <p className="text-2xl font-bold text-dark-primary">24</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </StatsCard>

            <StatsCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-tertiary">Completed</p>
                  <p className="text-2xl font-bold text-green-400">18</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </StatsCard>

            <StatsCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-tertiary">In Progress</p>
                  <p className="text-2xl font-bold text-blue-400">4</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </StatsCard>

            <StatsCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-tertiary">Blocked</p>
                  <p className="text-2xl font-bold text-red-400">2</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </StatsCard>
          </div>
        </section>

        {/* Responsive Test */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Responsive Behavior Test</h2>
          <p className="text-muted-foreground">Resize your browser to test responsive behavior</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <EnhancedCard key={i} className="min-h-[120px]">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 mx-auto rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">{i + 1}</span>
                  </div>
                  <h4 className="font-medium text-dark-primary">Card {i + 1}</h4>
                  <p className="text-xs text-dark-tertiary">Responsive test</p>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CardTest;