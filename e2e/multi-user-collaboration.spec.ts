import { test, expect } from '@playwright/test';
import { ProjectHelpers, MultiUserHelpers } from './fixtures/helpers';
import { testTasks } from './fixtures/testData';

test.describe('Multi-User Collaboration', () => {
  let projectHelpers1: ProjectHelpers;
  let projectHelpers2: ProjectHelpers;
  let multiUserHelpers: MultiUserHelpers;
  let projectId: string;

  test.beforeEach(async ({ browser }) => {
    // Create two browser contexts for two different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    projectHelpers1 = new ProjectHelpers(page1);
    projectHelpers2 = new ProjectHelpers(page2);
    multiUserHelpers = new MultiUserHelpers(page1, page2);
    
    // User 1 creates the project
    projectId = await projectHelpers1.createProject();
    await projectHelpers1.createTasks();
    
    // Set up both users on the same project
    await multiUserHelpers.setupTwoUsers(projectId);
  });

  test('should sync task movements in real-time between users', async () => {
    // Navigate both users to task board
    await Promise.all([
      projectHelpers1.page.click('[data-testid="task-board-tab"]'),
      projectHelpers2.page.click('[data-testid="task-board-tab"]'),
    ]);
    
    // Test real-time task movement
    await multiUserHelpers.testRealTimeTaskMovement(testTasks[0].title);
    
    // User 2 moves another task
    const taskCard2 = projectHelpers2.page.locator(`[data-testid="task-card"]:has-text("${testTasks[1].title}")`);
    const doneColumn2 = projectHelpers2.page.locator('[data-testid="column-done"]');
    
    await taskCard2.dragTo(doneColumn2);
    
    // User 1 should see the task in done column
    await projectHelpers1.page.waitForSelector(`[data-testid="column-done"] [data-testid="task-card"]:has-text("${testTasks[1].title}")`, { timeout: 5000 });
  });

  test('should sync project updates in real-time', async () => {
    await multiUserHelpers.testRealTimeProjectUpdate();
  });

  test('should sync pivot log updates in real-time', async () => {
    await multiUserHelpers.testRealTimePivotLog();
  });

  test('should handle concurrent task creation', async () => {
    // Both users navigate to task board
    await Promise.all([
      projectHelpers1.page.click('[data-testid="task-board-tab"]'),
      projectHelpers2.page.click('[data-testid="task-board-tab"]'),
    ]);
    
    // Both users create tasks simultaneously
    await Promise.all([
      (async () => {
        await projectHelpers1.page.click('[data-testid="add-task-btn"]');
        await projectHelpers1.page.fill('[data-testid="task-title-input"]', 'User 1 Task');
        await projectHelpers1.page.click('[data-testid="save-task-btn"]');
      })(),
      (async () => {
        await projectHelpers2.page.click('[data-testid="add-task-btn"]');
        await projectHelpers2.page.fill('[data-testid="task-title-input"]', 'User 2 Task');
        await projectHelpers2.page.click('[data-testid="save-task-btn"]');
      })(),
    ]);
    
    // Both tasks should be visible to both users
    await Promise.all([
      expect(projectHelpers1.page.locator('[data-testid="task-card"]:has-text("User 1 Task")')).toBeVisible(),
      expect(projectHelpers1.page.locator('[data-testid="task-card"]:has-text("User 2 Task")')).toBeVisible(),
      expect(projectHelpers2.page.locator('[data-testid="task-card"]:has-text("User 1 Task")')).toBeVisible(),
      expect(projectHelpers2.page.locator('[data-testid="task-card"]:has-text("User 2 Task")')).toBeVisible(),
    ]);
  });

  test('should handle user disconnection and reconnection', async () => {
    // User 1 goes offline
    await projectHelpers1.page.context().setOffline(true);
    
    // User 2 makes changes while user 1 is offline
    await projectHelpers2.page.click('[data-testid="task-board-tab"]');
    await projectHelpers2.page.click('[data-testid="add-task-btn"]');
    await projectHelpers2.page.fill('[data-testid="task-title-input"]', 'Offline Test Task');
    await projectHelpers2.page.click('[data-testid="save-task-btn"]');
    
    // User 1 comes back online
    await projectHelpers1.page.context().setOffline(false);
    await projectHelpers1.page.click('[data-testid="task-board-tab"]');
    
    // User 1 should see the changes made while offline
    await projectHelpers1.page.waitForSelector('[data-testid="task-card"]:has-text("Offline Test Task")', { timeout: 10000 });
  });

  test('should show connection status indicators', async () => {
    // Check that connection status is shown
    await expect(projectHelpers1.page.locator('[data-testid="connection-status"]')).toBeVisible();
    await expect(projectHelpers2.page.locator('[data-testid="connection-status"]')).toBeVisible();
    
    // Should show connected status
    await expect(projectHelpers1.page.locator('[data-testid="connection-status"]')).toHaveText('Connected');
    
    // Simulate disconnection
    await projectHelpers1.page.context().setOffline(true);
    
    // Should show disconnected status
    await expect(projectHelpers1.page.locator('[data-testid="connection-status"]')).toHaveText('Disconnected');
    
    // Reconnect
    await projectHelpers1.page.context().setOffline(false);
    
    // Should show connected status again
    await expect(projectHelpers1.page.locator('[data-testid="connection-status"]')).toHaveText('Connected');
  });

  test('should handle conflicting edits gracefully', async () => {
    // Both users try to edit the same task simultaneously
    const taskCard1 = projectHelpers1.page.locator(`[data-testid="task-card"]:has-text("${testTasks[0].title}")`);
    const taskCard2 = projectHelpers2.page.locator(`[data-testid="task-card"]:has-text("${testTasks[0].title}")`);
    
    await Promise.all([
      projectHelpers1.page.click('[data-testid="task-board-tab"]'),
      projectHelpers2.page.click('[data-testid="task-board-tab"]'),
    ]);
    
    // Both users click edit on the same task
    await Promise.all([
      taskCard1.click(),
      taskCard2.click(),
    ]);
    
    // Both try to update the task title
    await Promise.all([
      (async () => {
        await projectHelpers1.page.fill('[data-testid="task-title-edit"]', 'Updated by User 1');
        await projectHelpers1.page.click('[data-testid="save-task-edit-btn"]');
      })(),
      (async () => {
        await projectHelpers2.page.fill('[data-testid="task-title-edit"]', 'Updated by User 2');
        await projectHelpers2.page.click('[data-testid="save-task-edit-btn"]');
      })(),
    ]);
    
    // One of the updates should succeed, and both users should see the same final state
    await projectHelpers1.page.waitForTimeout(2000); // Wait for conflict resolution
    
    const finalTitle1 = await projectHelpers1.page.locator(`[data-testid="task-card"]:has-text("Updated by")`).textContent();
    const finalTitle2 = await projectHelpers2.page.locator(`[data-testid="task-card"]:has-text("Updated by")`).textContent();
    
    expect(finalTitle1).toBe(finalTitle2); // Both users should see the same final state
  });
});