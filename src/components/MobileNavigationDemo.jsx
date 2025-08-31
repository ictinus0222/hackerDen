import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const MobileNavigationDemo = () => {
  const [testResults, setTestResults] = useState([]);

  const runTests = () => {
    const results = [];
    
    // Test 1: Check if mobile navigation elements exist
    const mobileHeader = document.querySelector('header.lg\\:hidden');
    results.push({
      test: 'Mobile Header Exists',
      passed: !!mobileHeader,
      details: mobileHeader ? 'Mobile header found' : 'Mobile header not found'
    });

    // Test 2: Check for navigation trigger button
    const navTrigger = document.querySelector('[aria-label="Open navigation menu"]');
    results.push({
      test: 'Navigation Trigger Button',
      passed: !!navTrigger,
      details: navTrigger ? 'Navigation trigger found' : 'Navigation trigger not found'
    });

    // Test 3: Check for touch-friendly sizing
    const touchElements = document.querySelectorAll('.touch-manipulation');
    results.push({
      test: 'Touch-Friendly Elements',
      passed: touchElements.length > 0,
      details: `Found ${touchElements.length} touch-optimized elements`
    });

    // Test 4: Check for swipe detection area
    const swipeArea = document.querySelector('.fixed.left-0.w-6');
    results.push({
      test: 'Swipe Detection Area',
      passed: !!swipeArea,
      details: swipeArea ? 'Swipe detection area found' : 'Swipe detection area not found'
    });

    // Test 5: Check for responsive classes
    const responsiveElements = document.querySelectorAll('.lg\\:hidden, .sm\\:text-base');
    results.push({
      test: 'Responsive Design Classes',
      passed: responsiveElements.length > 0,
      details: `Found ${responsiveElements.length} responsive elements`
    });

    setTestResults(results);
  };

  const simulateMobileView = () => {
    // Simulate mobile viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(meta);
    }
    
    // Add mobile simulation class to body
    document.body.classList.add('mobile-simulation');
    
    // Trigger a resize event to simulate mobile
    window.dispatchEvent(new Event('resize'));
    
    runTests();
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Mobile Navigation Test Suite</h2>
          <p className="text-muted-foreground mb-4">
            Test the mobile navigation implementation with Shadcn Sheet components.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={runTests} variant="default">
            Run Tests
          </Button>
          <Button onClick={simulateMobileView} variant="outline">
            Simulate Mobile View
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">{result.test}</span>
                  <p className="text-sm text-muted-foreground">{result.details}</p>
                </div>
                <Badge variant={result.passed ? 'default' : 'destructive'}>
                  {result.passed ? 'PASS' : 'FAIL'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Mobile Navigation Features:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✅ Shadcn Sheet component for mobile navigation</li>
            <li>✅ Touch-friendly button sizes (44px minimum)</li>
            <li>✅ Swipe gesture support for opening navigation</li>
            <li>✅ Responsive header with proper backdrop blur</li>
            <li>✅ Enhanced mobile tab switcher with Shadcn Tabs</li>
            <li>✅ Proper focus management and accessibility</li>
            <li>✅ Smooth animations and transitions</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default MobileNavigationDemo;