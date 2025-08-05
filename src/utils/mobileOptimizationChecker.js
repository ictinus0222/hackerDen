/**
 * Mobile Optimization Checker
 * Run this in the browser console to verify mobile optimizations
 */

export const checkMobileOptimizations = () => {
  console.log('🔍 Checking Mobile Optimizations...\n');
  
  const results = {
    touchTargets: [],
    responsiveClasses: [],
    inputOptimizations: [],
    dragDropElements: [],
    issues: []
  };

  // Check touch targets (minimum 44px)
  const checkTouchTargets = () => {
    console.log('📱 Checking Touch Targets...');
    
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(button);
      
      const minHeight = parseInt(computedStyle.minHeight) || rect.height;
      const minWidth = parseInt(computedStyle.minWidth) || rect.width;
      
      const result = {
        element: button.textContent?.trim() || `Button ${index + 1}`,
        height: rect.height,
        width: rect.width,
        minHeight,
        minWidth,
        hasTouch: button.classList.contains('touch-manipulation'),
        meetsStandard: minHeight >= 44 && minWidth >= 44
      };
      
      results.touchTargets.push(result);
      
      if (!result.meetsStandard) {
        results.issues.push(`❌ Touch target too small: ${result.element} (${result.width}x${result.height})`);
      } else {
        console.log(`✅ ${result.element}: ${result.width}x${result.height}px`);
      }
    });
  };

  // Check responsive classes
  const checkResponsiveClasses = () => {
    console.log('\n📐 Checking Responsive Classes...');
    
    const elementsWithResponsive = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"]');
    
    elementsWithResponsive.forEach((element, index) => {
      const classes = Array.from(element.classList);
      const responsiveClasses = classes.filter(cls => 
        cls.includes('sm:') || cls.includes('md:') || cls.includes('lg:')
      );
      
      if (responsiveClasses.length > 0) {
        results.responsiveClasses.push({
          element: element.tagName.toLowerCase(),
          classes: responsiveClasses,
          id: element.id || `element-${index}`
        });
        
        console.log(`✅ ${element.tagName}: ${responsiveClasses.join(', ')}`);
      }
    });
  };

  // Check input optimizations
  const checkInputOptimizations = () => {
    console.log('\n⌨️ Checking Input Optimizations...');
    
    const inputs = document.querySelectorAll('input[type="text"], textarea');
    
    inputs.forEach((input, index) => {
      const computedStyle = window.getComputedStyle(input);
      const fontSize = computedStyle.fontSize;
      const hasZoomPrevention = fontSize === '16px' || input.style.fontSize === '16px';
      
      const result = {
        element: input.placeholder || `Input ${index + 1}`,
        fontSize,
        hasZoomPrevention,
        type: input.tagName.toLowerCase()
      };
      
      results.inputOptimizations.push(result);
      
      if (!hasZoomPrevention) {
        results.issues.push(`⚠️ Input may cause zoom on iOS: ${result.element}`);
      } else {
        console.log(`✅ ${result.element}: fontSize ${fontSize}`);
      }
    });
  };

  // Check drag and drop elements
  const checkDragDropElements = () => {
    console.log('\n🖱️ Checking Drag & Drop Elements...');
    
    const draggableElements = document.querySelectorAll('[draggable="true"]');
    
    draggableElements.forEach((element, index) => {
      const hasTouchManipulation = element.classList.contains('touch-manipulation');
      const hasSelectNone = element.classList.contains('select-none');
      const hasMinHeight = window.getComputedStyle(element).minHeight !== 'auto';
      
      const result = {
        element: element.textContent?.trim().substring(0, 30) || `Draggable ${index + 1}`,
        hasTouchManipulation,
        hasSelectNone,
        hasMinHeight
      };
      
      results.dragDropElements.push(result);
      
      if (!hasTouchManipulation || !hasSelectNone) {
        results.issues.push(`⚠️ Drag element missing classes: ${result.element}`);
      } else {
        console.log(`✅ ${result.element}: Properly configured`);
      }
    });
  };

  // Check for mobile-specific CSS
  const checkMobileCSS = () => {
    console.log('\n🎨 Checking Mobile CSS...');
    
    const styleSheets = Array.from(document.styleSheets);
    let hasMobileStyles = false;
    
    try {
      styleSheets.forEach(sheet => {
        if (sheet.cssRules) {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.media && rule.media.mediaText.includes('max-width')) {
              hasMobileStyles = true;
            }
          });
        }
      });
    } catch (e) {
      console.log('⚠️ Could not access all stylesheets (CORS)');
    }
    
    if (hasMobileStyles) {
      console.log('✅ Mobile-specific CSS found');
    } else {
      console.log('⚠️ No mobile-specific CSS detected');
    }
  };

  // Run all checks
  checkTouchTargets();
  checkResponsiveClasses();
  checkInputOptimizations();
  checkDragDropElements();
  checkMobileCSS();

  // Summary
  console.log('\n📊 Summary:');
  console.log(`Touch Targets Checked: ${results.touchTargets.length}`);
  console.log(`Responsive Elements: ${results.responsiveClasses.length}`);
  console.log(`Input Elements: ${results.inputOptimizations.length}`);
  console.log(`Drag & Drop Elements: ${results.dragDropElements.length}`);
  console.log(`Issues Found: ${results.issues.length}`);

  if (results.issues.length > 0) {
    console.log('\n⚠️ Issues to Address:');
    results.issues.forEach(issue => console.log(issue));
  } else {
    console.log('\n🎉 All mobile optimizations look good!');
  }

  return results;
};

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  window.checkMobileOptimizations = checkMobileOptimizations;
  console.log('Mobile optimization checker loaded. Run checkMobileOptimizations() to test.');
}

// Viewport size checker
export const checkViewportSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  let breakpoint = 'xs';
  if (width >= 1280) breakpoint = 'xl';
  else if (width >= 1024) breakpoint = 'lg';
  else if (width >= 768) breakpoint = 'md';
  else if (width >= 640) breakpoint = 'sm';
  
  console.log(`📱 Viewport: ${width}x${height}px (${breakpoint})`);
  
  return { width, height, breakpoint };
};

// Touch capability checker
export const checkTouchCapability = () => {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasHover = window.matchMedia('(hover: hover)').matches;
  
  console.log(`👆 Touch Support: ${hasTouch ? 'Yes' : 'No'}`);
  console.log(`🖱️ Hover Support: ${hasHover ? 'Yes' : 'No'}`);
  
  return { hasTouch, hasHover };
};