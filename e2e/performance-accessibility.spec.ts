import { test, expect } from '@playwright/test';
import { ProjectHelpers } from './fixtures/helpers';

test.describe('Performance and Accessibility', () => {
  let projectHelpers: ProjectHelpers;

  test.beforeEach(async ({ page }) => {
    projectHelpers = new ProjectHelpers(page);
  });

  test('should meet performance benchmarks', async ({ page }) => {
    // Measure initial page load
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]');
    const initialLoadTime = Date.now() - startTime;
    
    expect(initialLoadTime).toBeLessThan(3000); // Should load within 3 seconds
    
    // Measure project creation performance
    const projectStartTime = Date.now();
    const projectId = await projectHelpers.createProject();
    const projectCreationTime = Date.now() - projectStartTime;
    
    expect(projectCreationTime).toBeLessThan(5000); // Project creation should be fast
    
    // Measure task board rendering performance
    const taskStartTime = Date.now();
    await projectHelpers.createTasks();
    const taskCreationTime = Date.now() - taskStartTime;
    
    expect(taskCreationTime).toBeLessThan(3000); // Task creation should be responsive
  });

  test('should be accessible to screen readers', async ({ page }) => {
    const projectId = await projectHelpers.createProject();
    
    // Check for proper ARIA labels
    await expect(page.locator('[aria-label="Project Hub"]')).toBeVisible();
    await expect(page.locator('[aria-label="Project Name"]')).toBeVisible();
    await expect(page.locator('[aria-label="Team Members"]')).toBeVisible();
    
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2')).toHaveCount({ min: 1 });
    
    // Check for proper form labels
    await page.click('[data-testid="edit-project-btn"]');
    await expect(page.locator('label[for="project-name"]')).toBeVisible();
    await expect(page.locator('label[for="one-line-idea"]')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Should activate focused element
  });

  test('should support keyboard navigation', async ({ page }) => {
    const projectId = await projectHelpers.createProject();
    await projectHelpers.createTasks();
    
    await page.click('[data-testid="task-board-tab"]');
    
    // Test tab navigation through task cards
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').getAttribute('data-testid');
    expect(focusedElement).toBeTruthy();
    
    // Test arrow key navigation for task board
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    
    // Test Enter key to activate elements
    await page.keyboard.press('Enter');
    
    // Test Escape key to close modals
    await page.keyboard.press('Escape');
  });

  test('should have proper color contrast', async ({ page }) => {
    const projectId = await projectHelpers.createProject();
    
    // Check that text has sufficient contrast
    const textElements = await page.locator('[data-testid="project-name"], [data-testid="one-line-idea"]').all();
    
    for (const element of textElements) {
      const color = await element.evaluate(el => getComputedStyle(el).color);
      const backgroundColor = await element.evaluate(el => getComputedStyle(el).backgroundColor);
      
      // Basic check that colors are defined
      expect(color).toBeTruthy();
      expect(backgroundColor).toBeTruthy();
    }
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    const projectId = await projectHelpers.createProject();
    
    // Create many tasks to test performance
    await page.click('[data-testid="task-board-tab"]');
    
    const startTime = Date.now();
    
    // Create 50 tasks
    for (let i = 0; i < 50; i++) {
      await page.click('[data-testid="add-task-btn"]');
      await page.fill('[data-testid="task-title-input"]', `Performance Test Task ${i + 1}`);
      await page.click('[data-testid="save-task-btn"]');
      
      // Don't wait for each task individually to speed up test
      if (i % 10 === 0) {
        await page.waitForTimeout(100); // Brief pause every 10 tasks
      }
    }
    
    const creationTime = Date.now() - startTime;
    expect(creationTime).toBeLessThan(30000); // Should handle 50 tasks within 30 seconds
    
    // Test scrolling performance with many tasks
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verify all tasks are still visible and responsive
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(55); // 5 original + 50 new
  });

  test('should work with reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    const projectId = await projectHelpers.createProject();
    await projectHelpers.createTasks();
    
    await page.click('[data-testid="task-board-tab"]');
    
    // Test that drag and drop still works with reduced motion
    await projectHelpers.moveTaskToInProgress('Set up project structure');
    
    await expect(page.locator('[data-testid="column-inprogress"] [data-testid="task-card"]:has-text("Set up project structure")')).toBeVisible();
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    
    const projectId = await projectHelpers.createProject();
    
    // Verify elements are still visible in high contrast mode
    await expect(page.locator('[data-testid="project-hub"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-name"]')).toBeVisible();
    
    // Test that interactive elements are distinguishable
    await page.click('[data-testid="task-board-tab"]');
    await expect(page.locator('[data-testid="task-board"]')).toBeVisible();
  });

  test('should be responsive to zoom levels', async ({ page }) => {
    const projectId = await projectHelpers.createProject();
    
    // Test different zoom levels
    const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    
    for (const zoom of zoomLevels) {
      await page.setViewportSize({ 
        width: Math.floor(1920 * zoom), 
        height: Math.floor(1080 * zoom) 
      });
      
      // Verify content is still accessible at this zoom level
      await expect(page.locator('[data-testid="project-hub"]')).toBeVisible();
      await expect(page.locator('[data-testid="project-name"]')).toBeVisible();
      
      // Test that buttons are still clickable
      await page.click('[data-testid="task-board-tab"]');
      await expect(page.locator('[data-testid="task-board"]')).toBeVisible();
      
      await page.click('[data-testid="project-hub-tab"]');
    }
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    const projectId = await projectHelpers.createProject();
    
    // Monitor memory usage during intensive operations
    const initialMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
    
    // Perform memory-intensive operations
    await projectHelpers.createTasks();
    await page.click('[data-testid="task-board-tab"]');
    
    // Move tasks multiple times
    for (let i = 0; i < 10; i++) {
      await projectHelpers.moveTaskToInProgress('Set up project structure');
      await projectHelpers.moveTaskToDone('Set up project structure');
      await projectHelpers.moveTaskToInProgress('Set up project structure');
    }
    
    const finalMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
    
    // Memory usage shouldn't grow excessively (allow for 50MB increase)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    }
  });
});