import Layout from '../components/Layout.jsx';
import ProjectOverviewDemo from '../components/ProjectOverviewDemo.jsx';
import { ThemeTest } from '../components/ui/theme-test.jsx';
import { ShadcnTest } from '../components/ShadcnTest.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { EnhancedCard } from '../components/ui/card';

const DemoPage = () => {
  return (
    <Layout>
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-dark-primary mb-4">
              GitHub-Inspired UI Demo
            </h1>
            <p className="text-lg text-dark-secondary max-w-2xl mx-auto">
              Experience the new project overview interface inspired by GitHub's clean and 
              intuitive design, perfectly integrated with HackerDen's dark theme.
            </p>
          </div>

          {/* Shadcn UI Integration Test */}
          <div className="mb-8">
            <ShadcnTest />
          </div>

          {/* Advanced Theme Integration Test */}
          <div className="mb-8">
            <ThemeTest />
          </div>

          {/* Demo Component */}
          <ProjectOverviewDemo />

          {/* Implementation Notes */}
          <EnhancedCard className="p-6">
            <h3 className="text-lg font-semibold text-dark-primary mb-4">
              Implementation Details
            </h3>
            <div className="prose prose-invert max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-base font-medium text-dark-primary mb-2">Components Created</h4>
                  <ul className="text-sm text-dark-secondary space-y-1">
                    <li>• <code className="text-blue-400">ProjectOverview.jsx</code> - Main GitHub-style interface</li>
                    <li>• <code className="text-blue-400">ProjectPage.jsx</code> - Full project page with stats</li>
                    <li>• <code className="text-blue-400">ProjectOverviewDemo.jsx</code> - Interactive demo</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-base font-medium text-dark-primary mb-2">Key Features</h4>
                  <ul className="text-sm text-dark-secondary space-y-1">
                    <li>• Tabbed navigation (Code, Commits, Activity)</li>
                    <li>• File browser with type-specific icons</li>
                    <li>• Commit history with author avatars</li>
                    <li>• Project statistics and metadata</li>
                    <li>• Responsive design for all screen sizes</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-dark-tertiary rounded-lg">
                <h4 className="text-base font-medium text-dark-primary mb-2">Usage</h4>
                <p className="text-sm text-dark-secondary">
                  Navigate to <code className="text-blue-400">/project</code> to see the full project page, 
                  or visit <code className="text-blue-400">/demo</code> to explore this interactive demo. 
                  The component integrates seamlessly with HackerDen's existing task management data.
                </p>
              </div>
            </div>
          </EnhancedCard>
        </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default DemoPage;