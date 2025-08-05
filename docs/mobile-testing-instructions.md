# Mobile Testing Instructions

Since the project doesn't have a test runner configured, here are manual testing instructions to verify the mobile optimizations for task 7.1.

## Quick Browser Console Test

1. Open the app in your browser: `http://localhost:5173`
2. Open Developer Tools (F12)
3. Switch to mobile view (Device Toolbar - Ctrl+Shift+M)
4. In the console, run:

```javascript
// Load the mobile optimization checker
import('./src/utils/mobileOptimizationChecker.js').then(module => {
  window.checkMobileOptimizations = module.checkMobileOptimizations;
  window.checkViewportSize = module.checkViewportSize;
  window.checkTouchCapability = module.checkTouchCapability;
  
  console.log('Mobile optimization checker loaded!');
  console.log('Run checkMobileOptimizations() to test');
});
```

Then run:
```javascript
checkMobileOptimizations();
```

## Manual Testing Checklist

### 1. Responsive Layout Testing
- [ ] Open app in browser
- [ ] Resize window from desktop (1200px+) to mobile (375px)
- [ ] Verify layout switches from side-by-side to tabs
- [ ] Check that all text remains readable
- [ ] Confirm no horizontal scrolling occurs

### 2. Touch Target Testing
- [ ] Switch to mobile view in DevTools
- [ ] Click all buttons - they should be easy to tap
- [ ] Verify logout button shows "Exit" on mobile
- [ ] Check tab switcher buttons are full-width
- [ ] Test Create Task button is properly sized

### 3. Drag and Drop Testing
- [ ] Create a test task
- [ ] Try dragging with mouse (should work)
- [ ] Switch to touch simulation in DevTools
- [ ] Touch and drag a task card
- [ ] Verify visual feedback appears
- [ ] Confirm task moves to new column

### 4. Chat Input Testing
- [ ] Focus on message input
- [ ] Type a message
- [ ] Verify input doesn't cause page zoom
- [ ] Check send button is properly sized
- [ ] Test on actual mobile device if possible

### 5. Modal Testing
- [ ] Click "Create Task" button
- [ ] Verify modal is properly sized on mobile
- [ ] Check inputs don't cause zoom
- [ ] Test close button is easy to tap
- [ ] Confirm form buttons are properly sized

## Device Testing

### iOS Testing
1. Open Safari on iPhone/iPad
2. Navigate to your local development server
3. Test touch interactions
4. Verify no zoom occurs on input focus
5. Check drag and drop works with touch

### Android Testing
1. Open Chrome on Android device
2. Navigate to your local development server
3. Test all touch interactions
4. Verify responsive layout
5. Check performance is smooth

## Expected Results

✅ **All buttons should be at least 44px tall/wide**
✅ **No horizontal scrolling on any screen size**
✅ **Inputs should not cause zoom on mobile**
✅ **Drag and drop should work with touch**
✅ **Layout should adapt smoothly to different sizes**
✅ **All interactive elements should have visual feedback**

## Common Issues to Look For

❌ **Buttons too small to tap easily**
❌ **Text too small to read on mobile**
❌ **Layout breaks at certain screen sizes**
❌ **Inputs cause unwanted zoom**
❌ **Drag and drop doesn't work on touch**
❌ **Missing visual feedback on interactions**

## Performance Check

Run this in the console to check performance:
```javascript
// Check for layout shifts
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.value > 0.1) {
      console.warn('Layout shift detected:', entry.value);
    }
  }
}).observe({entryTypes: ['layout-shift']});

// Check touch responsiveness
let touchStart = 0;
document.addEventListener('touchstart', () => {
  touchStart = performance.now();
});
document.addEventListener('touchend', () => {
  const delay = performance.now() - touchStart;
  if (delay > 100) {
    console.warn('Slow touch response:', delay + 'ms');
  }
});
```

## Completion Criteria

Task 7.1 is successfully implemented when:
- All manual tests pass ✅
- No critical mobile usability issues ✅
- Touch interactions feel natural ✅
- Layout is responsive across all screen sizes ✅
- Performance is smooth on mobile devices ✅