import { Page, expect } from '@playwright/test';
import { testProject, testTasks } from './testData';

export class ProjectHelpers {
  constructor(private page: Page) {}

  async createProject() {
    // Navigate to home page and create new project
    await this.page.goto('/');
    await this.page.click('[data-testid="create-project-btn"]');
    
    // Fill project details
    await this.page.fill('[data-testid="project-name-input"]', testProject.projectName);
    await this.page.fill('[data-testid="one-line-idea-input"]', testProject.oneLineIdea);
    
    // Add team members
    for (const member of testProject.teamMembers) {
      await this.page.click('[data-testid="add-team-member-btn"]');
      await this.page.fill('[data-testid="member-name-input"]:last-of-type', member.name);
      if (member.role) {
        await this.page.fill('[data-testid="member-role-input"]:last-of-type', member.role);
      }
    }
    
    // Set deadlines
    await this.page.fill('[data-testid="hacking-ends-input"]', '2025-01-30T18:00');
    await this.page.fill('[data-testid="submission-deadline-input"]', '2025-01-30T20:00');
    await this.page.fill('[data-testid="presentation-time-input"]', '2025-01-31T10:00');
    
    // Add judging criteria
    for (const criteria of testProject.judgingCriteria) {
      await this.page.click('[data-testid="add-criteria-btn"]');
      await this.page.fill('[data-testid="criteria-name-input"]:last-of-type', criteria.name);
      await this.page.fill('[data-testid="criteria-description-input"]:last-of-type', criteria.description);
    }
    
    // Save project
    await this.page.click('[data-testid="save-project-btn"]');
    
    // Wait for project to be created and redirected
    await this.page.waitForURL(/\/project\/[a-f0-9]+/);
    
    return this.getProjectIdFromUrl();
  }

  async createTasks() {
    // Navigate to task board
    await this.page.click('[data-testid="task-board-tab"]');
    
    for (const task of testTasks) {
      await this.page.click('[data-testid="add-task-btn"]');
      await this.page.fill('[data-testid="task-title-input"]', task.title);
      
      if (task.assignedTo) {
        await this.page.selectOption('[data-testid="task-assignee-select"]', task.assignedTo);
      }
      
      await this.page.click('[data-testid="save-task-btn"]');
      await this.page.waitForSelector(`[data-testid="task-card"]:has-text("${task.title}")`);
    }
  }

  async moveTaskToInProgress(taskTitle: string) {
    const taskCard = this.page.locator(`[data-testid="task-card"]:has-text("${taskTitle}")`);
    const inProgressColumn = this.page.locator('[data-testid="column-inprogress"]');
    
    await taskCard.dragTo(inProgressColumn);
    await this.page.waitForTimeout(500); // Wait for drag animation
  }

  async moveTaskToDone(taskTitle: string) {
    const taskCard = this.page.locator(`[data-testid="task-card"]:has-text("${taskTitle}")`);
    const doneColumn = this.page.locator('[data-testid="column-done"]');
    
    await taskCard.dragTo(doneColumn);
    await this.page.waitForTimeout(500); // Wait for drag animation
  }

  async addPivot(description: string, reason: string) {
    await this.page.click('[data-testid="pivot-log-tab"]');
    await this.page.click('[data-testid="add-pivot-btn"]');
    await this.page.fill('[data-testid="pivot-description-input"]', description);
    await this.page.fill('[data-testid="pivot-reason-input"]', reason);
    await this.page.click('[data-testid="save-pivot-btn"]');
    
    await this.page.waitForSelector(`[data-testid="pivot-entry"]:has-text("${description}")`);
  }

  async createSubmissionPackage(githubUrl: string, presentationUrl: string, demoVideoUrl: string) {
    await this.page.click('[data-testid="submission-tab"]');
    await this.page.fill('[data-testid="github-url-input"]', githubUrl);
    await this.page.fill('[data-testid="presentation-url-input"]', presentationUrl);
    await this.page.fill('[data-testid="demo-video-url-input"]', demoVideoUrl);
    await this.page.click('[data-testid="save-submission-btn"]');
    
    await this.page.waitForSelector('[data-testid="submission-complete-indicator"]');
  }

