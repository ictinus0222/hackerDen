/**
 * Property-Based Tests for Halloween Theme Mode
 * Feature: halloween-theme
 * 
 * These tests validate the correctness properties defined in the design document
 * using property-based testing with fast-check library.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { ThemeProvider, useTheme } from '../ThemeProvider';

describe('Halloween Theme Property-Based Tests', () => {
  let localStorageMock;

  beforeEach(() => {
    // Create a fresh localStorage mock for each test
    localStorageMock = {
      store: {},
      getItem: vi.fn((key) => localStorageMock.store[key] || null),
      setItem: vi.fn((key, value) => {
        localStorageMock.store[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete localStorageMock.store[key];
      }),
      clear: vi.fn(() => {
        localStorageMock.store = {};
      }),
    };
    global.localStorage = localStorageMock;

    // Mock matchMedia for system theme detection
    global.matchMedia = vi.fn((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Mock document.documentElement
    if (!document.documentElement.classList) {
      document.documentElement.classList = {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
      };
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  /**
   * Property 1: Halloween mode persistence round-trip
   * Feature: halloween-theme, Property 1: Halloween mode persistence round-trip
   * Validates: Requirements 1.3, 1.4
   * 
   * For any Halloween mode state (enabled or disabled), when the state is saved 
   * to localStorage and then loaded on application restart, the loaded state 
   * should equal the saved state.
   */
  describe('Property 1: Halloween mode persistence round-trip', () => {
    it('should persist and restore Halloween mode state correctly across all boolean values', () => {
      fc.assert(
        fc.property(fc.boolean(), (halloweenModeValue) => {
          // Clear storage before each iteration
          localStorageMock.clear();

          // Render ThemeProvider with initial Halloween mode
          const { result, unmount } = renderHook(() => useTheme(), {
            wrapper: ({ children }) => (
              <ThemeProvider defaultHalloweenMode={halloweenModeValue}>
                {children}
              </ThemeProvider>
            ),
          });

          // Set Halloween mode
          act(() => {
            result.current.setHalloweenMode(halloweenModeValue);
          });

          // Verify it was saved to localStorage
          const savedValue = localStorageMock.getItem('hackerden-halloween-mode');
          expect(savedValue).toBe(String(halloweenModeValue));

          // Unmount to simulate app restart
          unmount();

          // Re-render ThemeProvider (simulating app restart)
          const { result: newResult } = renderHook(() => useTheme(), {
            wrapper: ({ children }) => (
              <ThemeProvider>{children}</ThemeProvider>
            ),
          });

          // Verify the loaded state matches the saved state
          expect(newResult.current.halloweenMode).toBe(halloweenModeValue);
        }),
        { numRuns: 100 } // Run 100 iterations as specified in design doc
      );
    });

    it('should handle localStorage errors gracefully and fall back to default', () => {
      fc.assert(
        fc.property(fc.boolean(), (halloweenModeValue) => {
          // Clear storage
          localStorageMock.clear();

          // Make localStorage.setItem throw an error
          localStorageMock.setItem.mockImplementationOnce(() => {
            throw new Error('Storage quota exceeded');
          });

          // Render ThemeProvider
          const { result } = renderHook(() => useTheme(), {
            wrapper: ({ children }) => (
              <ThemeProvider defaultHalloweenMode={false}>
                {children}
              </ThemeProvider>
            ),
          });

          // Try to set Halloween mode (should not throw)
          expect(() => {
            act(() => {
              result.current.setHalloweenMode(halloweenModeValue);
            });
          }).not.toThrow();

          // State should still be updated even if persistence fails
          expect(result.current.halloweenMode).toBe(halloweenModeValue);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Theme combination consistency
   * Feature: halloween-theme, Property 2: Theme combination consistency
   * Validates: Requirements 1.5, 5.5
   * 
   * For any combination of base theme (light/dark) and Halloween mode (on/off), 
   * the effective theme class applied to the document root should match the 
   * expected pattern: base theme class + optional 'halloween' class.
   */
  describe('Property 2: Theme combination consistency', () => {
    it('should apply correct theme classes for all combinations of base theme and Halloween mode', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('light', 'dark'),
          fc.boolean(),
          (baseTheme, halloweenMode) => {
            // Clear storage BEFORE rendering to ensure defaultTheme is used
            localStorageMock.clear();
            localStorageMock.store = {};

            // Set the theme in localStorage to match what we want to test
            localStorageMock.setItem('hackerden-theme', baseTheme);
            localStorageMock.setItem('hackerden-halloween-mode', String(halloweenMode));

            // Render ThemeProvider with specific theme and Halloween mode
            const { result, unmount } = renderHook(() => useTheme(), {
              wrapper: ({ children }) => (
                <ThemeProvider 
                  defaultTheme={baseTheme}
                  defaultHalloweenMode={halloweenMode}
                >
                  {children}
                </ThemeProvider>
              ),
            });

            // Verify effectiveTheme matches expected pattern
            const expectedEffectiveTheme = halloweenMode 
              ? `${baseTheme}-halloween` 
              : baseTheme;
            expect(result.current.effectiveTheme).toBe(expectedEffectiveTheme);

            // Verify resolvedTheme matches base theme
            expect(result.current.resolvedTheme).toBe(baseTheme);

            // Verify halloweenMode state
            expect(result.current.halloweenMode).toBe(halloweenMode);

            // Cleanup
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain theme consistency when toggling Halloween mode', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('light', 'dark'),
          fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
          (baseTheme, halloweenModeSequence) => {
            // Clear storage and set initial theme
            localStorageMock.clear();
            localStorageMock.store = {};
            localStorageMock.setItem('hackerden-theme', baseTheme);

            // Render ThemeProvider
            const { result, unmount } = renderHook(() => useTheme(), {
              wrapper: ({ children }) => (
                <ThemeProvider defaultTheme={baseTheme}>
                  {children}
                </ThemeProvider>
              ),
            });

            // Apply sequence of Halloween mode changes
            halloweenModeSequence.forEach((halloweenMode) => {
              act(() => {
                result.current.setHalloweenMode(halloweenMode);
              });

              // Verify effectiveTheme is consistent with current state
              const expectedEffectiveTheme = halloweenMode 
                ? `${baseTheme}-halloween` 
                : baseTheme;
              expect(result.current.effectiveTheme).toBe(expectedEffectiveTheme);
            });

            // Final state should match last value in sequence
            const finalHalloweenMode = halloweenModeSequence[halloweenModeSequence.length - 1];
            expect(result.current.halloweenMode).toBe(finalHalloweenMode);

            // Cleanup
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
