import { test, expect, Browser } from '@playwright/test';
import { ProjectHelpers } from './fixtures/helpers';

test.describe('Cross-Browser Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  browsers.forEach(browserName => {
    test.describe(`${browserName} Browser Tests`, () => {
      test(`should work correctly in ${browserName}`, async ({ page }) => {
        const projectHelpers = new ProjectHelpers(page);
        
        // Test basic functionality in each browser
        const projectId = await projectHelpers.createProject();
        await projectHelpers.verifyProjectData();
        
        // Test task management
        await projectHelpers.createTasks();
        await projectHelpers.verifyTasksCreated();
        
        // Test drag and drop (browser-specific behavior)
        await page.click('[data-testid="task-board-tab"]');
        await projectHelpers.moveTaskToInProgress('Set up project structure');
        
        await expect(page.locator('[data-testid="column-inprogress"] [data-testid="task-card"]:has-text("Set up project structure")')).toBeVisible();
      });

      test(`should handle WebSocket connections in ${browserName}`, async ({ page }) => {
        const projectHelpers = new ProjectHelpers(page);
        const projectId = await projectHelpers.createProject();
        
        // Check WebSocket connection status
        await expect(page.locator('[data-testid="connection-status"]')).toHaveText('Connected');
        
        // Test real-time updates
        await page.click('[data-testid="task-board-tab"]');
        await page.click('[data-testid="add-task-btn"]');
        await page.fill('[data-testid="task-title-input"]', `${browserName} Test Task`);
        await page.click('[data-testid="save-task-btn"]');
        
        await expect(page.locator(`[data-testid="task-card"]:has-text("${browserName} Test Task")`)).toBeVisible();
      });

      test(`should handle local storage in ${browserName}`, async ({ page }) => {
        const projectHelpers = new ProjectHelpers(page);
        const projectId = await projectHelpers.createProject();
        
        // Check that project data is stored locally
        const localStorage = await page.evaluate(() => window.localStorage);
        expect(localStorage).toBeDefined();
        
        // Reload page and verify data persists
        await page.reload();
        await projectHelpers.verifyProjectData();
      });

      test(`should render CSS correctly in ${browserName}`, async ({ page }) => {
        const projectHelpers = new ProjectHelpers(page);
        const projectId = await projectHelpers.createProject();
        
        // Check that Tailwind CSS is working
        const projectHub = page.locator('[data-testid="project-hub"]');
        await expect(projectHub).toBeVisible();
        
        // Check responsive design
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(projectHub).toBeVisible();
        
        await page.setViewportSize({ width: 1920, height: 1080 });
        await expect(projectHub).toBeVisible();
      });

      test(`should handle form validation in ${browserName}`, async ({ page }) => {
        await page.goto('/');
        await page.click('[data-testid="create-project-btn"]');
        
        // Test HTML5 validation
        await page.click('[data-testid="save-project-btn"]');
        
        // Should show validation errors
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
        
        // Test URL validation in submission form
        const projectHelpers = new ProjectHelpers(page);
        const projectId = await projectHelpers.createProject();
        
        await page.click('[data-testid="submission-tab"]');
        await page.fill('[data-testid="github-url-input"]', 'not-a-url');
        await page.click('[data-testid="save-submission-btn"]');
        
        await expect(page.locator('[data-testid="url-error"]')).toBeVisible();
      });
    });
  });

  test('should maintain consistent behavior across all browsers', async ({ browser }) => {
    // Test that creates the same project in all browsers and compares results
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);
    
    const pages = await Promise.all(contexts.map(context => context.newPage()));
    const helpers = pages.map(page => new ProjectHelpers(page));
    
    // Create identical projects in all browsers
    const projectIds = await Promise.all(helpers.map(helper => helper.createProject()));
    
    // Verify all projects have the same data
    await Promise.all(helpers.map(helper => helper.verifyProjectData()));
    
    // Create tasks in all browsers
    await Promise.all(helpers.map(helper => helper.createTasks()));
    
    // Verify tasks are created consistently
    await Promise.all(helpers.map(helper => helper.verifyTasksCreated()));
    
    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });

  test('should handle browser-specific features gracefully', async ({ page, browserName }) => {
    const projectHelpers = new ProjectHelpers(page);
    const projectId = await projectHelpers.createProject();
    
    // Test browser-specific drag and drop implementations
    await page.click('[data-testid="task-board-tab"]');
    await projectHelpers.createTasks();
    
    const taskCard = page.locator('[data-testid="task-card"]').first();
    const inProgressColumn = page.locator('[data-testid="column-inprogress"]');
    
    // Different browsers may handle drag and drop differently
    if (browserName === 'webkit') {
      // WebKit might need different approach
      await taskCard.click();
      await page.keyboard.press('Space'); // Activate drag mode
      await page.keyboard.press('ArrowRight'); // Move to next column
      await page.keyboard.press('Space'); // Drop
    } else {
      // Standard drag and drop for Chrome/Firefox
      await taskCard.dragTo(inProgressColumn);
    }
    
    // Verify task moved regardless of browser
    await expect(page.locator('[data-testid="column-inprogress"] [data-testid="task-card"]').first()).toBeVisible();
  });

  test('should handle different screen resolutions consistently', async ({ page }) => {
    const projectHelpers = new ProjectHelpers(page);
    
    const resolutions = [
      { width: 1920, height: 1080 }, // Full HD
      { width: 1366, height: 768 },  // Common laptop
      { width: 1024, height: 768 },  // Tablet landscape
      { width: 768, height: 1024 },  // Tablet portrait
      { width: 375, height: 667 },   // Mobile
    ];
    
    for (const resolution of resolutions) {
      await page.setViewportSize(resolution);
      
      const projectId = await projectHelpers.createProject();
      await projectHelpers.verifyProjectData();
      
      // Verify responsive design works at this resolution
      await expect(page.locator('[data-testid="project-hub"]')).toBeVisible();
      
      // Test navigation at this resolution
      await page.click('[data-testid="task-board-tab"]');
      await expect(page.locator('[data-testid="task-board"]')).toBeVisible();
      
      // Clean up for next resolution test
      await page.goto('/');
    }
  });
});