import { useState } from 'react';
import Sidebar from './Sidebar.jsx';

export function SidebarDemo() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-primary text-primary-foreground rounded-xl shadow-lg hover:bg-primary/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main content */}
      <div className="lg:ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                ✨ New Shadcn UI Sidebar
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A modern, smooth sidebar built with shadcn UI components featuring rounded edges, 
                smooth transitions, and beautiful visual hierarchy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-card rounded-xl border border-border/50 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-3">🎨 Design Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Smooth, rounded edges (rounded-xl)</li>
                  <li>• Modern shadcn UI components</li>
                  <li>• Beautiful hover effects</li>
                  <li>• Clean visual separators</li>
                  <li>• Responsive mobile design</li>
                </ul>
              </div>

              <div className="p-6 bg-card rounded-xl border border-border/50 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-3">🔧 Components Used</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Button with variants</li>
                  <li>• Avatar with fallback</li>
                  <li>• Badge for team info</li>
                  <li>• Separator for clean division</li>
                  <li>• Progress bar integration</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/50 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">🚀 Key Improvements</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-medium text-foreground">Modern Design</h4>
                  <p className="text-xs text-muted-foreground">Clean, professional aesthetic</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="font-medium text-foreground">Smooth Transitions</h4>
                  <p className="text-xs text-muted-foreground">Beautiful hover effects</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="font-medium text-foreground">Mobile Optimized</h4>
                  <p className="text-xs text-muted-foreground">Responsive design</p>
                </div>
              </div>
            </div>

            <div className="text-center p-6 bg-primary/10 rounded-xl border border-primary/20">
              <h3 className="text-lg font-semibold text-primary mb-2">
                🎉 Sidebar Successfully Reconstructed!
              </h3>
              <p className="text-sm text-primary/80">
                The console sidebar now uses modern shadcn UI components with smooth, rounded edges 
                and beautiful visual hierarchy. Toggle the sidebar on mobile to see the smooth animations!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
