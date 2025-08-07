# HackerDen MVP - Code Review Checklist

## Styling Preservation Code Review Checklist

### Pre-Review Setup
- [ ] Reviewer has access to original file backup
- [ ] Changes are clearly separated (logic vs styling)
- [ ] Visual diff tool is available for comparison

### 1. Structural Integrity Review

#### JSX Structure
- [ ] All wrapper divs with layout classes are preserved
- [ ] Component hierarchy remains unchanged
- [ ] No layout-critical elements have been removed
- [ ] Semantic HTML structure is maintained

#### Critical Wrapper Preservation
- [ ] Dashboard layout containers intact (`space-y-4 sm:space-y-6`)
- [ ] Grid containers preserved (`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`)
- [ ] Flex containers maintained (`flex flex-col h-full`)
- [ ] Card wrappers intact (`card-enhanced rounded-2xl`)

### 2. Responsive Design Review

#### Breakpoint Classes
- [ ] All `sm:` classes preserved (640px+)
- [ ] All `md:` classes preserved (768px+)
- [ ] All `lg:` classes preserved (1024px+)
- [ ] All `xl:` classes preserved (1280px+)

#### Mobile-First Patterns
- [ ] Base mobile styles maintained
- [ ] Progressive enhancement classes intact
- [ ] Touch target sizes preserved (`min-h-[44px]`)
- [ ] Mobile-specific layouts maintained (`lg:hidden`)

#### Desktop Layout Preservation
- [ ] Desktop grid layouts intact (`hidden lg:grid`)
- [ ] Two-panel dashboard layout preserved
- [ ] Column spans maintained (`lg:col-span-2`)

### 3. Dark Theme Integrity

#### Background Colors
- [ ] `bg-dark-primary` classes preserved
- [ ] `bg-dark-secondary` classes preserved
- [ ] `bg-dark-tertiary` classes preserved
- [ ] `bg-dark-elevated` classes preserved

#### Text Colors
- [ ] `text-dark-primary` classes preserved
- [ ] `text-dark-secondary` classes preserved
- [ ] `text-dark-tertiary` classes preserved
- [ ] `text-dark-muted` classes preserved

#### Border Colors
- [ ] `border-dark-primary` classes preserved
- [ ] `border-dark-secondary` classes preserved
- [ ] Theme-consistent border classes maintained

### 4. Component-Specific Reviews

#### Dashboard Component
- [ ] Team info header wrapper preserved
- [ ] Desktop layout grid intact (`lg:grid-cols-3`)
- [ ] Mobile tab switcher wrapper preserved
- [ ] Height calculations maintained (`h-[calc(100vh-280px)]`)

#### KanbanBoard Component
- [ ] Main section wrapper preserved (`rounded-2xl p-6 sm:p-8`)
- [ ] Header flex layout intact
- [ ] Columns grid wrapper preserved
- [ ] Animation classes maintained (`animate-fade-in`)

#### TaskColumn Component
- [ ] Column flex container preserved (`flex flex-col h-full`)
- [ ] Header styling intact (`rounded-t-2xl`)
- [ ] Content area preserved (`rounded-b-2xl`)
- [ ] Scrollable container maintained (`overflow-y-auto`)

#### TaskCard Component
- [ ] Article wrapper preserved with all classes
- [ ] Header flex layout intact
- [ ] Footer layout preserved
- [ ] Drag and drop classes maintained (`cursor-move select-none`)

#### Chat Component
- [ ] Section wrapper preserved (`rounded-2xl h-full flex flex-col`)
- [ ] Header styling intact (`border-b border-dark-primary`)
- [ ] Messages area flex layout preserved
- [ ] Footer input area maintained

### 5. Interactive Elements Review

#### Button System
- [ ] Primary button classes preserved (`btn-primary`)
- [ ] Secondary button classes preserved (`btn-secondary`)
- [ ] Danger button classes preserved (`btn-danger`)
- [ ] Touch manipulation classes intact (`touch-manipulation`)

#### Form Elements
- [ ] Input styling classes preserved (`input-enhanced`)
- [ ] Focus states maintained (`focus:ring-2`)
- [ ] Placeholder styling intact
- [ ] Validation styling preserved

#### Status Indicators
- [ ] Status color classes preserved (`status-todo`, `status-progress`, etc.)
- [ ] Progress indicators intact
- [ ] Loading states preserved
- [ ] Connection status styling maintained

### 6. Animation and Transitions

#### Animation Classes
- [ ] `animate-fade-in` classes preserved
- [ ] `animate-slide-up` classes preserved
- [ ] `animate-pulse-slow` classes preserved
- [ ] Custom animation classes intact

