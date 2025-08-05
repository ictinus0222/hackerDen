import '@testing-library/jest-dom';

// Mock environment variables
process.env.VITE_APPWRITE_ENDPOINT = 'https://test.appwrite.io/v1';
process.env.VITE_APPWRITE_PROJECT_ID = 'test-project';
process.env.VITE_APPWRITE_DATABASE_ID = 'test-database';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.addEventListener for online/offline events
global.window.addEventListener = vi.fn();
global.window.removeEventListener = vi.fn();
global.window.dispatchEvent = vi.fn();