  private getProjectIdFromUrl(): string {
    const url = this.page.url();
    const match = url.match(/\/project\/([a-f0-9]+)/);
    if (!match) throw new Error('Could not extract project ID from URL');
    return match[1];
  }

  async waitForRealTimeUpdate(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async verifyProjectData() {
    await expect(this.page.locator('[data-testid="project-name"]')).toHaveText(testProject.projectName);
    await expect(this.page.locator('[data-testid="one-line-idea"]')).toHaveText(testProject.oneLineIdea);
    
    // Verify team members
    for (const member of testProject.teamMembers) {
      await expect(this.page.locator(`[data-testid="team-member"]:has-text("${member.name}")`)).toBeVisible();
    }
    
    // Verify judging criteria
    for (const criteria of testProject.judgingCriteria) {
      await expect(this.page.locator(`[data-testid="criteria-item"]:has-text("${criteria.name}")`)).toBeVisible();
    }
  }

  async verifyTasksCreated() {
    for (const task of testTasks) {
      await expect(this.page.locator(`[data-testid="task-card"]:has-text("${task.title}")`)).toBeVisible();
    }
  }
}

export class MultiUserHelpers {
  constructor(private page1: Page, private page2: Page) {}

  async setupTwoUsers(projectId: string) {
    // Both users navigate to the same project
    await Promise.all([
      this.page1.goto(`/project/${projectId}`),
      this.page2.goto(`/project/${projectId}`),
    ]);
    
    // Wait for both pages to load
    await Promise.all([
      this.page1.waitForSelector('[data-testid="project-hub"]'),
      this.page2.waitForSelector('[data-testid="project-hub"]'),
    ]);
  }

  async testRealTimeTaskMovement(taskTitle: string) {
    // User 1 moves task to in progress
    const taskCard1 = this.page1.locator(`[data-testid="task-card"]:has-text("${taskTitle}")`);
    const inProgressColumn1 = this.page1.locator('[data-testid="column-inprogress"]');
    
    await taskCard1.dragTo(inProgressColumn1);
    
    // User 2 should see the task in the in-progress column
    await this.page2.waitForSelector(`[data-testid="column-inprogress"] [data-testid="task-card"]:has-text("${taskTitle}")`, { timeout: 5000 });
    
    // Verify task is no longer in todo column for user 2
    await expect(this.page2.locator(`[data-testid="column-todo"] [data-testid="task-card"]:has-text("${taskTitle}")`)).not.toBeVisible();
  }

  async testRealTimeProjectUpdate() {
    // User 1 updates project name
    await this.page1.click('[data-testid="edit-project-btn"]');
    await this.page1.fill('[data-testid="project-name-input"]', 'Updated Project Name');
    await this.page1.click('[data-testid="save-project-btn"]');
    
    // User 2 should see the updated name
    await this.page2.waitForSelector('[data-testid="project-name"]:has-text("Updated Project Name")', { timeout: 5000 });
  }

  async testRealTimePivotLog() {
    // User 1 adds a pivot
    await this.page1.click('[data-testid="pivot-log-tab"]');
    await this.page1.click('[data-testid="add-pivot-btn"]');
    await this.page1.fill('[data-testid="pivot-description-input"]', 'Real-time pivot test');
    await this.page1.fill('[data-testid="pivot-reason-input"]', 'Testing real-time updates');
    await this.page1.click('[data-testid="save-pivot-btn"]');
    
    // User 2 should see the new pivot
    await this.page2.click('[data-testid="pivot-log-tab"]');
    await this.page2.waitForSelector('[data-testid="pivot-entry"]:has-text("Real-time pivot test")', { timeout: 5000 });
  }
}