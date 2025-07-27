import { Page, expect } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for network to be idle (no requests for specified time)
   */
  async waitForNetworkIdle(timeout = 2000) {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Check if element is visible within viewport
   */
  async isElementInViewport(selector: string): Promise<boolean> {
    return await this.page.locator(selector).evaluate(el => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Wait for element to be stable (not moving)
   */
  async waitForElementStable(selector: string, timeout = 5000) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    
    let previousPosition = await element.boundingBox();
    let stableCount = 0;
    const requiredStableChecks = 3;
    
    while (stableCount < requiredStableChecks) {
      await this.page.waitForTimeout(100);
      const currentPosition = await element.boundingBox();
      
      if (previousPosition && currentPosition &&
          previousPosition.x === currentPosition.x &&
          previousPosition.y === currentPosition.y) {
        stableCount++;
      } else {
        stableCount = 0;
      }
      
      previousPosition = currentPosition;
    }
  }

  /**
   * Simulate slow network conditions
   */
  async simulateSlowNetwork() {
    await this.page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      await route.continue();
    });
  }

  /**
   * Clear all network route handlers
   */
  async clearNetworkHandlers() {
    await this.page.unroute('**/*');
  }

  /**
   * Check for console errors
   */
  async checkForConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    return errors;
  }

  /**
   * Simulate mobile device with touch events
   */
  async simulateMobileTouch() {
    await this.page.addInitScript(() => {
      // Add touch event simulation
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: false,
        value: 5,
      });
    });
  }

  /**
   * Test element accessibility
   */
  async checkAccessibility(selector: string) {
    const element = this.page.locator(selector);
    
    // Check for ARIA attributes
    const ariaLabel = await element.getAttribute('aria-label');
    const ariaDescribedBy = await element.getAttribute('aria-describedby');
    const role = await element.getAttribute('role');
    
    // Check for proper labeling
    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
    
    if (tagName === 'button' || tagName === 'input') {
      expect(ariaLabel || role).toBeTruthy();
    }
    
    return {
      ariaLabel,
      ariaDescribedBy,
      role,
      tagName
    };
  }

  /**
   * Measure page performance metrics
   */
  async measurePerformance() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      };
    });
    
    return metrics;
  }

  /**
   * Test drag and drop functionality
   */
  async testDragAndDrop(sourceSelector: string, targetSelector: string) {
    const source = this.page.locator(sourceSelector);
    const target = this.page.locator(targetSelector);
    
    // Ensure both elements are visible and stable
    await this.waitForElementStable(sourceSelector);
    await this.waitForElementStable(targetSelector);
    
    // Get initial positions
    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();
    
    if (!sourceBox || !targetBox) {
      throw new Error('Could not get bounding boxes for drag and drop elements');
    }
    
    // Perform drag and drop
    await source.hover();
    await this.page.mouse.down();
    await target.hover();
    await this.page.mouse.up();
    
    // Wait for any animations to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify real-time updates between multiple tabs/windows
   */
  async testRealTimeSync(action: () => Promise<void>, verificationSelector: string) {
    // Open a second tab
    const secondPage = await this.page.context().newPage();
    await secondPage.goto(this.page.url());
    
    // Perform action in first tab
    await action();
    
    // Verify update appears in second tab
    await secondPage.waitForSelector(verificationSelector, { timeout: 5000 });
    
    await secondPage.close();
  }

  /**
   * Test form validation
   */
  async testFormValidation(formSelector: string, requiredFields: string[]) {
    const form = this.page.locator(formSelector);
    
    // Try to submit empty form
    await form.locator('[type="submit"]').click();
    
    // Check that validation errors appear for required fields
    for (const field of requiredFields) {
      const fieldElement = form.locator(`[name="${field}"]`);
      const validationMessage = await fieldElement.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    }
  }

  /**
   * Wait for WebSocket connection to be established
   */
  async waitForWebSocketConnection(timeout = 10000) {
    await this.page.waitForFunction(
      () => {
        return (window as any).socketConnected === true;
      },
      { timeout }
    );
  }

  /**
   * Simulate network disconnection and reconnection
   */
  async simulateNetworkDisconnection(disconnectDuration = 3000) {
    // Disconnect
    await this.page.context().setOffline(true);
    await this.page.waitForTimeout(disconnectDuration);
    
    // Reconnect
    await this.page.context().setOffline(false);
    await this.waitForNetworkIdle();
  }
}