#### Transition Classes
- [ ] `transition-all` classes preserved
- [ ] Duration classes maintained (`duration-300`)
- [ ] Hover state transitions intact
- [ ] Transform classes preserved (`hover:scale-102`)

### 7. Accessibility Review

#### Focus Management
- [ ] Focus ring classes preserved (`focus:ring-2`)
- [ ] Focus offset classes maintained (`focus:ring-offset-2`)
- [ ] Keyboard navigation classes intact
- [ ] Skip link functionality preserved

#### Screen Reader Support
- [ ] `sr-only` classes preserved
- [ ] ARIA labels maintained
- [ ] Semantic HTML structure intact
- [ ] Role attributes preserved

#### Touch Accessibility
- [ ] Touch target sizes maintained (`min-h-[44px]`)
- [ ] Touch manipulation classes preserved
- [ ] Tap highlight removal intact (`-webkit-tap-highlight-color: transparent`)

### 8. Performance and UX

#### Loading States
- [ ] Skeleton loader classes preserved
- [ ] Loading spinner styling intact
- [ ] Progressive loading maintained
- [ ] Error state styling preserved

#### Micro-interactions
- [ ] Hover effects preserved
- [ ] Click feedback maintained
- [ ] Drag and drop styling intact
- [ ] Status change animations preserved

### 9. Cross-Browser Compatibility

#### Vendor Prefixes
- [ ] `-webkit-` prefixes preserved
- [ ] `-moz-` prefixes maintained
- [ ] Browser-specific classes intact
- [ ] Fallback styles preserved

#### CSS Custom Properties
- [ ] CSS variables usage maintained
- [ ] Theme variable references intact
- [ ] Fallback values preserved

### 10. Testing Requirements

#### Manual Testing Required
- [ ] Visual regression test at 375px (mobile)
- [ ] Layout test at 768px (tablet)
- [ ] Desktop test at 1024px+
- [ ] Dark theme verification
- [ ] Animation functionality test
- [ ] Touch interaction test

#### Automated Testing
- [ ] Component styling tests pass
- [ ] Responsive design tests pass
- [ ] Accessibility tests pass
- [ ] Visual regression tests pass

## Review Decision Matrix

### ✅ APPROVE if:
- All styling classes are preserved
- Responsive design is intact
- Dark theme colors are maintained
- Animations and transitions work
- Accessibility features are preserved
- Only logic improvements were made

### ⚠️ REQUEST CHANGES if:
- Some styling classes are missing
- Responsive breakpoints are affected
- Theme colors are inconsistent
- Animations are broken
- Accessibility is compromised
- Layout structure is modified

### ❌ REJECT if:
- Major styling classes are removed
- Responsive design is broken
- Component structure is changed
- Theme integrity is compromised
- Critical layout classes are missing
- User experience is degraded

## Common Issues and Solutions

### Issue: Missing Responsive Classes
**Problem**: `sm:`, `lg:` classes removed
**Solution**: Restore from backup file
**Prevention**: Use compare-and-merge workflow

### Issue: Broken Card Styling
**Problem**: `card-enhanced` class removed
**Solution**: Add back card styling classes
**Prevention**: Preserve wrapper div structure

### Issue: Dark Theme Colors Lost
**Problem**: `bg-dark-*`, `text-dark-*` classes removed
**Solution**: Restore theme color classes
**Prevention**: Never modify color-related classes

### Issue: Layout Collapse
**Problem**: `h-full`, `flex-1`, `min-h-0` classes removed
**Solution**: Restore layout container classes
**Prevention**: Understand flex/grid layout requirements

### Issue: Mobile Layout Broken
**Problem**: Mobile-specific classes removed
**Solution**: Restore mobile layout wrappers
**Prevention**: Test on mobile during development

## Reviewer Notes Template

```markdown
## Styling Preservation Review

### Changes Reviewed:
- [ ] Logic improvements only
- [ ] Styling changes included

### Styling Integrity:
- [ ] ✅ All critical classes preserved
- [ ] ⚠️ Some styling issues found
- [ ] ❌ Major styling problems

### Responsive Design:
- [ ] ✅ All breakpoints intact
- [ ] ⚠️ Minor responsive issues
- [ ] ❌ Responsive design broken

### Dark Theme:
- [ ] ✅ Theme colors preserved
- [ ] ⚠️ Some color inconsistencies
- [ ] ❌ Theme integrity compromised

### Recommendations:
- [ ] Approve as-is
- [ ] Request minor fixes
- [ ] Reject and request rework

### Additional Notes:
[Reviewer comments here]
```

## Conclusion

This checklist ensures that code reviews maintain the visual integrity and user experience of HackerDen MVP while allowing for necessary logic improvements. Use this systematically for every pull request that touches component files.

**Remember**: Better to be overly cautious with styling preservation than to break the user experience.