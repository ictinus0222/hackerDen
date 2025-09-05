import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the sessionUtils
vi.mock('../../utils/sessionUtils', () => ({
  hasActiveSession: vi.fn(() => false),
  clearAppStorage: vi.fn(),
}));

// Mock the Appwrite lib
vi.mock('../../lib/appwrite', () => ({
  account: {
    createOAuth2Session: vi.fn(),
    deleteSession: vi.fn(),
    get: vi.fn(),
  },
  ID: {
    unique: vi.fn(() => 'unique-id'),
  },
}));

// Import after mocking
const { authService } = await import('../authService');

describe('authService - GitHub OAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location for each test
    delete window.location;
    window.location = { origin: 'http://localhost:5173' };
  });

  describe('loginWithGitHub', () => {
    it('should initiate GitHub OAuth flow', async () => {
      const { account } = await import('../../lib/appwrite');
      account.createOAuth2Session.mockResolvedValue(undefined);

      await authService.loginWithGitHub();

      expect(account.createOAuth2Session).toHaveBeenCalledWith(
        'github',
        'http://localhost:5173/oauth/callback',
        'http://localhost:5173/login?error=oauth_failed'
      );
    });

    it('should clean up existing session before GitHub OAuth', async () => {
      const { hasActiveSession } = await import('../../utils/sessionUtils');
      const { account } = await import('../../lib/appwrite');
      
      hasActiveSession.mockReturnValue(true);
      account.deleteSession.mockResolvedValue(undefined);
      account.createOAuth2Session.mockResolvedValue(undefined);

      await authService.loginWithGitHub();

      expect(account.deleteSession).toHaveBeenCalledWith('current');
      expect(account.createOAuth2Session).toHaveBeenCalledWith(
        'github',
        'http://localhost:5173/oauth/callback',
        'http://localhost:5173/login?error=oauth_failed'
      );
    });

    it('should handle session cleanup failure gracefully', async () => {
      const { hasActiveSession } = await import('../../utils/sessionUtils');
      const { account } = await import('../../lib/appwrite');
      
      hasActiveSession.mockReturnValue(true);
      account.deleteSession.mockRejectedValue(new Error('Session cleanup failed'));
      account.createOAuth2Session.mockResolvedValue(undefined);

      // Should not throw error even if session cleanup fails
      await expect(authService.loginWithGitHub()).resolves.toBeUndefined();
      
      expect(account.createOAuth2Session).toHaveBeenCalledWith(
        'github',
        'http://localhost:5173/oauth/callback',
        'http://localhost:5173/login?error=oauth_failed'
      );
    });

    it('should throw error if GitHub OAuth fails', async () => {
      const { account } = await import('../../lib/appwrite');
      const oauthError = new Error('GitHub OAuth failed');
      account.createOAuth2Session.mockRejectedValue(oauthError);

      await expect(authService.loginWithGitHub()).rejects.toThrow(
        'GitHub OAuth failed'
      );
    });

    it('should use correct callback URLs for different environments', async () => {
      const { account } = await import('../../lib/appwrite');
      
      // Test production environment
      window.location.origin = 'https://hackerden.com';
      account.createOAuth2Session.mockResolvedValue(undefined);

      await authService.loginWithGitHub();

      expect(account.createOAuth2Session).toHaveBeenCalledWith(
        'github',
        'https://hackerden.com/oauth/callback',
        'https://hackerden.com/login?error=oauth_failed'
      );
    });

    it('should handle network errors during OAuth initiation', async () => {
      const { account } = await import('../../lib/appwrite');
      const networkError = new Error('Network error');
      networkError.code = 'NETWORK_ERROR';
      account.createOAuth2Session.mockRejectedValue(networkError);

      await expect(authService.loginWithGitHub()).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('OAuth callback handling', () => {
    it('should handle successful GitHub OAuth callback', async () => {
      const { account } = await import('../../lib/appwrite');
      const mockUser = {
        $id: 'user-123',
        name: 'GitHub User',
        email: 'user@github.com',
        registration: 'github'
      };

      account.get.mockResolvedValue(mockUser);

      const result = await authService.handleOAuthCallback();

      expect(result).toEqual(mockUser);
      expect(account.get).toHaveBeenCalled();
    });

    it('should detect OAuth sessions correctly', async () => {
      const { account } = await import('../../lib/appwrite');
      const mockOAuthUser = {
        $id: 'user-123',
        name: 'GitHub User',
        email: 'user@github.com',
        registration: 'github'
      };

      account.get.mockResolvedValue(mockOAuthUser);

      const isOAuth = await authService.isOAuthSession();

      expect(isOAuth).toBe(true);
    });

    it('should detect non-OAuth sessions correctly', async () => {
      const { account } = await import('../../lib/appwrite');
      const mockEmailUser = {
        $id: 'user-123',
        name: 'Email User',
        email: 'user@example.com',
        registration: 'email'
      };

      account.get.mockResolvedValue(mockEmailUser);

      const isOAuth = await authService.isOAuthSession();

      expect(isOAuth).toBe(false);
    });
  });

  describe('Integration with existing OAuth methods', () => {
    it('should not interfere with Google OAuth', async () => {
      const { account } = await import('../../lib/appwrite');
      account.createOAuth2Session.mockResolvedValue(undefined);

      await authService.loginWithGoogle();

      expect(account.createOAuth2Session).toHaveBeenCalledWith(
        'google',
        'http://localhost:5173/oauth/callback',
        'http://localhost:5173/login?error=oauth_failed'
      );
    });

    it('should handle multiple OAuth providers in same session', async () => {
      const { account } = await import('../../lib/appwrite');
      
      // Test that both methods exist and work independently
      account.createOAuth2Session.mockResolvedValue(undefined);

      await authService.loginWithGoogle();
      await authService.loginWithGitHub();

      expect(account.createOAuth2Session).toHaveBeenCalledTimes(2);
      expect(account.createOAuth2Session).toHaveBeenNthCalledWith(
        1,
        'google',
        'http://localhost:5173/oauth/callback',
        'http://localhost:5173/login?error=oauth_failed'
      );
      expect(account.createOAuth2Session).toHaveBeenNthCalledWith(
        2,
        'github',
        'http://localhost:5173/oauth/callback',
        'http://localhost:5173/login?error=oauth_failed'
      );
    });
  });

  describe('Error handling', () => {
    it('should provide specific error messages for GitHub OAuth failures', async () => {
      const { account } = await import('../../lib/appwrite');
      const specificError = new Error('Invalid GitHub credentials');
      account.createOAuth2Session.mockRejectedValue(specificError);

      await expect(authService.loginWithGitHub()).rejects.toThrow(
        'Invalid GitHub credentials'
      );
    });

    it('should handle Appwrite service errors', async () => {
      const { account } = await import('../../lib/appwrite');
      const appwriteError = new Error('Appwrite service unavailable');
      appwriteError.code = 503;
      account.createOAuth2Session.mockRejectedValue(appwriteError);

      await expect(authService.loginWithGitHub()).rejects.toThrow(
        'Appwrite service unavailable'
      );
    });

    it('should use fallback error message when no specific message is provided', async () => {
      const { account } = await import('../../lib/appwrite');
      const errorWithoutMessage = new Error();
      errorWithoutMessage.message = '';
      account.createOAuth2Session.mockRejectedValue(errorWithoutMessage);

      await expect(authService.loginWithGitHub()).rejects.toThrow(
        'GitHub authentication failed'
      );
    });
  });
});