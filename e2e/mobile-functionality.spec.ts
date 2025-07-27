import { test, expect, devices } from '@playwright/test';
import { ProjectHelpers } from './fixtures/helpers';
import { testTasks } from './fixtures/testData';

test.describe('Mobile Device Functionality', () => {
  let projectHelpers: ProjectHelpers;
  let projectId: string;

  // Test on mobile Chrome
  test.use({ ...devices['Pixel 5'] });

  test.beforeEach(async ({ page }) => {
    projectHelpers = new ProjectHelpers(page);
  });

  test('should create project on mobile device', async ({ page }) => {
    projectId = await projectHelpers.createProject();
    
    // Verify mobile-responsive layout
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-hub"]')).toBeVisible();
    
    // Verify project data is displayed correctly on mobile
    await projectHelpers.verifyProjectData();
  });

  test('should handle touch-based drag and drop on mobile', async ({ page }) => {
    projectId = await projectHelpers.createProject();
    await projectHelpers.createTasks();
    
    await page.click('[data-testid="task-board-tab"]');
    
    // Test touch-based drag and drop
    const taskCard = page.locator(`[data-testid="task-card"]:has-text("${testTasks[0].title}")`);
    const inProgressColumn = page.locator('[data-testid="column-inprogress"]');
    
    // Simulate touch drag
    await taskCard.hover();
    await page.mouse.down();
    await inProgressColumn.hover();
    await page.mouse.up();
    
    // Verify task moved to in-progress column
    await expect(page.locator(`[data-testid="column-inprogress"] [data-testid="task-card"]:has-text("${testTasks[0].title}")`)).toBeVisible();
  });

  test('should display mobile-optimized navigation', async ({ page }) => {
    projectId = await projectHelpers.createProject();
    
    // Check mobile navigation elements
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
    
    // Test navigation between tabs
    await page.click('[data-testid="mobile-nav-tasks"]');
    await expect(page.locator('[data-testid="task-board"]')).toBeVisible();
    
    await page.click('[data-testid="mobile-menu-toggle"]');
    await page.click('[data-testid="mobile-nav-pivots"]');
    await expect(page.locator('[data-testid="pivot-log"]')).toBeVisible();
  });

  test('should handle mobile form inputs correctly', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="create-project-btn"]');
    
    // Test mobile keyboard interactions
    await page.fill('[data-testid="project-name-input"]', 'Mobile Test Project');
    await page.fill('[data-testid="one-line-idea-input"]', 'Testing mobile input functionality');
    
    // Test date picker on mobile
    await page.click('[data-testid="hacking-ends-input"]');
    await expect(page.locator('[data-testid="mobile-date-picker"]')).toBeVisible();
    
    // Select date and time
    await page.fill('[data-testid="hacking-ends-input"]', '2025-01-30T18:00');
    
    // Test mobile-optimized buttons
    await page.click('[data-testid="save-project-btn"]');
    await page.waitForURL(/\/project\/[a-f0-9]+/);
    
    // Verify project was created
    await expect(page.locator('[data-testid="project-name"]')).toHaveText('Mobile Test Project');
  });

  test('should maintain performance on mobile devices', async ({ page }) => {
    projectId = await projectHelpers.createProject();
    
    // Measure page load performance
    const startTime = Date.now();
    await page.reload();
    await page.waitForSelector('[data-testid="project-hub"]');
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time on mobile
    expect(loadTime).toBeLessThan(5000);
    
    // Test smooth scrolling on mobile
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await page.waitForTimeout(500);
    
    // Verify content is still responsive after scrolling
    await expect(page.locator('[data-testid="project-hub"]')).toBeVisible();
  });

  test('should handle mobile viewport changes', async ({ page }) => {
    projectId = await projectHelpers.createProject();
    
    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="project-hub"]')).toBeVisible();
    
    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    await expect(page.locator('[data-testid="project-hub"]')).toBeVisible();
    
    // Verify mobile navigation adapts to orientation
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  });

  test('should support mobile gestures for task management', async ({ page }) => {
    projectId = await projectHelpers.createProject();
    await projectHelpers.createTasks();
    
    await page.click('[data-testid="task-board-tab"]');
    
    // Test swipe gesture to move tasks (if implemented)
    const taskCard = page.locator(`[data-testid="task-card"]:has-text("${testTasks[0].title}")`);
    
    // Simulate swipe right gesture
    await taskCard.hover();
    await page.touchscreen.tap(taskCard.boundingBox().then(box => ({ x: box!.x + 50, y: box!.y + 50 })));
    
    // Test long press for task options
    await page.touchscreen.tap(taskCard.boundingBox().then(box => ({ x: box!.x + 50, y: box!.y + 50 })), { delay: 1000 });
    
    // Should show mobile context menu
    await expect(page.locator('[data-testid="mobile-task-menu"]')).toBeVisible();
  });

  test('should handle mobile-specific error states', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile error display
    await page.click('[data-testid="create-project-btn"]');
    await page.click('[data-testid="save-project-btn"]'); // Save without required fields
    
    // Error should be displayed in mobile-friendly format
    await expect(page.locator('[data-testid="mobile-error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-error-toast"]')).toContainText('Project name is required');
  });
});

test.describe('Mobile Safari Specific Tests', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should work correctly on iOS Safari', async ({ page }) => {
    const projectHelpers = new ProjectHelpers(page);
    const projectId = await projectHelpers.createProject();
    
    // Test iOS-specific behaviors
    await expect(page.locator('[data-testid="project-hub"]')).toBeVisible();
    
    // Test iOS date picker
    await page.click('[data-testid="edit-project-btn"]');
    await page.click('[data-testid="hacking-ends-input"]');
    
    // iOS date picker should work
    await page.fill('[data-testid="hacking-ends-input"]', '2025-01-30T18:00');
    await page.click('[data-testid="save-project-btn"]');
    
    // Verify changes saved
    await expect(page.locator('[data-testid="hacking-ends-display"]')).toContainText('Jan 30');
  });
});