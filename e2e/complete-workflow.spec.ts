import { test, expect } from '@playwright/test';
import { ProjectHelpers } from './fixtures/helpers';
import { testProject, testTasks, testPivots, testSubmission } from './fixtures/testData';

test.describe('Complete Hackathon Workflow', () => {
  let projectHelpers: ProjectHelpers;
  let projectId: string;

  test.beforeEach(async ({ page }) => {
    projectHelpers = new ProjectHelpers(page);
  });

  test('should complete full hackathon workflow from project creation to submission', async ({ page }) => {
    // Phase 1: Project Creation and Setup
    projectId = await projectHelpers.createProject();
    
    // Verify project was created successfully
    await projectHelpers.verifyProjectData();
    
    // Phase 2: Task Management
    await projectHelpers.createTasks();
    await projectHelpers.verifyTasksCreated();
    
    // Test task movement through workflow
    await projectHelpers.moveTaskToInProgress(testTasks[0].title);
    await expect(page.locator(`[data-testid="column-inprogress"] [data-testid="task-card"]:has-text("${testTasks[0].title}")`)).toBeVisible();
    
    await projectHelpers.moveTaskToDone(testTasks[0].title);
    await expect(page.locator(`[data-testid="column-done"] [data-testid="task-card"]:has-text("${testTasks[0].title}")`)).toBeVisible();
    
    // Phase 3: Pivot Tracking
    for (const pivot of testPivots) {
      await projectHelpers.addPivot(pivot.description, pivot.reason);
    }
    
    // Verify pivots are displayed
    await page.click('[data-testid="pivot-log-tab"]');
    for (const pivot of testPivots) {
      await expect(page.locator(`[data-testid="pivot-entry"]:has-text("${pivot.description}")`)).toBeVisible();
    }
    
    // Phase 4: Submission Package
    await projectHelpers.createSubmissionPackage(
      testSubmission.githubUrl,
      testSubmission.presentationUrl,
      testSubmission.demoVideoUrl
    );
    
    // Verify submission package is complete
    await expect(page.locator('[data-testid="submission-complete-indicator"]')).toBeVisible();
    
    // Test public submission page generation
    await page.click('[data-testid="generate-public-page-btn"]');
    const publicPageUrl = await page.locator('[data-testid="public-page-url"]').textContent();
    expect(publicPageUrl).toContain('/submission/');
    
    // Navigate to public page and verify content
    await page.goto(publicPageUrl!);
    await expect(page.locator('[data-testid="public-project-name"]')).toHaveText(testProject.projectName);
    await expect(page.locator('[data-testid="public-one-line-idea"]')).toHaveText(testProject.oneLineIdea);
    await expect(page.locator('[data-testid="public-github-link"]')).toHaveAttribute('href', testSubmission.githubUrl);
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    // Test form validation
    await page.goto('/');
    await page.click('[data-testid="create-project-btn"]');
    await page.click('[data-testid="save-project-btn"]'); // Try to save without required fields
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Project name is required');
    
    // Test invalid URL validation in submission
    projectId = await projectHelpers.createProject();
    await page.click('[data-testid="submission-tab"]');
    await page.fill('[data-testid="github-url-input"]', 'invalid-url');
    await page.click('[data-testid="save-submission-btn"]');
    
    await expect(page.locator('[data-testid="url-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="url-error"]')).toContainText('Please enter a valid URL');
  });

  test('should maintain data persistence across page reloads', async ({ page }) => {
    // Create project and add data
    projectId = await projectHelpers.createProject();
    await projectHelpers.createTasks();
    await projectHelpers.addPivot(testPivots[0].description, testPivots[0].reason);
    
    // Reload page
    await page.reload();
    
    // Verify data persists
    await projectHelpers.verifyProjectData();
    await page.click('[data-testid="task-board-tab"]');
    await projectHelpers.verifyTasksCreated();
    
    await page.click('[data-testid="pivot-log-tab"]');
    await expect(page.locator(`[data-testid="pivot-entry"]:has-text("${testPivots[0].description}")`)).toBeVisible();
  });

  test('should handle network connectivity issues', async ({ page }) => {
    projectId = await projectHelpers.createProject();
    
    // Simulate offline mode
    await page.context().setOffline(true);
    
    // Try to create a task while offline
    await page.click('[data-testid="task-board-tab"]');
    await page.click('[data-testid="add-task-btn"]');
    await page.fill('[data-testid="task-title-input"]', 'Offline Task');
    await page.click('[data-testid="save-task-btn"]');
    
    // Should show offline indicator or queued state
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
    
    // Task should sync when back online
    await page.waitForSelector('[data-testid="task-card"]:has-text("Offline Task")', { timeout: 10000 });
  });
});