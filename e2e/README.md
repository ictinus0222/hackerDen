# End-to-End Tests

This directory contains comprehensive E2E tests for the hackerDen application using Playwright.

## Test Structure

### Test Files

- **`complete-workflow.spec.ts`** - Tests the complete hackathon workflow from project creation to submission
- **`multi-user-collaboration.spec.ts`** - Tests real-time collaboration features between multiple users
- **`mobile-functionality.spec.ts`** - Tests mobile device functionality and touch interactions
- **`cross-browser.spec.ts`** - Tests compatibility across different browsers (Chrome, Firefox, Safari)
- **`performance-accessibility.spec.ts`** - Tests performance benchmarks and accessibility compliance
- **`smoke-test.spec.ts`** - Basic smoke tests to verify application is running

### Support Files

- **`fixtures/testData.ts`** - Test data constants and mock objects
- **`fixtures/helpers.ts`** - Helper classes for common test operations
- **`utils/testUtils.ts`** - Utility functions for testing

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Start the application servers:
   ```bash
   npm run dev
   ```

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test complete-workflow.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Mobile Testing

```bash
# Run mobile tests specifically
npx playwright test mobile-functionality.spec.ts

# Run on specific mobile device
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Test Coverage

The E2E tests cover all requirements from the specification:

### Requirement 1: Project Hub Creation and Management
- ✅ Project creation with all required fields
- ✅ Team member management
- ✅ Deadline setting and display
- ✅ Judging criteria management

### Requirement 2: Visual Task Management
- ✅ Kanban board functionality
- ✅ Task creation and assignment
- ✅ Drag-and-drop task movement
- ✅ Real-time task synchronization

### Requirement 3: Pivot Decision Tracking
- ✅ Pivot logging with timestamps
- ✅ Pivot history display
- ✅ Real-time pivot updates

### Requirement 4: Submission Package Generation
- ✅ Submission form with URL validation
- ✅ Public submission page generation
- ✅ Link verification and display

### Requirement 5: Real-time Collaboration Support
- ✅ Multi-user real-time updates
- ✅ Concurrent editing handling
- ✅ Connection status indicators
- ✅ Offline/online synchronization

### Requirement 6: Mobile-Responsive Interface
- ✅ Mobile device compatibility
- ✅ Touch-based interactions
- ✅ Responsive design across screen sizes
- ✅ Mobile-optimized navigation

## Browser Support

Tests run on:
- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome (Android)
- ✅ Mobile Safari (iOS)

## Performance Benchmarks

The tests verify:
- Initial page load < 3 seconds
- Project creation < 5 seconds
- Task operations < 3 seconds
- Memory usage stays reasonable
- Responsive interactions

## Accessibility Testing

Tests verify:
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

## CI/CD Integration

Tests are configured to run in GitHub Actions with:
- MongoDB service for database testing
- All browser installations
- Artifact collection for test reports
- Parallel test execution

## Debugging Tests

### Visual Debugging
```bash
# Run with browser visible
npm run test:e2e:headed

# Run in debug mode with step-by-step execution
npm run test:e2e:debug
```

### Screenshots and Videos
- Screenshots are automatically taken on test failures
- Videos are recorded for failed tests
- Traces are collected for debugging

### Common Issues

1. **Server not running**: Ensure both frontend and backend servers are running
2. **Database connection**: Verify MongoDB is running and accessible
3. **Port conflicts**: Check that ports 3000 and 5173 are available
4. **Browser installation**: Run `npx playwright install` if browsers are missing

## Test Data

Tests use realistic data that simulates actual hackathon scenarios:
- Project names and descriptions
- Team member information
- Task titles and assignments
- Pivot descriptions and reasons
- Submission URLs and content

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use the helper classes for common operations
3. Add appropriate test data to `fixtures/testData.ts`
4. Include both positive and negative test cases
5. Test across all supported browsers and devices
6. Verify accessibility compliance