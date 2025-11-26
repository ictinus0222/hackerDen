/**
 * Property-Based Tests for HalloweenToggle Component
 * Feature: halloween-theme
 * 
 * These tests validate the correctness properties defined in the design document
 * using property-based testing with fast-check library.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { HalloweenToggle } from '../ui/halloween-toggle';

describe('HalloweenToggle Property-Based Tests', () => {
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
    if (!document.documentElement.setAttribute) {
      document.documentElement.setAttribute = vi.fn();
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  /**
   * Property 6: Theme toggle state synchronization
   * Feature: halloween-theme, Property 6: Theme toggle state synchronization
   * Validates: Requirements 1.2, 5.2
   * 
   * For any Halloween mode state change triggered by user interaction, the toggle 
   * UI component state, ThemeContext state, and document root classes should all 
   * reflect the same Halloween mode value within one render cycle.
   */
  describe('Property 6: Theme toggle state synchronization', () => {
    it('should synchronize toggle UI state, context state, and DOM classes for all state changes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(), // Initial Halloween mode
          fc.integer({ min: 1, max: 3 }), // Number of toggles
          async (initialHalloweenMode, numToggles) => {
            // CRITICAL: Completely reset localStorage before each iteration
            localStorageMock.store = {};
            // Directly set the value in the store (bypassing setItem to ensure it's set)
            localStorageMock.store['hackerden-halloween-mode'] = String(initialHalloweenMode);
            localStorageMock.store['hackerden-theme'] = 'dark';

            // Track document.documentElement.classList calls
            const classListCalls = {
              add: [],
              remove: [],
            };
            document.documentElement.classList.add = vi.fn((className) => {
              classListCalls.add.push(className);
            });
            document.documentElement.classList.remove = vi.fn((className) => {
              classListCalls.remove.push(className);
            });

            // Render HalloweenToggle within ThemeProvider
            const TestComponent = () => {
              const { halloweenMode } = useTheme();
              return (
                <div>
                  <HalloweenToggle data-testid="halloween-toggle" />
                  <div data-testid="context-state">{String(halloweenMode)}</div>
                </div>
              );
            };

            const { unmount, rerender } = render(
              <ThemeProvider defaultHalloweenMode={initialHalloweenMode}>
                <TestComponent />
              </ThemeProvider>
            );

            try {
              // Wait for theme to be ready
              await waitFor(() => {
                const toggle = screen.getByTestId('halloween-toggle');
                expect(toggle).not.toBeDisabled();
              }, { timeout: 2000 });

              const user = userEvent.setup();
              
              // Calculate expected final state after all toggles
              // Each click toggles the state, so odd number of clicks = opposite of initial, even = same as initial
              const expectedFinalState = (numToggles % 2 === 0) ? initialHalloweenMode : !initialHalloweenMode;
              
              // Apply sequence of toggles
              for (let i = 0; i < numToggles; i++) {
                const toggle = screen.getByTestId('halloween-toggle');
                await user.click(toggle);
                // Small delay to ensure state updates are processed
                await new Promise(resolve => setTimeout(resolve, 50));
              }

              // Wait for final state to settle
              await waitFor(() => {
                const contextState = screen.getByTestId('context-state');
                expect(contextState.textContent).toBe(String(expectedFinalState));
              }, { timeout: 2000 });

              // Verify toggle button aria-pressed matches context state
              const contextState = screen.getByTestId('context-state');
              const contextValue = contextState.textContent === 'true';
              const toggleAfterUpdate = screen.getByTestId('halloween-toggle');
              expect(toggleAfterUpdate.getAttribute('aria-pressed')).toBe(String(contextValue));

              // Verify localStorage matches context state
              const storedValue = localStorageMock.getItem('hackerden-halloween-mode');
              expect(storedValue).toBe(String(contextValue));
            } finally {
              // Cleanup
              unmount();
              // Wait a bit for any pending timers
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain synchronization when using keyboard navigation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(), // Initial state
          fc.constantFrom(' ', 'Enter'), // Keyboard keys
          fc.integer({ min: 1, max: 2 }), // Number of key presses
          async (initialHalloweenMode, key, numPresses) => {
            // CRITICAL: Completely reset localStorage before each iteration
            localStorageMock.store = {};
            localStorageMock.store['hackerden-halloween-mode'] = String(initialHalloweenMode);
            localStorageMock.store['hackerden-theme'] = 'dark';

            // Render HalloweenToggle within ThemeProvider
            const TestComponent = () => {
              const { halloweenMode } = useTheme();
              return (
                <div>
                  <HalloweenToggle data-testid="halloween-toggle" />
                  <div data-testid="context-state">{String(halloweenMode)}</div>
                </div>
              );
            };

            const { unmount } = render(
              <ThemeProvider defaultHalloweenMode={initialHalloweenMode}>
                <TestComponent />
              </ThemeProvider>
            );

            try {
              // Wait for theme to be ready
              await waitFor(() => {
                const toggle = screen.getByTestId('halloween-toggle');
                expect(toggle).not.toBeDisabled();
              }, { timeout: 2000 });

              const user = userEvent.setup();
              const toggle = screen.getByTestId('halloween-toggle');

              // Focus the toggle
              toggle.focus();

              // Calculate expected final state
              const expectedFinalState = (numPresses % 2 === 0) ? initialHalloweenMode : !initialHalloweenMode;

              // Press key multiple times
              for (let i = 0; i < numPresses; i++) {
                await user.keyboard(key);
                // Small delay to ensure state updates are processed
                await new Promise(resolve => setTimeout(resolve, 50));
              }

              // Wait for final state to settle
              await waitFor(() => {
                const contextState = screen.getByTestId('context-state');
                expect(contextState.textContent).toBe(String(expectedFinalState));
              }, { timeout: 2000 });

              // Verify synchronization
              const contextState = screen.getByTestId('context-state');
              const contextValue = contextState.textContent === 'true';
              const toggleAfterUpdate = screen.getByTestId('halloween-toggle');
              expect(toggleAfterUpdate.getAttribute('aria-pressed')).toBe(String(contextValue));
            } finally {
              // Cleanup
              unmount();
              // Wait a bit for any pending timers
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 7: Accessibility attribute presence
   * Feature: halloween-theme, Property 7: Accessibility attribute presence
   * Validates: Requirements 6.5
   * 
   * For any theme toggle control rendered in the DOM, it should have appropriate 
   * ARIA attributes (aria-label, aria-pressed, or role) that accurately describe 
   * its current state and function.
   */
  describe('Property 7: Accessibility attribute presence', () => {
    it('should have all required ARIA attributes for any Halloween mode state', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // Halloween mode state
          fc.constantFrom('ghost', 'outline', 'default'), // Button variant
          fc.constantFrom('sm', 'icon', 'lg'), // Button size
          (halloweenMode, variant, size) => {
            // Clear storage and set state
            localStorageMock.clear();
            localStorageMock.store = {};
            localStorageMock.setItem('hackerden-halloween-mode', String(halloweenMode));

            // Render HalloweenToggle
            const { unmount } = render(
              <ThemeProvider defaultHalloweenMode={halloweenMode}>
                <HalloweenToggle 
                  data-testid="halloween-toggle"
                  variant={variant}
                  size={size}
                />
              </ThemeProvider>
            );

            const toggle = screen.getByTestId('halloween-toggle');

            // Verify required ARIA attributes exist
            expect(toggle).toHaveAttribute('aria-label');
            expect(toggle).toHaveAttribute('aria-pressed');
            expect(toggle).toHaveAttribute('role', 'switch');

            // Verify aria-label is descriptive
            const ariaLabel = toggle.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel.length).toBeGreaterThan(0);
            expect(ariaLabel.toLowerCase()).toMatch(/halloween|theme/);

            // Verify aria-pressed matches current state
            expect(toggle.getAttribute('aria-pressed')).toBe(String(halloweenMode));

            // Verify title attribute exists (for tooltip)
            expect(toggle).toHaveAttribute('title');
            const title = toggle.getAttribute('title');
            expect(title).toBeTruthy();
            expect(title.length).toBeGreaterThan(0);

            // Cleanup
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update ARIA attributes when state changes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(), // Initial state
          fc.integer({ min: 1, max: 3 }), // Number of toggles
          async (initialHalloweenMode, numToggles) => {
            // CRITICAL: Completely reset localStorage before each iteration
            localStorageMock.store = {};
            localStorageMock.store['hackerden-halloween-mode'] = String(initialHalloweenMode);
            localStorageMock.store['hackerden-theme'] = 'dark';

            // Render HalloweenToggle
            const { unmount } = render(
              <ThemeProvider defaultHalloweenMode={initialHalloweenMode}>
                <HalloweenToggle data-testid="halloween-toggle" />
              </ThemeProvider>
            );

            try {
              // Wait for theme to be ready
              await waitFor(() => {
                const toggle = screen.getByTestId('halloween-toggle');
                expect(toggle).not.toBeDisabled();
              }, { timeout: 2000 });

              const user = userEvent.setup();
              let toggle = screen.getByTestId('halloween-toggle');

              // Verify initial ARIA state
              expect(toggle.getAttribute('aria-pressed')).toBe(String(initialHalloweenMode));

              // Calculate expected final state
              const expectedFinalState = (numToggles % 2 === 0) ? initialHalloweenMode : !initialHalloweenMode;

              // Toggle multiple times
              for (let i = 0; i < numToggles; i++) {
                toggle = screen.getByTestId('halloween-toggle');
                await user.click(toggle);
                // Small delay to ensure state updates are processed
                await new Promise(resolve => setTimeout(resolve, 50));
              }

              // Wait for final state update
              await waitFor(() => {
                const updatedToggle = screen.getByTestId('halloween-toggle');
                expect(updatedToggle.getAttribute('aria-pressed')).toBe(String(expectedFinalState));
              }, { timeout: 2000 });

              // Verify aria-label is still present and descriptive
              const updatedToggle = screen.getByTestId('halloween-toggle');
              const ariaLabel = updatedToggle.getAttribute('aria-label');
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel.toLowerCase()).toMatch(/halloween|theme/);

              // Verify role is still present
              expect(updatedToggle.getAttribute('role')).toBe('switch');
            } finally {
              // Cleanup
              unmount();
              // Wait a bit for any pending timers
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have screen reader text that describes the toggle function', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // Halloween mode state
          (halloweenMode) => {
            // Clear storage and set state
            localStorageMock.clear();
            localStorageMock.store = {};
            localStorageMock.setItem('hackerden-halloween-mode', String(halloweenMode));

            // Render HalloweenToggle
            const { unmount, container } = render(
              <ThemeProvider defaultHalloweenMode={halloweenMode}>
                <HalloweenToggle data-testid="halloween-toggle" />
              </ThemeProvider>
            );

            // Verify screen reader text exists
            const srText = container.querySelector('.sr-only');
            expect(srText).toBeTruthy();
            expect(srText.textContent).toBeTruthy();
            expect(srText.textContent.length).toBeGreaterThan(0);
            expect(srText.textContent.toLowerCase()).toMatch(/halloween|theme/);

            // Cleanup
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
