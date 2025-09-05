import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simple integration test to verify components are properly structured
describe('Poll Components Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have PollDisplay component with correct exports', async () => {
    const PollDisplay = await import('../PollDisplay');
    expect(PollDisplay.default).toBeDefined();
    expect(typeof PollDisplay.default).toBe('function');
  });

  it('should have PollResults component with correct exports', async () => {
    const PollResults = await import('../PollResults');
    expect(PollResults.default).toBeDefined();
    expect(typeof PollResults.default).toBe('function');
  });

  it('should have QuickPoll component with correct exports', async () => {
    const QuickPoll = await import('../QuickPoll');
    expect(QuickPoll.default).toBeDefined();
    expect(typeof QuickPoll.default).toBe('function');
  });

  it('should have pollService with required methods', async () => {
    const pollService = await import('../../services/pollService');
    expect(pollService.default).toBeDefined();
    expect(typeof pollService.default.voteOnPoll).toBe('function');
    expect(typeof pollService.default.getPollResults).toBe('function');
    expect(typeof pollService.default.convertPollToTask).toBe('function');
    expect(typeof pollService.default.exportPollResults).toBe('function');
  });

  it('should verify component dependencies are properly imported', async () => {
    // Test that PollDisplay imports PollResults correctly
    const PollDisplayModule = await import('../PollDisplay.jsx?raw');
    const pollDisplayContent = PollDisplayModule.default;
    expect(pollDisplayContent).toContain("import PollResults from './PollResults'");
    
    // Test that components import required UI components
    expect(pollDisplayContent).toContain("import { Button }");
    expect(pollDisplayContent).toContain("import { Card,");
    expect(pollDisplayContent).toContain("import { RadioGroup,");
  });

  it('should verify PollResults has export functionality', async () => {
    const PollResultsModule = await import('../PollResults.jsx?raw');
    const pollResultsContent = PollResultsModule.default;
    expect(pollResultsContent).toContain('handleExportResults');
    expect(pollResultsContent).toContain('handleConvertToTask');
    expect(pollResultsContent).toContain('DownloadIcon');
    expect(pollResultsContent).toContain('PlusIcon');
  });

  it('should verify QuickPoll has enhanced voting interface', async () => {
    const QuickPollModule = await import('../QuickPoll.jsx?raw');
    const quickPollContent = QuickPollModule.default;
    expect(quickPollContent).toContain('Progress');
    expect(quickPollContent).toContain('refreshResults');
    expect(quickPollContent).toContain('handleConvertToTask');
    expect(quickPollContent).toContain('TrophyIcon');
  });
});